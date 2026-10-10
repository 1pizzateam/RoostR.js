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
  rOrVec: Vec3 | number = 1.0,
  g: number = 1.0,
  b: number = 1.0,
  intensity: number = 1.0
)
```

### Signatures

- `new AmbientLight(color: Vec3, intensity: number = 1.0)`
- `new AmbientLight(r: number, g: number, b: number, intensity: number = 1.0)`

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `diffuse` | `Vec3` | Base ambient illumination RGB color in range $[0, 1]$. |
| `intensity` | `number` | Illumination multiplier factor. |
| `color` | `Vec3` | Getter / setter alias for `diffuse`. |

---

## Methods

### `setColor(xOrVec: Vec3 | number, y?: number, z?: number): this`

Set the ambient light color tint using a `Vec3` or RGB scalars.

### `setIntensity(intensity: number): this`

Set the light intensity multiplier.

### `getColor(): Vec3`

Retrieve the current ambient color `Vec3`.
