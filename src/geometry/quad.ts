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

  constructor(sizeOrWidth?: Vec2 | Rect | number, height?: number) {
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
