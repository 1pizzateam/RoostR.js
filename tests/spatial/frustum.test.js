import { Frustum, SpatialPlane, BoundingSphere, BoundingBox, Vec3, Mat4 } from '../../dist/roostr.js';

describe('Frustum and Plane', () => {
  test('SpatialPlane distanceToPoint', () => {
    const plane = new SpatialPlane(new Vec3(0, 1, 0), -5);
    expect(plane.distanceToPoint(new Vec3(0, 10, 0))).toBe(5);
    expect(plane.distanceToPoint(new Vec3(0, 5, 0))).toBe(0);
    expect(plane.distanceToPoint(new Vec3(0, 0, 0))).toBe(-5);
  });

  test('Frustum extracts planes and intersects sphere', () => {
    const proj = new Mat4().perspective(Math.PI / 4, 1.0, 1.0, 100.0);
    const frustum = new Frustum().setFromProjectionViewMatrix(proj);

    const centerSphere = new BoundingSphere(new Vec3(0, 0, -10), 1);
    expect(frustum.intersectsSphere(centerSphere)).toBe(true);

    const behindSphere = new BoundingSphere(new Vec3(0, 0, 10), 1);
    expect(frustum.intersectsSphere(behindSphere)).toBe(false);

    const farSphere = new BoundingSphere(new Vec3(0, 0, -200), 1);
    expect(frustum.intersectsSphere(farSphere)).toBe(false);
  });

  test('Frustum intersectsBox', () => {
    const proj = new Mat4().perspective(Math.PI / 4, 1.0, 1.0, 100.0);
    const frustum = new Frustum().setFromProjectionViewMatrix(proj);

    const visibleBox = new BoundingBox(new Vec3(-1, -1, -15), new Vec3(1, 1, -10));
    expect(frustum.intersectsBox(visibleBox)).toBe(true);

    const outsideBox = new BoundingBox(new Vec3(50, 50, -15), new Vec3(60, 60, -10));
    expect(frustum.intersectsBox(outsideBox)).toBe(false);
  });
});
