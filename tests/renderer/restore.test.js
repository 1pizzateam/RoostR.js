import { Renderer, RenderTarget, Scene, Mesh, Quad, Material, Program, BasicShader } from '../../dist/roostr.js';
import { createMockContext, createMockCanvas } from '../helpers/webgl-mock.js';

const VERTEX = 'attribute vec3 aVertexPosition; void main(void){ gl_Position = vec4(aVertexPosition, 1.0); }';
const FRAGMENT = 'precision mediump float; void main(void){ gl_FragColor = vec4(1.0); }';

function lose(canvas) {
  canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
}

function restore(canvas) {
  canvas.dispatchEvent(new Event('webglcontextrestored'));
}

describe('context loss and restore', () => {
  let context;
  let canvas;

  beforeEach(() => {
    context = createMockContext();
    canvas = createMockCanvas('canvas', context);
  });

  test('Program.reset makes the next acquire compile a new program', () => {
    const first = Program.acquire(context, VERTEX, FRAGMENT);
    expect(Program.acquire(context, VERTEX, FRAGMENT)).toBe(first);

    Program.reset(context);

    const second = Program.acquire(context, VERTEX, FRAGMENT);
    expect(second).not.toBe(first);
    expect(context.createProgram).toHaveBeenCalledTimes(2);
  });

  test('releasing a program from before the reset does not evict the new one', () => {
    const old = Program.acquire(context, VERTEX, FRAGMENT);
    Program.reset(context);
    const fresh = Program.acquire(context, VERTEX, FRAGMENT);

    Program.release(context, old);

    expect(Program.acquire(context, VERTEX, FRAGMENT)).toBe(fresh);
  });

  test('Program.sources returns the shaders of an acquired program only', () => {
    const program = Program.acquire(context, VERTEX, FRAGMENT);
    expect(Program.sources(program)).toEqual({ vertex: VERTEX, fragment: FRAGMENT });
    expect(Program.sources({})).toBeNull();
  });

  test('Renderer forgets shared programs when the context is restored, before calling back', () => {
    const seen = [];
    const renderer = new Renderer(canvas, {
      onContextLost: () => seen.push('lost'),
      onContextRestored: () => seen.push(Program.acquire(context, VERTEX, FRAGMENT)),
    });
    const before = Program.acquire(context, VERTEX, FRAGMENT);

    lose(canvas);
    expect(renderer.isContextLost).toBe(true);
    restore(canvas);

    expect(renderer.isContextLost).toBe(false);
    expect(seen[0]).toBe('lost');
    expect(seen[1]).not.toBe(before);
  });

  test('Mesh.restore rebuilds buffers and programs and keeps drawing settings', () => {
    const mesh = new Mesh(new Quad(), context);
    mesh.addProgram(BasicShader.vertex, BasicShader.fragment, new Material());
    mesh.setBlend('ONE', 'ONE');
    const oldProgram = mesh.programs[0];
    const oldVertexBuffer = mesh.vertexBuffer;

    Program.reset(context);
    mesh.restore();

    expect(mesh.vertexBuffer).not.toBe(oldVertexBuffer);
    expect(mesh.vertexBuffer).not.toBeNull();
    expect(mesh.programs).toHaveLength(1);
    expect(mesh.programs[0]).not.toBe(oldProgram);
    expect(mesh.nbPrograms).toBe(1);
    expect(mesh.blendMode).toBe(true);
    expect(mesh.blendOptions.source).toBe('ONE');
    expect(mesh.programs[0].modelMatrix).toBeDefined();
  });

  test('Mesh.restore looks up the locations of custom uniforms on the new program', () => {
    const mesh = new Mesh(new Quad(), context);
    mesh.addProgram(VERTEX, FRAGMENT, new Material());
    mesh.addCustomUniform('glow', 'uniform1f', 1);

    Program.reset(context);
    context.getUniformLocation.mockClear();
    mesh.restore();

    expect(context.getUniformLocation).toHaveBeenCalledWith(mesh.programs[0], 'uGlow');
  });

  test('Mesh.restore recreates an owned texture and restores children', () => {
    const parent = new Mesh(new Quad(), context);
    parent.addProgram(VERTEX, FRAGMENT, new Material());
    const child = new Mesh(new Quad(), context);
    child.addProgram(VERTEX, FRAGMENT, new Material());
    parent.addChild(child);
    const image = new Uint8Array([255, 255, 255, 255]);
    parent.setTexture(image, { width: 1, height: 1 });
    const oldTexture = parent.WebGLTexture;
    const oldChildBuffer = child.vertexBuffer;

    Program.reset(context);
    parent.restore();

    expect(parent.WebGLTexture).not.toBeNull();
    expect(parent.WebGLTexture).not.toBe(oldTexture);
    expect(child.vertexBuffer).not.toBe(oldChildBuffer);
    expect(child.programs[0]).toBe(parent.programs[0]);
  });

  test('a mesh with a program that cannot be rebuilt stops drawing instead of misdrawing', () => {
    const mesh = new Mesh(new Quad(), context);
    mesh.addProgram(context.createProgram(), new Material());

    mesh.restore();

    expect(mesh.active).toBe(false);
  });

  test('Scene.restore restores every mesh and forgets cached GL state', () => {
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(), context);
    mesh.addProgram(BasicShader.vertex, BasicShader.fragment, new Material());
    scene.addMesh(mesh);
    const oldBuffer = mesh.vertexBuffer;
    context.depthFunc.mockClear();

    Program.reset(context);
    scene.restore();

    expect(mesh.vertexBuffer).not.toBe(oldBuffer);
    expect(context.depthFunc).toHaveBeenCalled();
  });

  test('RenderTarget.restore creates new GL objects', () => {
    const target = new RenderTarget(64, 64, context);
    const { texture } = target;

    target.restore();

    expect(context.createFramebuffer).toHaveBeenCalledTimes(2);
    expect(context.createRenderbuffer).toHaveBeenCalledTimes(2);
    expect(target.texture).not.toBe(texture);
    expect(context.texImage2D).toHaveBeenLastCalledWith(
      context.TEXTURE_2D, 0, context.RGBA, 64, 64, 0, context.RGBA, context.UNSIGNED_BYTE, null
    );
  });
});
