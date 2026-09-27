import { Mat4x3, Mat3, Vec3, Quat } from '@1pizzateam/spock';
import { SceneGraph } from './scene/sceneGraph';
import { Program } from './program';
import { Texture, TextureSource, ITextureOptions } from './texture';
import { Uniform }       from './uniform';
import { MeshRenderer }  from './renderer/mesh';
import { SubMesh }  from './geometry/submesh';
import { Material }  from './material';
import { IProgram, ICustomUniforms, IFlatLights, IMesh } from './interfaces';
import { BoundingBox, BoundingSphere, Ray } from './spatial/index';
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
  rotation       : Vec3;
  scale          : Vec3;
  quaternion     : Quat;
  modelMatrix    : Mat4x3;
  rotationMatrix : Mat4x3;
  worldMatrix    : Mat4x3;
  normalMatrix   : Mat3;
  private isLookingAt : boolean;
  private isTransformDirty : boolean;
  public isBoundsDirty : boolean;
  public isNormalMatrixDirty : boolean;
  public localBoundingBox : BoundingBox;
  public localBoundingSphere : BoundingSphere;

  active : boolean;

  drawMethod : eDrawMethod;

  programs : IProgram[];
  nbPrograms : number;

  materials : Material[];

  children : Mesh[];

  blendMode : boolean;

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
    this.nbSubMeshes = this.subMeshes.length;

    this.primitive   = mesh && mesh.primitive ? mesh.primitive : null;

    this.customUniforms = {};

    this.context = context;

    this.renderer = new MeshRenderer(this.context);

    this.WebGLTexture = null;

    this.vertexBuffer   = this.vertices 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          new Float32Array(this.vertices), 
                                                          'STATIC_DRAW'
                                                        ) 
                            : null;
    this.indexBuffer    = this.indices 
                            ? this.renderer.createBuffer( 'ELEMENT_ARRAY_BUFFER', 
                                                          new Uint16Array(this.indices), 
                                                          'STATIC_DRAW'
                                                        ) 
                            : null;
    this.normalBuffer   = this.normals 
                            ? this.renderer.createBuffer('ARRAY_BUFFER', 
                                                         new Float32Array(this.normals), 
                                                         'STATIC_DRAW'
                                                        )
                            : null;
    this.texCoordBuffer = this.uvs 
                            ? this.renderer.createBuffer( 'ARRAY_BUFFER', 
                                                          new Float32Array(this.uvs), 
                                                          'STATIC_DRAW'
                                                        ) 
                            : null;

    this.position       = new Vec3();
    this.rotation       = new Vec3();
    this.scale          = new Vec3(1.0, 1.0, 1.0);
    this.quaternion     = new Quat();
    this.modelMatrix    = new Mat4x3();
    this.rotationMatrix = new Mat4x3();
    this.worldMatrix    = new Mat4x3();
    this.normalMatrix   = new Mat3();
    this.isLookingAt    = false;
    this.isTransformDirty = false;

    this.modelMatrix.identity();
    this.rotationMatrix.identity();
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
      this.localBoundingSphere.setFromPoints(this.vertices);
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
      this.children.push(mesh);
    }
  }

  public removeChild(mesh: Mesh): boolean {
    const index = this.children.indexOf(mesh);
    if (index !== -1) {
      this.children.splice(index, 1);
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
        program = Program.create( this.context, vertexShaderOrProgram, fragmentShaderOrMaterial as string ) as IProgram | null;
        mat = (material instanceof Material) ? material : (fragmentShaderOrMaterial instanceof Material ? fragmentShaderOrMaterial : new Material());
      }

      if (!program) {
        return false;
      }

      this.programs.push(program);

      this.addMaterial(mat);

      this.createProgram();
      return true;
    }
    return false;
  }

  public clearPrograms(): void {
    for (let program of this.programs) {
      this.context.deleteProgram(program);
    }
    this.programs = [];
    this.nbPrograms = 0;
    this.materials = [];
  }

  public addMaterial(material:Material): boolean {

    if(material && this.materials.length < this.nbSubMeshes){
      this.materials.push(material);
      let materialUniforms = material.uniforms;
      for(let property in materialUniforms){
        if (materialUniforms.hasOwnProperty(property)) {
          for (let program of this.programs) {
            if (program[property] === undefined) {
              program[property] = this.context.getUniformLocation(program, 'u' + this.ucfirst(property));
            }
          }
        }
      }
      return true;
    }
    return false;
  }

  public markDirty(): void {
    this.isTransformDirty = true;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
  }

  public setPosition(xOrVec: Vec3 | number, y?: number, z?: number): this {
    if (xOrVec instanceof Vec3) {
      this.position.copy(xOrVec);
    } else {
      this.position.setScalar(xOrVec, y, z);
    }
    this.markDirty();
    return this;
  }

  public setRotation(xOrVec: Vec3 | number, y?: number, z?: number): this {
    if (xOrVec instanceof Vec3) {
      this.rotation.copy(xOrVec);
    } else {
      this.rotation.setScalar(xOrVec, y, z);
    }
    this.quaternion.setFromEuler(this.rotation);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public setScale(xOrVec: Vec3 | number, y?: number, z?: number): this {
    if (xOrVec instanceof Vec3) {
      this.scale.copy(xOrVec);
    } else if (y === undefined && z === undefined) {
      this.scale.setScalar(xOrVec, xOrVec, xOrVec);
    } else {
      this.scale.setScalar(xOrVec, y, z);
    }
    this.markDirty();
    return this;
  }

  public scaleBy(factorOrVec: Vec3 | number): this {
    if (factorOrVec instanceof Vec3) {
      this.scale.multiply(factorOrVec);
    } else {
      this.scale.scale(factorOrVec);
    }
    this.markDirty();
    return this;
  }

  public setQuaternion(q: Quat): this {
    this.quaternion.copy(q);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public slerp(targetQuat: Quat, t: number): this {
    this.quaternion.slerp(targetQuat, t);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public rotateX(angle: number): this {
    this.rotation.x += angle;
    this.quaternion.rotateX(angle);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public rotateY(angle: number): this {
    this.rotation.y += angle;
    this.quaternion.rotateY(angle);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public rotateZ(angle: number): this {
    this.rotation.z += angle;
    this.quaternion.rotateZ(angle);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public rotateOnAxis(axis: Vec3, angle: number): this {
    const q = new Quat().setAxisAngle(axis, angle);
    this.quaternion.multiply(q);
    this.isLookingAt = false;
    this.markDirty();
    return this;
  }

  public translate(xOrVec: Vec3 | number, y?: number, z?: number): this {
    if (xOrVec instanceof Vec3) {
      this.position.add(xOrVec);
    } else {
      this.position.x += xOrVec;
      this.position.y += y ?? 0;
      this.position.z += z ?? 0;
    }
    this.markDirty();
    return this;
  }

  public lookAt(target: Vec3, up: Vec3 = new Vec3(0, 1, 0)): this {
    if (this.position.equals(target)) {
      return this;
    }
    this.rotationMatrix.lookAtRH(this.position, target, up);
    this.rotationMatrix.transposeLinear();
    const arr = this.rotationMatrix.toArray();
    arr[12] = 0; arr[13] = 0; arr[14] = 0;
    this.quaternion.identity();
    this.rotation.setScalar(0, 0, 0);
    this.isLookingAt = true;
    this.markDirty();
    return this;
  }

  public updateModelMatrix(): void {
    if (!this.isTransformDirty) {
      return;
    }
    this.modelMatrix.identity();
    this.modelMatrix.translate(this.position);
    if (!this.quaternion.isIdentity()) {
      this.quaternion.toMat4x3(this.rotationMatrix);
      this.modelMatrix.multiply(this.rotationMatrix);
    } else if (!this.rotation.isOrigin()) {
      this.rotationMatrix.identity()
        .rotateX(this.rotation.x)
        .rotateY(this.rotation.y)
        .rotateZ(this.rotation.z);
      this.modelMatrix.multiply(this.rotationMatrix);
    } else if (this.isLookingAt) {
      this.modelMatrix.multiply(this.rotationMatrix);
    }
    this.modelMatrix.scale(this.scale);
    this.isTransformDirty = false;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
  }

  public computeNormalMatrix(): Mat3 {
    if (!this.isNormalMatrixDirty) {
      return this.normalMatrix;
    }
    const m = this.worldMatrix.toArray();
    const m0 = m[0], m1 = m[1], m2 = m[2];
    const m4 = m[4], m5 = m[5], m6 = m[6];
    const m8 = m[8], m9 = m[9], m10 = m[10];

    const c00 = m5 * m10 - m6 * m9;
    const c10 = m6 * m8 - m4 * m10;
    const c20 = m4 * m9 - m5 * m8;
    const det = m0 * c00 + m1 * c10 + m2 * c20;
    const invDet = det !== 0 ? 1 / det : 1;

    const out = this.normalMatrix.toArray();
    // Normal matrix = (M^-1)^T = cofactor(M) / det in column-major order
    // Column 0: C00, C10, C20
    out[0] = c00 * invDet;
    out[1] = c10 * invDet;
    out[2] = c20 * invDet;

    // Column 1: C01, C11, C21
    out[3] = (m9 * m2 - m1 * m10) * invDet;
    out[4] = (m0 * m10 - m2 * m8) * invDet;
    out[5] = (m1 * m8 - m0 * m9) * invDet;

    // Column 2: C02, C12, C22
    out[6] = (m1 * m6 - m2 * m5) * invDet;
    out[7] = (m2 * m4 - m0 * m6) * invDet;
    out[8] = (m0 * m5 - m1 * m4) * invDet;

    this.isNormalMatrixDirty = false;
    return this.normalMatrix;
  }

  public getWorldPosition(target: Vec3 = new Vec3()): Vec3 {
    const m = this.worldMatrix.toArray();
    target.setScalar(m[12], m[13], m[14]);
    return target;
  }

  public getWorldDirection(target: Vec3 = new Vec3()): Vec3 {
    const m = this.worldMatrix.toArray();
    target.setScalar(-m[8], -m[9], -m[10]);
    return target.normalize();
  }

  public distanceTo(target: Mesh | Vec3): number {
    const targetPos = target instanceof Vec3 ? target : target.getWorldPosition();
    return this.getWorldPosition().getDistance(targetPos);
  }

  public isInsideBounds(min: Vec3, max: Vec3): boolean {
    return this.getWorldPosition().isInBounds(min, max);
  }

  public computeBoundingBox(): BoundingBox {
    if (this.isBoundsDirty || this.boundingBox.isEmpty()) {
      if (this.vertices && this.vertices.length > 0) {
        this.boundingBox.copy(this.localBoundingBox).applyMatrix4(this.worldMatrix);
      } else {
        const pos = this.getWorldPosition();
        this.boundingBox.set(pos, pos);
      }
      this.isBoundsDirty = false;
    }
    return this.boundingBox;
  }

  public computeBoundingSphere(): BoundingSphere {
    if (this.isBoundsDirty || this.boundingSphere.radius === 0) {
      if (this.vertices && this.vertices.length > 0) {
        this.boundingSphere.copy(this.localBoundingSphere).applyMatrix4(this.worldMatrix);
      } else {
        this.boundingSphere.set(this.getWorldPosition(), 0);
      }
      this.isBoundsDirty = false;
    }
    return this.boundingSphere;
  }

  public raycast(ray: Ray): { distance: number; point: Vec3 } | null {
    if (!this.isActive()) return null;
    const sphere = this.computeBoundingSphere();
    const hitPoint = ray.intersectSphere(sphere);
    if (!hitPoint) return null;
    const distance = ray.origin.getDistance(hitPoint);
    return { distance, point: hitPoint };
  }

  public useBasicMaterial(options?: { color?: Vec3; texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture }): this {
    const mat = new Material();
    if (options?.color) {
      mat.setDiffuse(options.color);
    }
    this.addProgram(BasicShader.vertex, BasicShader.fragment, mat);
    if (options?.texture) {
      if (options.texture instanceof WebGLTexture) {
        this.WebGLTexture = options.texture;
      } else {
        this.setTexture(<HTMLImageElement>options.texture);
      }
    }
    return this;
  }

  public usePhongMaterial(options?: { ambient?: Vec3; diffuse?: Vec3; specular?: Vec3; shininess?: number; texture?: HTMLImageElement | HTMLCanvasElement | WebGLTexture }): this {
    const mat = new Material();
    if (options?.ambient) mat.setAmbient(options.ambient);
    if (options?.diffuse) mat.setDiffuse(options.diffuse);
    if (options?.specular) mat.setSpecular(options.specular);
    if (options?.shininess !== undefined) mat.setShininess(options.shininess);
    this.addProgram(PhongShader.vertex, PhongShader.fragment, mat);
    if (options?.texture) {
      if (options.texture instanceof WebGLTexture) {
        this.WebGLTexture = options.texture;
      } else {
        this.setTexture(<HTMLImageElement>options.texture);
      }
    }
    return this;
  }

  public useNormalMaterial(): this {
    this.addProgram(NormalShader.vertex, NormalShader.fragment, new Material());
    return this;
  }

  public setWorldMatrix(worldMatrix: Mat4x3): void {
    this.worldMatrix.copy(worldMatrix).multiply(this.modelMatrix);
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
  }

  public setTexture(img: TextureSource, options?: ITextureOptions): void {
    if (this.WebGLTexture) {
      this.context.deleteTexture(this.WebGLTexture);
    }
    this.WebGLTexture = Texture.create(img, this.context, options);
    for (let program of this.programs) {
      if (program.sampler === undefined) {
        program.sampler = this.context.getUniformLocation(program, 'uSampler');
      }
    }
  }

  public addCustomUniform(name:string, type:string, value:number|Array<number>|Float32Array|Int32Array): void {
    if (!this.customUniforms.hasOwnProperty(name)){
      this.customUniforms[name] = new Uniform(type, value);
      for (let program of this.programs) {
        if (program[name] === undefined) {
          program[name] = this.context.getUniformLocation(program, 'u' + this.ucfirst(name));
        }
      }
    }
  }

  public setCustomUniform(name: string, value: number|number[]|Float32Array|Int32Array): void {
    if (this.customUniforms.hasOwnProperty(name)){
      this.customUniforms[name].value = value;
    }
  }

  private createProgram(): void {
    let program = this.programs[this.nbPrograms];
    this.addProgramAttribute('vertexPosition');
    if (this.normals) {
      this.addProgramAttribute('vertexNormal');
    }
    if (this.uvs) {
      this.addProgramAttribute('textureCoord');
    }
    // matrix uniforms
    this.addProgramUniform('modelMatrix');
    this.addProgramUniform('normalMatrix');
    this.addProgramUniform('viewMatrix');
    this.addProgramUniform('projectionMatrix');
    // default uniforms
    this.addProgramUniform('time');
    this.addProgramUniform('screenResolution');

    // custom customUniforms
    for (let property in this.customUniforms) {
      if (this.customUniforms.hasOwnProperty(property)) {
        this.addProgramUniform(property);
      }
    }

    // material uniforms
    for (let mat of this.materials) {
      for (let property in mat.uniforms) {
        if (mat.uniforms.hasOwnProperty(property) && program[property] === undefined) {
          this.addProgramUniform(property);
        }
      }
    }

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
    this.addProgramUniform('ambientLight');
    this.addProgramUniform('ambientColor');
    this.addProgramUniform('cameraPosition');

    // fog
    this.addProgramUniform('hasFog');
    this.addProgramUniform('fogColor');
    this.addProgramUniform('fogNear');
    this.addProgramUniform('fogFar');

    this.renderer.useProgram(program);//use program before adding static uniforms

    // send static uniforms
    if (program.screenResolution) {
      let viewport = this.context.getParameter(this.context.VIEWPORT);
      if (viewport && viewport.length >= 4) {
        this.context.uniform2f(program.screenResolution, viewport[2], viewport[3]);
      }
    }

    this.nbPrograms ++;

  }

  private addProgramAttribute(name:string): void {
    const loc = this.context.getAttribLocation(this.programs[this.nbPrograms], 
                                               'a' + this.ucfirst(name)
                                              );
    this.programs[this.nbPrograms][name] = loc;
    if (loc !== -1) {
      this.context.enableVertexAttribArray(loc);
    }
  }

  private addProgramUniform(name:string): void {
    const ucName = 'u' + this.ucfirst(name);
    let loc = this.context.getUniformLocation(this.programs[this.nbPrograms], ucName);
    if (loc === null) {
      loc = this.context.getUniformLocation(this.programs[this.nbPrograms], ucName + '[0]');
    }
    this.programs[this.nbPrograms][name] = loc;
  }

  public activateBlendMode(): void {
    this.blendMode = true;
  }

  public deactivateBlendMode(): void {
    this.blendMode = false;
  }

  public computeWorldMatrix(graph:SceneGraph): void {
    this.updateModelMatrix();
    this.setWorldMatrix(graph.getWorldMatrix());
    graph.pushModelMatrix(this.worldMatrix);

    for ( let child of this.children ) {
      child.computeWorldMatrix(graph);
    }

    graph.popModelMatrix();
  }

  public render(  projectionMatrix: Float32Array,
                  viewMatrix: Float32Array,
                  lights: IFlatLights,
                  time: number,
                  blendMode: boolean,
                  cameraPosition?: Vec3,
                  fog?: { color: Vec3; near: number; far: number } | null
                ): void {
    if(this.isActive()) {

      if(this.nbPrograms > 0) {
        let program = this.programs[0];
        // let material = null;
        for(let i = 0 ; i < this.nbSubMeshes ; i++) {
          if(this.blendMode === blendMode) {
            program = this.programs[i] || this.programs[this.nbPrograms - 1] ;

            this.renderer.useProgram(program);
            // materials
            const material = this.materials[i] || this.materials[this.materials.length - 1];
            if (material) {
              material.updateUniforms();
              let materialUniforms = material.uniforms;
              for(let property in materialUniforms){
                if (materialUniforms.hasOwnProperty(property) && program[property]) {
                  let uniform = materialUniforms[property];
                  this.context[uniform.type](program[property], uniform.value);
                }
              }
            }
            // positions
            if(this.indices) {
              this.renderer.bindBuffer('ELEMENT_ARRAY_BUFFER', <WebGLBuffer>this.indexBuffer);
            }
            this.renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.vertexBuffer);
            if (program.vertexPosition !== -1 && program.vertexPosition !== undefined) {
              this.renderer.vertexAttribPointer(  program.vertexPosition, 
                                                  <number>this.itemSize, 
                                                  'FLOAT', 
                                                  false, 
                                                  0, 
                                                  0
                                               );
            }

            // normals
            if (this.normals && program.vertexNormal !== -1 && program.vertexNormal !== undefined) {
              this.renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.normalBuffer);
              this.renderer.vertexAttribPointer(  program.vertexNormal, 
                                                  3, 
                                                  'FLOAT', 
                                                  false, 
                                                  0, 
                                                  0
                                                );
            }

            // uvs
            if (this.uvs && program.textureCoord !== -1 && program.textureCoord !== undefined) {
              this.renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.texCoordBuffer );
              this.renderer.vertexAttribPointer(program.textureCoord, 2, 'FLOAT', false, 0, 0);
            }

            // texture
            if(this.WebGLTexture){
              this.context.activeTexture(this.context.TEXTURE0);
              this.context.bindTexture(this.context.TEXTURE_2D, this.WebGLTexture);
              if (program.sampler) {
                this.context.uniform1i(program.sampler, 0);
              }
              if (program.hasTexture) {
                this.context.uniform1i(program.hasTexture, 1);
              }
            } else if (program.hasTexture) {
              this.context.uniform1i(program.hasTexture, 0);
            }

            // lights
            if (lights) {
              if (program.nbLights && lights.type) {
                this.context.uniform1i(program.nbLights, lights.type.length);
              }
              if (program.lightPosition && lights.position && lights.position.length > 0) {
                this.context.uniform3fv(program.lightPosition, lights.floatPosition || new Float32Array(<number[]>lights.position));
              }
              if (program.lightDiffuse && lights.diffuse && lights.diffuse.length > 0) {
                this.context.uniform3fv(program.lightDiffuse, lights.floatDiffuse || new Float32Array(<number[]>lights.diffuse));
              }
              if (program.lightSpecular && lights.specular && lights.specular.length > 0) {
                this.context.uniform3fv(program.lightSpecular, lights.floatSpecular || new Float32Array(<number[]>lights.specular));
              }
              if (program.lightDirection && lights.direction && lights.direction.length > 0) {
                this.context.uniform3fv(program.lightDirection, lights.floatDirection || new Float32Array(<number[]>lights.direction));
              }
              if (program.lightAttenuation && (lights.floatAttenuation || lights.constantAttenuation?.length)) {
                let attArr = lights.floatAttenuation;
                if (!attArr) {
                  const att: number[] = [];
                  for (let k = 0; k < lights.constantAttenuation.length; k++) {
                    att.push(
                      <number>lights.constantAttenuation[k] || 0,
                      <number>lights.linearAttenuation[k] || 0,
                      <number>lights.quadraticAttenuation[k] || 0
                    );
                  }
                  attArr = new Float32Array(att);
                }
                this.context.uniform3fv(program.lightAttenuation, attArr);
              }
              if (program.lightCutoff && lights.cutoff && lights.cutoff.length > 0) {
                this.context.uniform1fv(program.lightCutoff, lights.floatCutoff || new Float32Array(<number[]>lights.cutoff));
              }
              if (program.lightExponent && lights.exponent && lights.exponent.length > 0) {
                this.context.uniform1fv(program.lightExponent, lights.floatExponent || new Float32Array(<number[]>lights.exponent));
              }
              if (program.lightType && (lights.floatType || lights.type?.length)) {
                let typeArr = lights.floatType;
                if (!typeArr) {
                  typeArr = new Float32Array(lights.type.map(t => t === 'directional' ? 0 : t === 'point' ? 1 : 2));
                }
                this.context.uniform1fv(program.lightType, typeArr);
              }
              if (program.ambientLight && lights.ambient) {
                this.context.uniform3fv(program.ambientLight, lights.floatAmbient || new Float32Array(lights.ambient));
              }
            }

            // camera position
            if (program.cameraPosition) {
              if (cameraPosition) {
                this.context.uniform3f(program.cameraPosition, cameraPosition.x, cameraPosition.y, cameraPosition.z);
              } else if (viewMatrix) {
                const cx = -(viewMatrix[0] * viewMatrix[12] + viewMatrix[1] * viewMatrix[13] + viewMatrix[2] * viewMatrix[14]);
                const cy = -(viewMatrix[4] * viewMatrix[12] + viewMatrix[5] * viewMatrix[13] + viewMatrix[6] * viewMatrix[14]);
                const cz = -(viewMatrix[8] * viewMatrix[12] + viewMatrix[9] * viewMatrix[13] + viewMatrix[10] * viewMatrix[14]);
                this.context.uniform3f(program.cameraPosition, cx, cy, cz);
              }
            }

            // fog
            if (program.hasFog) {
              if (fog) {
                this.context.uniform1i(program.hasFog, 1);
                if (program.fogColor) {
                  this.context.uniform3f(program.fogColor, fog.color.x, fog.color.y, fog.color.z);
                }
                if (program.fogNear) {
                  this.context.uniform1f(program.fogNear, fog.near);
                }
                if (program.fogFar) {
                  this.context.uniform1f(program.fogFar, fog.far);
                }
              } else {
                this.context.uniform1i(program.hasFog, 0);
              }
            }

            // matrices
            if (program.modelMatrix) {
              this.context.uniformMatrix4fv(program.modelMatrix,      false, this.worldMatrix.toArray());
            }
            if (program.normalMatrix) {
              this.computeNormalMatrix();
              this.context.uniformMatrix3fv(program.normalMatrix,     false, this.normalMatrix.toArray());
            }
            if (program.projectionMatrix) {
              this.context.uniformMatrix4fv(program.projectionMatrix, false, projectionMatrix);
            }
            if (program.viewMatrix) {
              this.context.uniformMatrix4fv(program.viewMatrix,       false, viewMatrix);
            }

            // default (time)
            if (program.time) {
              this.context.uniform1f(program.time, time);
            }

            // custom
            for (let property in this.customUniforms) {
              if (this.customUniforms.hasOwnProperty(property)) {
                let uniform = this.customUniforms[property];
                if (program[property]) {
                  if (uniform.type.indexOf('Matrix') !== -1) {
                    this.context[uniform.type](program[property], false, uniform.value);
                  } else {
                    this.context[uniform.type](program[property], uniform.value);
                  }
                }
              }
            }

            this.renderer[this.drawMethod](<string>this.primitive, this.subMeshes[i]);
          }
        }
      }

      for (let child of this.children) {
        child.render( projectionMatrix,
                      viewMatrix,
                      lights,
                      time,
                      blendMode,
                      cameraPosition,
                      fog
                    );
      }

    }
  }

  public destroy(): void {
    this.clearPrograms();
    if (this.vertexBuffer) {
      this.context.deleteBuffer(this.vertexBuffer);
      this.vertexBuffer = null;
    }
    if (this.indexBuffer) {
      this.context.deleteBuffer(this.indexBuffer);
      this.indexBuffer = null;
    }
    if (this.normalBuffer) {
      this.context.deleteBuffer(this.normalBuffer);
      this.normalBuffer = null;
    }
    if (this.texCoordBuffer) {
      this.context.deleteBuffer(this.texCoordBuffer);
      this.texCoordBuffer = null;
    }
    if (this.WebGLTexture) {
      this.context.deleteTexture(this.WebGLTexture);
      this.WebGLTexture = null;
    }
  }

  private ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
