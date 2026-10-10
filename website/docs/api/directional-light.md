# DirectionalLight

Simulates an infinite parallel light source such as the sun or moon, illuminating all objects in the scene along a constant directional vector without distance falloff.

```javascript
import { DirectionalLight, Vec3 } from '@1pizzateam/roostr';

const sun = new DirectionalLight(new Vec3(0.5, 1.0, 0.3));
sun.setDiffuse(0.9, 0.85, 0.8);
sun.setSpecular(1.0, 1.0, 1.0);
scene.addLight(sun);
```

---

## Constructor

```typescript
new DirectionalLight(
  directionOrOptions?: Vec3 | number[] | {
    direction?: Vec3 | number[];
    diffuse?: Vec3 | number[];
    specular?: Vec3 | number[];
    position?: Vec3 | number[];
  }
)
```

The light direction points from the light source towards the illuminated surfaces. Direction vectors are automatically normalized.

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `direction` | `Vec3` | Normalized light propagation vector. |
| `position` | `Vec3` | Light origin reference vector. |
| `diffuse` | `Vec3` | Diffuse RGB color intensity in range $[0, 1]$. |
| `specular` | `Vec3` | Specular highlight RGB color intensity. |

---

## Methods

### `setDirection(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the direction vector pointing from the light source towards the scene.

### `setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the reference position vector.

### `setDiffuse(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the diffuse color.

### `setSpecular(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the specular highlight color.
