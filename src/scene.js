/* import * as THREE from "../modules/three.module.js"; */
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
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.05, 0.1, 0.5);

const afterImagePass = new AfterimagePass();
afterImagePass.uniforms["damp"].value = 0.7;

const effectVignette = new ShaderPass(VignetteShader);
effectVignette.uniforms["offset"].value =
  audioFeatures.predictions.mood_sad / 2 + 0.5;
effectVignette.uniforms["darkness"].value = 5;

composer.addPass(renderScene);
composer.addPass(effectVignette);
composer.addPass(bloomPass);
composer.addPass(afterImagePass);

/* renderer.setClearColor(0x030303); */

/* renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; */
const control = new OrbitControls(camera, renderer.domElement);

// LIGHT
const light = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(light);

const pointLight = new THREE.PointLight(0xffffff, 2, 17);
pointLight.position.set(-5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 2, 17);
pointLight2.position.set(5, 5, 5);
pointLight2.castShadow = true;
scene.add(pointLight2);

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);

// Geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
const materialShiny = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.0,
  metalness: 0.2,
});
/* 
const standardMaterial1 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.2
  
});

const standardMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
  
});

const standardMaterial3 = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.1
  
});
var essenceShape1Geo = new THREE.SphereGeometry( 1, 10, 10)
var essenceShape1 = new THREE.Mesh(essenceShape1Geo, standardMaterial1);
var essenceShape2Geo = new THREE.SphereGeometry(2, 10, 10)
var essenceShape2 = new THREE.Mesh(essenceShape2Geo, standardMaterial2);
var essenceShape3Geo = new THREE.SphereGeometry( 3, 10, 10)
var essenceShape3 = new THREE.Mesh(essenceShape3Geo, standardMaterial3);

scene.add(essenceShape1, essenceShape2, essenceShape3 ) */

/* var docaGeo = new THREE.DodecahedronGeometry(1, 0);
var doca = new THREE.Mesh(docaGeo, materialShiny);
scene.add(doca); */

let radius = 1;
let g = new THREE.IcosahedronGeometry(radius, 1);
let nPos = [];
let v3 = new THREE.Vector3();
let pos = g.attributes.position;
for (let i = 0; i < pos.count; i++) {
  v3.fromBufferAttribute(pos, i).normalize();
  nPos.push(v3.clone());
}
g.userData.nPos = nPos;
console.dir("dasdas");
console.dir(g);
let m = new THREE.MeshStandardMaterial({
  wireframe: false,
  flatShading: false,
});
let o = new THREE.Mesh(g, m);

scene.add(o);

let noise = openSimplexNoise.makeNoise4D(audioFeatures.predictions.danceability/* Date.now() */);
/* let clock2 = new THREE.Clock(); */

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const groupTravelParticle = new THREE.Group();

var geoParticle = new THREE.PlaneBufferGeometry(0.12, 0.1, 1, 1);
var matParticle = new THREE.MeshStandardMaterial({
  color: 0xffffff,
});

function colorToHexColor(color) {
  let withoutHash = color.substring(1);
  return "0x" + withoutHash;
}

function spawnParticle() {
  var travelParticle = new THREE.Mesh(geoParticle, matParticle);
  var particleXPos = getRndInteger(-50, 50);
  var particleYPos = getRndInteger(-20, 20);
  var particleRotation = getRndInteger(0, 45);
  var randomColor = getRndInteger(0, 8);

  travelParticle.position.set(particleXPos, particleYPos, 2);
  travelParticle.rotateZ(particleRotation);
  groupTravelParticle.add(travelParticle);

  travelParticle.material.emissive.setHex(
    colorToHexColor(shade(audioFeatures.color[randomColor], 0.1))
  );
}

scene.add(groupTravelParticle);

function setRenderColor() {
  const darknessBias = 0;
  const positiveBias = audioFeatures.predictions.mood_happy;
  const negativeBias = audioFeatures.predictions.mood_sad;

  let modifier;

  if (positiveBias >= negativeBias) {
    modifier = positiveBias;
  } else {
    modifier = -negativeBias;
  }

  console.dir("modifier: " + modifier);
  console.dir(positiveBias);
  console.dir(negativeBias);
  var color = shade(audioFeatures.color[0], darknessBias + modifier / 2);

  scene.background = new THREE.Color(color);
}

var sphereRadiationGeo = new THREE.SphereGeometry(0.2, 10, 10);
var sphereRadiationMat = new THREE.MeshStandardMaterial({});
var sphereRadiation = new THREE.Mesh(sphereRadiationGeo, sphereRadiationMat);
const groupRadiation = new THREE.Group();
const radiationCollection = new THREE.Group();

function spawnRadiation(angle) {
  var randomColor = getRndInteger(0, 8);
  var randomAngle = getRndInteger(0, 225);
  var spawnedGroupRadiation = groupRadiation.clone();
  var spawnedSphereRadiation = sphereRadiation.clone();
  console.dir("reandom color:" + audioFeatures.color[randomColor]);
  spawnedSphereRadiation.material.color.setHex(
    colorToHexColor(audioFeatures.color[randomColor])
  );
  spawnedSphereRadiation.material.emissive.setHex(
    colorToHexColor(audioFeatures.color[randomColor])
  );
  spawnedGroupRadiation.rotateZ(angle);
  spawnedGroupRadiation.add(spawnedSphereRadiation);
  radiationCollection.add(spawnedGroupRadiation);
  scene.add(radiationCollection);
}

function firework() {
  spawnRadiation(0);
  spawnRadiation(45);
  spawnRadiation(90);
  spawnRadiation(135);
  spawnRadiation(180);
  spawnRadiation(225);
  spawnRadiation(0);
  spawnRadiation(15);
  spawnRadiation(30);
  spawnRadiation(60);
  spawnRadiation(75);
  spawnRadiation(105);
  spawnRadiation(120);
  spawnRadiation(150);
  spawnRadiation(165);
  spawnRadiation(195);
  spawnRadiation(210);
  spawnRadiation(240);
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
/* var interval = setInterval(firework, 1000) */
// ANIMATE
let energyT  = audioFeatures.energy;
function animate(timeStamp) {
  requestAnimationFrame(animate);
  control.update();

  let timeInSecond = timeStamp / 1000;
  if (audioFeatures.color.length >= 1) {
    if (timeInSecond - last >= speed) {
      last = timeInSecond;

      spawnParticle();
    }
  }
  if (audioFeatures.color.length > 1) {
    pointLight.color.setHex(colorToHexColor(audioFeatures.color[0]));
    pointLight2.color.setHex(colorToHexColor(audioFeatures.color[1]));
  }

  delta = clock.getDelta();

  groupTravelParticle.children.forEach((particle) => {
    particle.position.z -= 0.01 + audioFeatures.bpm / 1500;
    if (particle.position.z < -50) {
      groupTravelParticle.remove(particle);
    }
  });

  radiationCollection.children.forEach((radiationGroup) => {
    var mesh = radiationGroup.children[0];

    mesh.position.x += audioFeatures.bpm / 10000;
    mesh.position.z += 0.002;
    mesh.position.y = 1 * Math.sin(1 * mesh.position.x);
    if (mesh.position.x > 20) {
      radiationCollection.remove(radiationGroup);
    }
  });

 

  

  audioFeatures.amplitudeSpectrum.forEach((freq, index) => {
    if (index <= 99) {
      bass.push(freq);
    }
    if (index >= 100 && index <= 199) {
      mid.push(freq);
    }
    if (index >= 200 && index <= 255) {
      treble.push(freq);
    }
  });
  bassMean =  calculateAverageOfArray(bass)
  midMean = calculateAverageOfArray(mid)
  trebleMean = calculateAverageOfArray(treble)
 /*  var testarray=[1,2,3];
  console.dir( "dasdasdasddddddddddddddddddddddd")
  console.dir(calculateAverageOfArray(testarray))

  console.dir("bass: " + calculateAverageOfArray(bass));
  console.dir("mid: " + calculateAverageOfArray(mid));
  console.dir("treble: " + calculateAverageOfArray(treble)); */


  energyT += audioFeatures.rms;
  console.dir(energyT)
  // ESSENCE SHAPE
  let t = clock.getElapsedTime();
/*   console.dir(t)
 */  g.userData.nPos.forEach((p, idx) => {
    let ns = noise(p.x, p.y, p.z, energyT);
    v3.copy(p).multiplyScalar(radius).addScaledVector(p, ns);
    pos.setXYZ(idx, v3.x, v3.y, v3.z);
  });
  g.computeVertexNormals();
  pos.needsUpdate = true;

  composer.render(scene, camera);
}

animate();

/* function handleWindowResize () {
  w = window.innerWidth;
  h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false); */

export { setRenderColor, firework };
