import { Shader } from './shader';

export class Program {

  static create( context: WebGLRenderingContext, 
                 vertexShader:string,
                 fragmentShader:string 
                ): WebGLProgram | null {
    //find vert and frag shader before deleting lines and tabs.
    //var reg = shader.match(/"vertex":"([\s\S]*)",[\s\S]*"fragment":"([\s\S]*)"/mi);
    let program = context.createProgram();
    if (program) {
      let vshader = Shader.create(context, vertexShader, 'VERTEX_SHADER');
      let fshader = Shader.create(context, fragmentShader, 'FRAGMENT_SHADER');
      if (vshader) {
        context.attachShader(program, vshader);
      }
      if (fshader) {
        context.attachShader(program, fshader);
      }
      context.linkProgram(program);
    
      if(!context.getProgramParameter(program, context.LINK_STATUS)){
        console.log(context.getProgramInfoLog(program));
      }
    }

    return program;
  }
}
