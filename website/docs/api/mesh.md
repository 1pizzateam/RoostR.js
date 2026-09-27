# Mesh

The foundational 3D scene node representing a renderable geometry bound to WebGL vertex/index/normal buffers, materials, and shader programs.

```javascript
import { Mesh, Cube, PhongShader, Material, Vec3 } from '@1pizzateam/roostr';

const mesh = new Mesh(gl, new Cube(1.5));
mesh.addProgram(PhongShader.create(gl));
mesh.addMaterial(new Material({ diffuse: new Vec3(0.9, 0.5, 0.1) }));
mesh.setPosition(0, 1, 0);
scene.addMesh(mesh);
```

---

## Constructor

```typescript
new Mesh(context: WebGLRenderingContext, geometry: IGeometry)
```

Allocates hardware WebGL vertex (`ARRAY_BUFFER`), index (`ELEMENT_ARRAY_BUFFER`), normal, and UV buffers according to the provided `geometry`. Computes initial local bounding volumes (`BoundingBox`, `BoundingSphere`).

---

## Transform & Hierarchy Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `modelMatrix` | `Mat4x3` | Local transformation matrix (translation, rotation, scale). |
| `worldMatrix` | `Mat4x3` | Combined world transformation matrix including parent transforms. |
| `normalMatrix` | `Mat3` | Transposed inverse 3x3 normal matrix for lighting calculations. |
| `boundingBox` | `BoundingBox` | World-space Axis-Aligned Bounding Box (AABB) (cached). |
| `boundingSphere` | `BoundingSphere` | World-space bounding sphere (cached). |
| `children` | `Mesh[]` | Child meshes attached to this scene node. |
| `active` | `boolean` | When false, skips rendering of this mesh. |
| `blendMode` | `boolean` | When true, renders during the blended pass. |
| `primitive` | `number` | WebGL drawing primitive (e.g. `gl.TRIANGLES`, `gl.LINE_STRIP`). |

---

## Spatial & Transform Methods

### `setPosition(x: number | Vec3, y?: number, z?: number): void`

Set the mesh local position.

```javascript
mesh.setPosition(0, 2.5, -4);
// Or using Spock Vec3
mesh.setPosition(new Vec3(0, 2.5, -4));
```

### `setRotation(x: number | Vec3, y?: number, z?: number): void`

Set the Euler rotation in radians.

```javascript
mesh.setRotation(0, Math.PI / 4, 0);
```

### `setScale(x: number | Vec3, y?: number, z?: number): void`

Set the non-uniform or uniform local scale.

```javascript
mesh.setScale(1.5, 2.0, 1.5);
```

### `setQuaternion(q: Quat): void`

Rotate the mesh using a Spock `Quat` quaternion.

### `translate(x: number, y: number, z: number): void`

Translate the mesh relative to its current position.

### `rotateX(rad: number) / rotateY(rad: number) / rotateZ(rad: number): void`

Rotate around the respective local coordinate axes.

### `lookAt(target: Vec3, up?: Vec3): void`

Orient the mesh forward vector (+Z) towards a target 3D point in world space.

### `scaleBy(factor: number | Vec3): void`

Multiply the current mesh scale by a scalar factor or vector.

### `slerp(targetRotation: Quat, t: number): void`

Spherical linear interpolation between current rotation and a target quaternion by alpha `t` $\in [0, 1]$.

---

## Spatial Queries

### `getWorldPosition(): Vec3`

Extract the world-space position vector directly from `worldMatrix`.

### `getWorldDirection(): Vec3`

Compute the normalized forward direction vector in world coordinates.

### `distanceTo(target: Vec3 | Mesh): number`

Compute Euclidean distance to another mesh or 3D vector.

### `isInsideBounds(point: Vec3): boolean`

Check if a world-space point is inside the mesh's transformed bounding box.

### `raycast(ray: Ray): { distance: number, point: Vec3 } | null`

Test ray intersection against the mesh bounding box and geometry.

---

## Materials & Shader Programs

### `addProgram(program: Program | null): boolean`

Attach a compiled WebGL shader program.

### `addMaterial(material: Material): void`

Attach surface lighting material parameters.

### `setTexture(image: TextureSource, options?: ITextureOptions): void`

Load and upload a 2D texture map to the mesh's sampler uniform.

### `addCustomUniform(name: string, type: UniformType, value: any): void`

Register a custom shader uniform.

### `setCustomUniform(name: string, value: any): void`

Update the value of an existing custom uniform.

### `destroy(): void`

Delete all associated WebGL buffers (`vertexBuffer`, `indexBuffer`, `normalBuffer`, `uvBuffer`) and textures to prevent GPU memory leaks.
