import { Vec3, Ray3 as Ray } from '@1pizzateam/spock';
import { Node } from './node';
import { raycastTriangles } from './meshRaycast';
import { Program } from '../program';
import { Texture, type TextureSource, type ITextureOptions } from '../texture';
import { Uniform, type UniformValue } from '../uniform';
import { MeshRenderer }  from '../renderer/mesh';
import { SubMesh }  from '../geometry/submesh';
import { Material }  from '../material';
import type { IProgram, ICustomUniforms, IFlatLights, IMesh, IFrameInfo, IBlendOptions } from '../interfaces';
import { BasicShader } from '../shaders/basic';
import { PhongShader } from '../shaders/phong';
import { NormalShader } from '../shaders/normal';
import { initProgramLocations, syncMaterialUniforms, syncCustomUniform, syncTextureSampler } from './meshProgram';

export enum eDrawMethod { drawElements = 'drawElements', drawArrays = 'drawArrays' };

export class Mesh extends Node<Mesh> implements IMesh {

  vertices    : number[] | Float32Array | null;
  indices     : number[] | Int32Array | Uint16Array | null;
  normals     : number[] | Float32Array | null;
  uvs         : number[] | Float32Array | null;
  itemSize    : number | null;
  subMeshes   : SubMesh[];
  nbSubMeshes : number;

  primitive   : string | null;
  bufferUsage : 'STATIC_DRAW' | 'DYNAMIC_DRAW';
  
  customUniforms : ICustomUniforms;

  context : WebGLRenderingContext;

  renderer : MeshRenderer;

  WebGLTexture : WebGLTexture | null;

  vertexBuffer   : WebGLBuffer | null;
  indexBuffer    : WebGLBuffer | null;
  normalBuffer   : WebGLBuffer | null;
  texCoordBuffer : WebGLBuffer | null;

  // Scratch values owned by Scene: transparent sorting.
  public sortKey : number = 0;

  private ownsTexture : boolean = false;
  private textureSource : TextureSource | null = null;
  private textureOptions : ITextureOptions | undefined;
  public indexType : number;

  private static readonly scratchHit = new Vec3();

  active : boolean;

  drawMethod : eDrawMethod;

  programs : IProgram[];
  nbPrograms : number;

  materials : Material[];

  blendMode : boolean;
  blendOptions : IBlendOptions = { equation: 'FUNC_ADD', source: 'SRC_ALPHA', destination: 'ONE' };
  depthWrite : boolean = true;

  zOrder : number;

  constructor(meshOrContext: IMesh | WebGLRenderingContext, contextOrMesh: WebGLRenderingContext | IMesh) {
    super();

    let mesh: IMesh;
    let context: WebGLRenderingContext;
    if (meshOrContext && ('drawingBufferWidth' in (meshOrContext as any) || typeof (meshOrContext as any).createBuffer === 'function')) {
      context = meshOrContext as WebGLRenderingContext;
      mesh = contextOrMesh as IMesh;
    } else {
      mesh = meshOrContext as IMesh;
      context = contextOrMesh as WebGLRenderingContext;
    }

    this.vertices    = mesh && mesh.vertices ? mesh.vertices : null;
    this.indices     = mesh && mesh.indices ? mesh.indices : null;
    this.normals     = mesh && mesh.normals ? mesh.normals : null;
    this.uvs         = mesh && mesh.uvs ? mesh.uvs : null;
    this.itemSize    = mesh && mesh.itemSize ? mesh.itemSize : null;
    this.subMeshes   = mesh && mesh.subMeshes ? mesh.subMeshes : [];
    if (this.subMeshes.length === 0 && this.vertices && this.vertices.length > 0)
      this.subMeshes = [ new SubMesh(0, this.indices ? this.indices.length : this.vertices.length / (this.itemSize || 3)) ];
    this.nbSubMeshes = this.subMeshes.length;

    this.primitive   = mesh && mesh.primitive ? mesh.primitive : null;
    this.bufferUsage = mesh && mesh.bufferUsage ? mesh.bufferUsage : 'STATIC_DRAW';

    this.customUniforms = {};

    this.context = context;

    this.renderer = new MeshRenderer(this.context);

    this.WebGLTexture = null;

    this.vertexBuffer   = null;
    this.indexBuffer    = null;
    this.normalBuffer   = null;
    this.texCoordBuffer = null;
    this.indexType = this.context.UNSIGNED_SHORT;
    this.createBuffers();

    if (this.vertices && this.vertices.length > 0) {
      this.localBoundingBox.setFromPoints(this.vertices, this.itemSize || 3);
      this.localBoundingSphere.setFromPoints(this.vertices, undefined, this.itemSize || 3);
    }

    this.active = true;

    this.drawMethod = this.indices ? eDrawMethod.drawElements : eDrawMethod.drawArrays;

    this.programs = [];
    this.nbPrograms = 0;

    this.materials = [];

    this.blendMode = false;

    this.zOrder = 0;
  }

  public setActive(): void {
    this.active = true;
  }

  public setInactive(): void {
    this.active = false;
  }

  public toggleActive(): boolean {
    this.active = !this.active;
    return this.active;
  }

  public isActive(): boolean{
    return this.active;
  }

  public addProgram(vertexShaderOrProgram: string | WebGLProgram, fragmentShaderOrMaterial?: string | Material, material?: Material): boolean {
    if(this.nbPrograms < this.nbSubMeshes) {
      let program: IProgram | null;
      let mat: Material;

      if (typeof vertexShaderOrProgram !== 'string') {
        program = vertexShaderOrProgram as IProgram;
        mat = (fragmentShaderOrMaterial instanceof Material) ? fragmentShaderOrMaterial : new Material();
      } else {
        program = Program.acquire( this.context, vertexShaderOrProgram, fragmentShaderOrMaterial as string ) as IProgram | null;
        mat = (material instanceof Material) ? material : (fragmentShaderOrMaterial instanceof Material ? fragmentShaderOrMaterial : new Material());
      }

      if (!program) return false;

      this.programs.push(program);

      this.addMaterial(mat);

      this.createProgram();
      return true;
    }
    return false;
  }

  public clearPrograms(): void {
    for (const program of this.programs)
      Program.release(this.context, program);
    this.programs = [];
    this.nbPrograms = 0;
    this.materials = [];
  }

  public addMaterial(material:Material): boolean {
    if(material && this.materials.length < this.nbSubMeshes){
      this.materials.push(material);
      syncMaterialUniforms(this.context, this.programs, material);
      return true;
    }
    return false;
  }

  // Bounding sphere test by default; with `precise` the ray is also tested against the triangles
  // (TRIANGLES and TRIANGLE_STRIP meshes) in local space, so rotated and scaled meshes are handled.
  public raycast(ray: Ray, precise: boolean = false): { distance: number; point: Vec3 } | null {
    if (!this.isActive()) return null;
    const sphere = this.computeBoundingSphere();
    const hitPoint = ray.intersectSphere(sphere, Mesh.scratchHit);
    if (!hitPoint) return null;
    if (precise && this.vertices && (this.primitive === 'TRIANGLES' || this.primitive === 'TRIANGLE_STRIP'))
      return raycastTriangles(this, ray);
    return { distance: ray.origin.getDistance(hitPoint), point: new Vec3().copy(hitPoint) };
  }

  public useBasicMaterial(options?: IMaterialShortcutOptions): this {
    const mat = new Material();
    if (options?.color)
      mat.setDiffuse(options.color);
    this.addProgram(BasicShader.vertex, BasicShader.fragment, mat);
    this.applyTextureOption(options?.texture);
    return this;
  }

  public usePhongMaterial(options?: IPhongShortcutOptions): this {
    const mat = new Material();
    if (options?.ambient) mat.setAmbient(options.ambient);
    if (options?.diffuse) mat.setDiffuse(options.diffuse);
    if (options?.specular) mat.setSpecular(options.specular);
    if (options?.shininess !== undefined) mat.setShininess(options.shininess);
    this.addProgram(PhongShader.vertex, PhongShader.fragment, mat);
    this.applyTextureOption(options?.texture);
    return this;
  }

  public useNormalMaterial(): this {
    this.addProgram(NormalShader.vertex, NormalShader.fragment, new Material());
    return this;
  }

  private applyTextureOption(texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture): void {
    if (!texture) return;
    if (typeof WebGLTexture !== 'undefined' && texture instanceof WebGLTexture)
      this.setSharedTexture(texture);
    else
      this.setTexture(<HTMLImageElement>texture);
  }

  private releaseTexture(): void {
    if (this.WebGLTexture) {
      if (this.renderer.state.texture2D === this.WebGLTexture)
        this.renderer.state.texture2D = null;
      if (this.ownsTexture)
        this.context.deleteTexture(this.WebGLTexture);
    }
    this.WebGLTexture = null;
    this.ownsTexture = false;
    this.textureSource = null;
    this.textureOptions = undefined;
  }

  public setTexture(img: TextureSource, options?: ITextureOptions): void {
    const texture = Texture.create(img, this.context, options);
    if (!texture) return;
    this.releaseTexture();
    this.WebGLTexture = texture;
    this.ownsTexture = true;
    this.textureSource = img;
    this.textureOptions = options;
    syncTextureSampler(this.context, this.programs);
  }

  public setSharedTexture(texture: WebGLTexture | null): void {
    if (this.WebGLTexture === texture && !this.ownsTexture) return;
    this.releaseTexture();
    this.WebGLTexture = texture;
    this.ownsTexture = false;
    if (texture)
      syncTextureSampler(this.context, this.programs);
  }

  public addCustomUniform(name:string, type:string, value:UniformValue): void {
    if (!this.customUniforms.hasOwnProperty(name)){
      this.customUniforms[name] = new Uniform(type, value);
      syncCustomUniform(this.context, this.programs, name);
    }
  }

  public setCustomUniform(name: string, value: UniformValue): void {
    if (this.customUniforms.hasOwnProperty(name))
      this.customUniforms[name].value = value;
  }

  // Uses 16-bit indices when possible; 32-bit needs OES_element_index_uint.
  private createIndexData(indices: number[] | Int32Array | Uint16Array): Uint16Array | Uint32Array {
    let max = 0;
    for (let i = 0; i < indices.length; i++)
      if (indices[i] > max)
        max = indices[i];
    if (max > 65535) {
      if (this.context.getExtension && this.context.getExtension('OES_element_index_uint')) {
        this.indexType = this.context.UNSIGNED_INT;
        return new Uint32Array(indices);
      }
      console.warn('Mesh: indices exceed 65535 but OES_element_index_uint is unavailable; geometry will be corrupted.');
    }
    return indices instanceof Uint16Array ? indices : new Uint16Array(indices);
  }

  private createBuffers(): void {
    const usage = this.bufferUsage || 'STATIC_DRAW';
    this.vertexBuffer   = this.vertices 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          this.vertices instanceof Float32Array ? this.vertices : new Float32Array(this.vertices), 
                                                          usage
                                                        ) 
                            : null;
    this.indexType = this.context.UNSIGNED_SHORT;
    this.indexBuffer    = this.indices 
                            ? this.renderer.createBuffer( 'ELEMENT_ARRAY_BUFFER', 
                                                          this.createIndexData(this.indices), 
                                                          'STATIC_DRAW'
                                                        ) 
                            : null;
    this.normalBuffer   = this.normals 
                            ? this.renderer.createBuffer('ARRAY_BUFFER', 
                                                         this.normals instanceof Float32Array ? this.normals : new Float32Array(this.normals), 
                                                         usage
                                                        )
                            : null;
    this.texCoordBuffer = this.uvs 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          this.uvs instanceof Float32Array ? this.uvs : new Float32Array(this.uvs), 
                                                          usage
                                                        ) 
                            : null;
  }

  // Rebuilds buffers, programs and the texture of this mesh and its children after the context was lost
  // and restored (see Scene.restore). Buffers are filled from the arrays the mesh was built with, so data
  // changed later with bufferSubData must be uploaded again. A texture given as a WebGLTexture, and a program
  // given as a WebGLProgram, cannot be rebuilt: set them again.
  public restore(): void {
    this.createBuffers();

    const sources = this.programs.map((program) => Program.sources(program));
    this.programs = [];
    this.nbPrograms = 0;
    sources.forEach((source) => {
      if (!source)
        return;
      const program = Program.acquire(this.context, source.vertex, source.fragment) as IProgram | null;
      if (!program)
        return;
      this.programs.push(program);
      this.createProgram();
    });
    // programs that could not be rebuilt would leave a gap, so the mesh stops drawing rather than misdraw
    if (this.programs.length !== sources.length)
      this.setInactive();

    if (this.ownsTexture && this.textureSource) {
      const texture = Texture.create(this.textureSource, this.context, this.textureOptions);
      this.WebGLTexture = texture;
      this.ownsTexture = texture !== null;
    }

    for (const child of this.children)
      child.restore();
  }

  private createProgram(): void {
    initProgramLocations(this.context, this.programs[this.nbPrograms], this.customUniforms, this.materials);
    this.nbPrograms++;
  }

  public activateBlendMode(): void {
    this.blendMode = true;
  }

  public deactivateBlendMode(): void {
    this.blendMode = false;
  }

  // Activates blending with the given GL factors (default: additive). Blended meshes are drawn after
  // opaque ones, farthest first.
  public setBlend(source: string = 'SRC_ALPHA', destination: string = 'ONE', equation: string = 'FUNC_ADD'): this {
    this.blendOptions.equation = equation;
    this.blendOptions.source = source;
    this.blendOptions.destination = destination;
    this.blendMode = true;
    return this;
  }

  // Controls whether this mesh writes to the depth buffer. Typically disabled for alpha-blended meshes.
  public setDepthWrite(enabled: boolean): this {
    this.depthWrite = enabled;
    return this;
  }

  // Draws this mesh and its children.
  public render(  projectionMatrix: Float32Array,
                  viewMatrix: Float32Array,
                  lights: IFlatLights,
                  time: number,
                  blendMode: boolean,
                  cameraPosition?: Vec3,
                  fog?: { color: Vec3; near: number; far: number } | null,
                  frame?: IFrameInfo
                ): void {
    if (!this.isActive()) return;

    this.renderSelf(projectionMatrix, viewMatrix, lights, time, blendMode, cameraPosition, fog, frame);

    for (const child of this.children)
      child.render( projectionMatrix,
                    viewMatrix,
                    lights,
                    time,
                    blendMode,
                    cameraPosition,
                    fog,
                    frame
                  );
  }

  // Draws only this mesh. When frame is given, per-frame uniforms (camera, lights, fog, time)
  // are uploaded once per program for that frame instead of once per draw.
  public renderSelf(  projectionMatrix: Float32Array,
                      viewMatrix: Float32Array,
                      lights: IFlatLights,
                      time: number,
                      blendMode: boolean,
                      cameraPosition?: Vec3,
                      fog?: { color: Vec3; near: number; far: number } | null,
                      frame?: IFrameInfo
                    ): void {
    if (!this.isActive() || this.nbPrograms === 0 || this.blendMode !== blendMode) return;
    this.renderer.drawMesh(this, projectionMatrix, viewMatrix, lights, time, cameraPosition, fog, frame);
  }

  public destroy(): void {
    this.clearPrograms();
    if (this.vertexBuffer)
      this.renderer.deleteBuffer(this.vertexBuffer), this.vertexBuffer = null;
    if (this.indexBuffer)
      this.renderer.deleteBuffer(this.indexBuffer), this.indexBuffer = null;
    if (this.normalBuffer)
      this.renderer.deleteBuffer(this.normalBuffer), this.normalBuffer = null;
    if (this.texCoordBuffer)
      this.renderer.deleteBuffer(this.texCoordBuffer), this.texCoordBuffer = null;
    this.releaseTexture();
    for (const child of this.children) {
      child.parent = null;
      child.destroy();
    }
    this.children = [];
  }

}

export interface IMaterialShortcutOptions {
  color?: Vec3;
  texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture;
}

export interface IPhongShortcutOptions {
  ambient?: Vec3;
  diffuse?: Vec3;
  specular?: Vec3;
  shininess?: number;
  texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture;
}
