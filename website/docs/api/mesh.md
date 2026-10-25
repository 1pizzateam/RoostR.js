# Mesh

The foundational 3D scene node extending [`Node<Mesh>`](/api/node) and representing a renderable geometry bound to WebGL vertex/index/normal/UV buffers, materials, textures, and shader programs.

```javascript
import { Mesh, Cube, PhongShader, Material, Vec3 } from '@1pizzateam/roostr';

const mesh = new Mesh(new Cube(new Vec3(1.5, 1.5, 1.5)), gl);
mesh.addProgram(PhongShader.create(gl));
mesh.addMaterial(new Material({ diffuse: new Vec3(0.9, 0.5, 0.1) }));
mesh.setPosition(new Vec3(0, 1, 0));
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
| `bufferUsage` | `'STATIC_DRAW' \| 'DYNAMIC_DRAW'` | WebGL buffer usage hint inherited from the source geometry (default `'STATIC_DRAW'`). |

---

## Spatial & Transform Methods

### `setPosition(position: Vec3): this`

Set the mesh local position.

```javascript
mesh.setPosition(new Vec3(0, 2.5, -4));
```

### `setRotation(rotation: Vec3): this`

Set the Euler rotation in radians. The mesh's `quaternion` is the single source of truth: `mesh.rotation` is a getter that derives the Euler angles from it on demand (use `setRotation` to change it).

```javascript
mesh.setRotation(new Vec3(0, Math.PI / 4, 0));
```

### `setScale(scale: Vec3): this`

Set the non-uniform or uniform local scale.

```javascript
mesh.setScale(new Vec3(1.5, 2.0, 1.5));
```

### `setQuaternion(q: Quat): this`

Rotate the mesh using a Spock `Quat` quaternion.

### `translate(translation: Vec3): this`

Translate the mesh relative to its current position.

### `rotateX(rad: number) / rotateY(rad: number) / rotateZ(rad: number): this`

Rotate around the respective local coordinate axes.

### `rotateOnAxis(axis: Vec3, angle: number): this`

Rotate around an arbitrary 3D axis vector.

### `lookAt(target: Vec3, up?: Vec3): this`

Orient the mesh so its -Z axis faces a target 3D point (`Quat.lookAt`). Unchanged if the mesh is already at the target.

### `scaleBy(factor: Vec3): this`

Multiply the current mesh scale by a vector factor.

### `slerp(targetRotation: Quat, t: number): this`

Spherical linear interpolation between current rotation and a target quaternion by alpha `t` $\in [0, 1]$.

### `addChild(node: Mesh): void` / `removeChild(node: Mesh): boolean`

Attaches or detaches a child `Mesh` in the scene graph hierarchy. Adding a node that is already a direct child of this mesh is a no-op.

### `setActive(): void` / `setInactive(): void` / `toggleActive(): boolean` / `isActive(): boolean`

Controls and queries whether this mesh (and its subtree) is active during scene rendering and world-matrix traversal.

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

### `isInsideBounds(box: BoundingBox): boolean`

Check if the mesh's world-space position is inside the given `BoundingBox`.

### `setLocalBounds(box: BoundingBox): this`

Sets the local-space `BoundingBox` (and derives `localBoundingSphere`) used for frustum culling and picking when geometry vertices are populated or updated after construction.

### `raycast(ray: Ray, precise: boolean = false): { distance: number, point: Vec3 } | null`

Tests ray intersection against the mesh's world-space bounding sphere by default. When `precise` is `true`, also tests individual triangles (`TRIANGLES` and `TRIANGLE_STRIP`) in local space.

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

### `addProgram(vertexShaderOrProgram: string | WebGLProgram, fragmentShaderOrMaterial?: string | Material, material?: Material): boolean`

Attaches a compiled WebGL shader program (or acquires a shared program from vertex and fragment GLSL source strings) and pairs it with a `Material`.

### `clearPrograms(): void`

Releases all attached shader programs and clears the mesh's materials list.

### `addMaterial(material: Material): boolean`

Attach surface lighting material parameters.

### `setTexture(image: TextureSource, options?: ITextureOptions): void`

Uploads and sets an owned 2D texture map to the mesh's sampler uniform.

### `setSharedTexture(texture: WebGLTexture | null): void`

Assigns an externally managed or shared `WebGLTexture` (or clears it with `null`) without taking ownership or deleting the texture when replaced or when `destroy()` is called.

### `addCustomUniform(name: string, type: string, value: UniformValue): void`

Register a custom shader uniform.

### `setCustomUniform(name: string, value: UniformValue): void`

Update the value of an existing custom uniform.

### `restore(): void`

Rebuilds the mesh's WebGL buffers, shared shader programs, custom uniform locations, owned textures, and child meshes after a `webglcontextrestored` event.

### `destroy(): void`

Delete all associated WebGL buffers (`vertexBuffer`, `indexBuffer`, `normalBuffer`, `texCoordBuffer`), release programs, and delete owned textures to prevent GPU memory leaks.
