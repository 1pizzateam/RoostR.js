# Texture

Utility object for creating, loading, updating, and configuring WebGL 2D textures (`WebGLTexture`).

```javascript
import { Texture, Mesh, Cube, BasicShader } from '@1pizzateam/roostr';

// 1. Load an image texture asynchronously
const webGLTexture = await Texture.load('/assets/wood.jpg', gl, {
  generateMipmaps: true,
  minFilter: gl.LINEAR_MIPMAP_LINEAR,
  magFilter: gl.LINEAR,
  wrapS: gl.REPEAT,
  wrapT: gl.REPEAT
});

// 2. Or attach directly to a mesh
mesh.setTexture(webGLTexture);
```

---

## Methods

### `Texture.create(source: TextureSource, context: WebGLRenderingContext, options?: ITextureOptions): WebGLTexture | null`

Creates and uploads a WebGL texture from an image, canvas, or typed array buffer.

#### `TextureSource` Types
- `HTMLImageElement`
- `HTMLCanvasElement`
- `ImageData`
- `ImageBitmap`
- `Uint8Array` (raw pixel buffer)

#### `ITextureOptions`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `wrapS` | `number` | `gl.CLAMP_TO_EDGE` | S-coordinate horizontal wrap mode (`gl.CLAMP_TO_EDGE`, `gl.REPEAT`, `gl.MIRRORED_REPEAT`). |
| `wrapT` | `number` | `gl.CLAMP_TO_EDGE` | T-coordinate vertical wrap mode. |
| `minFilter` | `number` | `gl.LINEAR` | Texture minification filter (e.g. `gl.LINEAR`, `gl.NEAREST`, `gl.LINEAR_MIPMAP_LINEAR`). |
| `magFilter` | `number` | `gl.LINEAR` | Texture magnification filter (`gl.LINEAR`, `gl.NEAREST`). |
| `flipY` | `boolean` | `true` | Unpack flip Y parameter for proper texture orientation. |
| `generateMipmaps`| `boolean` | `false` | Generates a mipmap pyramid using `gl.generateMipmap(gl.TEXTURE_2D)`. |
| `size` | `Vec2` | `Vec2(1, 1)` | Buffer dimensions when `source` is a `Uint8Array`. |

---

### `Texture.load(url: string, context: WebGLRenderingContext, options?: ITextureOptions): Promise<WebGLTexture | null>`

Asynchronously loads an image from a URL and resolves with the allocated `WebGLTexture`. Automatically sets `crossOrigin = 'anonymous'`.

```javascript
const texture = await Texture.load('textures/grass.png', gl, {
  wrapS: gl.REPEAT,
  wrapT: gl.REPEAT,
  generateMipmaps: true
});
```

---

### `Texture.update(texture: WebGLTexture, source: TextureSource, context: WebGLRenderingContext, offset: Vec2 = new Vec2(), size?: Vec2, flipY: boolean = true): void`

Partially or fully updates pixel data in an existing GPU texture using `gl.texSubImage2D` without reallocating texture memory.

```javascript
// Update a 128x128 sub-region of an active texture
Texture.update(webGLTexture, newPixelData, gl, new Vec2(0, 0), new Vec2(128, 128));
```

---

## Mesh Integration

Textures are most commonly applied directly via [`mesh.setTexture()`](/api/mesh#settexture):

```javascript
// Directly from an Image or Canvas element
mesh.setTexture(imageElement, { generateMipmaps: true });

// Or via convenient material helpers
mesh.useBasicMaterial({ texture: imageElement });
mesh.usePhongMaterial({ texture: imageElement, diffuse: new Vec3(1, 1, 1) });
```
