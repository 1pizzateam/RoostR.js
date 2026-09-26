import { Vec3 } from '@1pizzateam/spock';
import { Light } from '../types';


export class DirectionalLight {

  position : Vec3;
  diffuse  : Vec3;
  specular : Vec3;
  type     : Light;

  constructor() {
    this.position = new Vec3();
    this.diffuse  = new Vec3(0.6, 0.6, 0.6);
    this.specular = new Vec3(0.8, 0.8, 0.8);
    this.type     = 'directional';
  }

  public setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.position.copy(xOrVec);
    } else {
      this.position.setScalar(xOrVec, y, z);
    }
  }

  public setDiffuse(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.diffuse.copy(xOrVec);
    } else {
      this.diffuse.setScalar(xOrVec, y, z);
    }
  }

  public setSpecular(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.specular.copy(xOrVec);
    } else {
      this.specular.setScalar(xOrVec, y, z);
    }
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
