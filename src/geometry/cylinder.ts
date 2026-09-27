import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Cylinder extends BasicMesh {

  constructor(
    radiusTop: number = 1.0,
    radiusBottom: number = 1.0,
    height: number = 1.0,
    radialSegments: number = 16,
    heightSegments: number = 1,
    openEnded: boolean = false
  ) {
    super();

    const rTop = radiusTop !== undefined ? radiusTop : 1.0;
    const rBottom = radiusBottom !== undefined ? radiusBottom : 1.0;
    const h = height || 1.0;
    const radSeg = Math.max(3, Math.floor(radialSegments || 16));
    const hSeg = Math.max(1, Math.floor(heightSegments || 1));

    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    let index = 0;
    const indexGrid: number[][] = [];
    const halfH = h * 0.5;

    // Slope calculation for normal
    const tanTheta = (rBottom - rTop) / h;

    // Body vertices, normals, uvs
    for (let y = 0; y <= hSeg; y++) {
      const indexRow: number[] = [];
      const v = y / hSeg;
      const radius = v * (rBottom - rTop) + rTop;
      const py = -v * h + halfH;

      for (let x = 0; x <= radSeg; x++) {
        const u = x / radSeg;
        const theta = u * Math.PI * 2.0;

        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        const px = radius * sinTheta;
        const pz = radius * cosTheta;

        vertices.push(px, py, pz);

        const nx = sinTheta;
        const ny = tanTheta;
        const nz = cosTheta;
        const nLen = Math.hypot(nx, ny, nz) || 1.0;
        normals.push(nx / nLen, ny / nLen, nz / nLen);

        uvs.push(u, 1.0 - v);

        indexRow.push(index++);
      }
      indexGrid.push(indexRow);
    }

    // Body indices
    for (let x = 0; x < radSeg; x++) {
      for (let y = 0; y < hSeg; y++) {
        const a = indexGrid[y][x];
        const b = indexGrid[y + 1][x];
        const c = indexGrid[y + 1][x + 1];
        const d = indexGrid[y][x + 1];

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Caps
    if (!openEnded) {
      // Top cap
      if (rTop > 0) {
        const centerIndexTop = index++;
        vertices.push(0, halfH, 0);
        normals.push(0, 1, 0);
        uvs.push(0.5, 0.5);

        const topCapStartIndex = index;
        for (let x = 0; x <= radSeg; x++) {
          const u = x / radSeg;
          const theta = u * Math.PI * 2.0;
          const px = rTop * Math.sin(theta);
          const pz = rTop * Math.cos(theta);

          vertices.push(px, halfH, pz);
          normals.push(0, 1, 0);
          uvs.push(Math.sin(theta) * 0.5 + 0.5, Math.cos(theta) * 0.5 + 0.5);
          index++;
        }

        for (let x = 0; x < radSeg; x++) {
          const i1 = topCapStartIndex + x;
          const i2 = topCapStartIndex + x + 1;
          indices.push(centerIndexTop, i1, i2);
        }
      }

      // Bottom cap
      if (rBottom > 0) {
        const centerIndexBottom = index++;
        vertices.push(0, -halfH, 0);
        normals.push(0, -1, 0);
        uvs.push(0.5, 0.5);

        const bottomCapStartIndex = index;
        for (let x = 0; x <= radSeg; x++) {
          const u = x / radSeg;
          const theta = u * Math.PI * 2.0;
          const px = rBottom * Math.sin(theta);
          const pz = rBottom * Math.cos(theta);

          vertices.push(px, -halfH, pz);
          normals.push(0, -1, 0);
          uvs.push(Math.sin(theta) * 0.5 + 0.5, Math.cos(theta) * 0.5 + 0.5);
          index++;
        }

        for (let x = 0; x < radSeg; x++) {
          const i1 = bottomCapStartIndex + x;
          const i2 = bottomCapStartIndex + x + 1;
          indices.push(centerIndexBottom, i2, i1);
        }
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
