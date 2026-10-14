import { Vec3 } from '@1pizzateam/spock';
import { DirectionalLight } from './directional';

export interface IPointLightOptions {
  position?: Vec3;
  diffuse?: Vec3;
  specular?: Vec3;
  constantAttenuation?: number;
  linearAttenuation?: number;
  quadraticAttenuation?: number;
}

export class PointLight extends DirectionalLight {

  constantAttenuation  : number;
  linearAttenuation    : number;
  quadraticAttenuation : number;

  constructor(positionOrOptions?: Vec3 | IPointLightOptions) {
    super();
    this.constantAttenuation = 0;
    this.linearAttenuation = 1.0;
    this.quadraticAttenuation = 0;
    this.type = 'point';

    if (positionOrOptions)
      if (positionOrOptions instanceof Vec3)
        this.setPosition(positionOrOptions);
      else {
        if (positionOrOptions.position) this.setPosition(positionOrOptions.position);
        if (positionOrOptions.diffuse) this.setDiffuse(positionOrOptions.diffuse);
        if (positionOrOptions.specular) this.setSpecular(positionOrOptions.specular);
        if (positionOrOptions.constantAttenuation !== undefined) this.setConstantAttenuation(positionOrOptions.constantAttenuation);
        if (positionOrOptions.linearAttenuation !== undefined) this.setLinearAttenuation(positionOrOptions.linearAttenuation);
        if (positionOrOptions.quadraticAttenuation !== undefined) this.setQuadraticAttenuation(positionOrOptions.quadraticAttenuation);
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
