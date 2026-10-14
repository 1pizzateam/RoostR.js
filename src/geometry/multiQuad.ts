import { Rect, Vec2 } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export interface IQuad {
  vertices : Float32Array;
  indices  : Int32Array;
  uvs      : Float32Array;
}

export class MultiQuad extends BasicMesh{

  declare vertices : number[];
  declare indices  : number[];
  declare uvs      : number[];
  quad : IQuad;

  constructor(size: Vec2 | Rect = new Vec2(2.0, 2.0)) {
    super();
    let width: number;
    let h: number;
    if (size instanceof Rect) {
      width = size.size.x * 0.5;
      h = size.size.y * 0.5;
    } else {
      width = size.x * 0.5;
      h = size.y * 0.5;
    }

    this.quad = {
      vertices : new Float32Array([  width, -h, 0.0,
                                    -width,  h, 0.0,
                                    -width, -h, 0.0,
                                     width,  h, 0.0
                                  ]),
      indices : new Int32Array([ 0,1,2,
                                 0,3,1
                              ]),
      uvs : new Float32Array([ 1.0, 0.0,
                               0.0, 1.0,
                               0.0, 0.0,
                               1.0, 1.0
                            ])
    };

    this.vertices = [];
    this.indices = [];
    this.uvs = [];

    this.subMeshes = [
      new SubMesh( 0, 4)
    ];
  }

  public createQuads(length: number): void {
    for (let i = 0 ; i < length ; i++) {
      this.vertices.push(...this.quad.vertices);
      this.indices.push(...this.createIndices(i));
      this.uvs.push(...this.quad.uvs);
    }
    if (this.subMeshes.length > 0 && length > 0)
      this.subMeshes[0].count = this.indices.length;
  }

  private createIndices(quadIndex: number): number[] {
    const indices: number[] = [];
    for(let i = 0 ; i < 6 ; i++)
      indices.push(this.quad.indices[i] + quadIndex * 4);
    return indices;
  }

}
