import { SceneRenderer }  from '../renderer/scene';
import { SceneGraph } from './sceneGraph';
import { Mesh } from '../mesh';
import { Lights, AnyLight } from './lights';
import { Camera } from '../cameras/camera';
import { Time, Vec3 } from '@1pizzateam/spock';
import { Frustum, Ray } from '../spatial/index';
import { IFlatLights } from '../interfaces';

export interface ISceneOptions {
  canvasId?: string | HTMLCanvasElement;
  context?: WebGLRenderingContext;
  viewport?: { x?: number; y?: number; width: number; height: number };
  clearColor?: Vec3 | number[];
  cullFace?: 'BACK' | 'FRONT' | 'NONE';
  frontFace?: 'CCW' | 'CW';
  depthTest?: boolean;
  ambientColor?: Vec3;
  fog?: { color: Vec3; near: number; far: number } | null;
  enableFrustumCulling?: boolean;
}

export class Scene {
  public  meshes   : Mesh[];
  public  nbMeshes : number;
  public  lights   : Lights;
  public  ambientColor: Vec3;
  public  fog      : { color: Vec3; near: number; far: number } | null;
  public  enableFrustumCulling: boolean;
  public  context  : WebGLRenderingContext;
  public  renderer : SceneRenderer;
  public  graph    : SceneGraph;
  private scratchFrustum: Frustum = new Frustum();
  private scratchPV: Float32Array = new Float32Array(16);

  constructor(contextOrOptions: WebGLRenderingContext | ISceneOptions){
    this.meshes = [];
    this.nbMeshes = 0;
    this.lights = new Lights();
    this.ambientColor = new Vec3(0, 0, 0);
    this.fog = null;
    this.enableFrustumCulling = false;

    let ctx: WebGLRenderingContext | null = null;
    let opts: ISceneOptions | null = null;

    if (contextOrOptions && typeof (contextOrOptions as any).createBuffer === 'function') {
      ctx = contextOrOptions as WebGLRenderingContext;
    } else if (contextOrOptions && typeof contextOrOptions === 'object') {
      opts = contextOrOptions as ISceneOptions;
      if (opts.context) {
        ctx = opts.context;
      }
      if (opts.ambientColor) this.setAmbientColor(opts.ambientColor);
      if (opts.fog) this.fog = opts.fog;
      if (opts.enableFrustumCulling !== undefined) this.enableFrustumCulling = opts.enableFrustumCulling;
    } else {
      ctx = contextOrOptions as WebGLRenderingContext;
    }

    this.context = ctx!;
    this.renderer = new SceneRenderer(this.context);
    this.graph = new SceneGraph();

    if (opts && this.context) {
      if (opts.viewport) {
        this.setViewport(opts.viewport.x || 0, opts.viewport.y || 0, opts.viewport.width, opts.viewport.height);
      }
      if (opts.clearColor) {
        const c = opts.clearColor;
        if (Array.isArray(c)) {
          this.context.clearColor(c[0] ?? 0, c[1] ?? 0, c[2] ?? 0, c[3] ?? 1);
        } else if ('x' in (c as any) && 'y' in (c as any) && 'z' in (c as any)) {
          this.context.clearColor((c as any).x, (c as any).y, (c as any).z, 1.0);
        }
      }
      if (opts.depthTest !== false && this.context.DEPTH_TEST) {
        this.context.enable(this.context.DEPTH_TEST);
        if (this.context.LEQUAL) this.context.depthFunc(this.context.LEQUAL);
      }
      if (opts.cullFace && opts.cullFace !== 'NONE' && this.context.CULL_FACE) {
        this.context.enable(this.context.CULL_FACE);
        const mode = (this.context as any)[opts.cullFace] || this.context.BACK;
        if (mode) this.context.cullFace(mode);
      }
      if (opts.frontFace && this.context.frontFace) {
        const mode = (this.context as any)[opts.frontFace] || this.context.CCW;
        if (mode) this.context.frontFace(mode);
      }
    }
  }

  public setViewport(x: number, y: number, width: number, height: number): void {
    if (this.context && this.context.viewport) {
      this.context.viewport(x, y, width, height);
    }
  }

  public clear(color: boolean = true, depth: boolean = true): void {
    if (!this.context) return;
    let mask = 0;
    if (color) mask |= this.context.COLOR_BUFFER_BIT;
    if (depth) mask |= this.context.DEPTH_BUFFER_BIT;
    if (mask) this.context.clear(mask);
  }

  public addMesh( mesh: Mesh ): void {
    if (this.meshes.indexOf(mesh) === -1) {
      this.meshes.push(mesh);
      this.nbMeshes++;
    }
  }

  public removeMesh( mesh: Mesh ): boolean {
    const index = this.meshes.indexOf(mesh);
    if (index !== -1) {
      this.meshes.splice(index, 1);
      this.nbMeshes--;
      return true;
    }
    return false;
  }

  public addLight( light: AnyLight ): void {
    this.lights.addLight(light);
  }

  public removeLight( light: AnyLight ): boolean {
    return this.lights.removeLight(light);
  }

  public setAmbientColor(rOrVec: Vec3 | number, g?: number, b?: number): this {
    if (rOrVec instanceof Vec3) {
      this.ambientColor.copy(rOrVec);
    } else {
      this.ambientColor.setScalar(rOrVec, g ?? 0, b ?? 0);
    }
    return this;
  }

  public setFog(color: Vec3 | number, nearOrG: number, farOrB?: number, far?: number): this {
    if (color instanceof Vec3) {
      this.fog = {
        color: color.clone(),
        near: nearOrG,
        far: farOrB ?? 1000
      };
    } else {
      this.fog = {
        color: new Vec3(color, nearOrG, farOrB ?? 0),
        near: far ?? 1,
        far: 1000
      };
    }
    return this;
  }

  public clearFog(): this {
    this.fog = null;
    return this;
  }

  public clearMeshes(): void {
    this.meshes = [];
    this.nbMeshes = 0;
  }

  public clearLights(): void {
    this.lights.clear();
  }

  public getLightsProperty (property: string): (number | string)[] | undefined {
    return this.lights.getFlatArray(property);
  }

  public enableBlendMode (equation:string, source:string, destination:string): void{
    this.renderer.enableBlendMode(equation, source, destination);
  }

  public disableBlendMode (): void {
    this.renderer.disableBlendMode();
  }

  public getRendererBlendMode (): GLenum|Float32Array|GLint|WebGLBuffer|GLboolean|GLboolean[]|GLfloat|WebGLFramebuffer|Int32Array|GLuint|WebGLTexture {
    return this.renderer.getParameter(this.context.BLEND);
  }

  public raycast(ray: Ray): { mesh: Mesh; distance: number; point: Vec3 }[] {
    this.computeWorldMatrices();
    const hits: { mesh: Mesh; distance: number; point: Vec3 }[] = [];
    for (let mesh of this.meshes) {
      const hit = mesh.raycast(ray);
      if (hit) {
        hits.push({ mesh, distance: hit.distance, point: hit.point });
      }
    }
    hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }

  public render (camera: Camera, time: number = Time.now()): number {
    this.computeWorldMatrices();
    const flatLights = this.lights.flatten();
    if (this.ambientColor.x > 0 || this.ambientColor.y > 0 || this.ambientColor.z > 0) {
      if (!flatLights.ambient) flatLights.ambient = [0, 0, 0];
      flatLights.ambient[0] += this.ambientColor.x;
      flatLights.ambient[1] += this.ambientColor.y;
      flatLights.ambient[2] += this.ambientColor.z;
    }

    let frustum: Frustum | null = null;
    if (this.enableFrustumCulling) {
      const pm = camera.getProjectionMatrix();
      const vm = camera.getViewMatrix();
      for (let c = 0; c < 4; c++) {
        const b0 = vm[c * 4];
        const b1 = vm[c * 4 + 1];
        const b2 = vm[c * 4 + 2];
        const b3 = vm[c * 4 + 3];
        this.scratchPV[c * 4]     = pm[0] * b0 + pm[4] * b1 + pm[8] * b2 + pm[12] * b3;
        this.scratchPV[c * 4 + 1] = pm[1] * b0 + pm[5] * b1 + pm[9] * b2 + pm[13] * b3;
        this.scratchPV[c * 4 + 2] = pm[2] * b0 + pm[6] * b1 + pm[10] * b2 + pm[14] * b3;
        this.scratchPV[c * 4 + 3] = pm[3] * b0 + pm[7] * b1 + pm[11] * b2 + pm[15] * b3;
      }
      frustum = this.scratchFrustum.setFromProjectionViewMatrix(this.scratchPV);
    }

    this.disableBlendMode();

    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    let renderedCount = 0;
    for (let mesh of this.meshes) {
      if (mesh.blendMode) continue;
      if (frustum && !frustum.intersectsSphere(mesh.computeBoundingSphere())) {
        continue;
      }
      mesh.render(  projMatrix,
                    viewMatrix,
                    flatLights,
                    time,
                    false,
                    camPos,
                    this.fog
                  );
      renderedCount++;
    }

    renderedCount += this.renderBlended(camera, time, flatLights, frustum);
    return renderedCount;
  }

  private computeWorldMatrices(): void {
    for (let mesh of this.meshes) {
      mesh.computeWorldMatrix( this.graph );
    }
  }

  public renderBlended (
    camera: Camera,
    time: number = Time.now(),
    flatLights: IFlatLights = this.lights.flatten(),
    frustum: Frustum | null = null
  ): number {
    this.enableBlendMode('FUNC_ADD', 'SRC_ALPHA', 'ONE');
    const blendedMeshes = this.meshes.filter(m => m.blendMode);
    if (blendedMeshes.length > 1) {
      const camPos = camera.position;
      blendedMeshes.sort((a, b) => b.getWorldPosition().getDistance(camPos) - a.getWorldPosition().getDistance(camPos));
    }
    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    let renderedCount = 0;
    for (let mesh of blendedMeshes) {
      if (frustum && !frustum.intersectsSphere(mesh.computeBoundingSphere())) {
        continue;
      }
      mesh.render(  projMatrix,
                    viewMatrix,
                    flatLights,
                    time,
                    true,
                    camPos,
                    this.fog
                  );
      renderedCount++;
    }
    return renderedCount;
  }

}
