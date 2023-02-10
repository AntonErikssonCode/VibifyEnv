import { hslToHex} from "./utilityFunctions.js"

function fetchLabeledData() {
  const sad = document.querySelector("#sadTag");
  const happy = document.querySelector("#happyTag");
  const relaxe = document.querySelector("#relaxTag");
  const aggressive = document.querySelector("#aggressiveTag");
  const dance = document.querySelector("#danceTag");

  sad.innerHTML += " " + audioFeatures.predictions["mood_sad"].toFixed(2);
  happy.innerHTML += " " + audioFeatures.predictions["mood_happy"].toFixed(2);
  relaxe.innerHTML +=
    " " + audioFeatures.predictions["mood_relaxed"].toFixed(2);
  aggressive.innerHTML +=
    " " + audioFeatures.predictions["mood_aggressive"].toFixed(2);
  dance.innerHTML += " " + audioFeatures.predictions["danceability"].toFixed(2);
}

function fetchBpmAndKey() {
  const key = document.querySelector("#keyTag");
  const scale = document.querySelector("#scaleTag");
  const bpm = document.querySelector("#bpmTag");

  key.innerHTML += " " + audioFeatures["key"];
  scale.innerHTML += " " + audioFeatures["scale"];
  bpm.innerHTML += " " + audioFeatures["bpm"].toFixed(2);
}

function emotionalModelUpdate() {
  const valensTag = document.querySelector("#valensTag");
  const arousalTag = document.querySelector("#arousalTag");

  audioFeatures["arousal"] =
    audioFeatures.predictions["mood_aggressive"] -
    audioFeatures.predictions["mood_relaxed"];

  audioFeatures["valens"] =
    audioFeatures.predictions["mood_happy"] -
    audioFeatures.predictions["mood_sad"];

  valensTag.innerHTML += " " + audioFeatures["valens"];
  arousalTag.innerHTML += " " + audioFeatures["arousal"];

}

function getColors() {
  const testColorDiv1 = document.querySelector("#testColor1");
  const testColorDiv2 = document.querySelector("#testColor2");
  const mainArousal =
    audioFeatures.predictions.mood_aggressive >
    audioFeatures.predictions.mood_relaxed
      ? audioFeatures.predictions.mood_aggressive
      : audioFeatures.predictions.mood_relaxed -
        audioFeatures.predictions.mood_relaxed * 2;

  const secondaryArousal =
    audioFeatures.predictions.mood_aggressive <
    audioFeatures.predictions.mood_relaxed
      ? audioFeatures.predictions.mood_aggressive
      : audioFeatures.predictions.mood_relaxed -
        audioFeatures.predictions.mood_relaxed * 2;

  const mainValens =
    audioFeatures.predictions.mood_happy > audioFeatures.predictions.mood_sad
      ? audioFeatures.predictions.mood_happy
      : audioFeatures.predictions.mood_sad -
        audioFeatures.predictions.mood_sad * 2;

  const secondaryValens =
    audioFeatures.predictions.mood_happy < audioFeatures.predictions.mood_sad
      ? audioFeatures.predictions.mood_happy
      : audioFeatures.predictions.mood_sad -
        audioFeatures.predictions.mood_sad * 2;

  console.dir(audioFeatures);
  console.dir(" ");
  console.dir("mainArousal: " + mainArousal);
  console.dir("secondaryArousal: " + secondaryArousal);
  console.dir("mainValens: " + mainValens);
  console.dir("secondaryValens: " + secondaryValens);
  console.dir(" ");

  /*     const x = -0.98;
      const y = -0.74; */
  let mainAngle = (Math.atan2(mainValens, mainArousal) * 180) / Math.PI;
  if (mainAngle < 0) {
    mainAngle += 360;
  }
  let secondaryAngle =
    (Math.atan2(secondaryValens, secondaryArousal) * 180) / Math.PI;
  if (secondaryAngle < 0) {
    secondaryAngle += 360;
  }
  const mainColor = hslToHex(mainAngle, 100, 50);
  testColorDiv1.style.background = mainColor;

  const secondaryColor = hslToHex(secondaryAngle, 100, 50);
  testColorDiv2.style.background = secondaryColor;
  audioFeatures["mainColor"] = hslToHex(mainAngle, 100, 50, false);
  audioFeatures["secondaryColor"] = hslToHex(secondaryAngle, 100, 50, false);
  console.dir(audioFeatures.mainColor)
  

}

export { fetchLabeledData, fetchBpmAndKey, emotionalModelUpdate, getColors };
