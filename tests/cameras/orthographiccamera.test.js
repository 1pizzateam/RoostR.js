import { OrthographicCamera, Rect, Vec2 } from "../../dist/roostr";

test("initializes position, target and up vectors", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
  expect(camera.position.toArray()).toEqual([0, 0, 0]);
  expect(camera.target.toArray()).toEqual([0, 0, 0]);
  expect(camera.up.toArray()).toEqual([0, 1, 0]);
});

test("stores the given frustum bounds", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(4, 2), new Vec2(0, 0)), new Vec2(0.5, 50));
  expect(camera.left).toBe(-2);
  expect(camera.right).toBe(2);
  expect(camera.top).toBe(1);
  expect(camera.bottom).toBe(-1);
  expect(camera.near).toBe(0.5);
  expect(camera.far).toBe(50);
});

test("supports Spock Rect in constructor and setBounds", () => {
  const rect = new Rect(new Vec2(20, 10), new Vec2(0, 0));
  const camera = new OrthographicCamera(rect, new Vec2(0.5, 100));
  expect(camera.left).toBe(-10);
  expect(camera.right).toBe(10);
  expect(camera.bottom).toBe(-5);
  expect(camera.top).toBe(5);
  expect(camera.near).toBe(0.5);
  expect(camera.far).toBe(100);

  const rect2 = new Rect(new Vec2(40, 20), new Vec2(0, 0));
  camera.setBounds(rect2, new Vec2(1, 500));
  expect(camera.left).toBe(-20);
  expect(camera.right).toBe(20);
  expect(camera.bottom).toBe(-10);
  expect(camera.top).toBe(10);
  expect(camera.near).toBe(1);
  expect(camera.far).toBe(500);
});

test("computes a 4x4 projection matrix on construction", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
  const projection = camera.getProjectionMatrix();
  expect(projection).toBeInstanceOf(Float32Array);
  expect(projection.length).toBe(16);
});

test("setProjectionMatrix recomputes the projection matrix from the current bounds", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
  const before = camera.getProjectionMatrix().slice();
  camera.left = -5;
  camera.setProjectionMatrix();
  const after = camera.getProjectionMatrix();
  expect(after).not.toEqual(before);
});

test("computes a view matrix on construction", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
  const view = camera.getViewMatrix();
  expect(view).toBeInstanceOf(Float32Array);
  expect(view.length).toBe(16);
});

test("setBounds updates bounds and recomputes projection matrix", () => {
  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
  const before = Array.from(camera.getProjectionMatrix());
  camera.setBounds(new Rect(new Vec2(20, 10), new Vec2(0, 0)), new Vec2(1, 200));
  expect(camera.left).toBe(-10);
  expect(camera.right).toBe(10);
  expect(camera.top).toBe(5);
  expect(camera.bottom).toBe(-5);
  expect(camera.near).toBe(1);
  expect(camera.far).toBe(200);
  expect(Array.from(camera.getProjectionMatrix())).not.toEqual(before);
});
