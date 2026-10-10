import { Vec2, Utils } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Plane extends BasicMesh {

  constructor(
    sizeOrWidth: Vec2 | number = 1.0,
    heightOrWidthSegments: number = 1.0,
    widthOrHeightSegments: number = 1,
    heightSegmentsOrOrientation?: number | ('xy' | 'xz'),
    orientation: 'xy' | 'xz' = 'xz'
  ) {
    super();

    let w: number;
    let h: number;
    let gridX: number;
    let gridY: number;
    let orient: 'xy' | 'xz';

    if (sizeOrWidth instanceof Vec2) {
      w = sizeOrWidth.x || 1.0;
      h = sizeOrWidth.y || 1.0;
      gridX = Utils.clamp(Utils.floor(heightOrWidthSegments || 1, 0), 1, Infinity);
      gridY = Utils.clamp(Utils.floor(widthOrHeightSegments || 1, 0), 1, Infinity);
      orient = (typeof heightSegmentsOrOrientation === 'string' ? heightSegmentsOrOrientation : orientation) || 'xz';
    } else {
      w = sizeOrWidth || 1.0;
      h = heightOrWidthSegments || 1.0;
      gridX = Utils.clamp(Utils.floor(widthOrHeightSegments || 1, 0), 1, Infinity);
      gridY = Utils.clamp(Utils.floor((typeof heightSegmentsOrOrientation === 'number' ? heightSegmentsOrOrientation : 1) || 1, 0), 1, Infinity);
      orient = orientation || 'xz';
    }

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    const segmentWidth = w / gridX;
    const segmentHeight = h / gridY;

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const halfW = w * 0.5;
    const halfH = h * 0.5;

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segmentHeight - halfH;
      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segmentWidth - halfW;

        if (orient === 'xz') {
          vertices.push(x, 0, y);
          normals.push(0, 1, 0);
        } else {
          vertices.push(x, -y, 0);
          normals.push(0, 0, 1);
        }

        uvs.push(ix / gridX, 1.0 - iy / gridY);
      }
    }

    for (let iy = 0; iy < gridY; iy++)
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = (ix + 1) + gridX1 * (iy + 1);
        const d = (ix + 1) + gridX1 * iy;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }

    this.vertices = vertices;
    this.normals = normals;
    this.uvs = uvs;
    this.indices = indices;
    this.itemSize = 3;
    this.primitive = 'TRIANGLES';
    this.subMeshes = [ new SubMesh(0, indices.length) ];
  }

}
