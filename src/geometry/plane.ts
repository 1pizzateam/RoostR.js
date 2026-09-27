import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Plane extends BasicMesh {

  constructor(
    width: number = 1.0,
    height: number = 1.0,
    widthSegments: number = 1,
    heightSegments: number = 1,
    orientation: 'xy' | 'xz' = 'xz'
  ) {
    super();

    const w = width || 1.0;
    const h = height || 1.0;
    const gridX = Math.max(1, Math.floor(widthSegments || 1));
    const gridY = Math.max(1, Math.floor(heightSegments || 1));

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

        if (orientation === 'xz') {
          vertices.push(x, 0, y);
          normals.push(0, 1, 0);
        } else {
          vertices.push(x, -y, 0);
          normals.push(0, 0, 1);
        }

        uvs.push(ix / gridX, 1.0 - iy / gridY);
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = ix + gridX1 * iy;
        const b = ix + gridX1 * (iy + 1);
        const c = (ix + 1) + gridX1 * (iy + 1);
        const d = (ix + 1) + gridX1 * iy;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
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
