import { Mat4x3, Mat3, Vec3, Quat } from '@1pizzateam/spock';
import { SceneGraph } from './scene/sceneGraph';
import { Program } from './program';
import { Texture } from './texture';
import { Uniform }       from './uniform';
import { MeshRenderer }  from './renderer/mesh';
import { SubMesh }  from './geometry/submesh';
import { Material }  from './material';
import { IProgram, ICustomUniforms, IFlatLights, IMesh } from './interfaces';

export enum eDrawMethod { drawElements = 'drawElements', drawArrays = 'drawArrays' };

export class Mesh implements IMesh {

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
  private isTransformDirty : boolean;

  active : boolean;

  drawMethod : eDrawMethod;

  programs : IProgram[];
  nbPrograms : number;

  materials : Material[];

  children : Mesh[];

  blendMode : boolean;

  zOrder : number;


  constructor(mesh: IMesh, context:WebGLRenderingContext) {
    this.vertices    = mesh.vertices ? mesh.vertices : null;
    this.indices     = mesh.indices ? mesh.indices : null;
    this.normals     = mesh.normals ? mesh.normals : null;
    this.uvs         = mesh.uvs ? mesh.uvs : null;
    this.itemSize    = mesh.itemSize ? mesh.itemSize : null;
    this.subMeshes   = mesh.subMeshes;
    this.nbSubMeshes = this.subMeshes.length;

    this.primitive   = mesh.primitive ? mesh.primitive : null;

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
    this.isTransformDirty = false;

    this.modelMatrix.identity();
    this.rotationMatrix.identity();
    this.worldMatrix.identity();
    this.normalMatrix.identity();

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

  public addProgram(vertexShader:string, fragmentShader:string, material:Material): boolean {
    if(this.nbPrograms < this.nbSubMeshes) {

      const program = Program.create( this.context, vertexShader, fragmentShader ) as IProgram | null;
      if (!program) {
        return false;
      }

      this.programs.push(program);

      this.addMaterial(material);

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

  public setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.position.copy(xOrVec);
    } else {
      this.position.setScalar(xOrVec, y, z);
    }
    this.isTransformDirty = true;
  }

  public setRotation(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.rotation.copy(xOrVec);
    } else {
      this.rotation.setScalar(xOrVec, y, z);
    }
    this.quaternion.identity();
    this.isTransformDirty = true;
  }

  public setScale(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.scale.copy(xOrVec);
    } else if (y === undefined && z === undefined) {
      this.scale.setScalar(xOrVec, xOrVec, xOrVec);
    } else {
      this.scale.setScalar(xOrVec, y, z);
    }
    this.isTransformDirty = true;
  }

  public setQuaternion(q: Quat): void {
    this.quaternion.copy(q);
    this.isTransformDirty = true;
  }

  public rotateX(angle: number): void {
    this.rotation.x += angle;
    this.isTransformDirty = true;
  }

  public rotateY(angle: number): void {
    this.rotation.y += angle;
    this.isTransformDirty = true;
  }

  public rotateZ(angle: number): void {
    this.rotation.z += angle;
    this.isTransformDirty = true;
  }

  public rotateOnAxis(axis: Vec3, angle: number): void {
    const q = new Quat().setAxisAngle(axis, angle);
    this.quaternion.multiply(q);
    this.isTransformDirty = true;
  }

  public translate(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.position.add(xOrVec);
    } else {
      this.position.x += xOrVec;
      this.position.y += y ?? 0;
      this.position.z += z ?? 0;
    }
    this.isTransformDirty = true;
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
    }
    this.modelMatrix.scale(this.scale);
    this.isTransformDirty = false;
  }

  public computeNormalMatrix(): Mat3 {
    const wm = new Mat4x3().copy(this.worldMatrix);
    wm.invertAffine();
    wm.transposeLinear();
    const src = wm.toArray();
    const dst = this.normalMatrix.toArray();
    dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2];
    dst[3] = src[4]; dst[4] = src[5]; dst[5] = src[6];
    dst[6] = src[8]; dst[7] = src[9]; dst[8] = src[10];
    return this.normalMatrix;
  }

  public getWorldPosition(target: Vec3 = new Vec3()): Vec3 {
    const m = this.worldMatrix.toArray();
    target.setScalar(m[12], m[13], m[14]);
    return target;
  }

  public setWorldMatrix(worldMatrix: Mat4x3): void {
    this.worldMatrix.copy(worldMatrix).multiply(this.modelMatrix);
  }

  public setTexture(img: HTMLImageElement): void {
    if (this.WebGLTexture) {
      this.context.deleteTexture(this.WebGLTexture);
    }
    this.WebGLTexture = Texture.create(img, this.context);
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
    this.programs[this.nbPrograms][name] = this.context.getUniformLocation(this.programs[this.nbPrograms], 
                                                                           'u' + this.ucfirst(name)
                                                                          );
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
                  blendMode: boolean
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
                      blendMode
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
