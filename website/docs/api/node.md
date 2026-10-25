# Node

The hierarchical 3D scene-graph base class encapsulating local and world transformation matrices, Euler/Quaternion synchronization, parent-child relationships, dirty-flag propagation, and local/world bounding volumes. [`Mesh`](/api/mesh) and [`Sprite`](/api/sprite) extend `Node`.

```javascript
import { Node, Vec3, Quat, BoundingBox } from '@1pizzateam/roostr';

const pivot = new Node();
pivot.setPosition(new Vec3(0, 2, 0));
pivot.addChild(childNode);
```

---

## Constructor

```typescript
new Node<T extends Node<T> = any>()
```

Initializes identity `modelMatrix`, `worldMatrix`, and `normalMatrix` instances alongside empty local and world `BoundingBox` and `BoundingSphere` volumes.

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `position` | `Vec3` | Local position vector. |
| `rotation` | `Vec3` | Euler angles in radians (derived on demand from `quaternion`). |
| `quaternion` | `Quat` | Local orientation quaternion (single source of truth for rotation). |
| `scale` | `Vec3` | Local scale vector (default `new Vec3(1, 1, 1)`). |
| `modelMatrix` | `Mat4x3` | Local affine transformation matrix. |
| `worldMatrix` | `Mat4x3` | Combined world transformation matrix including parent transforms. |
| `normalMatrix` | `Mat3` | Transposed inverse 3x3 normal matrix for lighting calculations. |
| `localBoundingBox` | `BoundingBox` | Local-space Axis-Aligned Bounding Box (AABB). |
| `localBoundingSphere` | `BoundingSphere` | Local-space bounding sphere. |
| `boundingBox` | `BoundingBox` | World-space AABB transformed by `worldMatrix`. |
| `boundingSphere` | `BoundingSphere` | World-space bounding sphere transformed by `worldMatrix`. |
| `parent` | `T \| null` | Parent node in the scene graph hierarchy. |
| `children` | `T[]` | Direct child nodes attached to this node. |

---

## Hierarchy Methods

### `addChild(node: T): void`

Attaches a child node to this node and marks its world transform dirty. If the child already belongs to another parent, it is removed from the previous parent first. Adding an already-attached direct child is a no-op.

### `removeChild(node: T): boolean`

Detaches a direct child node and clears its `parent` reference. Returns `true` if the node was found and removed.

---

## Transform Methods

### `setPosition(position: Vec3): this`

Copies `position` into the local position vector and marks transforms dirty.

### `setRotation(rotation: Vec3): this`

Sets the local Euler rotation in radians and synchronizes `quaternion`.

### `setQuaternion(q: Quat): this`

Copies `q` into the local orientation quaternion.

### `setScale(scale: Vec3): this`

Copies `scale` into the local scale vector.

### `scaleBy(factor: Vec3): this`

Multiplies the current local scale component-wise by `factor`.

### `translate(translation: Vec3): this`

Adds `translation` to the current local position.

### `rotateX(angle: number) / rotateY(angle: number) / rotateZ(angle: number): this`

Rotates the local quaternion around the respective axis by `angle` radians.

### `rotateOnAxis(axis: Vec3, angle: number): this`

Rotates the local quaternion around an arbitrary normalized 3D `axis` by `angle` radians.

### `lookAt(target: Vec3, up?: Vec3): this`

Orients the node so its local `-Z` axis faces `target` (`Quat.lookAt`). No-op if `position` equals `target`.

### `slerp(targetQuat: Quat, t: number): this`

Spherically interpolates the node's quaternion toward `targetQuat` by factor `t` $\in [0, 1]$.

---

## Spatial & Bounds Methods

### `getWorldPosition(target: Vec3 = new Vec3()): Vec3`

Extracts the world-space translation from `worldMatrix` into `target`.

### `getWorldDirection(target: Vec3 = new Vec3()): Vec3`

Computes the normalized forward direction vector (`-Z`) in world space into `target`.

### `distanceTo(target: Node | Vec3): number`

Computes the Euclidean distance between this node's world position and another `Node` or `Vec3`.

### `isInsideBounds(box: BoundingBox): boolean`

Returns `true` if this node's world position lies inside `box`.

### `setLocalBounds(box: BoundingBox): this`

Sets the local-space `BoundingBox` and derives the corresponding `localBoundingSphere`. Use this for procedural or dynamically updated geometry whose vertex buffers start empty at construction time.

### `computeBounds(): void`

Updates `boundingBox` and `boundingSphere` in world space when dirty.

### `computeBoundingBox(): BoundingBox` / `computeBoundingSphere(): BoundingSphere`

Ensures bounds are up to date and returns the world-space `BoundingBox` or `BoundingSphere`.
