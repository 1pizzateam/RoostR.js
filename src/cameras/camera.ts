import { Vec3, Vec2, Mat4x3, Mat4 } from '@1pizzateam/spock';
import { Ray3 as Ray } from '@1pizzateam/spock';

export class Camera {

  viewMatrix : Mat4x3;
  projectionMatrix : Mat4;

  position : Vec3;
  target   : Vec3;
  up       : Vec3;

  protected cachedViewMatrix: Float32Array;
  protected cachedProjectionMatrix: Float32Array;

  private projectionViewMatrix: Mat4 = new Mat4();
  private inverseProjectionViewMatrix: Mat4 = new Mat4();
  private isProjectionViewDirty: boolean = true;
  private isInverseDirty: boolean = true;

  private static _scratchNear = new Vec3();
  private static _scratchFar = new Vec3();
  private static _scratchDir = new Vec3();
  private static _scratchNdc = new Vec3();

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
    this.invalidateProjectionView();
  }

  public setProjectionMatrix(): void {
    this.projectionMatrix.toArray(this.cachedProjectionMatrix);
    this.invalidateProjectionView();
  }

  private invalidateProjectionView(): void {
    this.isProjectionViewDirty = true;
    this.isInverseDirty = true;
  }

  // projection * view, recomputed only after the view or projection changed.
  public getProjectionViewMatrix(): Mat4 {
    if (this.isProjectionViewDirty) {
      this.projectionViewMatrix.copy(this.projectionMatrix).multiplyAffine(this.viewMatrix);
      this.isProjectionViewDirty = false;
    }
    return this.projectionViewMatrix;
  }

  public getInverseProjectionViewMatrix(): Mat4 {
    if (this.isInverseDirty) {
      this.getProjectionViewMatrix();
      this.inverseProjectionViewMatrix.copy(this.projectionViewMatrix).invert();
      this.isInverseDirty = false;
    }
    return this.inverseProjectionViewMatrix;
  }

  public setPosition(position: Vec3): void {
    this.position.copy(position);
    this.setViewMatrix();
  }

  public setTarget(target: Vec3): void {
    this.target.copy(target);
    this.setViewMatrix();
  }

  public setUp(up: Vec3): void {
    this.up.copy(up);
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

  public getRay(ndc: Vec2, targetRay: Ray = new Ray()): Ray {
    const inverse = this.getInverseProjectionViewMatrix();
    const near = inverse.transformPoint(Camera._scratchNdc.setScalar(ndc.x, ndc.y, -1.0), Camera._scratchNear);
    const far = inverse.transformPoint(Camera._scratchNdc.setScalar(ndc.x, ndc.y, 1.0), Camera._scratchFar);
    const dir = Camera._scratchDir.subVectors(far, near).normalize();

    targetRay.set(near, dir);
    return targetRay;
  }

}
