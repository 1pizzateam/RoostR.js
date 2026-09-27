<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  OrbitControls,
  Mesh,
  SubMesh,
  Cube,
  Sphere,
  Hemisphere,
  Cylinder,
  Plane,
  Material,
  PhongShader,
  DirectionalLight,
  AmbientLight,
  Vec3
} from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

const canvasRef = ref(null);
const currentShape = ref('sphere');
const isWireframe = ref(false);
const autoRotate = ref(true);

let gl = null;
let scene = null;
let camera = null;
let controls = null;
let player = null;
let mesh = null;
let dirLight = null;
let material = null;
let resizeObserver = null;

function getGeometry(shape) {
  switch (shape) {
    case 'cube': return new Cube(2.0);
    case 'hemisphere': return new Hemisphere(1.4, 24, 16);
    case 'cylinder': return new Cylinder(1.1, 1.1, 2.4, 28);
    case 'plane': return new Plane(3.0, 3.0, 8, 8);
    case 'sphere':
    default:
      return new Sphere(1.4, 28, 20);
  }
}

function createWireframeGeometry(geom) {
  const edgeSet = new Set();
  const lineIndices = [];
  const ind = geom.indices;

  if (ind && ind.length > 0) {
    for (let i = 0; i < ind.length; i += 3) {
      const a = ind[i];
      const b = ind[i + 1];
      const c = ind[i + 2];
      for (const [u, v] of [[a, b], [b, c], [c, a]]) {
        const key = u < v ? `${u}_${v}` : `${v}_${u}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          lineIndices.push(u, v);
        }
      }
    }
  }

  let uvs = geom.uvs;
  if (!uvs && geom.vertices) {
    uvs = new Float32Array((geom.vertices.length / 3) * 2);
  }

  return {
    vertices: geom.vertices,
    normals: geom.normals,
    uvs: uvs,
    indices: new Uint16Array(lineIndices),
    itemSize: geom.itemSize || 3,
    primitive: 'LINES',
    subMeshes: [new SubMesh(0, lineIndices.length)]
  };
}

function selectShape(shape) {
  currentShape.value = shape;
  if (!gl || !scene) return;

  let prevRot = null;
  if (mesh) {
    if (mesh.rotation) {
      prevRot = [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z];
    }
    scene.removeMesh(mesh);
    mesh.destroy();
  }

  const baseGeom = getGeometry(shape);
  const geom = isWireframe.value ? createWireframeGeometry(baseGeom) : baseGeom;
  mesh = new Mesh(geom, gl);
  mesh.usePhongMaterial({
    ambient: material.ambient,
    diffuse: material.diffuse,
    specular: material.specular,
    shininess: material.shininess
  });
  if (prevRot) {
    mesh.setRotation(prevRot[0], prevRot[1], prevRot[2]);
  }
  scene.addMesh(mesh);
}

function toggleWireframe() {
  isWireframe.value = !isWireframe.value;
  selectShape(currentShape.value);
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
  gl.clearColor(0.08, 0.1, 0.14, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  scene = new Scene(gl);

  camera = new PerspectiveCamera(45, 0.1, 100, gl);
  camera.setPosition(0, 1.8, 5.0);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  material = new Material({
    ambient: new Vec3(0.3, 0.32, 0.4),
    diffuse: new Vec3(0.35, 0.7, 0.95),
    specular: new Vec3(1.0, 1.0, 1.0),
    shininess: 40.0
  });

  dirLight = new DirectionalLight(new Vec3(-0.5, -0.8, -0.5));
  dirLight.setDiffuse(1.0, 0.95, 0.9);
  dirLight.setSpecular(0.8, 0.8, 0.8);
  scene.addLight(dirLight);

  const ambientLight = new AmbientLight(new Vec3(0.35, 0.38, 0.45));
  scene.addLight(ambientLight);

  selectShape('sphere');

  let rotY = 0;
  player = new Player((delta) => {
    controls.update();

    if (autoRotate.value && mesh) {
      rotY += delta * 0.8;
      if (currentShape.value === 'cylinder') {
        mesh.setRotation(0.25, rotY, 0.55);
      } else {
        mesh.setRotation(0.3, rotY, 0);
      }
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
      camera.setProjectionMatrix([0, 0, nw, nh]);
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
          v-for="s in ['sphere', 'cube', 'cylinder', 'hemisphere', 'plane']"
          :key="s"
          class="roostr-btn"
          :class="{ active: currentShape === s }"
          @click="selectShape(s)"
        >
          {{ s.charAt(0).toUpperCase() + s.slice(1) }}
        </button>
      </div>

      <div class="roostr-btn-group">
        <button
          class="roostr-btn"
          :class="{ active: isWireframe }"
          @click="toggleWireframe"
        >
          {{ isWireframe ? 'Solid' : 'Wireframe' }}
        </button>
        <button
          class="roostr-btn"
          :class="{ active: autoRotate }"
          @click="autoRotate = !autoRotate"
        >
          {{ autoRotate ? 'Pause' : 'Spin' }}
        </button>
      </div>
    </div>

    <div class="roostr-canvas-wrap">
      <canvas ref="canvasRef" class="roostr-canvas" aria-label="3D Geometry Inspector"></canvas>
      <div class="roostr-canvas-overlay">
        <span>Click & drag to orbit 3D geometry</span>
      </div>
    </div>
  </div>
</template>
