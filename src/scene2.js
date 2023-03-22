import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import openSimplexNoise from "https://cdn.skypack.dev/open-simplex-noise";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth /  window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

let renderer = new THREE.WebGLRenderer({ antialias: true,   canvas: myCanvasId, });
renderer.setSize( window.innerWidth,  window.innerHeight);
/* document.body.appendChild(renderer.domElement); */

new OrbitControls(camera, renderer.domElement);

let radius = 2;
let g = new THREE.IcosahedronGeometry(1, 2);
let nPos = [];
let v3 = new THREE.Vector3();
let pos = g.attributes.position;
for (let i = 0; i < pos.count; i++) {
  v3.fromBufferAttribute(pos, i).normalize();
  nPos.push(v3.clone());
}
g.userData.nPos = nPos;
let m = new THREE.MeshNormalMaterial({ wireframe: false });
let o = new THREE.Mesh(g, m);
scene.add(o);

let noise = openSimplexNoise.makeNoise4D(Date.now());
let clock = new THREE.Clock();
/* 
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}); */

renderer.setAnimationLoop(() => {
  let t = clock.getElapsedTime();
  g.userData.nPos.forEach((p, idx) => {
    let ns = noise(p.x, p.y, p.z, t);
    v3.copy(p).multiplyScalar(radius).addScaledVector(p, ns);
    pos.setXYZ(idx, v3.x, v3.y, v3.z);
  });
  g.computeVertexNormals();
  pos.needsUpdate = true;
  renderer.render(scene, camera);
});
