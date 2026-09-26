import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export interface IQuad {
  vertices : Float32Array;
  indices  : Int32Array;
  uvs      : Float32Array;
}

export class MultiQuad extends BasicMesh{

  uvs  : number[];
  quad : IQuad;

  constructor(width: number, height: number/*, quantity: number*/) {
    super();
    width = width ? width * 0.5 : 1.0;
    height = height ? height * 0.5 : 1.0;

    this.quad = {
      vertices : new Float32Array([  width, -height, 0.0,
                                    -width,  height, 0.0,
                                    -width, -height, 0.0,
                                     width,  height, 0.0
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
    for (var i = 0 ; i < length ; i++) {
      this.vertices!.push(...this.quad.vertices);
      this.indices!.push.apply(this.indices, this.createIndices(i));
      this.uvs.push(...this.quad.uvs);
    }

  }

  private createIndices(quadIndex: number): number[] {
    var indices: number[] = [];
    for(var i = 0 ; i < 6 ; i++) {
      indices.push(this.quad.indices[i] + quadIndex * 4);
    }
    return indices;
  }

}
