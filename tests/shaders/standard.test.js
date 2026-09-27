import { BasicShader, NormalShader, PhongShader, Mesh, Cube, Vec3 } from '../../dist/roostr.js';
import { createMockContext } from '../helpers/webgl-mock.js';

describe('Standard Shaders and Material Helpers', () => {
  let context;
  beforeEach(() => {
    context = createMockContext();
  });

  test('shaders contain valid GLSL source code', () => {
    expect(BasicShader.vertex).toContain('aVertexPosition');
    expect(BasicShader.fragment).toContain('gl_FragColor');

    expect(NormalShader.vertex).toContain('vNormal');
    expect(NormalShader.fragment).toContain('gl_FragColor');

    expect(PhongShader.vertex).toContain('aVertexNormal');
    expect(PhongShader.fragment).toContain('uAmbientLight');
  });

  test('mesh.useBasicMaterial compiles and registers program', () => {
    const mesh = new Mesh(new Cube(1.0), context);
    mesh.useBasicMaterial({ color: new Vec3(1, 0, 0) });
    expect(mesh.nbPrograms).toBe(1);
    expect(mesh.programs[0]).toBeDefined();
  });

  test('mesh.usePhongMaterial compiles and registers program', () => {
    const mesh = new Mesh(new Cube(1.0), context);
    mesh.usePhongMaterial({
      diffuse: new Vec3(0, 1, 0),
      specular: new Vec3(1, 1, 1),
      shininess: 32
    });
    expect(mesh.nbPrograms).toBe(1);
    expect(mesh.programs[0]).toBeDefined();
  });

  test('mesh.useNormalMaterial compiles and registers program', () => {
    const mesh = new Mesh(new Cube(1.0), context);
    mesh.useNormalMaterial();
    expect(mesh.nbPrograms).toBe(1);
    expect(mesh.programs[0]).toBeDefined();
  });
});
