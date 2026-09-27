import { Vec3 } from '@1pizzateam/spock';

import { PointLight } from './point';

export class SpotLight extends PointLight {

  cutoff : number;
  exponent : number;
  direction : Vec3;

  constructor(positionOrOptions?: Vec3 | number[] | { position?: Vec3 | number[]; direction?: Vec3 | number[]; diffuse?: Vec3 | number[]; specular?: Vec3 | number[]; cutoff?: number; exponent?: number; constantAttenuation?: number; linearAttenuation?: number; quadraticAttenuation?: number }) {
    super(positionOrOptions as any);

    this.cutoff = 180;
    this.exponent = 0;
    this.direction = new Vec3(1.0, 0.0, 0.0);
    this.type = 'spot';

    if (positionOrOptions && typeof positionOrOptions === 'object' && !(positionOrOptions instanceof Vec3) && !Array.isArray(positionOrOptions)) {
      if (positionOrOptions.direction) this.setDirection(positionOrOptions.direction as any);
      if (positionOrOptions.cutoff !== undefined) this.setCutoff(positionOrOptions.cutoff);
      if (positionOrOptions.exponent !== undefined) this.setExponent(positionOrOptions.exponent);
    }
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

}
