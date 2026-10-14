import type { IProgram, ICustomUniforms } from '../interfaces';
import type { Material } from '../material';

const initializedPrograms = new WeakSet<object>();

export function ucfirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function addProgramAttribute(context: WebGLRenderingContext, program: IProgram, name: string): void {
  program[name] = context.getAttribLocation(program, `a${ucfirst(name)}`);
}

export function addProgramUniform(context: WebGLRenderingContext, program: IProgram, name: string): void {
  const ucName = `u${ucfirst(name)}`;
  let loc = context.getUniformLocation(program, ucName);
  if (loc === null)
    loc = context.getUniformLocation(program, `${ucName}[0]`);
  program[name] = loc;
}

export function initProgramLocations(
  context: WebGLRenderingContext,
  program: IProgram,
  customUniforms: ICustomUniforms,
  materials: Material[]
): void {
  if (!initializedPrograms.has(program)) {
    initializedPrograms.add(program);

    addProgramAttribute(context, program, 'vertexPosition');
    addProgramAttribute(context, program, 'vertexNormal');
    addProgramAttribute(context, program, 'textureCoord');

    addProgramUniform(context, program, 'modelMatrix');
    addProgramUniform(context, program, 'normalMatrix');
    addProgramUniform(context, program, 'viewMatrix');
    addProgramUniform(context, program, 'projectionMatrix');

    addProgramUniform(context, program, 'time');
    addProgramUniform(context, program, 'screenResolution');

    addProgramUniform(context, program, 'sampler');
    addProgramUniform(context, program, 'hasTexture');

    addProgramUniform(context, program, 'nbLights');
    addProgramUniform(context, program, 'lightPosition');
    addProgramUniform(context, program, 'lightDiffuse');
    addProgramUniform(context, program, 'lightSpecular');
    addProgramUniform(context, program, 'lightDirection');
    addProgramUniform(context, program, 'lightAttenuation');
    addProgramUniform(context, program, 'lightCutoff');
    addProgramUniform(context, program, 'lightExponent');
    addProgramUniform(context, program, 'lightType');
    addProgramUniform(context, program, 'lightPositionType');
    addProgramUniform(context, program, 'lightDiffuseCutoff');
    addProgramUniform(context, program, 'lightSpecularExponent');
    addProgramUniform(context, program, 'ambientLight');
    addProgramUniform(context, program, 'ambientColor');
    addProgramUniform(context, program, 'cameraPosition');

    addProgramUniform(context, program, 'hasFog');
    addProgramUniform(context, program, 'fogColor');
    addProgramUniform(context, program, 'fogNear');
    addProgramUniform(context, program, 'fogFar');

    if (program.screenResolution) {
      context.useProgram(program);
      const viewport = context.getParameter(context.VIEWPORT);
      if (viewport && viewport.length >= 4)
        context.uniform2f(program.screenResolution, viewport[2], viewport[3]);
    }
  }

  for (const property in customUniforms)
    if (customUniforms.hasOwnProperty(property) && program[property] === undefined)
      addProgramUniform(context, program, property);

  for (const mat of materials)
    for (const property in mat.uniforms)
      if (mat.uniforms.hasOwnProperty(property) && program[property] === undefined)
        addProgramUniform(context, program, property);
}

export function syncMaterialUniforms(context: WebGLRenderingContext, programs: IProgram[], material: Material): void {
  const materialUniforms = material.uniforms;
  for (const property in materialUniforms)
    if (materialUniforms.hasOwnProperty(property))
      for (const program of programs)
        if (program[property] === undefined)
          program[property] = context.getUniformLocation(program, `u${ucfirst(property)}`);
}

export function syncCustomUniform(context: WebGLRenderingContext, programs: IProgram[], name: string): void {
  for (const program of programs)
    if (program[name] === undefined)
      program[name] = context.getUniformLocation(program, `u${ucfirst(name)}`);
}

export function syncTextureSampler(context: WebGLRenderingContext, programs: IProgram[]): void {
  for (const program of programs)
    if (program.sampler === undefined)
      program.sampler = context.getUniformLocation(program, 'uSampler');
}
