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

export const PhongShader = {
  vertex: `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vTextureCoord;

void main(void) {
  vec4 worldPos = uModelMatrix * vec4(aVertexPosition, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormal = normalize(uNormalMatrix * aVertexNormal);
  vTextureCoord = aTextureCoord;
  gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
}
`,
  fragment: `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vTextureCoord;

uniform vec3 uMaterialAmbient;
uniform vec3 uMaterialDiffuse;
uniform vec3 uMaterialSpecular;
uniform float uMaterialShininess;

uniform vec3 uAmbientLight;
uniform vec3 uAmbientColor;

const int MAX_LIGHTS = 8;
uniform int uNbLights;
// Packed: (position.xyz, type), (diffuse.rgb, cutoff), (specular.rgb, exponent)
uniform vec4 uLightPositionType[MAX_LIGHTS];
uniform vec4 uLightDiffuseCutoff[MAX_LIGHTS];
uniform vec4 uLightSpecularExponent[MAX_LIGHTS];
uniform vec3 uLightDirection[MAX_LIGHTS];
uniform vec3 uLightAttenuation[MAX_LIGHTS];

uniform sampler2D uSampler;
uniform int uHasTexture;

uniform vec3 uCameraPosition;

uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform int uHasFog;

void main(void) {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);

  vec3 totalAmbient = (uAmbientLight + uAmbientColor) * uMaterialAmbient;
  vec3 totalDiffuse = vec3(0.0);
  vec3 totalSpecular = vec3(0.0);

  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= uNbLights) break;

    vec4 positionType = uLightPositionType[i];
    vec4 diffuseCutoff = uLightDiffuseCutoff[i];
    vec4 specularExponent = uLightSpecularExponent[i];

    vec3 lightDir;
    float attenuation = 1.0;

    if (positionType.w < 0.5) {
      // Directional
      lightDir = normalize(-uLightDirection[i]);
    } else {
      // Point or Spot
      vec3 lightVec = positionType.xyz - vWorldPosition;
      float d = length(lightVec);
      lightDir = normalize(lightVec);

      float c = uLightAttenuation[i].x;
      float l = uLightAttenuation[i].y;
      float q = uLightAttenuation[i].z;
      attenuation = 1.0 / max(c + l * d + q * d * d, 1.0);

      if (positionType.w > 1.5) {
        // Spot
        float spotEffect = dot(normalize(uLightDirection[i]), -lightDir);
        float cutoffCos = cos(radians(diffuseCutoff.w));
        if (spotEffect > cutoffCos) {
          attenuation *= pow(spotEffect, max(specularExponent.w, 1.0));
        } else {
          attenuation = 0.0;
        }
      }
    }

    float NdotL = max(dot(normal, lightDir), 0.0);
    totalDiffuse += diffuseCutoff.rgb * uMaterialDiffuse * NdotL * attenuation;

    if (NdotL > 0.0) {
      vec3 halfDir = normalize(lightDir + viewDir);
      float NdotH = max(dot(normal, halfDir), 0.0);
      float spec = pow(NdotH, max(uMaterialShininess, 1.0));
      totalSpecular += specularExponent.rgb * uMaterialSpecular * spec * attenuation;
    }
  }

  vec4 texColor = vec4(1.0);
  if (uHasTexture == 1) {
    texColor = texture2D(uSampler, vTextureCoord);
  }

  vec3 finalColor = (totalAmbient + totalDiffuse) * texColor.rgb + totalSpecular;

  if (uHasFog == 1) {
    float dist = length(uCameraPosition - vWorldPosition);
    float fogFactor = clamp((uFogFar - dist) / max(uFogFar - uFogNear, 0.0001), 0.0, 1.0);
    finalColor = mix(uFogColor, finalColor, fogFactor);
  }

  gl_FragColor = vec4(finalColor, texColor.a);
}
`,
  create(context: WebGLRenderingContext): WebGLProgram | null {
    return Program.create(context, PhongShader.vertex, PhongShader.fragment);
  }
};
