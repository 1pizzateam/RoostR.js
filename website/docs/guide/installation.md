# Installation

RoostR.js requires Node.js 22 or newer for development and is published as a tree-shakeable standard ES module (`roostr.js`) with full TypeScript declarations (`roostr.d.ts`).

## Package Managers

### npm

```bash
npm install @1pizzateam/roostr
```

### Yarn

```bash
yarn add @1pizzateam/roostr
```

### pnpm

```bash
pnpm add @1pizzateam/roostr
```

---

## Bundler / ESM Usage

Import the classes and shaders directly in your modern JavaScript or TypeScript build setup:

```javascript
import {
  Scene,
  PerspectiveCamera,
  OrbitControls,
  Mesh,
  Cube,
  PhongShader,
  Material,
  DirectionalLight,
  PointLight,
  Vec3
} from '@1pizzateam/roostr';

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height }
});
```

All 3D math types (`Vec3`, `Vec2`, `Mat4`, `Mat4x3`, `Mat3`, `Quat`, `Utils`) are re-exported directly from [`@1pizzateam/spock`](https://1pizzateam.github.io/Spock.js/) by RoostR, so you do not need to install additional math libraries.

---

## Direct Browser Script

RoostR is packaged as an ES module and can be imported directly into native browser scripts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RoostR 3D App</title>
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <canvas id="stage"></canvas>

  <script type="module">
    import {
      Scene,
      PerspectiveCamera,
      Mesh,
      Cube,
      PhongShader,
      Material,
      DirectionalLight,
      Vec2,
      Vec3
    } from './node_modules/@1pizzateam/roostr/dist/roostr.js';

    const canvas = document.getElementById('stage');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl');

    const scene = new Scene({
      canvasId: canvas,
      context: gl,
      viewport: new Vec2(canvas.width, canvas.height),
      clearColor: new Vec3(0.1, 0.12, 0.16)
    });

    const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
    camera.setPosition(new Vec3(0, 2, 5));
    camera.lookAt(new Vec3(0, 0, 0));

    const cube = new Mesh(new Cube(new Vec3(1.5, 1.5, 1.5)), gl);
    cube.addProgram(PhongShader.create(gl));
    cube.addMaterial(new Material({ diffuse: new Vec3(1.0, 0.5, 0.2) }));
    scene.addMesh(cube);

    const light = new DirectionalLight(new Vec3(0.5, 1.0, 0.5));
    scene.addLight(light);

    function loop() {
      requestAnimationFrame(loop);
      cube.rotateY(0.015);
      scene.render(camera);
    }
    loop();
  </script>
</body>
</html>
```

---

## Browser Support

RoostR.js supports all modern desktop and mobile browsers supporting WebGL 1.0 or WebGL 2.0:
- Chrome / Chromium-based browsers (Edge, Brave, Opera)
- Firefox
- Safari (macOS & iOS)
