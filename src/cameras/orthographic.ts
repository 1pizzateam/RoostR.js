import { Vec3, Vec2, Rect } from '@1pizzateam/spock';
import { Camera } from './camera';

export class OrthographicCamera extends Camera {

  left : number;
  right : number;
  top : number;
  bottom : number;
  near : number;
  far : number;

  constructor(
    bounds: Rect,
    nearFar: Vec2 = new Vec2(-1000, 1000)
  ) {
    super(
      new Vec3(),
      new Vec3(),
      new Vec3(0.0, 1.0, 0.0)
    );

    this.left = bounds.topLeftCorner.x;
    this.right = bounds.bottomRightCorner.x;
    this.bottom = bounds.topLeftCorner.y;
    this.top = bounds.bottomRightCorner.y;
    this.near = nearFar.x;
    this.far = nearFar.y;

    this.setProjectionMatrix();
    super.setViewMatrix();
  }

  public setProjectionMatrix(): void {
    this.projectionMatrix.orthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    super.setProjectionMatrix();
  }

  public setBounds(bounds: Rect, nearFar?: Vec2): void {
    this.left = bounds.topLeftCorner.x;
    this.right = bounds.bottomRightCorner.x;
    this.bottom = bounds.topLeftCorner.y;
    this.top = bounds.bottomRightCorner.y;
    if (nearFar) {
      this.near = nearFar.x;
      this.far = nearFar.y;
    }
    this.setProjectionMatrix();
  }

  public getNearFar(target: Vec2 = new Vec2()): Vec2 {
    target.x = this.near;
    target.y = this.far;
    return target;
  }

}
