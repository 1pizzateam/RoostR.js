import { Texture } from "../dist/roostr";
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
