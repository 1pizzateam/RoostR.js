import { IGeometry } from '../interfaces';
import { SubMesh } from './submesh';

export class BasicMesh implements IGeometry {

  vertices    : number[] | null;
  indices     : number[] | null;
  normals     : number[] | null;
  subMeshes   : SubMesh[];
  itemSize    : number;
  // nbSubMeshes : number;
  primitive   : string;

  constructor() {

    this.vertices = null;
    this.indices = null;
    this.normals = null;
    this.subMeshes = [];
    this.itemSize = 3;
    this.primitive = 'TRIANGLES';
  }

}
