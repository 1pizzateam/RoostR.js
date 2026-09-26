import { Vec3, Mat4x3, Mat4 } from '@1pizzateam/spock';

export class Camera {

  viewMatrix : Mat4x3;
  projectionMatrix : Mat4;

  position : Vec3;
  target   : Vec3;
  up       : Vec3;

  constructor(position: Vec3, target: Vec3, up: Vec3) {

    this.viewMatrix = new Mat4x3();
    this.projectionMatrix = new Mat4();

    this.viewMatrix.identity();
    this.projectionMatrix.identity();

    this.position = position;
    this.target   = target;
    this.up       = up;

  }

  public setViewMatrix(): void {
    if (this.position.equals(this.target)) {
      this.viewMatrix.identity();
    } else {
      this.viewMatrix.lookAtRH(
        this.position,
        this.target,
        this.up
      );
    }
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

  public getViewMatrix(): Float32Array {
    return this.viewMatrix.toArray();
  }

  public getProjectionMatrix(): Float32Array {
    return this.projectionMatrix.toArray();
  }

  public getViewMatrixObject(): Mat4x3 {
    return this.viewMatrix;
  }

  public getProjectionMatrixObject(): Mat4 {
    return this.projectionMatrix;
  }

}
