import { Vec2 } from '@1pizzateam/spock';

export class RenderTarget {

  width: number;
  height: number;
  context: WebGLRenderingContext;
  framebuffer: WebGLFramebuffer | null;
  texture: WebGLTexture | null;
  depthBuffer: WebGLRenderbuffer | null;

  constructor(
    sizeOrWidth: Vec2 | number,
    heightOrContext: number | WebGLRenderingContext,
    context?: WebGLRenderingContext
  ) {
    if (sizeOrWidth instanceof Vec2) {
      this.width = sizeOrWidth.x;
      this.height = sizeOrWidth.y;
      this.context = heightOrContext as WebGLRenderingContext;
    } else {
      this.width = sizeOrWidth;
      this.height = heightOrContext as number;
      this.context = context!;
    }

    this.framebuffer = null;
    this.texture = null;
    this.depthBuffer = null;

    this.init();
  }

  // Recreates the framebuffer, texture and depth buffer after the context was lost and restored.
  // The texture is a new object: give it again to every mesh that samples it.
  public restore(): void {
    this.init();
  }

  private init(): void {
    const gl = this.context;

    // Create framebuffer
    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

    // Create color texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );

    // Attach texture to framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0
    );

    // Create depth/stencil renderbuffer
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      this.width,
      this.height
    );

    // Attach renderbuffer to framebuffer
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.depthBuffer
    );

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public bind(): void {
    const gl = this.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  public unbind(viewportWidthOrSize?: Vec2 | number, viewportHeight?: number): void {
    const gl = this.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (viewportWidthOrSize instanceof Vec2)
      gl.viewport(0, 0, viewportWidthOrSize.x, viewportWidthOrSize.y);
    else if (viewportWidthOrSize !== undefined && viewportHeight !== undefined)
      gl.viewport(0, 0, viewportWidthOrSize, viewportHeight);
  }

  public getSize(target: Vec2 = new Vec2()): Vec2 {
    return target.setScalar(this.width, this.height);
  }

  public setSize(sizeOrWidth: Vec2 | number, height?: number): void {
    const w = sizeOrWidth instanceof Vec2 ? sizeOrWidth.x : sizeOrWidth;
    const h = sizeOrWidth instanceof Vec2 ? sizeOrWidth.y : (height ?? 0);
    if (this.width === w && this.height === h) return;
    this.width = w;
    this.height = h;

    const gl = this.context;
    if (this.texture) {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.width,
        this.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    if (this.depthBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        this.width,
        this.height
      );
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
  }

  public dispose(): void {
    const gl = this.context;
    if (this.framebuffer) {
      gl.deleteFramebuffer(this.framebuffer);
      this.framebuffer = null;
    }
    if (this.texture) {
      gl.deleteTexture(this.texture);
      this.texture = null;
    }
    if (this.depthBuffer) {
      gl.deleteRenderbuffer(this.depthBuffer);
      this.depthBuffer = null;
    }
  }

}
