import { Mat4x3, Mat3, Vec3, Quat } from '@1pizzateam/spock';
import type { SceneGraph } from './scene/sceneGraph';
import { Program } from './program';
import { Texture, type TextureSource, type ITextureOptions } from './texture';
import { Uniform, uploadUniform, type UniformValue } from './uniform';
import { assignVec3, type Vec3Like } from './vector';
import { MeshRenderer }  from './renderer/mesh';
import { SubMesh }  from './geometry/submesh';
import { Material }  from './material';
import type { IProgram, ICustomUniforms, IFlatLights, IMesh, IFrameInfo, IBlendOptions } from './interfaces';
import { Box as BoundingBox, Sphere as BoundingSphere, Ray3 as Ray } from '@1pizzateam/spock';
import { BasicShader, PhongShader, NormalShader } from './shaders/standard';

export enum eDrawMethod { drawElements = 'drawElements', drawArrays = 'drawArrays' };

export class Mesh implements IMesh {

  boundingBox: BoundingBox;
  boundingSphere: BoundingSphere;

  vertices    : number[] | Float32Array | null;
  indices     : number[] | Int32Array | Uint16Array | null;
  normals     : number[] | Float32Array | null;
  uvs         : number[] | Float32Array | null;
  itemSize    : number | null;
  subMeshes   : SubMesh[];
  nbSubMeshes : number;

  primitive   : string | null;
  
  customUniforms : ICustomUniforms;

  context : WebGLRenderingContext;

  renderer : MeshRenderer;

  WebGLTexture : WebGLTexture | null;

  vertexBuffer   : WebGLBuffer | null;
  indexBuffer    : WebGLBuffer | null;
  normalBuffer   : WebGLBuffer | null;
  texCoordBuffer : WebGLBuffer | null;

  position       : Vec3;
  scale          : Vec3;
  quaternion     : Quat;
  modelMatrix    : Mat4x3;
  worldMatrix    : Mat4x3;
  normalMatrix   : Mat3;
  parent         : Mesh | null = null;
  // Scratch values owned by Scene: root detection and transparent sorting.
  public traversalStamp : number = 0;
  public sortKey : number = 0;
  // The quaternion is the single source of truth; Euler angles are derived on demand.
  private _rotation : Vec3;
  private isRotationStale : boolean;
  private isTransformDirty : boolean;
  private isWorldDirty : boolean = true;
  private ownsTexture : boolean = false;
  private textureSource : TextureSource | null = null;
  private textureOptions : ITextureOptions | undefined;
  private indexType : number;

  private static readonly UP = new Vec3(0, 1, 0);
  private static readonly scratchQuat = new Quat();
  private static readonly scratchView = new Mat4x3();
  private static readonly scratchVec = new Vec3();
  private static readonly scratchCamera = new Vec3();
  private static readonly scratchDir = new Vec3();
  private static readonly scratchA = new Vec3();
  private static readonly scratchB = new Vec3();
  private static readonly scratchC = new Vec3();
  private static readonly scratchHit = new Vec3();
  private static readonly scratchWorldHit = new Vec3();
  private static readonly scratchInverse = new Mat4x3();
  private static readonly scratchRay = new Ray();
  public isBoundsDirty : boolean = true;
  public isNormalMatrixDirty : boolean = true;
  public localBoundingBox : BoundingBox;
  public localBoundingSphere : BoundingSphere;

  active : boolean;

  drawMethod : eDrawMethod;

  programs : IProgram[];
  nbPrograms : number;

  materials : Material[];

  children : Mesh[];

  blendMode : boolean;
  blendOptions : IBlendOptions = { equation: 'FUNC_ADD', source: 'SRC_ALPHA', destination: 'ONE' };
  depthWrite : boolean = true;

  zOrder : number;


  constructor(meshOrContext: IMesh | WebGLRenderingContext, contextOrMesh: WebGLRenderingContext | IMesh) {
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

    this.position       = new Vec3();
    this._rotation      = new Vec3();
    this.scale          = new Vec3(1.0, 1.0, 1.0);
    this.quaternion     = new Quat();
    this.modelMatrix    = new Mat4x3();
    this.worldMatrix    = new Mat4x3();
    this.normalMatrix   = new Mat3();
    this.isRotationStale = false;
    this.isTransformDirty = false;

    this.modelMatrix.identity();
    this.worldMatrix.identity();
    this.normalMatrix.identity();

    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
    this.localBoundingBox = new BoundingBox();
    this.localBoundingSphere = new BoundingSphere();
    this.boundingBox = new BoundingBox();
    this.boundingSphere = new BoundingSphere();

    if (this.vertices && this.vertices.length > 0) {
      this.localBoundingBox.setFromPoints(this.vertices, this.itemSize || 3);
      this.localBoundingSphere.setFromPoints(this.vertices, undefined, this.itemSize || 3);
    }

    this.active = true;

    this.drawMethod = this.indices ? eDrawMethod.drawElements : eDrawMethod.drawArrays;

    this.programs = [];
    this.nbPrograms = 0;

    this.materials = [];

    this.children = [];

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

  public addChild(mesh: Mesh): void {
    if (this.children.indexOf(mesh) === -1) {
      if (mesh.parent && mesh.parent !== this)
        mesh.parent.removeChild(mesh);
      this.children.push(mesh);
      mesh.parent = this;
      mesh.isWorldDirty = true;
    }
  }

  public removeChild(mesh: Mesh): boolean {
    const index = this.children.indexOf(mesh);
    if (index !== -1) {
      this.children.splice(index, 1);
      mesh.parent = null;
      mesh.isWorldDirty = true;
      return true;
    }
    return false;
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
    for (let program of this.programs)
      Program.release(this.context, program);
    this.programs = [];
    this.nbPrograms = 0;
    this.materials = [];
  }

  public addMaterial(material:Material): boolean {

    if(material && this.materials.length < this.nbSubMeshes){
      this.materials.push(material);
      let materialUniforms = material.uniforms;
      for(let property in materialUniforms)
        if (materialUniforms.hasOwnProperty(property))
          for (let program of this.programs)
            if (program[property] === undefined)
              program[property] = this.context.getUniformLocation(program, 'u' + this.ucfirst(property));
      return true;
    }
    return false;
  }

  public markDirty(): void {
    this.isTransformDirty = true;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
  }

  // Euler angles (radians) derived from the quaternion.
  public get rotation(): Vec3 {
    if (this.isRotationStale) {
      this.quaternion.getEuler(this._rotation);
      this.isRotationStale = false;
    }
    return this._rotation;
  }

  public set rotation(euler: Vec3) {
    this.setRotation(euler);
  }

  private rotationChanged(): void {
    this.isRotationStale = true;
    this.markDirty();
  }

  public setPosition(xOrVec: Vec3Like | number, y?: number, z?: number): this {
    assignVec3(this.position, xOrVec, y, z);
    this.markDirty();
    return this;
  }

  public setRotation(xOrVec: Vec3Like | number, y?: number, z?: number): this {
    assignVec3(this._rotation, xOrVec, y, z);
    this.quaternion.setFromEuler(this._rotation);
    this.isRotationStale = false;
    this.markDirty();
    return this;
  }

  public setScale(xOrVec: Vec3Like | number, y?: number, z?: number): this {
    if (typeof xOrVec === 'number' && y === undefined && z === undefined)
      this.scale.setScalar(xOrVec, xOrVec, xOrVec);
    else
      assignVec3(this.scale, xOrVec, y, z);
    this.markDirty();
    return this;
  }

  public scaleBy(factorOrVec: Vec3 | number): this {
    if (factorOrVec instanceof Vec3)
      this.scale.multiply(factorOrVec);
    else
      this.scale.scale(factorOrVec);
    this.markDirty();
    return this;
  }

  public setQuaternion(q: Quat): this {
    this.quaternion.copy(q);
    this.rotationChanged();
    return this;
  }

  public slerp(targetQuat: Quat, t: number): this {
    this.quaternion.slerp(targetQuat, t);
    this.rotationChanged();
    return this;
  }

  public rotateX(angle: number): this {
    this.quaternion.rotateX(angle);
    this.rotationChanged();
    return this;
  }

  public rotateY(angle: number): this {
    this.quaternion.rotateY(angle);
    this.rotationChanged();
    return this;
  }

  public rotateZ(angle: number): this {
    this.quaternion.rotateZ(angle);
    this.rotationChanged();
    return this;
  }

  public rotateOnAxis(axis: Vec3, angle: number): this {
    this.quaternion.multiply(Mesh.scratchQuat.setAxisAngle(axis, angle));
    this.rotationChanged();
    return this;
  }

  public translate(xOrVec: Vec3Like | number, y?: number, z?: number): this {
    if (typeof xOrVec === 'number')
      this.position.add(Mesh.scratchVec.setScalar(xOrVec, y ?? 0, z ?? 0));
    else
      this.position.add(xOrVec instanceof Vec3 ? xOrVec : Mesh.scratchVec.setArray(xOrVec));
    this.markDirty();
    return this;
  }

  // Orients the mesh so its -Z axis faces target.
  public lookAt(target: Vec3, up: Vec3 = Mesh.UP): this {
    if (this.position.equals(target)) return this;
    this.quaternion.lookAt(this.position, target, up);
    this.rotationChanged();
    return this;
  }

  // Rebuilds the local matrix from position, quaternion and scale. Returns true if it changed.
  public updateModelMatrix(): boolean {
    if (!this.isTransformDirty) return false;
    this.modelMatrix.compose(this.position, this.quaternion, this.scale);
    this.isTransformDirty = false;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
    return true;
  }

  public computeNormalMatrix(): Mat3 {
    if (!this.isNormalMatrixDirty) return this.normalMatrix;
    this.worldMatrix.toNormalMatrix(this.normalMatrix.toArray());
    this.isNormalMatrixDirty = false;
    return this.normalMatrix;
  }

  public getWorldPosition(target: Vec3 = new Vec3()): Vec3 {
    return this.worldMatrix.getTranslation(target);
  }

  public getWorldDirection(target: Vec3 = new Vec3()): Vec3 {
    return this.worldMatrix.getColumn(2, target).opposite().normalize();
  }

  public distanceTo(target: Mesh | Vec3): number {
    const targetPos = target instanceof Vec3 ? target : target.getWorldPosition();
    return this.getWorldPosition(Mesh.scratchVec).getDistance(targetPos);
  }

  public isInsideBounds(min: Vec3, max: Vec3): boolean {
    return this.getWorldPosition(Mesh.scratchVec).isInBounds(min, max);
  }

  // Sets the local-space bounds used for culling and picking, for geometry whose vertices change after
  // construction (the constructor measures the arrays it was given, so a buffer that starts empty has no size).
  public setLocalBounds(min: Vec3, max: Vec3): this {
    this.localBoundingBox.set(min, max);
    this.localBoundingBox.getCenter(Mesh.scratchVec);
    this.localBoundingSphere.set(Mesh.scratchVec, min.getDistance(max) / 2);
    this.isBoundsDirty = true;
    return this;
  }

  public computeBounds(): void {
    if (!this.isBoundsDirty) return;
    if (this.vertices && this.vertices.length > 0) {
      this.boundingBox.copy(this.localBoundingBox).applyMatrix4(this.worldMatrix);
      this.boundingSphere.copy(this.localBoundingSphere).applyMatrix4(this.worldMatrix);
    } else {
      const pos = this.getWorldPosition(Mesh.scratchVec);
      this.boundingBox.set(pos, pos);
      this.boundingSphere.set(pos, 0);
    }
    this.isBoundsDirty = false;
  }

  public computeBoundingBox(): BoundingBox {
    this.computeBounds();
    return this.boundingBox;
  }

  public computeBoundingSphere(): BoundingSphere {
    this.computeBounds();
    return this.boundingSphere;
  }

  // Bounding sphere test by default; with `precise` the ray is also tested against the triangles
  // (TRIANGLES and TRIANGLE_STRIP meshes) in local space, so rotated and scaled meshes are handled.
  public raycast(ray: Ray, precise: boolean = false): { distance: number; point: Vec3 } | null {
    if (!this.isActive()) return null;
    const sphere = this.computeBoundingSphere();
    const hitPoint = ray.intersectSphere(sphere);
    if (!hitPoint) return null;
    if (precise && this.vertices && (this.primitive === 'TRIANGLES' || this.primitive === 'TRIANGLE_STRIP'))
      return this.raycastTriangles(ray);
    return { distance: ray.origin.getDistance(hitPoint), point: hitPoint };
  }

  private raycastTriangles(ray: Ray): { distance: number; point: Vec3 } | null {
    const inverse = Mesh.scratchInverse.copy(this.worldMatrix).invertAffine();
    const localRay = Mesh.scratchRay.set(
      inverse.transformPoint(ray.origin, Mesh.scratchVec),
      inverse.transformDirection(ray.direction, Mesh.scratchDir)
    );
    const strip = this.primitive === 'TRIANGLE_STRIP';
    let best: Vec3 | null = null;
    let bestDistance = Infinity;

    for (const subMesh of this.subMeshes) {
      const end = subMesh.start + subMesh.count;
      for (let i = subMesh.start; i + 2 < end; i += strip ? 1 : 3) {
        this.getVertex(i, Mesh.scratchA);
        // Odd strip triangles flip their winding.
        if (strip && (i - subMesh.start) % 2 === 1) {
          this.getVertex(i + 2, Mesh.scratchB);
          this.getVertex(i + 1, Mesh.scratchC);
        } else {
          this.getVertex(i + 1, Mesh.scratchB);
          this.getVertex(i + 2, Mesh.scratchC);
        }
        const local = localRay.intersectTriangle(Mesh.scratchA, Mesh.scratchB, Mesh.scratchC, false, Mesh.scratchHit);
        if (!local) continue;
        const world = this.worldMatrix.transformPoint(local, Mesh.scratchWorldHit);
        const distance = ray.origin.getDistance(world);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = (best ?? new Vec3()).copy(world);
        }
      }
    }
    return best ? { distance: bestDistance, point: best } : null;
  }

  // Reads the position of the vertex at `index` (through the index buffer when present).
  private getVertex(index: number, target: Vec3): Vec3 {
    const vertices = this.vertices as ArrayLike<number>;
    const size = this.itemSize || 3;
    const offset = (this.indices ? this.indices[index] : index) * size;
    return target.setScalar(vertices[offset], vertices[offset + 1], size > 2 ? vertices[offset + 2] : 0);
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
    if (typeof WebGLTexture !== 'undefined' && texture instanceof WebGLTexture) {
      this.releaseTexture();
      this.WebGLTexture = texture;
      this.ownsTexture = false;
    } else
      this.setTexture(<HTMLImageElement>texture);
  }

  private releaseTexture(): void {
    if (this.WebGLTexture && this.ownsTexture)
      this.context.deleteTexture(this.WebGLTexture);
    this.WebGLTexture = null;
    this.ownsTexture = false;
    this.textureSource = null;
    this.textureOptions = undefined;
  }

  // Combines the parent world matrix with the local matrix.
  public setWorldMatrix(worldMatrix: Mat4x3): void {
    this.worldMatrix.copy(worldMatrix).multiply(this.modelMatrix);
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
    this.isWorldDirty = false;
  }

  public setTexture(img: TextureSource, options?: ITextureOptions): void {
    const texture = Texture.create(img, this.context, options);
    if (!texture) return;
    this.releaseTexture();
    this.WebGLTexture = texture;
    this.ownsTexture = true;
    this.textureSource = img;
    this.textureOptions = options;
    for (const program of this.programs)
      if (program.sampler === undefined)
        program.sampler = this.context.getUniformLocation(program, 'uSampler');
  }

  public addCustomUniform(name:string, type:string, value:UniformValue): void {
    if (!this.customUniforms.hasOwnProperty(name)){
      this.customUniforms[name] = new Uniform(type, value);
      for (const program of this.programs)
        if (program[name] === undefined)
          program[name] = this.context.getUniformLocation(program, 'u' + this.ucfirst(name));
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
    this.vertexBuffer   = this.vertices 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          this.vertices instanceof Float32Array ? this.vertices : new Float32Array(this.vertices), 
                                                          'STATIC_DRAW'
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
                                                         'STATIC_DRAW'
                                                        )
                            : null;
    this.texCoordBuffer = this.uvs 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          this.uvs instanceof Float32Array ? this.uvs : new Float32Array(this.uvs), 
                                                          'STATIC_DRAW'
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

  private static initializedPrograms = new WeakSet<object>();

  private createProgram(): void {
    let program = this.programs[this.nbPrograms];

    // Locations belong to the program, so a program shared between meshes is queried once.
    if (!Mesh.initializedPrograms.has(program)) {
      Mesh.initializedPrograms.add(program);

      this.addProgramAttribute('vertexPosition');
      this.addProgramAttribute('vertexNormal');
      this.addProgramAttribute('textureCoord');
      // matrix uniforms
      this.addProgramUniform('modelMatrix');
      this.addProgramUniform('normalMatrix');
      this.addProgramUniform('viewMatrix');
      this.addProgramUniform('projectionMatrix');
      // default uniforms
      this.addProgramUniform('time');
      this.addProgramUniform('screenResolution');

      // texture
      this.addProgramUniform('sampler');
      this.addProgramUniform('hasTexture');

      // lights
      this.addProgramUniform('nbLights');
      this.addProgramUniform('lightPosition');
      this.addProgramUniform('lightDiffuse');
      this.addProgramUniform('lightSpecular');
      this.addProgramUniform('lightDirection');
      this.addProgramUniform('lightAttenuation');
      this.addProgramUniform('lightCutoff');
      this.addProgramUniform('lightExponent');
      this.addProgramUniform('lightType');
      this.addProgramUniform('lightPositionType');
      this.addProgramUniform('lightDiffuseCutoff');
      this.addProgramUniform('lightSpecularExponent');
      this.addProgramUniform('ambientLight');
      this.addProgramUniform('ambientColor');
      this.addProgramUniform('cameraPosition');

      // fog
      this.addProgramUniform('hasFog');
      this.addProgramUniform('fogColor');
      this.addProgramUniform('fogNear');
      this.addProgramUniform('fogFar');

      // Fallback resolution; Scene.render uploads the current one every frame.
      if (program.screenResolution) {
        this.renderer.useProgram(program);
        let viewport = this.context.getParameter(this.context.VIEWPORT);
        if (viewport && viewport.length >= 4)
          this.context.uniform2f(program.screenResolution, viewport[2], viewport[3]);
      }
    }

    // custom customUniforms
    for (let property in this.customUniforms)
      if (this.customUniforms.hasOwnProperty(property) && program[property] === undefined)
        this.addProgramUniform(property);

    // material uniforms
    for (let mat of this.materials)
      for (let property in mat.uniforms)
        if (mat.uniforms.hasOwnProperty(property) && program[property] === undefined)
          this.addProgramUniform(property);

    this.nbPrograms ++;

  }

  private addProgramAttribute(name:string): void {
    this.programs[this.nbPrograms][name] = this.context.getAttribLocation(this.programs[this.nbPrograms], 
                                                                           'a' + this.ucfirst(name)
                                                                          );
  }

  private addProgramUniform(name:string): void {
    const ucName = 'u' + this.ucfirst(name);
    let loc = this.context.getUniformLocation(this.programs[this.nbPrograms], ucName);
    if (loc === null)
      loc = this.context.getUniformLocation(this.programs[this.nbPrograms], ucName + '[0]');
    this.programs[this.nbPrograms][name] = loc;
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

  // Recomputes world matrices below this mesh; only changed branches are recomputed.
  public computeWorldMatrix(graph:SceneGraph): void {
    const modelChanged = this.updateModelMatrix();
    const changed = this.isWorldDirty || modelChanged;
    if (changed)
      this.setWorldMatrix(graph.getWorldMatrix());
    graph.pushModelMatrix(this.worldMatrix);

    for ( let child of this.children ) {
      if (changed)
        child.isWorldDirty = true;
      child.computeWorldMatrix(graph);
    }

    graph.popModelMatrix();
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

    for (let child of this.children)
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

    const context = this.context;
    const renderer = this.renderer;
    const state = renderer.state;

    for (let i = 0 ; i < this.nbSubMeshes ; i++) {
      const program = this.programs[i] || this.programs[this.nbPrograms - 1];
      renderer.useProgram(program);

      if (!frame || state.frameOfProgram.get(program) !== frame.id) {
        if (frame)
          state.frameOfProgram.set(program, frame.id);
        this.uploadFrameUniforms(program, projectionMatrix, viewMatrix, lights, time, cameraPosition, fog, frame);
      }

      // materials
      const material = this.materials[i] || this.materials[this.materials.length - 1];
      if (material) {
        material.updateUniforms();
        if (state.materialOfProgram.get(program) !== material || state.materialVersionOfProgram.get(program) !== material.version) {
          state.materialOfProgram.set(program, material);
          state.materialVersionOfProgram.set(program, material.version);
          const materialUniforms = material.uniforms;
          for (let property in materialUniforms)
            if (materialUniforms.hasOwnProperty(property) && program[property])
              uploadUniform(context, program[property], (materialUniforms as any)[property]);
        }
      }

      // vertex attributes: enable exactly what this program and mesh use
      let attributeMask = 0;
      if (this.indices)
        renderer.bindBuffer('ELEMENT_ARRAY_BUFFER', <WebGLBuffer>this.indexBuffer);

      // positions
      if (program.vertexPosition !== -1 && program.vertexPosition !== undefined && this.vertexBuffer) {
        renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.vertexBuffer);
        renderer.vertexAttribPointer(program.vertexPosition, <number>this.itemSize, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.vertexPosition;
      }

      // normals
      if (this.normals && program.vertexNormal !== -1 && program.vertexNormal !== undefined) {
        renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.normalBuffer);
        renderer.vertexAttribPointer(program.vertexNormal, 3, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.vertexNormal;
      }

      // uvs
      if (this.uvs && program.textureCoord !== -1 && program.textureCoord !== undefined) {
        renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.texCoordBuffer );
        renderer.vertexAttribPointer(program.textureCoord, 2, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.textureCoord;
      }

      renderer.setAttributeMask(attributeMask);

      // texture
      if(this.WebGLTexture){
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, this.WebGLTexture);
        if (program.sampler)
          context.uniform1i(program.sampler, 0);
        if (program.hasTexture)
          context.uniform1i(program.hasTexture, 1);
      } else if (program.hasTexture)
        context.uniform1i(program.hasTexture, 0);

      // matrices
      if (program.modelMatrix)
        context.uniformMatrix4fv(program.modelMatrix,      false, this.worldMatrix.toArray());
      if (program.normalMatrix) {
        this.computeNormalMatrix();
        context.uniformMatrix3fv(program.normalMatrix,     false, this.normalMatrix.toArray());
      }

      // custom
      for (let property in this.customUniforms)
        if (this.customUniforms.hasOwnProperty(property) && program[property])
          uploadUniform(context, program[property], this.customUniforms[property]);

      renderer[this.drawMethod](<string>this.primitive, this.subMeshes[i], this.indexType);
    }
  }

  private static lightTypeValue(type: string | number): number {
    return type === 'directional' ? 0 : type === 'point' ? 1 : 2;
  }

  // Interleaves 3-component vectors with one extra value each into vec4s (fallback for lights without packed arrays).
  private static packVec4(xyz: ArrayLike<number | string>, w: ArrayLike<number | string>): Float32Array {
    const count = Math.floor(xyz.length / 3);
    const packed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      packed[i * 4] = <number>xyz[i * 3];
      packed[i * 4 + 1] = <number>xyz[i * 3 + 1];
      packed[i * 4 + 2] = <number>xyz[i * 3 + 2];
      packed[i * 4 + 3] = <number>w[i] || 0;
    }
    return packed;
  }

  private uploadFrameUniforms( program: IProgram,
                               projectionMatrix: Float32Array,
                               viewMatrix: Float32Array,
                               lights: IFlatLights,
                               time: number,
                               cameraPosition?: Vec3,
                               fog?: { color: Vec3; near: number; far: number } | null,
                               frame?: IFrameInfo
                             ): void {
    const context = this.context;

    if (program.projectionMatrix)
      context.uniformMatrix4fv(program.projectionMatrix, false, projectionMatrix);
    if (program.viewMatrix)
      context.uniformMatrix4fv(program.viewMatrix,       false, viewMatrix);
    if (program.time)
      context.uniform1f(program.time, time);
    if (frame && frame.resolution && program.screenResolution)
      context.uniform2f(program.screenResolution, frame.resolution.x, frame.resolution.y);

    // lights
    if (lights) {
      if (program.nbLights && lights.type)
        context.uniform1i(program.nbLights, lights.type.length);
      if (program.lightPosition && lights.position && lights.position.length > 0)
        context.uniform3fv(program.lightPosition, lights.floatPosition || new Float32Array(<number[]>lights.position));
      if (program.lightDiffuse && lights.diffuse && lights.diffuse.length > 0)
        context.uniform3fv(program.lightDiffuse, lights.floatDiffuse || new Float32Array(<number[]>lights.diffuse));
      if (program.lightSpecular && lights.specular && lights.specular.length > 0)
        context.uniform3fv(program.lightSpecular, lights.floatSpecular || new Float32Array(<number[]>lights.specular));
      if (program.lightDirection && lights.direction && lights.direction.length > 0)
        context.uniform3fv(program.lightDirection, lights.floatDirection || new Float32Array(<number[]>lights.direction));
      if (program.lightAttenuation && (lights.floatAttenuation || lights.constantAttenuation?.length)) {
        let attArr = lights.floatAttenuation;
        if (!attArr) {
          const att: number[] = [];
          for (let k = 0; k < lights.constantAttenuation.length; k++)
            att.push(
              <number>lights.constantAttenuation[k] || 0,
              <number>lights.linearAttenuation[k] || 0,
              <number>lights.quadraticAttenuation[k] || 0
            );
          attArr = new Float32Array(att);
        }
        context.uniform3fv(program.lightAttenuation, attArr);
      }
      if (program.lightCutoff && lights.cutoff && lights.cutoff.length > 0)
        context.uniform1fv(program.lightCutoff, lights.floatCutoff || new Float32Array(<number[]>lights.cutoff));
      if (program.lightExponent && lights.exponent && lights.exponent.length > 0)
        context.uniform1fv(program.lightExponent, lights.floatExponent || new Float32Array(<number[]>lights.exponent));
      if (program.lightType && (lights.floatType || lights.type?.length)) {
        let typeArr = lights.floatType;
        if (!typeArr)
          typeArr = new Float32Array(lights.type.map(t => t === 'directional' ? 0 : t === 'point' ? 1 : 2));
        context.uniform1fv(program.lightType, typeArr);
      }
      if (program.lightPositionType && lights.position && lights.position.length > 0)
        context.uniform4fv(program.lightPositionType, lights.packedPosition || Mesh.packVec4(lights.position, (lights.type || []).map(Mesh.lightTypeValue)));
      if (program.lightDiffuseCutoff && lights.diffuse && lights.diffuse.length > 0)
        context.uniform4fv(program.lightDiffuseCutoff, lights.packedDiffuse || Mesh.packVec4(lights.diffuse, lights.cutoff || []));
      if (program.lightSpecularExponent && lights.specular && lights.specular.length > 0)
        context.uniform4fv(program.lightSpecularExponent, lights.packedSpecular || Mesh.packVec4(lights.specular, lights.exponent || []));
      if (program.ambientLight && lights.ambient)
        context.uniform3fv(program.ambientLight, lights.floatAmbient || new Float32Array(lights.ambient));
    }

    // camera position
    if (program.cameraPosition) {
      let camera = cameraPosition;
      if (!camera && viewMatrix) {
        // The camera position is the translation of the inverted view matrix.
        Mesh.scratchView.toArray().set(viewMatrix);
        camera = Mesh.scratchView.invertAffine().getTranslation(Mesh.scratchCamera);
      }
      if (camera)
        context.uniform3f(program.cameraPosition, camera.x, camera.y, camera.z);
    }

    // fog
    if (program.hasFog)
      if (fog) {
        context.uniform1i(program.hasFog, 1);
        if (program.fogColor)
          context.uniform3f(program.fogColor, fog.color.x, fog.color.y, fog.color.z);
        if (program.fogNear)
          context.uniform1f(program.fogNear, fog.near);
        if (program.fogFar)
          context.uniform1f(program.fogFar, fog.far);
      } else
        context.uniform1i(program.hasFog, 0);
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
    for (let child of this.children) {
      child.parent = null;
      child.destroy();
    }
    this.children = [];
  }

  private ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}

export interface IMaterialShortcutOptions {
  color?: Vec3Like;
  texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture;
}

export interface IPhongShortcutOptions {
  ambient?: Vec3Like;
  diffuse?: Vec3Like;
  specular?: Vec3Like;
  shininess?: number;
  texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture;
}
