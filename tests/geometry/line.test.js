import { Line, Vec3 } from "../../dist/roostr";

test("flattens Vec3 array into vertices", () => {
  const points = [new Vec3(0, 0, 0), new Vec3(1, 1, 1), new Vec3(2, 2, 2)];
  const line = new Line(points, 2);
  expect(line.vertices).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2]);
});

test("defaults thickness to 1.0 when falsy", () => {
  const line = new Line([new Vec3(0, 0, 0), new Vec3(1, 1, 1)], 0);
  expect(line.thickness).toBe(1.0);
});

test("scales the given thickness by half", () => {
  const line = new Line([new Vec3(0, 0, 0), new Vec3(1, 1, 1)], 4);
  expect(line.thickness).toBe(2);
});

test("creates a single submesh covering points count", () => {
  const points = [new Vec3(0, 0, 0), new Vec3(1, 1, 1), new Vec3(2, 2, 2), new Vec3(3, 3, 3)];
  const line = new Line(points, 1);
  expect(line.subMeshes.length).toBe(1);
  expect(line.subMeshes[0].start).toBe(0);
  expect(line.subMeshes[0].count).toBe(4);
});

test("sets itemSize to 3 and primitive to LINE_STRIP", () => {
  const line = new Line([new Vec3(0, 0, 0), new Vec3(1, 1, 1)], 1);
  expect(line.itemSize).toBe(3);
  expect(line.primitive).toBe("LINE_STRIP");
});

test("inherits null indices, normals and uvs from BasicMesh", () => {
  const line = new Line([new Vec3(0, 0, 0), new Vec3(1, 1, 1)], 1);
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

test("setPoints updates vertices and submesh count", () => {
  const line = new Line([new Vec3(0, 0, 0), new Vec3(1, 1, 1)]);
  expect(line.subMeshes[0].count).toBe(2);
  line.setPoints([new Vec3(1, 2, 3), new Vec3(4, 5, 6), new Vec3(7, 8, 9)]);
  expect(line.vertices).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(line.subMeshes[0].count).toBe(3);
});

