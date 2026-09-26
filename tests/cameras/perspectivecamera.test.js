import { PerspectiveCamera, Vec3 } from "../../dist/roostr";
import { createMockContext } from "../helpers/webgl-mock";

test("initializes position, target and up vectors", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  expect(camera.position.toArray()).toEqual([0, 0, 0]);
  expect(camera.target.toArray()).toEqual([0, 0, 0]);
  expect(camera.up.toArray()).toEqual([0, 1, 0]);
});

test("stores fov, zNear and zFar", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(60, 1, 500, context);
  expect(camera.fov).toBe(60);
  expect(camera.zNear).toBe(1);
  expect(camera.zFar).toBe(500);
});

test("derives the aspect ratio from the context viewport", () => {
  const context = createMockContext({ viewport: [0, 0, 1280, 640] });
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  expect(camera.ratio).toBe(2);
});

test("falls back to a viewport height of at least 1 to avoid dividing by zero", () => {
  const context = createMockContext({ viewport: [0, 0, 1280, 0] });
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  expect(camera.ratio).toBe(1280);
});

test("computes a 4x4 projection matrix on construction", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  const projection = camera.getProjectionMatrix();
  expect(projection).toBeInstanceOf(Float32Array);
  expect(projection.length).toBe(16);
});

test("setProjectionMatrix recomputes the ratio and projection matrix from a new viewport", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  camera.setProjectionMatrix(new Int32Array([0, 0, 640, 480]));
  expect(camera.ratio).toBeCloseTo(640 / 480);
});

test("setPosition updates camera position and recomputes view matrix", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  const oldViewMatrix = Array.from(camera.getViewMatrix());
  camera.setPosition(new Vec3(0, 0, 10));
  expect(camera.position.toArray()).toEqual([0, 0, 10]);
  expect(Array.from(camera.getViewMatrix())).not.toEqual(oldViewMatrix);

  // Scalar overload
  camera.setPosition(0, 5, 20);
  expect(camera.position.toArray()).toEqual([0, 5, 20]);
});

test("setTarget, lookAt and setUp update camera target and up vectors", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  camera.setTarget(new Vec3(0, 1, 0));
  expect(camera.target.toArray()).toEqual([0, 1, 0]);
  camera.setUp(new Vec3(0, 0, 1));
  expect(camera.up.toArray()).toEqual([0, 0, 1]);
  camera.lookAt(new Vec3(5, 5, 5));
  expect(camera.target.toArray()).toEqual([5, 5, 5]);
});

test("default camera initializes view matrix to identity instead of zero", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  const identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  expect(camera.getViewMatrix()).toEqual(identity);
});

test("reverts to identity view matrix when position equals target", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 10));
  const identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  expect(camera.getViewMatrix()).toEqual(identity);
});

test("safely handles null or undefined viewport without throwing", () => {
  const context = createMockContext();
  context.getParameter.mockReturnValue(null);
  expect(() => new PerspectiveCamera(45, 0.1, 1000, context)).not.toThrow();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  expect(() => camera.setProjectionMatrix(null)).not.toThrow();
});

test("getViewMatrixObject and getProjectionMatrixObject return live Mat4x3 and Mat4 instances", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  const viewMat = camera.getViewMatrixObject();
  const projMat = camera.getProjectionMatrixObject();

  expect(viewMat).toBe(camera.viewMatrix);
  expect(projMat).toBe(camera.projectionMatrix);
  expect(typeof viewMat.invertAffine).toBe("function");
  expect(typeof projMat.invert).toBe("function");
});

test("setTarget and setUp accept scalar coordinates", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, 0.1, 1000, context);
  camera.setTarget(1, 2, 3);
  expect(camera.target.toArray()).toEqual([1, 2, 3]);

  camera.setUp(0, 0, 1);
  expect(camera.up.toArray()).toEqual([0, 0, 1]);
});
