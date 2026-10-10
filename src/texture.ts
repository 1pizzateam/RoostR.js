export type TextureSource = HTMLImageElement | HTMLCanvasElement | ImageData | ImageBitmap | Uint8Array;

export interface ITextureOptions {
  wrapS?: number;
  wrapT?: number;
  minFilter?: number;
  magFilter?: number;
  flipY?: boolean;
  generateMipmaps?: boolean;
  width?: number;
  height?: number;
}

const isPowerOfTwo = (n: number): boolean => (n & (n - 1)) === 0;

// WebGL1 can only mipmap power-of-two textures; WebGL2 has no such limit.
function canGenerateMipmaps(context: WebGLRenderingContext, width: number, height: number): boolean {
  if (typeof WebGL2RenderingContext !== 'undefined' && context instanceof WebGL2RenderingContext)
    return true;
  return isPowerOfTwo(width) && isPowerOfTwo(height);
}

export const Texture = {

  create(
    source: TextureSource,
    context: WebGLRenderingContext,
    options?: ITextureOptions
  ): WebGLTexture | null {
    let webGLTexture = context.createTexture();
    if (!webGLTexture) return null;

    const flipY = options?.flipY !== undefined ? options.flipY : true;
    const magFilter = options?.magFilter !== undefined ? options.magFilter : context.LINEAR;
    const minFilter = options?.minFilter !== undefined ? options.minFilter : context.LINEAR;
    const wrapS = options?.wrapS !== undefined ? options.wrapS : context.CLAMP_TO_EDGE;
    const wrapT = options?.wrapT !== undefined ? options.wrapT : context.CLAMP_TO_EDGE;

    context.bindTexture(context.TEXTURE_2D, webGLTexture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);

    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, magFilter);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, minFilter);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, wrapS);
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, wrapT);

    if (source instanceof Uint8Array)
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        options?.width || 1,
        options?.height || 1,
        0,
        context.RGBA,
        context.UNSIGNED_BYTE,
        source
      );
    else
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        <TexImageSource>source
      );

    if (options?.generateMipmaps) {
      const width = source instanceof Uint8Array ? options.width || 1 : (<{ width: number }>source).width;
      const height = source instanceof Uint8Array ? options.height || 1 : (<{ height: number }>source).height;
      if (canGenerateMipmaps(context, width, height))
        context.generateMipmap(context.TEXTURE_2D);
      else
        console.warn('Texture: mipmaps skipped, WebGL1 requires power-of-two dimensions.');
    }

    context.bindTexture(context.TEXTURE_2D, null);
    return webGLTexture;
  },

  load(
    url: string,
    context: WebGLRenderingContext,
    options?: ITextureOptions
  ): Promise<WebGLTexture | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(Texture.create(img, context, options));
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  },

  update(
    texture: WebGLTexture,
    source: TextureSource,
    context: WebGLRenderingContext,
    xOffset: number = 0,
    yOffset: number = 0,
    width?: number,
    height?: number,
    flipY: boolean = true
  ): void {
    context.bindTexture(context.TEXTURE_2D, texture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    if (source instanceof Uint8Array)
      context.texSubImage2D(
        context.TEXTURE_2D,
        0,
        xOffset,
        yOffset,
        width || 1,
        height || 1,
        context.RGBA,
        context.UNSIGNED_BYTE,
        source
      );
    else
      context.texSubImage2D(
        context.TEXTURE_2D,
        0,
        xOffset,
        yOffset,
        context.RGBA,
        context.UNSIGNED_BYTE,
        <TexImageSource>source
      );
    context.bindTexture(context.TEXTURE_2D, null);
  }

};
