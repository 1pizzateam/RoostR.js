import { Vec3 } from '@1pizzateam/spock';
import { Camera } from './camera';

export class OrthographicCamera extends Camera {

  left : number;
  right : number;
  top : number;
  bottom : number;
  near : number;
  far : number;
  //camera : Camera;

  constructor(left: number, 
              right: number, 
              top: number, 
              bottom: number, 
              near: number, 
              far: number
            ) {

    super(  new Vec3(),
            new Vec3(),
            new Vec3(0.0, 1.0, 0.0)
          );

    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;

    this.setProjectionMatrix();
    super.setViewMatrix();
  }

  public setProjectionMatrix(): void {
    this.projectionMatrix.orthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
  }

}
