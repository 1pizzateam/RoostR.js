# Mesh

The foundational 3D scene node representing a renderable geometry bound to WebGL vertex/index/normal buffers, materials, and shader programs.

```javascript
import { Mesh, Cube, PhongShader, Material, Vec3 } from '@1pizzateam/roostr';

const mesh = new Mesh(new Cube(1.5), gl);
mesh.addProgram(PhongShader.create(gl));
mesh.addMaterial(new Material({ diffuse: new Vec3(0.9, 0.5, 0.1) }));
mesh.setPosition(0, 1, 0);
scene.addMesh(mesh);
```

---

## Constructor

```typescript
new Mesh(
  meshOrContext: IGeometry | WebGLRenderingContext,
  contextOrMesh: WebGLRenderingContext | IGeometry
)
```

Supports both parameter orders:
- `new Mesh(geometry, context)`
- `new Mesh(context, geometry)`

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
| `blendMode` | `boolean` | When true, renders during the blended pass with alpha sorting. |
| `blendOptions` | `{ equation, source, destination }` | GL blend names used in the blended pass (default `FUNC_ADD`, `SRC_ALPHA`, `ONE`). |
| `depthWrite` | `boolean` | Whether the mesh writes to the depth buffer (default `true`). |
| `primitive` | `number` | WebGL drawing primitive (e.g. `gl.TRIANGLES`, `gl.LINE_STRIP`). |

---

## Spatial & Transform Methods

### `setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the mesh local position.

```javascript
mesh.setPosition(0, 2.5, -4);
// Or using Spock Vec3
mesh.setPosition(new Vec3(0, 2.5, -4));
```

### `setRotation(xOrVec: Vec3 | number[] | number, y?: number, z?: number): this`

Set the Euler rotation in radians. The mesh's `quaternion` is the single source of truth: `mesh.rotation` is a getter that derives the Euler angles from it on demand (use `setRotation` to change it).

```javascript
mesh.setRotation(0, Math.PI / 4, 0);
```

### `setScale(xOrVec: Vec3 | number, y?: number, z?: number): void`

Set the non-uniform or uniform local scale.

```javascript
mesh.setScale(1.5, 2.0, 1.5);
```

### `setQuaternion(q: Quat): void`

Rotate the mesh using a Spock `Quat` quaternion.

### `translate(xOrVec: Vec3 | number, y?: number, z?: number): void`

Translate the mesh relative to its current position.

### `rotateX(rad: number) / rotateY(rad: number) / rotateZ(rad: number): void`

Rotate around the respective local coordinate axes.

### `rotateOnAxis(axis: Vec3, angle: number): void`

Rotate around an arbitrary 3D axis vector.

### `lookAt(target: Vec3, up?: Vec3): this`

Orient the mesh so its -Z axis faces a target 3D point (`Quat.lookAt`). Unchanged if the mesh is already at the target.

### `scaleBy(factor: number | Vec3): void`

Multiply the current mesh scale by a scalar factor or vector.

### `slerp(targetRotation: Quat, t: number): void`

Spherical linear interpolation between current rotation and a target quaternion by alpha `t` $\in [0, 1]$.

---

## Spatial Queries

### `setBlend(source?: string, destination?: string, equation?: string): this`

Activates blending for this mesh with GL factor names (defaults `SRC_ALPHA`, `ONE`, `FUNC_ADD`, i.e. additive). Blended meshes are drawn after opaque ones, farthest first.

```javascript
glass.setBlend('SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA').setDepthWrite(false);
```

### `setDepthWrite(enabled: boolean): this`

Controls whether the mesh writes to the depth buffer. Usually disabled for alpha-blended meshes.

### `getWorldPosition(target?: Vec3): Vec3`

Extract the world-space position vector directly from `worldMatrix`.

### `getWorldDirection(target?: Vec3): Vec3`

Compute the normalized forward direction vector in world coordinates.

### `distanceTo(target: Vec3 | Mesh): number`

Compute Euclidean distance to another mesh or 3D vector.

### `isInsideBounds(min: Vec3, max: Vec3): boolean`

Check if a world-space point or bounding volume is inside the mesh's transformed bounding box.

### `raycast(ray: Ray): { distance: number, point: Vec3 } | null`

Test ray intersection against the mesh bounding box and geometry.

---

## Material & Shader Helpers

RoostR provides one-line convenience helpers to configure shaders, materials, and textures without boilerplate:

### `useBasicMaterial(options?: { color?: Vec3, texture?: TextureSource }): void`

Instantly creates and binds an unlit `BasicShader` with optional color and texture map.

### `usePhongMaterial(options?: { ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, shininess?: number, texture?: TextureSource }): void`

Instantly creates and binds a `PhongShader` and `Material` with optical parameters and optional diffuse texture.

### `useNormalMaterial(): void`

Instantly creates and binds a `NormalShader` to visualize surface curvature.

---

## Low-Level Materials & Shaders

### `addProgram(program: Program | null): boolean`

Attach a compiled WebGL shader program.

### `addMaterial(material: Material): void`

Attach surface lighting material parameters.

### `setTexture(image: TextureSource, options?: ITextureOptions): void`

Uploads and sets a 2D texture map to the mesh's sampler uniform.

### `addCustomUniform(name: string, type: string, value: any): void`

Register a custom shader uniform.

### `setCustomUniform(name: string, value: any): void`

Update the value of an existing custom uniform.

### `destroy(): void`

Delete all associated WebGL buffers (`vertexBuffer`, `indexBuffer`, `normalBuffer`, `uvBuffer`) and textures to prevent GPU memory leaks.
