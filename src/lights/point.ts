
import { DirectionalLight } from './directional';

export class PointLight extends DirectionalLight {

  constantAttenuation  : number;
  linearAttenuation    : number;
  quadraticAttenuation : number;

  constructor() {
    super();
    this.constantAttenuation = 0;
    this.linearAttenuation = 1.0;
    this.quadraticAttenuation = 0;
    this.type = 'point';
  }

  // public setPosition(x,y,z){
  //   this.directionalLight.setPosition(x,y,z);
  // }
  //
  // public setDiffuse(x,y,z){
  //   this.directionalLight.setDiffuse(x,y,z);
  // }
  //
  // public setSpecular(x,y,z){
  //   this.directionalLight.setSpecular(x,y,z);
  // }

  public setConstantAttenuation(){

  }

  public setLinearAttenuation(){

  }

  public setQuadraticAttenuation(){

  }

  // getPosition(){
  //   return this.DirectionalLight.getPosition();
  // }
  //
  // public getDiffuse(){
  //   return this.DirectionalLight.getDiffuse();
  // }
  //
  // public getSpecular(){
  //   return this.DirectionalLight.getSpecular();
  // }

  // public getConstantAttenuation(): number {
  //   return this.constantAttenuation;
  // }
  //
  // public getLinearAttenuation(): number {
  //   return this.linearAttenuation;
  // }
  //
  // public getQuadraticAttenuation(): number {
  //   return this.quadraticAttenuation;
  // }

}
