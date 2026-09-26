import { Vec3 } from '@1pizzateam/spock';

import { Uniform } from './uniform';
import { IMaterialUniforms } from './interfaces';

export class Material {

  ambient   : Vec3;
  diffuse   : Vec3;
  specular  : Vec3;
  shininess : number;

  uniforms : IMaterialUniforms;

  constructor(){
    this.ambient   = new Vec3(0.5, 0.5, 0.5);
    this.diffuse   = new Vec3(0.6, 0.6, 0.6);
    this.specular  = new Vec3(0.8, 0.8, 0.8);
    this.shininess = 8.0;

    this.uniforms = {
      materialAmbient : new Uniform('uniform3fv', this.ambient.toArray()),
      materialDiffuse : new Uniform('uniform3fv', this.diffuse.toArray()),
      materialSpecular : new Uniform('uniform3fv', this.specular.toArray()),
      materialShininess : new Uniform('uniform1f', this.shininess)
    };

  }

  public setAmbient(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.ambient.copy(xOrVec);
    } else {
      this.ambient.setScalar(xOrVec, y, z);
    }
    this.uniforms.materialAmbient.value = this.ambient.toArray();
  }

  public setDiffuse(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.diffuse.copy(xOrVec);
    } else {
      this.diffuse.setScalar(xOrVec, y, z);
    }
    this.uniforms.materialDiffuse.value = this.diffuse.toArray();
  }

  public setSpecular(xOrVec: Vec3 | number, y?: number, z?: number): void {
    if (xOrVec instanceof Vec3) {
      this.specular.copy(xOrVec);
    } else {
      this.specular.setScalar(xOrVec, y, z);
    }
    this.uniforms.materialSpecular.value = this.specular.toArray();
  }

  public setShininess(shininess: number): void {
    this.shininess = shininess;
    this.uniforms.materialShininess.value = this.shininess;
  }

  public updateUniforms(): void {
    this.uniforms.materialAmbient.value = this.ambient.toArray();
    this.uniforms.materialDiffuse.value = this.diffuse.toArray();
    this.uniforms.materialSpecular.value = this.specular.toArray();
    this.uniforms.materialShininess.value = this.shininess;
  }

}
