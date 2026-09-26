
import { SubMesh } from './submesh';

export class CustomMesh {

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

  public setVertices(array: Float32Array): void {
    this.vertices = array.slice(0);
  }

  public setIndices(array: Int32Array): void {
    this.indices = array.slice(0);
  }

  public setNormals(array: Float32Array): void {
    this.normals = array.slice(0);
  }

  public setUvs(array: Float32Array): void {
    this.uvs = array.slice(0);
  }

  public addSubMeshes(array: Float32Array): void {
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

}
