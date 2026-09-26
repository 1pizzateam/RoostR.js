import { Vector3 } from '@lcluber/type6js';
import { Camera } from './camera';

export class PerspectiveCamera extends Camera {

  fov : number;
  ratio : number;
  zNear : number;
  zFar : number;

  //context : WebGLRenderingContext;

  constructor(fov: number, zNear: number, zFar: number, context : WebGLRenderingContext) {

    super(  new Vector3(),
            new Vector3(),
            new Vector3(0.0, 1.0, 0.0)
          );

    this.fov   = fov;
    this.ratio = 0;
    this.zNear = zNear;
    this.zFar  = zFar;

    //this.context = context;

    this.setProjectionMatrix(context.getParameter(context.VIEWPORT));
    super.setViewMatrix();

  }

  public setProjectionMatrix(viewport: Int32Array): void {
    //let viewport = this.context.getParameter(this.context.VIEWPORT);
    this.ratio = viewport[2] / Math.max(1, viewport[3]);
    this.projectionMatrix.perspective(this.fov, this.ratio, this.zNear, this.zFar);
  }

}
