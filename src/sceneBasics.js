import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.125/build/three.module.js";
import { OrbitControls } from "../modules/OrbitControls.js";
import { addSmallCube } from "../geometry.js";
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
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: myCanvasId,
});
renderer.setSize(w, h);
const renderScene = new RenderPass(scene, camera);

// Post Processing
const composer = new EffectComposer(renderer);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 1.5, 0.4, 0.85);
const afterImagePass = new AfterimagePass();
const effectVignette = new ShaderPass(VignetteShader);

afterImagePass.uniforms["damp"].value = 0.7;
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