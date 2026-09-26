
import { SubMesh } from '../geometry/submesh';

export class MeshRenderer {

  context: WebGLRenderingContext;

  constructor(context:WebGLRenderingContext) {
    this.context = context;
    this.defaultSettings();
  }

  public defaultSettings(): void {

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
  // enable: function ( capability ) {
  //   this.context.enable(this.context[capability]);
  // },
  //
  // disable: function ( capability ) {
  //   this.context.disable(this.context[capability]);
  // },

  // specifying the binding point (target). Possible values:
  // gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  public createBuffer( target: string, 
                       size: ArrayBuffer | ArrayBufferView | null, 
                       drawMethod: string 
                     ): WebGLBuffer | null {
                       
    let buffer = this.context.createBuffer();
    //binds a given WebGLBuffer to a target
    this.context.bindBuffer(this.context[target], buffer);
    this.context.bufferData(this.context[target], size, this.context[drawMethod]);
    return buffer;

  }

  public useProgram(program: WebGLProgram): void {
    this.context.useProgram(program);
  }

  public bindBuffer(target:string, buffer: WebGLBuffer ): void {
    this.context.bindBuffer(this.context[target], buffer);
  }

  public vertexAttribPointer(index: number, size: number, type: string, normalized: boolean, stride: number, offset: number): void {
    this.context.vertexAttribPointer(index, size, this.context[type], normalized, stride, offset);
  }

  public drawElements(primitive: string, subMesh: SubMesh): void {
    // gl.POINTS: Draws a single dot.
    // gl.LINE_STRIP: Draws a straight line to the next vertex.
    // gl.LINE_LOOP: Draws a straight line to the next vertex, and connects the last vertex back to the first.
    // gl.LINES: Draws a line between a pair of vertices.
    // gl.TRIANGLE_STRIP
    // gl.TRIANGLE_FAN
    // gl.TRIANGLES: Draws a triangle for a group of three vertices.
    this.context.drawElements(this.context[primitive], subMesh.count, this.context.UNSIGNED_SHORT, subMesh.start * 2);
  }

  public drawArrays(primitive: string, subMesh: SubMesh): void {
    // gl.POINTS: Draws a single dot.
    // gl.LINE_STRIP: Draws a straight line to the next vertex.
    // gl.LINE_LOOP: Draws a straight line to the next vertex, and connects the last vertex back to the first.
    // gl.LINES: Draws a line between a pair of vertices.
    // gl.TRIANGLE_STRIP
    // gl.TRIANGLE_FAN
    // gl.TRIANGLES: Draws a triangle for a group of three vertices.
    this.context.drawArrays(this.context[primitive], 0, subMesh.count);
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
  // getParameter : function(parameterName){
  //   return this.context.getParameter(parameterName);
  // }

}
