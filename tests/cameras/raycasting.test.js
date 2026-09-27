import { PerspectiveCamera, Scene, Mesh, Cube, Vec3 } from '../../dist/roostr.js';
import { createMockContext } from '../helpers/webgl-mock.js';

describe('Camera and Scene Raycasting', () => {
  let context;
  beforeEach(() => {
    context = createMockContext();
  });

  test('camera.getRay unprojects NDC coordinates into a valid world-space Ray', () => {
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);

    const ray = camera.getRay(0, 0);
    expect(ray.origin.z).toBeCloseTo(10, 0);
    expect(ray.direction.z).toBeLessThan(0); // pointing towards negative Z (into the scene)
  });

  test('scene.raycast finds intersecting meshes sorted by distance', () => {
    const scene = new Scene(context);
    const camera = new PerspectiveCamera(45, 0.1, 100, context);
    camera.setPosition(0, 0, 10);
    camera.setTarget(0, 0, 0);

    const cube1 = new Mesh(new Cube(1.0), context);
    cube1.setPosition(0, 0, 0);
    scene.addMesh(cube1);

    const cube2 = new Mesh(new Cube(1.0), context);
    cube2.setPosition(0, 0, 5);
    scene.addMesh(cube2);

    const ray = camera.getRay(0, 0);
    const hits = scene.raycast(ray);

    expect(hits.length).toBe(2);
    // Closest cube (cube2 at z=5) should be hit first
    expect(hits[0].mesh).toBe(cube2);
    expect(hits[1].mesh).toBe(cube1);
    expect(hits[0].distance).toBeLessThan(hits[1].distance);
  });
});
