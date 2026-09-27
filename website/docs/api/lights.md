# Lights Overview

The `Lights` class coordinates scene illumination by organizing directional, point, spot, and ambient light sources and packaging them into pre-allocated `Float32Array` buffers for high-speed GLSL uniform uploads.

<LightingDemo />

```javascript
import { Scene, DirectionalLight, PointLight, SpotLight, AmbientLight, Vec3 } from '@1pizzateam/roostr';

// 1. Sun
const sun = new DirectionalLight(new Vec3(0.5, 1.0, 0.4));
sun.setDiffuse(0.9, 0.85, 0.8);
scene.addLight(sun);

// 2. Point light
const torch = new PointLight(new Vec3(2, 2, 0));
torch.setDiffuse(1.0, 0.5, 0.1);
scene.addLight(torch);

// 3. Ambient
const ambient = new AmbientLight(new Vec3(0.1, 0.1, 0.15));
scene.addLight(ambient);
```

---

## Light Types

RoostR provides four distinct light types:

- [DirectionalLight](/api/directional-light): Parallel rays without attenuation, simulating distant sun or moonlight.
- [PointLight](/api/point-light): Radiates light outwards from a 3D origin with realistic distance attenuation ($1 / (k_c + k_l d + k_q d^2)$).
- [SpotLight](/api/spot-light): Conical light source emitting from a position along a direction with an angular cutoff beam.
- [AmbientLight](/api/ambient-light): Non-directional global base illumination preventing completely black shadows.

---

## GPU Buffer Flattening

To avoid garbage collection spikes and driver upload overhead, `Lights` continuously synchronizes its internal light parameters into contiguous `Float32Array` buffers:

| Uniform Name | GLSL Type | Description |
| :--- | :--- | :--- |
| `uNumDirLights` | `int` | Number of active directional lights. |
| `uDirLightDirection` | `vec3[4]` | Flattened direction vectors. |
| `uDirLightDiffuse` | `vec3[4]` | Flattened diffuse color intensities. |
| `uDirLightSpecular` | `vec3[4]` | Flattened specular color intensities. |
| `uNumPointLights` | `int` | Number of active point lights. |
| `uPointLightPosition`| `vec3[8]` | World positions of point lights. |
| `uPointLightDiffuse` | `vec3[8]` | Diffuse colors. |
| `uPointLightAttenuation`| `vec3[8]`| Attenuation coefficients `(constant, linear, quadratic)`. |
| `uNumSpotLights` | `int` | Number of active spotlights. |
| `uSpotLightPosition` | `vec3[4]` | Spotlight positions. |
| `uSpotLightDirection`| `vec3[4]` | Spotlight direction vectors. |
| `uSpotLightCutoff` | `float[4]`| Cosine of beam cutoff angle. |
| `uSpotLightExponent`| `float[4]`| Cone falloff intensity exponents. |

---

## Collection Methods

### `addLight(light: AnyLight): void`

Adds a light to its corresponding type category.

### `removeLight(light: AnyLight): boolean`

Removes a light and shifts remaining entries in the GPU buffer.

### `clear(): void`

Clears all registered lights and resets active counts to 0.
