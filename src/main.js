import { preprocess, shortenAudio } from "./audioUtils.js";
import {
  fetchLabeledData,
  fetchBpmAndKey,
  emotionalModelUpdate,
  getColorsOld,
} from "./updateState.js";
import { addSmallCube } from "../geometry.js";
import { getColors } from "./getColors.js";
import {
  createColorSpectrumMaterials,
  firework,
  setRenderColor,
  updateColor,
} from "./scene.js";
import {
  calculateAverageOfArray,
  debounce,
  throttle,
} from "./utilityFunctions.js";
const loudnessHTML = document.querySelector("#loudnessTag");
const chromaHTML = document.querySelector("#chromaTag");
const rmsHTML = document.querySelector("#rmsTag");
const spectralCentroidHTML = document.querySelector("#spectralCentroidTag");
const energyHTML = document.querySelector("#energyTag");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const dropArea = document.querySelector("#file-drop-area");
const audioTag = document.querySelector("#audioTag");

const sad = document.querySelector("#sadTag");
const happy = document.querySelector("#happyTag");
const relaxe = document.querySelector("#relaxTag");
const aggressive = document.querySelector("#aggressiveTag");
const dance = document.querySelector("#danceTag");

const beatContainer = document.querySelector("#beatContainer");  

const throttleFirework = throttle(() => {
  firework();
});
const keys = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
var lowPassEnergy = [];
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
    let beatUsed = false;
    const lowPassAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: meydaContext,
      source: filter,
      bufferSize: 512,
      featureExtractors: ["energy", "rms"],
      callback: (features) => {
        if (features.energy > 0.001) {
          lowPassEnergy.push(features.rms);
          var lowPassEnergyMean = calculateAverageOfArray(lowPassEnergy);
    /*       console.dir("Peak Energy: " + lowPassEnergyMean);
          console.dir("Energy: " + features.rms); */

          if (features.rms > energyPeak) {
            energyPeak = features.rms;
            throttleFirework();
            
          }
          if (features.rms > (energyPeak*0.90 +lowPassEnergyMean)/2) {
            throttleFirework();
          }
        }
      },
    });
    lowPassAnalyzer.start();

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
      ],
      callback: (features) => {
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
     /*    var chromaPrio = []; */
        var activeIndexes = [];
        for (let index = 0; index < audioFeatures.chroma.length; index++) {
          const element = audioFeatures.chroma[index];
          if(element > 0.95){
            /* const obj = { chromaIndex: index, value: element, tone: keys[index] }; */
            /* chromaPrio.push(obj) */
          /*   console.dir(keys[index]) */
            audioFeatures.keysOrdered.forEach((key, index2)=>{
              if(key==keys[index]){
                activeIndexes.push(index2)
              }
            })

          }
         

          
        }
        audioFeatures["activeColorIndexes"] = activeIndexes;
    /*     console.dir(activeIndexes)
        console.dir(" ") */
       
       /*  audioFeatures["activeHarmony"] = chromaPrio; */
        
        
      /*   console.dir(chromaPrio)
 */

        
        chromaHTML.innerHTML =
          "Chroma: " + keys[audioFeatures.activeChromaIndex];
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
  console.dir(audioFeatures); */

  // UPLOAD MODE
     processFileUpload(files);
});
dropArea.addEventListener("click", () => {
  dropInput.click();
});

// Debug Init
function initThree() {
  fetchLabeledData();

  emotionalModelUpdate();
  getColors();
  setRenderColor();
  console.dir(audioFeatures);

  createColorSpectrumMaterials();
  updateColor();
  audioFeatures["ready"] = true;
}
/* initThree();
 */
// Init
function initThreeWithAffect() {
  fetchLabeledData();
  initMeyda(uploadedFile);
  emotionalModelUpdate();
  getColors();
  setRenderColor();
  console.dir(audioFeatures);
  updateColor();
  createColorSpectrumMaterials();
  audioFeatures["ready"] = true;
}

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
          /*           console.dir(essentiaAnalysis);
           */ audioFeatures["bpm"] = essentiaAnalysis.bpm;
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

  return {
    keyData: keyData,
    bpm: bpm,
  };
}

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
      });
      msg.data.features = null;
    }
    // free worker resource until next audio is uploaded
    featureExtractionWorker.terminate();
  };
}

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
          })
        );
        collectPredictions();
        console.log(`${n} predictions: `, preds);
      }
    };
  });
}

function collectPredictions() {
  if (inferenceResultPromises.length == modelNames.length) {
    Promise.all(inferenceResultPromises).then((predictions) => {
      const allPredictions = {};
      Object.assign(allPredictions, ...predictions);
      audioFeatures["predictions"] = allPredictions;
      inferenceResultPromises = []; // clear array
      audioFeatures["ready"] = true;
      initThreeWithAffect();
    });
  }
}

window.onload = () => {
  createInferenceWorkers();

  EssentiaWASM().then((wasmModule) => {
    essentia = new wasmModule.EssentiaJS(false);
    essentia.arrayToVector = wasmModule.arrayToVector;
  });
};
