import { jest } from '@jest/globals';
import { Scene, Mesh, Quad, DirectionalLight, OrthographicCamera, Material } from "../dist/roostr";
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
  const [projectionMatrix, viewMatrix] = renderSpy.mock.calls[0];
  expect(projectionMatrix).toEqual(camera.getProjectionMatrix());
  expect(viewMatrix).toEqual(camera.getViewMatrix());
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

