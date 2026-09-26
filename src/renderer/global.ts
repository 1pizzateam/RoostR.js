
export class Renderer {

  canvas: HTMLCanvasElement;
  context: WebGLRenderingContext;

  constructor(canvasID:string) {
    this.canvas = this.findById(canvasID) as HTMLCanvasElement;
    // default resolution
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.context = <WebGLRenderingContext>this.canvas.getContext("webgl") || 
                   <WebGLRenderingContext>this.canvas.getContext("experimental-webgl",
                                                                 {alpha:false}
                                                                );

    this.defaultSettings();
  }

  public defaultSettings (): void {
    this.context.getExtension('OES_standard_derivatives');
    this.setFrontFace('CW');
    this.enable('CULL_FACE');
    this.setCullFace('BACK');

    //this.setViewport(1280,720);
    this.setViewport(this.context.drawingBufferWidth, this.context.drawingBufferHeight);
    // console.log(this.context.getParameter(this.context.VIEWPORT));
    this.setClearColor(0.0, 0.0, 0.0, 1.0);

  }

  // Sets the winding orientation. The default value is gl.CCW. Possible values:
  // gl.CW: Clock-wise winding.
  // gl.CCW: Counter-clock-wise winding.
  public setFrontFace( mode: string ): void {
    this.context.frontFace(this.context[mode]);
  }

  // specifying which WebGL capability to enable. Possible values:
  // GL_BLEND	Activates blending of the computed fragment color values. See WebGLRenderingContext.blendFunc().
  // GL_CULL_FACE	Activates culling of polygons. See WebGLRenderingContext.cullFace().
  // GL_DEPTH_TEST	Activates depth comparisons and updates to the depth buffer. See WebGLRenderingContext.depthFunc().
  // GL_DITHER	Activates dithering of color components before they get written to the color buffer.
  // GL_POLYGON_OFFSET_FILL	Activates adding an offset to depth values of polygon's fragments. See WebGLRenderingContext.polygonOffset().
  // GL_SAMPLE_ALPHA_TO_COVERAGE	Activates the computation of a temporary coverage value determined by the alpha value.
  // GL_SAMPLE_COVERAGE	Activates ANDing the fragment's coverage with the temporary coverage value. See WebGLRenderingContext.sampleCoverage().
  // GL_SCISSOR_TEST	Activates the scissor test that discards fragments that are outside of the scissor rectangle. See WebGLRenderingContext.scissor().
  // GL_STENCIL_TEST	Activates stencil testing and updates to the stencil buffer. See WebGLRenderingContext.stencilFunc().
  // Examples
  // Transparency is best implemented using blend function (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA) with primitives sorted from farthest to nearest. Note that this transparency calculation does not require the presence of alpha bitplanes in the frame buffer.
  // Blend function (GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA) is also useful for rendering antialiased points and lines in arbitrary order.
  public enable( capability: string ): void {
    this.context.enable(this.context[capability]);
  }

  public disable( capability: string ): void {
    this.context.disable(this.context[capability]);
  }

  // specifying whether front- or back-facing polygons are candidates for culling. The default value is gl.BACK. Possible values are:
  // gl.FRONT
  // gl.BACK
  // gl.FRONT_AND_BACK
  public setCullFace( mode: string ): void {
    this.context.cullFace(this.context[mode]);
  }

  // specifies the affine transformation of x and y from normalized device coordinates to window coordinates.
  public setViewport( width: number, height: number ): void {
    this.context.viewport(0, 0, width, height); //defaut values
  }

  // This specifies what color values to use when calling the clear() method. The values are clamped between 0 and 1.
  public setClearColor( red: number, green: number, blue: number, alpha: number ): void {
    this.context.clearColor( red, green, blue, alpha );
  }

  public clearFrame(): void {
    this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
  }

  public getContext(): WebGLRenderingContext | null {
    return this.context;
	}

  private findById(id: string): HTMLCanvasElement | null {
    return document.getElementById(id) as HTMLCanvasElement;
  }

}
