import { Vec3, Mat4x3, Mat4 } from '@1pizzateam/spock';
import { Ray } from '../spatial/ray';

export class Camera {

  viewMatrix : Mat4x3;
  projectionMatrix : Mat4;

  position : Vec3;
  target   : Vec3;
  up       : Vec3;

  protected cachedViewMatrix: Float32Array;
  protected cachedProjectionMatrix: Float32Array;

  private static _scratchNear = new Vec3();
  private static _scratchFar = new Vec3();
  private static _scratchDir = new Vec3();

  constructor(position: Vec3, target: Vec3, up: Vec3) {

    this.viewMatrix = new Mat4x3();
    this.projectionMatrix = new Mat4();

    this.viewMatrix.identity();
    this.projectionMatrix.identity();

    this.cachedViewMatrix = new Float32Array(16);
    this.cachedProjectionMatrix = new Float32Array(16);
    this.viewMatrix.toArray(this.cachedViewMatrix);
    this.projectionMatrix.toArray(this.cachedProjectionMatrix);

    this.position = position;
    this.target   = target;
    this.up       = up;

  }

  public setViewMatrix(): void {
    this.viewMatrix.lookAtRH(
      this.position,
      this.target,
      this.up
    );
    this.viewMatrix.toArray(this.cachedViewMatrix);
  }

  public setProjectionMatrix(): void {
    this.projectionMatrix.toArray(this.cachedProjectionMatrix);
  }

  public setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.position.copy(xOrVec);
    } else {
      this.position.setScalar(xOrVec, y, z);
    }
    this.setViewMatrix();
  }

  public setTarget(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.target.copy(xOrVec);
    } else {
      this.target.setScalar(xOrVec, y, z);
    }
    this.setViewMatrix();
  }

  public setUp(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.up.copy(xOrVec);
    } else {
      this.up.setScalar(xOrVec, y, z);
    }
    this.setViewMatrix();
  }

  public lookAt(target: Vec3): void {
    this.setTarget(target);
  }

  public getViewDirection(target: Vec3 = new Vec3()): Vec3 {
    return target.subVectors(this.target, this.position).normalize();
  }

  public getDistance(): number {
    return this.position.getDistance(this.target);
  }

  public dolly(amount: number): void {
    this.position.lerp(this.target, amount);
    this.setViewMatrix();
  }

  public getViewMatrix(): Float32Array {
    return this.cachedViewMatrix;
  }

  public getProjectionMatrix(): Float32Array {
    return this.cachedProjectionMatrix;
  }

  public getViewMatrixObject(): Mat4x3 {
    return this.viewMatrix;
  }

  public getProjectionMatrixObject(): Mat4 {
    return this.projectionMatrix;
  }

  public getRay(ndcX: number, ndcY: number, targetRay: Ray = new Ray()): Ray {
    const vm = this.viewMatrix.toArray();
    const v4 = new Mat4(
      vm[0], vm[1], vm[2], vm[3],
      vm[4], vm[5], vm[6], vm[7],
      vm[8], vm[9], vm[10], vm[11],
      vm[12], vm[13], vm[14], vm[15]
    );
    const invPV = new Mat4().copy(this.projectionMatrix).multiply(v4).invert();
    const m = invPV.toArray();

    const unproject = (x: number, y: number, z: number, target: Vec3): Vec3 => {
      const w = m[3] * x + m[7] * y + m[11] * z + m[15];
      const invW = w !== 0 ? 1.0 / w : 1.0;
      target.x = (m[0] * x + m[4] * y + m[8] * z + m[12]) * invW;
      target.y = (m[1] * x + m[5] * y + m[9] * z + m[13]) * invW;
      target.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) * invW;
      return target;
    };

    const near = unproject(ndcX, ndcY, -1.0, Camera._scratchNear);
    const far = unproject(ndcX, ndcY, 1.0, Camera._scratchFar);
    const dir = Camera._scratchDir.subVectors(far, near).normalize();

    targetRay.set(near, dir);
    return targetRay;
  }

}
