import { Mat4x3, Vec3, Ray3 as Ray } from '@1pizzateam/spock';
import type { SpriteAnchor, SpriteBillboard } from './sprite';

export interface IRaycastSpriteTarget {
  width: number;
  height: number;
  anchor: SpriteAnchor;
  billboard: SpriteBillboard;
  worldMatrix: Mat4x3;
  getWorldPosition(target?: Vec3): Vec3;
}

const scratchSpritePos = new Vec3();
const scratchSpriteScale = new Vec3();
const scratchSpriteNormal = new Vec3();
const scratchSpriteUp = new Vec3();
const scratchSpriteRight = new Vec3();
const scratchSpriteHit = new Vec3();
const scratchSpriteC0 = new Vec3();
const scratchSpriteC1 = new Vec3();
const scratchSpriteC2 = new Vec3();
const scratchSpriteC3 = new Vec3();

export function raycastSprite(
  sprite: IRaycastSpriteTarget,
  ray: Ray
): { distance: number; point: Vec3 } | null {
  const worldPos = sprite.getWorldPosition(scratchSpritePos);
  const scale = sprite.worldMatrix.getScale(scratchSpriteScale);
  const normal = scratchSpriteNormal;
  const up = scratchSpriteUp;
  const right = scratchSpriteRight;

  if (sprite.billboard === 'spherical') {
    normal.copy(ray.direction).opposite().normalize();
    up.setScalar(0, 1, 0);
    const dotUp = up.dotProduct(normal);
    up.subtractScaledVector(normal, dotUp);
    if (up.getMagnitude(true) < 0.0001) {
      up.setScalar(0, 0, 1);
      const dotZ = up.dotProduct(normal);
      up.subtractScaledVector(normal, dotZ);
    }
    up.normalize();
    right.crossVectors(up, normal).normalize();
  } else {
    up.setScalar(0, 1, 0);
    normal.setScalar(-ray.direction.x, 0, -ray.direction.z);
    if (normal.getMagnitude(true) < 0.0001)
      normal.setScalar(ray.origin.x - worldPos.x, 0, ray.origin.z - worldPos.z);
    if (normal.getMagnitude(true) < 0.0001)
      normal.setScalar(0, 0, 1);
    else
      normal.normalize();
    right.crossVectors(up, normal).normalize();
  }

  const hw = (sprite.width / 2) * scale.x;
  const y0 = (sprite.anchor === 'bottom' ? 0 : -sprite.height / 2) * scale.y;
  const y1 = (sprite.anchor === 'bottom' ? sprite.height : sprite.height / 2) * scale.y;

  const c0 = scratchSpriteC0.setScalar(
    worldPos.x - right.x * hw + up.x * y0,
    worldPos.y - right.y * hw + up.y * y0,
    worldPos.z - right.z * hw + up.z * y0
  );
  const c1 = scratchSpriteC1.setScalar(
    worldPos.x + right.x * hw + up.x * y0,
    worldPos.y + right.y * hw + up.y * y0,
    worldPos.z + right.z * hw + up.z * y0
  );
  const c2 = scratchSpriteC2.setScalar(
    worldPos.x + right.x * hw + up.x * y1,
    worldPos.y + right.y * hw + up.y * y1,
    worldPos.z + right.z * hw + up.z * y1
  );
  const c3 = scratchSpriteC3.setScalar(
    worldPos.x - right.x * hw + up.x * y1,
    worldPos.y - right.y * hw + up.y * y1,
    worldPos.z - right.z * hw + up.z * y1
  );

  let hit = ray.intersectTriangle(c0, c1, c2, false, scratchSpriteHit);
  if (!hit)
    hit = ray.intersectTriangle(c0, c2, c3, false, scratchSpriteHit);
  if (!hit) return null;

  return { distance: ray.origin.getDistance(hit), point: new Vec3().copy(hit) };
}
