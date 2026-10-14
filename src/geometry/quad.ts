import { Rect, Vec2 } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Quad extends BasicMesh {

  declare vertices    : number[];
  declare uvs         : number[];
  declare subMeshes   : SubMesh[];
  declare itemSize    : number;
  // nbSubMeshes : number;
  declare primitive   : string;

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
    this.vertices = [  width, -h, 0.0,
                      -width, -h, 0.0,
                       width,  h, 0.0,
                      -width,  h, 0.0
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
