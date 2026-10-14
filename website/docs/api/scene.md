# Scene

The central container orchestrating all renderable meshes, dynamic lights, camera passes, viewing frustum culling, and spatial raycasting.

```javascript
import { Scene, PerspectiveCamera, Mesh, Cube, PhongShader, DirectionalLight, Vec3, Vec2 } from '@1pizzateam/roostr';

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: new Vec2(800, 600),
  clearColor: new Vec3(0.08, 0.1, 0.14)
});
```

---

## Constructor

Create a new `Scene` instance.

```typescript
new Scene(optionsOrContext?: ISceneOptions | WebGLRenderingContext)
```

### Options (`ISceneOptions`)

| Name | Type | Description |
| :--- | :--- | :--- |
| `options.canvasId` | `string \| HTMLCanvasElement` | Canvas element or element ID. |
| `options.context` | `WebGLRenderingContext` | The WebGL rendering context. |
| `options.viewport` | `Vec2 \| { position?: Vec2; size: Vec2 }` | Viewport dimensions `Vec2(width, height)` or `{ position?, size }`. |
| `options.clearColor` | `Vec3` | Background clear RGB color. |
| `options.ambientColor` | `Vec3` | Global ambient light factor (default `[0, 0, 0]`). |
| `options.fog` | `{ color: Vec3; near: number; far: number } \| null` | Optional distance fog settings. |
| `options.cullFace` | `'BACK' \| 'FRONT' \| 'NONE'` | Face culling mode (default `'BACK'`). |
| `options.frontFace` | `'CCW' \| 'CW'` | Front-face vertex winding (default `'CCW'`). |
| `options.depthTest` | `boolean` | Whether to enable WebGL depth testing (default `true`). |
| `options.enableFrustumCulling` | `boolean` | When true, automatically culls meshes outside camera frustum (default `false`). |

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
const rect = canvas.getBoundingClientRect();
const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
const ndcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

const ray = camera.getRay(new Vec2(ndcX, ndcY));
const hits = scene.raycast(ray);

if (hits.length > 0) {
  const closest = hits[0];
  console.log(`Hit mesh at distance ${closest.distance}`, closest.mesh);
}
```

### `setSize(size: Vec2): void`

Updates the viewport dimensions and underlying canvas size:

```javascript
scene.setSize(new Vec2(window.innerWidth, window.innerHeight));
```

### `getSize(target?: Vec2): Vec2`

Returns the current canvas resolution into an optional target `Vec2`.

### `setViewport(size: Vec2, position?: Vec2): void`

Update the WebGL viewport dimensions and optional offset.

### `setClearColor(color: Vec3, alpha: number = 1.0): void`

Update the scene background clear RGB color and alpha.

### `setFog(color: Vec3, near: number, far: number = 1000): this`

Enables atmospheric linear distance fog for built-in `PhongShader` meshes.

### `clearFog(): this`

Disables distance fog.

### `getCanvas(): HTMLCanvasElement | null`

Returns the canvas element attached to this scene.

### `destroy(destroyMeshes: boolean = false): void`

Cleans up scene resources, deletes renderer state, and optionally calls `destroy()` on all registered meshes.
