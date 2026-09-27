# Texture

Hardware WebGL texture wrapper supporting image loading, canvas drawing, typed array pixel buffers, NPOT wrapping, and mipmap generation.

```javascript
import { Texture } from '@1pizzateam/roostr';

const texture = new Texture(gl);
texture.load('/assets/wood.jpg', {
  generateMipmaps: true,
  filter: 'LINEAR_MIPMAP_LINEAR',
  wrap: 'REPEAT'
});
```

---

## Constructor

```typescript
new Texture(context: WebGLRenderingContext, options?: ITextureOptions)
```

### Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `filter` | `string` | `'LINEAR'` | Minification filter (`'NEAREST'`, `'LINEAR'`, `'LINEAR_MIPMAP_LINEAR'`). |
| `magFilter` | `string` | `'LINEAR'` | Magnification filter (`'NEAREST'`, `'LINEAR'`). |
| `wrap` | `string` | `'CLAMP_TO_EDGE'` | Wrapping mode (`'CLAMP_TO_EDGE'`, `'REPEAT'`, `'MIRRORED_REPEAT'`). |
| `generateMipmaps`| `boolean` | `true` | Generate mipmap pyramid (only for power-of-two textures). |
| `format` | `number` | `gl.RGBA` | Pixel data format. |

---

## Methods

### `load(source: TextureSource, options?: ITextureOptions): Promise<Texture>`

Load an image from URL, `HTMLImageElement`, or `HTMLCanvasElement`. Automatically detects power-of-two dimensions; if the texture is non-power-of-two (NPOT), gracefully falls back to `CLAMP_TO_EDGE` and disables mipmaps to satisfy WebGL 1.0 specifications.

### `uploadPixels(data: ArrayBufferView, width: number, height: number): void`

Directly upload raw typed array byte buffers (e.g. `Uint8Array`) into GPU texture memory.

### `updateSubImage(data: ArrayBufferView, x: number, y: number, width: number, height: number): void`

Partially update a rectangular region of the texture using `gl.texSubImage2D` without reallocating texture memory.

### `bind(unit: number = 0): void`

Bind this texture to the designated WebGL texture unit (`gl.TEXTURE0 + unit`).

### `destroy(): void`

Delete the underlying WebGL texture object (`gl.deleteTexture`).
