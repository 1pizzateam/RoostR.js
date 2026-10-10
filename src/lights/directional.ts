import { Vec3 } from '@1pizzateam/spock';
import { Light } from '../types';
import { assignVec3, Vec3Like } from '../vector';


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

    if (directionOrOptions)
      if (directionOrOptions instanceof Vec3 || Array.isArray(directionOrOptions))
        this.setDirection(directionOrOptions);
      else if (typeof directionOrOptions === 'object') {
        if (directionOrOptions.direction) this.setDirection(directionOrOptions.direction);
        if (directionOrOptions.diffuse) this.setDiffuse(directionOrOptions.diffuse);
        if (directionOrOptions.specular) this.setSpecular(directionOrOptions.specular);
        if (directionOrOptions.position) this.setPosition(directionOrOptions.position);
      }
  }

  public setPosition(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.position, xOrVec, y, z);
  }

  public setDirection(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.direction, xOrVec, y, z).normalize();
  }

  public setDiffuse(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.diffuse, xOrVec, y, z);
  }

  public setSpecular(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.specular, xOrVec, y, z);
  }

}
