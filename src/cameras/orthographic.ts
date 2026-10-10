import { Vec3, Rect } from '@1pizzateam/spock';
import { Camera } from './camera';

export class OrthographicCamera extends Camera {

  left : number;
  right : number;
  top : number;
  bottom : number;
  near : number;
  far : number;
  //camera : Camera;

  constructor(
    boundsOrLeft: Rect | number,
    rightOrNear?: number,
    topOrFar?: number,
    bottom?: number,
    near?: number,
    far?: number
  ) {
    super(
      new Vec3(),
      new Vec3(),
      new Vec3(0.0, 1.0, 0.0)
    );

    if (boundsOrLeft instanceof Rect) {
      this.left = boundsOrLeft.topLeftCorner.x;
      this.right = boundsOrLeft.bottomRightCorner.x;
      this.bottom = boundsOrLeft.topLeftCorner.y;
      this.top = boundsOrLeft.bottomRightCorner.y;
      this.near = rightOrNear !== undefined ? rightOrNear : -1000;
      this.far = topOrFar !== undefined ? topOrFar : 1000;
    } else {
      this.left = boundsOrLeft;
      this.right = rightOrNear!;
      this.top = topOrFar!;
      this.bottom = bottom!;
      this.near = near !== undefined ? near : -1000;
      this.far = far !== undefined ? far : 1000;
    }

    this.setProjectionMatrix();
    super.setViewMatrix();
  }

  public setProjectionMatrix(): void {
    this.projectionMatrix.orthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    super.setProjectionMatrix();
  }

  public setBounds(
    boundsOrLeft: Rect | number,
    rightOrNear?: number,
    topOrFar?: number,
    bottom?: number,
    near?: number,
    far?: number
  ): void {
    if (boundsOrLeft instanceof Rect) {
      this.left = boundsOrLeft.topLeftCorner.x;
      this.right = boundsOrLeft.bottomRightCorner.x;
      this.bottom = boundsOrLeft.topLeftCorner.y;
      this.top = boundsOrLeft.bottomRightCorner.y;
      if (rightOrNear !== undefined) this.near = rightOrNear;
      if (topOrFar !== undefined) this.far = topOrFar;
    } else {
      this.left = boundsOrLeft;
      this.right = rightOrNear!;
      this.top = topOrFar!;
      this.bottom = bottom!;
      if (near !== undefined) this.near = near;
      if (far !== undefined) this.far = far;
    }
    this.setProjectionMatrix();
  }

}
