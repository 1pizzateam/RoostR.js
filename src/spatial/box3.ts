import { Vec3, Mat4x3 } from '@1pizzateam/spock';

export class BoundingBox {

  min: Vec3;
  max: Vec3;

  constructor(min: Vec3 = new Vec3(Infinity, Infinity, Infinity), max: Vec3 = new Vec3(-Infinity, -Infinity, -Infinity)) {
    this.min = min.clone();
    this.max = max.clone();
  }

  public set(min: Vec3, max: Vec3): this {
    this.min.copy(min);
    this.max.copy(max);
    return this;
  }

  public setFromPoints(points: Vec3[] | number[] | Float32Array, stride: number = 3): this {
    this.makeEmpty();
    if (points.length === 0) return this;

    if (points[0] instanceof Vec3) {
      for (const p of <Vec3[]>points) {
        this.expandByPoint(p);
      }
    } else {
      const arr = <number[] | Float32Array>points;
      const tmp = new Vec3();
      for (let i = 0; i < arr.length; i += stride) {
        tmp.setScalar(arr[i], arr[i + 1] ?? 0, arr[i + 2] ?? 0);
        this.expandByPoint(tmp);
      }
    }
    return this;
  }

  public makeEmpty(): this {
    this.min.setScalar(Infinity, Infinity, Infinity);
    this.max.setScalar(-Infinity, -Infinity, -Infinity);
    return this;
  }

  public isEmpty(): boolean {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }

  public getCenter(target: Vec3 = new Vec3()): Vec3 {
    if (this.isEmpty()) return target.setScalar(0, 0, 0);
    return target.addVectors(this.min, this.max).scale(0.5);
  }

  public getSize(target: Vec3 = new Vec3()): Vec3 {
    if (this.isEmpty()) return target.setScalar(0, 0, 0);
    return target.subVectors(this.max, this.min);
  }

  public expandByPoint(point: Vec3): this {
    this.min.x = Math.min(this.min.x, point.x);
    this.min.y = Math.min(this.min.y, point.y);
    this.min.z = Math.min(this.min.z, point.z);

    this.max.x = Math.max(this.max.x, point.x);
    this.max.y = Math.max(this.max.y, point.y);
    this.max.z = Math.max(this.max.z, point.z);
    return this;
  }

  public containsPoint(point: Vec3): boolean {
    return (
      point.x >= this.min.x && point.x <= this.max.x &&
      point.y >= this.min.y && point.y <= this.max.y &&
      point.z >= this.min.z && point.z <= this.max.z
    );
  }

  public intersectsBox(box: BoundingBox): boolean {
    return !(
      box.max.x < this.min.x || box.min.x > this.max.x ||
      box.max.y < this.min.y || box.min.y > this.max.y ||
      box.max.z < this.min.z || box.min.z > this.max.z
    );
  }

  public clone(): BoundingBox {
    return new BoundingBox(this.min, this.max);
  }

  public copy(box: BoundingBox): this {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }

  public applyMatrix4(matrix: Mat4x3): this {
    if (this.isEmpty()) return this;

    const m = matrix.toArray();
    const minX = this.min.x, minY = this.min.y, minZ = this.min.z;
    const maxX = this.max.x, maxY = this.max.y, maxZ = this.max.z;

    let minRx = m[12], maxRx = m[12];
    let minRy = m[13], maxRy = m[13];
    let minRz = m[14], maxRz = m[14];

    // X column
    let a = m[0] * minX, b = m[0] * maxX;
    if (a < b) { minRx += a; maxRx += b; } else { minRx += b; maxRx += a; }
    a = m[1] * minX; b = m[1] * maxX;
    if (a < b) { minRy += a; maxRy += b; } else { minRy += b; maxRy += a; }
    a = m[2] * minX; b = m[2] * maxX;
    if (a < b) { minRz += a; maxRz += b; } else { minRz += b; maxRz += a; }

    // Y column
    a = m[4] * minY; b = m[4] * maxY;
    if (a < b) { minRx += a; maxRx += b; } else { minRx += b; maxRx += a; }
    a = m[5] * minY; b = m[5] * maxY;
    if (a < b) { minRy += a; maxRy += b; } else { minRy += b; maxRy += a; }
    a = m[6] * minY; b = m[6] * maxY;
    if (a < b) { minRz += a; maxRz += b; } else { minRz += b; maxRz += a; }

    // Z column
    a = m[8] * minZ; b = m[8] * maxZ;
    if (a < b) { minRx += a; maxRx += b; } else { minRx += b; maxRx += a; }
    a = m[9] * minZ; b = m[9] * maxZ;
    if (a < b) { minRy += a; maxRy += b; } else { minRy += b; maxRy += a; }
    a = m[10] * minZ; b = m[10] * maxZ;
    if (a < b) { minRz += a; maxRz += b; } else { minRz += b; maxRz += a; }

    this.min.setScalar(minRx, minRy, minRz);
    this.max.setScalar(maxRx, maxRy, maxRz);
    return this;
  }

}
