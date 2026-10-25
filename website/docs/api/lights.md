# Lights Overview

The `Lights` class coordinates scene illumination by organizing directional, point, spot, and ambient light sources and packaging them into pre-allocated `Float32Array` buffers for high-speed GLSL uniform uploads.

```javascript
import { Scene, DirectionalLight, PointLight, SpotLight, AmbientLight, Vec3 } from '@1pizzateam/roostr';

// 1. Sun
const sun = new DirectionalLight(new Vec3(0.5, 1.0, 0.4));
sun.setDiffuse(new Vec3(0.9, 0.85, 0.8));
scene.addLight(sun);

// 2. Point light
const torch = new PointLight(new Vec3(2, 2, 0));
torch.setDiffuse(new Vec3(1.0, 0.5, 0.1));
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

To avoid garbage collection spikes and driver upload overhead, `Lights.flatten(extraAmbient?)` packs up to `MAX_LIGHTS` (`8`) active directional, point, and spot lights (plus accumulated `AmbientLight` and scene `ambientColor`) into reusable contiguous `Float32Array` buffers. Built-in `PhongShader` uploads packed `vec4` arrays (`uLightPositionType`, `uLightDiffuseCutoff`, `uLightSpecularExponent`, `uLightDirection`, `uLightAttenuation`, `uAmbientLight`) to stay well within mobile GPU fragment uniform limits, while classic unpacked uniform arrays (`uLightPosition`, `uLightDiffuse`, `uLightSpecular`, `uLightType`, etc.) remain available for custom shaders.

---

## Collection Methods

### `addLight(light: AnyLight): void`

Adds a light to its corresponding type category.

### `removeLight(light: AnyLight): boolean`

Removes a light and shifts remaining entries in the GPU buffer.

### `clear(): void`

Clears all registered lights and resets active counts to 0.
