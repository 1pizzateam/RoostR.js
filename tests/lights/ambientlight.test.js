import { AmbientLight, Lights, Scene, Vec3 } from '../../dist/roostr.js';

describe('AmbientLight', () => {
  test('initializes default type, intensity and color', () => {
    const light = new AmbientLight();
    expect(light.type).toBe('ambient');
    expect(light.intensity).toBe(1.0);
    expect(light.color.x).toBe(1.0);
    expect(light.color.y).toBe(1.0);
    expect(light.color.z).toBe(1.0);
  });

  test('accepts custom color and intensity in constructor', () => {
    const light = new AmbientLight(new Vec3(0.5, 0.6, 0.7), 0.8);
    expect(light.intensity).toBe(0.8);
    expect(light.color.x).toBe(0.5);
    expect(light.color.y).toBe(0.6);
    expect(light.color.z).toBe(0.7);
  });

  test('setColor and setIntensity update properties and support chaining', () => {
    const light = new AmbientLight();
    light.setColor(0.2, 0.3, 0.4).setIntensity(0.5);
    expect(light.intensity).toBe(0.5);
    expect(light.color.x).toBe(0.2);
    expect(light.color.y).toBe(0.3);
    expect(light.color.z).toBe(0.4);

    light.setColor(new Vec3(0.9, 0.8, 0.7));
    expect(light.color.x).toBe(0.9);
  });

  test('flatten() in Lights accumulates ambient light correctly', () => {
    const lights = new Lights();
    const amb1 = new AmbientLight(new Vec3(0.2, 0.1, 0.0), 1.0);
    const amb2 = new AmbientLight(new Vec3(0.1, 0.2, 0.3), 0.5);
    lights.addLight(amb1);
    lights.addLight(amb2);

    const flat = lights.flatten();
    expect(flat.ambient).toBeDefined();
    // 0.2*1 + 0.1*0.5 = 0.25
    expect(flat.ambient[0]).toBeCloseTo(0.25);
    // 0.1*1 + 0.2*0.5 = 0.2
    expect(flat.ambient[1]).toBeCloseTo(0.2);
    // 0.0*1 + 0.3*0.5 = 0.15
    expect(flat.ambient[2]).toBeCloseTo(0.15);

    lights.removeLight(amb1);
    const flatAfter = lights.flatten();
    expect(flatAfter.ambient[0]).toBeCloseTo(0.05);
  });
});
