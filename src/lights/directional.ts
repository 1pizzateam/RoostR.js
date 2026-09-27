import { Vec3 } from '@1pizzateam/spock';
import { Light } from '../types';


export class DirectionalLight {

  position : Vec3;
  diffuse  : Vec3;
  specular : Vec3;
  direction: Vec3;
  type     : Light;

  constructor(directionOrOptions?: Vec3 | number[] | { direction?: Vec3 | number[]; diffuse?: Vec3 | number[]; specular?: Vec3 | number[]; position?: Vec3 | number[] }) {
    this.position  = new Vec3();
    this.direction = new Vec3(0, -1, 0);
    this.diffuse   = new Vec3(0.6, 0.6, 0.6);
    this.specular  = new Vec3(0.8, 0.8, 0.8);
    this.type      = 'directional';

    if (directionOrOptions) {
      if (directionOrOptions instanceof Vec3 || Array.isArray(directionOrOptions)) {
        this.setDirection(directionOrOptions as any);
      } else if (typeof directionOrOptions === 'object') {
        if (directionOrOptions.direction) this.setDirection(directionOrOptions.direction as any);
        if (directionOrOptions.diffuse) this.setDiffuse(directionOrOptions.diffuse as any);
        if (directionOrOptions.specular) this.setSpecular(directionOrOptions.specular as any);
        if (directionOrOptions.position) this.setPosition(directionOrOptions.position as any);
      }
    }
  }

  public setPosition(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.position.copy(xOrVec);
    } else {
      this.position.setScalar(xOrVec, y, z);
    }
  }

  public setDirection(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.direction.copy(xOrVec).normalize();
    } else {
      this.direction.setScalar(xOrVec, y, z).normalize();
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

}
