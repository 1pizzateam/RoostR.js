import { Cube, Vec3 } from "../../dist/roostr";

test("creates a Cube with default half-size scaling when size is falsy", () => {
  const cube = new Cube();
  expect(cube.vertices[0]).toBe(1.0);
  expect(cube.vertices[1]).toBe(-1.0);
  expect(cube.vertices[2]).toBe(-1.0);
});

test("creates a Cube scaled by half the given size", () => {
  const cube = new Cube(new Vec3(4, 4, 4));
  expect(cube.vertices[0]).toBe(2);
  expect(cube.vertices[1]).toBe(-2);
  expect(cube.vertices[2]).toBe(-2);
});

test("creates a Cube with Vec3 dimensions", () => {
  const cube = new Cube(new Vec3(4, 6, 8));
  expect(cube.vertices[0]).toBe(2);  // 4 * 0.5
  expect(cube.vertices[1]).toBe(-3); // -6 * 0.5
  expect(cube.vertices[2]).toBe(-4); // -8 * 0.5
});

test("has 8 vertices (3 components each)", () => {
  const cube = new Cube(new Vec3(2, 2, 2));
  expect(cube.vertices.length).toBe(24);
});

test("has 12 triangles worth of indices", () => {
  const cube = new Cube(new Vec3(2, 2, 2));
  expect(cube.indices.length).toBe(36);
});

test("has one normal per vertex", () => {
  const cube = new Cube(new Vec3(2, 2, 2));
  expect(cube.normals.length).toBe(24);
});

test("sets a single submesh spanning all indices", () => {
  const cube = new Cube(new Vec3(2, 2, 2));
  expect(cube.subMeshes.length).toBe(1);
  expect(cube.subMeshes[0].start).toBe(0);
  expect(cube.subMeshes[0].count).toBe(36);
});

test("inherits itemSize 3 and primitive TRIANGLES from BasicMesh", () => {
  const cube = new Cube(new Vec3(2, 2, 2));
  expect(cube.itemSize).toBe(3);
  expect(cube.primitive).toBe("TRIANGLES");
});

test("creates flat Cube with 24 vertices and face normals", () => {
  const cube = new Cube(new Vec3(2, 2, 2), true);
  expect(cube.vertices.length).toBe(72); // 24 * 3
  expect(cube.normals.length).toBe(72);
  expect(cube.indices.length).toBe(36);
  // Top face normal is (0, 1, 0)
  expect(cube.normals[24 + 1]).toBe(1);
  // Bottom face normal is (0, -1, 0)
  expect(cube.normals[36 + 1]).toBe(-1);
});
