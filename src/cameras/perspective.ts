import { Vec3, Vec2 } from '@1pizzateam/spock';
import { Camera } from './camera';

export class PerspectiveCamera extends Camera {

  fov : number;
  ratio : number;
  zNear : number;
  zFar : number;

  //context : WebGLRenderingContext;

  constructor(
    fov: number,
    zNearOrContext?: number | WebGLRenderingContext | null,
    zFarOrNear?: number,
    contextOrFar?: WebGLRenderingContext | number | null
  ) {
    super(  new Vec3(),
            new Vec3(),
            new Vec3(0.0, 1.0, 0.0)
          );

    let zNear = 0.1;
    let zFar = 1000;
    let context: WebGLRenderingContext | null = null;

    if (zNearOrContext && typeof zNearOrContext !== 'number') {
      context = zNearOrContext as WebGLRenderingContext;
      zNear = typeof zFarOrNear === 'number' ? zFarOrNear : 0.1;
      zFar = typeof contextOrFar === 'number' ? contextOrFar : 1000;
    } else {
      zNear = typeof zNearOrContext === 'number' ? zNearOrContext : 0.1;
      zFar = typeof zFarOrNear === 'number' ? zFarOrNear : 1000;
      if (contextOrFar && typeof contextOrFar !== 'number')
        context = contextOrFar as WebGLRenderingContext;
    }

    this.fov   = fov;
    this.ratio = 0;
    this.zNear = zNear;
    this.zFar  = zFar;

    const viewport = context && typeof context.getParameter === 'function' ? context.getParameter(context.VIEWPORT) : null;
    this.setProjectionMatrix(viewport);
    super.setViewMatrix();
  }

  public setProjectionMatrix(viewport?: Vec2 | Int32Array | number[] | null): void {
    if (viewport instanceof Vec2)
      this.ratio = viewport.x / Math.max(1, viewport.y);
    else if (viewport && viewport.length >= 4)
      this.ratio = viewport[2] / Math.max(1, viewport[3]);
    else
      this.ratio = this.ratio || 1;
    this.projectionMatrix.perspective(this.fov, this.ratio, this.zNear, this.zFar);
    super.setProjectionMatrix();
  }

  public setFov(fov: number): void {
    this.fov = fov;
    this.setProjectionMatrix();
  }

  public setNearFar(zNear: number, zFar: number): void {
    this.zNear = zNear;
    this.zFar  = zFar;
    this.setProjectionMatrix();
  }

}
