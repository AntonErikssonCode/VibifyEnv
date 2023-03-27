import { hslToHex } from "./utilityFunctions.js";
function getColors() {
  audioFeatures["colorSpectrum"] = [];
  const color1Div = document.querySelector("#testColor1");
  const color2Div = document.querySelector("#testColor2");
  const color3Div = document.querySelector("#testColor3");
  const color4Div = document.querySelector("#testColor4");
  const color5Div = document.querySelector("#testColor5");
  const color6Div = document.querySelector("#testColor6");
  const color7Div = document.querySelector("#testColor7");
  const color8Div = document.querySelector("#testColor8");
  const color9Div = document.querySelector("#testColor9");
  const color10Div = document.querySelector("#testColor10");
  const color11Div = document.querySelector("#testColor11");
  const color12Div = document.querySelector("#testColor12");

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
  let mainValues = mainValens + mainArousal;
  let secondaryValues = secondaryValens + secondaryArousal;
  audioFeatures["colorDifference"] = Math.abs(mainValues / secondaryValues);

  console.dir(mainArousal);
  console.dir(secondaryArousal);
  console.dir(mainValens);
  console.dir(secondaryValens);

  let mainAngle = (Math.atan2(mainValens, mainArousal) * 180) / Math.PI;
  if (mainAngle < 0) {
    mainAngle += 360;
  }
  let secondaryAngle =
    (Math.atan2(secondaryValens, secondaryArousal) * 180) / Math.PI;
  if (secondaryAngle < 0) {
    secondaryAngle += 360;
  }

  let saturation = (mainValens / 4) * 100;
  console.dir("saturation: " + saturation);

  let brightness = (mainArousal / 100) * 100 ;
  console.dir("brightness: " + brightness);


  const color1 = hslToHex(mainAngle, 75 + saturation, 25 + brightness);
  const color2 = hslToHex(mainAngle - 45, 75 + saturation, 25+ brightness);
  const color3 = hslToHex(mainAngle - 30, 75 + saturation, 25+ brightness);
  const color4 = hslToHex(mainAngle - 15, 75 + saturation, 25+ brightness);
  const color5 = hslToHex(mainAngle + 15, 75 + saturation, 25+ brightness);
  const color6 = hslToHex(mainAngle + 30, 75 + saturation, 25+ brightness);
  const color7 = hslToHex(mainAngle + 45, 75 + saturation, 25+ brightness);
  const color8 = hslToHex(mainAngle, 75 + saturation, 25+ brightness);
  const color9 = hslToHex(mainAngle, 75 + saturation, 25+ brightness);
  const color10 = hslToHex(secondaryAngle, 75 + saturation, 25+ brightness);
  const color11 = hslToHex(secondaryAngle-30, 75 + saturation, 25+ brightness);
  const color12 = hslToHex(secondaryAngle + 30, 75 + saturation, 25+ brightness);
  const background = hslToHex(mainAngle, 75 + saturation, 50 + brightness);


  
  audioFeatures.color = [
    color1,
    color2,
    color3,
    color4,
    color5,
    color6,
    color7,
    color8,
    color9,
    color10,
    color11,
    color12,
    background
  ];

  color1Div.style.background = audioFeatures.color[0];
  color2Div.style.background = audioFeatures.color[1];
  color3Div.style.background = audioFeatures.color[2];
  color4Div.style.background = audioFeatures.color[3];
  color5Div.style.background = audioFeatures.color[4];
  color6Div.style.background = audioFeatures.color[5];
  color7Div.style.background = audioFeatures.color[6];
  color8Div.style.background = audioFeatures.color[7];
  color9Div.style.background = audioFeatures.color[8];
  color10Div.style.background = audioFeatures.color[9];
  color11Div.style.background = audioFeatures.color[10];
  color12Div.style.background = audioFeatures.color[11];

  const length = 128;
  for (let index = 0; index < length; index++) {
    const angle = 180;
    const steps = 180 / length;
    let generatedColor  = hslToHex(mainAngle - angle/2 + steps * index , 75 + saturation, 75+ brightness);
    console.dir(generatedColor);
    audioFeatures.colorSpectrum.push(generatedColor)
    
  }
 /*  console.dir(audioFeatures.colorSpectrum) */
}

export { getColors };
