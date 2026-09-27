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
new DirectionalLight(direction?: Vec3)
```

The light direction points from the light source towards the illuminated surfaces. Direction vectors are automatically normalized.

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `direction` | `Vec3` | Normalized light propagation vector. |
| `diffuse` | `Vec3` | Diffuse RGB color intensity in range $[0, 1]$. |
| `specular` | `Vec3` | Specular highlight RGB color intensity. |

---

## Methods

### `setDirection(x: number | Vec3, y?: number, z?: number): void`

Set the direction vector pointing from the light source towards the scene.

### `setDiffuse(r: number | Vec3 | number[], g?: number, b?: number): void`

Set the diffuse color.

### `setSpecular(r: number | Vec3 | number[], g?: number, b?: number): void`

Set the specular highlight color.

### `clone(): DirectionalLight`

Create an independent duplicate of this directional light.
