import { PerspectiveCamera, Vec3, Vec2 } from "../../dist/roostr";
import { createMockContext } from "../helpers/webgl-mock";

test("initializes position, target and up vectors", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  expect(camera.position.toArray()).toEqual([0, 0, 0]);
  expect(camera.target.toArray()).toEqual([0, 0, 0]);
  expect(camera.up.toArray()).toEqual([0, 1, 0]);
});

test("stores fov, zNear and zFar", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(60, new Vec2(1, 500), context);
  expect(camera.fov).toBe(60);
  expect(camera.zNear).toBe(1);
  expect(camera.zFar).toBe(500);
});

test("derives the aspect ratio from the context viewport", () => {
  const context = createMockContext({ viewport: [0, 0, 1280, 640] });
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  expect(camera.ratio).toBe(2);
});

test("falls back to a viewport height of at least 1 to avoid dividing by zero", () => {
  const context = createMockContext({ viewport: [0, 0, 1280, 0] });
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  expect(camera.ratio).toBe(1280);
});

test("computes a 4x4 projection matrix on construction", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  const projection = camera.getProjectionMatrix();
  expect(projection).toBeInstanceOf(Float32Array);
  expect(projection.length).toBe(16);
});

test("setProjectionMatrix recomputes the ratio and projection matrix from a new viewport", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  camera.setProjectionMatrix(new Vec2(640, 480));
  expect(camera.ratio).toBeCloseTo(640 / 480);

  camera.setProjectionMatrix(new Vec2(1920, 1080));
  expect(camera.ratio).toBeCloseTo(1920 / 1080);
});

test("setPosition updates camera position and recomputes view matrix", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  const oldViewMatrix = Array.from(camera.getViewMatrix());
  camera.setPosition(new Vec3(0, 0, 10));
  expect(camera.position.toArray()).toEqual([0, 0, 10]);
  expect(Array.from(camera.getViewMatrix())).not.toEqual(oldViewMatrix);

  camera.setPosition(new Vec3(0, 5, 20));
  expect(camera.position.toArray()).toEqual([0, 5, 20]);
});

test("setTarget, lookAt and setUp update camera target and up vectors", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  camera.setTarget(new Vec3(0, 1, 0));
  expect(camera.target.toArray()).toEqual([0, 1, 0]);
  camera.setUp(new Vec3(0, 0, 1));
  expect(camera.up.toArray()).toEqual([0, 0, 1]);
  camera.lookAt(new Vec3(5, 5, 5));
  expect(camera.target.toArray()).toEqual([5, 5, 5]);
});

test("default camera initializes view matrix to identity instead of zero", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
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
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
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
  expect(() => new PerspectiveCamera(45, new Vec2(0.1, 1000), context)).not.toThrow();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  expect(() => camera.setProjectionMatrix(null)).not.toThrow();
});

test("getViewMatrixObject and getProjectionMatrixObject return live Mat4x3 and Mat4 instances", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  const viewMat = camera.getViewMatrixObject();
  const projMat = camera.getProjectionMatrixObject();

  expect(viewMat).toBe(camera.viewMatrix);
  expect(projMat).toBe(camera.projectionMatrix);
  expect(typeof viewMat.invertAffine).toBe("function");
  expect(typeof projMat.invert).toBe("function");
});

test("setTarget and setUp accept Vec3 coordinates", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  camera.setTarget(new Vec3(1, 2, 3));
  expect(camera.target.toArray()).toEqual([1, 2, 3]);

  camera.setUp(new Vec3(0, 0, 1));
  expect(camera.up.toArray()).toEqual([0, 0, 1]);
});

test("setFov and setNearFar recompute projection matrix", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  const origProj = Array.from(camera.getProjectionMatrix());

  camera.setFov(60);
  expect(camera.fov).toBe(60);
  expect(Array.from(camera.getProjectionMatrix())).not.toEqual(origProj);

  const prevProj = Array.from(camera.getProjectionMatrix());
  camera.setNearFar(new Vec2(0.5, 500));
  expect(camera.zNear).toBe(0.5);
  expect(camera.zFar).toBe(500);
  expect(Array.from(camera.getProjectionMatrix())).not.toEqual(prevProj);

  camera.setNearFar(new Vec2(1, 200));
  expect(camera.zNear).toBe(1);
  expect(camera.zFar).toBe(200);
  expect(camera.getNearFar().toArray()).toEqual([1, 200]);

  const cameraWithVec2 = new PerspectiveCamera(45, new Vec2(0.2, 800), context);
  expect(cameraWithVec2.zNear).toBe(0.2);
  expect(cameraWithVec2.zFar).toBe(800);
});

test("getViewDirection, getDistance, and dolly work using Spock", () => {
  const context = createMockContext();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 0));

  expect(camera.getDistance()).toBe(10);
  const dir = camera.getViewDirection();
  expect(dir.x).toBeCloseTo(0);
  expect(dir.y).toBeCloseTo(0);
  expect(dir.z).toBeCloseTo(-1);

  camera.dolly(0.5); // move halfway toward target (0, 0, 0)
  expect(camera.position.z).toBeCloseTo(5);
  expect(camera.getDistance()).toBeCloseTo(5);
});
