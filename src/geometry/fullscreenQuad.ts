import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class FullscreenQuad extends BasicMesh {

  uvs: number[];

  constructor() {
    super();
    this.vertices = [  1.0,-1.0,
                      -1.0,-1.0,
                       1.0, 1.0,
                      -1.0, 1.0
                    ];
    this.uvs = [ 1.0, 0.0,
                 0.0, 0.0,
                 1.0, 1.0,
                 0.0, 1.0
               ];
    this.subMeshes = [
      new SubMesh( 0, 4)
    ];
    this.itemSize = 2;
    this.primitive = 'TRIANGLE_STRIP';
  }

}
