import { PointLight } from "../../dist/roostr";

test("inherits DirectionalLight defaults", () => {
  const light = new PointLight();
  expect(light.position.x).toBe(0);
  expect(light.diffuse.toArray()).toEqual([0.6, 0.6, 0.6]);
  expect(light.specular.toArray()).toEqual([0.8, 0.8, 0.8]);
});

test("overrides type to 'point'", () => {
  const light = new PointLight();
  expect(light.type).toBe("point");
});

test("initializes attenuation defaults", () => {
  const light = new PointLight();
  expect(light.constantAttenuation).toBe(0);
  expect(light.linearAttenuation).toBe(1.0);
  expect(light.quadraticAttenuation).toBe(0);
});

test("setConstantAttenuation updates constantAttenuation", () => {
  const light = new PointLight();
  light.setConstantAttenuation(0.5);
  expect(light.constantAttenuation).toBe(0.5);
});

test("setLinearAttenuation updates linearAttenuation", () => {
  const light = new PointLight();
  light.setLinearAttenuation(0.25);
  expect(light.linearAttenuation).toBe(0.25);
});

test("setQuadraticAttenuation updates quadraticAttenuation", () => {
  const light = new PointLight();
  light.setQuadraticAttenuation(0.05);
  expect(light.quadraticAttenuation).toBe(0.05);
});
