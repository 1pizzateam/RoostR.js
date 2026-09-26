import { BasicMesh } from './basic';
import { SubMesh } from './submesh';

export class Line extends BasicMesh {

  declare vertices    : number[];
  thickness           : number;
  declare subMeshes   : SubMesh[];
  declare itemSize    : number;
  // nbSubMeshes : number;
  declare primitive   : string;

  constructor(vertices: number[], thickness?: number) {
    super();
    this.thickness = thickness ? thickness * 0.5 : 1.0;

    this.vertices = vertices;
    this.itemSize = 3;
    this.subMeshes = [
      new SubMesh( 0, vertices ? vertices.length / this.itemSize : 0)
    ];

    this.primitive = 'LINE_STRIP';
  }

}
