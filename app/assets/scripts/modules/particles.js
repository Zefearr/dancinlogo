import * as THREE from 'three';
export const particleGrid = (size, count, distance) => {
  let r = 5;
  let elsize = Math.floor(Math.random() * r) + 1;
 
  let particleGeo = new THREE.Geometry();
  let particleMat = new THREE.PointsMaterial({
    color:'rgb(255,255,255)',
    size: size,
    map: new THREE.TextureLoader().load('assets/images/textures/forPart.png'), 
    transparent: true, 
  });
  let particleCount = count;
  let particleDistance = distance;
  for(let i = 0; i < particleCount; i++) {
    let posX = (Math.random() - 0.5) * particleDistance;
    let posY = (Math.random() - 0.5) * particleDistance;
    let posZ = (Math.random() - 0.5) * particleDistance;
  
    let particle = new THREE.Vector3(posX, posY, posZ);
    particleGeo.vertices.push(particle);
   
  }
  let particleSystem = new THREE.Points(
    particleGeo,
    particleMat
  );
  return particleSystem;
}