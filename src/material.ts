import { Vec3 } from '@1pizzateam/spock';

import { Uniform } from './uniform';
import { IMaterialUniforms } from './interfaces';
import { assignVec3, Vec3Like } from './vector';

export interface IMaterialOptions {
  ambient?: Vec3Like;
  diffuse?: Vec3Like;
  specular?: Vec3Like;
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

  public setAmbient(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.ambient, xOrVec, y, z).toArray(this.uniforms.materialAmbient.value as number[]);
    this.version++;
  }

  public setDiffuse(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.diffuse, xOrVec, y, z).toArray(this.uniforms.materialDiffuse.value as number[]);
    this.version++;
  }

  public setSpecular(xOrVec: Vec3Like | number, y?: number, z?: number): void {
    assignVec3(this.specular, xOrVec, y, z).toArray(this.uniforms.materialSpecular.value as number[]);
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
