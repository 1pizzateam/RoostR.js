import { Vec3, Mat4x3 } from '@1pizzateam/spock';
import { BoundingBox } from './box3';

export class BoundingSphere {

  center: Vec3;
  radius: number;

  constructor(center: Vec3 = new Vec3(), radius: number = 0) {
    this.center = center.clone();
    this.radius = radius;
  }

  public set(center: Vec3, radius: number): this {
    this.center.copy(center);
    this.radius = radius;
    return this;
  }

  public setFromPoints(points: Vec3[] | number[] | Float32Array, optionalCenter?: Vec3): this {
    const box = new BoundingBox().setFromPoints(points);
    if (optionalCenter) {
      this.center.copy(optionalCenter);
    } else {
      box.getCenter(this.center);
    }

    let maxRadiusSq = 0;
    if (points.length > 0 && points[0] instanceof Vec3) {
      for (const p of <Vec3[]>points) {
        maxRadiusSq = Math.max(maxRadiusSq, this.center.getDistance(p, true));
      }
    } else {
      const arr = <number[] | Float32Array>points;
      const tmp = new Vec3();
      for (let i = 0; i < arr.length; i += 3) {
        tmp.setScalar(arr[i], arr[i + 1] ?? 0, arr[i + 2] ?? 0);
        maxRadiusSq = Math.max(maxRadiusSq, this.center.getDistance(tmp, true));
      }
    }

    this.radius = Math.sqrt(maxRadiusSq);
    return this;
  }

  public containsPoint(point: Vec3): boolean {
    return this.center.getDistance(point, true) <= this.radius * this.radius;
  }

  public intersectsSphere(sphere: BoundingSphere): boolean {
    const radiusSum = this.radius + sphere.radius;
    return this.center.getDistance(sphere.center, true) <= radiusSum * radiusSum;
  }

  public intersectsBox(box: BoundingBox): boolean {
    const cx = Math.max(box.min.x, Math.min(this.center.x, box.max.x));
    const cy = Math.max(box.min.y, Math.min(this.center.y, box.max.y));
    const cz = Math.max(box.min.z, Math.min(this.center.z, box.max.z));
    const dx = this.center.x - cx;
    const dy = this.center.y - cy;
    const dz = this.center.z - cz;
    return (dx * dx + dy * dy + dz * dz) <= this.radius * this.radius;
  }

  public applyMatrix4(matrix: Mat4x3): this {
    const m = matrix.toArray();
    const x = this.center.x, y = this.center.y, z = this.center.z;
    this.center.x = m[0] * x + m[4] * y + m[8] * z + m[12];
    this.center.y = m[1] * x + m[5] * y + m[9] * z + m[13];
    this.center.z = m[2] * x + m[6] * y + m[10] * z + m[14];

    // Scale radius by maximum scale component of matrix
    const scaleX = Math.hypot(m[0], m[1], m[2]);
    const scaleY = Math.hypot(m[4], m[5], m[6]);
    const scaleZ = Math.hypot(m[8], m[9], m[10]);
    this.radius *= Math.max(scaleX, scaleY, scaleZ);
    return this;
  }

  public clone(): BoundingSphere {
    return new BoundingSphere(this.center, this.radius);
  }

  public copy(sphere: BoundingSphere): this {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
    return this;
  }

}
