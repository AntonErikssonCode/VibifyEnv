import * as THREE from "../modules/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { addSmallCube } from "../geometry.js";
import { normalize, hslToHex } from "./utilityFunctions.js";


function removeEntity(object) {
  var selectedObject = scene.getObjectByName(object.name);
  scene.remove(selectedObject);
}

// Camera
scene = new THREE.Scene();
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

const pointLight = new THREE.PointLight(0xff00ff, 2, 17);
pointLight.position.set(-5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x00ffff, 2, 17);
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

let chromaArrayBalls = [];
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
chromaBallsSpawn();



// ANIMATE
function animate() {
  requestAnimationFrame(animate);
  control.update();
 
    
   

  

  if (audioFeatures.amplitudeSpectrum.length > 0) {
    /* let colorAngle =
            (Math.atan2(audioFeatures["valens"], audioFeatures["arousal"]) *
              180) /
            Math.PI;

          const testColor = hslToHex(colorAngle, 100, 50);
          testColorDiv.style.background = testColor; */

    

    const minValue = Math.min(...audioFeatures.amplitudeSpectrum);
    const maxValue = Math.max(...audioFeatures.amplitudeSpectrum);
    audioFeatures["amplitudeSpectrum"] = audioFeatures.amplitudeSpectrum.map(
      normalize(0, 128)
    );

    chromaArrayBalls.forEach((ball, index) => {
      const amp = audioFeatures.amplitudeSpectrum[index];

      ball.position.y = 4 + amp * 10;
    });
  }

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
