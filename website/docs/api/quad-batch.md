# QuadBatch

`QuadBatch` extends [`Mesh`](/api/mesh) with pre-allocated `DYNAMIC_DRAW` vertex and UV buffers for streaming up to `capacity` textured or colored 3D quads in a single draw call per frame.

```javascript
import { QuadBatch, Vec3 } from '@1pizzateam/roostr';

const batch = new QuadBatch(gl, {
  capacity: 256,
  sharedTexture: atlasTexture
});
scene.addMesh(batch);

// Rebuild batch contents each frame:
batch.begin();
batch.quad(
  [
    -1, 0, 0,
     1, 0, 0,
     1, 2, 0,
    -1, 2, 0
  ],
  [0, 0, 1, 1]
);
batch.end();
```

---

## Constructor

```typescript
new QuadBatch(context: WebGLRenderingContext, options: IQuadBatchOptions)
```

### Options (`IQuadBatchOptions`)

| Name | Type | Description |
| :--- | :--- | :--- |
| `options.capacity` | `number` | Maximum number of quads the batch can hold. |
| `options.vertexShader` | `string` | Custom vertex shader GLSL source (defaults to `BasicShader.vertex`). |
| `options.fragmentShader` | `string` | Custom fragment shader GLSL source (defaults to `BasicShader.fragment`). |
| `options.material` | `Material` | Custom material (defaults to white diffuse `Material`). |
| `options.texture` | `TextureSource` | Optional owned texture image/canvas to upload. |
| `options.textureOptions` | `ITextureOptions` | Optional texture parameters when `options.texture` is provided. |
| `options.sharedTexture` | `WebGLTexture \| null` | Optional externally managed `WebGLTexture` bound via `setSharedTexture`. |

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `capacity` | `number` | Maximum number of quads supported by the pre-allocated buffers. |
| `used` | `number` | Number of quads queued during the current `begin()` / `end()` cycle. |
| `bounds` | `BoundingBox` | Local-space bounding box accumulated across all quads added since `begin()`. |

---

## Methods

### `begin(): this`

Resets `used` to `0` and empties `bounds` in preparation for streaming quads for the current frame.

### `quad(corners: ArrayLike<number>, uv: ArrayLike<number>): boolean`

Appends a single quad from 4 corner positions (`12` floats: `[x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3]`) and a UV rectangle (`4` floats: `[u0, v0, u1, v1]`), expanding `bounds` to enclose all 4 corners. Returns `false` if the batch has already reached `capacity`.

### `end(): this`

Uploads the active slice of vertex and UV data via `gl.bufferSubData`, updates the submesh vertex count (`used * 6`), syncs `localBoundingBox` / `localBoundingSphere` from `bounds`, and activates the mesh (or marks it inactive when `used === 0`).

### `show(visible: boolean): void`

Activates the batch when `visible` is `true` and `used > 0`, or deactivates it otherwise.
