import * as THREE from "../modules/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { addSmallCube } from "../geometry.js";
import { normalize, hslToHex } from "./utilityFunctions.js";

function removeEntity(object) {
  var selectedObject = scene.getObjectByName(object.name);
  scene.remove(selectedObject);
}

// Camera
let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050505, 1, 45);

const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth /* *0.7 */ / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvasId,
});

renderer.setClearColor(0x030303);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

var docaGeo = new THREE.DodecahedronGeometry(1, 0);
var doca = new THREE.Mesh(docaGeo, materialShiny);
scene.add(doca);

/* let chromaArrayBalls = [];
function chromaBallsSpawn() {
  for (let index = 0; index < 256 / 4; index++) {
    const sphereGeometr = new THREE.SphereGeometry(0.1, 15, 15);
    const sphere = new THREE.Mesh(sphereGeometr, material);
    sphere.position.x = -6 + index / 5;
    sphere.position.y = 4;
    sphere.position.z = -5;
    scene.add(sphere);
    chromaArrayBalls.push(sphere);
  }
}
chromaBallsSpawn(); */
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const groupTravelParticle = new THREE.Group();

var geoParticle = new THREE.PlaneBufferGeometry(0.12, 0.1, 1, 1);
var matParticle = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive:  0xffffff,
/*   side: THREE.DoubleSide, */
});

/* var travelParticle = new THREE.Mesh(geoParticle, matParticle);
 */
/* groupTravelParticle.add(travelParticle); */


function spawnParticle() {
  var travelParticle = new THREE.Mesh(geoParticle, matParticle);
  var particleXPos = getRndInteger(-50, 50);
  var particleYPos = getRndInteger(-20, 20);
  var particleRotation = getRndInteger(0, 45);
  travelParticle.position.set(particleXPos, particleYPos, 2);
  travelParticle.rotateZ(particleRotation);
  groupTravelParticle.add(travelParticle);
  console.dir("SPAWN");
}

//create a group and add the two cubes
//These cubes can now be rotated / scaled etc as a group
const intervalID = setInterval(spawnParticle(), 500);

scene.add(groupTravelParticle);

let last = 0;
let num = 0;
let speed = 0.2;


// ANIMATE
function animate(timeStamp) {
  requestAnimationFrame(animate);
  control.update();

  let timeInSecond = timeStamp / 1000;

  if (timeInSecond - last >= speed) {
    last = timeInSecond;
    console.log(++num);
    spawnParticle()
  }

  pointLight.color.setHex(audioFeatures.mainColor);
  pointLight2.color.setHex(audioFeatures.secondaryColor);

  /*   if (audioFeatures.amplitudeSpectrum.length > 0) {


    const minValue = Math.min(...audioFeatures.amplitudeSpectrum);
    const maxValue = Math.max(...audioFeatures.amplitudeSpectrum);
    audioFeatures["amplitudeSpectrum"] = audioFeatures.amplitudeSpectrum.map(
      normalize(0, 128)
    );

    chromaArrayBalls.forEach((ball, index) => {
      const amp = audioFeatures.amplitudeSpectrum[index];

      ball.position.y = 4 + amp * 10;
    });
  } */

  groupTravelParticle.children.forEach((particle) => {
    particle.position.z -= 0.02+audioFeatures.tempo/1000;
    if (particle.position.z < -50) {
      groupTravelParticle.remove(particle);
    }
  });

  if (audioFeatures.beatSwitch) {
    doca.rotation.x += audioFeatures.rms / 5;
    doca.rotation.y += audioFeatures.energy / 160;
  } else {
    doca.rotation.x -= audioFeatures.rms / 5;
    doca.rotation.y -= audioFeatures.energy / 160;
  }

  doca.scale.x = 1 + (audioFeatures["loudness"] / 100) * 3;
  doca.scale.y = 1 + (audioFeatures["loudness"] / 100) * 3;
  doca.scale.z = 1 + (audioFeatures["loudness"] / 100) * 3;

  renderer.render(scene, camera);
}

animate();
