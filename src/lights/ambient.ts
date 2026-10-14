import { Vec3 } from '@1pizzateam/spock';
import { Light } from '../types';

export class AmbientLight {

  diffuse   : Vec3;
  intensity : number;
  type      : Light;

  constructor(diffuse: Vec3 = new Vec3(1.0, 1.0, 1.0), intensity: number = 1.0) {
    this.diffuse = new Vec3().copy(diffuse);
    this.intensity = intensity;
    this.type = 'ambient';
  }

  public setColor(diffuse: Vec3): this {
    this.diffuse.copy(diffuse);
    return this;
  }

  public setIntensity(intensity: number): this {
    this.intensity = intensity;
    return this;
  }

  public getColor(target: Vec3 = new Vec3()): Vec3 {
    return target.copy(this.diffuse);
  }

  public get color(): Vec3 {
    return this.diffuse;
  }

  public set color(c: Vec3) {
    this.diffuse.copy(c);
  }

}
