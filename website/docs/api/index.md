# API Overview

All public engine classes, shaders, and utilities are named ESM exports from `@1pizzateam/roostr`. Mathematical primitives (`Vec3`, `Vec2`, `Mat4`, `Mat4x3`, `Mat3`, `Quat`, `Utils`) are re-exported directly from [`@1pizzateam/spock`](https://1pizzateam.github.io/Spock.js/).

```javascript
import {
  Scene,
  Renderer,
  RenderTarget,
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControls,
  Node,
  Mesh,
  QuadBatch,
  Sprite,
  Material,
  Texture,
  Cube,
  Sphere,
  DirectionalLight,
  PointLight,
  SpotLight,
  PhongShader,
  Vec3
} from '@1pizzateam/roostr';
```

---

## Module Groups

### Scene & Core
- [Scene](/api/scene): The top-level 3D world orchestrator managing meshes, lights, camera passes, fog, and culling.
- [Node](/api/node): Hierarchical scene-graph base class managing local/world transforms, quaternions, parenting, and bounds.
- [Mesh](/api/mesh): The primary renderable scene node extending `Node` with WebGL buffers, materials, textures, and shaders.
- [Material](/api/material): Optical surface appearance parameters (ambient, diffuse, specular, shininess).
- [Texture](/api/texture): Texture loading, NPOT wrapping, mipmap generation, and sub-image buffer updates.

### Cameras & Controls
- [PerspectiveCamera](/api/perspective-camera): 3D perspective projection camera with FOV, aspect ratio, near/far clipping, and matrix caching.
- [OrthographicCamera](/api/orthographic-camera): Parallel projection camera for 2D, isometric, and orthographic architectural views.
- [OrbitControls](/api/orbit-controls): Smooth orbital camera controller with touch/mouse rotation, pan, and distance damping.

### Lighting
- [Lights Overview](/api/lights): The collection manager that compiles and flattens scene lights into GPU-ready typed array buffers.
- [DirectionalLight](/api/directional-light): Parallel directional light representing infinite sun or moon light.
- [PointLight](/api/point-light): Omnidirectional point light with distance attenuation coefficients.
- [SpotLight](/api/spot-light): Conical spotlight with directional focus, cutoff angle, and exponent falloff.
- [AmbientLight](/api/ambient-light): Base ambient scene illumination.

### Geometry
- [Primitives](/api/geometry): Procedural primitives: `Cube`, `Sphere`, `Hemisphere`, `Cylinder`, `Plane`, `Quad`, `FullscreenQuad`, `MultiQuad`, `Line`.
- [Procedural Models](/api/models): Built-in articulated procedural models `VWing` (starfighter) and `Cannon` (defense turret).
- [CustomMesh & SubMesh](/api/custom-mesh): Custom vertex buffers, normal computation, and submesh draw calls.
- [QuadBatch](/api/quad-batch): Dynamic batched 3D quad streaming in a single draw call.
- [Sprite](/api/sprite): Flat image that faces the camera, with sprite-sheet frames, tint, alpha cutoff and fog.

### Spatial Math & Culling
- [BoundingBox](/api/box3): 3D Axis-Aligned Bounding Box (AABB) with Arvo's $O(1)$ matrix transform.
- [BoundingSphere](/api/sphere): 3D bounding sphere for fast radial collision checks and distance sorting.
- [Frustum Culling](/api/frustum): 6-plane viewing frustum culler for skipping offscreen geometry.
- [Ray & Intersections](/api/ray): World-space 3D ray with ray-box, ray-sphere, and ray-triangle intersection routines.

### Renderer & Shaders
- [Renderer](/api/renderer): Global WebGL wrapper managing state, viewport, culling, and clearing.
- [RenderTarget](/api/render-target): Offscreen framebuffer texture target for render-to-texture and post-processing.
- [Shaders & Programs](/api/shaders): `PhongShader`, `BasicShader`, `NormalShader`, `Shader`, and `Program`.
