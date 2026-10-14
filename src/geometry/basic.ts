import type { IGeometry } from '../interfaces';
import type { SubMesh } from './submesh';

export class BasicMesh implements IGeometry {

  vertices    : number[] | Float32Array | null;
  indices     : number[] | Int32Array | Uint16Array | null;
  normals     : number[] | Float32Array | null;
  uvs         : number[] | Float32Array | null;
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
