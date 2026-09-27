# CustomMesh & SubMesh

`CustomMesh` allows importing or procedurally building arbitrary 3D geometry from raw vertex positions, index arrays, UV coordinates, and normals.

```javascript
import { CustomMesh, Mesh, PhongShader } from '@1pizzateam/roostr';

const customGeom = new CustomMesh();

// 1. Supply vertices (x, y, z triplets)
customGeom.vertices = new Float32Array([
  -1, 0,  1,
   1, 0,  1,
   0, 1.5, 0,
   0, 0, -1
]);

// 2. Supply triangle indices
customGeom.indices = new Uint16Array([
  0, 1, 2, // Front face
  1, 3, 2, // Right face
  3, 0, 2, // Left face
  0, 3, 1  // Bottom face
]);

// 3. Compute smooth vertex normals automatically
customGeom.computeVertexNormals();

const mesh = new Mesh(gl, customGeom);
mesh.addProgram(PhongShader.create(gl));
scene.addMesh(mesh);
```

---

## `CustomMesh` Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `vertices` | `Float32Array \| number[]` | Flat array of 3D vertex positions $[x, y, z]$. |
| `indices` | `Uint16Array \| Uint32Array \| number[]` | Flat array of triangle index triplets. |
| `normals` | `Float32Array \| number[]` | Flat array of normal vectors $[n_x, n_y, n_z]$. |
| `uvs` | `Float32Array \| number[]` | Flat array of texture mapping coordinates $[u, v]$. |
| `subMeshes` | `SubMesh[]` | Optional array of distinct submesh index slices. |

---

## Methods

### `computeVertexNormals(): void`

Iterates over every triangle face, calculates the normalized geometric face normal via the cross product:

$$\vec{N}_{\text{face}} = \frac{(\vec{v}_1 - \vec{v}_0) \times (\vec{v}_2 - \vec{v}_0)}{\|(\vec{v}_1 - \vec{v}_0) \times (\vec{v}_2 - \vec{v}_0)\|}$$

Accumulates face normals into each participating vertex and renormalizes the result to produce smooth lighting normals across curved surfaces.

---

## `SubMesh`

Represents a specific segment of indices within a larger mesh buffer, enabling distinct materials or textures per section.

```typescript
new SubMesh(offset: number, count: number, materialIndex: number = 0)
```
