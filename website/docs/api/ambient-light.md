# AmbientLight

Provides uniform, non-directional base illumination throughout the scene to soften harsh shadows and simulate indirect environmental bounce light.

```javascript
import { AmbientLight, Vec3 } from '@1pizzateam/roostr';

const ambient = new AmbientLight(new Vec3(0.15, 0.15, 0.2), 1.0);
scene.addLight(ambient);
```

---

## Constructor

```typescript
new AmbientLight(
  diffuse: Vec3 = new Vec3(1.0, 1.0, 1.0),
  intensity: number = 1.0
)
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `diffuse` | `Vec3` | Base ambient illumination RGB color in range $[0, 1]$. |
| `intensity` | `number` | Illumination multiplier factor. |
| `color` | `Vec3` | Getter / setter alias for `diffuse`. |

---

## Methods

### `setColor(diffuse: Vec3): this`

Set the ambient light color tint using a `Vec3`.

### `setIntensity(intensity: number): this`

Set the light intensity multiplier.

### `getColor(target?: Vec3): Vec3`

Retrieve the current ambient color into an optional pre-allocated `Vec3` target.
