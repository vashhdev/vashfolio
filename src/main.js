import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector(".experience-canvas")
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()

// Model Loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

// Main GLTF Loader
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)

const environmentMap = new THREE.CubeTextureLoader()
  .setPath( 'textures/skybox/' )
  .load( [
          'px.webp',
          'nx.webp',
          'py.webp',
          'ny.webp',
          'pz.webp',
          'nz.webp',
       ] )

const textureMap = {
  First: {
    day: "/textures/room/day/first_texture_set_day.webp",
    night: "/textures/room/night/first_texture_set_night.webp",
  },
  Second: {
    day: "/textures/room/day/second_texture_set_day.webp",
    night: "/textures/room/night/second_texture_set_night.webp",
  },
  Third: {
    day: "/textures/room/day/third_texture_set_day.webp",
    night: "/textures/room/night/third_texture_set_night.webp",
  },
  Fourth: {
    day: "/textures/room/day/fourth_texture_set_day.webp",
    night: "/textures/room/night/fourth_texture_set_night.webp",
  },
}

const loadedTexture = {
  day: {},
  night: {}
}

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day)
  dayTexture.flipY = false
  dayTexture.colorSpace = THREE.SRGBColorSpace
  loadedTexture.day[key] = dayTexture
 
  const nightTexture = textureLoader.load(paths.night)
  nightTexture.flipY = false
  nightTexture.colorSpace = THREE.SRGBColorSpace
  loadedTexture.night[key] = nightTexture
})

const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0,
          roughness: 0.05,
          transmission: 1,
          ior: 1.5,
          thickness: 0.1,
          envMap: environmentMap,
          envMapIntensity: 1,
          depthWrite: false,
        })
const screenWallpaper = textureLoader.load('/textures/video/screen.webp')
screenWallpaper.flipY = false
loader.load("models/Room_Portfolio.glb", (glb) => {
  
  glb.scene.traverse(child => {
    if(child.isMesh){
      if(child.name.includes("Water")){
        child.material = new THREE.MeshBasicMaterial({
          color: 0x558BC8,
          transparent: true,
          opacity: 0.66,
          depthWrite: false,
        })
      }
      else if(child.name.includes("Glass")){  
        // console.log(child)
        child.material = glassMaterial
        // console.log(child.material)
      }
      else if(child.name.includes("Screen")){  
        child.material = new THREE.MeshBasicMaterial({
          map: screenWallpaper,
        })
      }
      else {
      Object.keys(textureMap).forEach(key => {
        if(child.name.includes(key)){
          const material = new THREE.MeshBasicMaterial({
            map: loadedTexture.day[key],
        })

        child.material = material

        if(child.material.map){
          child.material.map.minFilter = THREE.LinearFilter;
        }
      }
      })
    }
    }

    

    
  })
  scene.add(glb.scene)
})

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 35, sizes.width / sizes.height, 0.1, 1000 );
camera.position.set(17.124194827547704, 10.63689366418896, 16.806173610872285);
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Orbit Controls
 */

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.target.set(-0.3675361566862547, 3.5279241366350726, -1.044819283365775)
controls.update()

/**
 * Event Listeners
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update the camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update the renderer
  renderer.setSize( sizes.width, sizes.height );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const render = () => {
  controls.update()

  // console.log(camera.position)
  // console.log('-----------------------------------------------------------')
  // console.log(controls.target)
  renderer.render( scene, camera );
  window.requestAnimationFrame(render)
}

render();