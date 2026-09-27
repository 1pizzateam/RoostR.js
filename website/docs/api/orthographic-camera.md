# OrthographicCamera

A parallel projection camera where objects maintain the same visual size regardless of distance from the lens. Essential for 2D overlays, UI HUDs, isometric games, and architectural previews.

```javascript
import { OrthographicCamera } from '@1pizzateam/roostr';

const aspect = canvas.width / canvas.height;
const frustumSize = 10;

const camera = new OrthographicCamera(
  -frustumSize * aspect / 2,
   frustumSize * aspect / 2,
   frustumSize / 2,
  -frustumSize / 2,
   0.1,
   1000,
   gl
);
camera.setPosition(10, 10, 10);
camera.lookAt(0, 0, 0);
```

---

## Constructor

```typescript
new OrthographicCamera(
  left: number,
  right: number,
  top: number,
  bottom: number,
  zNear: number = 0.1,
  zFar: number = 1000,
  context?: WebGLRenderingContext
)
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `projectionMatrix` | `Mat4` | 4x4 orthographic projection matrix. |
| `viewMatrix` | `Mat4x3` | Inverted camera view matrix for world-to-eye transform. |
| `modelMatrix` | `Mat4x3` | Camera position and orientation matrix in world coordinates. |
| `frustum` | `Frustum` | 6-plane viewing frustum for culling parallel rays. |

---

## Methods

### `setProjectionMatrix(left: number, right: number, top: number, bottom: number, zNear?: number, zFar?: number): void`

Update the orthographic bounding box extents and rebuild the projection matrix.

### `lookAt(x: number | Vec3, y?: number, z?: number): void`

Orient camera to point towards a target coordinate.

### `getRay(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Ray`

Generate a parallel world-space `Ray` originating from the unprojected orthographic plane.
