import { Vec3 } from '@1pizzateam/spock';
import { Light } from '../types';
import { assignVec3, Vec3Like } from '../vector';

export class AmbientLight {

  diffuse   : Vec3;
  intensity : number;
  type      : Light;

  constructor(rOrVec: Vec3 | number = 1.0, g: number = 1.0, b: number = 1.0, intensity: number = 1.0) {
    this.diffuse = new Vec3();
    if (rOrVec instanceof Vec3) {
      this.diffuse.copy(rOrVec);
      this.intensity = g !== undefined ? g : 1.0;
    } else {
      this.diffuse.setScalar(rOrVec, g, b);
      this.intensity = intensity;
    }
    this.type = 'ambient';
  }

  public setColor(xOrVec: Vec3Like | number, y?: number, z?: number): this {
    if (typeof xOrVec === 'number')
      this.diffuse.setScalar(xOrVec, y ?? 0, z ?? 0);
    else
      assignVec3(this.diffuse, xOrVec);
    return this;
  }

  public setIntensity(intensity: number): this {
    this.intensity = intensity;
    return this;
  }

  public getColor(): Vec3 {
    return this.diffuse;
  }

  public get color(): Vec3 {
    return this.diffuse;
  }

  public set color(c: Vec3) {
    this.diffuse.copy(c);
  }

}
