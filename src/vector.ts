import { Vec2, Vec3 } from '@1pizzateam/spock';

export type Vec3Like = Vec3 | ArrayLike<number>;
export type Vec2Like = Vec2 | ArrayLike<number>;

// Accepts a Vec3, an array-like of 3 numbers, or (x, y, z) scalars.
export function assignVec3(target: Vec3, xOrVec: Vec3Like | number, y?: number, z?: number): Vec3 {
  if (xOrVec instanceof Vec3)
    return target.copy(xOrVec);
  if (typeof xOrVec === 'number')
    return target.setScalar(xOrVec, y, z);
  return target.setArray(xOrVec);
}

// Accepts a Vec2, an array-like of 2 numbers, or (x, y) scalars.
export function assignVec2(target: Vec2, xOrVec: Vec2Like | number, y?: number): Vec2 {
  if (xOrVec instanceof Vec2)
    return target.copy(xOrVec);
  if (typeof xOrVec === 'number')
    return target.setScalar(xOrVec, y);
  return target.setArray(xOrVec);
}
