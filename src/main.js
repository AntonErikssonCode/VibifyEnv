import { preprocess, shortenAudio } from "./audioUtils.js";
import { fetchLabeledData, fetchBpmAndKey } from "./updateState.js";
import { getColors } from "./getColors.js";
import { firework, setRenderColor, updateMaterial } from "./scene.js";
import { calculateAverageOfArray, throttle } from "./utilityFunctions.js";

const loudnessHTML = document.querySelector("#loudnessTag");
const chromaHTML = document.querySelector("#chromaTag");
const rmsHTML = document.querySelector("#rmsTag");
const spectralCentroidHTML = document.querySelector("#spectralCentroidTag");
const energyHTML = document.querySelector("#energyTag");
const dropArea = document.querySelector("#file-drop-area");
const audioTag = document.querySelector("#audioTag");
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const throttleFirework = throttle(() => {
  firework();
});
const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
var rmsList = [];
var lowPassEnergy = [];

// Loading bar
let loadingbarUpdates = 1;
const loadingBar = document.querySelector(".loading-bar-inside");
const loadingContainer = document.querySelector(".loading-container");
function increaseLoadingBar(){
  loadingContainer.style.display= "block";
  var width = 7.692 * loadingbarUpdates + "%";
    loadingBar.style.width = width;
    loadingbarUpdates++;
    if (7.692* loadingbarUpdates > 99 ) {
      loadingContainer.style.display= "none"
      
    }
}

function initMeyda(file) {
  const meydaContext = new AudioContext();
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      // convert image file to base64 string
      audioTag.src = reader.result;
    },
    false
  );

  if (file) {
    reader.readAsDataURL(file);
  }

  const source = meydaContext.createMediaElementSource(audioTag);
  let filter = meydaContext.createBiquadFilter();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(50, meydaContext.currentTime, 0);

  source.connect(filter);
  source.connect(meydaContext.destination);

  var energyPeak = 0;
  if (typeof Meyda === "undefined") {
    console.log("Meyda could not be found! Have you included it?");
  } else {
    console.log("Meyda exist!");
    
    // Beat tracker, uses audio signal with lowpass filter
    const lowPassAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: meydaContext,
      source: filter,
      bufferSize: 512,
      featureExtractors: ["energy", "rms"],
      callback: (features) => {

        if (features.energy > 0.001) {
          // Uses the mean of the 1000 lates rms values
          if (lowPassEnergy.length < 50000) {
            lowPassEnergy.push(features.rms);
          }
          if (lowPassEnergy.length >= 50000) {
            var theRemovedElement = lowPassEnergy.shift();
            lowPassEnergy.push(features.rms);
          }
        
          var lowPassEnergyMean = calculateAverageOfArray(lowPassEnergy);

          if (features.rms > energyPeak) {
            energyPeak = features.rms;
            throttleFirework();
          }
          if (features.rms > (energyPeak * 0.9 + lowPassEnergyMean) / 2) {
            throttleFirework();
          }
        }
      },
    });
    lowPassAnalyzer.start();

    // General audio processor, uses unaltered audio signal 
    const analyzer = Meyda.createMeydaAnalyzer({
      audioContext: meydaContext,
      source: source,
      bufferSize: 512,
      featureExtractors: [
        "rms",
        "zcr",
        "energy",
        "amplitudeSpectrum",
        "powerSpectrum",
        "spectralCentroid",
        "spectralFlatness",
        "spectralSlope",
        "spectralRolloff",
        "spectralSpread",
        "spectralSkewness",
        "spectralKurtosis",
        "spectralCrest",
        "chroma",
        "loudness",
        "perceptualSpread",
        "perceptualSharpness",
        "mfcc",
        "complexSpectrum",
        "buffer",
      ],
      callback: (features) => {
        // Update audioFeatures object
        audioFeatures["loudness"] = features.loudness.total;
        audioFeatures["energy"] = features.energy;
        audioFeatures["chroma"] = features.chroma;
        audioFeatures["rms"] = features.rms;
        audioFeatures["spectralCentroid"] = features.spectralCentroid;
        audioFeatures["complexSpectrum"] = features.complexSpectrum;
        audioFeatures["amplitudeSpectrum"] = features.amplitudeSpectrum;
        audioFeatures["mfcc"] = features.mfcc;
        audioFeatures["perceptualSpread"] = features.perceptualSpread;
        audioFeatures["perceptualSharpness"] = features.perceptualSharpness;
        audioFeatures["powerSpectrum"] = features.powerSpectrum;
        audioFeatures["buffer"] = features.buffer;

        // Display values on hud
        loudnessHTML.innerHTML =
          "Loudness: " + audioFeatures["loudness"].toFixed(2);
        spectralCentroidHTML.innerHTML =
          "Spectral Centroid: " + audioFeatures["spectralCentroid"].toFixed(2);
        energyHTML.innerHTML = "Energy: " + audioFeatures["energy"].toFixed(2);
        rmsHTML.innerHTML = "RMS: " + audioFeatures["rms"].toFixed(2);
        audioFeatures["activeChromaIndex"] = audioFeatures["chroma"].indexOf(
          Math.max(...audioFeatures["chroma"])
        );

        // Selects indexes based on chroma, relative to our active scale.
        var activeIndexes = [];
        for (let index = 0; index < audioFeatures.chroma.length; index++) {
          const element = audioFeatures.chroma[index];
          if (element > 0.95) {
            audioFeatures.keysOrdered.forEach((key, keyIndex) => {
              if (key == keys[index]) {
                activeIndexes.push(keyIndex);
              }
            });
          }
        }
        audioFeatures["activeColorIndexes"] = activeIndexes;
        chromaHTML.innerHTML =
          "Chroma: " + keys[audioFeatures.activeChromaIndex];
        
        // Uses the mean of the x lates rms values
        const rmsListLength = 20 * audioFeatures.predictions.mood_relaxed;
        if (rmsList.length < rmsListLength) {
          rmsList.push(audioFeatures.rms);
        }
        if (rmsList.length >= rmsListLength) {
          var theRemovedElement = rmsList.shift();
          rmsList.push(audioFeatures.rms);
        }
        audioFeatures["rmsMean"] = calculateAverageOfArray(rmsList);

      },
    });
    analyzer.start();
  }
}

const KEEP_PERCENTAGE = 0.15; // keep only 15% of audio file
let essentia = null;
let essentiaAnalysis;
let featureExtractionWorker = null;
let inferenceWorkers = {};
const modelNames = [
  "mood_happy",
  "mood_sad",
  "mood_relaxed",
  "mood_aggressive",
  "danceability",
];
let inferenceResultPromises = [];
let uploadedFile;

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  uploadedFile = e.dataTransfer.files[0];

  // DEBUG MODE
  /* initMeyda(uploadedFile);
  initThree(); */

  // UPLOAD MODE
  increaseLoadingBar();
  processFileUpload(files);
});

dropArea.addEventListener("click", () => {
  dropInput.click();
});

// Debug init, only works if audiofeatures are preloaded in the audiofeatures file. 
function initThree() {
  fetchLabeledData();
  fetchBpmAndKey();
  getColors();
  setRenderColor();
  updateMaterial();
  audioFeatures["ready"] = true;
}


// Init the three.js visualization
function initThreeWithAffect() {
  fetchLabeledData();
  getColors();
  setRenderColor();
  updateMaterial();
  initMeyda(uploadedFile);
  audioFeatures["ready"] = true;
}

// Essentia.js code
function processFileUpload(files) {
  if (files.length > 1) {
    alert("Only single-file uploads are supported currently");
    throw Error("Multiple file upload attempted, cannot process.");
  } else if (files.length) {
    files[0].arrayBuffer().then((ab) => {
      decodeFile(ab);
    });
  }
}

// Essentia.js code
function decodeFile(arrayBuffer) {
  audioCtx.resume().then(() => {
    audioCtx
      .decodeAudioData(arrayBuffer)
      .then(async function handleDecodedAudio(audioBuffer) {
        console.info("Done decoding audio!");
        const prepocessedAudio = preprocess(audioBuffer);
        await audioCtx.suspend();
        if (essentia) {
          essentiaAnalysis = computeKeyBPM(prepocessedAudio);
          audioFeatures["bpm"] = essentiaAnalysis.bpm;
          audioFeatures["key"] = essentiaAnalysis.keyData.key;
          audioFeatures["scale"] = essentiaAnalysis.keyData.scale;
          fetchBpmAndKey();
        }

        let audioData = shortenAudio(prepocessedAudio, KEEP_PERCENTAGE, true);
        createFeatureExtractionWorker();
        featureExtractionWorker.postMessage(
          {
            audio: audioData.buffer,
          },
          [audioData.buffer]
        );
        audioData = null;
      });
  });
}

// Essentia.js code
function computeKeyBPM(audioSignal) {
  let vectorSignal = essentia.arrayToVector(audioSignal);
  const keyData = essentia.KeyExtractor(
    vectorSignal,
    true,
    4096,
    4096,
    12,
    3500,
    60,
    25,
    0.2,
    "bgate",
    16000,
    0.0001,
    440,
    "cosine",
    "hann"
  );
  increaseLoadingBar();
  const bpm = essentia.PercivalBpmEstimator(
    vectorSignal,
    1024,
    2048,
    128,
    128,
    210,
    50,
    16000
  ).bpm;
  increaseLoadingBar();
  return {
    keyData: keyData,
    bpm: bpm,
  };
}

// Essentia.js code
function createFeatureExtractionWorker() {
  featureExtractionWorker = new Worker("./src/featureExtraction.js");
  featureExtractionWorker.onmessage = function listenToFeatureExtractionWorker(
    msg
  ) {
    // feed to models
    if (msg.data.features) {
      modelNames.forEach((n) => {
        // send features off to each of the models
        inferenceWorkers[n].postMessage({
          features: msg.data.features,
        });
        increaseLoadingBar();
      });
      msg.data.features = null;
    }
    // free worker resource until next audio is uploaded
    featureExtractionWorker.terminate();
  };
}

// Essentia.js code
function createInferenceWorkers() {
  modelNames.forEach((n) => {
    inferenceWorkers[n] = new Worker("./src/inference.js");
    inferenceWorkers[n].postMessage({
      name: n,
    });
    inferenceWorkers[n].onmessage = function listenToWorker(msg) {
      // listen out for model output
      if (msg.data.predictions) {
        const preds = msg.data.predictions;
        // emmit event to PredictionCollector object
        inferenceResultPromises.push(
          new Promise((res) => {
            res({ [n]: preds });
            increaseLoadingBar()
          })
        );
        collectPredictions();
        console.log(`${n} predictions: `, preds);
      }
    };
  });
}

// Essentia.js code
function collectPredictions() {
  if (inferenceResultPromises.length == modelNames.length) {
    Promise.all(inferenceResultPromises).then((predictions) => {
      const allPredictions = {};
      Object.assign(allPredictions, ...predictions);
      audioFeatures["predictions"] = allPredictions;
      inferenceResultPromises = []; // clear array
      audioFeatures["ready"] = true;

      // Init three.js vizualisation
      initThreeWithAffect();
    });
  }
}

// Essentia.js code
window.onload = () => {
  createInferenceWorkers();
  EssentiaWASM().then((wasmModule) => {
    essentia = new wasmModule.EssentiaJS(false);
    essentia.arrayToVector = wasmModule.arrayToVector;
  });
};
