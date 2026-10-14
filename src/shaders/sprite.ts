import { Program } from '../program';

export const SpriteShader = {
  // The mesh position and scale place and size the sprite; its corners are then laid out in view space, so
  // that it faces the camera. 'cylindrical' keeps it upright (it only turns about the vertical axis).
  vertex: `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uFrame;
uniform float uFrames;
uniform float uBillboard;
uniform float uDepthBias;

varying vec2 vTextureCoord;
varying float vDepth;

void main(void) {
  vTextureCoord = vec2((uFrame + aTextureCoord.x) / uFrames, aTextureCoord.y);
  vec3 view;
  if (uBillboard < 0.5) {
    view = (uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0)).xyz;
  } else {
    vec3 origin = (uViewMatrix * uModelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = vec3(1.0, 0.0, 0.0);
    if (uBillboard > 1.5) {
      up = normalize((uViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
      vec3 across = cross(origin, up);
      if (length(across) > 0.0001)
        right = normalize(across);
    }
    float scaleX = length(uModelMatrix[0].xyz);
    float scaleY = length(uModelMatrix[1].xyz);
    view = origin + right * aVertexPosition.x * scaleX + up * aVertexPosition.y * scaleY;
  }
  vDepth = -view.z;
  vec4 clip = uProjectionMatrix * vec4(view, 1.0);
  // only the depth moves: the picture stays where it is and as big as it is
  float bias = min(uDepthBias, max(0.0, vDepth - 1.0));
  if (bias > 0.0) {
    vec4 nearer = uProjectionMatrix * vec4(view.xy, view.z + bias, 1.0);
    clip.z = nearer.z / nearer.w * clip.w;
  }
  gl_Position = clip;
}
`,
  fragment: `
precision mediump float;

uniform sampler2D uSampler;
uniform vec3 uMaterialDiffuse;
uniform float uAlphaCutoff;
uniform int uHasFog;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

varying vec2 vTextureCoord;
varying float vDepth;

void main(void) {
  vec4 texel = texture2D(uSampler, vTextureCoord);
  if (texel.a < uAlphaCutoff)
    discard;
  vec3 color = texel.rgb * uMaterialDiffuse;
  if (uHasFog == 1) {
    float fade = clamp((vDepth - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(color, uFogColor, fade);
  }
  gl_FragColor = vec4(color, texel.a);
}
`,
  create(context: WebGLRenderingContext): WebGLProgram | null {
    return Program.create(context, SpriteShader.vertex, SpriteShader.fragment);
  }
};
