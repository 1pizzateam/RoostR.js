import { Vec3, Box as BoundingBox } from '@1pizzateam/spock';
import { Mesh } from './mesh';
import { CustomMesh } from '../geometry/customMesh';
import { Material } from '../material';
import { BasicShader } from '../shaders/basic';
import type { TextureSource, ITextureOptions } from '../texture';

export interface IQuadBatchOptions {
  capacity: number;
  vertexShader?: string;
  fragmentShader?: string;
  material?: Material;
  texture?: TextureSource;
  textureOptions?: ITextureOptions;
  sharedTexture?: WebGLTexture | null;
}

const QUAD_INDICES = [0, 1, 2, 0, 2, 3];

export class QuadBatch extends Mesh {
  public capacity: number;
  public used: number;
  public bounds: BoundingBox;
  private scratchPoint: Vec3;

  constructor(context: WebGLRenderingContext, options: IQuadBatchOptions) {
    const capacity = options.capacity;
    const geometry = new CustomMesh();
    geometry.vertices = new Float32Array(capacity * 18);
    geometry.uvs = new Float32Array(capacity * 12);
    geometry.bufferUsage = 'DYNAMIC_DRAW';
    geometry.setPrimitive('TRIANGLES');
    super(context, geometry);

    this.capacity = capacity;
    this.used = 0;
    this.bounds = new BoundingBox();
    this.scratchPoint = new Vec3();

    const vertex = options.vertexShader ?? BasicShader.vertex;
    const fragment = options.fragmentShader ?? BasicShader.fragment;
    const material = options.material ?? new Material({ diffuse: new Vec3(1, 1, 1) });
    this.addProgram(vertex, fragment, material);

    if (options.sharedTexture)
      this.setSharedTexture(options.sharedTexture);
    else if (options.texture)
      this.setTexture(options.texture, options.textureOptions);

    this.setInactive();
  }

  public begin(): this {
    this.used = 0;
    this.bounds.makeEmpty();
    return this;
  }

  public quad(corners: ArrayLike<number>, uv: ArrayLike<number>): boolean {
    if (this.used >= this.capacity)
      return false;
    const u0 = uv[0];
    const v0 = uv[1];
    const u1 = uv[2];
    const v1 = uv[3];
    const vertices = this.vertices as Float32Array;
    const uvs = this.uvs as Float32Array;
    let v = this.used * 18;
    let t = this.used * 12;
    for (let c = 0; c < 4; c++)
      this.bounds.expandByPoint(this.scratchPoint.setArray(corners, c * 3));
    for (let k = 0; k < 6; k++) {
      const corner = QUAD_INDICES[k];
      const i = corner * 3;
      vertices[v++] = corners[i];
      vertices[v++] = corners[i + 1];
      vertices[v++] = corners[i + 2];
      uvs[t++] = corner === 1 || corner === 2 ? u1 : u0;
      uvs[t++] = corner >= 2 ? v1 : v0;
    }
    this.used++;
    return true;
  }

  public end(): this {
    const gl = this.context;
    this.subMeshes[0].count = this.used * 6;
    if (!this.used) {
      this.setInactive();
      return this;
    }
    const vertices = this.vertices as Float32Array;
    const uvs = this.uvs as Float32Array;
    this.renderer.bindBuffer('ARRAY_BUFFER', this.vertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.used === this.capacity ? vertices : vertices.subarray(0, this.used * 18));
    this.renderer.bindBuffer('ARRAY_BUFFER', this.texCoordBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.used === this.capacity ? uvs : uvs.subarray(0, this.used * 12));
    this.setLocalBounds(this.bounds);
    this.setActive();
    return this;
  }

  public show(visible: boolean): void {
    if (visible && this.used > 0)
      this.setActive();
    else
      this.setInactive();
  }
}
