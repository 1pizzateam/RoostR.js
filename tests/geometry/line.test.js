import { Line, Vec3 } from "../../dist/roostr";

test("stores the given vertices as-is", () => {
  const vertices = [0, 0, 0, 1, 1, 1, 2, 2, 2];
  const line = new Line(vertices, 2);
  expect(line.vertices).toBe(vertices);
});

test("defaults thickness to 1.0 when falsy", () => {
  const line = new Line([0, 0, 0, 1, 1, 1], 0);
  expect(line.thickness).toBe(1.0);
});

test("scales the given thickness by half", () => {
  const line = new Line([0, 0, 0, 1, 1, 1], 4);
  expect(line.thickness).toBe(2);
});

test("creates a single submesh covering vertices.length / itemSize", () => {
  const vertices = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
  const line = new Line(vertices, 1);
  expect(line.subMeshes.length).toBe(1);
  expect(line.subMeshes[0].start).toBe(0);
  expect(line.subMeshes[0].count).toBe(vertices.length / 3);
});

test("sets itemSize to 3 and primitive to LINE_STRIP", () => {
  const line = new Line([0, 0, 0, 1, 1, 1], 1);
  expect(line.itemSize).toBe(3);
  expect(line.primitive).toBe("LINE_STRIP");
});

test("inherits null indices, normals and uvs from BasicMesh", () => {
  const line = new Line([0, 0, 0, 1, 1, 1], 1);
  expect(line.indices).toBeNull();
  expect(line.normals).toBeNull();
  expect(line.uvs).toBeNull();
});

test("supports Vec3 array for vertices", () => {
  const points = [new Vec3(0, 0, 0), new Vec3(1, 2, 3), new Vec3(4, 5, 6)];
  const line = new Line(points, 2);
  expect(line.vertices).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6]);
  expect(line.subMeshes[0].count).toBe(3);
});

