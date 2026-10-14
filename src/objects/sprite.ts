import { Vec3, Vec2, Box as BoundingBox, Ray3 as Ray } from '@1pizzateam/spock';
import { Mesh } from './mesh';
import { Material } from '../material';
import type { IGeometry } from '../interfaces';
import type { ITextureOptions, TextureSource } from '../texture';
import { SpriteShader } from '../shaders/sprite';
import { raycastSprite } from './spriteRaycast';

export { SpriteShader } from '../shaders/sprite';

export type SpriteBillboard = 'none' | 'spherical' | 'cylindrical';
export type SpriteAnchor = 'center' | 'bottom';

export interface ISpriteOptions {
  /** Size of the sprite in world units. */
  size?: Vec2;
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

/**
 * A flat image in the 3D scene that turns to face the camera: an enemy, a pickup, a tree, a particle.
 * The image can be a sprite sheet, and `setFrame` picks the cell to draw. Position, scale and parent work
 * like on any mesh; rotation is ignored while it is a billboard.
 */
export class Sprite extends Mesh {

  readonly width: number;
  readonly height: number;
  frames: number;
  readonly anchor: SpriteAnchor;
  billboard: SpriteBillboard;
  private currentFrame: number = 0;
  private alphaCutoff: number = 0.5;
  private depthBias: number = 0;

  private static readonly scratchSpriteMin = new Vec3();
  private static readonly scratchSpriteMax = new Vec3();
  private static readonly scratchSpriteBox = new BoundingBox();
  private static readonly scratchSpriteHit = new Vec3();

  constructor(context: WebGLRenderingContext, options: ISpriteOptions) {
    const size = options.size ?? new Vec2(1, 1);
    const width = size.x;
    const height = size.y;
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
    this.alphaCutoff = options.alphaCutoff ?? 0.5;
    this.depthBias = options.depthBias ?? 0;

    const material = options.material ?? new Material({ diffuse: new Vec3(1, 1, 1) });
    this.addProgram(SpriteShader.vertex, options.fragment ?? SpriteShader.fragment, material);
    this.addCustomUniform('frame', 'uniform1f', 0);
    this.addCustomUniform('frames', 'uniform1f', frames);
    this.addCustomUniform('billboard', 'uniform1f', BILLBOARD_VALUES[billboard]);
    this.addCustomUniform('alphaCutoff', 'uniform1f', this.alphaCutoff);
    this.addCustomUniform('depthBias', 'uniform1f', this.depthBias);

    this.updateLocalBounds();

    if (options.texture)
      this.setTexture(options.texture, options.textureOptions);
  }

  private updateLocalBounds(): void {
    const x = this.width / 2;
    const y0 = this.anchor === 'bottom' ? 0 : -this.height / 2;
    const y1 = this.anchor === 'bottom' ? this.height : this.height / 2;

    if (this.billboard !== 'none') {
      const reach = Math.hypot(x, Math.max(Math.abs(y0), Math.abs(y1)));
      if (this.billboard === 'spherical') {
        Sprite.scratchSpriteMin.setScalar(-reach, -reach, -reach);
        Sprite.scratchSpriteMax.setScalar(reach, reach, reach);
      } else {
        Sprite.scratchSpriteMin.setScalar(-x, y0, -x);
        Sprite.scratchSpriteMax.setScalar(x, y1, x);
      }
    } else {
      Sprite.scratchSpriteMin.setScalar(-x, y0, 0);
      Sprite.scratchSpriteMax.setScalar(x, y1, 0);
    }
    Sprite.scratchSpriteBox.set(Sprite.scratchSpriteMin, Sprite.scratchSpriteMax);
    this.setLocalBounds(Sprite.scratchSpriteBox);
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

  public setFrames(frames: number): this {
    this.frames = Math.max(1, Math.floor(frames));
    this.setCustomUniform('frames', this.frames);
    return this.setFrame(this.currentFrame);
  }

  public getFrames(): number {
    return this.frames;
  }

  public setBillboard(billboard: SpriteBillboard): this {
    if (this.billboard === billboard) return this;
    this.billboard = billboard;
    this.setCustomUniform('billboard', BILLBOARD_VALUES[billboard]);
    this.updateLocalBounds();
    return this;
  }

  public getBillboard(): SpriteBillboard {
    return this.billboard;
  }

  public setAlphaCutoff(cutoff: number): this {
    this.alphaCutoff = cutoff;
    this.setCustomUniform('alphaCutoff', cutoff);
    return this;
  }

  public getAlphaCutoff(): number {
    return this.alphaCutoff;
  }

  public setDepthBias(depthBias: number): this {
    this.depthBias = depthBias;
    this.setCustomUniform('depthBias', depthBias);
    return this;
  }

  public getDepthBias(): number {
    return this.depthBias;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getSize(target: Vec2 = new Vec2()): Vec2 {
    target.x = this.width;
    target.y = this.height;
    return target;
  }

  public getAnchor(): SpriteAnchor {
    return this.anchor;
  }

  public override raycast(ray: Ray, precise: boolean = false): { distance: number; point: Vec3 } | null {
    if (!this.isActive()) return null;

    if (this.billboard === 'none')
      return super.raycast(ray, precise);

    const sphere = this.computeBoundingSphere();
    const hitSphere = ray.intersectSphere(sphere, Sprite.scratchSpriteHit);
    if (!hitSphere) return null;

    if (!precise)
      return { distance: ray.origin.getDistance(hitSphere), point: new Vec3().copy(hitSphere) };

    return raycastSprite(this, ray);
  }
}
