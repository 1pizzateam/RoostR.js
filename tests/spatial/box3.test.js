import { BoundingBox, Vec3, Mat4x3, Mat4 } from '../../dist/roostr.js';

describe('BoundingBox', () => {
  test('creates empty box by default', () => {
    const box = new BoundingBox();
    expect(box.isEmpty()).toBe(true);
  });

  test('setFromPoints computes correct min and max', () => {
    const points = [
      -5, 2, 3,
      10, -8, 1,
      0, 12, -4
    ];
    const box = new BoundingBox().setFromPoints(points);
    expect(box.min.x).toBe(-5);
    expect(box.min.y).toBe(-8);
    expect(box.min.z).toBe(-4);
    expect(box.max.x).toBe(10);
    expect(box.max.y).toBe(12);
    expect(box.max.z).toBe(3);
  });

  test('getCenter and getSize', () => {
    const box = new BoundingBox(new Vec3(-2, -2, -2), new Vec3(4, 6, 8));
    const center = box.getCenter();
    expect(center.x).toBe(1);
    expect(center.y).toBe(2);
    expect(center.z).toBe(3);

    const size = box.getSize();
    expect(size.x).toBe(6);
    expect(size.y).toBe(8);
    expect(size.z).toBe(10);
  });

  test('containsPoint and intersectsBox', () => {
    const box = new BoundingBox(new Vec3(0, 0, 0), new Vec3(10, 10, 10));
    expect(box.containsPoint(new Vec3(5, 5, 5))).toBe(true);
    expect(box.containsPoint(new Vec3(11, 5, 5))).toBe(false);

    const overlapping = new BoundingBox(new Vec3(5, 5, 5), new Vec3(15, 15, 15));
    expect(box.intersectsBox(overlapping)).toBe(true);

    const separate = new BoundingBox(new Vec3(20, 20, 20), new Vec3(30, 30, 30));
    expect(box.intersectsBox(separate)).toBe(false);
  });

  test('applyMatrix4 translates and bounds box correctly', () => {
    const box = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const mat = new Mat4x3().translate(new Vec3(10, 0, 0));
    box.applyMatrix4(mat);

    expect(box.min.x).toBe(9);
    expect(box.max.x).toBe(11);
    expect(box.min.y).toBe(-1);
    expect(box.max.y).toBe(1);
  });

  test('applyMatrix4 works with Mat4', () => {
    const box = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const mat = new Mat4();
    mat.translate(new Vec3(0, 5, 0));
    box.applyMatrix4(mat);

    expect(box.min.y).toBe(4);
    expect(box.max.y).toBe(6);
  });
});
