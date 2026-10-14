import { Mat4x3, Vec3 } from '@1pizzateam/spock';
import type { IFlatLights, IFrameInfo, IProgram } from '../interfaces';

const scratchView = new Mat4x3();
const scratchCamera = new Vec3();

export function lightTypeValue(type: string | number): number {
  return type === 'directional' ? 0 : type === 'point' ? 1 : 2;
}

// Interleaves 3-component vectors with one extra value each into vec4s (fallback for lights without packed arrays).
export function packVec4(xyz: ArrayLike<number | string>, w: ArrayLike<number | string>): Float32Array {
  const count = Math.floor(xyz.length / 3);
  const packed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    packed[i * 4] = <number>xyz[i * 3];
    packed[i * 4 + 1] = <number>xyz[i * 3 + 1];
    packed[i * 4 + 2] = <number>xyz[i * 3 + 2];
    packed[i * 4 + 3] = <number>w[i] || 0;
  }
  return packed;
}

export function uploadFrameUniforms(
  context: WebGLRenderingContext,
  program: IProgram,
  projectionMatrix: Float32Array,
  viewMatrix: Float32Array,
  lights: IFlatLights,
  time: number,
  cameraPosition?: Vec3,
  fog?: { color: Vec3; near: number; far: number } | null,
  frame?: IFrameInfo
): void {
  if (program.projectionMatrix)
    context.uniformMatrix4fv(program.projectionMatrix, false, projectionMatrix);
  if (program.viewMatrix)
    context.uniformMatrix4fv(program.viewMatrix, false, viewMatrix);
  if (program.time)
    context.uniform1f(program.time, time);
  if (frame && frame.resolution && program.screenResolution)
    context.uniform2f(program.screenResolution, frame.resolution.x, frame.resolution.y);

  // lights
  if (lights) {
    if (program.nbLights && lights.type)
      context.uniform1i(program.nbLights, lights.type.length);
    if (program.lightPosition && lights.position && lights.position.length > 0)
      context.uniform3fv(program.lightPosition, lights.floatPosition || new Float32Array(<number[]>lights.position));
    if (program.lightDiffuse && lights.diffuse && lights.diffuse.length > 0)
      context.uniform3fv(program.lightDiffuse, lights.floatDiffuse || new Float32Array(<number[]>lights.diffuse));
    if (program.lightSpecular && lights.specular && lights.specular.length > 0)
      context.uniform3fv(program.lightSpecular, lights.floatSpecular || new Float32Array(<number[]>lights.specular));
    if (program.lightDirection && lights.direction && lights.direction.length > 0)
      context.uniform3fv(program.lightDirection, lights.floatDirection || new Float32Array(<number[]>lights.direction));
    if (program.lightAttenuation && (lights.floatAttenuation || lights.constantAttenuation?.length)) {
      let attArr = lights.floatAttenuation;
      if (!attArr) {
        const att: number[] = [];
        for (let k = 0; k < lights.constantAttenuation.length; k++)
          att.push(
            <number>lights.constantAttenuation[k] || 0,
            <number>lights.linearAttenuation[k] || 0,
            <number>lights.quadraticAttenuation[k] || 0
          );
        attArr = new Float32Array(att);
      }
      context.uniform3fv(program.lightAttenuation, attArr);
    }
    if (program.lightCutoff && lights.cutoff && lights.cutoff.length > 0)
      context.uniform1fv(program.lightCutoff, lights.floatCutoff || new Float32Array(<number[]>lights.cutoff));
    if (program.lightExponent && lights.exponent && lights.exponent.length > 0)
      context.uniform1fv(program.lightExponent, lights.floatExponent || new Float32Array(<number[]>lights.exponent));
    if (program.lightType && (lights.floatType || lights.type?.length)) {
      let typeArr = lights.floatType;
      if (!typeArr)
        typeArr = new Float32Array(lights.type.map(t => t === 'directional' ? 0 : t === 'point' ? 1 : 2));
      context.uniform1fv(program.lightType, typeArr);
    }
    if (program.lightPositionType && lights.position && lights.position.length > 0)
      context.uniform4fv(program.lightPositionType, lights.packedPosition || packVec4(lights.position, (lights.type || []).map(lightTypeValue)));
    if (program.lightDiffuseCutoff && lights.diffuse && lights.diffuse.length > 0)
      context.uniform4fv(program.lightDiffuseCutoff, lights.packedDiffuse || packVec4(lights.diffuse, lights.cutoff || []));
    if (program.lightSpecularExponent && lights.specular && lights.specular.length > 0)
      context.uniform4fv(program.lightSpecularExponent, lights.packedSpecular || packVec4(lights.specular, lights.exponent || []));
    if (program.ambientLight && lights.ambient)
      context.uniform3fv(program.ambientLight, lights.floatAmbient || new Float32Array(lights.ambient));
  }

  // camera position
  if (program.cameraPosition) {
    let camera = cameraPosition;
    if (!camera && viewMatrix) {
      // The camera position is the translation of the inverted view matrix.
      scratchView.toArray().set(viewMatrix);
      camera = scratchView.invertAffine().getTranslation(scratchCamera);
    }
    if (camera)
      context.uniform3f(program.cameraPosition, camera.x, camera.y, camera.z);
  }

  // fog
  if (program.hasFog) {
    if (fog) {
      context.uniform1i(program.hasFog, 1);
      if (program.fogColor)
        context.uniform3f(program.fogColor, fog.color.x, fog.color.y, fog.color.z);
      if (program.fogNear)
        context.uniform1f(program.fogNear, fog.near);
      if (program.fogFar)
        context.uniform1f(program.fogFar, fog.far);
    } else
      context.uniform1i(program.hasFog, 0);
  }
}
