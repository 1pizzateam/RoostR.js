# RenderTarget

Encapsulates an offscreen WebGL framebuffer (`WebGLFramebuffer`) with an attached color `WebGLTexture` and depth buffer, enabling multi-pass post-processing, screen capture, and dynamic reflection maps.

```javascript
import { RenderTarget, Vec2 } from '@1pizzateam/roostr';

// 1. Create target matching screen resolution
const renderTarget = new RenderTarget(new Vec2(800, 600), gl);

// 2. Direct render calls into the target
renderTarget.bind();
scene.render(camera);
renderTarget.unbind();

// 3. Texture is now available for sampling
postQuadMesh.setSharedTexture(renderTarget.texture);
```

---

## Constructor

```typescript
new RenderTarget(size: Vec2, context: WebGLRenderingContext)
```

Automatically allocates a `WebGLFramebuffer`, attaches an RGBA `WebGLTexture` to `gl.COLOR_ATTACHMENT0`, and creates a `WebGLRenderbuffer` for 16-bit depth testing (`gl.DEPTH_ATTACHMENT`).

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `texture` | `WebGLTexture` | Hardware texture holding the rendered color output. |
| `framebuffer` | `WebGLFramebuffer` | WebGL framebuffer object. |
| `depthBuffer` | `WebGLRenderbuffer`| Depth renderbuffer object. |
| `size` | `Vec2` | Framebuffer dimensions in pixels. |

---

## Methods

### `bind(): void`

Directs subsequent draw calls and clears into this offscreen framebuffer. Automatically updates the WebGL viewport to match the render target dimensions.

### `unbind(viewportSize?: Vec2): void`

Restores rendering back to the default display canvas framebuffer (`null`). Optionally resets the viewport using a Spock `Vec2`.

### `getSize(target: Vec2 = new Vec2()): Vec2`

Returns the dimensions of the render target as a Spock `Vec2`.

### `setSize(size: Vec2): void`

Reallocates the color texture and depth renderbuffer to match new dimensions upon window resize. Accepts a `Vec2`:

```javascript
renderTarget.setSize(new Vec2(window.innerWidth, window.innerHeight));
```

### `restore(): void`

Recreates the framebuffer, color texture, and depth renderbuffer after a `webglcontextrestored` event. Since `renderTarget.texture` is a newly allocated `WebGLTexture`, re-assign it to any mesh sampling it via `mesh.setSharedTexture(renderTarget.texture)`.

### `dispose(): void`

Deletes the WebGL framebuffer, depth renderbuffer, and texture objects to prevent GPU memory leaks.
