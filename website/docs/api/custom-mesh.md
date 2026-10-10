# CustomMesh & SubMesh

`CustomMesh` allows importing or procedurally building arbitrary 3D geometry from raw vertex positions, index arrays, UV coordinates, and normals.

```javascript
import { CustomMesh, Mesh, PhongShader } from '@1pizzateam/roostr';

const customGeom = new CustomMesh();

// 1. Supply vertices (x, y, z triplets)
customGeom.setVertices([
  -1, 0,  1,
   1, 0,  1,
   0, 1.5, 0,
   0, 0, -1
]);

// 2. Supply triangle indices
customGeom.setIndices([
  0, 1, 2, // Front face
  1, 3, 2, // Right face
  3, 0, 2, // Left face
  0, 3, 1  // Bottom face
]);

// 3. Compute smooth vertex normals automatically
customGeom.computeVertexNormals();

const mesh = new Mesh(customGeom, gl);
mesh.addProgram(PhongShader.create(gl));
scene.addMesh(mesh);
```

---

## `CustomMesh` Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `vertices` | `Float32Array \| null` | Flat array of 3D vertex positions $[x, y, z]$. |
| `indices` | `Int32Array \| null` | Flat array of triangle index triplets. |
| `normals` | `Float32Array \| null` | Flat array of normal vectors $[n_x, n_y, n_z]$. |
| `uvs` | `Float32Array \| null` | Flat array of texture mapping coordinates $[u, v]$. |
| `subMeshes` | `SubMesh[]` | Array of distinct submesh index slices. |
| `itemSize` | `number` | Coordinate dimensions per vertex (default `3`). |
| `primitive` | `string` | WebGL primitive name (`'TRIANGLES'`, `'LINE_STRIP'`, etc.). |

---

## `CustomMesh` Methods

### `setVertices(array: Vec3[] | Float32Array | number[]): void`

Assigns vertex coordinates buffer. Accepts an array of Spock `Vec3` objects, a flat `Float32Array`, or a flat number array.

### `setIndices(array: Int32Array | number[]): void`

Assigns index buffer.

### `setNormals(array: Vec3[] | Float32Array | number[]): void`

Assigns normal vectors buffer. Accepts an array of Spock `Vec3` normal vectors, a flat `Float32Array`, or a flat number array.

### `setUvs(array: Float32Array | number[]): void`

Assigns UV texture mapping coordinates buffer.

### `addSubMesh(start: number, count: number): void`

Appends a new submesh slice spanning `count` indices starting from index offset `start`.

### `addSubMeshes(array: Float32Array | Int32Array | number[]): void`

Appends multiple submeshes from a flat `[start0, count0, start1, count1, ...]` array.

### `setPrimitive(primitive: string): boolean`

Sets drawing primitive mode. Supported values: `'POINTS'`, `'LINE_STRIP'`, `'LINE_LOOP'`, `'LINES'`, `'TRIANGLE_STRIP'`, `'TRIANGLE_FAN'`, `'TRIANGLES'`.

### `computeVertexNormals(): Float32Array | null`

Iterates over every triangle face, calculates the normalized geometric face normal via cross product:

$$\vec{N}_{\text{face}} = \frac{(\vec{v}_1 - \vec{v}_0) \times (\vec{v}_2 - \vec{v}_0)}{\|(\vec{v}_1 - \vec{v}_0) \times (\vec{v}_2 - \vec{v}_0)\|}$$

Accumulates face normals into each participating vertex and renormalizes the result to produce smooth lighting normals across curved surfaces.

---

## `SubMesh`

Represents a specific segment of indices within a larger mesh buffer:

```typescript
new SubMesh(start: number, count: number)
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `start` | `number` | Starting offset in the index buffer. |
| `count` | `number` | Number of indices to draw. |
