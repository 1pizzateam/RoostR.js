import { jest } from '@jest/globals';
import { OrbitControls, PerspectiveCamera, Vec2, Vec3 } from '../../dist/roostr.js';
import { createMockContext } from '../helpers/webgl-mock.js';

describe('OrbitControls', () => {
  let context;
  beforeEach(() => {
    context = createMockContext();
  });

  test('initializes angles from camera position and target', () => {
    const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
    camera.setPosition(new Vec3(0, 0, 10));
    camera.setTarget(new Vec3(0, 0, 0));

    const fakeDom = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      clientHeight: 600
    };

    const controls = new OrbitControls(camera, fakeDom);
    expect(controls.distance).toBeCloseTo(10);
    expect(fakeDom.addEventListener).toHaveBeenCalled();

    controls.dispose();
    expect(fakeDom.removeEventListener).toHaveBeenCalled();
  });

  test('update recomputes camera position around target', () => {
    const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
    camera.setPosition(new Vec3(0, 0, 10));
    camera.setTarget(new Vec3(0, 0, 0));

    const fakeDom = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    const controls = new OrbitControls(camera, fakeDom);
    controls.distance = 20;
    controls.azimuth = 0;
    controls.elevation = 0;
    controls.update();

    expect(camera.position.z).toBeCloseTo(20);
    expect(camera.position.x).toBeCloseTo(0);
    expect(camera.position.y).toBeCloseTo(0);

    controls.dispose();
  });

  test('handles wheel zoom event', () => {
    const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
    camera.setPosition(new Vec3(0, 0, 10));
    camera.setTarget(new Vec3(0, 0, 0));

    const listeners = {};
    const fakeDom = {
      addEventListener: jest.fn((evt, cb) => { listeners[evt] = cb; }),
      removeEventListener: jest.fn()
    };

    const controls = new OrbitControls(camera, fakeDom);
    expect(listeners['wheel']).toBeDefined();

    const initialDistance = controls.targetDistance;
    listeners['wheel']({ deltaY: 100, preventDefault: jest.fn() });
    expect(controls.targetDistance).toBeGreaterThan(initialDistance);

    listeners['wheel']({ deltaY: -100, preventDefault: jest.fn() });
    expect(controls.targetDistance).toBeCloseTo(initialDistance);

    controls.dispose();
  });

  test('handles touch pinch and touch end reset', () => {
    const camera = new PerspectiveCamera(45, new Vec2(0.1, 100), context);
    camera.setPosition(new Vec3(0, 0, 10));
    camera.setTarget(new Vec3(0, 0, 0));

    const listeners = {};
    const removed = {};
    const fakeDom = {
      addEventListener: jest.fn((evt, cb) => { listeners[evt] = cb; }),
      removeEventListener: jest.fn((evt) => { removed[evt] = true; })
    };

    const controls = new OrbitControls(camera, fakeDom);
    expect(listeners['touchstart']).toBeDefined();
    expect(listeners['touchmove']).toBeDefined();
    expect(listeners['touchend']).toBeDefined();
    expect(listeners['touchcancel']).toBeDefined();

    // 2-finger touch start (distance = 100)
    listeners['touchstart']({
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 100, clientY: 0 }],
      preventDefault: jest.fn()
    });

    // 2-finger touch move pinching closer (distance = 50 -> factor 2x zoom out)
    const initialDistance = controls.targetDistance;
    listeners['touchmove']({
      touches: [{ clientX: 0, clientY: 0 }, { clientX: 50, clientY: 0 }],
      preventDefault: jest.fn()
    });
    expect(controls.targetDistance).toBeGreaterThan(initialDistance);

    // Touch end (finger lifted)
    listeners['touchend']({
      touches: [{ clientX: 0, clientY: 0 }]
    });

    controls.dispose();
    expect(removed['touchend']).toBe(true);
    expect(removed['touchcancel']).toBe(true);
  });
});
