import { jest } from '@jest/globals';
import { Scene, Mesh, Quad, DirectionalLight, PointLight, SpotLight, OrthographicCamera, PerspectiveCamera, Material, Vec3 } from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

function createScene() {
  const context = createMockContext();
  const scene = new Scene(context);
  return { scene, context };
}

test("applies default renderer settings on construction", () => {
  const { context } = createScene();
  expect(context.depthFunc).toHaveBeenCalledWith(context.LEQUAL);
  expect(context.enable).toHaveBeenCalledWith(context.DEPTH_TEST);
  expect(context.depthMask).toHaveBeenCalledWith(true);
  expect(context.disable).toHaveBeenCalledWith(context.BLEND);
});

test("starts with no meshes", () => {
  const { scene } = createScene();
  expect(scene.meshes).toEqual([]);
  expect(scene.nbMeshes).toBe(0);
});

test("addMesh appends a mesh and increments the mesh count", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(2, 2), context);
  scene.addMesh(mesh);
  expect(scene.meshes).toEqual([mesh]);
  expect(scene.nbMeshes).toBe(1);
});

test("clearMeshes empties the mesh list and resets the count", () => {
  const { scene, context } = createScene();
  scene.addMesh(new Mesh(new Quad(2, 2), context));
  scene.clearMeshes();
  expect(scene.meshes).toEqual([]);
  expect(scene.nbMeshes).toBe(0);
});

test("addLight registers a light and getLightsProperty exposes its flattened data", () => {
  const { scene } = createScene();
  const light = new DirectionalLight();
  scene.addLight(light);

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  scene.render(camera, 0); // flattens registered lights as a side effect

  const positions = scene.getLightsProperty("position");
  expect(positions).toEqual([0, 0, 0]);
});

test("enableBlendMode / disableBlendMode delegate to the renderer", () => {
  const { scene, context } = createScene();
  scene.enableBlendMode("FUNC_ADD", "SRC_ALPHA", "ONE");
  expect(context.blendEquation).toHaveBeenCalledWith(context.FUNC_ADD);
  expect(context.blendFunc).toHaveBeenCalledWith(context.SRC_ALPHA, context.ONE);
  expect(context.enable).toHaveBeenCalledWith(context.BLEND);

  scene.disableBlendMode();
  expect(context.disable).toHaveBeenCalledWith(context.BLEND);
});

test("getRendererBlendMode reads the BLEND parameter from the context", () => {
  const { scene, context } = createScene();
  scene.getRendererBlendMode();
  expect(context.getParameter).toHaveBeenCalledWith(context.BLEND);
});

test("render draws every active mesh using the camera's matrices", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(2, 2), context);
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  const renderSpy = jest.spyOn(mesh, "render");
  scene.addMesh(mesh);

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  scene.render(camera, 16);

  expect(renderSpy).toHaveBeenCalled();
  const [projectionMatrix, viewMatrix, , time] = renderSpy.mock.calls[0];
  expect(projectionMatrix).toEqual(camera.getProjectionMatrix());
  expect(viewMatrix).toEqual(camera.getViewMatrix());
  expect(time).toBe(16);

  // Calling scene.render without explicit time defaults to Time.now() (> 0)
  scene.render(camera);
  const [, , , defaultTime] = renderSpy.mock.calls[1];
  expect(typeof defaultTime).toBe("number");
  expect(defaultTime).toBeGreaterThan(0);
});

test("clearLights empties registered lights", () => {
  const { scene } = createScene();
  scene.addLight(new DirectionalLight());
  scene.clearLights();
  const positions = scene.getLightsProperty("position");
  expect(positions).toEqual([]);
});

test("getLightsProperty returns undefined for unknown property", () => {
  const { scene } = createScene();
  expect(scene.getLightsProperty("unknownProperty")).toBeUndefined();
});

test("addMesh ignores duplicate mesh additions", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(2, 2), context);
  scene.addMesh(mesh);
  scene.addMesh(mesh);
  expect(scene.meshes.length).toBe(1);
  expect(scene.nbMeshes).toBe(1);
});

test("removeMesh removes a mesh and decrements count", () => {
  const { scene, context } = createScene();
  const mesh1 = new Mesh(new Quad(2, 2), context);
  const mesh2 = new Mesh(new Quad(2, 2), context);
  scene.addMesh(mesh1);
  scene.addMesh(mesh2);
  expect(scene.removeMesh(mesh1)).toBe(true);
  expect(scene.meshes).toEqual([mesh2]);
  expect(scene.nbMeshes).toBe(1);
  expect(scene.removeMesh(mesh1)).toBe(false);
});

test("removeLight removes a light and updates scene lights", () => {
  const { scene } = createScene();
  const light = new DirectionalLight();
  scene.addLight(light);
  expect(scene.lights.nbDirectionals).toBe(1);
  expect(scene.removeLight(light)).toBe(true);
  expect(scene.lights.nbDirectionals).toBe(0);
  expect(scene.removeLight(light)).toBe(false);
});

test("supports ambientColor and fog configuration", () => {
  const { scene } = createScene();
  scene.ambientColor.setScalar(0.2, 0.3, 0.4);
  expect(scene.ambientColor.x).toBe(0.2);

  scene.fog = {
    color: new Vec3(0.5, 0.5, 0.5),
    near: 10,
    far: 50,
    density: 0.02
  };
  expect(scene.fog.near).toBe(10);
  expect(scene.fog.far).toBe(50);
});

test("frustum culling skips rendering meshes outside frustum when enabled", () => {
  const { scene, context } = createScene();
  const camera = new PerspectiveCamera(45, 0.1, 100, context);
  camera.setPosition(0, 0, 10);
  camera.setTarget(0, 0, 0);

  const meshIn = new Mesh(new Quad(2, 2), context);
  meshIn.setPosition(0, 0, 0);
  scene.addMesh(meshIn);

  const meshFarOut = new Mesh(new Quad(2, 2), context);
  meshFarOut.setPosition(1000, 1000, 0);
  scene.addMesh(meshFarOut);

  scene.enableFrustumCulling = true;
  const rendered = scene.render(camera);
  expect(rendered).toBe(1); // Only meshIn is rendered
});

test("renderBlended sorts meshes by depth back-to-front", () => {
  const { scene, context } = createScene();
  const camera = new PerspectiveCamera(45, 0.1, 100, context);
  camera.setPosition(0, 0, 10);
  camera.setTarget(0, 0, 0);

  const meshNear = new Mesh(new Quad(2, 2), context);
  meshNear.activateBlendMode();
  meshNear.setPosition(0, 0, 5);
  scene.addMesh(meshNear);

  const meshFar = new Mesh(new Quad(2, 2), context);
  meshFar.activateBlendMode();
  meshFar.setPosition(0, 0, -5);
  scene.addMesh(meshFar);

  const rendered = scene.renderBlended(camera);
  expect(rendered).toBe(2);
});

test("render passes camera.position and scene.fog to mesh.render", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(2, 2), context);
  mesh.addProgram("vert", "frag", new Material());
  const renderSpy = jest.spyOn(mesh, "render");
  scene.addMesh(mesh);

  scene.setFog(new Vec3(0.1, 0.2, 0.3), 5, 50);

  const camera = new PerspectiveCamera(45, 0.1, 100, context);
  camera.setPosition(10, 20, 30);

  scene.render(camera);

  expect(renderSpy).toHaveBeenCalled();
  const [, , , , , camPos, fog] = renderSpy.mock.calls[0];
  expect(camPos.x).toBe(10);
  expect(camPos.y).toBe(20);
  expect(camPos.z).toBe(30);
  expect(fog.color.toArray()).toEqual([0.1, 0.2, 0.3]);
  expect(fog.near).toBe(5);
  expect(fog.far).toBe(50);
});

test("flattening mixed light types keeps properties aligned and provides typed arrays", () => {
  const { scene } = createScene();
  const dirLight = new DirectionalLight();
  dirLight.setDirection(0, -1, 0);

  const ptLight = new PointLight();
  ptLight.setPosition(1, 2, 3);

  const spotLight = new SpotLight();
  spotLight.setPosition(4, 5, 6);
  spotLight.setDirection(0, 0, -1);
  spotLight.setCutoff(0.9);

  scene.addLight(dirLight);
  scene.addLight(ptLight);
  scene.addLight(spotLight);

  const flat = scene.lights.flatten();

  expect(flat.type).toEqual(["spot", "point", "directional"]);
  expect(flat.floatType).toBeInstanceOf(Float32Array);
  expect(Array.from(flat.floatType)).toEqual([2, 1, 0]);

  // Direction array has 3 vectors (9 components), 1 per light
  expect(flat.direction.length).toBe(9);
  expect(flat.floatDirection).toBeInstanceOf(Float32Array);
  // Cutoff array has 3 entries (1 per light, spot is first)
  expect(flat.cutoff.length).toBe(3);
  expect(flat.cutoff[0]).toBe(0.9);
  expect(flat.floatCutoff).toBeInstanceOf(Float32Array);
  // Attenuation has 9 entries (3 components per light)
  expect(flat.constantAttenuation.length).toBe(3);
  expect(flat.floatAttenuation).toBeInstanceOf(Float32Array);
  expect(flat.floatPosition).toBeInstanceOf(Float32Array);
});

