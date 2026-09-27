import { Vec3 } from '@1pizzateam/spock';
import { DirectionalLight } from './directional';

export class PointLight extends DirectionalLight {

  constantAttenuation  : number;
  linearAttenuation    : number;
  quadraticAttenuation : number;

  constructor(positionOrOptions?: Vec3 | number[] | { position?: Vec3 | number[]; diffuse?: Vec3 | number[]; specular?: Vec3 | number[]; constantAttenuation?: number; linearAttenuation?: number; quadraticAttenuation?: number }) {
    super();
    this.constantAttenuation = 0;
    this.linearAttenuation = 1.0;
    this.quadraticAttenuation = 0;
    this.type = 'point';

    if (positionOrOptions) {
      if (positionOrOptions instanceof Vec3 || Array.isArray(positionOrOptions)) {
        this.setPosition(positionOrOptions as any);
      } else if (typeof positionOrOptions === 'object') {
        if (positionOrOptions.position) this.setPosition(positionOrOptions.position as any);
        if (positionOrOptions.diffuse) this.setDiffuse(positionOrOptions.diffuse as any);
        if (positionOrOptions.specular) this.setSpecular(positionOrOptions.specular as any);
        if (positionOrOptions.constantAttenuation !== undefined) this.setConstantAttenuation(positionOrOptions.constantAttenuation);
        if (positionOrOptions.linearAttenuation !== undefined) this.setLinearAttenuation(positionOrOptions.linearAttenuation);
        if (positionOrOptions.quadraticAttenuation !== undefined) this.setQuadraticAttenuation(positionOrOptions.quadraticAttenuation);
      }
    }
  }

  public setConstantAttenuation(value: number): void {
    this.constantAttenuation = value;
  }

  public setLinearAttenuation(value: number): void {
    this.linearAttenuation = value;
  }

  public setQuadraticAttenuation(value: number): void {
    this.quadraticAttenuation = value;
  }

}
