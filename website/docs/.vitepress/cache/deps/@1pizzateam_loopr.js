import {
  __publicField
} from "./chunk-V6TY7KAL.js";

// node_modules/@1pizzateam/loopr/node_modules/@1pizzateam/spock/dist/spock.js
var SIN_LUT_SIZE = 16384;
var SIN_LUT_MASK = SIN_LUT_SIZE - 1;
var SIN_LUT_QUARTER = SIN_LUT_SIZE >> 2;
var INV_TWOPI = 1 / (Math.PI * 2);
var SIN_LUT = new Float32Array(SIN_LUT_SIZE);
for (let i = 0; i < SIN_LUT_SIZE; i++) {
  SIN_LUT[i] = Math.sin(i * Math.PI * 2 / SIN_LUT_SIZE);
}
var PI = Math.PI;
var TWOPI = PI * 2;
var HALFPI = PI * 0.5;
var Time = {
  millisecToSec(millisecond) {
    return millisecond * 1e-3;
  },
  secToMillisec(second) {
    return second * 1e3;
  },
  millisecToFps(millisecond) {
    if (millisecond === 0)
      return 0;
    return 1e3 / millisecond;
  },
  fpsToMillisec(refreshRate) {
    if (refreshRate === 0)
      return 0;
    return 1e3 / refreshRate;
  },
  now() {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  },
  clampDelta(delta, maxMs = 100, minMs = 0) {
    if (delta < minMs)
      return minMs;
    if (delta > maxMs)
      return maxMs;
    return delta;
  },
  smoothFps(currentFps, instantFps, alpha = 0.05) {
    return currentFps * (1 - alpha) + instantFps * alpha;
  },
  subSteps(delta, fixedStep, maxSubSteps = 4) {
    if (fixedStep <= 0)
      return { steps: 0, remainder: delta };
    const steps = Math.min(Math.floor(delta / fixedStep), maxSubSteps);
    return { steps, remainder: delta - steps * fixedStep };
  }
};
function fromNext(next2) {
  function float(min, max) {
    return min + next2() * (max - min);
  }
  return {
    float,
    integer(min, max) {
      return Math.floor(min + next2() * (max - min + 1));
    },
    distribution(min, max, iterations) {
      let total = 0;
      for (let i = 0; i < iterations; i++)
        total += float(min, max);
      return total / iterations;
    },
    pick(value1, value2) {
      return next2() < 0.5 ? value1 : value2;
    }
  };
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var next = Math.random;
var methods = fromNext(() => next());
var Rand = {
  float: methods.float,
  integer: methods.integer,
  distribution: methods.distribution,
  pick: methods.pick,
  seed(value) {
    next = value === void 0 ? Math.random : mulberry32(value);
  },
  create(seed) {
    return fromNext(mulberry32(seed));
  }
};
var RollingAverage = class {
  constructor(size = 60) {
    __publicField(this, "values");
    __publicField(this, "head", 0);
    __publicField(this, "itemsCount", 0);
    __publicField(this, "totalSum", 0);
    const capacity = Math.max(1, Math.floor(size));
    this.values = new Float64Array(capacity);
  }
  get size() {
    return this.values.length;
  }
  get count() {
    return this.itemsCount;
  }
  get sum() {
    return this.totalSum;
  }
  get average() {
    return this.itemsCount ? this.totalSum / this.itemsCount : 0;
  }
  push(value) {
    if (this.itemsCount < this.values.length)
      this.itemsCount++;
    this.totalSum -= this.values[this.head];
    this.values[this.head] = value;
    this.totalSum += value;
    this.head = (this.head + 1) % this.values.length;
    return this.average;
  }
  reset() {
    this.values.fill(0);
    this.head = 0;
    this.itemsCount = 0;
    this.totalSum = 0;
  }
};

// node_modules/@dwtechs/checkard/dist/ch.js
var comparisons = {
  "=": (a, b) => a == b,
  "<": (a, b) => a < b,
  ">": (a, b) => a > b,
  "<=": (a, b) => a <= b,
  ">=": (a, b) => a >= b,
  "!=": (a, b) => a != b,
  "!0": (a) => a != 0,
  "0": (a) => a == 0
};
var ComparatorsToString = Object.keys(comparisons).join(", ");
function compare(a, c, b, throwError2 = false) {
  if (!c)
    return true;
  if (!(c in comparisons)) {
    if (throwError2)
      throw new Error(`Comparison failed because of an invalid comparator : '${c}'. Valid comparators are: ${ComparatorsToString}`);
    return false;
  }
  if (c === "!0" || c === "0") {
    const result2 = comparisons[c](a);
    if (!result2 && throwError2)
      throw new Error(`Comparison failed because ${a} is not '${c}'`);
    return result2;
  }
  if (b == null) {
    if (throwError2)
      throw new Error(`Comparison failed because Comparator '${c}' requires a second value`);
    return false;
  }
  const result = comparisons[c](a, b);
  if (!result && throwError2)
    throw new Error(`Comparison failed because ${a} ${c} ${b} returned false`);
  return result;
}
function getTag(t) {
  return t == null ? t === void 0 ? "[object Undefined]" : "[object Null]" : toString.call(t);
}
function throwError(expectedType, actualValue, causedBy) {
  const c = causedBy ? `. ${causedBy}` : "";
  throw new Error(`Checkard: Expected ${expectedType}, but received ${typeof actualValue}: ${String(actualValue)}${c}`);
}
function isNum(v, type, throwErr = false) {
  const n = Number(v);
  if (type ? n === v : !Number.isNaN(n - Number.parseFloat(v)))
    return true;
  if (throwErr)
    throwError("number", v);
  return false;
}
function isNumber(v, type = true, comparator = null, limit = null, throwErr = false) {
  if (isSymbol(v) || (v === null || v === void 0 ? void 0 : v.constructor) === Array || !isNum(v, type)) {
    if (throwErr)
      throwError("number", v);
    return false;
  }
  try {
    return compare(v, comparator, limit, throwErr);
  } catch (err) {
    throwError("valid number", v, err.message);
    return false;
  }
}
function isSymbol(v, throwErr = false) {
  const type = typeof v;
  if (type === "symbol" || type === "object" && v != null && getTag(v) === "[object Symbol]")
    return true;
  if (throwErr)
    throwError("symbol", v);
  return false;
}

// node_modules/@1pizzateam/loopr/dist/loopr.js
var Clock = class {
  constructor() {
    __publicField(this, "ticks", 0);
    __publicField(this, "total", 0);
    __publicField(this, "delta", 0);
    __publicField(this, "now", 0);
    __publicField(this, "rollingFps", new RollingAverage(60));
    this.reset();
  }
  reset() {
    this.now = 0;
    this.total = 0;
    this.delta = 0;
    this.ticks = 0;
    this.rollingFps.reset();
  }
  start() {
    this.now = Time.now();
  }
  tick(now) {
    this.now = now;
    this.total += this.delta;
    this.rollingFps.push(Time.millisecToFps(this.delta));
    this.ticks++;
  }
  computeDelta(now, maxDelta = 0) {
    this.delta = now - this.now;
    if (maxDelta > 0)
      this.delta = Time.clampDelta(this.delta, maxDelta);
    return this.delta;
  }
  computeAverageFPS() {
    return this.rollingFps.average;
  }
};
var Player = class {
  constructor(callback) {
    __publicField(this, "clock");
    __publicField(this, "frameId");
    __publicField(this, "callback");
    __publicField(this, "frameMinDuration");
    __publicField(this, "frameMaxDuration");
    __publicField(this, "frameTolerance");
    __publicField(this, "active");
    this.frameId = 0;
    this.frameMinDuration = 0;
    this.frameMaxDuration = 0;
    this.frameTolerance = 0;
    this.clock = new Clock();
    this.callback = callback;
    this.active = false;
    this.computeNewFrame = this.computeNewFrame.bind(this);
  }
  capFPS(maxFPS) {
    if (isNumber(maxFPS, true, ">=", 0)) {
      this.frameMinDuration = Time.fpsToMillisec(maxFPS);
      this.frameTolerance = this.frameMinDuration ? Math.min(4, this.frameMinDuration * 0.2) : 0;
    }
  }
  capDelta(maxDeltaSec) {
    this.frameMaxDuration = isNumber(maxDeltaSec, true, ">=", 0) ? Time.secToMillisec(maxDeltaSec) : this.frameMaxDuration;
  }
  getTick() {
    return Time.millisecToSec(this.clock.delta);
  }
  getTime() {
    return Time.millisecToSec(this.clock.total);
  }
  getFPS() {
    return this.clock.computeAverageFPS();
  }
  getTicks() {
    return this.clock.ticks;
  }
  isActive() {
    return this.active;
  }
  setScope(scope) {
    this.callback = this.callback.bind(scope);
  }
  start() {
    if (this.active)
      return false;
    this.startAnimation();
    return true;
  }
  toggle() {
    if (this.start())
      return true;
    this.pause();
    return false;
  }
  pause() {
    if (!this.active)
      return false;
    this.stopAnimation();
    return true;
  }
  stop() {
    this.clock.reset();
    if (this.active)
      this.stopAnimation();
  }
  computeNewFrame(now) {
    if (!this.active)
      return;
    const delta = this.clock.computeDelta(now, this.frameMaxDuration);
    if (!this.frameMinDuration || delta >= this.frameMinDuration - this.frameTolerance) {
      this.clock.tick(now);
      if (this.callback(this.getTick()) === false) {
        this.stop();
        return;
      }
    }
    this.requestNewFrame();
  }
  startAnimation() {
    this.active = true;
    this.clock.start();
    this.requestNewFrame();
  }
  stopAnimation() {
    this.active = false;
    this.cancelFrame();
    this.frameId = 0;
  }
  requestNewFrame() {
    if (typeof window !== "undefined" && window.requestAnimationFrame)
      this.frameId = window.requestAnimationFrame(this.computeNewFrame);
    else if (typeof requestAnimationFrame !== "undefined")
      this.frameId = requestAnimationFrame(this.computeNewFrame);
  }
  cancelFrame() {
    if (typeof window !== "undefined" && window.cancelAnimationFrame)
      window.cancelAnimationFrame(this.frameId);
    else if (typeof cancelAnimationFrame !== "undefined")
      cancelAnimationFrame(this.frameId);
  }
};
export {
  Clock,
  Player
};
//# sourceMappingURL=@1pizzateam_loopr.js.map
