# Scene

The central container orchestrating all renderable meshes, dynamic lights, camera passes, viewing frustum culling, and spatial raycasting.

```javascript
import { Scene, PerspectiveCamera, Mesh, Cube, PhongShader, DirectionalLight, Vec3 } from '@1pizzateam/roostr';

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: { x: 0, y: 0, width: 800, height: 600 },
  clearColor: new Vec3(0.08, 0.1, 0.14)
});
```

---

## Constructor

Create a new `Scene` instance.

```typescript
new Scene(options: ISceneOptions)
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `options.canvasId` | `string \| HTMLCanvasElement` | Canvas element or element ID. |
| `options.context` | `WebGLRenderingContext` | The WebGL rendering context. |
| `options.viewport` | `IRect` | Viewport rectangle `{ x, y, width, height }`. |
| `options.clearColor` | `Vec3 \| number[]` | Background clear color `[r, g, b]`. |
| `options.cullFace` | `'BACK' \| 'FRONT' \| 'NONE'` | Face culling mode (default `'BACK'`). |
| `options.frontFace` | `'CCW' \| 'CW'` | Front-face vertex winding (default `'CCW'`). |
| `options.depthTest` | `boolean` | Whether to enable WebGL depth testing (default `true`). |

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `meshes` | `Mesh[]` | Array of registered root meshes in the scene. |
| `nbMeshes` | `number` | Count of registered root meshes. |
| `lights` | `Lights` | The scene's multi-light manager. |
| `ambientColor` | `Vec3` | Global ambient light color factor (default `[0.2, 0.2, 0.2]`). |
| `fog` | `IFogConfig \| null` | Optional distance fog `{ enabled, color, near, far }`. |
| `frustumCulling` | `boolean` | When true (default), automatically culls meshes outside the camera frustum. |
| `renderer` | `Renderer` | The low-level WebGL renderer instance. |

---

## Methods

### `addMesh(mesh: Mesh): void`

Add a `Mesh` into the scene. Duplicate mesh additions are safely ignored.

```javascript
scene.addMesh(cubeMesh);
```

### `removeMesh(mesh: Mesh): boolean`

Remove a previously added `Mesh` from the scene. Returns `true` if found and removed.

```javascript
scene.removeMesh(cubeMesh);
```

### `clearMeshes(): void`

Remove all registered meshes from the scene.

### `addLight(light: AnyLight): void`

Register a `DirectionalLight`, `PointLight`, `SpotLight`, or `AmbientLight`.

```javascript
scene.addLight(directionalLight);
scene.addLight(pointLight);
```

### `removeLight(light: AnyLight): boolean`

Remove a light from the scene.

### `clearLights(): void`

Clear all lights from the scene.

### `render(camera: Camera): void`

Render all active solid meshes matching the opaque pass using the camera's view and projection matrices. If `frustumCulling` is enabled, meshes outside the camera frustum are culled before draw call dispatch.

```javascript
scene.render(camera);
```

### `renderBlended(camera: Camera): void`

Sorts transparent/blended meshes back-to-front relative to camera depth and renders them with alpha blending enabled.

```javascript
scene.renderBlended(camera);
```

### `raycast(ray: Ray): { mesh: Mesh, distance: number, point: Vec3 }[]`

Cast a 3D ray through all meshes in the scene and return an array of hit results sorted from nearest to furthest.

```javascript
const ray = camera.getRay(mouseX, mouseY, width, height);
const hits = scene.raycast(ray);

if (hits.length > 0) {
  const closest = hits[0];
  console.log(`Hit mesh ${closest.mesh.id} at distance ${closest.distance}`);
}
```

### `setViewport(x: number, y: number, width: number, height: number): void`

Update the WebGL viewport dimensions.

### `setClearColor(r: number, g: number, b: number, a?: number): void`

Update the scene background clear color.
