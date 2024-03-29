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

  var spin = 40;
  // gift 40
  if (
    audioFeatures.predictions.mood_happy > audioFeatures.predictions.mood_sad
  ) {
    if (
      audioFeatures.predictions.mood_relaxed >
        audioFeatures.predictions.mood_aggressive 
    ) {
      spin = -100;
    }
  }
  let mainAngle = (Math.atan2(mainValens, mainArousal) * 180 + spin) / Math.PI;
  if (mainAngle < 0) {
    mainAngle += 360;
  }
  let secondaryAngle =
    (Math.atan2(secondaryValens, secondaryArousal) * 180 + spin) / Math.PI;
  if (secondaryAngle < 0) {
    secondaryAngle += 360;
  }

  const keys = [
    "C",
    "C♯",
    "D",
    "D♯",
    "E",
    "F",
    "F♯",
    "G",
    "G♯",
    "A",
    "A♯",
    "B",
  ];
  const major = [
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
  ];
  // A Minor
  const minor = [
    true, //A
    false, //Bb
    true, //B
    true, //C
    false, //C#
    true, //D
    false, //D#
    true, //E
    true, //F
    false, //F#
    true, //G
    false, //G#
  ];
  let newKeysOrder = [];
  let lastKeys = [];
  let foundKeys = false;


  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    if (element == audioFeatures.scale) {
      console.dir("found at: " + index);
      foundKeys = true;
    }
    if (foundKeys) {
      newKeysOrder.push(element);
    } else {
      lastKeys.push(element);
    }
  }

  newKeysOrder = newKeysOrder.concat(lastKeys);
  audioFeatures["keysOrdered"] = newKeysOrder;

  /* 
  const color1 = hslToHex(mainAngle, 75 + saturation, 25 + brightness);
  const color2 = hslToHex(mainAngle - 45, 75 + saturation, 25 + brightness);
  const color3 = hslToHex(mainAngle - 30, 75 + saturation, 25 + brightness);
  const color4 = hslToHex(mainAngle - 15, 75 + saturation, 25 + brightness);
  const color5 = hslToHex(mainAngle + 15, 75 + saturation, 25 + brightness);
  const color6 = hslToHex(mainAngle + 30, 75 + saturation, 25 + brightness);
  const color7 = hslToHex(mainAngle + 45, 75 + saturation, 25 + brightness);
  const color8 = hslToHex(mainAngle, 75 + saturation, 25 + brightness);
  const color9 = hslToHex(mainAngle, 75 + saturation, 25 + brightness);
  const color10 = hslToHex(secondaryAngle, 75 + saturation, 25 + brightness);
  const color11 = hslToHex(
    secondaryAngle - 30,
    75 + saturation,
    25 + brightness
  );
  const color12 = hslToHex(
    secondaryAngle + 30,
    75 + saturation,
    25 + brightness
  );

  const background = hslToHex(mainAngle, 75 + saturation, 50 + brightness);
  const essenceShapeColor = hslToHex(
    mainAngle,
    75 + saturation,
    25 + brightness
  );
 */
  var colorRange =
    110 +
    (audioFeatures.predictions.danceability * 100) / 6 -
    (audioFeatures.predictions.mood_sad * 100) / 4; // Dancebility adds range
  var colorRangeHalf = colorRange / 2;
  var colorStepMain = colorRange / 7;
  var colorStepSecond = colorRange / 5;
  // 7 true

  const saturationBias = 25;
  const brightnessBias = 20;

  let saturation = 50 * audioFeatures.predictions.mood_happy;
  let brightness = 5 * audioFeatures.predictions.mood_aggressive;

  const c1 = hslToHex(
    mainAngle,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  
  const c2 = hslToHex(
    mainAngle + colorStepMain * 1 - colorRangeHalf,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c3 = hslToHex(
    mainAngle + colorStepMain * 2 - colorRangeHalf,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c4 = hslToHex(
    mainAngle + colorStepMain * 3 - colorRangeHalf,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c5 = hslToHex(
    mainAngle + colorStepMain * 4 - colorRangeHalf,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c6 = hslToHex(
    mainAngle + colorStepMain * 1,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c7 = hslToHex(
    mainAngle + colorStepMain * 2,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c8 = hslToHex(
    mainAngle + colorStepMain * 3,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c9 = hslToHex(
    mainAngle + colorStepMain * 4,
    saturationBias + saturation,
    brightnessBias + brightness
  );

  const c10 = hslToHex(
    secondaryAngle - colorStepMain,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c11 = hslToHex(
    secondaryAngle,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const c12 = hslToHex(
    secondaryAngle + colorStepMain,
    saturationBias + saturation,
    brightnessBias + brightness
  );

  const background = hslToHex(
    mainAngle,
    saturationBias + saturation,
    brightnessBias + brightness
  );
  const essenceShapeColor = hslToHex(
    mainAngle,
    60 + 40*audioFeatures.predictions.mood_happy,
    brightnessBias + brightness
  );
  audioFeatures.color = [
    c1,
    c2,
    c3,
    c4,
    c5,
    c6,
    c7,
    c8,
    c9,
    c10,
    c11,
    c12,

    background,
    essenceShapeColor,
  ];
  /* 
  if (audioFeatures.key == "major") {
    audioFeatures.color = [
      inScaleColor1,
      outOfScaleColor1,
      inScaleColor2,
      outOfScaleColor2,
      inScaleColor3,
      inScaleColor4,
      outOfScaleColor3,
      inScaleColor5,
      outOfScaleColor4,
      inScaleColor6,

      outOfScaleColor5,
      inScaleColor7,
      background,
      essenceShapeColor,
    ];
  } else {
    audioFeatures.color = [
      inScaleColor1,
      outOfScaleColor1,
      inScaleColor2,
      inScaleColor3,
      outOfScaleColor2,
      inScaleColor4,
      outOfScaleColor3,
      inScaleColor5,
      inScaleColor6,
      outOfScaleColor4,
      inScaleColor7,
      outOfScaleColor5,
      background,
      essenceShapeColor,
    ];
  } */
  /* const inScaleColor1 = hslToHex(mainAngle, 75 + saturation, brightnessBias + brightness);
  const inScaleColor2 = hslToHex(
    mainAngle + colorStepMain * 1,
    75 + saturation,
    brightnessBias + brightness
  );
  const inScaleColor3 = hslToHex(
    mainAngle + colorStepMain * 2,
    75 + saturation,
    brightnessBias + brightness
  );
  const inScaleColor4 = hslToHex(
    mainAngle + colorStepMain * 3,
    75 + saturation,
    brightnessBias + brightness
  );
  const inScaleColor5 = hslToHex(
    mainAngle + colorStepMain * 1 - colorRangeHalf,
    75 + saturation,
    brightnessBias + brightness
  );
  const inScaleColor6 = hslToHex(
    mainAngle + colorStepMain * 2 - colorRangeHalf,
    75 + saturation,
    brightnessBias + brightness
  );
  const inScaleColor7 = hslToHex(
    mainAngle + colorStepMain * 3 - colorRangeHalf,
    75 + saturation,
    brightnessBias + brightness
  );


  const outOfScaleColor1 = hslToHex(
    secondaryAngle + colorStepMain * 2 - colorRangeHalf,
    75 + saturation,
    brightnessBias + brightness
  );
  const outOfScaleColor2 = hslToHex(
    secondaryAngle + colorStepMain * 1 - colorRangeHalf,
    75 + saturation,
    brightnessBias + brightness
  );
  const outOfScaleColor3 = hslToHex(
    secondaryAngle,
    75 + saturation,
    brightnessBias + brightness
  );
  const outOfScaleColor4 = hslToHex(
    secondaryAngle + colorStepMain * 1,
    75 + saturation,
    brightnessBias + brightness
  );
  const outOfScaleColor5 = hslToHex(
    secondaryAngle + colorStepMain * 2,
    75 + saturation,
    brightnessBias + brightness
  ); */
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
    const angle = 90;
    const steps = 90 / length;
    let generatedColor = hslToHex(
      mainAngle - angle / 2 + steps * index,
      75 + saturation,
      75 + brightness
    );

    audioFeatures.colorSpectrum.push(generatedColor);
  }
}

export { getColors };
