import * as THREE from 'three';
import { materials } from './modules/materials';
// import { models } from './modules/models';
import { lights } from './modules/lights';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Manager from './modules/manager';
const manager = new Manager();
import { particleGrid } from './modules/particles';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';



import About from './modules/about';
const about = new About();


const ui = (function () {
  let domStrings = {
    webglContainer: 'webgl',
  }
  return {
    getDomStrings: function () {
      return domStrings;
    }
  }
})()

const scene = (function (ui, lights, materials) {
  const domStrings = ui.getDomStrings();
  const audio = new Audio();
  var toggleLightsBtn = document.getElementById('lightToggler');
  var audioClip = new Audio();
  audioClip.src = './assets/audio/pascal-letoublon-friendships-original-mix.mp3';
  audioClip.volume = 0.5;
  var playaudioBtn = document.getElementById('audioPlay');
  var stopaudioBtn = document.getElementById('audioStop');
  var volumeControl = document.getElementById('audioVolume');
  var scene, camera, clock, renderer, action, controls, composer, params, bloomPass, renderScene, mixer, toggleLightsBtn;
  var WIDTH = window.innerWidth;
  var HEIGHT = window.innerHeight;
  var loader = new FBXLoader(manager);


  var params = {
    exposure: 1,
    bloomStrength: 1,
    bloomThreshold: 0.2,
    bloomRadius: 1,
    material: "Lambert"
  };

  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(28, WIDTH / HEIGHT, 1, 1000);
  camera.position.z = 20;
  camera.position.x = 0;

  camera.position.y = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  var textureLoader = new THREE.TextureLoader();

  renderer.toneMapping = THREE.Uncharted2ToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(WIDTH, HEIGHT);
  document.getElementById(domStrings.webglContainer).appendChild(renderer.domElement);

  let wr = document.getElementById('webgl');


  if (wr !== null) {
    let canv = wr.getElementsByTagName('canvas')[0];
    canv.addEventListener('mouseover', function (event) {
      document.body.style.cursor = 'grab';
    });
    canv.addEventListener('mouseout', function (event) {
      document.body.style.cursor = 'default';
    });
    canv.addEventListener('mousedown', function (event) {
      document.body.style.cursor = 'grabbing';
    });
    canv.addEventListener('mouseup', function (event) {
      document.body.style.cursor = 'grab';
    });
  }

  var scene = new THREE.Scene();
  renderer.autoClear = false;
  renderer.setClearColor(0x001a33);


  var controls = new TrackballControls(camera, renderer.domElement);
  controls.maxDistance = 100;
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.1;
  controls.rotateSpeed = 2.0;
  controls.zoomSpeed = 0.5;

  loader.load('./assets/models/onoff4.fbx', function (object) {
    var mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    // mat.wireframe = true;
    mat.emissive = new THREE.Color('gray');
    mat.emissiveMap = textureLoader.load('./assets/images/textures/lambert2_emissive.jpg');
    mat.map = textureLoader.load('./assets/images/textures/lambert2_albedo.jpg');
    // mat.roughness = 1;
    // mat.normalMap = textureLoader.load('./assets/images/textures/lambert2_normal.png');
    // mat.normalScale = new THREE.Vector2(1, 1);
    // mat.roughnessMap = textureLoader.load('./assets/images/textures/lambert2_roughness.jpg');
    // mat.metalnessMap =  textureLoader.load('./assets/images/textures/lambert2_metallic.jpg');

    let wireFrameToggler = document.getElementById('materialType');
    wireFrameToggler.addEventListener('change', function(){
      if(this.checked)  {
        mat.wireframe = true
      } else mat.wireframe = false; 
       
    })
    // object.castShadow = true;
    // object.receiveShadow = true;

    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;



    mixer = new THREE.AnimationMixer(object);
    action = mixer.clipAction(object.animations[0]);
    action.setLoop(THREE.LoopOnce);

    mixer.addEventListener('finished', function (e) {
      audioClip.currentTime = 0;
      audioClip.pause();
      action.reset();
      action.timeScale = 0;
      off();
    });

    object.material = mat;

    object.traverse(function (child) {
      if (child) {
        child.material = mat;
        // child.castShadow = true;
        // child.receiveShadow = true;
      }
    })


    object.name = 'asd'
    scene.add(object);

    
  });

 
  function updateCube() {
    var value = params.material;
    var newMaterial;
    let obj = scene.getObjectByName('asd');
 
    if (value == "Lambert")
      newMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    else // (value == "Wireframe")
      newMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
      obj.material = newMaterial;
  }

  var pivotMat = materials.initMaterials('basic', 'white');
  // var pivot = models.getSphere(pivotMat, 0.1, 12);
  var light2 = lights.getPointLight(0.5);
  // light2.add(pivot);
  light2.position.z = 5;
  light2.position.y = 5;
  scene.add(light2);
  // var light3 = lights.getAmbientLight(0.05);
  // scene.add(light3);

  scene.add(camera);

  renderScene = new RenderPass(scene, camera);
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  composer = new EffectComposer(renderer);

  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  const playAudioSong = function () {
    action.play();
    action.timeScale = 1;
    audioClip.play();
  }

  const stopAudioSong = function () {
    action.timeScale = 0;
    audioClip.pause();
  }


  var gui = new GUI();

 

  gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {

    renderer.toneMappingExposure = Math.pow(value, 4.0);

  });
  gui.add(light2, 'intensity', 0, 1, 0.01);
  gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {

    bloomPass.threshold = Number(value);

  });

  gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {

    bloomPass.strength = Number(value);

  });

  gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {

    bloomPass.radius = Number(value);

  });
  // gui.open();

  let particleSystem = particleGrid(2, 10000, 200);
  scene.add(particleSystem);
 
  function changeVolume() {
    audioClip.volume = this.value;  
  }
  window.onresize = function () {
    var width = window.innerWidth;
    var height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

  };


  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    render();
  }

  animate();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    // renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    render();
  }
  function render() {

    controls.update();
    composer.render();
  }

  return {
    init: function () {
      animate();

      window.onload = function () {
        window.addEventListener('resize', onWindowResize, false);
        playaudioBtn.addEventListener('click', playAudioSong);
        stopaudioBtn.addEventListener('click', stopAudioSong);
        volumeControl.addEventListener('input', changeVolume);
      }
    }

  }

})(ui, lights, materials);
scene.init();








