import { CustomMesh, Vec3 } from "../../dist/roostr";

test("starts with null vertices, indices, normals and uvs", () => {
  const mesh = new CustomMesh();
  expect(mesh.vertices).toBeNull();
  expect(mesh.indices).toBeNull();
  expect(mesh.normals).toBeNull();
  expect(mesh.uvs).toBeNull();
});

test("defaults itemSize to 3 and primitive to TRIANGLES", () => {
  const mesh = new CustomMesh();
  expect(mesh.itemSize).toBe(3);
  expect(mesh.primitive).toBe("TRIANGLES");
});

test("exposes the list of supported GL primitives", () => {
  const mesh = new CustomMesh();
  expect(mesh.primitives).toEqual([
    "POINTS",
    "LINE_STRIP",
    "LINE_LOOP",
    "LINES",
    "TRIANGLE_STRIP",
    "TRIANGLE_FAN",
    "TRIANGLES",
  ]);
});

test("setVertices converts Vec3 array to Float32Array", () => {
  const mesh = new CustomMesh();
  const array = [new Vec3(1, 2, 3)];
  mesh.setVertices(array);
  expect(mesh.vertices).toEqual(new Float32Array([1, 2, 3]));
});

test("setIndices copies an Int32Array", () => {
  const mesh = new CustomMesh();
  const array = new Int32Array([0, 1, 2]);
  mesh.setIndices(array);
  expect(mesh.indices).toEqual(array);
  expect(mesh.indices).not.toBe(array);
});

test("setNormals converts Vec3 array to Float32Array", () => {
  const mesh = new CustomMesh();
  const array = [new Vec3(0, 1, 0)];
  mesh.setNormals(array);
  expect(mesh.normals).toEqual(new Float32Array([0, 1, 0]));
});

test("setUvs copies a Float32Array", () => {
  const mesh = new CustomMesh();
  const array = new Float32Array([0, 0, 1, 1]);
  mesh.setUvs(array);
  expect(mesh.uvs).toEqual(array);
  expect(mesh.uvs).not.toBe(array);
});

test("addSubMesh appends a submesh with the given start and count", () => {
  const mesh = new CustomMesh();
  mesh.addSubMesh(0, 3);
  mesh.addSubMesh(3, 6);
  expect(mesh.subMeshes.length).toBe(2);
  expect(mesh.subMeshes[0].start).toBe(0);
  expect(mesh.subMeshes[0].count).toBe(3);
  expect(mesh.subMeshes[1].start).toBe(3);
  expect(mesh.subMeshes[1].count).toBe(6);
});

test("addSubMeshes builds submeshes from a flat [start, count, ...] array", () => {
  const mesh = new CustomMesh();
  mesh.addSubMeshes(new Float32Array([0, 3, 3, 6]));
  expect(mesh.subMeshes.length).toBe(2);
  expect(mesh.subMeshes[0].start).toBe(0);
  expect(mesh.subMeshes[0].count).toBe(3);
  expect(mesh.subMeshes[1].start).toBe(3);
  expect(mesh.subMeshes[1].count).toBe(6);
});

test("setItemSize overrides the item size", () => {
  const mesh = new CustomMesh();
  mesh.setItemSize(2);
  expect(mesh.itemSize).toBe(2);
});

test("setPrimitive accepts a supported primitive and returns true", () => {
  const mesh = new CustomMesh();
  expect(mesh.setPrimitive("LINES")).toBe(true);
  expect(mesh.primitive).toBe("LINES");
});

test("setPrimitive rejects an unsupported primitive and returns false", () => {
  const mesh = new CustomMesh();
  expect(mesh.setPrimitive("NOT_A_PRIMITIVE")).toBe(false);
  expect(mesh.primitive).toBe("TRIANGLES");
});

test("setIndices accepts a regular number array and converts to Int32Array", () => {
  const mesh = new CustomMesh();
  mesh.setIndices([0, 1, 2]);
  expect(mesh.indices).toBeInstanceOf(Int32Array);
  expect(Array.from(mesh.indices)).toEqual([0, 1, 2]);
});

test("setUvs accepts a regular number array and converts to Float32Array", () => {
  const mesh = new CustomMesh();
  mesh.setUvs([0, 0, 1, 1]);
  expect(mesh.uvs).toBeInstanceOf(Float32Array);
  expect(Array.from(mesh.uvs)).toEqual([0, 0, 1, 1]);
});

test("addSubMeshes accepts a regular number array", () => {
  const mesh = new CustomMesh();
  mesh.addSubMeshes([0, 3, 3, 6]);
  expect(mesh.subMeshes.length).toBe(2);
  expect(mesh.subMeshes[0].start).toBe(0);
  expect(mesh.subMeshes[0].count).toBe(3);
  expect(mesh.subMeshes[1].start).toBe(3);
  expect(mesh.subMeshes[1].count).toBe(6);
});

