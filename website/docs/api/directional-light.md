# DirectionalLight

Simulates an infinite parallel light source such as the sun or moon, illuminating all objects in the scene along a constant directional vector without distance falloff.

```javascript
import { DirectionalLight, Vec3 } from '@1pizzateam/roostr';

const sun = new DirectionalLight(new Vec3(0.5, 1.0, 0.3));
sun.setDiffuse(new Vec3(0.9, 0.85, 0.8));
sun.setSpecular(new Vec3(1.0, 1.0, 1.0));
scene.addLight(sun);
```

---

## Constructor

```typescript
new DirectionalLight(
  directionOrOptions?: Vec3 | {
    direction?: Vec3;
    diffuse?: Vec3;
    specular?: Vec3;
    position?: Vec3;
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

### `setDirection(direction: Vec3): void`

Set the direction vector pointing from the light source towards the scene.

### `setPosition(position: Vec3): void`

Set the reference position vector.

### `setDiffuse(diffuse: Vec3): void`

Set the diffuse color.

### `setSpecular(specular: Vec3): void`

Set the specular highlight color.
