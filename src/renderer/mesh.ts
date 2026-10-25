import type { SubMesh } from '../geometry/submesh';
import { type GLState, getGLState } from './state';
import type { Mesh } from '../objects/mesh';
import type { IFlatLights, IFrameInfo } from '../interfaces';
import type { Vec3 } from '@1pizzateam/spock';
import { uploadFrameUniforms } from './uniformUpload';
import { uploadUniform } from '../uniform';

export class MeshRenderer {

  context: WebGLRenderingContext;
  state: GLState;

  constructor(context:WebGLRenderingContext) {
    this.context = context;
    this.state = getGLState(context);
    this.defaultSettings();
  }

  public defaultSettings(): void {

  }

  public createBuffer( target: string, 
                       size: ArrayBuffer | ArrayBufferView | null, 
                       drawMethod: string 
                     ): WebGLBuffer | null {
                       
    const buffer = this.context.createBuffer();
    this.bindBuffer(target, buffer);
    this.context.bufferData(this.context[target], size, this.context[drawMethod]);
    return buffer;

  }

  public useProgram(program: WebGLProgram): void {
    if (this.state.program === program)
      return;
    this.state.program = program;
    this.context.useProgram(program);
  }

  public bindBuffer(target:string, buffer: WebGLBuffer | null ): void {
    if (target === 'ARRAY_BUFFER') {
      if (this.state.arrayBuffer === buffer) return;
      this.state.arrayBuffer = buffer;
    } else if (target === 'ELEMENT_ARRAY_BUFFER') {
      if (this.state.elementBuffer === buffer) return;
      this.state.elementBuffer = buffer;
    }
    this.context.bindBuffer(this.context[target], buffer);
  }

  public deleteBuffer(buffer: WebGLBuffer): void {
    if (this.state.arrayBuffer === buffer)
      this.state.arrayBuffer = null;
    if (this.state.elementBuffer === buffer)
      this.state.elementBuffer = null;
    this.context.deleteBuffer(buffer);
  }

  // Enables exactly the vertex attribute arrays in mask (bit i = attribute location i).
  public setAttributeMask(mask: number): void {
    const previous = this.state.attributeMask;
    if (previous === mask)
      return;
    if (this.state.maxAttributes === 0)
      this.state.maxAttributes = Math.min(16, this.context.getParameter(this.context.MAX_VERTEX_ATTRIBS) || 8);
    const changed = previous === null ? (1 << this.state.maxAttributes) - 1 : previous ^ mask;
    for (let i = 0; i < this.state.maxAttributes && (changed >> i) !== 0; i++)
      if ((changed >> i) & 1)
        if ((mask >> i) & 1)
          this.context.enableVertexAttribArray(i);
        else
          this.context.disableVertexAttribArray(i);
    this.state.attributeMask = mask;
  }

  public vertexAttribPointer(index: number, size: number, type: string, normalized: boolean, stride: number, offset: number): void {
    this.context.vertexAttribPointer(index, size, this.context[type], normalized, stride, offset);
  }

  public drawElements(primitive: string | number, subMesh: SubMesh, indexType?: number): void {
    const mode = typeof primitive === 'number' ? primitive : (this.context[primitive] ?? this.context.TRIANGLES);
    const type = indexType ?? this.context.UNSIGNED_SHORT;
    const bytes = type === this.context.UNSIGNED_SHORT ? 2 : 4;
    this.context.drawElements(mode, subMesh.count, type, subMesh.start * bytes);
  }

  public drawArrays(primitive: string | number, subMesh: SubMesh): void {
    const mode = typeof primitive === 'number' ? primitive : (this.context[primitive] ?? this.context.TRIANGLES);
    this.context.drawArrays(mode, subMesh.start, subMesh.count);
  }

  public drawMesh(
    mesh: Mesh,
    projectionMatrix: Float32Array,
    viewMatrix: Float32Array,
    lights: IFlatLights,
    time: number,
    cameraPosition?: Vec3,
    fog?: { color: Vec3; near: number; far: number } | null,
    frame?: IFrameInfo
  ): void {
    const context = this.context;
    const state = this.state;

    for (let i = 0; i < mesh.nbSubMeshes; i++) {
      const program = mesh.programs[i] || mesh.programs[mesh.nbPrograms - 1];
      this.useProgram(program);

      if (!frame || state.frameOfProgram.get(program) !== frame.id) {
        if (frame)
          state.frameOfProgram.set(program, frame.id);
        uploadFrameUniforms(context, program, projectionMatrix, viewMatrix, lights, time, cameraPosition, fog, frame);
      }

      // materials
      const material = mesh.materials[i] || mesh.materials[mesh.materials.length - 1];
      if (material) {
        material.updateUniforms();
        if (state.materialOfProgram.get(program) !== material || state.materialVersionOfProgram.get(program) !== material.version) {
          state.materialOfProgram.set(program, material);
          state.materialVersionOfProgram.set(program, material.version);
          const materialUniforms = material.uniforms;
          for (const property in materialUniforms)
            if (materialUniforms.hasOwnProperty(property) && program[property])
              uploadUniform(context, program[property], (materialUniforms as any)[property]);
        }
      }

      // vertex attributes: enable exactly what this program and mesh use
      let attributeMask = 0;
      if (mesh.indices)
        this.bindBuffer('ELEMENT_ARRAY_BUFFER', mesh.indexBuffer as WebGLBuffer);

      // positions
      if (program.vertexPosition !== -1 && program.vertexPosition !== undefined && mesh.vertexBuffer) {
        this.bindBuffer('ARRAY_BUFFER', mesh.vertexBuffer as WebGLBuffer);
        this.vertexAttribPointer(program.vertexPosition, mesh.itemSize as number, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.vertexPosition;
      }

      // normals
      if (mesh.normals && program.vertexNormal !== -1 && program.vertexNormal !== undefined) {
        this.bindBuffer('ARRAY_BUFFER', mesh.normalBuffer as WebGLBuffer);
        this.vertexAttribPointer(program.vertexNormal, 3, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.vertexNormal;
      }

      // uvs
      if (mesh.uvs && program.textureCoord !== -1 && program.textureCoord !== undefined) {
        this.bindBuffer('ARRAY_BUFFER', mesh.texCoordBuffer as WebGLBuffer);
        this.vertexAttribPointer(program.textureCoord, 2, 'FLOAT', false, 0, 0);
        attributeMask |= 1 << program.textureCoord;
      }

      this.setAttributeMask(attributeMask);

      // texture
      if (mesh.WebGLTexture) {
        if (state.texture2D !== mesh.WebGLTexture) {
          context.activeTexture(context.TEXTURE0);
          context.bindTexture(context.TEXTURE_2D, mesh.WebGLTexture);
          state.texture2D = mesh.WebGLTexture;
        }
        if (program.sampler && !state.samplerInitializedOfProgram.has(program)) {
          context.uniform1i(program.sampler, 0);
          state.samplerInitializedOfProgram.add(program);
        }
        if (program.hasTexture && state.hasTextureOfProgram.get(program) !== 1) {
          context.uniform1i(program.hasTexture, 1);
          state.hasTextureOfProgram.set(program, 1);
        }
      } else if (program.hasTexture && state.hasTextureOfProgram.get(program) !== 0) {
        context.uniform1i(program.hasTexture, 0);
        state.hasTextureOfProgram.set(program, 0);
      }

      // matrices
      if (program.modelMatrix)
        context.uniformMatrix4fv(program.modelMatrix, false, mesh.worldMatrix.toArray());
      if (program.normalMatrix) {
        mesh.computeNormalMatrix();
        context.uniformMatrix3fv(program.normalMatrix, false, mesh.normalMatrix.toArray());
      }

      // custom
      for (const property in mesh.customUniforms)
        if (mesh.customUniforms.hasOwnProperty(property) && program[property])
          uploadUniform(context, program[property], mesh.customUniforms[property]);

      this[mesh.drawMethod](mesh.primitive as string, mesh.subMeshes[i], mesh.indexType);
    }
  }
}
