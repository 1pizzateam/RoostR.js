import { Ray, BoundingSphere, BoundingBox, Vec3 } from '../../dist/roostr.js';

describe('Ray', () => {
  test('creates ray with origin and normalized direction', () => {
    const ray = new Ray(new Vec3(0, 0, 0), new Vec3(0, 0, 5));
    expect(ray.direction.z).toBeCloseTo(1);
    expect(ray.direction.getMagnitude()).toBeCloseTo(1);
  });

  test('at returns point along ray', () => {
    const ray = new Ray(new Vec3(1, 2, 3), new Vec3(1, 0, 0));
    const pt = ray.at(10);
    expect(pt.x).toBe(11);
    expect(pt.y).toBe(2);
    expect(pt.z).toBe(3);
  });

  test('intersectSphere returns intersection point', () => {
    const ray = new Ray(new Vec3(0, 0, -10), new Vec3(0, 0, 1));
    const sphere = new BoundingSphere(new Vec3(0, 0, 0), 2);
    const hit = ray.intersectSphere(sphere);
    expect(hit).not.toBeNull();
    expect(hit.z).toBeCloseTo(-2);

    const missRay = new Ray(new Vec3(0, 10, -10), new Vec3(0, 0, 1));
    expect(missRay.intersectSphere(sphere)).toBeNull();
  });

  test('intersectBox returns intersection point', () => {
    const ray = new Ray(new Vec3(0, 0, -10), new Vec3(0, 0, 1));
    const box = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const hit = ray.intersectBox(box);
    expect(hit).not.toBeNull();
    expect(hit.z).toBeCloseTo(-1);

    const missRay = new Ray(new Vec3(5, 5, -10), new Vec3(0, 0, 1));
    expect(missRay.intersectBox(box)).toBeNull();
  });

  test('intersectTriangle detects hit and miss on triangle', () => {
    const ray = new Ray(new Vec3(0.2, 0.2, -5), new Vec3(0, 0, 1));
    const a = new Vec3(0, 0, 0);
    const b = new Vec3(1, 0, 0);
    const c = new Vec3(0, 1, 0);

    const hit = ray.intersectTriangle(a, b, c);
    expect(hit).not.toBeNull();
    expect(hit.z).toBeCloseTo(0);

    const missRay = new Ray(new Vec3(2, 2, -5), new Vec3(0, 0, 1));
    expect(missRay.intersectTriangle(a, b, c)).toBeNull();
  });
});
