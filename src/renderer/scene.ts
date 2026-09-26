
export class SceneRenderer {

  context: WebGLRenderingContext;

  constructor(context:WebGLRenderingContext) {
    this.context = context;
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
    this.context.enable(this.context[capability]);
  }

  public disable( capability: string): void {
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
    this.context.depthMask(true);
    //this.gl.depthFunc(this.gl.LESS);
    //this.setDepthFunc('LEQUAL');
  }

  public disableDepthTest(): void {
    this.disable('DEPTH_TEST');
    this.context.depthMask(false);
  }

  public enableBlendMode(equation: string, source: string, destination: string): void {
    this.setBlendEquation(equation);
    this.setBlendFunction(source, destination);
    this.enable('BLEND');
  }

  public disableBlendMode() {
    this.disable('BLEND');
  }

  // gl.ACTIVE_TEXTURE	GLenum
  // gl.ALIASED_LINE_WIDTH_RANGE	Float32Array (with 2 elements)
  // gl.ALIASED_POINT_SIZE_RANGE	Float32Array (with 2 elements)
  // gl.ALPHA_BITS	GLint
  // gl.ARRAY_BUFFER_BINDING	WebGLBuffer
  // gl.BLEND	GLboolean
  // gl.BLEND_COLOR	Float32Array (with 4 values)
  // gl.BLEND_DST_ALPHA	GLenum
  // gl.BLEND_DST_RGB	GLenum
  // gl.BLEND_EQUATION	GLenum
  // gl.BLEND_EQUATION_ALPHA	GLenum
  // gl.BLEND_EQUATION_RGB	GLenum
  // gl.BLEND_SRC_ALPHA	GLenum
  // gl.BLEND_SRC_RGB	GLenum
  // gl.BLUE_BITS	GLint
  // gl.COLOR_CLEAR_VALUE	Float32Array (with 4 values)
  // gl.COLOR_WRITEMASK	sequence<GLboolean> (with 4 values)
  // gl.COMPRESSED_TEXTURE_FORMATS	Uint32Array	Returns the compressed texture formats.
  // gl.CULL_FACE	GLboolean
  // gl.CULL_FACE_MODE	GLenum
  // gl.CURRENT_PROGRAM	WebGLProgram
  // gl.DEPTH_BITS	GLint
  // gl.DEPTH_CLEAR_VALUE	GLfloat
  // gl.DEPTH_FUNC	GLenum
  // gl.DEPTH_RANGE	Float32Array (with 2 elements)
  // gl.DEPTH_TEST	GLboolean
  // gl.DEPTH_WRITEMASK	GLboolean
  // gl.DITHER	GLboolean
  // gl.ELEMENT_ARRAY_BUFFER_BINDING	WebGLBuffer
  // gl.FRAMEBUFFER_BINDING	WebGLFramebuffer
  // gl.FRONT_FACE	GLenum
  // gl.GENERATE_MIPMAP_HINT	GLenum
  // gl.GREEN_BITS	GLint
  // gl.IMPLEMENTATION_COLOR_READ_FORMAT	GLenum
  // gl.IMPLEMENTATION_COLOR_READ_TYPE	GLenum
  // gl.LINE_WIDTH	GLfloat
  // gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS	GLint
  // gl.MAX_CUBE_MAP_TEXTURE_SIZE	GLint
  // gl.MAX_FRAGMENT_UNIFORM_VECTORS	GLint
  // gl.MAX_RENDERBUFFER_SIZE	GLint
  // gl.MAX_TEXTURE_IMAGE_UNITS	GLint
  // gl.MAX_TEXTURE_SIZE	GLint
  // gl.MAX_VARYING_VECTORS	GLint
  // gl.MAX_VERTEX_ATTRIBS	GLint
  // gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS	GLint
  // gl.MAX_VERTEX_UNIFORM_VECTORS	GLint
  // gl.MAX_VIEWPORT_DIMS	Int32Array (with 2 elements)
  // gl.PACK_ALIGNMENT	GLint
  // gl.POLYGON_OFFSET_FACTOR	GLfloat
  // gl.POLYGON_OFFSET_FILL	GLboolean
  // gl.POLYGON_OFFSET_UNITS	GLfloat
  // gl.RED_BITS	GLint
  // gl.RENDERBUFFER_BINDING	WebGLRenderbuffer
  // gl.RENDERER	DOMString
  // gl.SAMPLE_BUFFERS	GLint
  // gl.SAMPLE_COVERAGE_INVERT	GLboolean
  // gl.SAMPLE_COVERAGE_VALUE	GLfloat
  // gl.SAMPLES	GLint
  // gl.SCISSOR_BOX	Int32Array (with 4 elements)
  // gl.SCISSOR_TEST	GLboolean
  // gl.SHADING_LANGUAGE_VERSION	DOMString
  // gl.STENCIL_BACK_FAIL	GLenum
  // gl.STENCIL_BACK_FUNC	GLenum
  // gl.STENCIL_BACK_PASS_DEPTH_FAIL	GLenum
  // gl.STENCIL_BACK_PASS_DEPTH_PASS	GLenum
  // gl.STENCIL_BACK_REF	GLint
  // gl.STENCIL_BACK_VALUE_MASK	GLuint
  // gl.STENCIL_BACK_WRITEMASK	GLuint
  // gl.STENCIL_BITS	GLint
  // gl.STENCIL_CLEAR_VALUE	GLint
  // gl.STENCIL_FAIL	GLenum
  // gl.STENCIL_FUNC	GLenum
  // gl.STENCIL_PASS_DEPTH_FAIL	GLenum
  // gl.STENCIL_PASS_DEPTH_PASS	GLenum
  // gl.STENCIL_REF	GLint
  // gl.STENCIL_TEST	GLboolean
  // gl.STENCIL_VALUE_MASK	GLuint
  // gl.STENCIL_WRITEMASK	GLuint
  // gl.SUBPIXEL_BITS	GLint
  // gl.TEXTURE_BINDING_2D	WebGLTexture
  // gl.TEXTURE_BINDING_CUBE_MAP	WebGLTexture
  // gl.UNPACK_ALIGNMENT	GLint
  // gl.UNPACK_COLORSPACE_CONVERSION_WEBGL	GLenum
  // gl.UNPACK_FLIP_Y_WEBGL	GLboolean
  // gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL	GLboolean
  // gl.VENDOR	DOMString
  // gl.VERSION	DOMString
  // gl.VIEWPORT	Int32Array (with 4 elements)
  public getParameter (parameterName: GLenum): GLenum|Float32Array|GLint|WebGLBuffer|GLboolean|Array<GLboolean>|GLfloat|WebGLFramebuffer|Int32Array|GLuint|WebGLTexture {
    return this.context.getParameter(parameterName);
  }

}
