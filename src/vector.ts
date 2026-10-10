import { Vec3 } from '@1pizzateam/spock';

export type Vec3Like = Vec3 | ArrayLike<number>;

// Accepts a Vec3, an array-like of 3 numbers, or (x, y, z) scalars.
export function assignVec3(target: Vec3, xOrVec: Vec3Like | number, y?: number, z?: number): Vec3 {
  if (xOrVec instanceof Vec3)
    return target.copy(xOrVec);
  if (typeof xOrVec === 'number')
    return target.setScalar(xOrVec, y, z);
  return target.setArray(xOrVec);
}
