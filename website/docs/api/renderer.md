# Renderer

Low-level WebGL context manager controlling driver state, viewport dimensions, color clearing, polygon culling, and alpha blending.

```javascript
import { Renderer, Vec2 } from '@1pizzateam/roostr';

const renderer = new Renderer(gl, {
  viewport: { x: 0, y: 0, width: 800, height: 600 },
  clearColor: [0.08, 0.1, 0.14, 1.0],
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

### `setSize(sizeOrWidth: Vec2 | number, height?: number): void`

Resizes the rendering viewport and canvas buffer dimensions:

```javascript
renderer.setSize(new Vec2(1024, 768));
// Or:
renderer.setSize(1024, 768);
```

### `setViewport(x: number, y: number, width: number, height: number): void`

Set the WebGL rendering viewport rectangle (`gl.viewport`).

### `setClearColor(r: number, g: number, b: number, a: number = 1.0): void`

Set the background clear color (`gl.clearColor`).

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
