# Renderer

Low-level WebGL context manager controlling driver state, viewport dimensions, color clearing, polygon culling, and alpha blending.

```javascript
import { Renderer, Vec2, Vec3 } from '@1pizzateam/roostr';

const renderer = new Renderer(gl, {
  viewport: new Vec2(800, 600),
  clearColor: new Vec3(0.08, 0.1, 0.14),
  cullFace: 'BACK',
  frontFace: 'CCW',
  depthTest: true
});
```

---

## Constructor

```typescript
new Renderer(context: WebGLRenderingContext, options?: IRendererOptions)
```

---

## Methods

### `setSize(size: Vec2): void`

Resizes the rendering viewport and canvas buffer dimensions:

```javascript
renderer.setSize(new Vec2(1024, 768));
```

### `getSize(target?: Vec2): Vec2`

Returns the current canvas buffer size into an optional target `Vec2`.

### `setViewport(size: Vec2): void`

Set the WebGL rendering viewport dimensions `Vec2(width, height)`.

### `setClearColor(color: Vec3, alpha: number = 1.0): void`

Set the background clear RGB color and alpha.

### `clear(color: boolean = true, depth: boolean = true, stencil: boolean = false): void`

Clears the configured buffers using `gl.clear`.

### `setCullFace(mode: 'BACK' | 'FRONT' | 'NONE'): void`

Enable or disable polygon backface culling (`gl.CULL_FACE`).

### `setFrontFace(mode: 'CCW' | 'CW'): void`

Configure front-facing polygon winding order (`gl.CCW` counter-clockwise or `gl.CW` clockwise).

### `setDepthTest(enable: boolean): void`

Enable or disable the z-buffer depth test (`gl.DEPTH_TEST`).

### `enableBlendMode(srcFactor?: number, dstFactor?: number): void`

Enable alpha blending with standard transparency weights (`gl.SRC_ALPHA`, `gl.ONE_MINUS_SRC_ALPHA`).

### `disableBlendMode(): void`

Disable WebGL blending.

### `getCanvas(): HTMLCanvasElement | null`

Returns the canvas element associated with the WebGL rendering context.

### `destroy(): void`

Cleans up renderer state and releases references.
