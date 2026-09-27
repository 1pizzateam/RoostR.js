
import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { AmbientLight } from '../lights/ambient';
import { IFlatLights } from '../interfaces';

export type AnyLight = DirectionalLight | PointLight | SpotLight | AmbientLight;

export class Lights {

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
    switch (light.type) {
      case 'directional': {
        const idx = this.directionals.indexOf(light as DirectionalLight);
        if (idx !== -1) {
          this.directionals.splice(idx, 1);
          this.nbDirectionals--;
          return true;
        }
        return false;
      }
      case 'point': {
        const idx = this.points.indexOf(light as PointLight);
        if (idx !== -1) {
          this.points.splice(idx, 1);
          this.nbPoints--;
          return true;
        }
        return false;
      }
      case 'spot': {
        const idx = this.spots.indexOf(light as SpotLight);
        if (idx !== -1) {
          this.spots.splice(idx, 1);
          this.nbSpots--;
          return true;
        }
        return false;
      }
      case 'ambient': {
        const idx = this.ambients.indexOf(light as AmbientLight);
        if (idx !== -1) {
          this.ambients.splice(idx, 1);
          this.nbAmbients--;
          return true;
        }
        return false;
      }
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

  public flatten(): IFlatLights {
    this.ClearFlatArrays();

    // 1. Spots
    for (let i = 0; i < this.nbSpots; i++) {
      const s = this.spots[i];
      this.flatArrays.position.push(s.position.x, s.position.y, s.position.z);
      this.flatArrays.diffuse.push(s.diffuse.x, s.diffuse.y, s.diffuse.z);
      this.flatArrays.specular.push(s.specular.x, s.specular.y, s.specular.z);
      this.flatArrays.constantAttenuation.push(s.constantAttenuation);
      this.flatArrays.linearAttenuation.push(s.linearAttenuation);
      this.flatArrays.quadraticAttenuation.push(s.quadraticAttenuation);
      this.flatArrays.cutoff.push(s.cutoff);
      this.flatArrays.exponent.push(s.exponent);
      this.flatArrays.direction.push(s.direction.x, s.direction.y, s.direction.z);
      this.flatArrays.type.push('spot');
    }

    // 2. Points
    for (let i = 0; i < this.nbPoints; i++) {
      const p = this.points[i];
      this.flatArrays.position.push(p.position.x, p.position.y, p.position.z);
      this.flatArrays.diffuse.push(p.diffuse.x, p.diffuse.y, p.diffuse.z);
      this.flatArrays.specular.push(p.specular.x, p.specular.y, p.specular.z);
      this.flatArrays.constantAttenuation.push(p.constantAttenuation);
      this.flatArrays.linearAttenuation.push(p.linearAttenuation);
      this.flatArrays.quadraticAttenuation.push(p.quadraticAttenuation);
      this.flatArrays.cutoff.push(0);
      this.flatArrays.exponent.push(0);
      this.flatArrays.direction.push(0, 0, 0);
      this.flatArrays.type.push('point');
    }

    // 3. Directionals
    for (let i = 0; i < this.nbDirectionals; i++) {
      const d = this.directionals[i];
      this.flatArrays.position.push(d.position.x, d.position.y, d.position.z);
      this.flatArrays.diffuse.push(d.diffuse.x, d.diffuse.y, d.diffuse.z);
      this.flatArrays.specular.push(d.specular.x, d.specular.y, d.specular.z);
      this.flatArrays.constantAttenuation.push(1);
      this.flatArrays.linearAttenuation.push(0);
      this.flatArrays.quadraticAttenuation.push(0);
      this.flatArrays.cutoff.push(0);
      this.flatArrays.exponent.push(0);
      this.flatArrays.direction.push(d.direction.x, d.direction.y, d.direction.z);
      this.flatArrays.type.push('directional');
    }

    // Compute total ambient light
    let ambR = 0, ambG = 0, ambB = 0;
    for (let ambient of this.ambients) {
      ambR += ambient.diffuse.x * ambient.intensity;
      ambG += ambient.diffuse.y * ambient.intensity;
      ambB += ambient.diffuse.z * ambient.intensity;
    }
    this.flatArrays.ambient = [ambR, ambG, ambB];

    // Build cached Float32Arrays for zero-allocation rendering per mesh
    this.flatArrays.floatPosition = new Float32Array(this.flatArrays.position);
    this.flatArrays.floatDiffuse = new Float32Array(this.flatArrays.diffuse);
    this.flatArrays.floatSpecular = new Float32Array(this.flatArrays.specular);
    this.flatArrays.floatDirection = new Float32Array(this.flatArrays.direction);
    this.flatArrays.floatCutoff = new Float32Array(this.flatArrays.cutoff);
    this.flatArrays.floatExponent = new Float32Array(this.flatArrays.exponent);
    this.flatArrays.floatType = new Float32Array(this.flatArrays.type.map(t => t === 'directional' ? 0 : t === 'point' ? 1 : 2));

    const att = new Float32Array(this.flatArrays.constantAttenuation.length * 3);
    for (let k = 0; k < this.flatArrays.constantAttenuation.length; k++) {
      att[k * 3] = this.flatArrays.constantAttenuation[k];
      att[k * 3 + 1] = this.flatArrays.linearAttenuation[k];
      att[k * 3 + 2] = this.flatArrays.quadraticAttenuation[k];
    }
    this.flatArrays.floatAttenuation = att;
    this.flatArrays.floatAmbient = new Float32Array(this.flatArrays.ambient);

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
    if(this.flatArrays.hasOwnProperty(property)){
      return this.flatArrays[property];
    }
    return undefined;
  }

}
