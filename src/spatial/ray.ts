import { Vec3 } from '@1pizzateam/spock';
import { BoundingBox } from './box3';
import { BoundingSphere } from './sphere';

export class Ray {

  origin: Vec3;
  direction: Vec3;

  constructor(origin: Vec3 = new Vec3(), direction: Vec3 = new Vec3(0, 0, -1)) {
    this.origin = origin.clone();
    this.direction = direction.clone().normalize();
  }

  public set(origin: Vec3, direction: Vec3): this {
    this.origin.copy(origin);
    this.direction.copy(direction).normalize();
    return this;
  }

  public at(t: number, target: Vec3 = new Vec3()): Vec3 {
    return target.copy(this.direction).scale(t).add(this.origin);
  }

  private static _v1 = new Vec3();
  private static _edge1 = new Vec3();
  private static _edge2 = new Vec3();
  private static _pvec = new Vec3();
  private static _tvec = new Vec3();
  private static _qvec = new Vec3();

  public intersectsBox(box: BoundingBox): boolean {
    return this.intersectBox(box) !== null;
  }

  public intersectBox(box: BoundingBox, target: Vec3 = new Vec3()): Vec3 | null {
    let tmin = (box.min.x - this.origin.x) / this.direction.x;
    let tmax = (box.max.x - this.origin.x) / this.direction.x;

    if (tmin > tmax) { const tmp = tmin; tmin = tmax; tmax = tmp; }

    let tymin = (box.min.y - this.origin.y) / this.direction.y;
    let tymax = (box.max.y - this.origin.y) / this.direction.y;

    if (tymin > tymax) { const tmp = tymin; tymin = tymax; tymax = tmp; }

    if ((tmin > tymax) || (tymin > tmax)) return null;

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    let tzmin = (box.min.z - this.origin.z) / this.direction.z;
    let tzmax = (box.max.z - this.origin.z) / this.direction.z;

    if (tzmin > tzmax) { const tmp = tzmin; tzmin = tzmax; tzmax = tmp; }

    if ((tmin > tzmax) || (tzmin > tmax)) return null;

    if (tzmin > tmin) tmin = tzmin;
    if (tzmax < tmax) tmax = tzmax;

    if (tmax < 0) return null;

    const t = tmin >= 0 ? tmin : tmax;
    return this.at(t, target);
  }

  public intersectsSphere(sphere: BoundingSphere): boolean {
    return this.intersectSphere(sphere) !== null;
  }

  public intersectSphere(sphere: BoundingSphere, target: Vec3 = new Vec3()): Vec3 | null {
    const v1 = Ray._v1.subVectors(sphere.center, this.origin);
    const tca = v1.dotProduct(this.direction);
    const d2 = v1.dotProduct(v1) - tca * tca;
    const radius2 = sphere.radius * sphere.radius;

    if (d2 > radius2) return null;

    const thc = Math.sqrt(radius2 - d2);
    const t0 = tca - thc;
    const t1 = tca + thc;

    if (t0 < 0 && t1 < 0) return null;
    const t = t0 < 0 ? t1 : t0;
    return this.at(t, target);
  }

  public intersectTriangle(
    a: Vec3,
    b: Vec3,
    c: Vec3,
    backfaceCulling: boolean = false,
    target: Vec3 = new Vec3()
  ): Vec3 | null {
    const edge1 = Ray._edge1.subVectors(b, a);
    const edge2 = Ray._edge2.subVectors(c, a);
    const pvec = Ray._pvec.crossVectors(this.direction, edge2);
    const det = edge1.dotProduct(pvec);

    if (backfaceCulling) {
      if (det < 1e-6) return null;
    } else {
      if (Math.abs(det) < 1e-6) return null;
    }

    const invDet = 1.0 / det;
    const tvec = Ray._tvec.subVectors(this.origin, a);
    const u = tvec.dotProduct(pvec) * invDet;
    if (u < 0 || u > 1) return null;

    const qvec = Ray._qvec.crossVectors(tvec, edge1);
    const v = this.direction.dotProduct(qvec) * invDet;
    if (v < 0 || u + v > 1) return null;

    const t = edge2.dotProduct(qvec) * invDet;
    if (t < 0) return null;

    return this.at(t, target);
  }

  public clone(): Ray {
    return new Ray(this.origin, this.direction);
  }

  public copy(ray: Ray): this {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);
    return this;
  }

}
