import { Rect } from '@1pizzateam/spock';
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

  constructor(widthOrRect?: Rect | number, height?: number/*, quantity: number*/) {
    super();
    let width: number;
    let h: number;
    if (widthOrRect instanceof Rect) {
      width = widthOrRect.size.x * 0.5;
      h = widthOrRect.size.y * 0.5;
    } else {
      width = widthOrRect ? widthOrRect * 0.5 : 1.0;
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
    for (var i = 0 ; i < length ; i++) {
      this.vertices!.push(...this.quad.vertices);
      this.indices!.push.apply(this.indices, this.createIndices(i));
      this.uvs.push(...this.quad.uvs);
    }
    if (this.subMeshes.length > 0 && length > 0) {
      this.subMeshes[0].count = this.indices!.length;
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
