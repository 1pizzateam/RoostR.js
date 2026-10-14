import { Sphere, Vec3 } from "../../dist/roostr";

test("has vertices divisible by itemSize (3 components per vertex)", () => {
  const sphere = new Sphere();
  expect(sphere.vertices.length).toBe(1446);
  expect(sphere.vertices.length % sphere.itemSize).toBe(0);
});

test("has one normal component for every vertex component", () => {
  const sphere = new Sphere();
  expect(sphere.normals.length).toBe(sphere.vertices.length);
});

test("has indices describing triangles (multiple of 3)", () => {
  const sphere = new Sphere();
  expect(sphere.indices.length).toBe(2880);
  expect(sphere.indices.length % 3).toBe(0);
});

test("sets a single submesh spanning all indices", () => {
  const sphere = new Sphere();
  expect(sphere.subMeshes.length).toBe(1);
  expect(sphere.subMeshes[0].start).toBe(0);
  expect(sphere.subMeshes[0].count).toBe(2880);
});

test("inherits itemSize 3 and primitive TRIANGLES from BasicMesh", () => {
  const sphere = new Sphere();
  expect(sphere.itemSize).toBe(3);
  expect(sphere.primitive).toBe("TRIANGLES");
});

test("scales vertices by Vec3 scale", () => {
  const defaultSphere = new Sphere();
  const scaledSphere = new Sphere(new Vec3(2, 2, 2));
  expect(scaledSphere.vertices[0]).toBeCloseTo(defaultSphere.vertices[0] * 2);
  expect(scaledSphere.vertices[1]).toBeCloseTo(defaultSphere.vertices[1] * 2);
  expect(scaledSphere.vertices[2]).toBeCloseTo(defaultSphere.vertices[2] * 2);
});

test("scales vertices by Vec3 scale and recomputes normals", () => {
  const defaultSphere = new Sphere();
  const scaledSphere = new Sphere(new Vec3(2, 3, 4));
  expect(scaledSphere.vertices[0]).toBeCloseTo(defaultSphere.vertices[0] * 2);
  expect(scaledSphere.vertices[1]).toBeCloseTo(defaultSphere.vertices[1] * 3);
  expect(scaledSphere.vertices[2]).toBeCloseTo(defaultSphere.vertices[2] * 4);
  expect(scaledSphere.normals.length).toBe(scaledSphere.vertices.length);
});
