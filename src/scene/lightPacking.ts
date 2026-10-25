import type { DirectionalLight } from '../lights/directional';
import type { PointLight } from '../lights/point';
import type { SpotLight } from '../lights/spot';
import type { AmbientLight } from '../lights/ambient';
import type { IFlatLights } from '../interfaces';
import { Vec3 } from '@1pizzateam/spock';

const scratchAmbient = new Vec3();

export function clearFlatArrays(flatArrays: IFlatLights): void {
  flatArrays.position.length = 0;
  flatArrays.diffuse.length = 0;
  flatArrays.specular.length = 0;
  flatArrays.constantAttenuation.length = 0;
  flatArrays.linearAttenuation.length = 0;
  flatArrays.quadraticAttenuation.length = 0;
  flatArrays.cutoff.length = 0;
  flatArrays.exponent.length = 0;
  flatArrays.direction.length = 0;
  flatArrays.type.length = 0;
}

// Float32Arrays are reused while the light count stays the same.
export function ensureLightBuffers(flatArrays: IFlatLights, count: number): void {
  if (flatArrays.floatPosition && flatArrays.floatPosition.length === count * 3)
    return;
  flatArrays.floatPosition = new Float32Array(count * 3);
  flatArrays.floatDiffuse = new Float32Array(count * 3);
  flatArrays.floatSpecular = new Float32Array(count * 3);
  flatArrays.floatDirection = new Float32Array(count * 3);
  flatArrays.floatAttenuation = new Float32Array(count * 3);
  flatArrays.floatCutoff = new Float32Array(count);
  flatArrays.floatExponent = new Float32Array(count);
  flatArrays.floatType = new Float32Array(count);
  // vec4 layouts for the built-in Phong shader: (position, type), (diffuse, cutoff), (specular, exponent)
  flatArrays.packedPosition = new Float32Array(count * 4);
  flatArrays.packedDiffuse = new Float32Array(count * 4);
  flatArrays.packedSpecular = new Float32Array(count * 4);
}

export function pushLight(
  flatArrays: IFlatLights,
  index: number,
  kind: 'spot' | 'point' | 'directional',
  light: DirectionalLight | PointLight | SpotLight
): void {
  const o = index * 3;
  const isSpot = kind === 'spot';
  const isDirectional = kind === 'directional';
  const att = isDirectional ? null : light as PointLight;

  light.position.toArray(flatArrays.floatPosition!, o);
  light.diffuse.toArray(flatArrays.floatDiffuse!, o);
  light.specular.toArray(flatArrays.floatSpecular!, o);
  if (isDirectional)
    light.direction.toArray(flatArrays.floatDirection!, o);
  else if (isSpot)
    (light as SpotLight).direction.toArray(flatArrays.floatDirection!, o);
  else
    flatArrays.floatDirection!.fill(0, o, o + 3);

  const constant = att ? att.constantAttenuation : 1;
  const linear = att ? att.linearAttenuation : 0;
  const quadratic = att ? att.quadraticAttenuation : 0;
  flatArrays.floatAttenuation![o] = constant;
  flatArrays.floatAttenuation![o + 1] = linear;
  flatArrays.floatAttenuation![o + 2] = quadratic;
  flatArrays.floatCutoff![index] = isSpot ? (light as SpotLight).cutoff : 0;
  flatArrays.floatExponent![index] = isSpot ? (light as SpotLight).exponent : 0;
  flatArrays.floatType![index] = isDirectional ? 0 : isSpot ? 2 : 1;

  const q = index * 4;
  light.position.toArray(flatArrays.packedPosition!, q);
  flatArrays.packedPosition![q + 3] = flatArrays.floatType![index];
  light.diffuse.toArray(flatArrays.packedDiffuse!, q);
  flatArrays.packedDiffuse![q + 3] = flatArrays.floatCutoff![index];
  light.specular.toArray(flatArrays.packedSpecular!, q);
  flatArrays.packedSpecular![q + 3] = flatArrays.floatExponent![index];

  const dir = isDirectional || isSpot ? (light as SpotLight).direction : null;
  flatArrays.position.push(light.position.x, light.position.y, light.position.z);
  flatArrays.diffuse.push(light.diffuse.x, light.diffuse.y, light.diffuse.z);
  flatArrays.specular.push(light.specular.x, light.specular.y, light.specular.z);
  if (dir)
    flatArrays.direction.push(dir.x, dir.y, dir.z);
  else
    flatArrays.direction.push(0, 0, 0);
  flatArrays.constantAttenuation.push(constant);
  flatArrays.linearAttenuation.push(linear);
  flatArrays.quadraticAttenuation.push(quadratic);
  flatArrays.cutoff.push(isSpot ? (light as SpotLight).cutoff : 0);
  flatArrays.exponent.push(isSpot ? (light as SpotLight).exponent : 0);
  flatArrays.type.push(kind);
}

export function packLights(
  directionals: DirectionalLight[],
  points: PointLight[],
  spots: SpotLight[],
  ambients: AmbientLight[],
  flatArrays: IFlatLights,
  maxLights: number,
  extraAmbient?: Vec3
): IFlatLights {
  clearFlatArrays(flatArrays);

  const total = spots.length + points.length + directionals.length;
  const count = Math.min(total, maxLights);
  ensureLightBuffers(flatArrays, count);

  let index = 0;
  for (let i = 0; i < spots.length && index < count; i++)
    pushLight(flatArrays, index++, 'spot', spots[i]);
  for (let i = 0; i < points.length && index < count; i++)
    pushLight(flatArrays, index++, 'point', points[i]);
  for (let i = 0; i < directionals.length && index < count; i++)
    pushLight(flatArrays, index++, 'directional', directionals[i]);

  const ambient = scratchAmbient.origin();
  if (extraAmbient)
    ambient.add(extraAmbient);
  for (let i = 0; i < ambients.length; i++)
    ambient.addScaledVector(ambients[i].diffuse, ambients[i].intensity);

  if (!flatArrays.floatAmbient)
    flatArrays.floatAmbient = new Float32Array(3);
  ambient.toArray(flatArrays.floatAmbient);
  ambient.toArray(flatArrays.ambient);

  return flatArrays;
}
