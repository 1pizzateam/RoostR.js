import { SceneRenderer }  from '../renderer/scene';
import { SceneGraph } from './sceneGraph';
import type { Mesh } from '../objects/mesh';
import { Lights, type AnyLight } from './lights';
import type { Camera } from '../cameras/camera';
import { Time, Vec3, Vec2, Utils } from '@1pizzateam/spock';
import type { Frustum, Ray3 as Ray } from '@1pizzateam/spock';
import type { IFlatLights, IFrameInfo } from '../interfaces';
import { raycastScene } from './sceneRaycast';
import { SceneCollector } from './sceneCollector';

export interface ISceneOptions {
  canvasId?: string | HTMLCanvasElement;
  context?: WebGLRenderingContext;
  viewport?: { position?: Vec2; size: Vec2 } | Vec2;
  clearColor?: Vec3;
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
  public  collector: SceneCollector;
  // Size of the render surface, uploaded to shaders as the screen resolution.
  public  resolution : Vec2;
  private frame: IFrameInfo = { id: 0 };
  private frameCounter: number = 0;
  private traversalStamp: number = 0;

  constructor(contextOrOptions: WebGLRenderingContext | ISceneOptions){
    this.meshes = [];
    this.nbMeshes = 0;
    this.lights = new Lights();
    this.ambientColor = new Vec3(0, 0, 0);
    this.fog = null;
    this.enableFrustumCulling = false;
    this.collector = new SceneCollector();

    let ctx: WebGLRenderingContext | null = null;
    let opts: ISceneOptions | null = null;

    if (contextOrOptions && typeof (contextOrOptions as any).createBuffer === 'function')
      ctx = contextOrOptions as WebGLRenderingContext;
    else if (contextOrOptions && typeof contextOrOptions === 'object') {
      opts = contextOrOptions as ISceneOptions;
      if (opts.context) ctx = opts.context;
      else if (opts.canvasId) ctx = Scene.contextFromCanvas(opts.canvasId);
      if (opts.ambientColor) this.setAmbientColor(opts.ambientColor);
      if (opts.fog) this.fog = opts.fog;
      if (opts.enableFrustumCulling !== undefined) this.enableFrustumCulling = opts.enableFrustumCulling;
    } else
      ctx = contextOrOptions as WebGLRenderingContext;

    if (!ctx)
      throw new Error('Scene requires a WebGL context or a canvasId.');

    this.context = ctx;
    this.resolution = new Vec2(ctx.drawingBufferWidth || 0, ctx.drawingBufferHeight || 0);
    this.renderer = new SceneRenderer(this.context);
    this.graph = new SceneGraph();

    if (opts && this.context) {
      if (opts.viewport) {
        if (opts.viewport instanceof Vec2)
          this.setViewport(opts.viewport);
        else
          this.setViewport(opts.viewport.size, opts.viewport.position);
      }
      if (opts.clearColor)
        this.setClearColor(opts.clearColor);
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

  private static contextFromCanvas(canvasId: string | HTMLCanvasElement): WebGLRenderingContext | null {
    const canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) as HTMLCanvasElement | null : canvasId;
    if (!canvas)
      return null;
    return (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  }

  public setViewport(size: Vec2, position?: Vec2): void {
    const x = position?.x ?? 0;
    const y = position?.y ?? 0;
    const w = size.x;
    const h = size.y;

    this.resolution.x = w;
    this.resolution.y = h;
    if (this.context && this.context.viewport)
      this.context.viewport(x, y, w, h);
  }

  public getSize(target: Vec2 = new Vec2()): Vec2 {
    target.copy(this.resolution);
    return target;
  }

  public setClearColor(color: Vec3, alpha = 1.0): void {
    if (!this.context) return;
    this.context.clearColor(
      Utils.clamp(color.x, 0, 1),
      Utils.clamp(color.y, 0, 1),
      Utils.clamp(color.z, 0, 1),
      Utils.clamp(alpha, 0, 1)
    );
  }

  public setSize(size: Vec2): void {
    if (this.context && this.context.canvas) {
      const canvas = this.context.canvas as HTMLCanvasElement;
      canvas.width = size.x;
      canvas.height = size.y;
    }
    this.setViewport(size);
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

  public setAmbientColor(color: Vec3): this {
    this.ambientColor.copy(color);
    return this;
  }

  public setFog(color: Vec3, near: number, far = 1000): this {
    this.fog = {
      color: new Vec3(color.x, color.y, color.z),
      near,
      far
    };
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

  // Rebuilds the GPU side of the scene (buffers, programs, owned textures) after the context was lost
  // and restored, from the data the meshes still hold on the CPU. Call it from Renderer's onContextRestored.
  public restore(): void {
    this.renderer.reset();
    for (const mesh of this.meshes)
      mesh.restore();
  }

  public destroy(destroyMeshes: boolean = true): void {
    if (destroyMeshes)
      for (const mesh of this.meshes)
        mesh.destroy();
    this.clearMeshes();
    this.clearLights();
    this.clearFog();
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

  public raycast(ray: Ray, precise: boolean = false): { mesh: Mesh; distance: number; point: Vec3 }[] {
    this.computeWorldMatrices();
    return raycastScene(this.meshes, this.traversalStamp, ray, precise);
  }

  public render (camera: Camera, time: number = Time.now()): number {
    this.computeWorldMatrices();
    const flatLights = this.lights.flatten(this.ambientColor);

    const frustum = this.enableFrustumCulling
      ? this.collector.scratchFrustum.setFromProjectionViewMatrix(camera.getProjectionViewMatrix())
      : null;

    this.collector.collect(this.meshes, camera, frustum, true, true, this.traversalStamp);

    const frame = this.beginFrame();
    this.disableBlendMode();

    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    let renderedCount = 0;
    for (const mesh of this.collector.opaqueList) {
      this.renderer.setDepthWrite(mesh.depthWrite);
      mesh.renderSelf(projMatrix, viewMatrix, flatLights, time, false, camPos, this.fog, frame);
      renderedCount++;
    }

    renderedCount += this.collector.drawBlended(this, camera, time, flatLights, frame);
    this.renderer.setDepthWrite(true);
    return renderedCount;
  }

  // Marks every descendant of scene meshes so only root meshes start a traversal.
  private markDescendants(): number {
    const stamp = ++this.traversalStamp;
    const mark = (mesh: Mesh): void => {
      for (const child of mesh.children) {
        child.traversalStamp = stamp;
        mark(child);
      }
    };
    for (const mesh of this.meshes)
      mark(mesh);
    return stamp;
  }

  private computeWorldMatrices(): void {
    const stamp = this.markDescendants();
    for (const mesh of this.meshes)
      if (mesh.traversalStamp !== stamp)
        mesh.computeWorldMatrix( this.graph );
  }

  private beginFrame(): IFrameInfo {
    this.renderer.invalidateState();
    this.frame.id = ++this.frameCounter;
    this.frame.resolution = this.resolution;
    return this.frame;
  }

  public renderBlended (
    camera: Camera,
    time: number = Time.now(),
    flatLights: IFlatLights = this.lights.flatten(this.ambientColor),
    frustum: Frustum | null = null
  ): number {
    this.collector.collect(this.meshes, camera, frustum, false, true, this.markDescendants());
    return this.collector.drawBlended(this, camera, time, flatLights, this.beginFrame());
  }

}
