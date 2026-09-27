# Material

Defines the optical surface properties used during Blinn-Phong lighting shading.

```javascript
import { Material, Vec3 } from '@1pizzateam/roostr';

const gold = new Material({
  ambient: new Vec3(0.25, 0.2, 0.07),
  diffuse: new Vec3(0.75, 0.6, 0.23),
  specular: new Vec3(1.0, 0.9, 0.6),
  shininess: 51.2
});
```

---

## Constructor

```typescript
new Material(options?: IMaterialOptions)
```

### Parameters

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ambient` | `Vec3 \| number[]` | `[0.2, 0.2, 0.2]` | Ambient reflectivity coefficient. |
| `diffuse` | `Vec3 \| number[]` | `[0.8, 0.8, 0.8]` | Diffuse color reflectivity. |
| `specular` | `Vec3 \| number[]` | `[1.0, 1.0, 1.0]` | Specular reflection highlight color. |
| `shininess` | `number` | `32.0` | Specular highlight sharpness exponent (higher = sharper). |
| `opacity` | `number` | `1.0` | Surface opacity $\in [0, 1]$. |
| `blendMode` | `boolean` | `false` | Enable alpha blending mode. |

---

## Methods

### `setAmbient(r: number | Vec3, g?: number, b?: number): void`

Set ambient reflection RGB values in range $[0, 1]$.

### `setDiffuse(r: number | Vec3, g?: number, b?: number): void`

Set diffuse color RGB values in range $[0, 1]$.

### `setSpecular(r: number | Vec3, g?: number, b?: number): void`

Set specular highlight RGB values in range $[0, 1]$.

### `setShininess(shininess: number): void`

Set specular exponent. Typical values range from `4.0` (dull rough plastic) to `256.0` (polished metallic chrome).

### `setOpacity(opacity: number): void`

Set surface opacity. Automatically configures transparency blending when opacity $< 1.0$.

### `clone(): Material`

Create an independent clone of this material instance.
