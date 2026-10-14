import { Program } from '../program';

export const BasicShader = {
  vertex: `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
  vTextureCoord = aTextureCoord;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}
`,
  fragment: `
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 uMaterialDiffuse;
uniform int uHasTexture;

void main(void) {
  vec4 color = vec4(uMaterialDiffuse, 1.0);
  if (uHasTexture == 1) {
    color *= texture2D(uSampler, vTextureCoord);
  }
  gl_FragColor = color;
}
`,
  create(context: WebGLRenderingContext): WebGLProgram | null {
    return Program.create(context, BasicShader.vertex, BasicShader.fragment);
  }
};
