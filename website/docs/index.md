---
layout: home

hero:
  name: RoostR.js
  text: WebGL 3D Engine
  tagline: A lightweight, modular WebGL 3D rendering engine in TypeScript with Spock math integration, scene graph hierarchy, and shader pipeline.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/overview
    - theme: alt
      text: API Reference
      link: /api/

features:
  - icon: ⚡
    title: Hardware Accelerated WebGL
    details: Clean, modular abstractions over native WebGL buffers, state caching, and multi-program draw dispatch.
  - icon: 📐
    title: Spock Math Integration
    details: Native integration with @1pizzateam/spock vectors (Vec3, Vec2), matrices (Mat4, Mat4x3, Mat3), and quaternions.
  - icon: 💡
    title: Dynamic Multi-Light Pipeline
    details: Support for Directional sunlight, Point lights with quadratic attenuation, conical Spotlights, and Ambient illumination.
  - icon: 🎨
    title: Phong, Basic & Normal Shaders
    details: Built-in GLSL shaders with specular shininess, diffuse color, ambient reflections, and normal matrix visualization.
  - icon: 📦
    title: Rich Procedural Primitives
    details: Instant procedural generation for Cube, Sphere, Hemisphere, Cylinder, Plane, Quad, MultiQuad, Line, and CustomMesh.
  - icon: 🎥
    title: Cameras & OrbitControls
    details: Perspective and Orthographic projection cameras with view-matrix caching and smooth desktop/touch orbital damping controls.
  - icon: 🎯
    title: Frustum Culling & Raycasting
    details: Zero-allocation 6-plane viewing frustum culling, 3D spatial bounds (AABB and Sphere), and screen-to-world raycasting.
  - icon: 🖼️
    title: RenderTarget & Textures
    details: Offscreen framebuffers for render-to-texture, post-processing filters, NPOT textures, and mipmap generation.
---

<SceneDemo />

```javascript
import {
  Scene,
  PerspectiveCamera,
  OrbitControls,
  Mesh,
  Cube,
  PhongShader,
  Material,
  DirectionalLight,
  PointLight,
  Vec3,
  Vec2
} from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

// 1. Initialize canvas and 3D scene
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: new Vec2(canvas.width, canvas.height),
  clearColor: new Vec3(0.08, 0.1, 0.14)
});

// 2. Set up perspective camera and interactive orbit controls
const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
camera.setPosition(new Vec3(0, 3, 6));
camera.lookAt(new Vec3(0, 0, 0));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 3. Create a 3D Mesh with Phong material
const cubeMesh = new Mesh(new Cube(new Vec3(2.0, 2.0, 2.0)), gl);
cubeMesh.addProgram(PhongShader.create(gl));
cubeMesh.addMaterial(new Material({
  ambient: new Vec3(0.2, 0.2, 0.2),
  diffuse: new Vec3(0.95, 0.55, 0.15),
  specular: new Vec3(1.0, 1.0, 1.0),
  shininess: 48.0
}));
scene.addMesh(cubeMesh);

// 4. Add lights (directional sunlight + warm fill point light + ambient)
const sunLight = new DirectionalLight(new Vec3(-0.6, -1.0, -0.4));
sunLight.setDiffuse(new Vec3(0.95, 0.88, 0.80));
scene.addLight(sunLight);

const pointLight = new PointLight(new Vec3(2.5, 2.8, 2.2));
pointLight.setDiffuse(new Vec3(1.0, 0.60, 0.20));
scene.addLight(pointLight);

const ambientLight = new AmbientLight(new Vec3(0.35, 0.38, 0.45));
scene.addLight(ambientLight);

// 5. Run render loop with LoopR
const player = new Player((delta) => {
  controls.update();
  cubeMesh.rotateY(delta * 0.8);
  scene.render(camera);
});
player.start();
```
