import { Material } from "../dist/roostr";
import { Vector3 } from "@lcluber/type6js";

test("initializes default ambient, diffuse and specular colors", () => {
  const material = new Material();
  expect(material.ambient.toArray()).toEqual([0.5, 0.5, 0.5]);
  expect(material.diffuse.toArray()).toEqual([0.6, 0.6, 0.6]);
  expect(material.specular.toArray()).toEqual([0.8, 0.8, 0.8]);
});

test("initializes default shininess", () => {
  const material = new Material();
  expect(material.shininess).toBe(8.0);
});

test("builds a materialAmbient uniform of type uniform3fv matching ambient", () => {
  const material = new Material();
  expect(material.uniforms.materialAmbient.type).toBe("uniform3fv");
  expect(material.uniforms.materialAmbient.value).toEqual(material.ambient.toArray());
});

test("builds a materialDiffuse uniform of type uniform3fv matching diffuse", () => {
  const material = new Material();
  expect(material.uniforms.materialDiffuse.type).toBe("uniform3fv");
  expect(material.uniforms.materialDiffuse.value).toEqual(material.diffuse.toArray());
});

test("builds a materialSpecular uniform of type uniform3fv matching specular", () => {
  const material = new Material();
  expect(material.uniforms.materialSpecular.type).toBe("uniform3fv");
  expect(material.uniforms.materialSpecular.value).toEqual(material.specular.toArray());
});

test("builds a materialShininess uniform of type uniform1f matching shininess", () => {
  const material = new Material();
  expect(material.uniforms.materialShininess.type).toBe("uniform1f");
  expect(material.uniforms.materialShininess.value).toBe(material.shininess);
});

test("setAmbient updates ambient vector and uniform value", () => {
  const material = new Material();
  material.setAmbient(new Vector3(0.1, 0.2, 0.3));
  expect(material.ambient.toArray()).toEqual([0.1, 0.2, 0.3]);
  expect(material.uniforms.materialAmbient.value).toEqual([0.1, 0.2, 0.3]);
});

test("setDiffuse updates diffuse vector and uniform value", () => {
  const material = new Material();
  material.setDiffuse(new Vector3(0.3, 0.4, 0.5));
  expect(material.diffuse.toArray()).toEqual([0.3, 0.4, 0.5]);
  expect(material.uniforms.materialDiffuse.value).toEqual([0.3, 0.4, 0.5]);
});

test("setSpecular updates specular vector and uniform value", () => {
  const material = new Material();
  material.setSpecular(new Vector3(0.7, 0.8, 0.9));
  expect(material.specular.toArray()).toEqual([0.7, 0.8, 0.9]);
  expect(material.uniforms.materialSpecular.value).toEqual([0.7, 0.8, 0.9]);
});

test("setShininess updates shininess value and uniform value", () => {
  const material = new Material();
  material.setShininess(32.0);
  expect(material.shininess).toBe(32.0);
  expect(material.uniforms.materialShininess.value).toBe(32.0);
});

test("updateUniforms synchronizes direct property mutations to uniforms", () => {
  const material = new Material();
  material.ambient.x = 0.99;
  material.shininess = 64.0;
  material.updateUniforms();
  expect(material.uniforms.materialAmbient.value[0]).toBe(0.99);
  expect(material.uniforms.materialShininess.value).toBe(64.0);
});

