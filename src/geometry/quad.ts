import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Quad extends BasicMesh {

  declare vertices    : number[];
  declare uvs         : number[];
  declare subMeshes   : SubMesh[];
  declare itemSize    : number;
  // nbSubMeshes : number;
  declare primitive   : string;

  constructor(width: number, height: number) {
    super();
    width = width ? width * 0.5 : 1.0;
    height = height ? height * 0.5 : 1.0;
    // this.vertices = [  1.0,-1.0, 0.0,
    //                   -1.0,-1.0, 0.0,
    //                    1.0, 1.0, 0.0,
    //                   -1.0, 1.0, 0.0
    //                 ];
    this.vertices = [  width, -height, 0.0,
                      -width, -height, 0.0,
                       width,  height, 0.0,
                      -width,  height, 0.0
                    ];
    this.uvs = [ 1.0, 0.0,
                 0.0, 0.0,
                 1.0, 1.0,
                 0.0, 1.0
               ];
    this.subMeshes = [
      new SubMesh( 0, 4)
    ];
    this.itemSize = 3;
    this.primitive = 'TRIANGLE_STRIP';
  }

}
