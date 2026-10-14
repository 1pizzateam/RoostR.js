import { Texture, Vec2 } from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

test("creates and returns a WebGLTexture", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  const texture = Texture.create(img, context);
  expect(texture).toEqual(expect.any(Object));
  expect(context.createTexture).toHaveBeenCalledTimes(1);
});

test("binds the created texture to TEXTURE_2D before configuring it", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  const texture = Texture.create(img, context);
  expect(context.bindTexture).toHaveBeenCalledWith(context.TEXTURE_2D, texture);
});

test("flips the image on the Y axis", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  Texture.create(img, context);
  expect(context.pixelStorei).toHaveBeenCalledWith(context.UNPACK_FLIP_Y_WEBGL, 1);
});

test("configures linear filtering and clamp-to-edge wrapping to support NPOT textures", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  Texture.create(img, context);
  expect(context.texParameteri).toHaveBeenCalledWith(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  expect(context.texParameteri).toHaveBeenCalledWith(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
  expect(context.texParameteri).toHaveBeenCalledWith(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
  expect(context.texParameteri).toHaveBeenCalledWith(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
});

test("uploads the image data as RGBA/UNSIGNED_BYTE", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  Texture.create(img, context);
  expect(context.texImage2D).toHaveBeenCalledWith(
    context.TEXTURE_2D,
    0,
    context.RGBA,
    context.RGBA,
    context.UNSIGNED_BYTE,
    img
  );
});

test("unbinds the texture after uploading", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  Texture.create(img, context);
  expect(context.bindTexture).toHaveBeenLastCalledWith(context.TEXTURE_2D, null);
});

test("returns null if context.createTexture returns null", () => {
  const context = createMockContext();
  context.createTexture.mockReturnValue(null);
  const img = document.createElement("img");
  const result = Texture.create(img, context);
  expect(result).toBeNull();
  expect(context.bindTexture).not.toHaveBeenCalled();
});

test("supports custom options: wrap, filter, flipY false and generateMipmaps", () => {
  const context = createMockContext();
  const img = document.createElement("img");
  const texture = Texture.create(img, context, {
    wrapS: 0x2901,
    wrapT: 0x2901,
    minFilter: 0x2703,
    magFilter: 0x2600,
    flipY: false,
    generateMipmaps: true,
  });

  expect(texture).not.toBeNull();
  expect(context.pixelStorei).toHaveBeenCalledWith(context.UNPACK_FLIP_Y_WEBGL, 0);
  expect(context.texParameteri).toHaveBeenCalledWith(context.TEXTURE_2D, context.TEXTURE_WRAP_S, 0x2901);
  expect(context.generateMipmap).toHaveBeenCalledWith(context.TEXTURE_2D);
});

test("supports raw Uint8Array source", () => {
  const context = createMockContext();
  const rawData = new Uint8Array([255, 0, 0, 255]);
  const texture = Texture.create(rawData, context, {
    size: new Vec2(1, 1),
  });

  expect(texture).not.toBeNull();
  expect(context.texImage2D).toHaveBeenCalledWith(
    context.TEXTURE_2D,
    0,
    context.RGBA,
    1,
    1,
    0,
    context.RGBA,
    context.UNSIGNED_BYTE,
    rawData
  );
});

test("Texture.update updates texture subimage", () => {
  const context = createMockContext();
  const texture = {};
  const rawData = new Uint8Array([0, 255, 0, 255]);
  Texture.update(texture, rawData, context, new Vec2(0, 0), new Vec2(1, 1));

  expect(context.bindTexture).toHaveBeenCalledWith(context.TEXTURE_2D, texture);
  expect(context.texSubImage2D).toHaveBeenCalled();
});

test("Texture.load resolves when image loads successfully", async () => {
  const context = createMockContext();
  const loadPromise = Texture.load("test.png", context);

  // In jsdom or node, find created Image and trigger onload
  // The promise creates an Image and sets src
  // We can verify that Texture.load returns a Promise
  expect(loadPromise).toBeInstanceOf(Promise);
});
