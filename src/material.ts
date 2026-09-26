import {Vector3} from '@lcluber/type6js';

import { Uniform } from './uniform';
import { IMaterialUniforms } from './interfaces';

export class Material {

  ambient   : Vector3;
  diffuse   : Vector3;
  specular  : Vector3;
  shininess : number;

  uniforms : IMaterialUniforms;

  constructor(){
    this.ambient   = new Vector3(0.5, 0.5, 0.5);
    this.diffuse   = new Vector3(0.6, 0.6, 0.6);
    this.specular  = new Vector3(0.8, 0.8, 0.8);
    this.shininess = 8.0;

    this.uniforms = {
      materialAmbient : new Uniform('uniform3fv', this.ambient.toArray()),
      materialDiffuse : new Uniform('uniform3fv', this.diffuse.toArray()),
      materialSpecular : new Uniform('uniform3fv', this.specular.toArray()),
      materialShininess : new Uniform('uniform1f', this.shininess)
    };

  }

  public setAmbient(vector3: Vector3): void {
    this.ambient.copy(vector3);
    this.uniforms.materialAmbient.value = this.ambient.toArray();
  }

  public setDiffuse(vector3: Vector3): void {
    this.diffuse.copy(vector3);
    this.uniforms.materialDiffuse.value = this.diffuse.toArray();
  }

  public setSpecular(vector3: Vector3): void {
    this.specular.copy(vector3);
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
