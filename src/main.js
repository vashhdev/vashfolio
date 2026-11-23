import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"
import { clipSpace } from 'three/tsl';

const canvas = document.querySelector(".experience-canvas")
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

const modals = {
  work:document.querySelector(".modal.work"),
  about:document.querySelector(".modal.about"),
  contact:document.querySelector(".modal.contact"),
}

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const modal = event.target.closest(".modal")
    hideModal(modal)
  })
})

const showModal = (modal) => {
  modal.style.display = "block"

  gsap.set(modal, {opacity: 0})
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  })
}
 
const hideModal = (modal) => {
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: ()=>{
        modal.style.display = "none"
    }
  })
}
 
const xAxisFans = []
const yAxisFans = [] 

const raycasterObjects = []
let currentIntersects = []

const socialLinks = {
  GitHub : "https://github.com/vashhdev",
  LinkedIn : "https://www.linkedin.com/in/vashisthapandya/",
  Instagram : "https://www.instagram.com/vashistha1802/",
}
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

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

window.addEventListener("mousemove", (event) => {
  // console.log(event)
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
})

/**
 * The On Click Event Listener
 */
window.addEventListener("click", (event) => {
  if(currentIntersects.length > 0){
    const object = currentIntersects[0].object
    // console.log(object)

    Object.entries(socialLinks).forEach(([key, url]) => {
      if(object.name.includes(key)){
        const newWindow = window.open()
        newWindow.opener = null
        newWindow.location= url
        // console.log(newWindow.location)
        newWindow.target = "_blank"
        newWindow.rel = "noopener noreferrer"
      }
    })

    if(object.name.includes("Work_Button")){
      showModal(modals.work)
    }else if(object.name.includes("About_Button")){
      showModal(modals.about)
    }else if(object.name.includes("Contact_Button")){
      showModal(modals.contact)
    }
  }
})

loader.load("models/Room_Portfolio.glb", (glb) => {
  
  glb.scene.traverse(child => {
    if(child.isMesh){
      if(child.name.includes("Raycaster")){
        raycasterObjects.push(child)
        // console.log(child)
      }
      
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

        if(child.name.includes("Fan")){
          if(child.name.includes("Fan_2") || child.name.includes("Fan_4")){
            xAxisFans.push(child)
          }
          else{
            yAxisFans.push(child)
          }
        }

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

  // Animate Fans
  xAxisFans.forEach(fan => {
    fan.rotation.x += 0.01
  })
  yAxisFans.forEach(fan => {
    fan.rotation.y += 0.01
  })

  /**
   * Raycaster
   */
  raycaster.setFromCamera( pointer, camera )

  // Calculate the Objects intersecting the ray
  currentIntersects = raycaster.intersectObjects( raycasterObjects )

  // Fixing the mouse pointer
  if (currentIntersects.length > 0 && currentIntersects[0].object.name.includes("Pointer")) {
  canvas.style.cursor = "pointer"
  } else {
  canvas.style.cursor = "default"
  }

  for(let i = 0; i < currentIntersects.length; i++){
    currentIntersects[i].object.material.color.set(0xff0000)
  }

  if(currentIntersects.length > 0){
    const currentIntersectObject = currentIntersects[0].object

    if(currentIntersectObject.name.includes("Pointer")){
      // console.log("this is a pointer object")
      // console.log(currentIntersectObject.name)
      document.body.style.cursor = "pointer"
      }else{
        // console.log("this is a normal object")
        document.body.style.cursor = "default"
      }
    }else{
        // console.log("this is a normal object")
        document.body.style.cursor = "default"
      }
    

  renderer.render( scene, camera );
  window.requestAnimationFrame(render)
}

render();