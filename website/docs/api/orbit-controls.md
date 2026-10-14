# OrbitControls

Smooth mouse and touch orbital controller that rotates, pans, and dollies a camera around a central 3D focus target with inertia damping.

```javascript
import { OrbitControls, PerspectiveCamera, Vec2 } from '@1pizzateam/roostr';

const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.0;
controls.maxDistance = 30.0;

// Inside render loop:
function tick() {
  controls.update();
  scene.render(camera);
}
```

---

## Constructor

```typescript
new OrbitControls(camera: Camera, domElement: HTMLElement)
```

Attaches mouse (`mousedown`, `mousemove`, `mouseup`, `wheel`) and touch (`touchstart`, `touchmove`, `touchend`) event listeners to `domElement`.

---

## Configuration Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `target` | `Vec3` | `(0, 0, 0)` | The 3D focus point around which the camera orbits. |
| `enableDamping` | `boolean` | `true` | Enable realistic physical inertia and deceleration. |
| `dampingFactor` | `number` | `0.08` | Inertia smoothing weight (smaller = more drift). |
| `enableRotate` | `boolean` | `true` | Enable orbital pitch and yaw rotation (left mouse click & drag). |
| `enableZoom` | `boolean` | `true` | Enable distance zooming (scroll wheel & two-finger pinch). |
| `enablePan` | `boolean` | `true` | Enable plane translation (right mouse drag & two-finger pan). |
| `rotateSpeed` | `number` | `1.0` | Mouse rotation sensitivity multiplier. |
| `zoomSpeed` | `number` | `1.0` | Wheel zoom sensitivity multiplier. |
| `panSpeed` | `number` | `1.0` | Panning translation sensitivity multiplier. |
| `minDistance` | `number` | `0.5` | Minimum orbital distance to target point. |
| `maxDistance` | `number` | `1000` | Maximum orbital distance to target point. |
| `minPolarAngle` | `number` | `0` | Minimum vertical orbit angle in radians ($0 = \text{zenith}$). |
| `maxPolarAngle` | `number` | `Math.PI` | Maximum vertical orbit angle in radians ($\pi = \text{nadir}$). |

---

## Methods

### `update(): void`

Must be called inside the main application render loop each frame when `enableDamping` is true to step the inertia physics and recalculate camera position and view matrix.

### `dispose(): void`

Removes all registered DOM event listeners from `domElement` to prevent memory leaks when tearing down views.

### `reset(): void`

Restores the camera orientation and distance to its initial construction state.
