import { Uniform } from './uniform';
import { SubMesh } from './geometry/submesh';
import { MeshRenderer }  from './renderer/mesh';
import { eDrawMethod } from './mesh';
import { Material }  from './material';
import { Mat4x3, Vec3, Vec2, Quat, Mat3 } from '@1pizzateam/spock';

export interface IGeometry {
  vertices    : number[] | Float32Array | null;
  indices     : number[] | Int32Array | Uint16Array | null;
  normals     : number[] | Float32Array | null;
  subMeshes   : SubMesh[];
  itemSize    : number | null;
  primitive   : string | null;
  uvs?        : number[] | Float32Array | null;
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
  position?       : Vec3;
  rotation?       : Vec3;
  scale?          : Vec3;
  quaternion?     : Quat;
  modelMatrix?    : Mat4x3;
  worldMatrix?    : Mat4x3;
  normalMatrix?   : Mat3;
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

// Identifies a rendered frame so per-frame uniforms are uploaded once per program.
export interface IFrameInfo {
  id: number;
  resolution?: Vec2;
}

// GL names as in WebGL constants, e.g. { equation: 'FUNC_ADD', source: 'SRC_ALPHA', destination: 'ONE_MINUS_SRC_ALPHA' }.
export interface IBlendOptions {
  equation: string;
  source: string;
  destination: string;
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
  sampler           : WebGLUniformLocation | null;
  modelMatrix       : WebGLUniformLocation | null;
  normalMatrix?     : WebGLUniformLocation | null;
  projectionMatrix  : WebGLUniformLocation | null;
  viewMatrix        : WebGLUniformLocation | null;
  time              : WebGLUniformLocation | null;
  screenResolution  : WebGLUniformLocation | null;
  // lights
  lightPosition?    : WebGLUniformLocation | null;
  lightDiffuse?     : WebGLUniformLocation | null;
  lightSpecular?    : WebGLUniformLocation | null;
  lightDirection?   : WebGLUniformLocation | null;
  lightAttenuation? : WebGLUniformLocation | null;
  lightCutoff?      : WebGLUniformLocation | null;
  lightExponent?    : WebGLUniformLocation | null;
  lightType?        : WebGLUniformLocation | null;
  // packed vec4 light arrays used by PhongShader
  lightPositionType?     : WebGLUniformLocation | null;
  lightDiffuseCutoff?    : WebGLUniformLocation | null;
  lightSpecularExponent? : WebGLUniformLocation | null;
  nbLights?         : WebGLUniformLocation | null;
  ambientLight?     : WebGLUniformLocation | null;
  ambientColor?     : WebGLUniformLocation | null;
  // fog
  fogColor?         : WebGLUniformLocation | null;
  fogNear?          : WebGLUniformLocation | null;
  fogFar?           : WebGLUniformLocation | null;
  [key: string]: any;
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
  type : (string | number)[];
  ambient?: number[];
  floatPosition?: Float32Array;
  floatDiffuse?: Float32Array;
  floatSpecular?: Float32Array;
  floatDirection?: Float32Array;
  floatAttenuation?: Float32Array;
  floatCutoff?: Float32Array;
  floatExponent?: Float32Array;
  floatType?: Float32Array;
  floatAmbient?: Float32Array;
  packedPosition?: Float32Array;
  packedDiffuse?: Float32Array;
  packedSpecular?: Float32Array;
  [key: string]: any;
}

