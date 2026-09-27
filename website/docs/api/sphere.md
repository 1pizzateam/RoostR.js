# BoundingSphere

A 3D spherical bounding volume defined by a central coordinate and radius. Ideal for fast radial distance checks, rapid culling, and camera depth sorting.

```javascript
import { BoundingSphere, Vec3 } from '@1pizzateam/roostr';

const sphere = new BoundingSphere(new Vec3(0, 0, 0), 2.5);

const point = new Vec3(1, 1, 1);
console.log(sphere.containsPoint(point)); // true
```

---

## Constructor

```typescript
new BoundingSphere(center?: Vec3, radius?: number)
```

---

## Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `center` | `Vec3` | `(0, 0, 0)` | Central 3D coordinate point. |
| `radius` | `number` | `0` | Sphere radius. |

---

## Methods

### `set(center: Vec3, radius: number): this`

Set the center coordinates and radius.

### `setFromPoints(points: number[] | Vec3[]): this`

Compute a bounding sphere enclosing an array of 3D coordinates.

### `containsPoint(point: Vec3): boolean`

Returns `true` if `point` lies inside or on the sphere surface ($\| \text{point} - \text{center} \|^2 \le \text{radius}^2$).

### `intersectsSphere(other: BoundingSphere): boolean`

Test whether two bounding spheres overlap by comparing center distance squared against sum of radii squared.

### `intersectsBox(box: BoundingBox): boolean`

Test intersection against an Axis-Aligned Bounding Box.

### `applyMatrix4(matrix: Mat4 | Mat4x3): this`

Transform the sphere center and scale the radius by the maximum vector component scale factor.
