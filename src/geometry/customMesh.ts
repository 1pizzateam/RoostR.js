
import { Vec3 } from '@1pizzateam/spock';
import { SubMesh } from './submesh';
import type { IGeometry } from '../interfaces';

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

  private static toFloat32(array: Vec3[]): Float32Array {
    const flat = new Float32Array(array.length * 3);
    for (let i = 0; i < array.length; i++)
      array[i].toArray(flat, i * 3);
    return flat;
  }

  public setVertices(array: Vec3[]): void {
    this.vertices = CustomMesh.toFloat32(array);
  }

  public setIndices(array: Int32Array | number[]): void {
    this.indices = array instanceof Int32Array ? array.slice(0) : new Int32Array(array);
  }

  public setNormals(array: Vec3[]): void {
    this.normals = CustomMesh.toFloat32(array);
  }

  public setUvs(array: Float32Array | number[]): void {
    this.uvs = array instanceof Float32Array ? array.slice(0) : new Float32Array(array);
  }

  public addSubMeshes(array: Float32Array | Int32Array | number[]): void {
    for (let i = 0; i < array.length; i += 2)
      this.addSubMesh( array[i], array[i+1] );
  }

  public addSubMesh(start: number, count: number): void {
    this.subMeshes.push(new SubMesh( start, count));
  }

  public setItemSize(itemSize: number): void {
    this.itemSize = itemSize;
  }

  public setPrimitive(primitive: string): boolean {
    for (let i = 0; i < this.primitives.length; i++)
      if(this.primitives[i] === primitive) {
        this.primitive = primitive;
        return true;
      }
    return false;
  }

  private static _vA = new Vec3();
  private static _vB = new Vec3();
  private static _vC = new Vec3();
  private static _e1 = new Vec3();
  private static _e2 = new Vec3();
  private static _n = new Vec3();
  private static _sum = new Vec3();
  private static readonly UP = new Vec3(0, 1, 0);

  // Adds the face normal n to the accumulated normal of the vertex at offset.
  private static accumulate(normals: Float32Array, offset: number, n: Vec3): void {
    CustomMesh._sum.setArray(normals, offset).add(n).toArray(normals, offset);
  }

  // Area-weighted smooth normals (indexed) or flat normals (non-indexed).
  public computeVertexNormals(): Float32Array | null {
    if (!this.vertices || this.vertices.length === 0) return null;

    const vertices = this.vertices;
    const normals = new Float32Array(vertices.length);
    const vA = CustomMesh._vA, vB = CustomMesh._vB, vC = CustomMesh._vC;
    const e1 = CustomMesh._e1, e2 = CustomMesh._e2, n = CustomMesh._n;

    const faceNormal = (iA: number, iB: number, iC: number): Vec3 => {
      vA.setArray(vertices, iA);
      vB.setArray(vertices, iB);
      vC.setArray(vertices, iC);
      return n.crossVectors(e1.subVectors(vB, vA), e2.subVectors(vC, vA));
    };

    if (this.indices && this.indices.length > 0)
      for (let i = 0; i + 2 < this.indices.length; i += 3) {
        const iA = this.indices[i] * 3;
        const iB = this.indices[i + 1] * 3;
        const iC = this.indices[i + 2] * 3;
        faceNormal(iA, iB, iC);
        CustomMesh.accumulate(normals, iA, n);
        CustomMesh.accumulate(normals, iB, n);
        CustomMesh.accumulate(normals, iC, n);
      }
    else
      for (let i = 0; i + 8 < vertices.length; i += 9) {
        faceNormal(i, i + 3, i + 6);
        n.toArray(normals, i);
        n.toArray(normals, i + 3);
        n.toArray(normals, i + 6);
      }

    for (let i = 0; i < normals.length; i += 3)
      n.setArray(normals, i).normalize(CustomMesh.UP).toArray(normals, i);

    this.normals = normals;
    return this.normals;
  }

}
