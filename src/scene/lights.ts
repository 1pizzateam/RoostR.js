
import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { AmbientLight } from '../lights/ambient';
import { IFlatLights } from '../interfaces';
import { Vec3 } from '@1pizzateam/spock';

export type AnyLight = DirectionalLight | PointLight | SpotLight | AmbientLight;

export const MAX_LIGHTS = 8;

export class Lights {

  private static _ambient = new Vec3();
  private warnedOverflow = false;

  directionals : DirectionalLight[];
  points : PointLight[];
  spots : SpotLight[];
  ambients : AmbientLight[];
  nbDirectionals : number;
  nbPoints : number;
  nbSpots : number;
  nbAmbients : number;
  flatArrays : IFlatLights;

  constructor(){
    this.directionals = [];
    this.points = [];
    this.spots = [];
    this.ambients = [];
    this.nbDirectionals = 0;
    this.nbPoints = 0;
    this.nbSpots = 0;
    this.nbAmbients = 0;
    this.flatArrays = {
      position : [],
      diffuse : [],
      specular : [],
      constantAttenuation : [],
      linearAttenuation : [],
      quadraticAttenuation : [],
      cutoff : [],
      exponent : [],
      direction : [],
      type : [],
      ambient : [0, 0, 0]
    };
  }

  public addLight(light: AnyLight): void {
    switch (light.type) {
      case 'directional':
        this.directionals.push(light as DirectionalLight);
        this.nbDirectionals++;
        break;
      case 'point':
        this.points.push(light as PointLight);
        this.nbPoints++;
        break;
      case 'spot':
        this.spots.push(light as SpotLight);
        this.nbSpots++;
        break;
      case 'ambient':
        this.ambients.push(light as AmbientLight);
        this.nbAmbients++;
        break;
    }
  }

  public removeLight(light: AnyLight): boolean {
    let idx: number;
    switch (light.type) {
      case 'directional':
        idx = this.directionals.indexOf(light as DirectionalLight);
        if (idx !== -1) {
          this.directionals.splice(idx, 1);
          this.nbDirectionals--;
          return true;
        }
        return false;
      case 'point':
        idx = this.points.indexOf(light as PointLight);
        if (idx !== -1) {
          this.points.splice(idx, 1);
          this.nbPoints--;
          return true;
        }
        return false;
      case 'spot':
        idx = this.spots.indexOf(light as SpotLight);
        if (idx !== -1) {
          this.spots.splice(idx, 1);
          this.nbSpots--;
          return true;
        }
        return false;
      case 'ambient':
        idx = this.ambients.indexOf(light as AmbientLight);
        if (idx !== -1) {
          this.ambients.splice(idx, 1);
          this.nbAmbients--;
          return true;
        }
        return false;
      default:
        return false;
    }
  }

  private ClearFlatArrays(): void {
    this.flatArrays.position.length = 0;
    this.flatArrays.diffuse.length = 0;
    this.flatArrays.specular.length = 0;
    this.flatArrays.constantAttenuation.length = 0;
    this.flatArrays.linearAttenuation.length = 0;
    this.flatArrays.quadraticAttenuation.length = 0;
    this.flatArrays.cutoff.length = 0;
    this.flatArrays.exponent.length = 0;
    this.flatArrays.direction.length = 0;
    this.flatArrays.type.length = 0;
  }

  // Float32Arrays are reused while the light count stays the same.
  private ensureBuffers(count: number): void {
    const f = this.flatArrays;
    if (f.floatPosition && f.floatPosition.length === count * 3)
      return;
    f.floatPosition = new Float32Array(count * 3);
    f.floatDiffuse = new Float32Array(count * 3);
    f.floatSpecular = new Float32Array(count * 3);
    f.floatDirection = new Float32Array(count * 3);
    f.floatAttenuation = new Float32Array(count * 3);
    f.floatCutoff = new Float32Array(count);
    f.floatExponent = new Float32Array(count);
    f.floatType = new Float32Array(count);
    // vec4 layouts for the built-in Phong shader: (position, type), (diffuse, cutoff), (specular, exponent)
    f.packedPosition = new Float32Array(count * 4);
    f.packedDiffuse = new Float32Array(count * 4);
    f.packedSpecular = new Float32Array(count * 4);
  }

  private push(
    index: number,
    kind: 'spot' | 'point' | 'directional',
    light: DirectionalLight | PointLight | SpotLight
  ): void {
    const f = this.flatArrays;
    const o = index * 3;
    const isSpot = kind === 'spot';
    const isDirectional = kind === 'directional';
    const att = isDirectional ? null : light as PointLight;

    light.position.toArray(f.floatPosition!, o);
    light.diffuse.toArray(f.floatDiffuse!, o);
    light.specular.toArray(f.floatSpecular!, o);
    if (isDirectional)
      light.direction.toArray(f.floatDirection!, o);
    else if (isSpot)
      (light as SpotLight).direction.toArray(f.floatDirection!, o);
    else
      f.floatDirection!.fill(0, o, o + 3);

    const constant = att ? att.constantAttenuation : 1;
    const linear = att ? att.linearAttenuation : 0;
    const quadratic = att ? att.quadraticAttenuation : 0;
    f.floatAttenuation![o] = constant;
    f.floatAttenuation![o + 1] = linear;
    f.floatAttenuation![o + 2] = quadratic;
    f.floatCutoff![index] = isSpot ? (light as SpotLight).cutoff : 0;
    f.floatExponent![index] = isSpot ? (light as SpotLight).exponent : 0;
    f.floatType![index] = isDirectional ? 0 : isSpot ? 2 : 1;

    const q = index * 4;
    light.position.toArray(f.packedPosition!, q);
    f.packedPosition![q + 3] = f.floatType![index];
    light.diffuse.toArray(f.packedDiffuse!, q);
    f.packedDiffuse![q + 3] = f.floatCutoff![index];
    light.specular.toArray(f.packedSpecular!, q);
    f.packedSpecular![q + 3] = f.floatExponent![index];

    const dir = isDirectional || isSpot ? (light as SpotLight).direction : null;
    f.position.push(light.position.x, light.position.y, light.position.z);
    f.diffuse.push(light.diffuse.x, light.diffuse.y, light.diffuse.z);
    f.specular.push(light.specular.x, light.specular.y, light.specular.z);
    if (dir)
      f.direction.push(dir.x, dir.y, dir.z);
    else
      f.direction.push(0, 0, 0);
    f.constantAttenuation.push(constant);
    f.linearAttenuation.push(linear);
    f.quadraticAttenuation.push(quadratic);
    f.cutoff.push(isSpot ? (light as SpotLight).cutoff : 0);
    f.exponent.push(isSpot ? (light as SpotLight).exponent : 0);
    f.type.push(kind);
  }

  // Flattens every light into the shared arrays. extraAmbient (e.g. the scene ambient color)
  // is added to the summed ambient lights before the uniform buffer is built.
  public flatten(extraAmbient?: Vec3): IFlatLights {
    this.ClearFlatArrays();

    const total = this.nbSpots + this.nbPoints + this.nbDirectionals;
    const count = Math.min(total, MAX_LIGHTS);
    if (total > MAX_LIGHTS && !this.warnedOverflow) {
      this.warnedOverflow = true;
      console.warn(`Lights: ${total} lights added, only the first ${MAX_LIGHTS} (spots, points, then directionals) are used.`);
    }
    this.ensureBuffers(count);

    let index = 0;
    for (let i = 0; i < this.nbSpots && index < count; i++)
      this.push(index++, 'spot', this.spots[i]);
    for (let i = 0; i < this.nbPoints && index < count; i++)
      this.push(index++, 'point', this.points[i]);
    for (let i = 0; i < this.nbDirectionals && index < count; i++)
      this.push(index++, 'directional', this.directionals[i]);

    const ambient = Lights._ambient.setScalar(0, 0, 0);
    if (extraAmbient)
      ambient.add(extraAmbient);
    for (let i = 0; i < this.nbAmbients; i++)
      ambient.addScaledVector(this.ambients[i].diffuse, this.ambients[i].intensity);

    if (!this.flatArrays.floatAmbient)
      this.flatArrays.floatAmbient = new Float32Array(3);
    ambient.toArray(this.flatArrays.floatAmbient);
    this.flatArrays.ambient = [ambient.x, ambient.y, ambient.z];

    return this.flatArrays;
  }

  public clear(): void {
    this.directionals = [];
    this.points = [];
    this.spots = [];
    this.ambients = [];
    this.nbDirectionals = 0;
    this.nbPoints = 0;
    this.nbSpots = 0;
    this.nbAmbients = 0;
    this.ClearFlatArrays();
  }

  public getFlatArray(property: string): (number | string)[] | undefined {
    if (this.flatArrays.hasOwnProperty(property))
      return this.flatArrays[property];
    return undefined;
  }

}
