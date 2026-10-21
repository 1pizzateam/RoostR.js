# OrthographicCamera

A parallel projection camera where objects maintain the same visual size regardless of distance from the lens. Essential for 2D overlays, UI HUDs, isometric games, and architectural previews.

```javascript
import { OrthographicCamera, Rect, Vec3, Vec2 } from '@1pizzateam/roostr';

const aspect = canvas.width / canvas.height;
const frustumSize = 10;

const camera = new OrthographicCamera(
  new Rect(new Vec2(frustumSize * aspect, frustumSize)),
  new Vec2(0.1, 1000)
);
camera.setPosition(new Vec3(10, 10, 10));
camera.lookAt(new Vec3(0, 0, 0));
```

---

## Constructor

```typescript
new OrthographicCamera(
  bounds: Rect,
  nearFar: Vec2 = new Vec2(-1000, 1000)
)
```

Initialized with a Spock [`Rect`](https://1pizzateam.github.io/Spock.js/) defining view boundaries and a `Vec2` for clipping planes $(x = near, y = far)$:

```javascript
import { OrthographicCamera, Rect, Vec2 } from '@1pizzateam/roostr';

const camera = new OrthographicCamera(new Rect(new Vec2(20, 10)), new Vec2(0.1, 1000));
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `projectionMatrix` | `Mat4` | 4x4 orthographic projection matrix. |
| `viewMatrix` | `Mat4x3` | Inverted camera view matrix for world-to-eye transform. |
| `left`, `right`, `top`, `bottom` | `number` | Frustum boundaries derived from `bounds`. |
| `near`, `far` | `number` | Clipping planes derived from `nearFar`. |

---

## Methods

### `setBounds(bounds: Rect, nearFar?: Vec2): void`

Updates the camera viewing boundaries and optional near/far clipping distances, then automatically recomputes the projection matrix.

### `setProjectionMatrix(): void`

Recomputes the orthographic projection matrix.

### `getNearFar(target?: Vec2): Vec2`

Gets near/far clipping distances into a target `Vec2`.

### `setPosition(position: Vec3): void`

Set camera position in world space.

### `lookAt(target: Vec3): void`

Orient camera to point towards a target coordinate in world space.

### `getRay(ndc: Vec2, targetRay?: Ray): Ray`

Generate a parallel world-space `Ray` originating from the unprojected orthographic plane using Normalized Device Coordinates (NDC $[-1, 1]$):

```javascript
const ray = camera.getRay(new Vec2(ndcX, ndcY));
```

### `getViewDirection(target?: Vec3): Vec3`

Calculates the normalized direction vector along which the camera is facing.

### `getDistance(): number`

Calculates distance from camera to target point.

### `dolly(distance: number): void`

Move camera forward/backward along its viewing axis.
