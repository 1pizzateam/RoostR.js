import { Vec2, Vec3, Quat, Mat3, Mat4, Mat4x3 } from '@1pizzateam/spock';

export type UniformValue = number | number[] | Float32Array | Int32Array | Vec2 | Vec3 | Quat | Mat3 | Mat4 | Mat4x3;

export class Uniform {
  type : string;
  value : UniformValue;

  constructor ( type:string, value:UniformValue ) {
    this.type = type;
    this.value = value;
  }

}

// Uploads a uniform; Spock vectors and matrices are sent without intermediate arrays.
export function uploadUniform(context: WebGLRenderingContext, location: WebGLUniformLocation, uniform: Uniform): void {
  const value = uniform.value;
  const type = uniform.type;
  if (value instanceof Vec3)
    context.uniform3f(location, value.x, value.y, value.z);
  else if (value instanceof Vec2)
    context.uniform2f(location, value.x, value.y);
  else if (value instanceof Quat)
    context.uniform4f(location, value.vector.x, value.vector.y, value.vector.z, value.w);
  else if (value instanceof Mat4 || value instanceof Mat4x3 || value instanceof Mat3) {
    if (value instanceof Mat3)
      context.uniformMatrix3fv(location, false, value.toArray());
    else
      context.uniformMatrix4fv(location, false, value.toArray());
  } else if (type.indexOf('Matrix') !== -1)
    (context as any)[type](location, false, value);
  else
    (context as any)[type](location, value);
}
