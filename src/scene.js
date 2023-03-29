/* import * as THREE from "../modules/three.module.js";
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.125/build/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { addSmallCube } from "../geometry.js";
import { normalize, hslToHex, shade } from "./utilityFunctions.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/AfterimagePass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/shaders/VignetteShader.js";
import openSimplexNoise from "https://cdn.skypack.dev/open-simplex-noise";

function removeEntity(object) {
  var selectedObject = scene.getObjectByName(object.name);
  scene.remove(selectedObject);
}

let w = window.innerWidth;
let h = window.innerHeight;
// Camera
let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050505, 1, 45);

const camera = new THREE.PerspectiveCamera(90, w /* *0.7 */ / h, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvasId,
});
renderer.setSize(w, h);
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.1, 0.6);

const afterImagePass = new AfterimagePass();
afterImagePass.uniforms["damp"].value = 0.75;

const effectVignette = new ShaderPass(VignetteShader);
effectVignette.uniforms["offset"].value =
  audioFeatures.predictions.mood_sad / 3 + 0.2;
effectVignette.uniforms["darkness"].value = 5;

composer.addPass(renderScene);
composer.addPass(effectVignette);
composer.addPass(bloomPass);
composer.addPass(afterImagePass);

/* renderer.setClearColor(0x030303); */

/* renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; */
const control = new OrbitControls(camera, renderer.domElement);
function colorToHexColor(color) {
  if (arguments.length == 1) {
    let withoutHash = color.substring(1);
    return "0x" + withoutHash;
  }
}
// LIGHT
const light = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 5, 17);
pointLight.position.set(-5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1, 17);
pointLight2.position.set(5, 5, 5);
pointLight2.castShadow = true;
scene.add(pointLight2);

/* const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);

scene.add(pointLightHelper); */
const particleMaterialOpacity = 1;
const material1 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[0],
  emissive: audioFeatures.color[0],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material2 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[1],
  emissive: audioFeatures.color[1],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material3 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[2],
  emissive: audioFeatures.color[2],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material4 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[3],
  emissive: audioFeatures.color[3],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material5 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[5],
  emissive: audioFeatures.color[5],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material6 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[6],
  emissive: audioFeatures.color[6],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material7 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[7],
  emissive: audioFeatures.color[7],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material8 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[8],
  emissive: audioFeatures.color[8],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material9 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[9],
  emissive: audioFeatures.color[9],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material10 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[10],
  emissive: audioFeatures.color[10],
  opacity: particleMaterialOpacity,
  transparent: true,
});
const material11 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[11],
  emissive: audioFeatures.color[11],
  opacity: 0.6,
  transparent: true,
});
const material12 = new THREE.MeshStandardMaterial({
  color: audioFeatures.color[0],
  emissive: audioFeatures.color[0],
});

const colorMaterial = [
  material1,
  material2,
  material3,
  material4,
  material5,
  material6,
  material7,
  material8,
  material9,
  material10,
  material11,
  material12,
];
let colorSpectrumMaterials = [];

function createColorSpectrumMaterials() {
  for (let index = 0; index < 128; index++) {
    let mat = new THREE.MeshStandardMaterial({
      emissive: audioFeatures.colorSpectrum[index],
      emissiveIntensity: 0.1,
      color: audioFeatures.colorSpectrum[index],
    });
    colorSpectrumMaterials.push(mat);
  }

  audioFeatures["colorSpectrumMaterials"] = colorSpectrumMaterials;
}

function updateColor() {
  colorMaterial.forEach((material, index) => {
    material.color.setHex(colorToHexColor(audioFeatures.color[index]));
    material.emissive.setHex(colorToHexColor(audioFeatures.color[index]));
  });

  /*   console.dir("colorSpectrumaterial");
  console.dir(colorSpectrumMaterials); */
  colorSpectrumMaterials.forEach((materialSpectrum, index2) => {
    materialSpectrum.color.setHex(
      colorToHexColor(audioFeatures.colorSpectrum[index2])
    );
    materialSpectrum.emissive.setHex(
      colorToHexColor(audioFeatures.colorSpectrum[index2])
    );
  });
  /*   console.dir("colorSpectrumaterial After");
  console.dir(colorSpectrumMaterials);
  console.dir("color");
  console.dir(colorMaterial); */
}

// Geometrty
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
const materialShiny = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.0,
  metalness: 0.2,
});
// BASE OBJECT
const geoBaseObject = new THREE.SphereGeometry(0.1, 20, 20);
const baseObject = new THREE.Mesh(geoBaseObject, material);
scene.add(baseObject);

// ESSENCE SHAPE

/* console.dir("Resolution Shape: " + resolutionShape);
 */
let geoEssenceShape;
let essenceShape;
let noise;
let v3 = new THREE.Vector3();
let radius = 1;
let nPos = [];
let pos;
let resolutionShape;
function createEssenceShape(/* material */) {
  resolutionShape = Math.floor(
    (audioFeatures.predictions.mood_happy +
      audioFeatures.predictions.mood_sad +
      audioFeatures.predictions.mood_relaxed -
      (audioFeatures.predictions.mood_aggressive * 2) / 4) *
      10 -
      3
  );

  geoEssenceShape = new THREE.IcosahedronGeometry(radius, resolutionShape);

  pos = geoEssenceShape.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i).normalize();
    nPos.push(v3.clone());
  }
  geoEssenceShape.userData.nPos = nPos;

  let matEssenceShape = new THREE.MeshLambertMaterial({
    wireframe: false,
    flatShading: false,

    color: 0xffffff,
  });
  matEssenceShape.needsUpdate = true;
  essenceShape = new THREE.Mesh(geoEssenceShape, matEssenceShape);
  scene.add(essenceShape);

  noise = openSimplexNoise.makeNoise4D(
    audioFeatures.predictions.danceability * 100 /* Date.now() */
  );
}

/* let clock2 = new THREE.Clock(); */

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const groupTravelParticle = new THREE.Group();

var geoParticle = new THREE.PlaneBufferGeometry(0.12, 0.1, 1, 1);
var matParticle = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
});

function spawnParticle() {
  var travelParticle = new THREE.Mesh(geoParticle, matParticle);
  var particleXPos = getRndInteger(-50, 50);
  var particleYPos = getRndInteger(-20, 20);
  var particleRotation = getRndInteger(0, 45);
  /*  var randomColor = getRndInteger(0, 8); */

  travelParticle.position.set(particleXPos, particleYPos, 2);
  travelParticle.rotateZ(particleRotation);
  groupTravelParticle.add(travelParticle);
}
scene.add(groupTravelParticle);

function setRenderColor() {
  const darknessBias = -0.4;
  const positiveBias = audioFeatures.predictions.mood_happy / 6;
  const negativeBias = audioFeatures.predictions.mood_sad;
  let modifier = /* positiveBias */ -negativeBias;
  var color = shade(audioFeatures.color[12], darknessBias + modifier / 3);

  scene.background = new THREE.Color(color);
}

// RADIATION
const groupRadiation = new THREE.Group();
const radiationCollection = new THREE.Group();

function spawnRadiation(angle, index) {
  var shape = resolutionShape;
  if (shape <= 2) {
    shape = 2;
  }
  let selectedAngle;
  var randomColor = getRndInteger(0, 8);
  var spawnedGroupRadiation = groupRadiation.clone();
  var geoSphereRadiation = new THREE.SphereGeometry(0.1, shape, shape);

  var spawnedSphereRadiation = new THREE.Mesh(
    geoSphereRadiation,
    colorMaterial[index]
  );

  if (angle === undefined) {
    selectedAngle = getRndInteger(0, 225);
  } else {
    selectedAngle = angle;
  }
  spawnedGroupRadiation.rotateX(getRndInteger(0, 360));
  spawnedGroupRadiation.rotateY(getRndInteger(0, 360));
  spawnedGroupRadiation.rotateZ(getRndInteger(0, 360));
  spawnedGroupRadiation.add(spawnedSphereRadiation);
  radiationCollection.add(spawnedGroupRadiation);
  scene.add(radiationCollection);
}

// SPAWN CIRCLE BOOM
function spawnBeatBoom(angle, material) {
  let selectedAngle;
  if (angle === undefined) {
    selectedAngle = getRndInteger(0, 225);
  } else {
    selectedAngle = angle;
  }

  var randomColor = getRndInteger(0, 11);

  var spawnedGroupRadiation = groupRadiation.clone();
  var geoSphereRadiation = new THREE.SphereGeometry(
    0.03,
    resolutionShape,
    resolutionShape
  );
  var spawnedSphereRadiation = new THREE.Mesh(
    geoSphereRadiation,
    colorMaterial[randomColor]
  );
  /*  spawnedGroupRadiation.rotateX(getRndInteger(0, 360));
  spawnedGroupRadiation.rotateY(getRndInteger(0, 360)); */
  spawnedGroupRadiation.rotateZ(angle);
  spawnedGroupRadiation.add(spawnedSphereRadiation);
  spawnedGroupRadiation.position.x = 2;

  radiationCollection.add(spawnedGroupRadiation);
  scene.add(radiationCollection);
}

function spawnRadiationWave(index, material) {
  var spawnedGroupRadiation = groupRadiation.clone();
  var spawnedSphereRadiation = new THREE.Mesh(geoSphereRadiation, material);

  var scale = meanSplicedFrequencyList[index] / allMeanFrequency[index];
  spawnedSphereRadiation.scale.x = scale;
  spawnedSphereRadiation.scale.y = scale;
  spawnedSphereRadiation.scale.z = scale;
  /*   console.log(spawnedSphereRadiation.scale.y )
   */ spawnedGroupRadiation.position.set(
    (index / allMeanFrequency.length) * 20 - 10,
    -4,
    1
  );
  spawnedGroupRadiation.add(spawnedSphereRadiation);
  radiationCollection.add(spawnedGroupRadiation);
  scene.add(radiationCollection);
}

function firework() {
  for (let index = 0; index < 30; index++) {
    spawnBeatBoom(index);
  }
}

let bass = [];
let mid = [];
let treble = [];
let bassMean, midMean, trebleMean;
let last = 0;
let num = 0;
let speed = 0.05;

var clock = new THREE.Clock();
var delta = 0;
function calculateAverageOfArray(array) {
  const average = array.reduce((p, c) => p + c, 0) / array.length;
  return average;
}
/* var interval = setInterval(firework, 1000);
 */
function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

let morphTime = 0;
let morphTimeAmplifier = audioFeatures.predictions.mood_aggressive;
console.dir("morphtime Amplifier: " + morphTimeAmplifier);
var meanSplicedFrequencyList = [];
var allMeanFrequency = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

var rmsList = [];
var rmsMean = 0;
// ANIMATE
function animate(timeStamp) {
  requestAnimationFrame(animate);
  control.update();

  let t = clock.getElapsedTime();
  let timeInSecond = timeStamp / 100;

  delta = clock.getDelta();
  morphTime += audioFeatures.rms * morphTimeAmplifier;

  if (timeInSecond - last >= speed) {
    last = timeInSecond;
    spawnParticle();
  }
  groupTravelParticle.children.forEach((particle) => {
    particle.position.z -= 0.01 + audioFeatures.bpm / 1500;
    if (particle.position.z < -50) {
      groupTravelParticle.remove(particle);
    }
  });

  var splicedFrequencyList = sliceIntoChunks(
    audioFeatures.amplitudeSpectrum,
    22
  );
  meanSplicedFrequencyList = [];

  // Radiation Loop
  radiationCollection.children.forEach((radiationGroup) => {
    var mesh = radiationGroup.children[0];

    // Radiation Movment
    mesh.position.x += audioFeatures.bpm / 10000;
    if (
      audioFeatures.predictions.mood_aggressive > 0.6 &&
      audioFeatures.predictions.mood_sad > audioFeatures.predictions.mood_happy
    ) {
      mesh.position.y = 1 - Math.abs((mesh.position.x % 2) - 1);
    } else {
      mesh.position.y = 2 * Math.sin(1 * mesh.position.x);
    }

    // Remove Radiation
    if (mesh.position.x > 20 || mesh.position.z < -50) {
      radiationCollection.remove(radiationGroup);
    }
  });

  // When main has been initated
  if (audioFeatures.ready) {
    createEssenceShape();
    audioFeatures["essenceShapeReady"] = true;
    pointLight.color.setHex(colorToHexColor(audioFeatures.color[0]));
    pointLight2.color.setHex(colorToHexColor(audioFeatures.color[3]));
    audioFeatures["ready"] = false;
  }

  // When essence shape is initated
  if (audioFeatures.essenceShapeReady) {
    geoEssenceShape.userData.nPos.forEach((p, idx) => {
      let ns = noise(p.x, p.y, p.z, morphTime);
      v3.copy(p)
        .multiplyScalar(radius + audioFeatures.rms)
        .addScaledVector(p, ns);
      pos.setXYZ(idx, v3.x, v3.y, v3.z);
    });
    geoEssenceShape.computeVertexNormals();
    pos.needsUpdate = true;
    essenceShape.rotation.x += 0.001;
    essenceShape.rotation.y += 0.003;
  }

  // While song is playing do this
  if (audioFeatures.loudness > 1) {
    rmsList.push(audioFeatures.rms);
    rmsMean = calculateAverageOfArray(rmsList);
    if (audioFeatures.rms > rmsMean * 2.2) {
      spawnRadiation(undefined, audioFeatures.activeChromaIndex);
    }
  }

  composer.render(scene, camera);
}
animate();

// Resize Window
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

//Export funktions
export { setRenderColor, firework, updateColor, createColorSpectrumMaterials };
