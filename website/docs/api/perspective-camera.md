# PerspectiveCamera

A 3D perspective projection camera with field-of-view, aspect ratio, depth clipping planes, and inverted view-matrix caching.

```javascript
import { PerspectiveCamera, Vec3 } from '@1pizzateam/roostr';

const camera = new PerspectiveCamera(45, gl, 0.1, 1000);
camera.setPosition(0, 5, 10);
camera.lookAt(0, 0, 0);
```

---

## Constructor

```typescript
new PerspectiveCamera(
  fov: number,
  context: WebGLRenderingContext,
  zNear: number = 0.1,
  zFar: number = 1000
)
```

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `fov` | `number` | `45` | Vertical field of view in degrees. |
| `context` | `WebGLRenderingContext` | — | The active WebGL context for aspect ratio resolution. |
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

### `setPosition(x: number | Vec3, y?: number, z?: number): void`

Set camera position in world space.

### `lookAt(x: number | Vec3, y?: number, z?: number): void`

Orient camera to point towards a target point.

```javascript
camera.lookAt(0, 1.5, 0);
// Or passing a Vec3:
camera.lookAt(mesh.getWorldPosition());
```

### `dolly(distance: number): void`

Move camera forward/backward along its current viewing axis.

### `getRay(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Ray`

Unproject a 2D screen coordinate (e.g. mouse click) through the inverse projection-view matrix to generate a normalized world-space `Ray`.

```javascript
const ray = camera.getRay(event.clientX, event.clientY, canvas.width, canvas.height);
const hits = scene.raycast(ray);
```

### `getWorldPosition(): Vec3`

Retrieve camera world position vector.
