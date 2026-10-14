import { Sprite, SpriteShader, Material, Vec3 } from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

function createSprite(options = {}, context = createMockContext()) {
  const sprite = new Sprite(context, { width: 4, height: 6, ...options });
  return { sprite, context };
}

test("is built as two triangles of the requested size, centred on its position by default", () => {
  const { sprite } = createSprite();
  expect(sprite.primitive).toBe("TRIANGLES");
  expect(sprite.vertices).toHaveLength(18);
  const xs = [], ys = [];
  for (let i = 0; i < 18; i += 3) { xs.push(sprite.vertices[i]); ys.push(sprite.vertices[i + 1]); }
  expect(Math.min(...xs)).toBe(-2);
  expect(Math.max(...xs)).toBe(2);
  expect(Math.min(...ys)).toBe(-3);
  expect(Math.max(...ys)).toBe(3);
});

test("a bottom anchor puts the sprite's feet on its position", () => {
  const { sprite } = createSprite({ anchor: "bottom" });
  const ys = [];
  for (let i = 1; i < 18; i += 3) ys.push(sprite.vertices[i]);
  expect(Math.min(...ys)).toBe(0);
  expect(Math.max(...ys)).toBe(6);
});

test("uvs cover the whole image, with v = 1 at the top", () => {
  const { sprite } = createSprite();
  const corners = new Set();
  for (let i = 0; i < 12; i += 2) corners.add(`${sprite.uvs[i]},${sprite.uvs[i + 1]}`);
  expect([...corners].sort()).toEqual(["0,0", "0,1", "1,0", "1,1"]);
});

test("draws with the sprite program, a white tint and the given frame count", () => {
  const { sprite } = createSprite({ frames: 4 });
  expect(sprite.nbPrograms).toBe(1);
  expect(sprite.materials[0].diffuse.toArray()).toEqual([1, 1, 1]);
  expect(sprite.customUniforms.frames.value).toBe(4);
  expect(sprite.customUniforms.frame.value).toBe(0);
  expect(sprite.customUniforms.alphaCutoff.value).toBe(0.5);
});

test("uses the material it is given as the tint", () => {
  const material = new Material({ diffuse: [1, 0.5, 0.25] });
  const { sprite } = createSprite({ material });
  expect(sprite.materials[0]).toBe(material);
});

test("a custom fragment shader replaces the built-in one", () => {
  const { context } = createSprite({ fragment: "precision mediump float; void main(void) {}" });
  expect(context.shaderSource).toHaveBeenCalledWith(expect.anything(), "precision mediump float; void main(void) {}");
  expect(SpriteShader.fragment).toContain("uAlphaCutoff");
});

test("setFrame picks a cell and wraps around the ends", () => {
  const { sprite } = createSprite({ frames: 4 });
  expect(sprite.setFrame(2)).toBe(sprite);
  expect(sprite.customUniforms.frame.value).toBe(2);
  expect(sprite.getFrame()).toBe(2);
  sprite.setFrame(5);
  expect(sprite.getFrame()).toBe(1);
  sprite.setFrame(-1);
  expect(sprite.getFrame()).toBe(3);
  sprite.setFrame(1.9);
  expect(sprite.getFrame()).toBe(1);
});

test("frames below one are treated as a single image", () => {
  const { sprite } = createSprite({ frames: 0 });
  expect(sprite.frames).toBe(1);
  sprite.setFrame(3);
  expect(sprite.getFrame()).toBe(0);
});

test("billboard modes are sent to the shader", () => {
  expect(createSprite({ billboard: "none" }).sprite.customUniforms.billboard.value).toBe(0);
  expect(createSprite({ billboard: "spherical" }).sprite.customUniforms.billboard.value).toBe(1);
  expect(createSprite({ billboard: "cylindrical" }).sprite.customUniforms.billboard.value).toBe(2);
  expect(createSprite().sprite.customUniforms.billboard.value).toBe(1);
});

test("setAlphaCutoff changes the cutoff", () => {
  const { sprite } = createSprite();
  sprite.setAlphaCutoff(0.2);
  expect(sprite.customUniforms.alphaCutoff.value).toBe(0.2);
});

test("a texture is created from the options, kept by the mesh and can be sent again after a lost context", () => {
  const data = new Uint8Array(4 * 2 * 2);
  const { sprite, context } = createSprite({ texture: data, textureOptions: { width: 2, height: 2 } });
  expect(sprite.WebGLTexture).not.toBeNull();
  expect(context.createTexture).toHaveBeenCalledTimes(1);
  sprite.restore();
  expect(context.createTexture).toHaveBeenCalledTimes(2);
  expect(sprite.WebGLTexture).not.toBeNull();
});

test("a sprite without a texture can be given one later", () => {
  const { sprite } = createSprite();
  expect(sprite.WebGLTexture).toBeNull();
  sprite.setTexture(new Uint8Array(4), { width: 1, height: 1 });
  expect(sprite.WebGLTexture).not.toBeNull();
});

test("a spherical billboard is culled by a sphere that covers every way it can turn", () => {
  const { sprite } = createSprite({ anchor: "bottom", billboard: "spherical" });
  const reach = Math.hypot(2, 6);
  expect(sprite.localBoundingBox.min.toArray()).toEqual([-reach, -reach, -reach]);
  expect(sprite.localBoundingBox.max.toArray()).toEqual([reach, reach, reach]);
});

test("a cylindrical billboard keeps its height and turns about the vertical axis", () => {
  const { sprite } = createSprite({ anchor: "bottom", billboard: "cylindrical" });
  expect(sprite.localBoundingBox.min.toArray()).toEqual([-2, 0, -2]);
  expect(sprite.localBoundingBox.max.toArray()).toEqual([2, 6, 2]);
});

test("a sprite with no billboard keeps the flat bounds of its quad", () => {
  const { sprite } = createSprite({ billboard: "none" });
  const size = new Vec3();
  sprite.localBoundingBox.getSize(size);
  expect(size.toArray()).toEqual([4, 6, 0]);
});

test("the shader keeps a sprite upright when it is cylindrical", () => {
  expect(SpriteShader.vertex).toContain("uBillboard > 1.5");
  expect(SpriteShader.vertex).toContain("(uViewMatrix * vec4(0.0, 1.0, 0.0, 0.0))");
});

test("depthBias is sent to the shader, and is off by default", () => {
  expect(createSprite().sprite.customUniforms.depthBias.value).toBe(0);
  expect(createSprite({ depthBias: 120 }).sprite.customUniforms.depthBias.value).toBe(120);
  expect(SpriteShader.vertex).toContain("uDepthBias");
});
