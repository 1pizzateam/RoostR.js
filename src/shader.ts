
export type ShaderType = 'VERTEX_SHADER' | 'FRAGMENT_SHADER';

export const Shader = {
  create(context: WebGLRenderingContext, str: string, type: ShaderType): WebGLShader | null {
    let shader = context.createShader(context[type]);
    if (!shader) return null;
    context.shaderSource(shader, str);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      console.error(`${type} compilation failed:`, context.getShaderInfoLog(shader));
      context.deleteShader(shader);
      return null;
    }
    return shader;
  }
};
