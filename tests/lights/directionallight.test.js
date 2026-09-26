import { DirectionalLight, Vec3 } from "../../dist/roostr";

test("initializes position at the origin", () => {
  const light = new DirectionalLight();
  expect(light.position.x).toBe(0);
  expect(light.position.y).toBe(0);
  expect(light.position.z).toBe(0);
});

test("initializes default diffuse and specular colors", () => {
  const light = new DirectionalLight();
  expect(light.diffuse.toArray()).toEqual([0.6, 0.6, 0.6]);
  expect(light.specular.toArray()).toEqual([0.8, 0.8, 0.8]);
});

test("sets type to 'directional'", () => {
  const light = new DirectionalLight();
  expect(light.type).toBe("directional");
});

test("setPosition copies the given vector or scalars", () => {
  const light = new DirectionalLight();
  light.setPosition(new Vec3(1, 2, 3));
  expect(light.position.x).toBe(1);
  expect(light.position.y).toBe(2);
  expect(light.position.z).toBe(3);

  light.setPosition(4, 5, 6);
  expect(light.position.toArray()).toEqual([4, 5, 6]);
});

test("setDiffuse copies the given vector or scalars", () => {
  const light = new DirectionalLight();
  light.setDiffuse(new Vec3(0.1, 0.2, 0.3));
  expect(light.diffuse.toArray()).toEqual([0.1, 0.2, 0.3]);

  light.setDiffuse(0.7, 0.8, 0.9);
  expect(light.diffuse.toArray()).toEqual([0.7, 0.8, 0.9]);
});

test("setSpecular copies the given vector or scalars", () => {
  const light = new DirectionalLight();
  light.setSpecular(new Vec3(0.4, 0.5, 0.6));
  expect(light.specular.toArray()).toEqual([0.4, 0.5, 0.6]);

  light.setSpecular(1, 1, 1);
  expect(light.specular.toArray()).toEqual([1, 1, 1]);
});
