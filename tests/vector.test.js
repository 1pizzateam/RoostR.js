import { Vec2, Vec3, Ray2, RightTriangle, Quat, Trigo, Utils, Rand } from "../dist/roostr";

describe("Spock Primitives Re-Exports", () => {
  test("Ray2 and RightTriangle are properly exported", () => {
    const ray = new Ray2(new Vec2(0, 0), new Vec2(1, 0));
    expect(ray.origin.toArray()).toEqual([0, 0]);
    expect(ray.direction.toArray()).toEqual([1, 0]);

    const tri = new RightTriangle(new Vec2(10, 10), new Vec2(5, 5), "nw");
    expect(tri.corner).toBe("nw");
  });

  test("Spock v4.5.0 primitives (Quat.equals, Trigo.lerpRadian, Utils.damp, Rand.next) are exported", () => {
    const q1 = new Quat();
    const q2 = new Quat();
    expect(q1.equals(q2)).toBe(true);
    expect(Trigo.lerpRadian(0, Trigo.halfpi, 0.5)).toBeCloseTo(Trigo.halfpi * 0.5);
    expect(Utils.damp(0, 10, 10, 0)).toBe(0);
    expect(Rand.next()).toBeGreaterThanOrEqual(0);
    expect(Rand.next()).toBeLessThan(1);
  });
});
