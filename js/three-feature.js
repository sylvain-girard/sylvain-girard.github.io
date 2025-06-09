import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import GUI from 'lil-gui'; // Ensure GUI is not used
import CannonDebugger from 'cannon-es-debugger';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
// import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'; // Not used

// Helper function to detect mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Configuration Object
const config = {
  material: {
    color: 0x917aff,
    roughness: 0.2,
    metalness: 1.0,
    envMapIntensity: 1.5,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
  },
  postProcessing: {
    fxaa: true,
    motionTrails: {
      enabled: true,
      persistence: 0.8,
    },
    bloom: {
      enabled: true,
      strength: 0.25,
      radius: 0.05,
      threshold: 0.95,
    },
  },
  lighting: {
    mainLightIntensity: 1.0,
    fillLightIntensity: 0.5,
  },
  scene: {
    toneMappingExposure: 1.0,
    globalEnvMapIntensity: 1.0,
    defaultEnvMapURL: 'images/three-env.exr',
    defaultEnvMapFilename: 'three-env.exr',
    floorOpacity: 0.0
  },
  controls: {
    orbitControlsEnabled: false, // Production: false
    showColliders: false,        // Production: false
    showEnvMapDebugPreview: false, // Production: false
    createPlaneHelpers: false,   // Production: false
    showGridHelper: false        // Production: false
  },
  numObjects: isMobile ? 37 : 150,
  baseBoundZ: parseFloat(localStorage.getItem('baseBoundZ')) || (isMobile ? 2.25 : 6),
  mouseForceMultiplier: parseFloat(localStorage.getItem('mouseForceMultiplier')) || (isMobile ? 600.0 : 1200.0),
  maxInteractionDistance: 2.2,
  fieldOfInfluenceDot: -0.2,
};

const container = document.getElementById('three-container')
if (!container) {
  // console.error("Error: Could not find container with id 'three-container'") // Keep for critical error
} else {
  const scene = new THREE.Scene()
  
  let envMap = null;
  const rgbeLoader = new RGBELoader();
  const exrLoader = new EXRLoader();
  
  function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }
  
  function loadEnvironmentMap(url, filename, isDefault = false) {
    // console.log(isDefault ? 'Loading default environment map...' : `Loading ${filename}...`); // Verbose
    
    const extension = getFileExtension(filename);
    
    const onProgress = (xhr) => {
      // if (xhr.lengthComputable) { // Verbose
      //   const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
      //   console.log(`Loading ${filename}: ${percentComplete}%`);
      // }
    };
    
    const onError = (error) => {
      console.error('Error loading environment map:', error);
      // console.error(`Error: ${error.message || 'Failed to load ' + filename}`); // Redundant
      
      if (isDefault) {
        createFallbackEnvironment();
      }
    };
    
    const onLoad = (texture) => {
      try {
        if (!texture) throw new Error("Loaded texture is null or undefined");
        
        texture.mapping = THREE.EquirectangularReflectionMapping;
        
        if (envMap) {
          envMap.dispose(); 
        }
        
        envMap = texture;
        scene.environment = envMap;
        scene.environmentIntensity = config.scene.globalEnvMapIntensity; 
        
        if (modelMaterial) {
          modelMaterial.envMap = envMap;
          modelMaterial.needsUpdate = true;
        }
        
        // console.log('Environment map loaded successfully:', filename); // Verbose
        
        updateEnvMapDebugView();
        
        if (!isDefault && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Error applying environment map:', err);
        
        if (isDefault) {
          createFallbackEnvironment();
        }
      }
    };
    
    try {
      if (extension === 'hdr') {
        rgbeLoader.load(url, onLoad, onProgress, onError);
      } else if (extension === 'exr') {
        exrLoader.load(url, onLoad, onProgress, onError);
      } else {
        onError({ message: `Unsupported file format: ${extension}` });
      }
    } catch (error) {
      onError(error);
    }
  }
  
  function createFallbackEnvironment() {
    // console.log("Creating fallback environment"); // Verbose
    
    try {
      if (envMap) {
        envMap.dispose();
      }
      
      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128);
      const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
      
      const bgScene = new THREE.Scene();
      const topColor = new THREE.Color(0x88ccff);
      const bottomColor = new THREE.Color(0xffeebb);
      
      const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      
      const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(h, 0.0)), 1.0);
        }
      `;
      
      const uniforms = {
        topColor: { value: topColor },
        bottomColor: { value: bottomColor }
      };
      
      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide
      });
      
      const sky = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), skyMaterial);
      bgScene.add(sky);
      
      cubeCamera.update(renderer, bgScene);
      
      envMap = cubeRenderTarget.texture;
      scene.environment = envMap;
      scene.environmentIntensity = config.scene.globalEnvMapIntensity;
      
      if (modelMaterial) {
        modelMaterial.envMap = envMap;
        modelMaterial.needsUpdate = true;
      }
      
      // console.log("Fallback gradient environment created."); // Verbose
      updateEnvMapDebugView();
      
    } catch (err) {
      console.error("Error creating fallback environment:", err);
    }
  }
  
  function loadDefaultEnvironmentMap() {
    const defaultUrl = config.scene.defaultEnvMapURL;
    loadEnvironmentMap(defaultUrl, config.scene.defaultEnvMapFilename, true);
  }
  
  try {
    loadDefaultEnvironmentMap();
  } catch (error) {
    console.error("Could not load default environment:", error);
    createFallbackEnvironment();
  }
  
  const initialAspect = container.clientWidth / container.clientHeight
  const camera = new THREE.PerspectiveCamera(60, initialAspect, 0.1, 100)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.scene.toneMappingExposure; 
  renderer.shadowMap.enabled = false;
  renderer.physicallyCorrectLights = true; 
  renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); 
  container.appendChild(renderer.domElement)

  const containerStyle = window.getComputedStyle(container);
  const containerBackgroundColor = containerStyle.backgroundColor;
  scene.background = new THREE.Color(containerBackgroundColor);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))
  
  const dirLight = new THREE.DirectionalLight(0xffffff, config.lighting.mainLightIntensity) 
  dirLight.position.set(5, 10, 7.5)
  dirLight.castShadow = false 
  scene.add(dirLight)
  
  const fillLight = new THREE.DirectionalLight(0xffffdd, config.lighting.fillLightIntensity) 
  fillLight.position.set(-5, 8, -10)
  scene.add(fillLight)
  
  scene.traverse(object => {
    if (object.isMesh && object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(mat => {
          if (mat.envMapIntensity !== undefined && mat !== modelMaterial) { 
            mat.envMapIntensity = config.scene.globalEnvMapIntensity;
            mat.needsUpdate = true;
          }
        });
      } else if (object.material.envMapIntensity !== undefined && object.material !== modelMaterial) {
        object.material.envMapIntensity = config.scene.globalEnvMapIntensity;
        object.material.needsUpdate = true;
      }
    }
  });

  let envMapDebugMesh;
  function setupEnvMapDebug() {
    if (envMapDebugMesh) scene.remove(envMapDebugMesh);
    
    if (!envMap) return;
    
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 1,
      envMap: envMap,
      envMapIntensity: config.scene.globalEnvMapIntensity
    });
    
    envMapDebugMesh = new THREE.Mesh(geometry, material);
    envMapDebugMesh.position.set(0, 8, 0); 
    scene.add(envMapDebugMesh);
  }
  
  function updateEnvMapDebugView() {
    if (config.controls.showEnvMapDebugPreview && envMap) { 
      setupEnvMapDebug();
    } else if (envMapDebugMesh) {
      scene.remove(envMapDebugMesh);
      envMapDebugMesh.geometry.dispose(); // Dispose geometry
      envMapDebugMesh.material.dispose(); // Dispose material
      envMapDebugMesh = null; // Clear reference
    }
  }
  
  const boxBottomY = 0; 
  const boxHeight = 8;  
  const baseBoundZ = config.baseBoundZ; 
  const bounds = { x: baseBoundZ * initialAspect, z: baseBoundZ };

  const defaultCameraY = 10; 
  const defaultCameraPosition = new THREE.Vector3(0, defaultCameraY, 0.001); 
  const cameraTarget = new THREE.Vector3(0, boxBottomY + boxHeight * 0.1, 0); 

  camera.position.copy(defaultCameraPosition);
  camera.lookAt(cameraTarget);
  
  const floorSize = Math.max(bounds.x, bounds.z) * 2;
  const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.65,
    metalness: 0.05,
    side: THREE.DoubleSide,
    envMapIntensity: config.scene.globalEnvMapIntensity * 0.5, 
    transparent: true,
    opacity: config.scene.floorOpacity 
  });
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; 
  floor.position.y = boxBottomY + 0.001; 
  scene.add(floor);
  
  let gridHelper;
  function setupGridHelper() {
    if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper.geometry.dispose();
        gridHelper.material.dispose();
        gridHelper = null;
    }
    if (config.controls.showGridHelper) {
        gridHelper = new THREE.GridHelper(Math.max(bounds.x, bounds.z) * 2, 20, 0x888888, 0x555555);
        gridHelper.position.y = boxBottomY + 0.002; 
        gridHelper.material.opacity = 0.15; 
        gridHelper.material.transparent = true;
        scene.add(gridHelper);
    }
  }
  setupGridHelper(); // Initial setup
  
  const modelMaterial = new THREE.MeshPhysicalMaterial({
    color: config.material.color,
    roughness: config.material.roughness,       
    metalness: config.material.metalness,
    envMapIntensity: config.material.envMapIntensity,
    clearcoat: config.material.clearcoat,
    clearcoatRoughness: config.material.clearcoatRoughness,
    flatShading: false
  });
  
  const numObjects = config.numObjects;
  
  const world = new CANNON.World()
  world.gravity.set(0, -9.82, 0) 
  world.broadphase = new CANNON.SAPBroadphase(world) 
  world.solver.iterations = isMobile ? 3 : 5; 

  const objectMaterial = new CANNON.Material('objectMaterial')
  const planeMaterial = new CANNON.Material('planeMaterial')
  const objectPlaneContactMaterial = new CANNON.ContactMaterial(
    objectMaterial,
    planeMaterial,
    {
      friction: 0.05,     
      restitution: 0.45   
    }
  )
  world.addContactMaterial(objectPlaneContactMaterial)

  const objectObjectContactMaterial = new CANNON.ContactMaterial(
    objectMaterial,
    objectMaterial, 
    {
      friction: 0.02,     
      restitution: 0.35   
    }
  )
  world.addContactMaterial(objectObjectContactMaterial)

  let instancedMesh
  let discRadius, discHalfHeight
  const physicsBodies = [] 

  const tempMatrix = new THREE.Matrix4()
  const tempScale = new THREE.Vector3(1, 1, 1)

  let orbitControls;
  let cannonDebugger;

  // let spawnRegionHeight; // Not used directly, boxHeight and discHalfHeight are used
  let isAnimationLoopRunning = false; // Flag to track animation loop

  const cannonPlanes = [
    new CANNON.Body({ mass: 0, material: planeMaterial }), 
    new CANNON.Body({ mass: 0, material: planeMaterial }), 
    new CANNON.Body({ mass: 0, material: planeMaterial }), 
    new CANNON.Body({ mass: 0, material: planeMaterial }), 
    new CANNON.Body({ mass: 0, material: planeMaterial })  
  ];
  const threeCollisionPlanes = [ // Used for PlaneHelpers
    new THREE.Plane(), new THREE.Plane(), new THREE.Plane(), new THREE.Plane(), new THREE.Plane()
  ];
  const planeHelpers = [];
  // const createPlaneHelpers = config.controls.createPlaneHelpers; // Already in config check

  const raycaster = new THREE.Raycaster()
  const mouseScreenPos = new THREE.Vector2()
  const currentMouse3D = new THREE.Vector3()
  const previousMouse3D = new THREE.Vector3()
  const mouseVelocity3D = new THREE.Vector3()
  let firstMove = true

  let interactionPlane

  const objLoader = new OBJLoader()
  
  objLoader.load(
    'objects/logo.obj',
    function (loadedObj) {
      if (instancedMesh) {
        scene.remove(instancedMesh);
        instancedMesh.geometry.dispose();
        // Material is shared (modelMaterial), no need to dispose here unless it's unique to this instance
        instancedMesh = null;
      }
      physicsBodies.forEach(body => world.removeBody(body))
      physicsBodies.length = 0

      let modelGeometry;
      
      loadedObj.traverse(function (child) {
        if (child.isMesh) {
          if (!modelGeometry && child.geometry) {
            modelGeometry = child.geometry.clone();
          }
        }
      });

      if (!modelGeometry) {
        console.error("No mesh found in OBJ file.");
        return;
      }

      const scaleFactor = isMobile ? 0.8 : 1.2;
      modelGeometry.scale(scaleFactor, scaleFactor, scaleFactor);

      modelGeometry.computeBoundingBox();
      const preRotationBox = modelGeometry.boundingBox.clone();
      const preRotationDims = new THREE.Vector3();
      preRotationBox.getSize(preRotationDims);

      if (preRotationDims.x < preRotationDims.y && preRotationDims.x < preRotationDims.z) {
        modelGeometry.rotateZ(Math.PI / 2);
      } else if (preRotationDims.z < preRotationDims.y && preRotationDims.z < preRotationDims.x) {
        modelGeometry.rotateX(-Math.PI / 2);
      }

      modelGeometry.computeBoundingBox();
      const boundingBox = modelGeometry.boundingBox;
      const modelDimensions = new THREE.Vector3();
      boundingBox.getSize(modelDimensions);
      
      discRadius = Math.max(modelDimensions.x, modelDimensions.z) / 2.0;
      discHalfHeight = modelDimensions.y / 2.0;

      if (discRadius === 0) discRadius = 0.25 * scaleFactor; 
      if (discHalfHeight === 0) discHalfHeight = 0.025 * scaleFactor; 

      // console.log("Calculated discRadius:", discRadius, "discHalfHeight:", discHalfHeight); // Verbose

      // spawnRegionHeight = boxHeight - discHalfHeight * 2; // Recalculated, but not directly used later for spawning logic
      interactionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.0); 

      if (modelGeometry.index !== null) {
        modelGeometry = modelGeometry.toNonIndexed();
      }
      
      modelGeometry.computeVertexNormals();
      
      if (envMap) {
        modelMaterial.envMap = envMap;
        modelMaterial.needsUpdate = true;
      }

      instancedMesh = new THREE.InstancedMesh(modelGeometry, modelMaterial, numObjects);
      instancedMesh.castShadow = false; 
      instancedMesh.receiveShadow = false; 
      scene.add(instancedMesh);

      const cylinderShape = new CANNON.Cylinder(discRadius, discRadius, discHalfHeight * 2, 12); 
      const bodyMass = 0.65; 

      for (let i = 0; i < numObjects; i++) {
        const body = new CANNON.Body({
          mass: bodyMass,
          shape: cylinderShape,
          material: objectMaterial,
          linearDamping: 0.03, 
          angularDamping: 0.04  
        });
        const randomX = (Math.random() - 0.5) * (bounds.x * 0.9); 
        const randomY = boxBottomY + discHalfHeight + Math.random() * (boxHeight - discHalfHeight * 2 - 0.5); 
        const randomZ = (Math.random() - 0.5) * (bounds.z * 0.9); 
        body.position.set(randomX, randomY, randomZ);

        const randomAngleX = Math.random() * Math.PI * 2;
        const randomAngleY = Math.random() * Math.PI * 2;
        const randomAngleZ = Math.random() * Math.PI * 2;
        body.quaternion.setFromEuler(randomAngleX, randomAngleY, randomAngleZ);
        
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = Math.random() * -0.2;
        const vz = (Math.random() - 0.5) * 0.5;
        body.velocity.set(vx, vy, vz);
        
        world.addBody(body);
        physicsBodies.push(body);

        tempMatrix.compose(
            new THREE.Vector3().copy(body.position),
            new THREE.Quaternion().copy(body.quaternion),
            tempScale
        );
        instancedMesh.setMatrixAt(i, tempMatrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true

      if (!orbitControls) {
        orbitControls = new OrbitControls(camera, renderer.domElement)
        orbitControls.enabled = config.controls.orbitControlsEnabled; 
        orbitControls.target.copy(cameraTarget); 
        // camera.position.copy(defaultCameraPosition); // Set by controls.enabled logic
        orbitControls.update()
      }
      
      if (!config.controls.orbitControlsEnabled) {
        camera.position.copy(defaultCameraPosition);
        if (orbitControls) { // Ensure orbitControls exists before accessing target
             orbitControls.target.copy(cameraTarget);
             orbitControls.update(); // Update controls to reflect new camera position and target
        } else { // If orbitControls is not yet initialized, directly lookAt
            camera.lookAt(cameraTarget);
        }
      }


      if (!cannonDebugger) {
        cannonDebugger = new CannonDebugger(scene, world, {});
      }
      
      setupGridHelper(); // Re-evaluate grid helper visibility based on config
      initPostProcessing(); // Initialize post-processing before first resize call
      
      if (interactionPlane) interactionPlane.constant = -1.0;
      setupBoxContainerPlanes(); 
      onWindowResize(); // Call once to set initial bounds correctly AFTER post-processing init

      // Only start animation loop if it's not already running
      if (!isAnimationLoopRunning) { // Check our flag
        renderer.setAnimationLoop(animate);
        isAnimationLoopRunning = true; // Set our flag
      }
    },
    function (xhr) {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded') // Verbose
    },
    function (error) {
      console.error('An error happened while loading the OBJ model:', error)
    }
  )

  function setupBoxContainerPlanes() {
    if (!bounds.x) return; 

    const wallThickness = 0.1; 

    cannonPlanes[0].position.set(0, boxBottomY - wallThickness / 2, 0); 
    cannonPlanes[0].quaternion.setFromEuler(-Math.PI / 2, 0, 0); 
    threeCollisionPlanes[0].setComponents(0, 1, 0, -boxBottomY);

    cannonPlanes[1].position.set(bounds.x + wallThickness / 2, boxBottomY + boxHeight / 2, 0);
    cannonPlanes[1].quaternion.setFromEuler(0, -Math.PI / 2, 0); 
    threeCollisionPlanes[1].setComponents(-1, 0, 0, bounds.x);

    cannonPlanes[2].position.set(-bounds.x - wallThickness / 2, boxBottomY + boxHeight / 2, 0);
    cannonPlanes[2].quaternion.setFromEuler(0, Math.PI / 2, 0); 
    threeCollisionPlanes[2].setComponents(1, 0, 0, bounds.x);

    cannonPlanes[3].position.set(0, boxBottomY + boxHeight / 2, bounds.z + wallThickness / 2);
    cannonPlanes[3].quaternion.setFromEuler(0, Math.PI, 0); 
    threeCollisionPlanes[3].setComponents(0, 0, -1, bounds.z);

    cannonPlanes[4].position.set(0, boxBottomY + boxHeight / 2, -bounds.z - wallThickness / 2);
    cannonPlanes[4].quaternion.setFromEuler(0, 0, 0); 
    threeCollisionPlanes[4].setComponents(0, 0, 1, bounds.z);
    
    cannonPlanes.forEach((body) => { 
        if (body.shapes.length === 0) { // Add shapes only if they don't exist
            body.addShape(new CANNON.Plane());
        }
        if (!world.bodies.includes(body)) { // Add to world only if not already added
            world.addBody(body);
        }
    });

    // Clear existing plane helpers before creating new ones
    planeHelpers.forEach(h => {
        scene.remove(h);
        h.geometry.dispose();
        h.material.dispose();
    });
    planeHelpers.length = 0;

    if (config.controls.createPlaneHelpers) { // Check config before creating
        if (scene) { // Ensure scene exists
            planeHelpers.push(new THREE.PlaneHelper(threeCollisionPlanes[0], Math.max(bounds.x, bounds.z) * 1.5, 0x00ff00)); 
            const wallHelperSize = boxHeight * 1.1; 
            planeHelpers.push(new THREE.PlaneHelper(threeCollisionPlanes[1], wallHelperSize, 0xff0000)); 
            planeHelpers.push(new THREE.PlaneHelper(threeCollisionPlanes[2], wallHelperSize, 0xff0000)); 
            planeHelpers.push(new THREE.PlaneHelper(threeCollisionPlanes[3], wallHelperSize, 0x0000ff)); 
            planeHelpers.push(new THREE.PlaneHelper(threeCollisionPlanes[4], wallHelperSize, 0x0000ff)); 
            
            planeHelpers.forEach(h => scene.add(h));
        }
    }
  }

  function onMouseMove(event) {
    if (!renderer.domElement) return; // Ensure renderer is available
    const rect = renderer.domElement.getBoundingClientRect()
    mouseScreenPos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouseScreenPos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }
  window.addEventListener('mousemove', onMouseMove)

  function onTouchStart(event) {
    if (!isMobile || !renderer.domElement) return;
    if (event.touches.length === 0) return;

    const touch = event.touches[0];
    const rect = renderer.domElement.getBoundingClientRect();
    mouseScreenPos.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    mouseScreenPos.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

    if (interactionPlane) {
        raycaster.setFromCamera(mouseScreenPos, camera);
        const tapPoint3D = new THREE.Vector3();
        const planeIntersects = raycaster.ray.intersectPlane(interactionPlane, tapPoint3D);

        if (planeIntersects && physicsBodies.length > 0) {
            const tapPositionCannon = new CANNON.Vec3(tapPoint3D.x, tapPoint3D.y, tapPoint3D.z);
            const tapForceMagnitude = config.mouseForceMultiplier * 0.5; // Adjust as needed, maybe a new config param
            const tapInteractionRadius = config.maxInteractionDistance * 0.75; // Radius of effect for tap

            for (let i = 0; i < physicsBodies.length; i++) {
                const body = physicsBodies[i];
                const vectorToBody = new CANNON.Vec3();
                body.position.vsub(tapPositionCannon, vectorToBody);
                const distanceToBody = vectorToBody.length();

                if (distanceToBody < tapInteractionRadius && distanceToBody > 0.01) {
                    const directionToBody = vectorToBody.unit(); // Normalized vector from tap to body
                    const force = directionToBody.scale(tapForceMagnitude / (distanceToBody + 0.1)); // Force diminishes with distance
                    body.applyImpulse(force, CANNON.Vec3.ZERO); // Use impulse for a sudden push
                }
            }
        }
    }
  }
  window.addEventListener('touchstart', onTouchStart, { passive: true })

  function onWindowResize() {
    if (container && renderer && camera) { // Ensure all necessary objects exist
      const width = container.clientWidth;
      const height = container.clientHeight;
      const windowAspect = width / height;
      
      camera.aspect = windowAspect;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
        
        const pixelRatio = renderer.getPixelRatio();
        const fxaaPass = composer.passes.find(pass => 
          pass.material && pass.material.uniforms && 
          pass.material.uniforms['resolution']);
          
        if (fxaaPass) {
          fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
          fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
        }
      }
      
      bounds.x = baseBoundZ * windowAspect; 
      bounds.z = baseBoundZ;                
      
      setupGridHelper(); // Re-evaluate and setup grid helper
      
      if (interactionPlane) interactionPlane.constant = -1.0;
      setupBoxContainerPlanes();
    }
  }
  window.addEventListener('resize', onWindowResize)
  // onWindowResize(); // Call once to set initial bounds correctly - MOVED after OBJ load and initPostProcessing

  const clock = new THREE.Clock()
  const mouseForceMultiplier = config.mouseForceMultiplier;
  const maxInteractionDistance = config.maxInteractionDistance;
  const fieldOfInfluenceDot = config.fieldOfInfluenceDot;
  
  function animate() {
    const deltaTime = clock.getDelta()

    if (orbitControls) { 
        if (config.controls.orbitControlsEnabled) { 
            orbitControls.update()
        } else {
            camera.position.copy(defaultCameraPosition);
            camera.lookAt(cameraTarget);
        }
    }


    if (cannonDebugger) {
      let meshesToUpdate = cannonDebugger.debugMeshes || cannonDebugger._meshes || [];
      if (config.controls.showColliders) { 
        if (meshesToUpdate.length > 0) {
             meshesToUpdate.forEach(mesh => mesh.visible = true);
        }
        cannonDebugger.update();
      } else {
        if (meshesToUpdate.length > 0) {
            meshesToUpdate.forEach(mesh => mesh.visible = false);
        }
      }
    }

    if (interactionPlane) { // Ensure interactionPlane is initialized
        raycaster.setFromCamera(mouseScreenPos, camera)
        const planeIntersects = raycaster.ray.intersectPlane(interactionPlane, currentMouse3D);

        if (firstMove && planeIntersects) {
            previousMouse3D.copy(currentMouse3D)
            firstMove = false
        }

        mouseVelocity3D.subVectors(currentMouse3D, previousMouse3D)
        const mouseSpeed = mouseVelocity3D.length()

        if (instancedMesh && physicsBodies.length > 0) {
            world.step(1 / 60, deltaTime, 3) 

            if (planeIntersects && mouseSpeed > 0.001 && !isMobile) { // Mouse interaction only on non-mobile
                const mouseDirection3D = mouseVelocity3D.clone().normalize()
                const mousePositionCannon = new CANNON.Vec3(currentMouse3D.x, currentMouse3D.y, currentMouse3D.z)

                for (let i = 0; i < physicsBodies.length; i++) {
                    const body = physicsBodies[i]
                    const vectorToBody = new CANNON.Vec3()
                    body.position.vsub(mousePositionCannon, vectorToBody) 
                    const distanceToBody = vectorToBody.length()

                    if (distanceToBody < maxInteractionDistance && distanceToBody > 0.01) {
                        const directionToBody = vectorToBody.unit() 
                        const mouseDirectionCannon = new CANNON.Vec3(mouseDirection3D.x, mouseDirection3D.y, mouseDirection3D.z)
                        
                        const dotProduct = mouseDirectionCannon.dot(directionToBody)

                        if (dotProduct > fieldOfInfluenceDot) { 
                            const forceMagnitude = mouseSpeed * mouseForceMultiplier * dotProduct;
                            const force = mouseDirectionCannon.scale(forceMagnitude);
                            body.applyForce(force, CANNON.Vec3.ZERO); 
                        }
                    }
                }
            }
            
            for (let i = 0; i < numObjects; i++) {
                const body = physicsBodies[i]
                tempMatrix.compose(
                    new THREE.Vector3(body.position.x, body.position.y, body.position.z),
                    new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w),
                    tempScale
                )
                instancedMesh.setMatrixAt(i, tempMatrix)
            }
            instancedMesh.instanceMatrix.needsUpdate = true
        }

        if (planeIntersects) { 
            previousMouse3D.copy(currentMouse3D)
        }
    }


    if (composer) {
      renderer.autoClear = false;
      renderer.clear();
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  let composer;
  let afterimagePass;
  const initPostProcessing = () => {
    if (!renderer || !scene || !camera) return; // Guard against missing objects
    if (composer) return; // Don't re-initialize if already done

    composer = new EffectComposer(renderer);
    
    composer.renderTarget1.texture.format = THREE.RGBAFormat;
    composer.renderTarget2.texture.format = THREE.RGBAFormat;
    
    const renderPass = new RenderPass(scene, camera);
    renderPass.clearAlpha = 0; 
    composer.addPass(renderPass);
    
    afterimagePass = new AfterimagePass(config.postProcessing.motionTrails.persistence); 
    afterimagePass.enabled = config.postProcessing.motionTrails.enabled && !isMobile;
    composer.addPass(afterimagePass);
    
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (container.clientWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (container.clientHeight * pixelRatio);
    fxaaPass.enabled = config.postProcessing.fxaa; 
    composer.addPass(fxaaPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight), 
      config.postProcessing.bloom.strength,  
      config.postProcessing.bloom.radius,  
      config.postProcessing.bloom.threshold  
    );
    bloomPass.enabled = config.postProcessing.bloom.enabled && !isMobile;
    composer.addPass(bloomPass);
    
    const outputPass = new OutputPass();
    outputPass.outputEncoding = THREE.sRGBEncoding; // Corrected from outputEncoding
    outputPass.preserveAlpha = true; 
    composer.addPass(outputPass);
    
  };
  
  // initPostProcessing(); // MOVED to after OBJ load

  // Cleanup function
  // It's good practice to have a way to clean up, though not strictly required by the prompt
  // This could be called if the element is removed from the DOM or the page is navigated away from
  // For now, it's not automatically invoked.
  function cleanupThreeScene() {
    // console.log("Cleaning up Three.js scene..."); // Verbose
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onWindowResize);
    if (renderer) {
        renderer.setAnimationLoop(null); // Stop animation loop
        isAnimationLoopRunning = false; // Reset flag
        if (renderer.domElement && renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
        renderer.dispose();
    }
    if (composer) composer.dispose(); // Dispose composer resources if any custom dispose needed
    
    scene.traverse(object => {
        if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }
    });

    physicsBodies.forEach(body => world.removeBody(body));
    physicsBodies.length = 0;
    cannonPlanes.forEach(body => {
        if (world.bodies.includes(body)) { // Check if body is in world before removing
             world.removeBody(body);
        }
    });
    
    if (envMap) envMap.dispose();
    if (orbitControls) orbitControls.dispose();
    // CannonDebugger does not have a standard dispose, but its meshes are handled by scene traversal
    
    // Clear arrays
    planeHelpers.forEach(h => {
        if (h.geometry) h.geometry.dispose();
        if (h.material) h.material.dispose();
    });
    planeHelpers.length = 0;

    // Clear references
    // instancedMesh, modelMaterial, floorMaterial already handled by scene.traverse
    // rgbeLoader, exrLoader, objLoader don't have dispose methods
  }
  // Example: if (module.hot) { module.hot.dispose(cleanupThreeScene); } // For HMR scenarios

} 