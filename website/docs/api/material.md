# Material

Defines optical surface appearance properties used during Blinn-Phong lighting shading.

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

### Options (`IMaterialOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ambient` | `Vec3` | `new Vec3(0.5, 0.5, 0.5)` | Ambient reflection coefficient. |
| `diffuse` | `Vec3` | `new Vec3(0.6, 0.6, 0.6)` | Diffuse color reflectivity. |
| `specular` | `Vec3` | `new Vec3(0.8, 0.8, 0.8)` | Specular reflection highlight color. |
| `shininess` | `number` | `8.0` | Specular highlight sharpness exponent (higher = sharper). |

::: tip Transparency & Blending
Alpha blending in RoostR is configured on the [`Mesh`](/api/mesh) via `mesh.blendMode = true` and rendered with `scene.renderBlended(camera)`.
:::

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `ambient` | `Vec3` | Ambient color vector. |
| `diffuse` | `Vec3` | Diffuse color vector. |
| `specular` | `Vec3` | Specular color vector. |
| `shininess` | `number` | Specular highlight sharpness exponent. |
| `uniforms` | `IMaterialUniforms` | Uniform objects mapped to shader properties. |

---

## Methods

### `setAmbient(ambient: Vec3): void`

Set ambient reflection RGB values in range $[0, 1]$.

### `setDiffuse(diffuse: Vec3): void`

Set diffuse color RGB values in range $[0, 1]$.

### `setSpecular(specular: Vec3): void`

Set specular highlight RGB values in range $[0, 1]$.

### `setShininess(shininess: number): void`

Set specular exponent. Typical values range from `4.0` (dull rough plastic) to `128.0` (polished metallic chrome).

### `updateUniforms(): void`

Synchronizes the internal `Uniform` buffer values with the current `ambient`, `diffuse`, `specular`, and `shininess` properties.
