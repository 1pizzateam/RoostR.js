import { jest } from '@jest/globals';
import { Mesh, Quad, Cube, Material, Mat4x3, Vec3, Quat } from "../dist/roostr";
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

test("render binds normal buffer and sets 3-component normal attribute pointer when geometry has normals", () => {
  const context = createMockContext();
  const cube = new Cube(2);
  const mesh = new Mesh(cube, context);
  mesh.addProgram("vertex-src", "fragment-src", new Material());

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);

  expect(context.bindBuffer).toHaveBeenCalledWith(context.ARRAY_BUFFER, mesh.normalBuffer);
  expect(context.vertexAttribPointer).toHaveBeenCalledWith(
    expect.anything(),
    3,
    context.FLOAT,
    false,
    0,
    0
  );
});

test("render does not crash when active mesh has no programs", () => {
  const { mesh } = createMesh();
  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };
  expect(() => {
    mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  }).not.toThrow();
});

test("addProgram returns false if shader program fails to link", () => {
  const context = createMockContext();
  context.getProgramParameter.mockReturnValue(false);
  const quad = new Quad(2, 2);
  const mesh = new Mesh(quad, context);
  const result = mesh.addProgram("vert", "frag", new Material());
  expect(result).toBe(false);
  expect(mesh.nbPrograms).toBe(0);
});

test("drawArrays respects submesh start offset", () => {
  const context = createMockContext();
  const geometry = {
    vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    indices: null,
    normals: null,
    uvs: null,
    itemSize: 3,
    primitive: "TRIANGLES",
    subMeshes: [{ start: 1, count: 3 }],
  };
  const mesh = new Mesh(geometry, context);
  mesh.addProgram("vert", "frag", new Material());
  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };
  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  expect(context.drawArrays).toHaveBeenCalledWith(context.TRIANGLES, 1, 3);
});

test("setTexture after addProgram updates sampler uniform on existing programs", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  const img = document.createElement("img");
  mesh.setTexture(img);
  expect(context.getUniformLocation).toHaveBeenCalledWith(expect.anything(), "uSampler");
});

test("initializes modelMatrix and rotationMatrix to identity", () => {
  const { mesh } = createMesh();
  const identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  expect(mesh.modelMatrix.toArray()).toEqual(identity);
  expect(mesh.rotationMatrix.toArray()).toEqual(identity);
});

test("computeWorldMatrix preserves identity when local modelMatrix and parent are identity", () => {
  const { mesh } = createMesh();
  const parentMatrix = new Mat4x3();
  parentMatrix.identity();
  const graph = {
    getWorldMatrix: jest.fn(() => parentMatrix),
    pushModelMatrix: jest.fn(),
    popModelMatrix: jest.fn(),
  };
  mesh.computeWorldMatrix(graph);
  const identity = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
  expect(mesh.worldMatrix.toArray()).toEqual(identity);
});

test("addCustomUniform after addProgram updates uniform location on existing programs", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  context.getUniformLocation.mockClear();
  mesh.addCustomUniform("customAlpha", "uniform1f", 0.5);
  expect(context.getUniformLocation).toHaveBeenCalledWith(expect.anything(), "uCustomAlpha");
});

test("render falls back to last material when mesh has more submeshes than materials", () => {
  const context = createMockContext();
  const geometry = {
    vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    indices: [0, 1, 2, 1, 2, 3],
    normals: null,
    uvs: null,
    itemSize: 3,
    primitive: "TRIANGLES",
    subMeshes: [
      { start: 0, count: 3 },
      { start: 3, count: 3 },
    ],
  };
  const mesh = new Mesh(geometry, context);
  const material = new Material();
  mesh.addProgram("vert", "frag", material);

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  expect(() => {
    mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  }).not.toThrow();
  expect(context.drawElements).toHaveBeenCalledTimes(2);
});

test("parent mesh with 0 programs still renders active children", () => {
  const { mesh: parent } = createMesh(); // no programs added
  const { mesh: child, context } = createMesh();
  child.addProgram("vert", "frag", new Material());
  parent.addChild(child);

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  parent.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  expect(context.drawArrays).toHaveBeenCalled();
});

test("addChild ignores duplicate children and removeChild detaches child", () => {
  const { mesh: parent } = createMesh();
  const { mesh: child } = createMesh();
  parent.addChild(child);
  parent.addChild(child);
  expect(parent.children.length).toBe(1);

  expect(parent.removeChild(child)).toBe(true);
  expect(parent.children).toEqual([]);
  expect(parent.removeChild(child)).toBe(false);
});

test("clearPrograms deletes WebGL programs via context.deleteProgram", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vert", "frag", new Material());
  expect(mesh.programs.length).toBe(1);
  mesh.clearPrograms();
  expect(context.deleteProgram).toHaveBeenCalled();
  expect(mesh.nbPrograms).toBe(0);
});

test("setTexture deletes previous texture on reassignment to prevent memory leak", () => {
  const { mesh, context } = createMesh();
  const img1 = document.createElement("img");
  const img2 = document.createElement("img");
  mesh.setTexture(img1);
  const firstTexture = mesh.WebGLTexture;
  mesh.setTexture(img2);
  expect(context.deleteTexture).toHaveBeenCalledWith(firstTexture);
});

test("addMaterial after addProgram resolves uniform locations without throwing", () => {
  const context = createMockContext();
  const geometry = {
    vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
    indices: [0, 1, 2, 1, 2, 3],
    normals: null,
    uvs: null,
    itemSize: 3,
    primitive: "TRIANGLES",
    subMeshes: [
      { start: 0, count: 3 },
      { start: 3, count: 3 },
    ],
  };
  const mesh = new Mesh(geometry, context);
  mesh.addProgram("vert", "frag", new Material());
  expect(() => {
    mesh.addMaterial(new Material());
  }).not.toThrow();
  expect(mesh.materials.length).toBe(2);
});

test("render passes false for transpose to custom matrix uniforms", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vert", "frag", new Material());
  const matrixData = new Float32Array(16);
  mesh.addCustomUniform("testMatrix", "uniformMatrix4fv", matrixData);
  mesh.programs[0].testMatrix = { id: "testMatrixLoc" };

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  expect(context.uniformMatrix4fv).toHaveBeenCalledWith(
    { id: "testMatrixLoc" },
    false,
    matrixData
  );
});

test("render binds UV buffer when geometry has uvs even without a WebGLTexture", () => {
  const { mesh, context } = createMesh(); // Quad has uvs but no WebGLTexture set
  mesh.addProgram("vert", "frag", new Material());
  mesh.programs[0].textureCoord = 2; // attribute exists and is enabled

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  expect(context.bindBuffer).toHaveBeenCalledWith(context.ARRAY_BUFFER, mesh.texCoordBuffer);
  expect(context.vertexAttribPointer).toHaveBeenCalledWith(2, 2, context.FLOAT, false, 0, 0);
});

test("destroy cleans up buffers, textures, and programs", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vert", "frag", new Material());
  mesh.setTexture(document.createElement("img"));

  mesh.destroy();

  expect(context.deleteBuffer).toHaveBeenCalled();
  expect(context.deleteTexture).toHaveBeenCalled();
  expect(context.deleteProgram).toHaveBeenCalled();
  expect(mesh.vertexBuffer).toBeNull();
  expect(mesh.texCoordBuffer).toBeNull();
  expect(mesh.WebGLTexture).toBeNull();
  expect(mesh.nbPrograms).toBe(0);
});

test("setPosition, setRotation, setScale and translate update transforms and modelMatrix", () => {
  const { mesh } = createMesh();
  mesh.setPosition(1, 2, 3);
  mesh.setScale(2);
  mesh.rotateY(Math.PI / 2);
  mesh.translate(0, 1, 0);

  expect(mesh.position.toArray()).toEqual([1, 3, 3]);
  expect(mesh.scale.toArray()).toEqual([2, 2, 2]);

  mesh.updateModelMatrix();
  const arr = mesh.modelMatrix.toArray();
  expect(arr[12]).toBe(1);
  expect(arr[13]).toBe(3);
  expect(arr[14]).toBe(3);
});

test("setQuaternion rotates mesh using quaternion and updates modelMatrix", () => {
  const { mesh } = createMesh();
  const q = new Quat().setAxisAngle(new Vec3(0, 1, 0), Math.PI);
  mesh.setQuaternion(q);
  mesh.setPosition(new Vec3(10, 0, 0));

  mesh.updateModelMatrix();
  const arr = mesh.modelMatrix.toArray();
  expect(arr[12]).toBe(10);
  expect(arr[13]).toBe(0);
  expect(arr[14]).toBe(0);
  // cos(PI) = -1
  expect(arr[0]).toBeCloseTo(-1);
  expect(arr[10]).toBeCloseTo(-1);
});

test("computeNormalMatrix computes the transposed inverse of worldMatrix linear part", () => {
  const { mesh } = createMesh();
  mesh.setPosition(5, 5, 5);
  mesh.setScale(2, 2, 2);
  mesh.updateModelMatrix();
  mesh.setWorldMatrix(new Mat4x3().identity());

  const normalMat = mesh.computeNormalMatrix();
  const arr = normalMat.toArray();
  // Normal matrix scales inverse: (1/2, 1/2, 1/2) along diagonal
  expect(arr[0]).toBeCloseTo(0.5);
  expect(arr[4]).toBeCloseTo(0.5);
  expect(arr[8]).toBeCloseTo(0.5);
});

test("getWorldPosition extracts translation from worldMatrix", () => {
  const { mesh } = createMesh();
  mesh.setPosition(7, 8, 9);
  const graph = {
    getWorldMatrix: () => new Mat4x3().identity(),
    pushModelMatrix: () => {},
    popModelMatrix: () => {},
  };
  mesh.computeWorldMatrix(graph);
  const worldPos = mesh.getWorldPosition();
  expect(worldPos.toArray()).toEqual([7, 8, 9]);
});

test("render sends normalMatrix uniform if present in program", () => {
  const { mesh, context } = createMesh();
  mesh.addProgram("vert", "frag", new Material());
  mesh.programs[0].normalMatrix = { name: "uNormalMatrix" };

  const lights = {
    position: [], diffuse: [], specular: [],
    constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
    cutoff: [], exponent: [], direction: [], type: [],
  };

  mesh.render(new Float32Array(16), new Float32Array(12), lights, 0, false);
  expect(context.uniformMatrix3fv).toHaveBeenCalledWith(
    { name: "uNormalMatrix" },
    false,
    expect.any(Float32Array)
  );
});

