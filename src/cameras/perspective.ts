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
    nearFar: Vec2 = new Vec2(0.1, 1000),
    context?: WebGLRenderingContext | null
  ) {
    super(  new Vec3(),
            new Vec3(),
            new Vec3(0.0, 1.0, 0.0)
          );

    this.fov   = fov;
    this.ratio = 0;
    this.zNear = nearFar.x;
    this.zFar  = nearFar.y;

    let viewport: Vec2 | null = null;
    if (context && typeof context.getParameter === 'function') {
      const vp = context.getParameter(context.VIEWPORT);
      if (vp && vp.length >= 4)
        viewport = new Vec2(vp[2], vp[3]);
    }
    this.setProjectionMatrix(viewport);
    super.setViewMatrix();
  }

  public setProjectionMatrix(viewport?: Vec2 | null): void {
    if (viewport)
      this.ratio = viewport.x / Math.max(1, viewport.y);
    else
      this.ratio = this.ratio || 1;
    this.projectionMatrix.perspective(this.fov, this.ratio, this.zNear, this.zFar);
    super.setProjectionMatrix();
  }

  public setFov(fov: number): void {
    this.fov = fov;
    this.setProjectionMatrix();
  }

  public setNearFar(nearFar: Vec2): void {
    this.zNear = nearFar.x;
    this.zFar = nearFar.y;
    this.setProjectionMatrix();
  }

  public getNearFar(target: Vec2 = new Vec2()): Vec2 {
    target.x = this.zNear;
    target.y = this.zFar;
    return target;
  }

}
