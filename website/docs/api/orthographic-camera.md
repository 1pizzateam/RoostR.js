# OrthographicCamera

A parallel projection camera where objects maintain the same visual size regardless of distance from the lens. Essential for 2D overlays, UI HUDs, isometric games, and architectural previews.

```javascript
import { OrthographicCamera, Vec3, Vec2 } from '@1pizzateam/roostr';

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
  boundsOrLeft: Rect | number,
  rightOrNear?: number,
  topOrFar?: number,
  bottom?: number,
  near?: number,
  far?: number
)
```

Can be initialized either with explicit boundary numbers or directly with a Spock [`Rect`](https://1pizzateam.github.io/Spock.js/):

```javascript
import { OrthographicCamera, Rect } from '@1pizzateam/roostr';

// Using a Spock Rect directly:
const camera = new OrthographicCamera(new Rect(20, 10, 0, 0), 0.1, 1000);
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `projectionMatrix` | `Mat4` | 4x4 orthographic projection matrix. |
| `viewMatrix` | `Mat4x3` | Inverted camera view matrix for world-to-eye transform. |
| `left`, `right`, `top`, `bottom` | `number` | Frustum boundaries. |
| `near`, `far` | `number` | Clipping planes. |

---

## Methods

### `setBounds(boundsOrLeft: Rect | number, rightOrNear?: number, topOrFar?: number, bottom?: number, near?: number, far?: number): void`

Updates the camera viewing boundaries and automatically recomputes the projection matrix. Accepts either a Spock `Rect` or individual boundary coordinates.

### `setProjectionMatrix(left: number, right: number, top: number, bottom: number, zNear?: number, zFar?: number): void`

Update the orthographic bounding box extents and rebuild the projection matrix.

### `setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set camera position in world space.

### `lookAt(target: Vec3 | number, y?: number, z?: number): void`

Orient camera to point towards a target coordinate.

### `getRay(ndcOrX: Vec2 | number, ndcYOrTarget?: number | Ray, targetRay: Ray = new Ray()): Ray`

Generate a parallel world-space `Ray` originating from the unprojected orthographic plane using Normalized Device Coordinates (NDC $[-1, 1]$):

```javascript
const ray = camera.getRay(new Vec2(ndcX, ndcY));
```

### `getViewDirection(target?: Vec3): Vec3`

Calculates the normalized direction vector along which the camera is facing.

### `getDistance(target?: Vec3): number`

Calculates distance from camera to target point.

### `dolly(distance: number): void`

Move camera forward/backward along its viewing axis.
