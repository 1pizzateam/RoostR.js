import { Quad, Rect, Vec2 } from "../../dist/roostr";

test("creates a Quad with default dimensions when size is falsy", () => {
  const quad = new Quad();
  expect(quad.vertices).toEqual([
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
  ]);
});

test("creates a Quad scaled by half width and half height", () => {
  const quad = new Quad(new Vec2(4, 2));
  expect(quad.vertices).toEqual([
    2, -1, 0.0,
    -2, -1, 0.0,
    2, 1, 0.0,
    -2, 1, 0.0,
  ]);
});

test("creates a Quad directly from a Spock Vec2", () => {
  const quad = new Quad(new Vec2(4, 2));
  expect(quad.vertices).toEqual([
    2, -1, 0.0,
    -2, -1, 0.0,
    2, 1, 0.0,
    -2, 1, 0.0,
  ]);
});

test("creates a Quad directly from a Spock Rect", () => {
  const rect = new Rect(6, 4);
  const quad = new Quad(rect);
  expect(quad.vertices).toEqual([
    3, -2, 0.0,
    -3, -2, 0.0,
    3, 2, 0.0,
    -3, 2, 0.0,
  ]);
});

test("sets the expected uvs", () => {
  const quad = new Quad(new Vec2(2, 2));
  expect(quad.uvs).toEqual([
    1.0, 0.0,
    0.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
  ]);
});

test("sets a single submesh spanning all 4 vertices", () => {
  const quad = new Quad(new Vec2(2, 2));
  expect(quad.subMeshes.length).toBe(1);
  expect(quad.subMeshes[0].start).toBe(0);
  expect(quad.subMeshes[0].count).toBe(4);
});

test("sets itemSize to 3", () => {
  const quad = new Quad(new Vec2(2, 2));
  expect(quad.itemSize).toBe(3);
});

test("sets primitive to TRIANGLE_STRIP", () => {
  const quad = new Quad(new Vec2(2, 2));
  expect(quad.primitive).toBe("TRIANGLE_STRIP");
});

test("inherits null indices and normals from BasicMesh", () => {
  const quad = new Quad(new Vec2(2, 2));
  expect(quad.indices).toBeNull();
  expect(quad.normals).toBeNull();
});
