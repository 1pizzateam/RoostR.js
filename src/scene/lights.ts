
import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { IFlatLights } from '../interfaces';

export class Lights {

  directionals : DirectionalLight[];
  points : PointLight[];
  spots : SpotLight[];
  nbDirectionals : number;
  nbPoints : number;
  nbSpots : number;
  flatArrays : IFlatLights;
  types : string[];
  nbTypes : number;

  constructor(){
    this.directionals = [];
    this.points = [];
    this.spots = [];
    this.nbDirectionals = 0;
    this.nbPoints = 0;
    this.nbSpots = 0;
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
      type : []
    };
    this.types = ['spots', 'points', 'directionals'];
    this.nbTypes = 3;
  }

  private ucfirst(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public addLight(light:DirectionalLight | PointLight | SpotLight): void {
    let type = light.type;
    this[type + 's'].push(light);
    this['nb' + this.ucfirst(type) + 's']++;
  }

  private ClearFlatArrays(): void {
    for (var property in this.flatArrays){
      if (this.flatArrays.hasOwnProperty(property)){
        this.flatArrays[property].length = 0;
      }
    }
  }

  public flatten(): IFlatLights {
    this.ClearFlatArrays();
    for (var i = 0 ; i < this.nbTypes ; i++) {
      var type = this.types[i];
      for (var j = 0 ; j < this['nb' + this.ucfirst(type)] ; j++) {
        for (var property in this.flatArrays) {
          if (this[type][j].hasOwnProperty(property) && this.flatArrays.hasOwnProperty(property)){
            var lightProperty = this[type][j][property];
            var flatArraysProperty = this.flatArrays[property];
            if(typeof lightProperty.toArray === 'function'){//vector
              flatArraysProperty.push.apply(flatArraysProperty, lightProperty.toArray());
            }else{//floats, integers, strings
              flatArraysProperty.push(lightProperty);
            }
          }
        }
      }
    }
    return this.flatArrays;
  }

  public getFlatArray(property: string) {
    if(this.flatArrays.hasOwnProperty(property)){
      return this.flatArrays[property];
    }
  }

}
