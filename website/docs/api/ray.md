# Ray & Intersections

> Implemented by Spock's `Ray3` and re-exported from RoostR as `Ray`.

Represents an infinite half-line starting from an `origin` and traveling indefinitely along a normalized `direction` vector. Powers mouse picking, collision queries, and line-of-sight checks.

```javascript
import { Ray, Vec3 } from '@1pizzateam/roostr';

const ray = new Ray(
  new Vec3(0, 5, 10),
  new Vec3(0, 0, -1)
);

const hitDistance = ray.intersectSphere(mesh.boundingSphere);
if (hitDistance !== null) {
  const hitPoint = ray.at(hitDistance);
  console.log(`Hit at:`, hitPoint);
}
```

---

## Constructor

```typescript
new Ray(origin?: Vec3, direction?: Vec3)
```

The `direction` vector is automatically normalized upon assignment.

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `origin` | `Vec3` | 3D starting point of the ray. |
| `direction` | `Vec3` | Normalized direction vector along which the ray travels. |

---

## Methods

### `set(origin: Vec3, direction: Vec3): this`

Set origin point and direction.

### `at(t: number, target: Vec3 = new Vec3()): Vec3`

Calculate the 3D coordinate along the ray at distance $t$:

$$\vec{P}(t) = \vec{\text{origin}} + t \cdot \vec{\text{direction}}$$

### `intersectSphere(sphere: BoundingSphere): number | null`

Analytic ray-sphere intersection. Returns the distance $t \ge 0$ to the nearest intersection point, or `null` if the ray misses the sphere.

### `intersectBox(box: BoundingBox): number | null`

Fast Kay-Kajiya slab ray-AABB intersection algorithm. Returns distance $t \ge 0$ to the entry point, or `null` if the ray misses the box.

### `intersectTriangle(a: Vec3, b: Vec3, c: Vec3, backfaceCulling: boolean = true): number | null`

Möller-Trumbore ray-triangle intersection algorithm. Returns distance $t \ge 0$ to the triangle plane within barycentric coordinates $u, v \ge 0, u + v \le 1$, or `null` if the ray misses or is backface-culled.
