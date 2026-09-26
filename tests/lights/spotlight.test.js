import { SpotLight, Vec3 } from "../../dist/roostr";

test("inherits PointLight defaults", () => {
  const light = new SpotLight();
  expect(light.constantAttenuation).toBe(0);
  expect(light.linearAttenuation).toBe(1.0);
  expect(light.quadraticAttenuation).toBe(0);
});

test("overrides type to 'spot'", () => {
  const light = new SpotLight();
  expect(light.type).toBe("spot");
});

test("initializes cutoff, exponent and direction defaults", () => {
  const light = new SpotLight();
  expect(light.cutoff).toBe(180);
  expect(light.exponent).toBe(0);
  expect(light.direction.toArray()).toEqual([1.0, 0.0, 0.0]);
});

test("setCutoff updates cutoff", () => {
  const light = new SpotLight();
  light.setCutoff(45);
  expect(light.cutoff).toBe(45);
});

test("setExponent updates exponent", () => {
  const light = new SpotLight();
  light.setExponent(2);
  expect(light.exponent).toBe(2);
});

test("setDirection copies the given direction vector or scalars", () => {
  const light = new SpotLight();
  light.setDirection(new Vec3(0, -1, 0));
  expect(light.direction.toArray()).toEqual([0, -1, 0]);

  light.setDirection(0, 0, -1);
  expect(light.direction.toArray()).toEqual([0, 0, -1]);
});
