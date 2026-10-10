import type { IGeometry } from '../interfaces';
import type { SubMesh } from './submesh';

export class BasicMesh implements IGeometry {

  vertices    : number[] | null;
  indices     : number[] | null;
  normals     : number[] | null;
  uvs         : number[] | null;
  subMeshes   : SubMesh[];
  itemSize    : number;
  // nbSubMeshes : number;
  primitive   : string;

  constructor() {

    this.vertices = null;
    this.indices = null;
    this.normals = null;
    this.uvs = null;
    this.subMeshes = [];
    this.itemSize = 3;
    this.primitive = 'TRIANGLES';
  }

}
