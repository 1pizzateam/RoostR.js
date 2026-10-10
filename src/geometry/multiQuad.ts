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

  constructor(sizeOrWidth?: Vec2 | Rect | number, height?: number/*, quantity: number*/) {
    super();
    let width: number;
    let h: number;
    if (sizeOrWidth instanceof Vec2) {
      width = sizeOrWidth.x * 0.5;
      h = sizeOrWidth.y * 0.5;
    } else if (sizeOrWidth instanceof Rect) {
      width = sizeOrWidth.size.x * 0.5;
      h = sizeOrWidth.size.y * 0.5;
    } else {
      width = sizeOrWidth ? sizeOrWidth * 0.5 : 1.0;
      h = height ? height * 0.5 : 1.0;
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
