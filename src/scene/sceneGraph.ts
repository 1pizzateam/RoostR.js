import {Matrix4x3} from '@lcluber/type6js';

export class SceneGraph {

  model: Array<Matrix4x3>;
  nbModel : number;
  modelStackTop : number;

  constructor(/*context:WebGLRenderingContext*/){
    this.model = [ new Matrix4x3() ]; //model matrices
    this.model[0].identity();
    this.nbModel = this.model.length;
    this.modelStackTop = 0;
  }

  public pushModelMatrix(modelMatrix:Matrix4x3): void {
    this.modelStackTop++;
    if (this.modelStackTop === this.nbModel) {
      this.model.push(new Matrix4x3());
      this.nbModel++;
    }
    this.model[this.modelStackTop].copy(modelMatrix);
  }

  public popModelMatrix(): void{
    this.modelStackTop--;
  }

  public getWorldMatrix(): Matrix4x3 {
    return this.model[this.modelStackTop];
  }

}
