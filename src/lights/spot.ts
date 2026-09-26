import { Vec3 } from '@1pizzateam/spock';

import { PointLight } from './point';

export class SpotLight extends PointLight {

  cutoff : number;
  exponent : number;
  direction : Vec3;

  constructor() {
    super();

    this.cutoff = 180;
    this.exponent = 0;
    this.direction = new Vec3(1.0, 0.0, 0.0);
    this.type = 'spot';
  }

  public setCutoff(value: number): void {
    this.cutoff = value;
  }

  public setExponent(value: number): void {
    this.exponent = value;
  }

  public setDirection(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.direction.copy(xOrVec);
    } else {
      this.direction.setScalar(xOrVec, y, z);
    }
  }

  // public getPosition(){
  //   return this.PointLight.getPosition();
  // }

  // public getDiffuse(){
  //   return this.PointLight.getDiffuse();
  // }
  //
  // public getSpecular(){
  //   return this.PointLight.getSpecular();
  // }
  //
  // public getConstantAttenuation(){
  //
  // }
  //
  // public getLinearAttenuation(){
  //
  // }
  //
  // public getQuadraticAttenuation(){
  //
  // }

  // public getCutoff(): number {
  //   return this.cutoff;
  // }
  //
  // public getExponent(): number {
  //   return this.exponent;
  // }
  //
  // public getDirection(): Vector3 {
  //   return this.direction;
  // }

}
