# PointLight

An omnidirectional point light source emitting light rays outward in all directions from a central 3D point in space, with distance-based attenuation.

```javascript
import { PointLight, Vec3 } from '@1pizzateam/roostr';

const lamp = new PointLight(new Vec3(0, 3, 2));
lamp.setDiffuse(1.0, 0.6, 0.2); // Warm tungsten light
lamp.setLinearAttenuation(0.14);
lamp.setQuadraticAttenuation(0.07);
scene.addLight(lamp);
```

---

## Constructor

```typescript
new PointLight(position?: Vec3)
```

---

## Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `Vec3` | `(0, 0, 0)` | 3D origin of the light in world space. |
| `diffuse` | `Vec3` | `(1, 1, 1)` | Diffuse RGB color intensity. |
| `specular` | `Vec3` | `(1, 1, 1)` | Specular reflection color. |
| `constantAttenuation` | `number` | `1.0` | Constant attenuation factor $k_c$. |
| `linearAttenuation` | `number` | `0.0` | Linear attenuation factor $k_l$. |
| `quadraticAttenuation` | `number` | `0.0` | Quadratic attenuation factor $k_q$. |

---

## Attenuation Formula

Light intensity diminishes over distance $d$ according to the standard physical attenuation equation:

$$\text{attenuation}(d) = \frac{1.0}{k_c + k_l \cdot d + k_q \cdot d^2}$$

---

## Methods

### `setPosition(x: number | Vec3, y?: number, z?: number): void`

Set the world position of the point light.

### `setDiffuse(r: number | Vec3 | number[], g?: number, b?: number): void`

Set the diffuse RGB color.

### `setSpecular(r: number | Vec3 | number[], g?: number, b?: number): void`

Set the specular RGB color.

### `setLinearAttenuation(factor: number): void`

Configure the linear distance decay coefficient.

### `setQuadraticAttenuation(factor: number): void`

Configure the quadratic distance decay coefficient.
