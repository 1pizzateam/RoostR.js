
import { SceneRenderer }  from '../renderer/scene';
import { SceneGraph } from './sceneGraph';
import { Mesh } from '../mesh';
import { Lights } from './lights';
import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { Camera } from '../cameras/camera';
import { Time } from '@1pizzateam/spock';


export class Scene {
  public  meshes   : Mesh[];
  public  nbMeshes : number;
  public  lights   : Lights;
  private context  : WebGLRenderingContext;
  private renderer : SceneRenderer;
  private graph    : SceneGraph;

  constructor(context:WebGLRenderingContext){
    this.meshes = [];
    this.nbMeshes = 0;
    this.lights = new Lights();
    this.context = context;
    this.renderer = new SceneRenderer(this.context);
    this.graph = new SceneGraph();
  }

  public addMesh( mesh: Mesh ): void {
    if (this.meshes.indexOf(mesh) === -1) {
      this.meshes.push(mesh);
      this.nbMeshes++;
    }
  }

  public removeMesh( mesh: Mesh ): boolean {
    const index = this.meshes.indexOf(mesh);
    if (index !== -1) {
      this.meshes.splice(index, 1);
      this.nbMeshes--;
      return true;
    }
    return false;
  }

  public addLight( light: DirectionalLight | PointLight | SpotLight ): void {
    this.lights.addLight(light);
    //this.lights.push(light);
    //this.nbLights++;
  }

  public removeLight( light: DirectionalLight | PointLight | SpotLight ): boolean {
    return this.lights.removeLight(light);
  }

  public clearMeshes(): void {
    this.meshes = [];
    this.nbMeshes = 0;
  }

  public clearLights(): void {
    this.lights.clear();
  }

  public getLightsProperty (property: string): (number | string)[] | undefined {
    return this.lights.getFlatArray(property);
  }

  public enableBlendMode (equation:string, source:string, destination:string): void{
    this.renderer.enableBlendMode(equation, source, destination);
  }

  public disableBlendMode (): void {
    this.renderer.disableBlendMode();
  }

  public getRendererBlendMode (): GLenum|Float32Array|GLint|WebGLBuffer|GLboolean|GLboolean[]|GLfloat|WebGLFramebuffer|Int32Array|GLuint|WebGLTexture {
    return this.renderer.getParameter(this.context.BLEND);
  }

  public render (camera: Camera, time: number = Time.now()): void {

    this.computeWorldMatrices();
    const flatLights = this.lights.flatten();
    //this.order();
    //if (this.getRendererBlendMode()){
      this.disableBlendMode();
    //}
    for (let mesh of this.meshes) {
      //if (!this.meshes[i].blendMode) {
        mesh.render(  camera.getProjectionMatrix(),
                      camera.getViewMatrix(),
                      flatLights,
                      time,
                      false
                    );
      //}
    }

    this.renderBlended(camera, time, flatLights);
  }

  private computeWorldMatrices(): void {
    for (let mesh of this.meshes) {
      mesh.computeWorldMatrix( this.graph );
    }
  }

  private renderBlended (camera: Camera, time: number, flatLights: any): void {
    this.enableBlendMode('FUNC_ADD', 'SRC_ALPHA', 'ONE');
    for (let mesh of this.meshes) {
      //if (this.meshes[i].blendMode) {
        mesh.render(  camera.getProjectionMatrix(),
                      camera.getViewMatrix(),
                      flatLights,
                      time,
                      true
                    );
      //}
    }
  }

}







  // order (){
  //   var z = -999999;
  //   for (var i = 0 ; i < this.nbMeshes ; i++) {
  //     if(this.meshes[i].worldMatrix.m[14] > z){
  //
  //     }
  //   }
  // }
