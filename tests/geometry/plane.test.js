import { Plane, Vec2 } from '../../dist/roostr.js';

describe('Plane Geometry', () => {
  test('creates a default XZ Plane', () => {
    const plane = new Plane(new Vec2(10, 20), new Vec2(2, 2), 'xz');
    expect(plane.vertices).toBeDefined();
    expect(plane.indices).toBeDefined();
    expect(plane.normals).toBeDefined();
    expect(plane.uvs).toBeDefined();
    expect(plane.primitive).toBe('TRIANGLES');
    expect(plane.itemSize).toBe(3);

    // 3 x 3 vertices = 9 vertices * 3 coords = 27
    expect(plane.vertices.length).toBe(27);
    // 2 x 2 quads = 4 quads * 2 triangles * 3 indices = 24 indices
    expect(plane.indices.length).toBe(24);
    // Upward normals (0, 1, 0)
    expect(plane.normals[1]).toBe(1);
  });

  test('creates Plane using Vec2 dimensions', () => {
    const plane = new Plane(new Vec2(10, 20), new Vec2(2, 2), 'xz');
    expect(plane.vertices.length).toBe(27);
    expect(plane.indices.length).toBe(24);
    expect(plane.normals[1]).toBe(1);
  });

  test('creates an XY Plane', () => {
    const plane = new Plane(new Vec2(4, 4), new Vec2(1, 1), 'xy');
    // 2 x 2 vertices = 4 vertices * 3 coords = 12
    expect(plane.vertices.length).toBe(12);
    // 1 quad = 6 indices
    expect(plane.indices.length).toBe(6);
    // Forward normals (0, 0, 1)
    expect(plane.normals[2]).toBe(1);
  });
});
