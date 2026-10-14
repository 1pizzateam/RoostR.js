import { assignVec2, assignVec3, Vec2, Vec3, Ray2 } from "../dist/roostr";

describe("Vector Helpers and Exports", () => {
  test("assignVec3 copies Vec3 instance", () => {
    const target = new Vec3();
    const source = new Vec3(1, 2, 3);
    const result = assignVec3(target, source);
    expect(result).toBe(target);
    expect(target.toArray()).toEqual([1, 2, 3]);
  });

  test("assignVec3 copies array-like numbers", () => {
    const target = new Vec3();
    assignVec3(target, [4, 5, 6]);
    expect(target.toArray()).toEqual([4, 5, 6]);

    const float32 = new Float32Array([7, 8, 9]);
    assignVec3(target, float32);
    expect(target.toArray()).toEqual([7, 8, 9]);
  });

  test("assignVec3 copies scalar arguments", () => {
    const target = new Vec3();
    assignVec3(target, 10, 20, 30);
    expect(target.toArray()).toEqual([10, 20, 30]);
  });

  test("assignVec2 copies Vec2 instance", () => {
    const target = new Vec2();
    const source = new Vec2(1, 2);
    const result = assignVec2(target, source);
    expect(result).toBe(target);
    expect(target.toArray()).toEqual([1, 2]);
  });

  test("assignVec2 copies array-like numbers", () => {
    const target = new Vec2();
    assignVec2(target, [3, 4]);
    expect(target.toArray()).toEqual([3, 4]);

    const float32 = new Float32Array([5, 6]);
    assignVec2(target, float32);
    expect(target.toArray()).toEqual([5, 6]);
  });

  test("assignVec2 copies scalar arguments", () => {
    const target = new Vec2();
    assignVec2(target, 7, 8);
    expect(target.toArray()).toEqual([7, 8]);
  });

  test("Ray2 is properly exported", () => {
    const ray = new Ray2(new Vec2(0, 0), new Vec2(1, 0));
    expect(ray.origin.toArray()).toEqual([0, 0]);
    expect(ray.direction.toArray()).toEqual([1, 0]);
  });
});
