import { Vec3 } from '@1pizzateam/spock';
import type { Light } from '../types';

export interface IDirectionalLightOptions {
  direction?: Vec3;
  diffuse?: Vec3;
  specular?: Vec3;
  position?: Vec3;
}

export class DirectionalLight {

  position : Vec3;
  diffuse  : Vec3;
  specular : Vec3;
  direction: Vec3;
  type     : Light;

  constructor(directionOrOptions?: Vec3 | IDirectionalLightOptions) {
    this.position  = new Vec3();
    this.direction = new Vec3(0, -1, 0);
    this.diffuse   = new Vec3(0.6, 0.6, 0.6);
    this.specular  = new Vec3(0.8, 0.8, 0.8);
    this.type      = 'directional';

    if (directionOrOptions)
      if (directionOrOptions instanceof Vec3)
        this.setDirection(directionOrOptions);
      else {
        if (directionOrOptions.direction) this.setDirection(directionOrOptions.direction);
        if (directionOrOptions.diffuse) this.setDiffuse(directionOrOptions.diffuse);
        if (directionOrOptions.specular) this.setSpecular(directionOrOptions.specular);
        if (directionOrOptions.position) this.setPosition(directionOrOptions.position);
      }
  }

  public setPosition(position: Vec3): void {
    this.position.copy(position);
  }

  public setDirection(direction: Vec3): void {
    this.direction.copy(direction).normalize();
  }

  public setDiffuse(diffuse: Vec3): void {
    this.diffuse.copy(diffuse);
  }

  public setSpecular(specular: Vec3): void {
    this.specular.copy(specular);
  }

}
