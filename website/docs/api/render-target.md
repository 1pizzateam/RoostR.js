# RenderTarget

Encapsulates an offscreen WebGL framebuffer (`WebGLFramebuffer`) with an attached color `Texture` and depth buffer, enabling multi-pass post-processing, screen capture, and dynamic reflection maps.

```javascript
import { RenderTarget, FullscreenQuad, Mesh } from '@1pizzateam/roostr';

// 1. Create target matching screen resolution
const renderTarget = new RenderTarget(gl, 800, 600);

// 2. Direct render calls into the target
renderTarget.bind();
scene.render(camera);
renderTarget.unbind();

// 3. Texture is now available for sampling
postQuadMesh.setTexture(renderTarget.texture);
```

---

## Constructor

```typescript
new RenderTarget(
  context: WebGLRenderingContext,
  width: number,
  height: number,
  options?: IRenderTargetOptions
)
```

Automatically allocates a `WebGLFramebuffer`, attaches an RGBA `Texture` to `gl.COLOR_ATTACHMENT0`, and creates a `WebGLRenderbuffer` for 16-bit depth testing (`gl.DEPTH_ATTACHMENT`).

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `texture` | `Texture` | Color texture holding the rendered output. |
| `framebuffer` | `WebGLFramebuffer` | WebGL framebuffer object. |
| `depthBuffer` | `WebGLRenderbuffer`| Depth renderbuffer object. |
| `width` | `number` | Framebuffer width in pixels. |
| `height` | `number` | Framebuffer height in pixels. |

---

## Methods

### `bind(): void`

Direct subsequent draw calls and clears into this offscreen framebuffer. Updates the WebGL viewport to match the render target dimensions.

### `unbind(): void`

Restores rendering back to the default display canvas framebuffer (`null`).

### `setSize(width: number, height: number): void`

Reallocates the color texture and depth renderbuffer to match new dimensions upon window resize.

### `destroy(): void`

Deletes the WebGL framebuffer, depth renderbuffer, and texture objects to prevent GPU memory leaks.
