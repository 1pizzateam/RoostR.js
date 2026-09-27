
import { SubMesh } from './submesh';
import { IGeometry } from '../interfaces';

export class CustomMesh implements IGeometry {

  vertices    : Float32Array | null;
  indices     : Int32Array | null;
  normals     : Float32Array | null;
  uvs         : Float32Array | null;
  subMeshes   : SubMesh[];
  itemSize    : number;
  // nbSubMeshes : number;
  primitive   : string;
  primitives  : string[];

  constructor() {
    this.vertices  = /*mesh.vertices ? this.copyArray(mesh.vertices) :*/ null;
    this.indices   = /*mesh.indices ? this.copyArray(mesh.indices) :*/ null;
    this.normals   = /*mesh.normals ? this.copyArray(mesh.normals) :*/ null;
    this.uvs       = /*mesh.uvs ? this.copyArray(mesh.uvs) :*/ null;
    this.subMeshes = [];
    this.itemSize  = 3;
    this.primitive = 'TRIANGLES';
    // gl.POINTS: Draws a single dot.
    // gl.LINE_STRIP: Draws a straight line to the next vertex.
    // gl.LINE_LOOP: Draws a straight line to the next vertex, and connects the last vertex back to the first.
    // gl.LINES: Draws a line between a pair of vertices.
    // gl.TRIANGLE_STRIP
    // gl.TRIANGLE_FAN
    // gl.TRIANGLES: Draws a triangle for a group of three vertices.
    this.primitives = [ 'POINTS', 
                        'LINE_STRIP', 
                        'LINE_LOOP', 
                        'LINES', 
                        'TRIANGLE_STRIP', 
                        'TRIANGLE_FAN', 
                        'TRIANGLES'
                      ];
  }

  public setVertices(array: Float32Array | number[]): void {
    this.vertices = array instanceof Float32Array ? array.slice(0) : new Float32Array(array);
  }

  public setIndices(array: Int32Array | number[]): void {
    this.indices = array instanceof Int32Array ? array.slice(0) : new Int32Array(array);
  }

  public setNormals(array: Float32Array | number[]): void {
    this.normals = array instanceof Float32Array ? array.slice(0) : new Float32Array(array);
  }

  public setUvs(array: Float32Array | number[]): void {
    this.uvs = array instanceof Float32Array ? array.slice(0) : new Float32Array(array);
  }

  public addSubMeshes(array: Float32Array | Int32Array | number[]): void {
    for(var i = 0 ; i < array.length ; i+=2 ){
      this.addSubMesh( array[i], array[i+1] );
    }
  }

  public addSubMesh(start: number, count: number): void {
    this.subMeshes.push(new SubMesh( start, count));
  }

  public setItemSize(itemSize: number): void {
    this.itemSize = itemSize;
  }

  public setPrimitive(primitive: string): boolean {
    for (var i = 0 ; i < this.primitives.length ; i++) {
      if(this.primitives[i] === primitive){
        this.primitive = primitive;
        return true;
      }
    }
    return false;
  }

  public computeVertexNormals(): Float32Array | null {
    if (!this.vertices || this.vertices.length === 0) return null;

    const normals = new Float32Array(this.vertices.length);

    if (this.indices && this.indices.length > 0) {
      for (let i = 0; i < this.indices.length; i += 3) {
        const iA = this.indices[i] * 3;
        const iB = this.indices[i + 1] * 3;
        const iC = this.indices[i + 2] * 3;

        const ax = this.vertices[iA], ay = this.vertices[iA + 1], az = this.vertices[iA + 2];
        const bx = this.vertices[iB], by = this.vertices[iB + 1], bz = this.vertices[iB + 2];
        const cx = this.vertices[iC], cy = this.vertices[iC + 1], cz = this.vertices[iC + 2];

        // edge1 = B - A, edge2 = C - A
        const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
        const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;

        // cross product
        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        normals[iA] += nx; normals[iA + 1] += ny; normals[iA + 2] += nz;
        normals[iB] += nx; normals[iB + 1] += ny; normals[iB + 2] += nz;
        normals[iC] += nx; normals[iC + 1] += ny; normals[iC + 2] += nz;
      }
    } else {
      for (let i = 0; i < this.vertices.length; i += 9) {
        const ax = this.vertices[i], ay = this.vertices[i + 1], az = this.vertices[i + 2];
        const bx = this.vertices[i + 3], by = this.vertices[i + 4], bz = this.vertices[i + 5];
        const cx = this.vertices[i + 6], cy = this.vertices[i + 7], cz = this.vertices[i + 8];

        const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
        const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;

        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        normals[i] = nx; normals[i + 1] = ny; normals[i + 2] = nz;
        normals[i + 3] = nx; normals[i + 4] = ny; normals[i + 5] = nz;
        normals[i + 6] = nx; normals[i + 7] = ny; normals[i + 8] = nz;
      }
    }

    // Normalize all normals
    for (let i = 0; i < normals.length; i += 3) {
      const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
      if (len > 0) {
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
      } else {
        normals[i + 1] = 1.0;
      }
    }

    this.normals = normals;
    return this.normals;
  }

}
