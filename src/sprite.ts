import { Vec3 } from '@1pizzateam/spock';
import { Mesh } from './mesh';
import { Material } from './material';
import { Program } from './program';
import type { IGeometry } from './interfaces';
import type { ITextureOptions, TextureSource } from './texture';

export type SpriteBillboard = 'none' | 'spherical' | 'cylindrical';
export type SpriteAnchor = 'center' | 'bottom';

export interface ISpriteOptions {
  /** Size of the sprite in world units. */
  width: number;
  height: number;
  /** Image drawn on the sprite. It can also be given later with `setTexture`. */
  texture?: TextureSource;
  textureOptions?: ITextureOptions;
  /** Number of equal cells laid side by side in the image (a sprite sheet). Default 1. */
  frames?: number;
  /** Which point of the sprite sits on the mesh position: its middle, or the middle of its bottom edge. Default 'center'. */
  anchor?: SpriteAnchor;
  /** How it turns towards the camera. Default 'spherical'. */
  billboard?: SpriteBillboard;
  /** Pixels whose alpha is below this are not drawn. Default 0.5. */
  alphaCutoff?: number;
  /** Tints the image (its diffuse colour is multiplied in). Default is white, which leaves the image as it is. */
  material?: Material;
  /**
   * Draws the sprite as if it were this many world units nearer the camera, without changing its size or where it
   * is on screen. A big sprite (an explosion) needs it, or the walls and floor round it cut it off flat. Default 0.
   */
  depthBias?: number;
  /** Replaces the built-in fragment shader. It receives `vTextureCoord` and `vDepth` (distance along the view axis). */
  fragment?: string;
}

const BILLBOARD_VALUES: Record<SpriteBillboard, number> = { none: 0, spherical: 1, cylindrical: 2 };

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
  gl_FragColor = vec4(color, 1.0);
}
`,
  create(context: WebGLRenderingContext): WebGLProgram | null {
    return Program.create(context, SpriteShader.vertex, SpriteShader.fragment);
  }
};

/**
 * A flat image in the 3D scene that turns to face the camera: an enemy, a pickup, a tree, a particle.
 * The image can be a sprite sheet, and `setFrame` picks the cell to draw. Position, scale and parent work
 * like on any mesh; rotation is ignored while it is a billboard.
 */
export class Sprite extends Mesh {

  readonly width : number;
  readonly height : number;
  readonly frames : number;
  readonly anchor : SpriteAnchor;
  readonly billboard : SpriteBillboard;
  private currentFrame : number = 0;

  constructor(context: WebGLRenderingContext, options: ISpriteOptions) {
    const { width, height } = options;
    const anchor = options.anchor ?? 'center';
    const billboard = options.billboard ?? 'spherical';
    const frames = Math.max(1, Math.floor(options.frames ?? 1));
    const x = width / 2;
    const y0 = anchor === 'bottom' ? 0 : -height / 2;
    const y1 = anchor === 'bottom' ? height : height / 2;
    const geometry: IGeometry = {
      vertices : [-x, y0, 0,  x, y0, 0,  x, y1, 0,  -x, y0, 0,  x, y1, 0,  -x, y1, 0],
      uvs      : [0, 0,  1, 0,  1, 1,  0, 0,  1, 1,  0, 1],
      indices  : null,
      normals  : null,
      subMeshes: [],
      itemSize : 3,
      primitive: 'TRIANGLES'
    };
    super(geometry, context);

    this.width = width;
    this.height = height;
    this.frames = frames;
    this.anchor = anchor;
    this.billboard = billboard;

    const material = options.material ?? new Material({ diffuse: [1, 1, 1] });
    this.addProgram(SpriteShader.vertex, options.fragment ?? SpriteShader.fragment, material);
    this.addCustomUniform('frame', 'uniform1f', 0);
    this.addCustomUniform('frames', 'uniform1f', frames);
    this.addCustomUniform('billboard', 'uniform1f', BILLBOARD_VALUES[billboard]);
    this.addCustomUniform('alphaCutoff', 'uniform1f', options.alphaCutoff ?? 0.5);
    this.addCustomUniform('depthBias', 'uniform1f', options.depthBias ?? 0);

    // a billboard swings about its position, so its reach is a sphere around it, not the flat box it is built as
    if (billboard !== 'none') {
      const reach = Math.hypot(x, Math.max(Math.abs(y0), Math.abs(y1)));
      if (billboard === 'spherical')
        this.setLocalBounds(new Vec3(-reach, -reach, -reach), new Vec3(reach, reach, reach));
      else
        this.setLocalBounds(new Vec3(-x, y0, -x), new Vec3(x, y1, x));
    }

    if (options.texture)
      this.setTexture(options.texture, options.textureOptions);
  }

  /** The cell of the sprite sheet that is drawn, counted from the left. Out-of-range values wrap around. */
  public setFrame(frame: number): this {
    this.currentFrame = ((Math.floor(frame) % this.frames) + this.frames) % this.frames;
    this.setCustomUniform('frame', this.currentFrame);
    return this;
  }

  public getFrame(): number {
    return this.currentFrame;
  }

  public setAlphaCutoff(cutoff: number): this {
    this.setCustomUniform('alphaCutoff', cutoff);
    return this;
  }
}
