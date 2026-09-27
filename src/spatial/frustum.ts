import { Vec3 } from '@1pizzateam/spock';
import { BoundingSphere } from './sphere';
import { BoundingBox } from './box3';

export class Plane {

  normal: Vec3;
  constant: number;

  constructor(normal: Vec3 = new Vec3(1, 0, 0), constant: number = 0) {
    this.normal = normal.clone();
    this.constant = constant;
  }

  public set(normal: Vec3, constant: number): this {
    this.normal.copy(normal);
    this.constant = constant;
    return this;
  }

  public setComponents(x: number, y: number, z: number, w: number): this {
    this.normal.setScalar(x, y, z);
    this.constant = w;
    return this.normalize();
  }

  public normalize(): this {
    const invLen = 1.0 / (this.normal.getMagnitude() || 1.0);
    this.normal.scale(invLen);
    this.constant *= invLen;
    return this;
  }

  public distanceToPoint(point: Vec3): number {
    return this.normal.dotProduct(point) + this.constant;
  }

}

export class Frustum {

  planes: Plane[];

  constructor() {
    this.planes = [
      new Plane(), // left
      new Plane(), // right
      new Plane(), // bottom
      new Plane(), // top
      new Plane(), // near
      new Plane(), // far
    ];
  }

  public setFromProjectionViewMatrix(m: Float32Array | number[]): this {
    // Column-major indices:
    // row 0: m[0], m[4], m[8], m[12]
    // row 1: m[1], m[5], m[9], m[13]
    // row 2: m[2], m[6], m[10], m[14]
    // row 3: m[3], m[7], m[11], m[15]

    // Left plane: row 3 + row 0
    this.planes[0].setComponents(m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]);
    // Right plane: row 3 - row 0
    this.planes[1].setComponents(m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
    // Bottom plane: row 3 + row 1
    this.planes[2].setComponents(m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]);
    // Top plane: row 3 - row 1
    this.planes[3].setComponents(m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
    // Near plane: row 3 + row 2
    this.planes[4].setComponents(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]);
    // Far plane: row 3 - row 2
    this.planes[5].setComponents(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);

    return this;
  }

  public intersectsSphere(sphere: BoundingSphere): boolean {
    const center = sphere.center;
    const negRadius = -sphere.radius;
    for (let i = 0; i < 6; i++) {
      if (this.planes[i].distanceToPoint(center) < negRadius) {
        return false;
      }
    }
    return true;
  }

  public intersectsBox(box: BoundingBox): boolean {
    for (let i = 0; i < 6; i++) {
      const plane = this.planes[i];
      const px = plane.normal.x > 0 ? box.max.x : box.min.x;
      const py = plane.normal.y > 0 ? box.max.y : box.min.y;
      const pz = plane.normal.z > 0 ? box.max.z : box.min.z;
      if (plane.normal.x * px + plane.normal.y * py + plane.normal.z * pz + plane.constant < 0) {
        return false;
      }
    }
    return true;
  }

  public containsPoint(point: Vec3): boolean {
    for (let i = 0; i < 6; i++) {
      if (this.planes[i].distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }

}
