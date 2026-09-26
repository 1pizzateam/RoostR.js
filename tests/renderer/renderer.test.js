import { Renderer, Vec3 } from "../../dist/roostr";
import { createMockContext, createMockCanvas } from "../helpers/webgl-mock";

test("finds the canvas by id and resizes it to the default resolution", () => {
  const context = createMockContext();
  const canvas = createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  expect(renderer.canvas).toBe(canvas);
  expect(renderer.canvas.width).toBe(1280);
  expect(renderer.canvas.height).toBe(720);
});

test("stores the WebGL context obtained from the canvas", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  expect(renderer.getContext()).toBe(context);
});

test("applies default settings on construction", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  new Renderer("canvas");
  expect(context.getExtension).toHaveBeenCalledWith("OES_standard_derivatives");
  expect(context.frontFace).toHaveBeenCalledWith(context.CW);
  expect(context.enable).toHaveBeenCalledWith(context.CULL_FACE);
  expect(context.cullFace).toHaveBeenCalledWith(context.BACK);
  expect(context.viewport).toHaveBeenCalledWith(0, 0, context.drawingBufferWidth, context.drawingBufferHeight);
  expect(context.clearColor).toHaveBeenCalledWith(0.0, 0.0, 0.0, 1.0);
});

test("setFrontFace forwards the resolved GL constant", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setFrontFace("CCW");
  expect(context.frontFace).toHaveBeenLastCalledWith(context.CCW);
});

test("enable/disable forward the resolved GL capability", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.enable("BLEND");
  expect(context.enable).toHaveBeenLastCalledWith(context.BLEND);
  renderer.disable("BLEND");
  expect(context.disable).toHaveBeenLastCalledWith(context.BLEND);
});

test("setCullFace forwards the resolved GL constant", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setCullFace("FRONT");
  expect(context.cullFace).toHaveBeenLastCalledWith(context.FRONT);
});

test("setViewport delegates to context.viewport with a (0, 0) origin", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setViewport(800, 600);
  expect(context.viewport).toHaveBeenLastCalledWith(0, 0, 800, 600);
});

test("setClearColor delegates to context.clearColor and clamps values between 0 and 1", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setClearColor(1.5, -0.5, 0.25, 2.0);
  expect(context.clearColor).toHaveBeenLastCalledWith(1, 0, 0.25, 1);
});

test("setClearColor accepts a Vec3 and alpha parameter", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setClearColor(new Vec3(0.2, 0.4, 0.6), 0.8);
  expect(context.clearColor).toHaveBeenLastCalledWith(0.2, 0.4, 0.6, 0.8);
});

test("clearFrame clears the color and depth buffers", () => {
  const context = createMockContext();
  createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.clearFrame();
  expect(context.clear).toHaveBeenCalledWith(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
});

test("handles missing canvas element gracefully without throwing", () => {
  let renderer;
  expect(() => {
    renderer = new Renderer("non_existent_canvas_id");
  }).not.toThrow();
  expect(renderer.canvas).toBeNull();
  expect(renderer.context).toBeNull();
  expect(renderer.getContext()).toBeNull();
  expect(() => {
    renderer.setFrontFace("CW");
    renderer.enable("CULL_FACE");
    renderer.disable("CULL_FACE");
    renderer.setCullFace("BACK");
    renderer.setViewport(100, 100);
    renderer.setClearColor(0, 0, 0, 1);
    renderer.clearFrame();
    renderer.defaultSettings();
  }).not.toThrow();
});

test("getCanvas returns the canvas element or null", () => {
  const context = createMockContext();
  const canvas = createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  expect(renderer.getCanvas()).toBe(canvas);

  const emptyRenderer = new Renderer("missing");
  expect(emptyRenderer.getCanvas()).toBeNull();
});

test("setSize updates canvas dimensions and viewport", () => {
  const context = createMockContext();
  const canvas = createMockCanvas("canvas", context);
  const renderer = new Renderer("canvas");
  renderer.setSize(1920, 1080);
  expect(canvas.width).toBe(1920);
  expect(canvas.height).toBe(1080);
  expect(context.viewport).toHaveBeenLastCalledWith(0, 0, 1920, 1080);
});

