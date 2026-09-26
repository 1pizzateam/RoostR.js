import {Vector3} from '@lcluber/type6js';
import {Light} from '../types';


export class DirectionalLight {

  position : Vector3;
  diffuse  : Vector3;
  specular : Vector3;
  type     : Light;

  constructor() {
    this.position = new Vector3();
    this.diffuse  = new Vector3(0.6,0.6,0.6);
    this.specular = new Vector3(0.8,0.8,0.8);
    this.type     = 'directional';
  }
  // struct lightSource
  // {
  //   vec3 position;
  //   vec3 diffuse;
  //   vec3 specular;
  //   float constantAttenuation, linearAttenuation, quadraticAttenuation;
  //   float spotCutoff, spotExponent;
  //   vec3 spotDirection;
  // };
  // lightSource light0 = lightSource(
  //   vec3(0.0, 300.0, 300.0),
  //   vec3(0.6, 0.6, 0.6),
  //   vec3(0.8, 0.8, 0.8),
  //   0.0, 1.0, 0.0,
  //   180.0, 0.0,
  //   vec3(0.0, 0.0, 0.0)
  // );

  public setPosition(vector3:Vector3): void {
    this.position.copy(vector3);
  }

  public setDiffuse(vector3:Vector3): void {
    this.diffuse.copy(vector3);
  }

  public setSpecular(vector3:Vector3): void {
    this.specular.copy(vector3);
  }

  // public getPosition(): Vector3 {
  //   return this.position;
  // }
  //
  // public getDiffuse(): Vector3 {
  //   return this.diffuse;
  // }
  //
  // public getSpecular(): Vector3 {
  //   return this.specular;
  // }

}
