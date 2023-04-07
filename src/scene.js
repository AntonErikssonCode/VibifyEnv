/* import * as THREE from "../modules/three.module.js";
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.125/build/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";

import {
  normalize,
  hslToHex,
  shade,
  colorToHexColor,
  getRndInteger,
  calculateAverageOfArray,
  sliceIntoChunks,
} from "./utilityFunctions.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/AfterimagePass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "https://cdn.jsdelivr.net/npm/three@0.125/examples/jsm/shaders/VignetteShader.js";
import openSimplexNoise from "https://cdn.skypack.dev/open-simplex-noise";

// Constants
const w = window.innerWidth;
const h = window.innerHeight;

// Camera
let scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, w /* *0.7 */ / h, 0.1, 1000);
camera.position.z = 6;

// Renderer
const renderer = new THREE.WebGLRenderer({
  /*  antialias: true, */
  canvas: myCanvasId,
  /* alpha: true, */
});
renderer.outputEncoding = THREE.RGBADepthPacking;
renderer.setSize(w, h);

const renderScene = new RenderPass(scene, camera);

// Post Processing
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.5, 0.5);
const afterImagePass = new AfterimagePass();
const effectVignette = new ShaderPass(VignetteShader);

afterImagePass.uniforms["damp"].value = 0.8;
effectVignette.uniforms["offset"].value =
  audioFeatures.predictions.mood_sad / 4 +
  0.4 -
  audioFeatures.predictions.mood_happy / 4;
effectVignette.uniforms["darkness"].value = 5;

composer.addPass(renderScene);
composer.addPass(effectVignette);
composer.addPass(bloomPass);
composer.addPass(afterImagePass);

// Controls
const control = new OrbitControls(camera, renderer.domElement);
// Texture
const loader = new THREE.TextureLoader();
const textureType = "Paper";

const repeatX = 3;
const repeatY = 2;
const texture = loader.load(
  `../assets/textures/${textureType}/texture.jpg`,
  function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = repeatX;
    texture.repeat.y = repeatY;
  }
);
const textureNormal = loader.load(
  `../assets/textures/${textureType}/normal.jpg`,
  function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = repeatX;
    texture.repeat.y = repeatY;
  }
);

const textureNormalHeight = loader.load(
  `../assets/textures/${textureType}/bump.jpg`,
  function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = repeatX;
    texture.repeat.y = repeatY;
  }
);

// Lights
const light = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);

dirLight.position.y = 1000;
scene.add(dirLight);
/* const helper = new THREE.DirectionalLightHelper(dirLight, 5);
scene.add(helper); */

const pointLight = new THREE.PointLight(0xffffff, 1.7);
pointLight.position.set(3, 0, 50);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 2);
pointLight2.position.set(200, 200, 200);
/* scene.add(pointLight2); */

const centerLight = new THREE.PointLight(0xffffff, 2);
centerLight.position.set(0, 0, 0);
scene.add(centerLight);
// Materials
const colorMaterial = [];
for (let index = 0; index < 12; index++) {
  const material = new THREE.MeshPhysicalMaterial({});
  colorMaterial.push(material);
}
// Base Object
const material = new THREE.MeshPhysicalMaterial({
  normalMap: textureNormal,
  normalScale: new THREE.Vector2(8, 8),
  displacementMap: textureNormalHeight,
  displacementScale: 0.01,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  metalness: 0.9,
  roughness: 0.5,
});
/* const geoBaseObject = new THREE.SphereGeometry(1, 50, 50);
const baseObject = new THREE.Mesh(geoBaseObject, colorMaterial[0]);
baseObject.position.x = 4;
scene.add(baseObject); */

// Create New Material
function createMaterial(color, emissive, emissiveIntensity, opacity) {
  const newMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: emissive,
    emissiveIntensity: emissiveIntensity,
    opacity: opacity,
    transparent: true,
  });
  return newMaterial;
}

// Color Functions
function setRenderColor() {
  const darknessBias = -0.5;
  var color = shade(audioFeatures.color[13], darknessBias);
  scene.background = new THREE.Color(color);
}

let metalness = 0;
let roughness = 0;
let reflectivity = 0;
let clearcoat = 0;
let clearcoatRoughness = 0;
let emissiveIntensity = 0.0;
let opacity = 1;

function updateMaterial() {
  metalness = 0.6 - audioFeatures.predictions.mood_happy;
  roughness = 0.3 + 0.7 * audioFeatures.predictions.mood_happy;
  reflectivity = audioFeatures.predictions.mood_happy;
  clearcoat = 1;
  clearcoatRoughness = audioFeatures.predictions.mood_sad;
  emissiveIntensity = audioFeatures.predictions.mood_happy / 10;

  if (
    audioFeatures.predictions.mood_relaxed > 0.6 &&
    audioFeatures.predictions.mood_happy > 0.4
  ) {
    opacity = 0.5;
    console.dir("dasdaskdm");
  }
  /* 
  metalness = 1 - audioFeatures.predictions.mood_happy;
  roughness = audioFeatures.predictions.mood_happy;
  reflectivity = audioFeatures.predictions.mood_happy;
  clearcoat = 1;
  clearcoatRoughness = audioFeatures.predictions.mood_sad;
  emissiveIntensity = audioFeatures.predictions.mood_happy/10;
 */
  updateColor();
}

function updateColor() {
  colorMaterial.forEach((material, index) => {
    material.color.setHex(colorToHexColor(audioFeatures.color[index]));
    material.emissive.setHex(colorToHexColor(audioFeatures.color[index]));
    material.emissiveIntensity = emissiveIntensity;
    material.opacity = opacity;
    material.transparent = true;
    material.displacementMap = textureNormalHeight;
    material.displacementScale = 0.01;
    material.normalMap = textureNormal;
    material.normalScale = new THREE.Vector2(8, 8);
    /* 

    material.displacementMap= textureNormalHeight;
    material.displacementScale= 1; */

    material.metalness = metalness;
    material.roughness = roughness;
    material.reflectivity = reflectivity;
    (material.clearcoat = clearcoat),
      (material.clearcoatRoughness = clearcoatRoughness);
  });
}

// Essence Shape
let geoEssenceShape;
let essenceShape;
let noise;
let v3 = new THREE.Vector3();
let radius = 1.2;
let nPos = [];
let pos;
let resolutionShape;
let emissiveIntensityColor;
function createEssenceShape() {
  resolutionShape = Math.floor(
    (audioFeatures.predictions.mood_happy +
      audioFeatures.predictions.mood_sad +
      audioFeatures.predictions.mood_relaxed -
      (audioFeatures.predictions.mood_aggressive * 2) / 4) *
      10 -
      3
  );
  var shape = resolutionShape;
  if (shape <= 1) {
    shape = 1;
  }

  geoEssenceShape = new THREE.IcosahedronGeometry(radius, shape);

  pos = geoEssenceShape.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i).normalize();
    nPos.push(v3.clone());
  }
  geoEssenceShape.userData.nPos = nPos;

  let matEssenceShape = new THREE.MeshStandardMaterial({
    wireframe: false,
    flatShading: false,
    roughness:
      1 -
      audioFeatures.predictions.mood_aggressive / 2 -
      audioFeatures.predictions.mood_sad / 2 +
      audioFeatures.predictions.mood_happy / 2,
    metalness: 0.4,
    color: audioFeatures.color[11],
  });

  const materialTest = new THREE.MeshPhysicalMaterial({
    normalMap: textureNormal,
    flatShading: false,
    normalScale: new THREE.Vector2(10, 10),

    color: audioFeatures.color[13],
    emissive: audioFeatures.color[13],
    emissiveIntensity: emissiveIntensity,

    metalness: metalness,
    roughness: roughness,
    reflectivity: reflectivity,
    clearcoat: clearcoat,
    clearcoatRoughness: clearcoatRoughness,
  });

  matEssenceShape.needsUpdate = true;
  essenceShape = new THREE.Mesh(geoEssenceShape, materialTest);
  scene.add(essenceShape);

  noise = openSimplexNoise.makeNoise4D(
    audioFeatures.predictions.danceability * 100 /* Date.now() */
  );
}

// Particles
const groupTravelParticle = new THREE.Group();
var geoParticle = new THREE.PlaneBufferGeometry(0.12, 0.1, 1, 1);
var matParticle = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
});

function spawnParticle(particleZPos) {
  var geoParticle = new THREE.PlaneBufferGeometry(0.12, 0.1, 1, 1);
  var travelParticle = new THREE.Mesh(geoParticle, matParticle);
  var particleXPos = getRndInteger(-50, 50);
  var particleYPos = getRndInteger(-20, 20);
  var particleRotation = getRndInteger(0, 45);

  travelParticle.position.set(particleXPos, particleYPos, particleZPos);
  travelParticle.rotateZ(particleRotation);
  groupTravelParticle.add(travelParticle);
}
scene.add(groupTravelParticle);

// Radiation
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
  var geoSphereRadiation = new THREE.SphereGeometry(0.05, shape, shape);

  var spawnedSphereRadiation = new THREE.Mesh(
    geoSphereRadiation,
    audioFeatures.color[index]
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
var geoSphereRadiation;
// Firework Function
function spawnBeatBoom(angle, color, size) {
  var shape = resolutionShape - 4;
  if (shape <= 3) {
    shape = 3;
  }
  var spawnedGroupRadiation = groupRadiation.clone();
  geoSphereRadiation = new THREE.SphereGeometry(size, shape + 1, shape);
  var spawnedSphereRadiation = new THREE.Mesh(
    geoSphereRadiation,
    colorMaterial[color]
  );
  spawnedSphereRadiation.position.z = -4;
  spawnedGroupRadiation.rotateZ(angle);
  spawnedGroupRadiation.add(spawnedSphereRadiation);
  spawnedGroupRadiation.position.x = 0;

  radiationCollection.add(spawnedGroupRadiation);
  scene.add(radiationCollection);
}
var fireworkModifier = 0;

function firework() {
  var value = 0;
  var size = 6.5 * audioFeatures.rms;

  fireworkModifier = 1;
  var colorIndexLength = audioFeatures.activeColorIndexes.length;
  var colorIndex = 0;
  var count = 0;

  for (let index = 0; index < 54; index++) {
    if (index % 3 == 0) {
      spawnBeatBoom(value, audioFeatures.activeColorIndexes[colorIndex], size);
      value += 0.35 * fireworkModifier;
      count++;
      colorIndex++;
      if (colorIndex >= colorIndexLength) {
        colorIndex = 0;
      }
    }
  }
}

// Camera Zoom
let cameraZoomedIn = true;
function moveCamera() {
  if (camera.position.z <= 7) {
    camera.position.z = 40;
    camera.position.x = 0;
    camera.position.y = 0;

    cameraZoomedIn = false;
    particleZPos = 37;
  } else {
    camera.position.z = 6;
    camera.position.x = 0;
    camera.position.y = 0;

    cameraZoomedIn = true;
    particleZPos = 5;
  }
}
/* moveCamera();
 */
const camerabutton = document.querySelector(".cameraButton");

camerabutton.onclick = function () {
  moveCamera();
};

// Power Spectrum
let orbitCollection = new THREE.Group();
function spawnOrbit() {
  for (let index = 0; index < 1; index++) {
    let orbitGroup = new THREE.Group();
    let geoOrbit = new THREE.SphereGeometry(0.1, 5, 5);
    var color = shade(audioFeatures.color[index], 0.1);
    const matOrbit = new THREE.MeshPhysicalMaterial({
      normalMap: textureNormal,
      normalScale: new THREE.Vector2(8, 8),
      displacementMap: textureNormalHeight,
      displacementScale: 0.01,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      metalness: 0.9,
      roughness: 0.5,
      color: 0xffffff,
      emissive: color,
      emissiveIntensity: 1,
    });

    let orbit = new THREE.Mesh(geoOrbit, matOrbit);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(3, 0, 50);

    orbitGroup.add(orbit);
    orbitGroup.add(pointLight);
    orbitCollection.add(orbitGroup);
  }
  scene.add(orbitCollection);
}
const numBand = 200;
const bandStart = 39;
var bufferGroup = new THREE.Group();
scene.add(bufferGroup);
function spawnBuffer() {
  for (let index = 0; index < numBand; index++) {
    var size = 0.2;
    var geoBufferBand = new THREE.SphereGeometry(size, 1, 1);
    var bufferBand = new THREE.Mesh(geoBufferBand, material);
    bufferBand.position.x = index * size * 4;
    bufferGroup.position.x = -80;
    if (index % 2 == 0) {
      bufferBand.position.y = bandStart;
    } else {
      bufferBand.position.y = -bandStart;
    }

    bufferGroup.add(bufferBand);
  }
}

// Animate Variables
let last = 0;
let particleSpawnSpeed = 2;
var clock = new THREE.Clock();
var delta = 0;
let morphTime = 0;
let morphTimeAmplifier = 1;
var rmsList = [];
var rmsMean = 0;
var defaultMoveSpeed = 0.01;
var fogDistance = 150;
var xModifier = 0.05;
var yModifier = 0.05;
var zModifier = 0.05;
var yDirection = "up";
var xDirection = "right";
var zDirection = "out";
var peakLoudness = 0;
var bandMeans = {
  low: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  high: 0,
};
var lastBand = [0, 0, 0, 0, 0];
let particleZPos = 5;
moveCamera();

// ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE
// ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE
// ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE
// ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE
// ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE ANIMATE
function animate(timeStamp) {
  requestAnimationFrame(animate);
  control.update();

  let t = clock.getElapsedTime();
  let timeInSecond = timeStamp / 100;

  delta = clock.getDelta();
  let addMorph = audioFeatures.rms * morphTimeAmplifier;
  if (addMorph > 0.1) {
    addMorph = 0.1;
  }
  /*   if (addMorph < 0.01) {
    addMorph = 0.01;
  } */
  morphTime += addMorph;
  /*   console.dir("morphTime: " + morphTime)
   */
  // Spawn Paricles
  if (timeInSecond - last >= particleSpawnSpeed) {
    last = timeInSecond;
    spawnParticle(particleZPos);
  }

  // Particle Loop
  groupTravelParticle.children.forEach((particle) => {
    // Particle Movment
    particle.position.z -= defaultMoveSpeed;

    // Remove Particle
    if (particle.position.z < -fogDistance) {
      groupTravelParticle.remove(particle);
    }
  });
  const distanceFromTheCenter = 4;
  // Radiation Loop
  radiationCollection.children.forEach((radiationGroup) => {
    var mesh = radiationGroup.children[0];

    // Radiation Movment
    if (audioFeatures.energy > 0.001) {
      if (mesh.position.x < 32) {
        mesh.position.x +=
          audioFeatures.bpm / 10000 +
          audioFeatures.rms * audioFeatures.predictions.danceability;

        mesh.rotation.x += audioFeatures.bpm / 10000 + audioFeatures.rms / 15;
        mesh.rotation.y -= audioFeatures.bpm / 10000 + audioFeatures.rms / 20;
        mesh.rotation.z += audioFeatures.bpm / 10000 + audioFeatures.rms / 10;
        /* mesh.position.z += audioFeatures.bpm / 100000; */
        if (
          audioFeatures.predictions.mood_aggressive > 0.6 &&
          audioFeatures.predictions.mood_sad >
            audioFeatures.predictions.mood_happy
        ) {
          // Triangle

          if (audioFeatures.key == "major") {
            mesh.position.y =
              1 - Math.abs((mesh.position.x % 3) - 1) + distanceFromTheCenter;
          } else {
            mesh.position.y =
              2 - Math.abs((mesh.position.x % 6) - 1) + distanceFromTheCenter;
          }
        } else {
          // Sine

          if (audioFeatures.key == "major") {
            mesh.position.y =
              1.2 * Math.sin(1.2 * mesh.position.x) + distanceFromTheCenter;
          } else {
            mesh.position.y =
              1 * Math.sin(1 * mesh.position.x) + distanceFromTheCenter;
          }
        }
      } else {
        if (audioFeatures.energy < 0.01) {
          mesh.position.z -= 0.01;
        } else {
          mesh.position.z -=
            audioFeatures.bpm / 100000 + audioFeatures.rms * 1.5;
          mesh.position.x += 0.01;

          // Direction of spiral
          if (audioFeatures.key == "major") {
            radiationGroup.rotation.z +=
              audioFeatures.bpm / 100000 + (audioFeatures.rms * 1.5) / 300;
          } else {
            radiationGroup.rotation.z -=
              audioFeatures.bpm / 100000 + (audioFeatures.rms * 1.5) / 300;
          }
        }
      }

      // Remove Radiation
      if (mesh.position.z < -200 /* fogDistance-50 */) {
        radiationCollection.remove(radiationGroup);
      }
    }
  });

  // When main has been initated
  if (audioFeatures.ready) {
    updateMaterial();
    createEssenceShape();
    spawnOrbit();
    spawnBuffer();

    audioFeatures["essenceShapeReady"] = true;
    defaultMoveSpeed = 0.01 + audioFeatures.bpm / 1500;
    fogDistance = fogDistance * audioFeatures.predictions.mood_sad;
    scene.fog = new THREE.Fog(0x050505, 1, 200);
    centerLight.intensity =
      centerLight.intensity * audioFeatures.predictions.mood_happy;
    pointLight.intensity = 1.2 + 0.5 * audioFeatures.predictions.mood_happy;
    emissiveIntensityColor = 0.75 + audioFeatures.predictions.mood_happy / 4;
    morphTimeAmplifier =
      (audioFeatures.predictions.mood_aggressive +
        audioFeatures.predictions.danceability) /
      2;

    audioFeatures["ready"] = false;
  }

  // When essence shape is initated
  if (audioFeatures.essenceShapeReady) {
    // Essence Shape Behaviour
    geoEssenceShape.userData.nPos.forEach((p, idx) => {
      let ns = noise(p.x, p.y, p.z, morphTime);
      v3.copy(p)
        .multiplyScalar(radius + audioFeatures.rms * 1.15)
        .addScaledVector(p, ns);
      pos.setXYZ(idx, v3.x, v3.y, v3.z);
    });
    geoEssenceShape.computeVertexNormals();
    pos.needsUpdate = true;
    essenceShape.rotation.x += 0.001;
    essenceShape.rotation.y += 0.003;
  }

  // While song is playing do this
  if (audioFeatures.loudness > 3) {
    rmsList.push(audioFeatures.rms);
    rmsMean = calculateAverageOfArray(rmsList);
    if (audioFeatures.rms > rmsMean * 2.2) {
    }
    if (audioFeatures.loudness > peakLoudness) {
      peakLoudness = audioFeatures.loudness;
    } else {
      peakLoudness -= 0.001;
    }

    const powerSpectrumBands = sliceIntoChunks(
      audioFeatures.buffer,
      Math.floor(audioFeatures.buffer.length / numBand)
    );
    const band = [];
    for (let index = 0; index < numBand; index++) {
      const element = calculateAverageOfArray(powerSpectrumBands[index]);
      band.push(element);
    }
    const bandMovment = 15;
    bufferGroup.children.forEach((buffer, index) => {
      if (index % 2 == 0) {
        buffer.position.y = band[index] * bandMovment + bandStart;
      } else {
        buffer.position.y = band[index] * bandMovment - bandStart;
      }
      /*   buffer.position.y = band[index] *7; */
    });

    console.dir(band);
    bandMeans["low"] = bandMeans.low + lastBand[0] / band[0] / 2;
    bandMeans["lowMid"] = bandMeans.lowMid + lastBand[1] / band[1] / 2;
    bandMeans["mid"] = bandMeans.mid + lastBand[2] / band[2] / 2;
    bandMeans["highMid"] = bandMeans.highMid + lastBand[3] / band[3] / 2;
    bandMeans["high"] = bandMeans.high + lastBand[4] / band[4] / 2;
    /*     console.dir(bandMeans); */

    lastBand = band;
    /*     console.dir(band);
     */
    /*  powerSpectrumGroup.children.forEach((ball, index) => {
      ball.scale.y = band.bass;
      ball.scale.y = band.lowMid;
      ball.scale.y = band.mid;
      ball.scale.y = band.highMid;
      ball.scale.y = band.high;
    });
    */
    const keysSorted = Object.keys(bandMeans).sort(function (a, b) {
      return bandMeans[a] - bandMeans[b];
    });
    var orbitLightIntensity;
    if (keysSorted[0] == "low") {
      orbitLightIntensity = 0.2;
    }
    if (keysSorted[0] == "lowMid") {
      orbitLightIntensity = 0.4;
    }
    if (keysSorted[0] == "mid") {
      orbitLightIntensity = 0.6;
    }
    if (keysSorted[0] == "highMid") {
      orbitLightIntensity = 0.8;
    }
    if (keysSorted[0] == "high") {
      orbitLightIntensity = 1;
    }

    /*     console.log(audioFeatures.buffer);
     */ orbitCollection.children.forEach((orbitGroup, index) => {
      var mesh = orbitGroup.children[0];
      var light = orbitGroup.children[1];
      var r = 2.5;
      var bandMorhTime = morphTime / 3;
      /* var bandRatio = lastBand[index] / band[index];
      var moveRation;
      if(bandRatio > 1){
        moveRation = -0.1;
      }
      else{
        moveRation = 0.0001;
      }
      console.dir(bandRatio)
      

      orbitGroup.position.y = moveRation - 2; */
      orbitGroup.rotation.x = bandMorhTime / 10;
      orbitGroup.rotation.y = bandMorhTime / 11;
      orbitGroup.rotation.z = bandMorhTime / 9;

      mesh.position.x = r * Math.sin(bandMorhTime);
      mesh.position.z = r * Math.cos(bandMorhTime);
      light.position.x = r * Math.sin(bandMorhTime);
      light.position.z = r * Math.cos(bandMorhTime);
      light.intensity = orbitLightIntensity;
    });
  }

  var rangePos = 1.5;
  var rangeNeg = -1.5;
  var yModifierSpeed = audioFeatures.rms / 10;
  var xModifierSpeed = audioFeatures.rms / 20;
  var zModifierSpeed = audioFeatures.rms;
  if (yDirection === "up") {
    if (camera.position.y <= rangePos) {
      yModifier = yModifierSpeed;
    } else {
      yModifier = -yModifierSpeed;
      yDirection = "down";
    }
  }
  if (yDirection === "down") {
    if (camera.position.y >= rangeNeg) {
      yModifier = -yModifierSpeed;
    } else {
      yModifier = yModifierSpeed;
      yDirection = "up";
    }
  }
  if (xDirection === "right") {
    if (camera.position.x <= rangePos) {
      xModifier = xModifierSpeed;
    } else {
      xModifier = -xModifierSpeed;
      xDirection = "left";
    }
  }
  if (xDirection === "left") {
    if (camera.position.x >= rangeNeg) {
      xModifier = -xModifierSpeed;
    } else {
      xModifier = xModifierSpeed;
      xDirection = "right";
    }
  }
  if (cameraZoomedIn) {
    camera.position.y += yModifier;
    camera.position.x += xModifier;
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
export { setRenderColor, firework, updateColor, moveCamera };
