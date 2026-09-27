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

export class Texture {

  static create(
    source: TextureSource,
    context: WebGLRenderingContext,
    options?: ITextureOptions
  ): WebGLTexture | null {
    let webGLTexture = context.createTexture();
    if (!webGLTexture) {
      return null;
    }

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
      const width = options?.width || 1;
      const height = options?.height || 1;
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
    } else {
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        context.RGBA,
        context.UNSIGNED_BYTE,
        <TexImageSource>source
      );
    }

    if (options?.generateMipmaps) {
      context.generateMipmap(context.TEXTURE_2D);
    }

    context.bindTexture(context.TEXTURE_2D, null);
    return webGLTexture;
  }

  static load(
    url: string,
    context: WebGLRenderingContext,
    options?: ITextureOptions
  ): Promise<WebGLTexture | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        resolve(Texture.create(img, context, options));
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = url;
    });
  }

  static update(
    texture: WebGLTexture,
    source: TextureSource,
    context: WebGLRenderingContext,
    xOffset: number = 0,
    yOffset: number = 0,
    width?: number,
    height?: number
  ): void {
    context.bindTexture(context.TEXTURE_2D, texture);
    if (source instanceof Uint8Array) {
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
    } else {
      context.texSubImage2D(
        context.TEXTURE_2D,
        0,
        xOffset,
        yOffset,
        context.RGBA,
        context.UNSIGNED_BYTE,
        <TexImageSource>source
      );
    }
    context.bindTexture(context.TEXTURE_2D, null);
  }

}
