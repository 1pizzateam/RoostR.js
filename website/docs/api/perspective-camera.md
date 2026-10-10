# PerspectiveCamera

A 3D perspective projection camera with field-of-view, aspect ratio, depth clipping planes, and inverted view-matrix caching.

```javascript
import { PerspectiveCamera, Vec3, Vec2 } from '@1pizzateam/roostr';

const camera = new PerspectiveCamera(45, gl, 0.1, 1000);
camera.setPosition(0, 5, 10);
camera.lookAt(0, 0, 0);
```

---

## Constructor

```typescript
new PerspectiveCamera(
  fov: number,
  contextOrNear?: WebGLRenderingContext | number | null,
  zFarOrNear?: number,
  contextOrFar?: WebGLRenderingContext | number | null
)
```

Supports flexible parameter orderings:
- `new PerspectiveCamera(fov, context, zNear = 0.1, zFar = 1000)`
- `new PerspectiveCamera(fov, zNear = 0.1, zFar = 1000, context?)`

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fov` | `number` | — | Vertical field of view in degrees. |
| `context` | `WebGLRenderingContext` | `null` | The active WebGL context for aspect ratio resolution. |
| `zNear` | `number` | `0.1` | Near clipping distance. |
| `zFar` | `number` | `1000` | Far clipping distance. |

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `projectionMatrix` | `Mat4` | 4x4 perspective projection matrix. |
| `viewMatrix` | `Mat4x3` | Inverted camera view matrix for world-to-eye transform. |
| `modelMatrix` | `Mat4x3` | Camera position and orientation matrix in world coordinates. |
| `frustum` | `Frustum` | 6-plane viewing frustum extracted from the projection-view matrix. |
| `fov` | `number` | Vertical field of view in degrees. |
| `zNear` | `number` | Near clipping plane. |
| `zFar` | `number` | Far clipping plane. |

---

## Methods

### `setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set camera position in world space using either a `Vec3` or scalar `(x, y, z)` coordinates.

### `lookAt(target: Vec3 | number, y?: number, z?: number): void`

Orient camera to point towards a target coordinate in world space.

```javascript
camera.lookAt(0, 1.5, 0);
// Or passing a Vec3:
camera.lookAt(mesh.getWorldPosition());
```

### `setTarget(xOrVec: Vec3 | number, y?: number, z?: number): void`

Updates the camera look target and recomputes the view matrix.

### `setUp(xOrVec: Vec3 | number, y?: number, z?: number): void`

Sets the camera up vector (default `(0, 1, 0)`).

### `setFov(fov: number): void`

Updates field of view and recomputes the projection matrix.

### `setProjectionMatrix(viewport?: Vec2 | Int32Array | number[] | null): void`

Recomputes the aspect ratio and perspective projection matrix from a new viewport. Accepts a Spock `Vec2` representing `(width, height)` or a WebGL viewport array `[x, y, width, height]`.

### `setNearFar(zNear: number, zFar: number): void`

Updates near/far clipping distances and recomputes projection matrix.

### `dolly(distance: number): void`

Move camera forward/backward along its current viewing axis.

### `getViewDirection(target?: Vec3): Vec3`

Calculates the normalized direction vector along which the camera is facing.

### `getDistance(target?: Vec3): number`

Calculates Euclidean distance from camera position to target.

### `getRay(ndcOrX: Vec2 | number, ndcYOrTarget?: number | Ray, targetRay: Ray = new Ray()): Ray`

Unprojects Normalized Device Coordinates (NDC) in $[-1, 1]$ into a world-space `Ray`. Supports vector-first `Vec2` or scalar `(ndcX, ndcY)`:

```javascript
// Convert mouse click on canvas to Normalized Device Coordinates (NDC [-1, 1]):
const rect = canvas.getBoundingClientRect();
const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
const ndcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

// Generate world-space Ray
const ray = camera.getRay(new Vec2(ndcX, ndcY));
const hits = scene.raycast(ray);
```

### `getWorldPosition(): Vec3`

Retrieve camera world position vector.
