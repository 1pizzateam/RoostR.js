import { RenderTarget } from '../../dist/roostr.js';
import { createMockContext } from '../helpers/webgl-mock.js';

describe('RenderTarget', () => {
  let context;
  beforeEach(() => {
    context = createMockContext();
  });

  test('creates framebuffer, texture and depth renderbuffer', () => {
    const target = new RenderTarget(512, 512, context);
    expect(target.framebuffer).not.toBeNull();
    expect(target.texture).not.toBeNull();
    expect(target.depthBuffer).not.toBeNull();
    expect(target.width).toBe(512);
    expect(target.height).toBe(512);

    target.dispose();
  });

  test('bind and unbind update WebGL state', () => {
    const target = new RenderTarget(256, 256, context);
    target.bind();
    expect(context.bindFramebuffer).toHaveBeenCalledWith(context.FRAMEBUFFER, target.framebuffer);

    target.unbind(800, 600);
    expect(context.bindFramebuffer).toHaveBeenCalledWith(context.FRAMEBUFFER, null);

    target.dispose();
  });

  test('setSize updates dimensions', () => {
    const target = new RenderTarget(256, 256, context);
    target.setSize(1024, 1024);
    expect(target.width).toBe(1024);
    expect(target.height).toBe(1024);

    target.dispose();
  });
});
