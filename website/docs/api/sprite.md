# Sprite

`Sprite` is a flat image in the 3D scene that turns to face the camera: an enemy, a pickup, a tree or a particle. The image can be a sprite sheet, and `setFrame` picks which cell to draw. It extends [`Mesh`](/api/mesh), so position, scale, parenting, picking and frustum culling work as usual.

```javascript
import { Sprite, Material, Scene, Vec2, Vec3 } from '@1pizzateam/roostr';

const ghost = new Sprite(gl, {
  size: new Vec2(40, 60),
  texture: atlasCanvas,   // four poses side by side
  frames: 4,
  anchor: 'bottom',       // its feet are on the mesh position
  billboard: 'cylindrical' // stays upright, turns to face the camera
});

ghost.setPosition(new Vec3(x, 0, z));
ghost.setFrame(2);
scene.addMesh(ghost);
```

---

## Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `size` | `Vec2` | Size of the sprite in world units (default `new Vec2(1, 1)`). |
| `texture` | `TextureSource` | Image to draw. It can also be set later with `setTexture`. |
| `textureOptions` | `ITextureOptions` | Filtering, wrapping and size (for a `Uint8Array`). Use `NEAREST` filters for pixel art. |
| `frames` | `number` | Equal cells laid side by side in the image. Default `1`. |
| `anchor` | `'center' \| 'bottom'` | Which point sits on the mesh position: its middle, or the middle of its bottom edge. Default `'center'`. |
| `billboard` | `'spherical' \| 'cylindrical' \| 'none'` | How it turns to the camera. Default `'spherical'`. |
| `alphaCutoff` | `number` | Pixels with alpha below this are not drawn. Default `0.5`. |
| `depthBias` | `number` | Draws the sprite as if it were this many world units nearer the camera, without changing its size or position on screen. A big sprite such as an explosion needs it, or the walls and floor around it cut it off flat. Default `0`. |
| `material` | `Material` | Its diffuse colour is multiplied into the image, so it works as a tint. Default is white. |
| `fragment` | `string` | Replaces the built-in fragment shader (see below). |

### Billboard modes

| Mode | Behaviour |
| :--- | :--- |
| `'spherical'` | The sprite is parallel to the screen, whatever the camera does. Good for particles. |
| `'cylindrical'` | The sprite stays upright and only turns about the vertical axis. Good for things standing on the ground. |
| `'none'` | A flat quad that follows the mesh rotation like any other mesh. |

While it is a billboard the mesh rotation is ignored; scale still applies.

---

## Methods

| Method | Description |
| :--- | :--- |
| `setFrame(frame)` | Draws that cell of the sprite sheet, counted from the left. Values outside the range wrap around. |
| `getFrame()` | The cell currently drawn. |
| `setFrames(frames)` | Changes the total number of frames in the sprite sheet. |
| `getFrames()` | The total number of frames. |
| `setBillboard(mode)` | Dynamically updates billboard mode (`'spherical'`, `'cylindrical'`, or `'none'`) and refreshes local bounds. |
| `getBillboard()` | The current billboard mode. |
| `setAlphaCutoff(cutoff)` | Changes the alpha cutoff. |
| `getAlphaCutoff()` | The current alpha cutoff. |
| `setDepthBias(bias)` | Sets the depth bias in world units. |
| `getDepthBias()` | The current depth bias. |
| `getWidth()` | The width of the sprite in world units. |
| `getHeight()` | The height of the sprite in world units. |
| `getSize(target?)` | Returns the `Vec2` dimensions of the sprite in world units. |
| `getAnchor()` | The anchor point (`'center'` or `'bottom'`). |

Image rows are read like any other RoostR texture: with the default `flipY`, the first row of the image is the top of the sprite.

---

## Raycasting and Picking

Sprites fully support 3D raycasting and picking via [`scene.raycast(ray)`](/api/scene#raycast) or `sprite.raycast(ray)`. When billboard mode is `'spherical'` or `'cylindrical'`, `raycast` dynamically computes the camera-facing billboard plane and quad boundaries facing the ray, allowing precise pointer and cursor intersection from any viewing angle in 3D space with zero allocations.

---

## Context loss

The texture belongs to the mesh, so `Scene.restore()` rebuilds it after a lost context, like the rest of the mesh. A texture assigned by hand as a `WebGLTexture` cannot be rebuilt: set it again.

---

## Custom fragment shader

To change how the image is coloured (a palette, an effect, flaring eyes), pass your own `fragment`. The built-in vertex shader still places the sprite and gives it these varyings:

| Varying | Description |
| :--- | :--- |
| `vTextureCoord` | The texture coordinate, already moved to the current frame. |
| `vDepth` | Distance from the camera along the view axis, for fog. |

Uniforms such as `uSampler`, `uMaterialDiffuse`, `uAlphaCutoff` and the fog uniforms (`uHasFog`, `uFogColor`, `uFogNear`, `uFogFar`) are filled in for you. Extra values can be added with `addCustomUniform`.

```javascript
const sprite = new Sprite(gl, {
  size: new Vec2(32, 32),
  texture: image,
  fragment: `
    precision mediump float;
    uniform sampler2D uSampler;
    varying vec2 vTextureCoord;
    void main(void) {
      vec4 texel = texture2D(uSampler, vTextureCoord);
      if (texel.a < 0.5) discard;
      gl_FragColor = vec4(vec3(texel.r), 1.0);
    }
  `
});
```
