import { Matrix4x3 } from '@lcluber/type6js';
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

  vertices    : number[] | null;
  indices     : number[] | null;
  normals     : number[] | null;
  uvs         : number[] | null;
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

  modelMatrix    : Matrix4x3;
  rotationMatrix : Matrix4x3;
  worldMatrix    : Matrix4x3;

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

    this.modelMatrix    = new Matrix4x3();
    this.rotationMatrix = new Matrix4x3();
    this.worldMatrix    = new Matrix4x3();

    this.worldMatrix.identity();
    //this.rotationMatrix.identity();

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

  public addChild(mesh: Mesh): void{
    this.children.push(mesh);
  }

  public addProgram(vertexShader:string, fragmentShader:string, material:Material): boolean {
    if(this.nbPrograms < this.nbSubMeshes) {

      this.programs.push(Program.create( this.context, vertexShader, fragmentShader ) as IProgram);

      this.addMaterial(material);

      this.createProgram();
      return true;
    }
    return false;
  }

  public clearPrograms(){
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
          this.addProgramUniform(property);
        }
      }
      return true;
    }
    return false;
  }

  public setWorldMatrix(worldMatrix:Matrix4x3): void {
    this.worldMatrix.copy(worldMatrix).multiply(this.modelMatrix);
  }

  public setTexture(img: HTMLImageElement): void {
    this.WebGLTexture = Texture.create(img, this.context);
  }

  public addCustomUniform(name:string, type:string, value:number|Array<number>): void {
    if (!this.customUniforms.hasOwnProperty(name)){
      this.customUniforms[name] = new Uniform(type, value);
    }
  }

  public setCustomUniform(name: string, value: number|number[]): void {
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
    if (this.uvs && this.WebGLTexture) {
      this.addProgramAttribute('textureCoord');
    }
    // matrix uniforms
    this.addProgramUniform('modelMatrix');
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

    // texture
    if (this.WebGLTexture) {
      this.addProgramUniform('sampler');
    }

    this.renderer.useProgram(program);//use program before adding static uniforms

    // send static uniforms
    let viewport = this.context.getParameter(this.context.VIEWPORT);
    this.context.uniform2f(program.screenResolution, viewport[2], viewport[3]);

    this.nbPrograms ++;

  }

  private addProgramAttribute(name:string): void {
    this.programs[this.nbPrograms][name] = this.context.getAttribLocation(this.programs[this.nbPrograms], 
                                                                          'a' + this.ucfirst(name)
                                                                         );
    this.context.enableVertexAttribArray(this.programs[this.nbPrograms][name]);
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
    //if(this.isActive()) {
      this.setWorldMatrix(graph.getWorldMatrix());
      graph.pushModelMatrix(this.worldMatrix);

      for ( let child of this.children ) {
        child.computeWorldMatrix(graph);
      }

      graph.popModelMatrix();
    //}
  }

  public render(  projectionMatrix: Float32Array,
                  viewMatrix: Float32Array,
                  lights: IFlatLights,
                  time: number,
                  blendMode: boolean
                ): void {
    if(this.isActive()) {

      let program = this.programs[0];
      // let material = null;
      for(let i = 0 ; i < this.nbSubMeshes ; i++) {
        if(this.blendMode === blendMode) {
          program = this.programs[i] || this.programs[this.nbPrograms - 1] ;

          this.renderer.useProgram(program);
          // materials
          if (this.materials[i]) {
            let materialUniforms = this.materials[i].uniforms;
            for(let property in materialUniforms){
              if (materialUniforms.hasOwnProperty(property)) {
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
          this.renderer.vertexAttribPointer(  program.vertexPosition, 
                                              <number>this.itemSize, 
                                              'FLOAT', 
                                              false, 
                                              0, 
                                              0
                                           );

          // normals
          if (this.normals) {
            this.renderer.vertexAttribPointer(  program.vertexNormal, 
                                                <number>this.itemSize, 
                                                'FLOAT', 
                                                false, 
                                                0, 
                                                0
                                              );
          }

          // uvs
          if (this.uvs && this.WebGLTexture) {
            this.renderer.bindBuffer('ARRAY_BUFFER', <WebGLBuffer>this.texCoordBuffer );
            this.renderer.vertexAttribPointer(program.textureCoord, 2, 'FLOAT', false, 0, 0);
          }

          // texture
          if(this.WebGLTexture){
            this.context.activeTexture(this.context.TEXTURE0);
            this.context.bindTexture(this.context.TEXTURE_2D, this.WebGLTexture);
            this.context.uniform1i(program.sampler, 0);
          }

          // matrices
          this.context.uniformMatrix4fv(program.modelMatrix,      false, this.worldMatrix.toArray());
          this.context.uniformMatrix4fv(program.projectionMatrix, false, projectionMatrix);
          this.context.uniformMatrix4fv(program.viewMatrix,       false, viewMatrix);

          // default (time)
          this.context.uniform1f(program.time, time);

          // custom
          for (let property in this.customUniforms) {
            if (this.customUniforms.hasOwnProperty(property)) {
              let uniform = this.customUniforms[property];
              this.context[uniform.type](program[property], uniform.value);
            }
          }

          this.renderer[this.drawMethod](<string>this.primitive, this.subMeshes[i]);
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

  private ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
