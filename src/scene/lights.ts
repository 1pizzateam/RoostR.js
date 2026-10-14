import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { AmbientLight } from '../lights/ambient';
import { IFlatLights } from '../interfaces';
import { Vec3 } from '@1pizzateam/spock';
import { packLights, clearFlatArrays } from './lightPacking';

export type AnyLight = DirectionalLight | PointLight | SpotLight | AmbientLight;

export const MAX_LIGHTS = 8;

export class Lights {

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

  // Flattens every light into the shared arrays. extraAmbient (e.g. the scene ambient color)
  // is added to the summed ambient lights before the uniform buffer is built.
  public flatten(extraAmbient?: Vec3): IFlatLights {
    const total = this.nbSpots + this.nbPoints + this.nbDirectionals;
    if (total > MAX_LIGHTS && !this.warnedOverflow) {
      this.warnedOverflow = true;
      console.warn(`Lights: ${total} lights added, only the first ${MAX_LIGHTS} (spots, points, then directionals) are used.`);
    }

    return packLights(
      this.directionals,
      this.points,
      this.spots,
      this.ambients,
      this.flatArrays,
      MAX_LIGHTS,
      extraAmbient
    );
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
    clearFlatArrays(this.flatArrays);
  }

  public getFlatArray(property: string): (number | string)[] | undefined {
    if (this.flatArrays.hasOwnProperty(property))
      return this.flatArrays[property];
    return undefined;
  }

}
