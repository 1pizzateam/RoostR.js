import { Vec3 } from '@1pizzateam/spock';
import { PointLight, type IPointLightOptions } from './point';

export interface ISpotLightOptions extends IPointLightOptions {
  direction?: Vec3;
  cutoff?: number;
  exponent?: number;
}

export class SpotLight extends PointLight {

  cutoff : number;
  exponent : number;
  direction : Vec3;

  constructor(positionOrOptions?: Vec3 | ISpotLightOptions) {
    super(positionOrOptions);

    this.cutoff = 180;
    this.exponent = 0;
    this.direction = new Vec3(1.0, 0.0, 0.0);
    this.type = 'spot';

    if (positionOrOptions && !(positionOrOptions instanceof Vec3)) {
      if (positionOrOptions.direction) this.setDirection(positionOrOptions.direction);
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

  public setDirection(direction: Vec3): void {
    this.direction.copy(direction);
  }

}
