# Frustum Culling

Represents the 6-sided pyramid viewing volume of a camera (Left, Right, Bottom, Top, Near, Far planes). Meshes lying entirely outside any of the 6 planes are culled prior to GPU rendering.

```javascript
import { Frustum } from '@1pizzateam/roostr';

const frustum = new Frustum();
// Extracted automatically from the camera's projection-view matrix
frustum.setFromProjectionMatrix(pvMatrix);

if (frustum.intersectsSphere(mesh.boundingSphere)) {
  // Render mesh
}
```

---

## Constructor

```typescript
new Frustum()
```

Initializes 6 normalized `SpatialPlane` boundary equations.

---

## Methods

### `setFromProjectionMatrix(pvMatrix: Mat4 | Float32Array): this`

Extracts the 6 frustum clipping planes directly from the combined projection-view matrix using the Gribb-Hartmann plane extraction technique and normalizes the plane equations in place without allocations.

### `intersectsSphere(sphere: BoundingSphere): boolean`

Returns `true` if the bounding sphere is at least partially inside the viewing frustum. If the signed distance from the sphere center to any plane is less than $-\text{radius}$, the sphere lies completely outside and returns `false`.

### `intersectsBox(box: BoundingBox): boolean`

Returns `true` if the Axis-Aligned Bounding Box intersects or lies entirely inside the viewing frustum.

### `containsPoint(point: Vec3): boolean`

Returns `true` if a 3D coordinate point is located inside all 6 frustum half-spaces.
