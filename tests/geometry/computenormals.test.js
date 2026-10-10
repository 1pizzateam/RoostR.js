import { CustomMesh, Vec3 } from '../../dist/roostr.js';

describe('CustomMesh computeVertexNormals', () => {
  test('returns null when vertices are not set', () => {
    const mesh = new CustomMesh();
    expect(mesh.computeVertexNormals()).toBeNull();
  });

  test('computes vertex normals for indexed triangles', () => {
    const mesh = new CustomMesh();
    // A single flat triangle in XY plane facing +Z
    mesh.setVertices([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0
    ]);
    mesh.setIndices([0, 1, 2]);

    const normals = mesh.computeVertexNormals();
    expect(normals).not.toBeNull();
    expect(normals.length).toBe(9);
    // Every vertex should point towards +Z (0, 0, 1)
    expect(normals[2]).toBeCloseTo(1);
    expect(normals[5]).toBeCloseTo(1);
    expect(normals[8]).toBeCloseTo(1);
  });

  test('computes vertex normals for non-indexed triangles', () => {
    const mesh = new CustomMesh();
    mesh.setVertices([
      0, 0, 0,
      1, 0, 0,
      0, 1, 0
    ]);

    const normals = mesh.computeVertexNormals();
    expect(normals).not.toBeNull();
    expect(normals[2]).toBeCloseTo(1);
  });

  test('accepts Vec3 array for setVertices and setNormals', () => {
    const mesh = new CustomMesh();
    mesh.setVertices([
      new Vec3(0, 0, 0),
      new Vec3(1, 0, 0),
      new Vec3(0, 1, 0)
    ]);
    expect(Array.from(mesh.vertices)).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);

    mesh.setNormals([
      new Vec3(0, 0, 1),
      new Vec3(0, 0, 1),
      new Vec3(0, 0, 1)
    ]);
    expect(Array.from(mesh.normals)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  });
});
