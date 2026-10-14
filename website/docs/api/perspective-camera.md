# PerspectiveCamera

A 3D perspective projection camera with field-of-view, aspect ratio, depth clipping planes, and inverted view-matrix caching.

```javascript
import { PerspectiveCamera, Vec3, Vec2 } from '@1pizzateam/roostr';

const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), gl);
camera.setPosition(new Vec3(0, 5, 10));
camera.lookAt(new Vec3(0, 0, 0));
```

---

## Constructor

```typescript
new PerspectiveCamera(
  fov: number,
  nearFar: Vec2 = new Vec2(0.1, 1000),
  context?: WebGLRenderingContext | null
)
```

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fov` | `number` | — | Vertical field of view in degrees. |
| `nearFar` | `Vec2` | `new Vec2(0.1, 1000)` | Near and far clipping distances $(x = zNear, y = zFar)$. |
| `context` | `WebGLRenderingContext` | `null` | Optional active WebGL context for initial aspect ratio resolution. |

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

### `setPosition(position: Vec3): void`

Set camera position in world space.

### `lookAt(target: Vec3): void`

Orient camera to point towards a target coordinate in world space.

```javascript
camera.lookAt(new Vec3(0, 1.5, 0));
// Or passing a mesh world position:
camera.lookAt(mesh.getWorldPosition());
```

### `setTarget(target: Vec3): void`

Updates the camera look target and recomputes the view matrix.

### `setUp(up: Vec3): void`

Sets the camera up vector (default `new Vec3(0, 1, 0)`).

### `setFov(fov: number): void`

Updates field of view and recomputes the projection matrix.

### `setProjectionMatrix(viewport?: Vec2 | null): void`

Recomputes the aspect ratio and perspective projection matrix from a new viewport size `Vec2(width, height)`.

### `setNearFar(nearFar: Vec2): void`

Updates near/far clipping distances using a `Vec2(zNear, zFar)` and recomputes projection matrix.

### `getNearFar(target?: Vec2): Vec2`

Gets near/far clipping distances into a target `Vec2`.

### `dolly(distance: number): void`

Move camera forward/backward along its current viewing axis.

### `getViewDirection(target?: Vec3): Vec3`

Calculates the normalized direction vector along which the camera is facing.

### `getDistance(): number`

Calculates Euclidean distance from camera position to target.

### `getRay(ndc: Vec2, targetRay?: Ray): Ray`

Unprojects Normalized Device Coordinates (NDC) in $[-1, 1]$ into a world-space `Ray`:

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
