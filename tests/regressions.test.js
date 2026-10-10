import { jest } from "@jest/globals";
import {
  Scene, Mesh, Quad, Material, Program, Texture, Lights, MAX_LIGHTS, PhongShader,
  PointLight, DirectionalLight, SpotLight, AmbientLight,
  PerspectiveCamera, OrbitControls, CustomMesh, BoundingBox, BoundingSphere, Ray,
  Vec3, Quat, Mat4x3
} from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

const close = (a, b, eps = 1e-5) => expect(Math.abs(a - b)).toBeLessThan(eps);

// Distinct attribute locations so slot tracking can be observed.
function createContext() {
  const context = createMockContext();
  const attributes = { aVertexPosition: 0, aVertexNormal: 1, aTextureCoord: 2 };
  context.getAttribLocation.mockImplementation((program, name) => attributes[name] ?? -1);
  return context;
}

const triangle = (extra = {}) => ({
  vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0],
  indices: null,
  normals: null,
  uvs: null,
  itemSize: 3,
  primitive: "TRIANGLES",
  subMeshes: [{ start: 0, count: 3 }],
  ...extra,
});

const emptyLights = () => ({
  position: [], diffuse: [], specular: [],
  constantAttenuation: [], linearAttenuation: [], quadraticAttenuation: [],
  cutoff: [], exponent: [], direction: [], type: [],
});

describe("Lights", () => {
  test("scene ambient color is part of the uploaded ambient uniform buffer", () => {
    const lights = new Lights();
    lights.addLight(new AmbientLight(new Vec3(0.1, 0.2, 0.3), 2));
    const flat = lights.flatten(new Vec3(1, 1, 1));
    expect(flat.ambient[0]).toBeCloseTo(1.2);
    expect(Array.from(flat.floatAmbient)[1]).toBeCloseTo(1.4);
    expect(Array.from(flat.floatAmbient)[2]).toBeCloseTo(1.6);
  });

  test("scene.render feeds scene.ambientColor into the lights", () => {
    const context = createContext();
    const scene = new Scene(context);
    scene.setAmbientColor(0.5, 0.25, 0.125);
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    scene.render(camera);
    expect(Array.from(scene.lights.flatArrays.floatAmbient)).toEqual([0.5, 0.25, 0.125]);
  });

  test("clamps to MAX_LIGHTS and warns once", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const lights = new Lights();
    for (let i = 0; i < MAX_LIGHTS + 3; i++)
      lights.addLight(new PointLight());
    const flat = lights.flatten();
    expect(flat.type.length).toBe(MAX_LIGHTS);
    expect(flat.floatPosition.length).toBe(MAX_LIGHTS * 3);
    lights.flatten();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test("reuses typed arrays while the light count is unchanged", () => {
    const lights = new Lights();
    const point = new PointLight();
    lights.addLight(point);
    const first = lights.flatten().floatPosition;
    point.setPosition(4, 5, 6);
    const second = lights.flatten().floatPosition;
    expect(second).toBe(first);
    expect(Array.from(second)).toEqual([4, 5, 6]);
  });

  test("light setters and constructors accept number arrays", () => {
    const directional = new DirectionalLight({ direction: [0, 0, -2], diffuse: [0.1, 0.2, 0.3] });
    expect(directional.direction.toArray()).toEqual([0, 0, -1]);
    expect(directional.diffuse.toArray()).toEqual([0.1, 0.2, 0.3]);
    const spot = new SpotLight({ position: [1, 2, 3], direction: [0, -1, 0] });
    expect(spot.position.toArray()).toEqual([1, 2, 3]);
    expect(spot.direction.toArray()).toEqual([0, -1, 0]);
  });
});

describe("Material", () => {
  test("accepts number arrays and Vec3 and keeps uniform arrays in place", () => {
    const material = new Material({ ambient: [0.1, 0.2, 0.3], diffuse: new Vec3(0.4, 0.5, 0.6) });
    expect(material.ambient.toArray()).toEqual([0.1, 0.2, 0.3]);
    expect(material.uniforms.materialAmbient.value).toEqual([0.1, 0.2, 0.3]);
    const array = material.uniforms.materialDiffuse.value;
    material.diffuse.x = 1;
    expect(material.updateUniforms()).toBe(true);
    expect(material.uniforms.materialDiffuse.value).toBe(array);
    expect(array[0]).toBe(1);
    expect(material.updateUniforms()).toBe(false);
  });

  test("version increments on every change", () => {
    const material = new Material();
    const v = material.version;
    material.setShininess(3);
    expect(material.version).toBeGreaterThan(v);
  });
});

describe("Scene", () => {
  test("setFog supports Vec3 and legacy numeric signatures", () => {
    const scene = new Scene(createContext());
    scene.setFog(new Vec3(0.1, 0.2, 0.3), 5, 50);
    expect(scene.fog).toEqual({ color: new Vec3(0.1, 0.2, 0.3), near: 5, far: 50 });
    scene.setFog(1, 0.5, 0.25, 2, 80);
    expect(scene.fog.color.toArray()).toEqual([1, 0.5, 0.25]);
    expect(scene.fog.near).toBe(2);
    expect(scene.fog.far).toBe(80);
  });

  test("resolves the context from canvasId and throws without any context", () => {
    const context = createContext();
    const canvas = { getContext: jest.fn(() => context) };
    expect(new Scene({ canvasId: canvas }).context).toBe(context);
    expect(() => new Scene({})).toThrow();
  });

  test("uploads the current resolution each frame", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.useBasicMaterial();
    scene.addMesh(mesh);
    scene.setSize(800, 600);
    scene.render(new PerspectiveCamera(45, 0.1, 100, context));
    expect(context.uniform2f).toHaveBeenLastCalledWith(mesh.programs[0].screenResolution, 800, 600);
  });

  test("per-frame uniforms are uploaded once per shared program, not once per mesh", () => {
    const context = createContext();
    const scene = new Scene(context);
    const meshes = [0, 1, 2].map(() => {
      const mesh = new Mesh(new Quad(2, 2), context);
      mesh.useBasicMaterial();
      scene.addMesh(mesh);
      return mesh;
    });
    expect(meshes[0].programs[0]).toBe(meshes[1].programs[0]);
    expect(context.createProgram).toHaveBeenCalledTimes(1);

    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    context.uniformMatrix4fv.mockClear();
    scene.render(camera);

    const projection = meshes[0].programs[0].projectionMatrix;
    const projectionUploads = context.uniformMatrix4fv.mock.calls.filter(c => c[0] === projection);
    expect(projectionUploads).toHaveLength(1);
    const modelUploads = context.uniformMatrix4fv.mock.calls.filter(c => c[0] === meshes[0].programs[0].modelMatrix);
    expect(modelUploads).toHaveLength(3);
  });

  test("renders children with their own blend mode and culling", () => {
    const context = createContext();
    const scene = new Scene(context);
    const parent = new Mesh(new Quad(2, 2), context);
    const blendedChild = new Mesh(new Quad(2, 2), context);
    blendedChild.activateBlendMode();
    parent.addChild(blendedChild);
    scene.addMesh(parent);
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);

    const parentSpy = jest.spyOn(parent, "renderSelf");
    const childSpy = jest.spyOn(blendedChild, "renderSelf");
    expect(scene.render(camera)).toBe(2);
    expect(parentSpy.mock.calls[0][4]).toBe(false);
    expect(childSpy.mock.calls[0][4]).toBe(true);
  });

  test("a child that is also a scene mesh is rendered once", () => {
    const context = createContext();
    const scene = new Scene(context);
    const parent = new Mesh(new Quad(2, 2), context);
    const child = new Mesh(new Quad(2, 2), context);
    parent.addChild(child);
    scene.addMesh(child);
    scene.addMesh(parent);
    expect(scene.render(new PerspectiveCamera(45, 0.1, 100, context))).toBe(2);
  });

  test("blend state is restored after drawing blended meshes", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.activateBlendMode();
    scene.addMesh(mesh);
    scene.render(new PerspectiveCamera(45, 0.1, 100, context));
    const calls = [...context.enable.mock.calls.map(c => ["e", c[0]]), ...context.disable.mock.calls.map(c => ["d", c[0]])];
    expect(calls.filter(c => c[1] === context.BLEND).length).toBeGreaterThan(0);
    expect(context.disable).toHaveBeenLastCalledWith(context.BLEND);
  });

  test("raycast reaches child meshes", () => {
    const context = createContext();
    const scene = new Scene(context);
    const parent = new Mesh(new Quad(2, 2), context);
    const child = new Mesh(new Quad(2, 2), context);
    child.setPosition(0, 0, -5);
    parent.addChild(child);
    scene.addMesh(parent);
    const hits = scene.raycast(new Ray(new Vec3(0, 0, 10), new Vec3(0, 0, -1)));
    expect(hits.map(h => h.mesh)).toEqual([parent, child]);
  });
});

describe("Mesh", () => {
  test("attribute arrays enabled for one mesh are disabled for the next", () => {
    const context = createContext();
    const full = new Mesh(triangle({ normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 0, 1] }), context);
    const plain = new Mesh(triangle(), context);
    full.useBasicMaterial();
    plain.useBasicMaterial();

    const lights = emptyLights();
    const args = [new Float32Array(16), new Float32Array(16), lights, 0, false];
    full.render(...args);
    expect(context.enableVertexAttribArray).toHaveBeenCalledWith(1);
    expect(context.enableVertexAttribArray).toHaveBeenCalledWith(2);

    context.disableVertexAttribArray.mockClear();
    plain.render(...args);
    expect(context.disableVertexAttribArray).toHaveBeenCalledWith(1);
    expect(context.disableVertexAttribArray).toHaveBeenCalledWith(2);
  });

  test("meshes without submeshes get a full-range submesh", () => {
    const mesh = new Mesh(triangle({ subMeshes: [] }), createContext());
    expect(mesh.nbSubMeshes).toBe(1);
    expect(mesh.subMeshes[0]).toMatchObject({ start: 0, count: 3 });
    expect(mesh.addProgram("v", "f", new Material())).toBe(true);
  });

  test("uses 32-bit indices when the extension is available", () => {
    const context = createContext();
    context.UNSIGNED_INT = 0x1405;
    context.getExtension.mockImplementation((name) => (name === "OES_element_index_uint" ? {} : null));
    const mesh = new Mesh(triangle({ indices: [0, 1, 70000], subMeshes: [{ start: 1, count: 3 }] }), context);
    mesh.useBasicMaterial();
    mesh.render(new Float32Array(16), new Float32Array(16), emptyLights(), 0, false);
    expect(context.drawElements).toHaveBeenCalledWith(context.TRIANGLES, 3, 0x1405, 4);
    const uploaded = context.bufferData.mock.calls.find(c => c[1] instanceof Uint32Array);
    expect(uploaded).toBeDefined();
  });

  test("keeps 16-bit indices when they fit and warns when they cannot", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const context = createContext();
    new Mesh(triangle({ indices: [0, 1, 2] }), context);
    expect(warn).not.toHaveBeenCalled();
    new Mesh(triangle({ indices: [0, 1, 70000] }), context);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test("bounding sphere honors itemSize", () => {
    const mesh = new Mesh({
      vertices: [0, 0, 4, 0, 4, 4],
      indices: null, normals: null, uvs: null,
      itemSize: 2, primitive: "TRIANGLES", subMeshes: [{ start: 0, count: 3 }],
    }, createContext());
    mesh.updateModelMatrix();
    expect(mesh.localBoundingSphere.center.z).toBe(0);
    expect(mesh.localBoundingSphere.radius).toBeCloseTo(Math.hypot(2, 2));
  });

  test("quaternion is the single rotation source and rotation is derived", () => {
    const { mesh } = { mesh: new Mesh(triangle(), createContext()) };
    mesh.setRotation(0.3, -0.2, 0.5);
    mesh.rotateY(0.4);
    const euler = mesh.rotation;
    const expected = new Quat().copy(mesh.quaternion);
    close(Math.abs(new Quat().setFromEuler(euler).dot(expected)), 1);
  });

  test("lookAt makes -Z face the target and survives translate", () => {
    const mesh = new Mesh(triangle(), createContext());
    mesh.setPosition(1, 2, 3);
    mesh.lookAt(new Vec3(5, 2, 3));
    mesh.updateModelMatrix();
    const forward = mesh.quaternion.multiplyVector(new Vec3(0, 0, -1));
    close(forward.x, 1);
    close(forward.y, 0);
    mesh.translate(0, 1, 0);
    mesh.updateModelMatrix();
    const forwardAfter = mesh.quaternion.multiplyVector(new Vec3(0, 0, -1));
    close(forwardAfter.x, 1);
  });

  test("array arguments are accepted by transform setters", () => {
    const mesh = new Mesh(triangle(), createContext());
    mesh.setPosition([1, 2, 3]).setScale([2, 2, 2]).translate([1, 1, 1]);
    expect(mesh.position.toArray()).toEqual([2, 3, 4]);
    expect(mesh.scale.toArray()).toEqual([2, 2, 2]);
  });

  test("world matrices are recomputed only when something changed", () => {
    const context = createContext();
    const scene = new Scene(context);
    const parent = new Mesh(triangle(), context);
    const child = new Mesh(triangle(), context);
    parent.addChild(child);
    scene.addMesh(parent);
    const camera = new PerspectiveCamera(45, 0.1, 100, context);

    scene.render(camera);
    const parentSpy = jest.spyOn(parent, "setWorldMatrix");
    const childSpy = jest.spyOn(child, "setWorldMatrix");
    scene.render(camera);
    expect(parentSpy).not.toHaveBeenCalled();
    expect(childSpy).not.toHaveBeenCalled();

    parent.setPosition(3, 0, 0);
    scene.render(camera);
    expect(parentSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(1);
    expect(child.getWorldPosition().x).toBe(3);

    child.setPosition(0, 2, 0);
    scene.render(camera);
    expect(parentSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(2);
    expect(child.getWorldPosition().toArray()).toEqual([3, 2, 0]);
  });

  test("normal matrix is cached across frames while the world matrix is unchanged", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(triangle({ normals: [0, 0, 1, 0, 0, 1, 0, 0, 1] }), context);
    mesh.useNormalMaterial();
    mesh.setScale(2, 2, 2);
    scene.addMesh(mesh);
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    scene.render(camera);
    expect(mesh.isNormalMatrixDirty).toBe(false);
    const spy = jest.spyOn(mesh.worldMatrix, "toNormalMatrix");
    mesh.computeNormalMatrix();
    scene.render(camera);
    mesh.computeNormalMatrix();
    expect(spy).not.toHaveBeenCalled();
  });

  test("shared programs are released when the last mesh clears them", () => {
    const context = createContext();
    const a = new Mesh(triangle(), context);
    const b = new Mesh(triangle(), context);
    a.addProgram("vs", "fs", new Material());
    b.addProgram("vs", "fs", new Material());
    expect(a.programs[0]).toBe(b.programs[0]);
    a.clearPrograms();
    expect(context.deleteProgram).not.toHaveBeenCalled();
    b.clearPrograms();
    expect(context.deleteProgram).toHaveBeenCalledTimes(1);
  });

  test("user supplied textures are not deleted by the mesh", () => {
    const context = createContext();
    const external = {};
    const mesh = new Mesh(triangle(), context);
    mesh.WebGLTexture = external;
    mesh.destroy();
    expect(context.deleteTexture).not.toHaveBeenCalled();

    const owner = new Mesh(triangle(), context);
    owner.setTexture(document.createElement("img"));
    const created = owner.WebGLTexture;
    owner.destroy();
    expect(context.deleteTexture).toHaveBeenCalledWith(created);
  });

  test("setTexture keeps the previous texture if creation fails", () => {
    const context = createContext();
    const mesh = new Mesh(triangle(), context);
    mesh.setTexture(document.createElement("img"));
    const previous = mesh.WebGLTexture;
    context.createTexture.mockReturnValueOnce(null);
    mesh.setTexture(document.createElement("img"));
    expect(mesh.WebGLTexture).toBe(previous);
    expect(context.deleteTexture).not.toHaveBeenCalled();
  });

  test("custom uniforms accept Spock vectors and matrices", () => {
    const context = createContext();
    const mesh = new Mesh(triangle(), context);
    mesh.addProgram("vs", "fs", new Material());
    mesh.addCustomUniform("tint", "uniform3fv", new Vec3(1, 2, 3));
    mesh.addCustomUniform("xform", "uniformMatrix4fv", new Mat4x3());
    mesh.render(new Float32Array(16), new Float32Array(16), emptyLights(), 0, false);
    expect(context.uniform3f).toHaveBeenCalledWith(mesh.programs[0].tint, 1, 2, 3);
    expect(context.uniformMatrix4fv).toHaveBeenCalledWith(mesh.programs[0].xform, false, mesh.customUniforms.xform.value.toArray());
  });

  test("camera position falls back to the inverse view matrix", () => {
    const context = createContext();
    const mesh = new Mesh(triangle(), context);
    mesh.addProgram("vs", "fs", new Material());
    const view = new Mat4x3().lookAtRH(new Vec3(3, 4, 5), new Vec3(), new Vec3(0, 1, 0));
    mesh.render(new Float32Array(16), view.toArray(), emptyLights(), 0, false);
    const [, x, y, z] = context.uniform3f.mock.calls.find(c => c[0] === mesh.programs[0].cameraPosition);
    close(x, 3); close(y, 4); close(z, 5);
  });
});

describe("Program", () => {
  test("create frees the shader objects after linking", () => {
    const context = createContext();
    Program.create(context, "v", "f");
    expect(context.detachShader).toHaveBeenCalledTimes(2);
    expect(context.deleteShader).toHaveBeenCalledTimes(2);
  });

  test("acquire shares by source and release deletes at zero references", () => {
    const context = createContext();
    const a = Program.acquire(context, "v", "f");
    const b = Program.acquire(context, "v", "f");
    const c = Program.acquire(context, "v", "other");
    expect(a).toBe(b);
    expect(c).not.toBe(a);
    Program.release(context, a);
    expect(context.deleteProgram).not.toHaveBeenCalled();
    Program.release(context, b);
    expect(context.deleteProgram).toHaveBeenCalledTimes(1);
    expect(Program.acquire(context, "v", "f")).not.toBe(a);
  });

  test("link errors are reported with console.error", () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const context = createContext();
    context.getProgramParameter.mockReturnValue(false);
    expect(Program.create(context, "v", "f")).toBeNull();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});

describe("Texture", () => {
  test("update applies the flipY option", () => {
    const context = createContext();
    const texture = Texture.create(document.createElement("img"), context);
    Texture.update(texture, document.createElement("img"), context, 0, 0, undefined, undefined, false);
    expect(context.pixelStorei).toHaveBeenLastCalledWith(context.UNPACK_FLIP_Y_WEBGL, 0);
  });

  test("mipmaps are skipped for non power-of-two textures on WebGL1", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const context = createContext();
    Texture.create({ width: 100, height: 60 }, context, { generateMipmaps: true });
    expect(context.generateMipmap).not.toHaveBeenCalled();
    Texture.create({ width: 128, height: 64 }, context, { generateMipmaps: true });
    expect(context.generateMipmap).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("Vector-first math", () => {
  test("BoundingBox.applyMatrix4 matches transforming every corner", () => {
    const box = new BoundingBox(new Vec3(-1, -2, -3), new Vec3(2, 1, 4));
    const m = new Mat4x3().compose(new Vec3(5, -1, 2), new Quat().setFromEuler(0.4, 0.9, -0.3), new Vec3(2, 1, 3));
    const expected = new BoundingBox();
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z])
          expected.expandByPoint(m.transformPoint(new Vec3(x, y, z)));
    const result = box.clone().applyMatrix4(m);
    for (const axis of ["x", "y", "z"]) {
      close(result.min[axis], expected.min[axis], 1e-4);
      close(result.max[axis], expected.max[axis], 1e-4);
    }
  });

  test("BoundingSphere.applyMatrix4 scales the radius by the largest axis scale", () => {
    const sphere = new BoundingSphere(new Vec3(1, 0, 0), 2);
    sphere.applyMatrix4(new Mat4x3().compose(new Vec3(0, 1, 0), new Quat(), new Vec3(1, 3, 2)));
    expect(sphere.center.toArray()).toEqual([1, 1, 0]);
    close(sphere.radius, 6);
  });

  test("BoundingBox and BoundingSphere honor stride 2", () => {
    const points = [0, 0, 4, 2];
    const box = new BoundingBox().setFromPoints(points, 2);
    expect(box.max.toArray()).toEqual([4, 2, 0]);
    const sphere = new BoundingSphere().setFromPoints(points, undefined, 2);
    expect(sphere.center.z).toBe(0);
  });

  test("Ray.intersectBox handles axis-aligned rays and misses", () => {
    const box = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));
    const hit = new Ray(new Vec3(0, 0, 5), new Vec3(0, 0, -1)).intersectBox(box);
    expect(hit.toArray()).toEqual([0, 0, 1]);
    expect(new Ray(new Vec3(3, 0, 5), new Vec3(0, 0, -1)).intersectBox(box)).toBeNull();
    expect(new Ray(new Vec3(0, 0, 5), new Vec3(0, 0, 1)).intersectBox(box)).toBeNull();
    const inside = new Ray(new Vec3(0, 0, 0), new Vec3(1, 0, 0)).intersectBox(box);
    expect(inside.toArray()).toEqual([1, 0, 0]);
  });

  test("CustomMesh smooth normals are normalized and fall back to +Y", () => {
    const mesh = new CustomMesh();
    mesh.setVertices([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 5, 5]);
    mesh.setIndices([0, 1, 2]);
    const normals = mesh.computeVertexNormals();
    expect(Array.from(normals.slice(0, 3))).toEqual([0, 0, 1]);
    expect(Array.from(normals.slice(9, 12))).toEqual([0, 1, 0]);
  });

  test("Camera caches projection-view and ray matrices until the camera changes", () => {
    const context = createContext();
    const camera = new PerspectiveCamera(60, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);
    const pv = Array.from(camera.getProjectionViewMatrix());
    const expected = camera.getProjectionMatrixObject();
    const product = new (expected.constructor)().copy(expected);
    product.multiplyAffine(camera.getViewMatrixObject());
    pv.forEach((v, i) => close(v, product.toArray()[i]));

    const ray = camera.getRay(0, 0);
    close(ray.direction.z, -1);

    camera.setPosition(10, 0, 0);
    camera.setTarget(0, 0, 0);
    const moved = camera.getRay(0, 0);
    close(moved.direction.x, -1);
    expect(Array.from(camera.getProjectionViewMatrix())).not.toEqual(pv);
  });
});

describe("OrbitControls", () => {
  const dom = () => ({ addEventListener: jest.fn(), removeEventListener: jest.fn(), style: {} });

  test("update skips the view matrix rebuild when nothing changed", () => {
    const context = createContext();
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);
    const controls = new OrbitControls(camera, dom());
    const spy = jest.spyOn(camera, "setViewMatrix");
    controls.update();
    controls.update();
    expect(spy).not.toHaveBeenCalled();
    controls.distance = 5;
    controls.update();
    expect(spy).toHaveBeenCalledTimes(1);
    camera.target.setScalar(1, 0, 0);
    controls.update();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test("sets touch-action and takes the shortest way around the azimuth", () => {
    const context = createContext();
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);
    const element = dom();
    const controls = new OrbitControls(camera, element);
    expect(element.style.touchAction).toBe("none");
    controls.enableDamping = true;
    controls.azimuth = Math.PI - 0.1;
    controls.targetAzimuth = -Math.PI + 0.1;
    controls.update(1 / 60);
    expect(controls.azimuth).toBeGreaterThan(Math.PI - 0.1);
  });

  test("damping with deltaTime is frame-rate independent", () => {
    const context = createContext();
    const make = () => {
      const camera = new PerspectiveCamera(45, 0.1, 100, context);
      camera.setPosition(0, 0, 10);
      camera.setTarget(0, 0, 0);
      const controls = new OrbitControls(camera, dom());
      controls.enableDamping = true;
      controls.targetDistance = 30;
      return controls;
    };
    const a = make();
    const b = make();
    for (let i = 0; i < 60; i++) a.update(1 / 60);
    for (let i = 0; i < 120; i++) b.update(1 / 120);
    close(a.distance, b.distance, 1e-3);
  });

  test("ignores pointer moves from other pointers", () => {
    const context = createContext();
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);
    const listeners = {};
    const element = { addEventListener: jest.fn((n, cb) => { listeners[n] = cb; }), removeEventListener: jest.fn(), style: {}, clientHeight: 500 };
    const windowListeners = {};
    const spy = jest.spyOn(window, "addEventListener").mockImplementation((n, cb) => { windowListeners[n] = cb; });
    const controls = new OrbitControls(camera, element);
    spy.mockRestore();
    listeners.pointerdown({ clientX: 0, clientY: 0, button: 0, pointerId: 1, isPrimary: true });
    const before = controls.targetAzimuth;
    windowListeners.pointermove({ clientX: 50, clientY: 0, pointerId: 2 });
    expect(controls.targetAzimuth).toBe(before);
    windowListeners.pointermove({ clientX: 50, clientY: 0, pointerId: 1 });
    expect(controls.targetAzimuth).not.toBe(before);
  });
});

describe("Packed light uniforms", () => {
  test("flatten packs (position, type), (diffuse, cutoff), (specular, exponent) as vec4", () => {
    const lights = new Lights();
    const spot = new SpotLight({ position: [1, 2, 3], diffuse: [0.1, 0.2, 0.3], specular: [0.4, 0.5, 0.6], cutoff: 30, exponent: 4 });
    const directional = new DirectionalLight({ direction: [0, -1, 0] });
    lights.addLight(directional);
    lights.addLight(spot);
    const flat = lights.flatten();
    expect(flat.packedPosition.length).toBe(8);
    expect(Array.from(flat.packedPosition.slice(0, 4))).toEqual([1, 2, 3, 2]);
    expect(Array.from(flat.packedDiffuse.slice(0, 4)).map(v => +v.toFixed(5))).toEqual([0.1, 0.2, 0.3, 30]);
    expect(Array.from(flat.packedSpecular.slice(0, 4)).map(v => +v.toFixed(5))).toEqual([0.4, 0.5, 0.6, 4]);
    expect(flat.packedPosition[7]).toBe(0);
  });

  test("meshes upload packed arrays with uniform4fv", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.usePhongMaterial();
    scene.addMesh(mesh);
    scene.addLight(new PointLight([1, 2, 3]));
    scene.render(new PerspectiveCamera(45, 0.1, 100, context));
    const program = mesh.programs[0];
    const upload = context.uniform4fv.mock.calls.find(c => c[0] === program.lightPositionType);
    expect(upload).toBeDefined();
    expect(Array.from(upload[1])).toEqual([1, 2, 3, 1]);
    expect(context.uniform4fv.mock.calls.some(c => c[0] === program.lightDiffuseCutoff)).toBe(true);
    expect(context.uniform4fv.mock.calls.some(c => c[0] === program.lightSpecularExponent)).toBe(true);
  });

  test("packs on the fly for hand-built light objects", () => {
    const context = createContext();
    const mesh = new Mesh(triangle(), context);
    mesh.usePhongMaterial();
    const lights = {
      ...emptyLights(),
      position: [1, 2, 3], diffuse: [1, 1, 1], specular: [1, 1, 1],
      cutoff: [0], exponent: [0], direction: [0, 0, 0], type: ["point"],
    };
    mesh.render(new Float32Array(16), new Float32Array(16), lights, 0, false);
    const upload = context.uniform4fv.mock.calls.find(c => c[0] === mesh.programs[0].lightPositionType);
    expect(Array.from(upload[1])).toEqual([1, 2, 3, 1]);
  });

  test("Phong shader uses the packed uniforms and fits in 64 fragment vectors", () => {
    const source = PhongShader.fragment;
    expect(source).toContain("uniform vec4 uLightPositionType[MAX_LIGHTS]");
    expect(source).not.toContain("uLightType");
    // Count uniform vectors: arrays of MAX_LIGHTS take 8 each, scalars and vectors take 1.
    const max = +/const int MAX_LIGHTS = (\d+)/.exec(source)[1];
    let vectors = 0;
    for (const m of source.matchAll(/^uniform\s+\w+\s+\w+(\[MAX_LIGHTS\])?;/gm))
      vectors += m[1] ? max : 1;
    expect(vectors).toBeLessThanOrEqual(64);
  });
});

describe("Per-mesh blend function and depth write", () => {
  const camera = (context) => new PerspectiveCamera(45, 0.1, 100, context);

  test("setBlend activates blending with custom factors", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.setBlend("SRC_ALPHA", "ONE_MINUS_SRC_ALPHA");
    scene.addMesh(mesh);
    scene.render(camera(context));
    expect(mesh.blendMode).toBe(true);
    expect(context.blendFunc).toHaveBeenLastCalledWith(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
  });

  test("default blending stays additive", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.activateBlendMode();
    scene.addMesh(mesh);
    scene.render(camera(context));
    expect(context.blendFunc).toHaveBeenLastCalledWith(context.SRC_ALPHA, context.ONE);
    expect(context.blendEquation).toHaveBeenLastCalledWith(context.FUNC_ADD);
  });

  test("blend state is only changed when consecutive meshes differ", () => {
    const context = createContext();
    const scene = new Scene(context);
    for (let i = 0; i < 3; i++) {
      const mesh = new Mesh(new Quad(2, 2), context);
      mesh.setBlend("SRC_ALPHA", "ONE_MINUS_SRC_ALPHA");
      scene.addMesh(mesh);
    }
    scene.render(camera(context));
    expect(context.blendFunc).toHaveBeenCalledTimes(1);
  });

  test("setDepthWrite(false) disables depth writes around the mesh and restores them", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.setBlend().setDepthWrite(false);
    scene.addMesh(mesh);
    context.depthMask.mockClear();
    scene.render(camera(context));
    const values = context.depthMask.mock.calls.map(c => c[0]);
    expect(values).toContain(false);
    expect(values[values.length - 1]).toBe(true);
  });

  test("opaque meshes can also skip depth writes", () => {
    const context = createContext();
    const scene = new Scene(context);
    const mesh = new Mesh(new Quad(2, 2), context);
    mesh.setDepthWrite(false);
    scene.addMesh(mesh);
    context.depthMask.mockClear();
    scene.render(camera(context));
    expect(context.depthMask.mock.calls.map(c => c[0])).toEqual([false, true]);
  });

  test("default meshes never touch depthMask beyond the initial state", () => {
    const context = createContext();
    const scene = new Scene(context);
    scene.addMesh(new Mesh(new Quad(2, 2), context));
    context.depthMask.mockClear();
    scene.render(camera(context));
    expect(context.depthMask.mock.calls.every(c => c[0] === true)).toBe(true);
  });
});
