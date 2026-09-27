# BoundingBox

A 3D Axis-Aligned Bounding Box (AABB) defined by minimum and maximum extents, utilized for broad-phase collision detection, viewing frustum culling, and ray intersection testing.

```javascript
import { BoundingBox, Vec3 } from '@1pizzateam/roostr';

const box = new BoundingBox(
  new Vec3(-1, -1, -1),
  new Vec3( 1,  1,  1)
);

const point = new Vec3(0, 0.5, 0);
console.log(box.containsPoint(point)); // true
```

---

## Constructor

```typescript
new BoundingBox(min?: Vec3, max?: Vec3)
```

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `min` | `Vec3` | Lower coordinate corner bound $[x_{\min}, y_{\min}, z_{\min}]$. |
| `max` | `Vec3` | Upper coordinate corner bound $[x_{\max}, y_{\max}, z_{\max}]$. |

---

## Methods

### `set(min: Vec3, max: Vec3): this`

Set bounding box corners.

### `setFromPoints(points: number[] | Vec3[]): this`

Expand the box to tightly enclose an array of 3D points.

### `setFromCenterAndSize(center: Vec3, size: Vec3): this`

Construct an AABB given a central point and dimension vector.

### `getCenter(): Vec3`

Calculate the central midpoint coordinate $\frac{\min + \max}{2}$.

### `getSize(): Vec3`

Calculate the bounding dimension vector $\max - \min$.

### `containsPoint(point: Vec3): boolean`

Return `true` if `point` lies inside or on the surface of the bounding box.

### `intersectsBox(other: BoundingBox): boolean`

Test whether this bounding box overlaps another AABB along all three axes.

### `intersectsSphere(sphere: BoundingSphere): boolean`

Test whether this bounding box intersects a 3D bounding sphere using clamped closest-point distance.

### `applyMatrix4(matrix: Mat4 | Mat4x3): this`

Transforms the axis-aligned box by an arbitrary affine matrix using James Arvo's fast bounding box transformation method, ensuring tight bounding extents without transforming all 8 vertices manually.
