
import { SceneRenderer }  from '../renderer/scene';
import { SceneGraph } from './sceneGraph';
import { Mesh } from '../mesh';
import { Lights } from './lights';
import { DirectionalLight } from '../lights/directional';
import { PointLight } from '../lights/point';
import { SpotLight } from '../lights/spot';
import { Camera } from '../cameras/camera';


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
    this.meshes.push(mesh);
    this.nbMeshes++;
  }

  public addLight( light: DirectionalLight | PointLight | SpotLight ): void {
    this.lights.addLight(light);
    //this.lights.push(light);
    //this.nbLights++;
  }

  public clearMeshes(): void {
    this.meshes = [];
    this.nbMeshes = 0;
  }

  public getLightsProperty (property: string): number[] {
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

  public render (camera: Camera, time: number): void {

    this.computeWorldMatrices();
    this.lights.flatten();
    //this.order();
    //if (this.getRendererBlendMode()){
      this.disableBlendMode();
    //}
    for (let mesh of this.meshes) {
      //if (!this.meshes[i].blendMode) {
        mesh.render(  camera.getProjectionMatrix(),
                      camera.getViewMatrix(),
                      this.lights.flatten(),
                      time,
                      false
                    );
      //}
    }

    this.renderBlended(camera, time);
  }

  private computeWorldMatrices(): void {
    for (let mesh of this.meshes) {
      mesh.computeWorldMatrix( this.graph );
    }
  }

  private renderBlended (camera: Camera, time: number): void {
    this.enableBlendMode('FUNC_ADD', 'SRC_ALPHA', 'ONE');
    for (let mesh of this.meshes) {
      //if (this.meshes[i].blendMode) {
        mesh.render(  camera.getProjectionMatrix(),
                      camera.getViewMatrix(),
                      this.lights.flatten(),
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
