import { Vector3, Matrix4x3, Matrix4x4 } from '@lcluber/type6js';

export class Camera {

  viewMatrix : Matrix4x3;
  projectionMatrix : Matrix4x4;

  position : Vector3;
  target   : Vector3;
  up       : Vector3;

  constructor(position: Vector3, target: Vector3, up: Vector3) {

    this.viewMatrix = new Matrix4x3();
    this.projectionMatrix = new Matrix4x4();

    this.viewMatrix.identity();
    this.projectionMatrix.identity();

    this.position = position;
    this.target   = target;
    this.up       = up;

  }

  public setViewMatrix(): void {
    if (this.position.x === this.target.x && 
        this.position.y === this.target.y && 
        this.position.z === this.target.z) {
      this.viewMatrix.identity();
    } else {
      this.viewMatrix.lookAtRH(
        this.position,
        this.target,
        this.up
      );
    }
  }

  public setPosition(vector3:Vector3): void {
    this.position.copy(vector3);
    this.setViewMatrix();
  }

  public setTarget(vector3:Vector3): void {
    this.target.copy(vector3);
    this.setViewMatrix();
  }

  public setUp(vector3:Vector3): void {
    this.up.copy(vector3);
    this.setViewMatrix();
  }

  public getViewMatrix(): Float32Array {
    return this.viewMatrix.toArray();
  }

  public getProjectionMatrix(): Float32Array {
    return this.projectionMatrix.toArray();
  }

}
