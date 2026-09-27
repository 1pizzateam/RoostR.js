# AmbientLight

Provides uniform, non-directional base illumination throughout the scene to soften harsh shadows and simulate indirect environmental bounce light.

```javascript
import { AmbientLight, Vec3 } from '@1pizzateam/roostr';

const ambient = new AmbientLight(new Vec3(0.15, 0.15, 0.2));
scene.addLight(ambient);
```

---

## Constructor

```typescript
new AmbientLight(diffuse?: Vec3)
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `diffuse` | `Vec3` | Base ambient illumination RGB color in range $[0, 1]$. |

---

## Methods

### `setDiffuse(r: number | Vec3 | number[], g?: number, b?: number): void`

Set the ambient light intensity and color tint.

### `clone(): AmbientLight`

Create a clone of this ambient light instance.
