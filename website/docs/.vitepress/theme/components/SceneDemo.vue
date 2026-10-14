<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  OrbitControls,
  Mesh,
  Cube,
  Cylinder,
  Plane,
  Material,
  PhongShader,
  DirectionalLight,
  PointLight,
  AmbientLight,
  Vec3,
  Vec2
} from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

const canvasRef = ref(null);
const isPlaying = ref(true);
const currentShape = ref('cube');
const currentTheme = ref('warm');
const fpsDisplay = ref(60);

let gl = null;
let scene = null;
let camera = null;
let controls = null;
let player = null;
let mainMesh = null;
let floorMesh = null;
let pointLight = null;
let dirLight = null;
let phongMat = null;
let phongMatFloor = null;
let resizeObserver = null;
let rotY = 0;

function createShapeGeometry(name) {
  switch (name) {
    case 'cylinder': return new Cylinder(new Vec2(1.2, 1.2), 2.5, 32);
    case 'cube':
    default:
      return new Cube(new Vec3(2.2, 2.2, 2.2), true);
  }
}

function updateMainShape(name) {
  if (!scene || !gl) return;
  currentShape.value = name;

  let prevRot = null;
  if (mainMesh) {
    if (mainMesh.rotation) {
      prevRot = new Vec3(mainMesh.rotation.x, mainMesh.rotation.y, mainMesh.rotation.z);
    }
    scene.removeMesh(mainMesh);
    mainMesh.destroy();
  }

  const geom = createShapeGeometry(name);
  mainMesh = new Mesh(geom, gl);
  mainMesh.usePhongMaterial({
    ambient: phongMat.ambient,
    diffuse: phongMat.diffuse,
    specular: phongMat.specular,
    shininess: phongMat.shininess
  });
  mainMesh.setPosition(new Vec3(0, 1.2, 0));
  if (name === 'cylinder') {
    mainMesh.setRotation(new Vec3(0.25, rotY, 0.55));
  } else {
    mainMesh.setRotation(new Vec3(0.35, rotY, 0));
  }
  scene.addMesh(mainMesh);
}

function setLightingTheme(themeName) {
  currentTheme.value = themeName;
  if (!dirLight || !pointLight) return;

  if (themeName === 'cyber') {
    dirLight.setDiffuse(new Vec3(0.2, 0.4, 0.9));
    pointLight.setDiffuse(new Vec3(0.9, 0.1, 0.8));
    pointLight.setSpecular(new Vec3(1.0, 0.4, 0.9));
  } else if (themeName === 'emerald') {
    dirLight.setDiffuse(new Vec3(0.2, 0.8, 0.4));
    pointLight.setDiffuse(new Vec3(0.1, 0.9, 0.7));
    pointLight.setSpecular(new Vec3(0.6, 1.0, 0.8));
  } else {
    // Warm default
    dirLight.setDiffuse(new Vec3(0.95, 0.85, 0.75));
    pointLight.setDiffuse(new Vec3(1.0, 0.55, 0.15));
    pointLight.setSpecular(new Vec3(1.0, 0.9, 0.7));
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) return;

  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 420;
  canvas.width = width;
  canvas.height = height;

  gl.viewport(0, 0, width, height);
  gl.clearColor(0.07, 0.09, 0.14, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  scene = new Scene(gl);

  camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
  camera.setPosition(new Vec3(0, 3.2, 6.8));
  camera.lookAt(new Vec3(0, 0.8, 0));

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3.5;
  controls.maxDistance = 16.0;

  // Materials with balanced ambient and diffuse
  phongMat = new Material({
    ambient: new Vec3(0.42, 0.38, 0.35),
    diffuse: new Vec3(0.95, 0.55, 0.15),
    specular: new Vec3(1.0, 0.9, 0.8),
    shininess: 48.0
  });

  phongMatFloor = new Material({
    ambient: new Vec3(0.35, 0.38, 0.45),
    diffuse: new Vec3(0.48, 0.55, 0.65),
    specular: new Vec3(0.3, 0.35, 0.4),
    shininess: 16.0
  });

  // Main shape
  updateMainShape('cube');

  // Floor
  floorMesh = new Mesh(new Plane(new Vec2(16, 16), new Vec2(8, 8)), gl);
  floorMesh.usePhongMaterial({
    ambient: phongMatFloor.ambient,
    diffuse: phongMatFloor.diffuse,
    specular: phongMatFloor.specular,
    shininess: phongMatFloor.shininess
  });
  floorMesh.setPosition(new Vec3(0, -0.6, 0));
  scene.addMesh(floorMesh);

  // Fixed studio lights
  // 1. Key Directional sunlight shining DOWNWARD from upper right (-0.6, -1.0, -0.4)
  dirLight = new DirectionalLight(new Vec3(-0.6, -1.0, -0.4));
  dirLight.setDiffuse(new Vec3(1.0, 0.95, 0.90));
  dirLight.setSpecular(new Vec3(0.7, 0.7, 0.7));
  scene.addLight(dirLight);

  // 2. Fixed warm point fill light from front upper right
  pointLight = new PointLight(new Vec3(3.0, 3.0, 2.5));
  pointLight.setDiffuse(new Vec3(1.0, 0.65, 0.25));
  pointLight.setSpecular(new Vec3(1.0, 0.9, 0.7));
  pointLight.setLinearAttenuation(0.06);
  pointLight.setQuadraticAttenuation(0.015);
  scene.addLight(pointLight);

  // 3. Ambient light to softly illuminate shadows and ensure full scene visibility
  const ambientLight = new AmbientLight(new Vec3(0.45, 0.48, 0.55));
  scene.addLight(ambientLight);

  rotY = 0;
  let frameCount = 0;
  let lastFpsTime = performance.now();

  player = new Player((delta) => {
    controls.update();

    if (isPlaying.value) {
      const dt = Math.min(delta, 0.05);
      rotY += dt * 0.75;

      if (mainMesh) {
        if (currentShape.value === 'cylinder') {
          mainMesh.setRotation(new Vec3(0.25, rotY, 0.55));
        } else {
          mainMesh.setRotation(new Vec3(0.35, rotY, 0));
        }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    scene.render(camera);

    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 500) {
      fpsDisplay.value = Math.round((frameCount * 1000) / (now - lastFpsTime));
      frameCount = 0;
      lastFpsTime = now;
    }
  });

  // Render first frame immediately
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  scene.render(camera);

  if (player && typeof player.start === 'function') {
    player.start();
  } else if (player && typeof player.play === 'function') {
    player.play();
  }

  resizeObserver = new ResizeObserver(() => {
    if (!canvas || !scene || !gl) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      camera.setProjectionMatrix(new Vec2(w, h));
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      scene.render(camera);
    }
  });
  resizeObserver.observe(canvas);
});

onBeforeUnmount(() => {
  player?.stop();
  controls?.dispose();
  resizeObserver?.disconnect();
  scene?.clearMeshes();
});
</script>

<template>
  <div class="roostr-demo">
    <div class="roostr-demo-toolbar">
      <div class="roostr-btn-group">
        <button
          class="roostr-btn"
          :class="{ active: isPlaying }"
          @click="togglePlay"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>

        <button
          class="roostr-btn"
          :class="{ active: currentShape === 'cube' }"
          @click="updateMainShape('cube')"
        >
          Cube
        </button>
        <button
          class="roostr-btn"
          :class="{ active: currentShape === 'cylinder' }"
          @click="updateMainShape('cylinder')"
        >
          Cylinder
        </button>
      </div>

      <div class="roostr-btn-group">
        <button
          class="roostr-btn"
          :class="{ active: currentTheme === 'warm' }"
          @click="setLightingTheme('warm')"
        >
          Amber Sun
        </button>
        <button
          class="roostr-btn"
          :class="{ active: currentTheme === 'cyber' }"
          @click="setLightingTheme('cyber')"
        >
          Cyber Neon
        </button>
        <button
          class="roostr-btn"
          :class="{ active: currentTheme === 'emerald' }"
          @click="setLightingTheme('emerald')"
        >
          Emerald
        </button>
      </div>

      <div class="roostr-stats">
        <span class="roostr-badge active">{{ fpsDisplay }} FPS</span>
        <span class="roostr-badge">WebGL 3D</span>
        <span class="roostr-badge">Drag to Orbit</span>
      </div>
    </div>

    <div class="roostr-canvas-wrap">
      <canvas ref="canvasRef" class="roostr-canvas" aria-label="Interactive RoostR.js 3D WebGL scene"></canvas>
      <div class="roostr-canvas-overlay">
        <span>Click & drag to rotate camera • Scroll to zoom</span>
      </div>
    </div>
  </div>
</template>
