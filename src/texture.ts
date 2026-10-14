import { Vec2 } from '@1pizzateam/spock';

export type TextureSource = HTMLImageElement | HTMLCanvasElement | ImageData | ImageBitmap | Uint8Array;

export interface ITextureOptions {
  wrapS?: number;
  wrapT?: number;
  minFilter?: number;
  magFilter?: number;
  flipY?: boolean;
  generateMipmaps?: boolean;
  size?: Vec2;
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
    const webGLTexture = context.createTexture();
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

    if (source instanceof Uint8Array) {
      const width = options?.size ? options.size.x : 1;
      const height = options?.size ? options.size.y : 1;
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        width,
        height,
        0,
        context.RGBA,
        context.UNSIGNED_BYTE,
        source
      );
    } else
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        <TexImageSource>source
      );

    if (options?.generateMipmaps) {
      const width = source instanceof Uint8Array ? (options?.size ? options.size.x : 1) : (<{ width: number }>source).width;
      const height = source instanceof Uint8Array ? (options?.size ? options.size.y : 1) : (<{ height: number }>source).height;
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
    offset: Vec2 = new Vec2(),
    size?: Vec2,
    flipY: boolean = true
  ): void {
    context.bindTexture(context.TEXTURE_2D, texture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    const xOffset = offset.x;
    const yOffset = offset.y;
    const width = size ? size.x : 1;
    const height = size ? size.y : 1;
    if (source instanceof Uint8Array)
      context.texSubImage2D(
        context.TEXTURE_2D,
        0,
        xOffset,
        yOffset,
        width,
        height,
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
