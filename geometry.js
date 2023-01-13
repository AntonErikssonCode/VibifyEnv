import * as THREE from "./modules/three.module.js";
const material = new THREE.MeshLambertMaterial({ color: 0xffffff});


export function addSmallCube(scene){
  const smallGeometry = new THREE.SphereGeometry(Math.random()/2,3,3);

  const smallCube = new THREE.Mesh(smallGeometry, material);
  let randomNum1 = Math.random() * (5 - -5) + -5;
  let randomNum2 = Math.random() * (7 - 0) + 0;
  let randomNum3 = Math.random() * (5 - -5) + -5;

  smallCube.position.x = randomNum1;
  smallCube.position.y = randomNum2;
  smallCube.position.z = randomNum3;
  smallCube.castShadow = true;
  scene.add(smallCube)
  return smallCube;
}



