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
  const marker = document.querySelector("#emotionModel-marker");
  /*   let arousal =   audioFeatures.predictions["mood_aggressive"] - audioFeatures.predictions["mood_relaxed"];
  let valens = audioFeatures.predictions["mood_happy"] - audioFeatures.predictions["mood_sad"] * 500;
 */
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
  marker.style.transform = `translate( ${valens}%,  ${arousal}%)`;
}

export { fetchLabeledData, fetchBpmAndKey, emotionalModelUpdate };
