# SpotLight

A directional spotlight source emitting a cone of light from a 3D origin point oriented along a specified direction vector, with an angular cutoff and falloff exponent.

```javascript
import { SpotLight, Vec3 } from '@1pizzateam/roostr';

const spot = new SpotLight(new Vec3(0, 5, 0));
spot.setDirection(new Vec3(0, -1, 0)); // Point downwards
spot.setCutoff(0.85);                 // Cone beam cutoff angle
spot.setExponent(16.0);               // Spot beam sharpness
spot.setDiffuse(new Vec3(0.3, 0.7, 1.0));
scene.addLight(spot);
```

---

## Constructor

```typescript
new SpotLight(
  positionOrOptions?: Vec3 | {
    position?: Vec3;
    diffuse?: Vec3;
    specular?: Vec3;
    direction?: Vec3;
    cutoff?: number;
    exponent?: number;
  }
)
```

---

## Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `Vec3` | `(0, 0, 0)` | 3D origin position. |
| `direction` | `Vec3` | `(1, 0, 0)` | Normalized direction pointing along the spotlight axis. |
| `diffuse` | `Vec3` | `(1, 1, 1)` | Diffuse RGB color intensity. |
| `specular` | `Vec3` | `(1, 1, 1)` | Specular reflection highlight color. |
| `cutoff` | `number` | `180` | Beam cutoff angle. |
| `exponent` | `number` | `0` | Angular beam falloff concentration exponent. |

---

## Methods

### `setPosition(position: Vec3): void`

Set spotlight 3D origin in world coordinates.

### `setDirection(direction: Vec3): void`

Set the direction vector of the cone beam.

### `setCutoff(cosineAngle: number): void`

Set the cosine threshold of the spotlight cone angle. Surfaces whose angle to the spotlight axis exceeds this threshold receive no spotlight illumination.

### `setExponent(exponent: number): void`

Set the angular attenuation concentration exponent. Higher values produce a tighter, more focused spotlight core.
