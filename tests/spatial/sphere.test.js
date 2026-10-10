import { BoundingSphere, BoundingBox, Vec3, Mat4x3, Mat4 } from '../../dist/roostr.js';

describe('BoundingSphere', () => {
  test('creates default sphere at origin', () => {
    const sphere = new BoundingSphere();
    expect(sphere.center.isOrigin()).toBe(true);
    expect(sphere.radius).toBe(0);
  });

  test('setFromPoints calculates enclosing sphere', () => {
    const points = [
      -2, 0, 0,
      2, 0, 0
    ];
    const sphere = new BoundingSphere().setFromPoints(points);
    expect(sphere.center.x).toBe(0);
    expect(sphere.radius).toBeGreaterThanOrEqual(2);
  });

  test('containsPoint and intersectsSphere', () => {
    const s1 = new BoundingSphere(new Vec3(0, 0, 0), 5);
    expect(s1.containsPoint(new Vec3(3, 0, 0))).toBe(true);
    expect(s1.containsPoint(new Vec3(6, 0, 0))).toBe(false);

    const s2 = new BoundingSphere(new Vec3(7, 0, 0), 3);
    expect(s1.intersectsSphere(s2)).toBe(true);

    const s3 = new BoundingSphere(new Vec3(10, 0, 0), 1);
    expect(s1.intersectsSphere(s3)).toBe(false);
  });

  test('intersectsBox', () => {
    const sphere = new BoundingSphere(new Vec3(0, 0, 0), 2);
    const box1 = new BoundingBox(new Vec3(1, 1, 1), new Vec3(3, 3, 3));
    expect(sphere.intersectsBox(box1)).toBe(true);

    const box2 = new BoundingBox(new Vec3(5, 5, 5), new Vec3(8, 8, 8));
    expect(sphere.intersectsBox(box2)).toBe(false);
  });

  test('applyMatrix4 transforms center and scales radius', () => {
    const sphere = new BoundingSphere(new Vec3(1, 0, 0), 2);
    const mat = new Mat4x3().translate(new Vec3(5, 0, 0)).scale(new Vec3(2, 2, 2));
    sphere.applyMatrix4(mat);

    expect(sphere.center.x).toBe(7);
    expect(sphere.radius).toBe(4);
  });

  test('applyMatrix4 works with Mat4', () => {
    const sphere = new BoundingSphere(new Vec3(0, 1, 0), 2);
    const mat = new Mat4();
    mat.translate(new Vec3(0, 3, 0));
    sphere.applyMatrix4(mat);

    expect(sphere.center.y).toBe(4);
    expect(sphere.radius).toBe(2);
  });
});
