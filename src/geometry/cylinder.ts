import { Trigo, Utils, Vec2 } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Cylinder extends BasicMesh {

  constructor(
    radii: Vec2 = new Vec2(1.0, 1.0),
    height = 1.0,
    radialSegments = 16,
    heightSegments = 1,
    openEnded = false
  ) {
    super();

    const rTop = radii.x;
    const rBottom = radii.y;
    const h = height;
    const radSeg = Utils.clamp(Utils.floor(radialSegments, 0), 3, Infinity);
    const hSeg = Utils.clamp(Utils.floor(heightSegments, 0), 1, Infinity);
    const open = openEnded;

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
        const theta = u * Trigo.twopi;

        const sinTheta = Trigo.sine(theta);
        const cosTheta = Trigo.cosine(theta);

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
    for (let x = 0; x < radSeg; x++)
      for (let y = 0; y < hSeg; y++) {
        const a = indexGrid[y][x];
        const b = indexGrid[y + 1][x];
        const c = indexGrid[y + 1][x + 1];
        const d = indexGrid[y][x + 1];

        indices.push(a, b, d);
        indices.push(b, c, d);
      }

    // Caps
    if (!open) {
      // Top cap
      if (rTop > 0) {
        const centerIndexTop = index++;
        vertices.push(0, halfH, 0);
        normals.push(0, 1, 0);
        uvs.push(0.5, 0.5);

        const topCapStartIndex = index;
        for (let x = 0; x <= radSeg; x++) {
          const u = x / radSeg;
          const theta = u * Trigo.twopi;
          const px = rTop * Trigo.sine(theta);
          const pz = rTop * Trigo.cosine(theta);

          vertices.push(px, halfH, pz);
          normals.push(0, 1, 0);
          uvs.push(Trigo.sine(theta) * 0.5 + 0.5, Trigo.cosine(theta) * 0.5 + 0.5);
          index++;
        }

        for (let x = 0; x < radSeg; x++)
          indices.push(centerIndexTop, topCapStartIndex + x, topCapStartIndex + x + 1);
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
          const theta = u * Trigo.twopi;
          const px = rBottom * Trigo.sine(theta);
          const pz = rBottom * Trigo.cosine(theta);

          vertices.push(px, -halfH, pz);
          normals.push(0, -1, 0);
          uvs.push(Trigo.sine(theta) * 0.5 + 0.5, Trigo.cosine(theta) * 0.5 + 0.5);
          index++;
        }

        for (let x = 0; x < radSeg; x++)
          indices.push(centerIndexBottom, bottomCapStartIndex + x + 1, bottomCapStartIndex + x);
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
