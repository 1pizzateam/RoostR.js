import { SceneRenderer }  from '../renderer/scene';
import { SceneGraph } from './sceneGraph';
import type { Mesh } from '../mesh';
import { Lights, type AnyLight } from './lights';
import type { Camera } from '../cameras/camera';
import { Time, Vec3, Vec2 } from '@1pizzateam/spock';
import { Frustum, type Ray3 as Ray } from '@1pizzateam/spock';
import type { IFlatLights, IFrameInfo } from '../interfaces';
import { assignVec3, type Vec3Like } from '../vector';

export interface ISceneOptions {
  canvasId?: string | HTMLCanvasElement;
  context?: WebGLRenderingContext;
  viewport?: { x?: number; y?: number; width: number; height: number };
  clearColor?: Vec3 | number[];
  cullFace?: 'BACK' | 'FRONT' | 'NONE';
  frontFace?: 'CCW' | 'CW';
  depthTest?: boolean;
  ambientColor?: Vec3Like;
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
  // Size of the render surface, uploaded to shaders as the screen resolution.
  public  resolution : Vec2;
  private scratchFrustum: Frustum = new Frustum();
  private scratchVec: Vec3 = new Vec3();
  private frame: IFrameInfo = { id: 0 };
  private frameCounter: number = 0;
  private traversalStamp: number = 0;
  private opaqueList: Mesh[] = [];
  private blendedList: Mesh[] = [];

  constructor(contextOrOptions: WebGLRenderingContext | ISceneOptions){
    this.meshes = [];
    this.nbMeshes = 0;
    this.lights = new Lights();
    this.ambientColor = new Vec3(0, 0, 0);
    this.fog = null;
    this.enableFrustumCulling = false;

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
      if (opts.viewport)
        this.setViewport(opts.viewport.x || 0, opts.viewport.y || 0, opts.viewport.width, opts.viewport.height);
      if (opts.clearColor) {
        const c = opts.clearColor;
        if (Array.isArray(c))
          this.context.clearColor(c[0] ?? 0, c[1] ?? 0, c[2] ?? 0, c[3] ?? 1);
        else if ('x' in (c as any) && 'y' in (c as any) && 'z' in (c as any))
          this.context.clearColor((c as any).x, (c as any).y, (c as any).z, 1.0);
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

  private static contextFromCanvas(canvasId: string | HTMLCanvasElement): WebGLRenderingContext | null {
    const canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) as HTMLCanvasElement | null : canvasId;
    if (!canvas)
      return null;
    return (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  }

  public setViewport(x: number, y: number, width: number, height: number): void {
    this.resolution.setScalar(width, height);
    if (this.context && this.context.viewport)
      this.context.viewport(x, y, width, height);
  }

  public setSize(sizeOrWidth: Vec2 | number, height?: number): void {
    const w = sizeOrWidth instanceof Vec2 ? sizeOrWidth.x : sizeOrWidth;
    const h = sizeOrWidth instanceof Vec2 ? sizeOrWidth.y : (height ?? 0);
    if (this.context && this.context.canvas) {
      const canvas = this.context.canvas as HTMLCanvasElement;
      canvas.width = w;
      canvas.height = h;
    }
    this.setViewport(0, 0, w, h);
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

  public setAmbientColor(rOrVec: Vec3Like | number, g?: number, b?: number): this {
    if (typeof rOrVec === 'number')
      this.ambientColor.setScalar(rOrVec, g ?? 0, b ?? 0);
    else
      assignVec3(this.ambientColor, rOrVec);
    return this;
  }

  public setFog(color: Vec3Like, near: number, far?: number): this;
  public setFog(r: number, g: number, b: number, near?: number, far?: number): this;
  public setFog(color: Vec3Like | number, nearOrG: number, farOrB?: number, near?: number, far?: number): this {
    if (typeof color === 'number')
      this.fog = {
        color: new Vec3(color, nearOrG, farOrB ?? 0),
        near: near ?? 1,
        far: far ?? 1000
      };
    else
      this.fog = {
        color: assignVec3(new Vec3(), color),
        near: nearOrG,
        far: farOrB ?? 1000
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
    const hits: { mesh: Mesh; distance: number; point: Vec3 }[] = [];
    const visit = (mesh: Mesh): void => {
      if (!mesh.isActive()) return;
      const hit = mesh.raycast(ray, precise);
      if (hit)
        hits.push({ mesh, distance: hit.distance, point: hit.point });
      for (const child of mesh.children)
        visit(child);
    };
    for (const mesh of this.meshes)
      if (mesh.traversalStamp !== this.traversalStamp)
        visit(mesh);
    hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }

  public render (camera: Camera, time: number = Time.now()): number {
    this.computeWorldMatrices();
    const flatLights = this.lights.flatten(this.ambientColor);

    const frustum = this.enableFrustumCulling
      ? this.scratchFrustum.setFromProjectionViewMatrix(camera.getProjectionViewMatrix())
      : null;

    this.collect(camera, frustum, true, true, this.traversalStamp);

    const frame = this.beginFrame();
    this.disableBlendMode();

    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    let renderedCount = 0;
    for (const mesh of this.opaqueList) {
      this.renderer.setDepthWrite(mesh.depthWrite);
      mesh.renderSelf(projMatrix, viewMatrix, flatLights, time, false, camPos, this.fog, frame);
      renderedCount++;
    }

    renderedCount += this.drawBlended(camera, time, flatLights, frame);
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

  // Walks every root mesh and its descendants, culling per node and splitting by blend mode.
  private collect(camera: Camera, frustum: Frustum | null, opaque: boolean, blended: boolean, stamp: number): void {
    this.opaqueList.length = 0;
    this.blendedList.length = 0;
    const visit = (mesh: Mesh): void => {
      if (!mesh.isActive()) return;
      const wanted = mesh.blendMode ? blended : opaque;
      if (wanted && !(frustum && !frustum.intersectsSphere(mesh.computeBoundingSphere()))) {
        if (mesh.blendMode) {
          mesh.sortKey = mesh.getWorldPosition(this.scratchVec).getDistance(camera.position, true);
          this.blendedList.push(mesh);
        } else
          this.opaqueList.push(mesh);
      }
      for (const child of mesh.children)
        visit(child);
    };
    for (const mesh of this.meshes)
      if (mesh.traversalStamp !== stamp)
        visit(mesh);
  }

  // Blended meshes are drawn farthest first with additive blending.
  private drawBlended(camera: Camera, time: number, flatLights: IFlatLights, frame: IFrameInfo): number {
    const list = this.blendedList;
    if (list.length === 0)
      return 0;
    if (list.length > 1)
      list.sort((a, b) => b.sortKey - a.sortKey);

    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    for (const mesh of list) {
      const blend = mesh.blendOptions;
      this.enableBlendMode(blend.equation, blend.source, blend.destination);
      this.renderer.setDepthWrite(mesh.depthWrite);
      mesh.renderSelf(projMatrix, viewMatrix, flatLights, time, true, camPos, this.fog, frame);
    }

    this.disableBlendMode();
    this.renderer.setDepthWrite(true);
    return list.length;
  }

  public renderBlended (
    camera: Camera,
    time: number = Time.now(),
    flatLights: IFlatLights = this.lights.flatten(this.ambientColor),
    frustum: Frustum | null = null
  ): number {
    this.collect(camera, frustum, false, true, this.markDescendants());
    return this.drawBlended(camera, time, flatLights, this.beginFrame());
  }

}
