
//import { RendererTarget } from './DOM/canvas';

export class Texture {

  static create ( img:HTMLImageElement, context:WebGLRenderingContext ): WebGLTexture | null {
    let webGLTexture = context.createTexture();
    context.bindTexture(context.TEXTURE_2D, webGLTexture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1/*true*/);
    context.texParameteri(  context.TEXTURE_2D,
                            context.TEXTURE_MAG_FILTER,
                            context.LINEAR
                          );
    context.texParameteri(  context.TEXTURE_2D,
                            context.TEXTURE_MIN_FILTER,
                            context.LINEAR //allow NPOT
                          );
    //allow NPOT
    context.texParameteri(  context.TEXTURE_2D,
                            context.TEXTURE_WRAP_S,
                            context.CLAMP_TO_EDGE
                          );
    //allow NPOT
    context.texParameteri(  context.TEXTURE_2D,
                            context.TEXTURE_WRAP_T,
                            context.CLAMP_TO_EDGE
                          );
    context.texImage2D( context.TEXTURE_2D,
                        0,
                        context.RGBA,
                        context.RGBA,
                        context.UNSIGNED_BYTE,
                        img
                      );
    //context.generateMipmap(context.TEXTURE_2D);//comment to allow NPOT
    context.bindTexture(context.TEXTURE_2D, null);
    return webGLTexture;
  }

}
