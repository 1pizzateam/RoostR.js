import { Cylinder } from '../../dist/roostr.js';

describe('Cylinder Geometry', () => {
  test('creates a default closed Cylinder', () => {
    const cylinder = new Cylinder(1, 1, 2, 8, 1, false);
    expect(cylinder.vertices).toBeDefined();
    expect(cylinder.indices).toBeDefined();
    expect(cylinder.normals).toBeDefined();
    expect(cylinder.uvs).toBeDefined();
    expect(cylinder.primitive).toBe('TRIANGLES');
    expect(cylinder.itemSize).toBe(3);
    expect(cylinder.vertices.length).toBeGreaterThan(0);
    expect(cylinder.indices.length).toBeGreaterThan(0);
  });

  test('creates an open-ended Cylinder', () => {
    const closed = new Cylinder(1, 1, 2, 8, 1, false);
    const open = new Cylinder(1, 1, 2, 8, 1, true);
    // Open-ended has fewer vertices and indices because caps are omitted
    expect(open.vertices.length).toBeLessThan(closed.vertices.length);
    expect(open.indices.length).toBeLessThan(closed.indices.length);
  });

  test('creates a Cone when radiusTop is 0', () => {
    const cone = new Cylinder(0, 1, 2, 8, 1, false);
    expect(cone.vertices.length).toBeGreaterThan(0);
  });
});
