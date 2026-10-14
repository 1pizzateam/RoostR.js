# Overview

**RoostR.js** is a fast, modular WebGL 3D rendering engine written in TypeScript. It provides a structured, modern pipeline to develop 3D graphics, games, architectural previews, and interactive visualizations in desktop and mobile web browsers without unnecessary boilerplate.

## Key Features

- **Hardware Accelerated**: Direct WebGL rendering with optimized buffer uploads (`ARRAY_BUFFER`, `ELEMENT_ARRAY_BUFFER`), VAO-like attribute management, and minimal driver state thrashing.
- **Hierarchical Scene Graph**: Meshes support parenting with recursive transformation matrices (`modelMatrix` $\times$ `parent.worldMatrix`), enabling articulated models, robotic arms, and celestial systems.
- **Spock Mathematics**: Built from the ground up on top of [`@1pizzateam/spock`](https://1pizzateam.github.io/Spock.js/) 3D vectors (`Vec3`), quaternions (`Quat`), 4x4 matrices (`Mat4`), affine transforms (`Mat4x3`), and 3x3 normal matrices (`Mat3`).
- **Comprehensive Lighting System**:
  - **Directional Light**: Infinite parallel sunlight with direction, diffuse, and specular color.
  - **Point Light**: Radial light with physical constant, linear, and quadratic falloff attenuation.
  - **Spot Light**: Conical spotlights with inner beam cutoff angle and falloff exponent.
  - **Ambient Light**: Flat ambient environment illumination.
  - **Pre-flattened GPU Buffers**: Zero-allocation typed array transfers (`Float32Array`) during uniform binding.
- **Built-in Shaders & Materials**:
  - `PhongShader`: Full Blinn-Phong lighting with diffuse, ambient, specular reflections, camera specular highlights, and real-time distance fog.
  - `BasicShader`: Unlit textured or flat-color material for UI, billboards, and background geometries.
  - `NormalShader`: Diagnostic shader visualizing vertex normals in world/view space.
- **Procedural Geometry Primitives**: Instant generation of `Cube`, `Sphere`, `Hemisphere`, `Cylinder`, `Plane`, `Quad`, `FullscreenQuad`, `MultiQuad`, and `Line`.
- **Custom Meshes & SubMeshes**: Define arbitrary vertex buffers, UVs, normal vectors, indexed triangles, and compute smooth vertex normals on the fly (`computeVertexNormals()`).
- **Frustum Culling**: Zero-allocation 6-plane viewing frustum culling skips non-visible meshes before GPU submission.
- **Raycasting & Mouse Picking**: Convert normalized device coordinates (screen mouse coordinates) into world-space rays (`camera.getRay()`) and query intersections against meshes (`mesh.raycast()`).
- **Post-Processing & RenderTarget**: Render offscreen scenes directly into framebuffer textures for full-screen bloom, blur, depth textures, or multi-pass effects.
- **Smooth OrbitControls**: Full mouse and touch orbital camera navigation with inertia damping, polar angle limits, and zoom constraints.

---

## Engine Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                                Scene                                   │
│  - Mesh registry & scene graph hierarchy traversal                     │
│  - Camera management (Perspective & Orthographic)                      │
│  - Multi-light collection & GPU array flattening (Lights)              │
│  - Viewing frustum culling (Scene.cullMesh)                            │
│  - Solid pass (Scene.render) & Alpha depth sort (renderBlended)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼──────────────────────────┐
        ▼                           ▼                          ▼
┌───────────────┐          ┌─────────────────┐        ┌──────────────────┐
│     Mesh      │          │    Lighting     │        │     Camera       │
│ - Geometry    │─────────▶│ - Directional   │◀───────│ - Perspective    │
│ - Material    │          │ - Point Lights  │        │ - Orthographic   │
│ - Program     │          │ - Spotlights    │        │ - OrbitControls  │
│ - Bounds & Ray│          │ - Ambient Light │        │ - Frustum & Ray  │
└───────────────┘          └─────────────────┘        └──────────────────┘
        │
        ▼
┌───────────────┐
│ WebGL Pipeline│
│ - Shaders     │
│ - Uniforms    │
│ - VBO / IBO   │
│ - DrawArrays  │
│ - DrawElements│
└───────────────┘
```

---

## Quick Example

```javascript
import {
  Scene,
  PerspectiveCamera,
  Mesh,
  Sphere,
  PhongShader,
  Material,
  DirectionalLight,
  PointLight,
  Vec3,
  Vec2
} from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

// 1. Setup WebGL canvas and scene
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: new Vec2(800, 600),
  clearColor: new Vec3(0.05, 0.07, 0.1)
});

// 2. Camera setup
const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
camera.setPosition(new Vec3(0, 2, 5));
camera.lookAt(new Vec3(0, 0, 0));

// 3. Create a sphere mesh
const sphere = new Mesh(new Sphere(1.0, 32, 24), gl);
sphere.addProgram(PhongShader.create(gl));
sphere.addMaterial(new Material({
  ambient: new Vec3(0.2, 0.2, 0.2),
  diffuse: new Vec3(0.9, 0.45, 0.1),
  specular: new Vec3(1.0, 1.0, 1.0),
  shininess: 64.0
}));
scene.addMesh(sphere);

// 4. Add lighting
const sun = new DirectionalLight(new Vec3(0.5, 1.0, 0.5));
sun.setDiffuse(new Vec3(0.9, 0.9, 0.9));
scene.addLight(sun);

const point = new PointLight(new Vec3(2, 2, 1));
point.setDiffuse(new Vec3(1.0, 0.6, 0.2));
scene.addLight(point);

// 5. Render loop
const loop = new Player((delta) => {
  sphere.rotateY(delta * 0.5);
  scene.render(camera);
});
loop.play();
```
