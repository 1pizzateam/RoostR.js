import { Uniform } from './uniform';
import { SubMesh } from './geometry/submesh';
import { MeshRenderer }  from './renderer/mesh';
import { eDrawMethod } from './mesh';
import { Material }  from './material';
import { Matrix4x3 } from '@lcluber/type6js';

export interface IGeometry {
  vertices    : number[] | null;
  indices     : number[] | null;
  normals     : number[] | null;
  subMeshes   : SubMesh[];
  itemSize    : number | null;
  primitive   : string | null;
  uvs?        : number[] | null;
  nbSubMeshes? : number;
  quad? : {
    vertices: number[] | null;
    indices: number[] | null;
    uvs? : number[] | null;
  };
}

export interface IMesh extends IGeometry {
  // vertices    : number[] | null;
  // indices     : number[] | null;
  // normals     : number[] | null;
  // subMeshes   : SubMesh[];
  // itemSize    : number | null;
  // primitive   : string | null;
  // uvs?        : number[] | null;
  // nbSubMeshes? : number;
  customUniforms? : ICustomUniforms;
  context? : WebGLRenderingContext;
  renderer? : MeshRenderer;
  WebGLTexture? : WebGLTexture | null;
  vertexBuffer?   : WebGLBuffer | null;
  indexBuffer?   : WebGLBuffer | null;
  normalBuffer?   : WebGLBuffer | null;
  texCoordBuffer? : WebGLBuffer | null;
  modelMatrix?    : Matrix4x3;
  rotationMatrix? : Matrix4x3;
  worldMatrix?    : Matrix4x3;
  active? : boolean;
  drawMethod? : eDrawMethod;
  programs? : IProgram[];
  nbPrograms? : number;
  materials? : Material[];
  children? : IMesh[];
  blendMode? : boolean;
  zOrder? : number;
  // quad? : {
  //   vertices: number[] | null;
  //   indices: number[] | null;
  //   uvs? : number[] | null;
  // };
  // [key: string]: Uniform;
}

export interface ICustomUniforms {
  [key: string]: Uniform;
}

export interface IMaterialUniforms{
  materialAmbient : Uniform;
  materialDiffuse : Uniform;
  materialSpecular : Uniform;
  materialShininess : Uniform;
  //[key: string]: any;
}

export interface IProgram extends WebGLProgram {
  vertexNormal      : GLint;
  vertexPosition    : GLint;
  textureCoord      : GLint;
  sampler           : WebGLUniformLocation;
  modelMatrix       : WebGLUniformLocation;
  projectionMatrix  : WebGLUniformLocation;
  viewMatrix        : WebGLUniformLocation;
  time              : WebGLUniformLocation;
  screenResolution  : WebGLUniformLocation;
  // [key: string]: any;
}

export interface IFlatLights{
  position : number[];
  diffuse : number[];
  specular : number[];
  constantAttenuation : number[];
  linearAttenuation : number[];
  quadraticAttenuation : number[];
  cutoff : number[];
  exponent : number[];
  direction : number[];
  type : number[]
}
