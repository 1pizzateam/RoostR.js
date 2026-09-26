import { Mat4x3 } from '@1pizzateam/spock';

export class SceneGraph {

  model: Array<Mat4x3>;
  nbModel : number;
  modelStackTop : number;

  constructor(/*context:WebGLRenderingContext*/){
    this.model = [ new Mat4x3() ]; //model matrices
    this.model[0].identity();
    this.nbModel = this.model.length;
    this.modelStackTop = 0;
  }

  public pushModelMatrix(modelMatrix: Mat4x3): void {
    this.modelStackTop++;
    if (this.modelStackTop === this.nbModel) {
      this.model.push(new Mat4x3());
      this.nbModel++;
    }
    this.model[this.modelStackTop].copy(modelMatrix);
  }

  public popModelMatrix(): void {
    if (this.modelStackTop > 0) {
      this.modelStackTop--;
    }
  }

  public getWorldMatrix(): Mat4x3 {
    return this.model[this.modelStackTop];
  }

}
