import { getGLState } from './state';
export class SceneRenderer {

  context: WebGLRenderingContext;

  // Cached GL state; null means unknown.
  private blendKey: string = '';
  private blendEnabled: boolean | null = null;
  private depthWrite: boolean | null = null;

  constructor(context:WebGLRenderingContext) {
    this.context = context;
    this.defaultSettings();
  }

  // Forget cached GL bindings after other code may have changed them.
  public invalidateState(): void {
    getGLState(this.context).invalidate();
    this.blendKey = '';
    this.blendEnabled = null;
    this.depthWrite = null;
  }

  // Forgets everything cached about a context that was lost and restored, then sets the defaults again.
  public reset(): void {
    getGLState(this.context).reset();
    this.blendKey = '';
    this.blendEnabled = null;
    this.depthWrite = null;
    this.defaultSettings();
  }

  public defaultSettings(): void {
    this.setDepthFunc('LEQUAL');
    this.enableDepthTest();
    this.disableBlendMode();
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
  public enable( capability: string): void {
    if (capability === 'BLEND')
      this.blendEnabled = true;
    this.context.enable(this.context[capability]);
  }

  public disable( capability: string): void {
    if (capability === 'BLEND')
      this.blendEnabled = false;
    this.context.disable(this.context[capability]);
  }

  // GL_ALWAYS	The depth test always passes.
  // GL_NEVER	The depth test never passes.
  // GL_LESS	Passes if the fragment's depth value is less than the stored depth value.
  // GL_EQUAL	Passes if the fragment's depth value is equal to the stored depth value.
  // GL_LEQUAL	Passes if the fragment's depth value is less than or equal to the stored depth value.
  // GL_GREATER	Passes if the fragment's depth value is greater than the stored depth value.
  // GL_NOTEQUAL	Passes if the fragment's depth value is not equal to the stored depth value.
  // GL_GEQUAL	Passes if the fragment's depth value is greater than or equal to the stored depth value.
  public setDepthFunc(mode: string): void {
    this.context.depthFunc(this.context[mode]);
  }

  // gl.ZERO	0,0,0,0	Multiplies all colors by 0.
  // gl.ONE	1,1,1,1	Multiplies all colors by 1.
  // gl.SRC_COLOR	RS, GS, BS, AS	Multiplies all colors by the source colors.
  // gl.ONE_MINUS_SRC_COLOR	1-RS, 1-GS, 1-BS, 1-AS	Multiplies all colors by 1 minus each source color.
  // gl.DST_COLOR	RD, GD, BD, AD	Multiplies all colors by the destination color.
  // gl.ONE_MINUS_DST_COLOR	1-RD, 1-GD, 1-BD, 1-AD	Multiplies all colors by 1 minus each destination color.
  // gl.SRC_ALPHA	AS, AS, AS, AS	Multiplies all colors by the source alpha value.
  // gl.ONE_MINUS_SRC_ALPHA	1-AS, 1-AS, 1-AS, 1-AS	Multiplies all colors by 1 minus the source alpha value.
  // gl.DST_ALPHA	AD, AD, AD, AD	Multiplies all colors by the destination alpha value.
  // gl.ONE_MINUS_DST_ALPHA	1-AD, 1-AD, 1-AD, 1-AD	Multiplies all colors by 1 minus the destination alpha value.
  // gl.CONSTANT_COLOR	RC, GC, BC, AC	Multiplies all colors by a constant color.
  // gl.ONE_MINUS_CONSTANT_COLOR	1-RC, 1-GC, 1-BC, 1-AC	Multiplies all colors by 1 minus a constant color.
  // gl.CONSTANT_ALPHA	AC, AC, AC, AC	Multiplies all colors by a constant alpha value.
  // gl.ONE_MINUS_CONSTANT_ALPHA	1-AC, 1-AC, 1-AC, 1-AC	Multiplies all colors by 1 minus a constant alpha value.
  // gl.SRC_ALPHA_SATURATE
  // min(AS, 1 - AD), min(AS, 1 - AD), min(AS, 1 - AD), 1 Multiplies the RGB colors by the smaller of either the source alpha value or the value of 1 minus the destination alpha value. The alpha value is multiplied by 1.
  public setBlendFunction( sourceFactor: string, destinationFactor: string): void {
    this.context.blendFunc( this.context[sourceFactor], this.context[destinationFactor] );
  }

  // GL_FUNC_ADD
  // GL_FUNC_SUBTRACT
  // GL_FUNC_REVERSE_SUBTRACT
  // GL_MIN
  // GL_MAX
  public setBlendEquation( mode: string): void {
    this.context.blendEquation( this.context[mode] );
  }

  public enableDepthTest(): void {
    this.enable('DEPTH_TEST');
    this.depthWrite = true;
    this.context.depthMask(true);
    //this.gl.depthFunc(this.gl.LESS);
    //this.setDepthFunc('LEQUAL');
  }

  public disableDepthTest(): void {
    this.disable('DEPTH_TEST');
    this.depthWrite = false;
    this.context.depthMask(false);
  }

  public enableBlendMode(equation: string, source: string, destination: string): void {
    const key = `${equation}|${source}|${destination}`;
    if (key !== this.blendKey) {
      this.setBlendEquation(equation);
      this.setBlendFunction(source, destination);
      this.blendKey = key;
    }
    if (this.blendEnabled !== true)
      this.enable('BLEND');
  }

  public disableBlendMode() {
    if (this.blendEnabled !== false)
      this.disable('BLEND');
  }

  // Enables or disables writing to the depth buffer (the depth test itself is unchanged).
  public setDepthWrite(enabled: boolean): void {
    if (this.depthWrite === enabled)
      return;
    this.depthWrite = enabled;
    this.context.depthMask(enabled);
  }

  public getParameter (parameterName: GLenum): GLenum|Float32Array|GLint|WebGLBuffer|GLboolean|Array<GLboolean>|GLfloat|WebGLFramebuffer|Int32Array|GLuint|WebGLTexture {
    return this.context.getParameter(parameterName);
  }

}
