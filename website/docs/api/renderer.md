# Renderer

Canvas and WebGL context lifecycle manager handling canvas resolution, driver capabilities, viewport dimensions, color clearing, polygon culling, and WebGL context loss/restoration (`webglcontextlost` / `webglcontextrestored`).

```javascript
import { Renderer, Vec2, Vec3 } from '@1pizzateam/roostr';

const renderer = new Renderer('webgl-canvas', {
  size: new Vec2(1280, 720),
  contextAttributes: { antialias: true, alpha: false },
  onContextLost: () => loop.stop(),
  onContextRestored: () => {
    scene.restore();
    renderTarget.restore();
    loop.start();
  }
});
```

---

## Constructor

```typescript
new Renderer(canvasID: string | HTMLCanvasElement, options?: IRendererOptions)
```

### Options (`IRendererOptions`)

| Name | Type | Description |
| :--- | :--- | :--- |
| `size` | `Vec2` | Initial canvas buffer and viewport dimensions (default `new Vec2(1280, 720)`). |
| `contextAttributes` | `WebGLContextAttributes` | Forwarded to `canvas.getContext('webgl', attributes)` (`alpha` defaults to `false`). |
| `onContextLost` | `() => void` | Invoked when the browser fires `webglcontextlost`. |
| `onContextRestored` | `() => void` | Invoked after `webglcontextrestored` once RoostR has cleared its per-context `Program` cache and `GLState`. Call `scene.restore()` and `renderTarget.restore()` here. |

---

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `canvas` | `HTMLCanvasElement \| null` | The resolved HTML canvas element. |
| `context` | `WebGLRenderingContext \| null` | The underlying WebGL rendering context. |
| `isContextLost` | `boolean` | `true` while the WebGL context is in a lost state. |

---

## Methods

### `getContext(): WebGLRenderingContext | null`

Returns the underlying WebGL rendering context.

### `getCanvas(): HTMLCanvasElement | null`

Returns the canvas element associated with the renderer.

### `setSize(size: Vec2): void`

Resizes the canvas buffer dimensions and updates the WebGL viewport:

```javascript
renderer.setSize(new Vec2(1024, 768));
```

### `getSize(target: Vec2 = new Vec2()): Vec2`

Returns the current canvas buffer size into an optional target `Vec2`.

### `setViewport(size: Vec2): void`

Sets the WebGL rendering viewport dimensions `Vec2(width, height)` at origin `(0, 0)`.

### `setClearColor(color: Vec3, alpha: number = 1.0): void`

Sets the background clear RGB color (clamped to $[0, 1]$) and alpha.

### `clearFrame(): void`

Clears both `COLOR_BUFFER_BIT` and `DEPTH_BUFFER_BIT`.

### `enable(capability: string): void` / `disable(capability: string): void`

Enables or disables a named WebGL capability (e.g. `'DEPTH_TEST'`, `'CULL_FACE'`, `'BLEND'`).

### `setCullFace(mode: string): void`

Sets the polygon face culling mode (`'BACK'`, `'FRONT'`, or `'FRONT_AND_BACK'`).

### `setFrontFace(mode: string): void`

Configures front-facing polygon winding orientation (`'CCW'` or `'CW'`).

### `defaultSettings(): void`

Applies RoostR's default GL state (`OES_standard_derivatives`, `CW` front face, `BACK` face culling, full-canvas viewport, and black clear color).

### `dispose(): void`

Detaches the `webglcontextlost` and `webglcontextrestored` event listeners from the canvas.
