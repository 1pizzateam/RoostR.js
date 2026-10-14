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

  constructor(vertices: Vec3[] = [], thickness = 2.0) {
    super();
    this.thickness = (thickness || 2.0) * 0.5;
    this.itemSize = 3;
    this.primitive = 'LINE_STRIP';
    this.setPoints(vertices);
  }

  public setPoints(vertices: Vec3[]): this {
    const flat: number[] = [];
    if (vertices)
      for (const v of vertices)
        flat.push(v.x, v.y, v.z);
    this.vertices = flat;

    this.subMeshes = [
      new SubMesh(0, this.vertices.length / this.itemSize)
    ];
    return this;
  }

}
