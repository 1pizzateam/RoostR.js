// Minimal WebGLRenderingContext test double.
//
// jsdom does not implement WebGL, and installing a native GL implementation
// (headless-gl, etc.) is not practical for a unit test suite. RoostR.js
// accesses most GL constants dynamically through bracket notation
// (e.g. `context[mode]`), so this mock exposes every constant used by the
// library as a plain numeric property, and lazily auto-mocks any method
// call (`context.someGlMethod(...)`) that isn't explicitly defined below,
// returning a jest.fn() so calls can still be asserted on.
//
// This lets tests exercise the real control flow of Renderer, Scene, Mesh,
// Texture and the cameras without requiring an actual GPU / GL driver.

import { jest } from '@jest/globals';

const GL_CONSTANTS = {
  DEPTH_BUFFER_BIT: 0x00000100,
  COLOR_BUFFER_BIT: 0x00004000,

  POINTS: 0x0000,
  LINES: 0x0001,
  LINE_LOOP: 0x0002,
  LINE_STRIP: 0x0003,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  TRIANGLE_FAN: 0x0006,

  CULL_FACE: 0x0b44,
  FRONT: 0x0404,
  BACK: 0x0405,
  FRONT_AND_BACK: 0x0408,
  CW: 0x0900,
  CCW: 0x0901,

  DEPTH_TEST: 0x0b71,
  BLEND: 0x0be2,
  LEQUAL: 0x0203,

  FUNC_ADD: 0x8006,
  SRC_ALPHA: 0x0302,
  ONE: 1,
  ONE_MINUS_SRC_ALPHA: 0x0303,

  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,
  STATIC_DRAW: 0x88e4,

  FLOAT: 0x1406,
  UNSIGNED_BYTE: 0x1401,
  UNSIGNED_SHORT: 0x1403,

  TEXTURE0: 0x84c0,
  TEXTURE_2D: 0x0de1,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  LINEAR: 0x2601,
  CLAMP_TO_EDGE: 0x812f,
  RGBA: 0x1908,
  UNPACK_FLIP_Y_WEBGL: 0x9240,

  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,

  VIEWPORT: 0x0ba2,

  FRAMEBUFFER: 0x8d40,
  RENDERBUFFER: 0x8d41,
  COLOR_ATTACHMENT0: 0x8ce0,
  DEPTH_ATTACHMENT: 0x8d00,
  DEPTH_COMPONENT16: 0x81a5,
  FRAMEBUFFER_BINDING: 0x8ca6,
  RENDERBUFFER_BINDING: 0x8ca7,
};

/**
 * Creates a fake WebGLRenderingContext suitable for exercising RoostR.js
 * classes in a jsdom environment.
 *
 * @param {object} [options]
 * @param {[number, number, number, number]} [options.viewport] - Value returned by getParameter(VIEWPORT).
 * @param {number} [options.drawingBufferWidth]
 * @param {number} [options.drawingBufferHeight]
 * @returns {WebGLRenderingContext} a Proxy-based mock context.
 */
function createMockContext(options = {}) {
  const viewport = options.viewport
    ? Int32Array.from(options.viewport)
    : new Int32Array([0, 0, 1280, 720]);

  const target = {
    drawingBufferWidth: options.drawingBufferWidth || 1280,
    drawingBufferHeight: options.drawingBufferHeight || 720,

    ...GL_CONSTANTS,

    getParameter: jest.fn((pname) => {
      if (pname === GL_CONSTANTS.VIEWPORT) return viewport;
      if (pname === GL_CONSTANTS.BLEND) return false;
      return null;
    }),
    getExtension: jest.fn(() => null),

    getShaderParameter: jest.fn(() => true),
    getProgramParameter: jest.fn(() => true),
    getShaderInfoLog: jest.fn(() => ''),
    getProgramInfoLog: jest.fn(() => ''),

    createBuffer: jest.fn(() => ({})),
    createTexture: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createShader: jest.fn(() => ({})),

    getAttribLocation: jest.fn(() => 0),
    getUniformLocation: jest.fn(() => ({})),
  };

  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj || typeof prop === 'symbol') {
        return obj[prop];
      }
      // Auto-mock any GL method not explicitly defined above
      // (enable, disable, viewport, clearColor, uniform*, draw*, bind*, ...).
      obj[prop] = jest.fn();
      return obj[prop];
    },
  });
}

/**
 * Creates an HTMLCanvasElement inserted in the document whose getContext()
 * returns the given mock WebGL context.
 *
 * @param {string} id
 * @param {WebGLRenderingContext} context
 * @returns {HTMLCanvasElement}
 */
function createMockCanvas(id, context) {
  document.body.innerHTML = `<canvas id="${id}"></canvas>`;
  const canvas = document.getElementById(id);
  canvas.getContext = jest.fn(() => context);
  return canvas;
}

export {
  GL_CONSTANTS,
  createMockContext,
  createMockCanvas,
};
