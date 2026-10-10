import { Vec3 } from '@1pizzateam/spock';
import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Line extends BasicMesh {

  declare vertices    : number[];
  thickness           : number;
  declare subMeshes   : SubMesh[];
  declare itemSize    : number;
  // nbSubMeshes : number;
  declare primitive   : string;

  constructor(vertices: Vec3[] | number[], thickness?: number) {
    super();
    this.thickness = thickness ? thickness * 0.5 : 1.0;

    if (vertices && vertices.length > 0 && vertices[0] instanceof Vec3) {
      const flat: number[] = [];
      for (const v of vertices as Vec3[])
        flat.push(v.x, v.y, v.z);
      this.vertices = flat;
    } else
      this.vertices = (vertices as number[]) || [];
    this.itemSize = 3;
    this.subMeshes = [
      new SubMesh(0, this.vertices.length / this.itemSize)
    ];

    this.primitive = 'LINE_STRIP';
  }

}
