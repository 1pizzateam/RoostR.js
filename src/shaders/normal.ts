import { Program } from '../program';

export const NormalShader = {
  vertex: `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;

void main(void) {
  vNormal = normalize(uNormalMatrix * aVertexNormal);
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}
`,
  fragment: `
precision mediump float;

varying vec3 vNormal;

void main(void) {
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}
`,
  create(context: WebGLRenderingContext): WebGLProgram | null {
    return Program.create(context, NormalShader.vertex, NormalShader.fragment);
  }
};
