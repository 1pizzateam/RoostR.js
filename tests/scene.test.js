import { jest } from '@jest/globals';
import { Scene, Mesh, Quad, QuadBatch, DirectionalLight, PointLight, SpotLight, OrthographicCamera, PerspectiveCamera, Material, CustomMesh, Vec3, Vec2, Rect, BoundingBox } from "../dist/roostr";
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
  const mesh = new Mesh(new Quad(new Vec2(2, 2)), context);
  scene.addMesh(mesh);
  expect(scene.meshes).toEqual([mesh]);
  expect(scene.nbMeshes).toBe(1);
});

test("clearMeshes empties the mesh list and resets the count", () => {
  const { scene, context } = createScene();
  scene.addMesh(new Mesh(new Quad(new Vec2(2, 2)), context));
  scene.clearMeshes();
  expect(scene.meshes).toEqual([]);
  expect(scene.nbMeshes).toBe(0);
});

test("addLight registers a light and getLightsProperty exposes its flattened data", () => {
  const { scene } = createScene();
  const light = new DirectionalLight();
  scene.addLight(light);

  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
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
  const mesh = new Mesh(new Quad(new Vec2(2, 2)), context);
  mesh.addProgram("vertex-src", "fragment-src", new Material());
  const renderSpy = jest.spyOn(mesh, "renderSelf");
  scene.addMesh(mesh);

  const camera = new OrthographicCamera(new Rect(new Vec2(2, 2), new Vec2(0, 0)), new Vec2(0.1, 100));
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
  const mesh = new Mesh(new Quad(new Vec2(2, 2)), context);
  scene.addMesh(mesh);
  scene.addMesh(mesh);
  expect(scene.meshes.length).toBe(1);
  expect(scene.nbMeshes).toBe(1);
});

test("removeMesh removes a mesh and decrements count", () => {
  const { scene, context } = createScene();
  const mesh1 = new Mesh(new Quad(new Vec2(2, 2)), context);
  const mesh2 = new Mesh(new Quad(new Vec2(2, 2)), context);
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
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 0));

  const meshIn = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshIn.setPosition(new Vec3(0, 0, 0));
  scene.addMesh(meshIn);

  const meshFarOut = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshFarOut.setPosition(new Vec3(1000, 1000, 0));
  scene.addMesh(meshFarOut);

  scene.enableFrustumCulling = true;
  const rendered = scene.render(camera);
  expect(rendered).toBe(1); // Only meshIn is rendered
});

test("setLocalBounds sizes culling bounds of a mesh whose buffer starts empty", () => {
  const { scene, context } = createScene();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 0));

  const geometry = new CustomMesh();
  geometry.setVertices([new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(0, 0, 0)]);
  geometry.setPrimitive("LINES");
  const mesh = new Mesh(geometry, context);
  mesh.addProgram("void main(){}", "void main(){}", new Material());
  scene.addMesh(mesh);
  scene.enableFrustumCulling = true;

  // all-zero vertices measure as an empty point at the origin, which is in view
  mesh.setLocalBounds(new BoundingBox(new Vec3(500, 500, 0), new Vec3(520, 520, 10)));
  expect(scene.render(camera)).toBe(0);

  mesh.setLocalBounds(new BoundingBox(new Vec3(-1, -1, 0), new Vec3(1, 1, 1)));
  expect(scene.render(camera)).toBe(1);

  mesh.setPosition(new Vec3(1000, 0, 0)); // the bounds follow the mesh transform
  expect(scene.render(camera)).toBe(0);
});

test("renderBlended sorts meshes by depth back-to-front", () => {
  const { scene, context } = createScene();
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 0));

  const meshNear = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshNear.activateBlendMode();
  meshNear.setPosition(new Vec3(0, 0, 5));
  scene.addMesh(meshNear);

  const meshFar = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshFar.activateBlendMode();
  meshFar.setPosition(new Vec3(0, 0, -5));
  scene.addMesh(meshFar);

  const rendered = scene.renderBlended(camera);
  expect(rendered).toBe(2);
});

test("render passes camera.position and scene.fog to mesh.renderSelf", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(new Vec2(2, 2)), context);
  mesh.addProgram("vert", "frag", new Material());
  const renderSpy = jest.spyOn(mesh, "renderSelf");
  scene.addMesh(mesh);

  scene.setFog(new Vec3(0.1, 0.2, 0.3), 5, 50);

  const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
  camera.setPosition(new Vec3(10, 20, 30));

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

test("setSize updates canvas size and viewport", () => {
  const { scene, context } = createScene();
  scene.setSize(new Vec2(800, 600));
  expect(context.viewport).toHaveBeenCalledWith(0, 0, 800, 600);
  expect(context.canvas.width).toBe(800);
  expect(context.canvas.height).toBe(600);

  scene.setSize(new Vec2(1024, 768));
  expect(context.viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
  expect(context.canvas.width).toBe(1024);
  expect(context.canvas.height).toBe(768);
});

test("destroy cleans up meshes, lights, and fog", () => {
  const { scene, context } = createScene();
  const mesh = new Mesh(new Quad(new Vec2(2, 2)), context);
  const destroySpy = jest.spyOn(mesh, "destroy");
  scene.addMesh(mesh);
  scene.addLight(new DirectionalLight());
  scene.setFog(new Vec3(1, 1, 1), 10, 100);

  expect(scene.nbMeshes).toBe(1);
  expect(scene.fog).not.toBeNull();

  scene.destroy(true);

  expect(destroySpy).toHaveBeenCalledTimes(1);
  expect(scene.nbMeshes).toBe(0);
  expect(scene.meshes).toHaveLength(0);
  expect(scene.lights.nbDirectionals).toBe(0);
  expect(scene.fog).toBeNull();
});

test("supports vector-first setViewport, getSize, and setClearColor", () => {
  const context = createMockContext();
  const scene = new Scene({
    context,
    viewport: new Vec2(800, 600),
    clearColor: new Vec3(0.1, 0.2, 0.3)
  });

  expect(scene.getSize().toArray()).toEqual([800, 600]);
  expect(context.clearColor).toHaveBeenCalledWith(0.1, 0.2, 0.3, 1.0);

  scene.setViewport(new Vec2(500, 400), new Vec2(10, 20));
  expect(context.viewport).toHaveBeenLastCalledWith(10, 20, 500, 400);
  expect(scene.getSize().toArray()).toEqual([500, 400]);

  scene.setClearColor(new Vec3(0.5, 0.6, 0.7), 0.9);
  expect(context.clearColor).toHaveBeenCalledWith(0.5, 0.6, 0.7, 0.9);
});

test("maxDrawDistance culls meshes beyond distance threshold", () => {
  const context = createMockContext();
  const scene = new Scene({ context, maxDrawDistance: 50 });
  const camera = new PerspectiveCamera(45, new Vec2(0.1, 1000), context);
  camera.setPosition(new Vec3(0, 0, 10));
  camera.setTarget(new Vec3(0, 0, 0));

  const meshNear = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshNear.setPosition(new Vec3(0, 0, 0));
  scene.addMesh(meshNear);

  const meshFar = new Mesh(new Quad(new Vec2(2, 2)), context);
  meshFar.setPosition(new Vec3(0, 0, -200));
  scene.addMesh(meshFar);

  expect(scene.render(camera)).toBe(1);
});

test("QuadBatch streams dynamic quads and updates local bounds", () => {
  const { context } = createScene();
  const sharedTex = { id: "shared-tex" };
  const batch = new QuadBatch(context, { capacity: 2, sharedTexture: sharedTex });
  expect(batch.isActive()).toBe(false);
  expect(batch.WebGLTexture).toBe(sharedTex);

  batch.begin();
  expect(batch.quad([0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0], [0, 0, 1, 1])).toBe(true);
  batch.end();
  expect(batch.subMeshes[0].count).toBe(6);

  batch.begin();
  expect(batch.quad([0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0], [0, 0, 1, 1])).toBe(true);
  expect(batch.quad([2, 0, 0, 4, 0, 0, 4, 2, 0, 2, 2, 0], [0, 0, 1, 1])).toBe(true);
  expect(batch.quad([4, 0, 0, 6, 0, 0, 6, 2, 0, 4, 2, 0], [0, 0, 1, 1])).toBe(false);
  batch.end();

  expect(batch.isActive()).toBe(true);
  expect(batch.subMeshes[0].count).toBe(12);
  expect(batch.localBoundingBox.min.toArray()).toEqual([0, 0, 0]);
  expect(batch.localBoundingBox.max.toArray()).toEqual([4, 2, 0]);

  batch.show(false);
  expect(batch.isActive()).toBe(false);
  batch.show(true);
  expect(batch.isActive()).toBe(true);

  batch.begin().end();
  expect(batch.isActive()).toBe(false);

  const ownedBatch = new QuadBatch(context, { capacity: 1, texture: new Uint8Array([255, 255, 255, 255]), textureOptions: { size: new Vec2(1, 1) } });
  expect(ownedBatch.WebGLTexture).toBeTruthy();
});


