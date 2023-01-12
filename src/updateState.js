function fetchLabeledData() {
  const sad = document.querySelector("#sadTag");
  const happy = document.querySelector("#happyTag");
  const relaxe = document.querySelector("#relaxTag");
  const aggressive = document.querySelector("#aggressiveTag");
  const dance = document.querySelector("#danceTag");

  sad.innerHTML += " " + audioFeatures.predictions["mood_sad"];
  happy.innerHTML +=  " " + audioFeatures.predictions["mood_happy"];
  relaxe.innerHTML +=  " " + audioFeatures.predictions["mood_relaxed"];
  aggressive.innerHTML +=  " " + audioFeatures.predictions["mood_aggressive"];
  dance.innerHTML +=  " " + audioFeatures.predictions["danceability"];
}

function fetchBpmAndKey() {
  const key = document.querySelector("#keyTag");
  const scale = document.querySelector("#scaleTag");
  const bpm = document.querySelector("#bpmTag");
 
  key.innerHTML +=  " " + audioFeatures["key"];
  scale.innerHTML +=  " " + audioFeatures["scale"];
  bpm.innerHTML += " " + audioFeatures["bpm"];


}



export { fetchLabeledData, fetchBpmAndKey};
