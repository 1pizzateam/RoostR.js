# Examples & Recipes

Practical code recipes showing how to combine RoostR.js modules to build interactive 3D WebGL experiences.

## 1. Setting Up Interactive OrbitControls

`OrbitControls` adds smooth orbiting, panning, and distance zooming to any `PerspectiveCamera` or `OrthographicCamera`.

```javascript
import { Scene, PerspectiveCamera, OrbitControls, Mesh, Cube, BasicShader, Vec2, Vec3 } from '@1pizzateam/roostr';
import { Player } from '@1pizzateam/loopr';

const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

const scene = new Scene({
  canvasId: canvas,
  context: gl,
  viewport: new Vec2(canvas.width, canvas.height)
});

const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
camera.setPosition(new Vec3(0, 3, 6));
camera.lookAt(new Vec3(0, 0, 0));

// Initialize controls attached to canvas
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.0;
controls.maxDistance = 25.0;

const mesh = new Mesh(new Cube(new Vec3(1.5, 1.5, 1.5)), gl);
mesh.addProgram(BasicShader.create(gl));
scene.addMesh(mesh);

const player = new Player(() => {
  // Update orbital inertia every frame
  controls.update();
  scene.render(camera);
});
player.start();
```

---

## 2. Dynamic Multi-Light Studio (Sun + Point + Spot)

RoostR flattens heterogeneous lights into GPU-ready typed array buffers automatically.

```javascript
import {
  Scene,
  PerspectiveCamera,
  Mesh,
  Sphere,
  Plane,
  PhongShader,
  Material,
  DirectionalLight,
  PointLight,
  SpotLight,
  AmbientLight,
  Vec2,
  Vec3
} from '@1pizzateam/roostr';

const scene = new Scene({ canvasId: canvas, context: gl, viewport: new Vec2(800, 600) });
const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), gl);
camera.setPosition(new Vec3(0, 3, 7));
camera.lookAt(new Vec3(0, 1, 0));

// 1. Directional Sun (pointing downward toward scene)
const sun = new DirectionalLight(new Vec3(-0.5, -1.0, -0.3));
sun.setDiffuse(new Vec3(0.85, 0.85, 0.9));
sun.setSpecular(new Vec3(0.6, 0.6, 0.6));
scene.addLight(sun);

// 2. Moving Point Light with Quadratic Falloff
const candle = new PointLight(new Vec3(2, 1.5, 1));
candle.setDiffuse(new Vec3(1.0, 0.5, 0.1)); // Warm fire
candle.setLinearAttenuation(0.15);
candle.setQuadraticAttenuation(0.05);
scene.addLight(candle);

// 3. Overhead Conical Spotlight
const spot = new SpotLight(new Vec3(0, 5, 0));
spot.setDirection(new Vec3(0, -1, 0));
spot.setCutoff(35.0); // 35 degree beam cone
spot.setExponent(16.0); // Focus intensity
spot.setDiffuse(new Vec3(0.2, 0.6, 1.0)); // Cyan beam
scene.addLight(spot);

// 4. Soft Ambient Illumination
const ambient = new AmbientLight(new Vec3(0.4, 0.42, 0.5));
scene.addLight(ambient);

// Add receiving meshes
const sphere = new Mesh(new Sphere(1.2, 32, 24), gl);
sphere.addProgram(PhongShader.create(gl));
sphere.addMaterial(new Material({
  ambient: new Vec3(0.15, 0.15, 0.15),
  diffuse: new Vec3(0.9, 0.5, 0.1),
  specular: new Vec3(1.0, 1.0, 1.0),
  shininess: 64.0
}));
sphere.setPosition(new Vec3(0, 1.2, 0));
scene.addMesh(sphere);
```

---

## 3. Screen-Space Raycasting & Object Selection

Convert canvas click/mouse coordinates into Normalized Device Coordinates (NDC $[-1, 1]$), cast a 3D ray through the camera, and test for mesh intersections.

```javascript
import { Ray, Vec2, Vec3 } from '@1pizzateam/roostr';

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

  // 1. Cast a ray through camera viewport using Vec2 NDC
  const ray = camera.getRay(new Vec2(ndcX, ndcY));

  // 2. Perform scene raycast
  const hits = scene.raycast(ray);

  if (hits.length > 0) {
    const nearest = hits[0];
    console.log(`Hit mesh at distance ${nearest.distance}`, nearest.mesh);
    // Highlight selected mesh
    nearest.mesh.materials[0].setDiffuse(new Vec3(1.0, 0.2, 0.2));
  }
});
```

---

## 4. Atmospheric Distance Fog

RoostR's `PhongShader` includes built-in linear distance fog support.

```javascript
// Enable atmospheric distance fog in the scene
scene.setFog(new Vec3(0.04, 0.06, 0.10), 3.0, 16.0);

// Disable or clear distance fog
scene.clearFog();
```

---

## 5. Post-Processing with RenderTarget

Render your 3D scene into an offscreen framebuffer texture, then draw it as a full-screen quad with a custom post-processing shader (e.g. grayscale, vignette, or scanlines).

```javascript
import { RenderTarget, Mesh, FullscreenQuad, Program, Shader, Vec2 } from '@1pizzateam/roostr';

// 1. Create RenderTarget matching canvas resolution
const renderTarget = new RenderTarget(new Vec2(canvas.width, canvas.height), gl);

// 2. In your render loop:
function renderFrame() {
  // Pass A: Render 3D scene into offscreen framebuffer
  renderTarget.bind();
  scene.render(camera);
  renderTarget.unbind();

  // Pass B: Draw full-screen quad using renderTarget.texture
  postMesh.setTexture(renderTarget.texture);
  postMesh.render(quadCamera);
}
```
