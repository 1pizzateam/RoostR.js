<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  OrbitControls,
  Mesh,
  Sphere,
  Plane,
  Material,
  PhongShader,
  DirectionalLight,
  PointLight,
  SpotLight,
  AmbientLight,
  Vec3,
  Vec2
} from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

const canvasRef = ref(null);
const enableDir = ref(true);
const enablePoint = ref(true);
const enableSpot = ref(false);
const shininessVal = ref(64);

let gl = null;
let scene = null;
let camera = null;
let controls = null;
let player = null;
let sphereMesh = null;
let floorMesh = null;
let dirLight = null;
let pointLight = null;
let spotLight = null;
let sphereMat = null;
let resizeObserver = null;

function updateLights() {
  if (!dirLight || !pointLight || !spotLight) return;
  dirLight.setDiffuse(enableDir.value ? new Vec3(0.9, 0.85, 0.8) : new Vec3(0, 0, 0));
  pointLight.setDiffuse(enablePoint.value ? new Vec3(1.0, 0.5, 0.2) : new Vec3(0, 0, 0));
  spotLight.setDiffuse(enableSpot.value ? new Vec3(0.2, 0.7, 1.0) : new Vec3(0, 0, 0));
}

function updateShininess(val) {
  shininessVal.value = Number(val);
  if (sphereMat) {
    sphereMat.setShininess(shininessVal.value);
  }
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) return;

  const w = canvas.clientWidth || 600;
  const h = canvas.clientHeight || 340;
  canvas.width = w;
  canvas.height = h;

  gl.viewport(0, 0, w, h);
  gl.clearColor(0.06, 0.08, 0.12, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.frontFace(gl.CW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  scene = new Scene(gl);

  camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
  camera.setPosition(new Vec3(0, 2.5, 5.5));
  camera.lookAt(new Vec3(0, 0.4, 0));

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  sphereMat = new Material({
    ambient: new Vec3(0.2, 0.2, 0.2),
    diffuse: new Vec3(0.85, 0.45, 0.15),
    specular: new Vec3(1.0, 0.95, 0.9),
    shininess: shininessVal.value
  });

  const floorMat = new Material({
    ambient: new Vec3(0.1, 0.1, 0.15),
    diffuse: new Vec3(0.3, 0.35, 0.45),
    specular: new Vec3(0.5, 0.5, 0.5),
    shininess: 16.0
  });

  sphereMesh = new Mesh(new Sphere(1.2, 32, 24), gl);
  sphereMesh.usePhongMaterial({
    ambient: sphereMat.ambient,
    diffuse: sphereMat.diffuse,
    specular: sphereMat.specular,
    shininess: sphereMat.shininess
  });
  sphereMat = sphereMesh.materials[0];
  sphereMesh.setPosition(new Vec3(0, 0.8, 0));
  scene.addMesh(sphereMesh);

  floorMesh = new Mesh(new Plane(new Vec2(12, 12), new Vec2(6, 6)), gl);
  floorMesh.usePhongMaterial({
    ambient: floorMat.ambient,
    diffuse: floorMat.diffuse,
    specular: floorMat.specular,
    shininess: floorMat.shininess
  });
  floorMesh.setPosition(new Vec3(0, -0.4, 0));
  scene.addMesh(floorMesh);

  // Directional Light pointing downward
  dirLight = new DirectionalLight(new Vec3(-0.6, -1.0, -0.4));
  dirLight.setDiffuse(new Vec3(0.9, 0.85, 0.8));
  dirLight.setSpecular(new Vec3(0.8, 0.8, 0.8));
  scene.addLight(dirLight);

  // Ambient Light for soft fill in shadows
  const ambientLight = new AmbientLight(new Vec3(0.3, 0.32, 0.38));
  scene.addLight(ambientLight);

  // Point Light
  pointLight = new PointLight(new Vec3(2.5, 1.8, 2.0));
  pointLight.setDiffuse(new Vec3(1.0, 0.5, 0.2));
  pointLight.setSpecular(new Vec3(1.0, 0.8, 0.6));
  pointLight.setLinearAttenuation(0.15);
  pointLight.setQuadraticAttenuation(0.05);
  scene.addLight(pointLight);

  // Spot Light
  spotLight = new SpotLight(new Vec3(0, 4.0, 0));
  spotLight.setDirection(new Vec3(0, -1, 0));
  spotLight.setCutoff(0.85); // cone cutoff
  spotLight.setExponent(16.0);
  spotLight.setDiffuse(new Vec3(0, 0, 0)); // initial disabled
  spotLight.setSpecular(new Vec3(0.8, 0.9, 1.0));
  scene.addLight(spotLight);

  let orbitAngle = 0;
  player = new Player((delta) => {
    controls.update();

    orbitAngle += delta * 1.2;
    if (pointLight && enablePoint.value) {
      pointLight.setPosition(new Vec3(Math.cos(orbitAngle) * 2.8, 1.6, Math.sin(orbitAngle) * 2.8));
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    scene.render(camera);
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
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    if (nw > 0 && nh > 0 && (canvas.width !== nw || canvas.height !== nh)) {
      canvas.width = nw;
      canvas.height = nh;
      gl.viewport(0, 0, nw, nh);
      camera.setProjectionMatrix(new Vec2(nw, nh));
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
          :class="{ active: enableDir }"
          @click="enableDir = !enableDir; updateLights();"
        >
          Directional Sun: {{ enableDir ? 'ON' : 'OFF' }}
        </button>
        <button
          class="roostr-btn"
          :class="{ active: enablePoint }"
          @click="enablePoint = !enablePoint; updateLights();"
        >
          Point Light: {{ enablePoint ? 'ON' : 'OFF' }}
        </button>
        <button
          class="roostr-btn"
          :class="{ active: enableSpot }"
          @click="enableSpot = !enableSpot; updateLights();"
        >
          Spotlight: {{ enableSpot ? 'ON' : 'OFF' }}
        </button>
      </div>

      <div class="roostr-btn-group" style="align-items: center; gap: 8px;">
        <span style="font-size: 12px; color: var(--vp-c-text-2);">Shininess:</span>
        <button
          v-for="s in [16, 48, 96, 160]"
          :key="s"
          class="roostr-btn"
          :class="{ active: shininessVal === s }"
          @click="updateShininess(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <div class="roostr-canvas-wrap">
      <canvas ref="canvasRef" class="roostr-canvas" aria-label="Interactive Lighting Studio"></canvas>
      <div class="roostr-canvas-overlay">
        <span>Phong shading with dynamic lights • Orbit to observe specular specular highlights</span>
      </div>
    </div>
  </div>
</template>
