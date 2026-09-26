import { jest } from '@jest/globals';
import { Mesh, Quad, Material } from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

function createMesh(context = createMockContext()) {
  const quad = new Quad(2, 2);
  return { mesh: new Mesh(quad, context), context, quad };
}

test("creates vertex, index, normal and uv buffers only for the data provided", () => {
  const { mesh, context } = createMesh();
  // Quad has vertices + uvs but no indices/normals
  expect(mesh.vertexBuffer).not.toBeNull();
  expect(mesh.texCoordBuffer).not.toBeNull();
  expect(mesh.indexBuffer).toBeNull();
  expect(mesh.normalBuffer).toBeNull();
  expect(context.createBuffer).toHaveBeenCalledTimes(2);
});

test("selects drawArrays as the draw method when there are no indices", () => {
  const { mesh } = createMesh();
  expect(mesh.drawMethod).toBe("drawArrays");
});

test("selects drawElements as the draw method when indices are provided", () => {
  const context = createMockContext();
  const geometry = {
    vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0],
    indices: [0, 1, 2],
    normals: null,
    uvs: null,
    itemSize: 3,
    primitive: "TRIANGLES",
    subMeshes: [{ start: 0, count: 3 }],
  };
  const mesh = new Mesh(geometry, context);
  expect(mesh.drawMethod).toBe("drawElements");
  expect(mesh.indexBuffer).not.toBeNull();
});

test("is active by default and toggling flips its state", () => {
  const { mesh } = createMesh();
  expect(mesh.isActive()).toBe(true);
  mesh.setInactive();
  expect(mesh.isActive()).toBe(false);
  mesh.setActive();
  expect(mesh.isActive()).toBe(true);
  expect(mesh.toggleActive()).toBe(false);
  expect(mesh.isActive()).toBe(false);
});

test("addChild appends to the children list", () => {
  const { mesh } = createMesh();
  const { mesh: child } = createMesh();
  mesh.addChild(child);
  expect(mesh.children).toEqual([child]);
});

test("addProgram succeeds while nbPrograms is below nbSubMeshes and registers the material", () => {
  const { mesh } = createMesh();
  const material = new Material();
  expect(mesh.addProgram("vertex-src", "fragment-src", material)).toBe(true);
  expect(mesh.nbPrograms).toBe(1);
  expect(mesh.materials).toEqual([material]);
});

test("addProgram fails once nbPrograms reaches nbSubMeshes", () => {
  const { mesh } = createMesh(); // Quad has a single submesh
  const material = new Material();
  mesh.addProgram("vertex-src", "fragment-src", material);
  expect(mesh.addProgram("vertex-src-2", "fragment-src-2", new Material())).toBe(false);
  expect(mesh.nbPrograms).toBe(1);
});

test("clearPrograms resets programs and materials", () => {
  const { mesh } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  mesh.clearPrograms();
  expect(mesh.nbPrograms).toBe(0);
  expect(mesh.materials).toEqual([]);
});

test("addCustomUniform registers a new uniform once", () => {
  const { mesh } = createMesh();
  mesh.addCustomUniform("time", "uniform1f", 0);
  expect(mesh.customUniforms.time.type).toBe("uniform1f");
  expect(mesh.customUniforms.time.value).toBe(0);
});

test("setCustomUniform updates an already-registered uniform's value", () => {
  const { mesh } = createMesh();
  mesh.addCustomUniform("time", "uniform1f", 0);
  mesh.setCustomUniform("time", 1.5);
  expect(mesh.customUniforms.time.value).toBe(1.5);
});

test("setCustomUniform is a no-op for an unregistered uniform", () => {
  const { mesh } = createMesh();
  mesh.setCustomUniform("unknown", 42);
  expect(mesh.customUniforms.unknown).toBeUndefined();
});

test("setTexture creates and stores a WebGLTexture from the given image", () => {
  const { mesh } = createMesh();
  const img = document.createElement("img");
  mesh.setTexture(img);
  expect(mesh.WebGLTexture).not.toBeNull();
});

test("computeWorldMatrix combines the scene graph's world matrix with the model matrix", () => {
  const { mesh } = createMesh();
  const graph = {
    getWorldMatrix: jest.fn(() => mesh.worldMatrix),
    pushModelMatrix: jest.fn(),
    popModelMatrix: jest.fn(),
  };
  mesh.computeWorldMatrix(graph);
  expect(graph.getWorldMatrix).toHaveBeenCalled();
  expect(graph.pushModelMatrix).toHaveBeenCalledWith(mesh.worldMatrix);
  expect(graph.popModelMatrix).toHaveBeenCalled();
});

test("computeWorldMatrix recurses into children", () => {
  const { mesh } = createMesh();
  const { mesh: child } = createMesh();
  mesh.addChild(child);
  const graph = {
    getWorldMatrix: jest.fn(() => mesh.worldMatrix),
    pushModelMatrix: jest.fn(),
    popModelMatrix: jest.fn(),
  };
  const childSpy = jest.spyOn(child, "computeWorldMatrix");
  mesh.computeWorldMatrix(graph);
  expect(childSpy).toHaveBeenCalledWith(graph);
});

test("render draws active meshes matching the requested blend mode", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);

  expect(context.drawArrays).toHaveBeenCalled();
});

test("render does nothing for an inactive mesh", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  mesh.setInactive();

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  context.drawArrays.mockClear();
  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);

  expect(context.drawArrays).not.toHaveBeenCalled();
});

test("render skips submeshes whose blend mode doesn't match the requested pass", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  mesh.activateBlendMode();

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  context.drawArrays.mockClear();
  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);

  expect(context.drawArrays).not.toHaveBeenCalled();
});

test("activateBlendMode / deactivateBlendMode toggle the blendMode flag", () => {
  const { mesh } = createMesh();
  expect(mesh.blendMode).toBe(false);
  mesh.activateBlendMode();
  expect(mesh.blendMode).toBe(true);
  mesh.deactivateBlendMode();
  expect(mesh.blendMode).toBe(false);
});
