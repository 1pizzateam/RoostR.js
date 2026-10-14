import { Vec3 } from '@1pizzateam/spock';

import { Uniform } from './uniform';
import type { IMaterialUniforms } from './interfaces';

export interface IMaterialOptions {
  ambient?: Vec3;
  diffuse?: Vec3;
  specular?: Vec3;
  shininess?: number;
}

export class Material {

  ambient   : Vec3;
  diffuse   : Vec3;
  specular  : Vec3;
  shininess : number;

  uniforms : IMaterialUniforms;

  // Incremented whenever a uniform value changes so renderers can skip redundant uploads.
  version : number = 0;

  constructor(options?: IMaterialOptions){
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

    if (options) {
      if (options.ambient) this.setAmbient(options.ambient);
      if (options.diffuse) this.setDiffuse(options.diffuse);
      if (options.specular) this.setSpecular(options.specular);
      if (options.shininess !== undefined) this.setShininess(options.shininess);
    }
  }

  public setAmbient(ambient: Vec3): void {
    this.ambient.copy(ambient).toArray(this.uniforms.materialAmbient.value as number[]);
    this.version++;
  }

  public setDiffuse(diffuse: Vec3): void {
    this.diffuse.copy(diffuse).toArray(this.uniforms.materialDiffuse.value as number[]);
    this.version++;
  }

  public setSpecular(specular: Vec3): void {
    this.specular.copy(specular).toArray(this.uniforms.materialSpecular.value as number[]);
    this.version++;
  }

  public setShininess(shininess: number): void {
    this.shininess = shininess;
    this.uniforms.materialShininess.value = this.shininess;
    this.version++;
  }

  // Refreshes the uniform values in place from the (possibly mutated) vectors.
  // Returns true if any value changed since the previous call.
  public updateUniforms(): boolean {
    let changed = this.sync(this.ambient, this.uniforms.materialAmbient);
    changed = this.sync(this.diffuse, this.uniforms.materialDiffuse) || changed;
    changed = this.sync(this.specular, this.uniforms.materialSpecular) || changed;
    if (this.uniforms.materialShininess.value !== this.shininess) {
      this.uniforms.materialShininess.value = this.shininess;
      changed = true;
    }
    if (changed)
      this.version++;
    return changed;
  }

  private sync(vector: Vec3, uniform: Uniform): boolean {
    const value = uniform.value as number[];
    if (value[0] === vector.x && value[1] === vector.y && value[2] === vector.z)
      return false;
    vector.toArray(value);
    return true;
  }

}
