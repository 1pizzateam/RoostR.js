import {
  __publicField
} from "./chunk-V6TY7KAL.js";

// node_modules/@1pizzateam/spock/dist/spock.js
var SIN_LUT_SIZE = 16384;
var SIN_LUT_MASK = SIN_LUT_SIZE - 1;
var SIN_LUT_QUARTER = SIN_LUT_SIZE >> 2;
var INV_TWOPI = 1 / (Math.PI * 2);
var SIN_LUT = new Float32Array(SIN_LUT_SIZE);
for (let i = 0; i < SIN_LUT_SIZE; i++)
  SIN_LUT[i] = Math.sin(i * Math.PI * 2 / SIN_LUT_SIZE);
function lutIndex(angle) {
  const u = angle * INV_TWOPI;
  return (u - Math.floor(u)) * SIN_LUT_SIZE & SIN_LUT_MASK;
}
function fastSine(angle) {
  return SIN_LUT[lutIndex(angle)];
}
function fastCosine(angle) {
  return SIN_LUT[lutIndex(angle) + SIN_LUT_QUARTER & SIN_LUT_MASK];
}
function applySineCosine(target, angle, length) {
  target.x = Math.cos(angle) * length;
  target.y = Math.sin(angle) * length;
}
var PI = Math.PI;
var TWOPI = PI * 2;
var HALFPI = PI * 0.5;
var Trigo = {
  pi: PI,
  twopi: TWOPI,
  halfpi: HALFPI,
  degreeToRadian(degree) {
    return degree * 0.017453292519943295;
  },
  radianToDegree(radian) {
    return radian * 57.29577951308232;
  },
  normalizeRadian(angle) {
    if (angle > PI || angle < -PI)
      return angle - TWOPI * Math.floor((angle + PI) / TWOPI);
    return angle;
  },
  sine(angle) {
    return fastSine(angle);
  },
  cosine(angle) {
    return fastCosine(angle);
  },
  arctan(angle) {
    return Math.atan(angle);
  },
  arctan2(y, x) {
    if (x === 0 && y === 0)
      return false;
    return Math.atan2(y, x);
  },
  sinePrecise(angle) {
    return Math.sin(angle);
  },
  cosinePrecise(angle) {
    return Math.cos(angle);
  },
  sineEquation(amplitude, period, shiftX, shiftY) {
    return amplitude * fastSine(period + shiftX) + shiftY;
  },
  cosineEquation(amplitude, period, shiftX, shiftY) {
    return amplitude * fastCosine(period + shiftX) + shiftY;
  },
  arctanEquation(amplitude, period, shiftX, shiftY) {
    return amplitude * Math.atan(period + shiftX) + shiftY;
  }
};
function pow10(decimals) {
  let scale = 1;
  const n = decimals < 0 ? -decimals : decimals;
  for (let i = 0; i < n; i++)
    scale *= 10;
  return decimals < 0 ? 1 / scale : scale;
}
function scaled(x, decimals, map) {
  const scale = pow10(decimals);
  return map(x * scale) / scale;
}
function lerp(min, max, amount) {
  return (max - min) * amount + min;
}
function normalize(x, min, max) {
  if (min === max)
    return 0;
  return (x - min) / (max - min);
}
var Utils = {
  round(x, decimals) {
    return scaled(x, decimals, Math.round);
  },
  floor(x, decimals) {
    return scaled(x, decimals, Math.floor);
  },
  ceil(x, decimals) {
    return scaled(x, decimals, Math.ceil);
  },
  trunc(x, decimals) {
    decimals = pow10(decimals);
    const v = +x * decimals;
    if (!isFinite(v))
      return v;
    return (v - v % 1) / decimals || (v < 0 ? -0 : v === 0 ? v : 0);
  },
  roundToNearest(x, nearest) {
    return Math.round(x / nearest) * nearest;
  },
  mix(x, y, ratio) {
    return (1 - ratio) * x + ratio * y;
  },
  getSign(x) {
    return Math.sign(x);
  },
  opposite(x) {
    return -x;
  },
  clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
  },
  clampToExtent(x, extent) {
    return Math.min(Math.max(x, -extent), extent);
  },
  normalize,
  lerp,
  map(x, sourceMin, sourceMax, destMin, destMax) {
    return lerp(destMin, destMax, normalize(x, sourceMin, sourceMax));
  },
  isIn(x, min, max) {
    return x >= min && x <= max;
  },
  isOut(x, min, max) {
    return x < min || x > max;
  }
};
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
  subSteps(delta, fixedStep, maxSubSteps = 4, target) {
    const out = target ?? { steps: 0, remainder: 0 };
    if (fixedStep <= 0) {
      out.steps = 0;
      out.remainder = delta;
      return out;
    }
    const steps = Math.min(Math.floor(delta / fixedStep), maxSubSteps);
    out.steps = steps;
    out.remainder = delta - steps * fixedStep;
    return out;
  }
};
var Accumulator = class {
  constructor(fixedStep = 1 / 60, maxSubSteps = 5) {
    __publicField(this, "fixedStep");
    __publicField(this, "maxSubSteps");
    __publicField(this, "value", 0);
    this.fixedStep = fixedStep;
    this.maxSubSteps = maxSubSteps;
  }
  step(delta, tick) {
    if (delta <= 0)
      return 0;
    this.value += delta;
    const maxAccumulated = this.fixedStep * this.maxSubSteps;
    if (this.value > maxAccumulated)
      this.value = maxAccumulated;
    let subStepsTaken = 0;
    while (this.value >= this.fixedStep && subStepsTaken < this.maxSubSteps) {
      tick(this.fixedStep);
      this.value -= this.fixedStep;
      subStepsTaken++;
    }
    return subStepsTaken;
  }
  get alpha() {
    return this.fixedStep > 0 ? this.value / this.fixedStep : 0;
  }
  reset() {
    this.value = 0;
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
function sum(array) {
  let total = 0;
  for (let i = 0; i < array.length; i++)
    total += array[i];
  return total;
}
var NumArray = {
  min(array) {
    if (array.length === 0)
      return NaN;
    let m = Infinity;
    for (let i = 0; i < array.length; i++)
      if (array[i] < m)
        m = array[i];
    return m;
  },
  max(array) {
    if (array.length === 0)
      return NaN;
    let m = -Infinity;
    for (let i = 0; i < array.length; i++)
      if (array[i] > m)
        m = array[i];
    return m;
  },
  sum,
  multiply(array) {
    let product = 1;
    for (let i = 0; i < array.length; i++)
      product *= array[i];
    return product;
  },
  average(array) {
    return sum(array) / array.length;
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
function bezierSampleCount(samples) {
  if (samples === void 0)
    return 16;
  return samples < 1 ? 1 : samples | 0;
}
function polylineLength(at, samples) {
  const n = bezierSampleCount(samples);
  let prev = at(0);
  let length = 0;
  for (let i = 1; i <= n; i++) {
    const curr = at(i / n);
    length += curr > prev ? curr - prev : prev - curr;
    prev = curr;
  }
  return length;
}
function parameterAtLength(at, distance, samples) {
  if (distance <= 0)
    return 0;
  const n = bezierSampleCount(samples);
  let traveled = 0;
  let prev = at(0);
  for (let i = 1; i <= n; i++) {
    const curr = at(i / n);
    const segment = curr > prev ? curr - prev : prev - curr;
    if (traveled + segment >= distance) {
      const u = segment === 0 ? 0 : (distance - traveled) / segment;
      return (i - 1 + u) / n;
    }
    traveled += segment;
    prev = curr;
  }
  return 1;
}
function sampleCurveLength(atX, atY, atZ, samples) {
  const n = bezierSampleCount(samples);
  let px = atX(0), py = atY(0), pz = atZ ? atZ(0) : 0;
  let length = 0;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = atX(t), y = atY(t), z = atZ ? atZ(t) : 0;
    const dx = x - px, dy = y - py, dz = z - pz;
    length += Math.sqrt(dx * dx + dy * dy + dz * dz);
    px = x;
    py = y;
    pz = z;
  }
  return length;
}
function sampleCurveParameterAtLength(atX, atY, atZ, distance, samples) {
  if (distance <= 0)
    return 0;
  const n = bezierSampleCount(samples);
  let traveled = 0;
  let px = atX(0), py = atY(0), pz = atZ ? atZ(0) : 0;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = atX(t), y = atY(t), z = atZ ? atZ(t) : 0;
    const dx = x - px, dy = y - py, dz = z - pz;
    const segment = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (traveled + segment >= distance) {
      const u = segment === 0 ? 0 : (distance - traveled) / segment;
      return (i - 1 + u) / n;
    }
    traveled += segment;
    px = x;
    py = y;
    pz = z;
  }
  return 1;
}
var Bezier = {
  quadratic(p0, p1, p2, t) {
    const oneMinusT = 1 - t;
    return oneMinusT * oneMinusT * p0 + oneMinusT * 2 * t * p1 + t * t * p2;
  },
  cubic(p0, p1, p2, p3, t) {
    const oneMinusT = 1 - t;
    const tByT = t * t;
    return oneMinusT * oneMinusT * oneMinusT * p0 + oneMinusT * oneMinusT * 3 * t * p1 + oneMinusT * 3 * tByT * p2 + tByT * t * p3;
  },
  quadraticDerivative(p0, p1, p2, t) {
    return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
  },
  cubicDerivative(p0, p1, p2, p3, t) {
    const oneMinusT = 1 - t;
    return 3 * oneMinusT * oneMinusT * (p1 - p0) + 6 * oneMinusT * t * (p2 - p1) + 3 * t * t * (p3 - p2);
  },
  quadraticSplit(p0, p1, p2, t, left, right) {
    const p01 = p0 + (p1 - p0) * t;
    const p12 = p1 + (p2 - p1) * t;
    const mid = p01 + (p12 - p01) * t;
    left[0] = p0;
    left[1] = p01;
    left[2] = mid;
    right[0] = mid;
    right[1] = p12;
    right[2] = p2;
  },
  cubicSplit(p0, p1, p2, p3, t, left, right) {
    const p01 = p0 + (p1 - p0) * t;
    const p12 = p1 + (p2 - p1) * t;
    const p23 = p2 + (p3 - p2) * t;
    const p012 = p01 + (p12 - p01) * t;
    const p123 = p12 + (p23 - p12) * t;
    const mid = p012 + (p123 - p012) * t;
    left[0] = p0;
    left[1] = p01;
    left[2] = p012;
    left[3] = mid;
    right[0] = mid;
    right[1] = p123;
    right[2] = p23;
    right[3] = p3;
  },
  quadraticLength(p0, p1, p2, samples) {
    return polylineLength((t) => Bezier.quadratic(p0, p1, p2, t), samples);
  },
  cubicLength(p0, p1, p2, p3, samples) {
    return polylineLength((t) => Bezier.cubic(p0, p1, p2, p3, t), samples);
  },
  quadraticParameterAtLength(p0, p1, p2, distance, samples) {
    return parameterAtLength((t) => Bezier.quadratic(p0, p1, p2, t), distance, samples);
  },
  cubicParameterAtLength(p0, p1, p2, p3, distance, samples) {
    return parameterAtLength((t) => Bezier.cubic(p0, p1, p2, p3, t), distance, samples);
  }
};
var _Vec2 = class _Vec2 {
  constructor(x = 0, y = 0) {
    __publicField(this, "x");
    __publicField(this, "y");
    this.x = x;
    this.y = y;
  }
  setScalar(x, y) {
    this.x = x ?? this.x;
    this.y = y ?? this.y;
    return this;
  }
  setArray(array, offset = 0) {
    this.x = array[offset] ?? this.x;
    this.y = array[offset + 1] ?? this.y;
    return this;
  }
  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }
  isPositive() {
    return this.x >= 0 && this.y >= 0;
  }
  isEqualTo(scalar) {
    return this.x === scalar && this.y === scalar;
  }
  equals(vector) {
    return this.x === vector.x && this.y === vector.y;
  }
  isOrigin() {
    return this.x === 0 && this.y === 0;
  }
  toArray(target = []) {
    target[0] = this.x;
    target[1] = this.y;
    target.length = 2;
    return target;
  }
  toString() {
    return `(x = ${this.x}; y = ${this.y})`;
  }
  origin() {
    this.x = 0;
    this.y = 0;
    return this;
  }
  getMagnitude(square = false) {
    const squared = this.x * this.x + this.y * this.y;
    return square ? squared : Math.sqrt(squared);
  }
  getDistance(vector, square = false) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    const squared = dx * dx + dy * dy;
    return square ? squared : Math.sqrt(squared);
  }
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }
  addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  }
  addScaledVector(vector, scalar) {
    this.x += vector.x * scalar;
    this.y += vector.y * scalar;
    return this;
  }
  addScalar(scalar) {
    this.x += scalar;
    this.y += scalar;
    return this;
  }
  addComponents() {
    return this.x + this.y;
  }
  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }
  subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  }
  subtractScaledVector(vector, scalar) {
    this.x -= vector.x * scalar;
    this.y -= vector.y * scalar;
    return this;
  }
  subtractScalar(scalar) {
    this.x -= scalar;
    this.y -= scalar;
    return this;
  }
  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    return this;
  }
  multiplyVectors(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    return this;
  }
  multiplyScaledVector(vector, scalar) {
    this.x *= vector.x * scalar;
    this.y *= vector.y * scalar;
    return this;
  }
  scale(scalar, axis) {
    if (!axis) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    }
    if (axis === "x")
      this.x *= scalar;
    else
      this.y *= scalar;
    return this;
  }
  scaleVector(vector, scalar) {
    this.x = vector.x * scalar;
    this.y = vector.y * scalar;
    return this;
  }
  divide(vector) {
    this.x /= vector.x;
    this.y /= vector.y;
    return this;
  }
  divideVectors(a, b) {
    this.x = a.x / b.x;
    this.y = a.y / b.y;
    return this;
  }
  divideScaledVector(vector, scalar) {
    this.x /= vector.x * scalar;
    this.y /= vector.y * scalar;
    return this;
  }
  divideScalar(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }
  halve() {
    this.x *= 0.5;
    this.y *= 0.5;
    return this;
  }
  max(vector) {
    this.x = Math.max(this.x, vector.x);
    this.y = Math.max(this.y, vector.y);
    return this;
  }
  min(vector) {
    this.x = Math.min(this.x, vector.x);
    this.y = Math.min(this.y, vector.y);
    return this;
  }
  minVectors(a, b) {
    this.x = Math.min(a.x, b.x);
    this.y = Math.min(a.y, b.y);
    return this;
  }
  maxVectors(a, b) {
    this.x = Math.max(a.x, b.x);
    this.y = Math.max(a.y, b.y);
    return this;
  }
  maxScalar(scalar) {
    this.x = Math.max(this.x, scalar);
    this.y = Math.max(this.y, scalar);
    return this;
  }
  minScalar(scalar) {
    this.x = Math.min(this.x, scalar);
    this.y = Math.min(this.y, scalar);
    return this;
  }
  normalize(fallback) {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    if (length) {
      if (length !== 1) {
        const inv = 1 / length;
        this.x *= inv;
        this.y *= inv;
      }
    } else if (fallback) {
      this.x = fallback.x;
      this.y = fallback.y;
    }
    return this;
  }
  normalizeVector(vector, fallback) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (length) {
      const inv = 1 / length;
      this.x = vector.x * inv;
      this.y = vector.y * inv;
    } else if (fallback) {
      this.x = fallback.x;
      this.y = fallback.y;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }
  setLength(length) {
    return this.normalize().scale(length);
  }
  setLengthVector(vector, length) {
    return this.normalizeVector(vector).scale(length);
  }
  absolute(axis) {
    if (!axis) {
      this.x = Math.abs(this.x);
      this.y = Math.abs(this.y);
      return this;
    }
    if (axis === "x")
      this.x = Math.abs(this.x);
    else
      this.y = Math.abs(this.y);
    return this;
  }
  absoluteVector(vector) {
    this.x = Math.abs(vector.x);
    this.y = Math.abs(vector.y);
    return this;
  }
  opposite(axis) {
    if (!axis) {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    }
    if (axis === "x")
      this.x = -this.x;
    else
      this.y = -this.y;
    return this;
  }
  oppositeVector(vector) {
    this.x = -vector.x;
    this.y = -vector.y;
    return this;
  }
  sign() {
    this.x = Math.sign(this.x);
    this.y = Math.sign(this.y);
    return this;
  }
  floor(axis) {
    if (!axis) {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    }
    if (axis === "x")
      this.x = Math.floor(this.x);
    else
      this.y = Math.floor(this.y);
    return this;
  }
  ceil(axis) {
    if (!axis) {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    }
    if (axis === "x")
      this.x = Math.ceil(this.x);
    else
      this.y = Math.ceil(this.y);
    return this;
  }
  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
  crossProduct(vector) {
    return this.x * vector.y - this.y * vector.x;
  }
  perp() {
    const x = this.x;
    this.x = -this.y;
    this.y = x;
    return this;
  }
  perpCW() {
    const x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
  }
  perpVector(vector) {
    const x = vector.x;
    this.x = -vector.y;
    this.y = x;
    return this;
  }
  perpCWVector(vector) {
    const x = vector.x;
    this.x = vector.y;
    this.y = -x;
    return this;
  }
  project(normal) {
    return this.scaleVector(normal, this.dotProduct(normal));
  }
  projectVector(vector, normal) {
    return this.scaleVector(normal, vector.dotProduct(normal));
  }
  reflect(normal) {
    return this.subtractScaledVector(normal, 2 * this.dotProduct(normal));
  }
  reflectVector(vector, normal) {
    return this.copy(vector).subtractScaledVector(normal, 2 * vector.dotProduct(normal));
  }
  setRadian(angle) {
    applySineCosine(this, angle, Math.sqrt(this.x * this.x + this.y * this.y));
    return this;
  }
  setDegree(angle) {
    return this.setRadian(Trigo.degreeToRadian(angle));
  }
  setMinAxis(scalar) {
    if (this.y < this.x)
      this.y = scalar;
    else
      this.x = scalar;
    return this;
  }
  setMaxAxis(scalar) {
    if (this.y > this.x)
      this.y = scalar;
    else
      this.x = scalar;
    return this;
  }
  isolateMinAxis() {
    if (this.y < this.x) {
      this.x = 0;
      return "y";
    }
    this.y = 0;
    return "x";
  }
  isolateMaxAxis() {
    if (this.y > this.x) {
      this.x = 0;
      return "y";
    }
    this.y = 0;
    return "x";
  }
  projectToMinAxis(reference) {
    if (Math.abs(this.y) < Math.abs(this.x)) {
      this.x = 0;
      if (reference)
        this.y = reference.y < 0 ? -Math.abs(this.y) : Math.abs(this.y);
    } else {
      this.y = 0;
      if (reference)
        this.x = reference.x < 0 ? -Math.abs(this.x) : Math.abs(this.x);
    }
    return this;
  }
  projectToMaxAxis(reference) {
    if (Math.abs(this.y) > Math.abs(this.x)) {
      this.x = 0;
      if (reference)
        this.y = reference.y < 0 ? -Math.abs(this.y) : Math.abs(this.y);
    } else {
      this.y = 0;
      if (reference)
        this.x = reference.x < 0 ? -Math.abs(this.x) : Math.abs(this.x);
    }
    return this;
  }
  setOppositeAxis(axis, value) {
    if (axis === "y")
      this.x = value;
    else
      this.y = value;
    return this;
  }
  clone() {
    return new _Vec2(this.x, this.y);
  }
  getAngle() {
    return Trigo.arctan2(this.y, this.x);
  }
  quadraticBezier(p0, p1, p2, t) {
    this.x = Bezier.quadratic(p0.x, p1.x, p2.x, t);
    this.y = Bezier.quadratic(p0.y, p1.y, p2.y, t);
    return this;
  }
  cubicBezier(p0, p1, p2, p3, t) {
    this.x = Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t);
    this.y = Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t);
    return this;
  }
  quadraticBezierDerivative(p0, p1, p2, t) {
    this.x = Bezier.quadraticDerivative(p0.x, p1.x, p2.x, t);
    this.y = Bezier.quadraticDerivative(p0.y, p1.y, p2.y, t);
    return this;
  }
  cubicBezierDerivative(p0, p1, p2, p3, t) {
    this.x = Bezier.cubicDerivative(p0.x, p1.x, p2.x, p3.x, t);
    this.y = Bezier.cubicDerivative(p0.y, p1.y, p2.y, p3.y, t);
    return this;
  }
  quadraticBezierSplit(p0, p1, p2, t, left, right) {
    if (!left[0])
      left[0] = new _Vec2();
    if (!left[1])
      left[1] = new _Vec2();
    if (!left[2])
      left[2] = new _Vec2();
    if (!right[0])
      right[0] = new _Vec2();
    if (!right[1])
      right[1] = new _Vec2();
    if (!right[2])
      right[2] = new _Vec2();
    left[0].copy(p0);
    const p01 = left[1].lerpVectors(p0, p1, t);
    const p12 = right[1].lerpVectors(p1, p2, t);
    const mid = left[2].lerpVectors(p01, p12, t);
    right[0].copy(mid);
    right[2].copy(p2);
    left.length = 3;
    right.length = 3;
  }
  cubicBezierSplit(p0, p1, p2, p3, t, left, right) {
    if (!left[0])
      left[0] = new _Vec2();
    if (!left[1])
      left[1] = new _Vec2();
    if (!left[2])
      left[2] = new _Vec2();
    if (!left[3])
      left[3] = new _Vec2();
    if (!right[0])
      right[0] = new _Vec2();
    if (!right[1])
      right[1] = new _Vec2();
    if (!right[2])
      right[2] = new _Vec2();
    if (!right[3])
      right[3] = new _Vec2();
    left[0].copy(p0);
    const p01 = left[1].lerpVectors(p0, p1, t);
    const p12 = _Vec2.scratchSplit1.lerpVectors(p1, p2, t);
    const p23 = right[2].lerpVectors(p2, p3, t);
    const p012 = left[2].lerpVectors(p01, p12, t);
    const p123 = right[1].lerpVectors(p12, p23, t);
    const mid = left[3].lerpVectors(p012, p123, t);
    right[0].copy(mid);
    right[3].copy(p3);
    left.length = 4;
    right.length = 4;
  }
  quadraticBezierLength(p0, p1, p2, samples) {
    return sampleCurveLength((t) => Bezier.quadratic(p0.x, p1.x, p2.x, t), (t) => Bezier.quadratic(p0.y, p1.y, p2.y, t), void 0, samples);
  }
  cubicBezierLength(p0, p1, p2, p3, samples) {
    return sampleCurveLength((t) => Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t), (t) => Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t), void 0, samples);
  }
  quadraticBezierParameterAtLength(p0, p1, p2, distance, samples) {
    return sampleCurveParameterAtLength((t) => Bezier.quadratic(p0.x, p1.x, p2.x, t), (t) => Bezier.quadratic(p0.y, p1.y, p2.y, t), void 0, distance, samples);
  }
  cubicBezierParameterAtLength(p0, p1, p2, p3, distance, samples) {
    return sampleCurveParameterAtLength((t) => Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t), (t) => Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t), void 0, distance, samples);
  }
  getMaxAxis() {
    return this.y > this.x ? "y" : "x";
  }
  getMinAxis() {
    return this.y < this.x ? "y" : "x";
  }
  clamp(minOrRect, max) {
    if (max !== void 0)
      return this.clampVectors(this, minOrRect, max);
    const rect = minOrRect;
    return this.clampVectors(this, rect.topLeftCorner, rect.bottomRightCorner);
  }
  clampVectors(value, min, max) {
    this.x = Utils.clamp(value.x, min.x, max.x);
    this.y = Utils.clamp(value.y, min.y, max.y);
    return this;
  }
  clampScalar(min, max) {
    this.x = Utils.clamp(this.x, min, max);
    this.y = Utils.clamp(this.y, min, max);
    return this;
  }
  clampToExtent(extent) {
    this.x = Utils.clamp(this.x, -extent.x, extent.x);
    this.y = Utils.clamp(this.y, -extent.y, extent.y);
    return this;
  }
  clampToExtentVectors(vector, extent) {
    this.x = Utils.clamp(vector.x, -extent.x, extent.x);
    this.y = Utils.clamp(vector.y, -extent.y, extent.y);
    return this;
  }
  isInBounds(minOrRect, max) {
    if (max !== void 0) {
      const min = minOrRect;
      const minX = Math.min(min.x, max.x);
      const maxX = Math.max(min.x, max.x);
      const minY = Math.min(min.y, max.y);
      const maxY = Math.max(min.y, max.y);
      return this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY;
    }
    const rect = minOrRect;
    return this.x >= rect.topLeftCorner.x && this.x <= rect.bottomRightCorner.x && this.y >= rect.topLeftCorner.y && this.y <= rect.bottomRightCorner.y;
  }
  lerp(minOrTarget, maxOrAmount, amount) {
    if (typeof maxOrAmount === "number") {
      this.x = Utils.lerp(this.x, minOrTarget.x, maxOrAmount);
      this.y = Utils.lerp(this.y, minOrTarget.y, maxOrAmount);
      return this;
    }
    this.x = Utils.lerp(minOrTarget.x, maxOrAmount.x, amount);
    this.y = Utils.lerp(minOrTarget.y, maxOrAmount.y, amount);
    return this;
  }
  lerpVectors(min, max, amount) {
    this.x = Utils.lerp(min.x, max.x, amount);
    this.y = Utils.lerp(min.y, max.y, amount);
    return this;
  }
};
__publicField(_Vec2, "scratchSplit1", new _Vec2());
var Vec2 = _Vec2;
var GRID_EMPTY_CELL = -1;
function fillGridCells(grid, left, top, right, bottom, gridCells) {
  const size = grid.cellSize;
  const cols = grid.len.x;
  const rows = grid.len.y;
  const minCol = Math.max(0, Math.floor(Math.min(left, right) / size));
  const maxCol = Math.min(cols - 1, Math.floor(Math.max(left, right) / size));
  const minRow = Math.max(0, Math.floor(Math.min(top, bottom) / size));
  const maxRow = Math.min(rows - 1, Math.floor(Math.max(top, bottom) / size));
  if (maxCol < minCol || maxRow < minRow || Math.max(left, right) < 0 || Math.min(left, right) >= cols * size || Math.max(top, bottom) < 0 || Math.min(top, bottom) >= rows * size) {
    clearGridCells(gridCells);
    return;
  }
  let index = 0;
  for (let row = minRow; row <= maxRow; row++)
    for (let col = minCol; col <= maxCol; col++)
      gridCells[index++] = row * cols + col;
  gridCells.length = index;
}
function clearGridCells(gridCells) {
  gridCells[0] = GRID_EMPTY_CELL;
  gridCells.length = 1;
}
var Grid = class {
  constructor(widthOrSize, heightOrCellSize, cellSize) {
    __publicField(this, "cellSize");
    __publicField(this, "len");
    if (widthOrSize instanceof Vec2) {
      this.cellSize = heightOrCellSize;
      this.len = new Vec2(Math.ceil(widthOrSize.x / this.cellSize), Math.ceil(widthOrSize.y / this.cellSize));
    } else {
      this.cellSize = cellSize;
      this.len = new Vec2(Math.ceil(widthOrSize / this.cellSize), Math.ceil(heightOrCellSize / this.cellSize));
    }
  }
  get totalCells() {
    return this.len.x * this.len.y;
  }
  testCells(aCells, bCells) {
    const aLen = aCells.length;
    const bLen = bCells.length;
    if (!aLen || !bLen)
      return false;
    let a = 0;
    let b = 0;
    while (a < aLen && aCells[a] === GRID_EMPTY_CELL)
      a++;
    while (b < bLen && bCells[b] === GRID_EMPTY_CELL)
      b++;
    if (a === aLen || b === bLen || aCells[a] > bCells[bLen - 1] || bCells[b] > aCells[aLen - 1])
      return false;
    while (a < aLen && b < bLen) {
      const ca = aCells[a];
      const cb = bCells[b];
      if (ca === cb)
        return true;
      if (ca < cb)
        a++;
      else
        b++;
    }
    return false;
  }
  getFirstCommonCell(aCells, bCells) {
    const aLen = aCells.length;
    const bLen = bCells.length;
    if (!aLen || !bLen)
      return GRID_EMPTY_CELL;
    let a = 0;
    let b = 0;
    while (a < aLen && aCells[a] === GRID_EMPTY_CELL)
      a++;
    while (b < bLen && bCells[b] === GRID_EMPTY_CELL)
      b++;
    if (a === aLen || b === bLen || aCells[a] > bCells[bLen - 1] || bCells[b] > aCells[aLen - 1])
      return GRID_EMPTY_CELL;
    while (a < aLen && b < bLen) {
      const ca = aCells[a];
      const cb = bCells[b];
      if (ca === cb)
        return ca;
      if (ca < cb)
        a++;
      else
        b++;
    }
    return GRID_EMPTY_CELL;
  }
  isFirstCommonCell(aCells, bCells, cellId) {
    if (aCells[0] === cellId || bCells[0] === cellId)
      return true;
    return this.getFirstCommonCell(aCells, bCells) === cellId;
  }
  getCell(xOrPoint, y) {
    const px = xOrPoint instanceof Vec2 ? xOrPoint.x : xOrPoint;
    const py = xOrPoint instanceof Vec2 ? xOrPoint.y : y;
    if (px < 0 || py < 0)
      return GRID_EMPTY_CELL;
    const col = Math.floor(px / this.cellSize);
    const row = Math.floor(py / this.cellSize);
    if (col >= this.len.x || row >= this.len.y)
      return GRID_EMPTY_CELL;
    return row * this.len.x + col;
  }
  getCellAt(point) {
    return this.getCell(point);
  }
  getCellsForBounds(min, max, out = []) {
    fillGridCells(this, min.x, min.y, max.x, max.y, out);
    return out;
  }
  getCellsForCircle(center, radius, out = []) {
    fillGridCells(this, center.x - radius, center.y - radius, center.x + radius, center.y + radius, out);
    return out;
  }
  getCellCoords(cellId, target = new Vec2()) {
    if (cellId < 0 || cellId >= this.totalCells)
      return target.setScalar(GRID_EMPTY_CELL, GRID_EMPTY_CELL);
    const cols = this.len.x;
    return target.setScalar(cellId % cols, Math.floor(cellId / cols));
  }
  draw(context, fillColor, strokeColor, strokeWidth) {
    const size = this.cellSize;
    const cols = this.len.x;
    const rows = this.len.y;
    const width = cols * size;
    const height = rows * size;
    if (fillColor) {
      context.fillStyle = fillColor;
      context.fillRect(0, 0, width, height);
    }
    if (strokeColor) {
      context.beginPath();
      for (let i = 0; i <= cols; i++) {
        const x = i * size;
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let j = 0; j <= rows; j++) {
        const y = j * size;
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.strokeStyle = strokeColor;
      context.lineWidth = strokeWidth;
      context.stroke();
    }
  }
};
__publicField(Grid, "emptyCell", GRID_EMPTY_CELL);
function applyCanvasStyle(context, fillColor, strokeColor, strokeWidth) {
  if (fillColor) {
    context.fillStyle = fillColor;
    context.fill();
  }
  if (strokeColor) {
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.stroke();
  }
}
var _Circ = class _Circ {
  constructor(radius, positionOrX, positionY) {
    __publicField(this, "position");
    __publicField(this, "halfSize");
    __publicField(this, "gridCells", [GRID_EMPTY_CELL]);
    __publicField(this, "grid");
    __publicField(this, "_radius");
    __publicField(this, "_diameter");
    __publicField(this, "shape", "circle");
    if (positionOrX instanceof Vec2)
      this.position = new Vec2(positionOrX.x, positionOrX.y);
    else
      this.position = new Vec2(typeof positionOrX === "number" ? positionOrX : 0, typeof positionY === "number" ? positionY : 0);
    this.halfSize = new Vec2(radius, radius);
    this._radius = radius;
    this._diameter = radius * 2;
    this.grid = null;
  }
  set radius(radius) {
    this._radius = radius;
    this._diameter = this._radius * 2;
    this.halfSize.setScalar(this._radius, this._radius);
    this.setGridPos();
  }
  get radius() {
    return this._radius;
  }
  set diameter(diameter) {
    this._diameter = diameter;
    this._radius = this._diameter * 0.5;
    this.halfSize.setScalar(this._radius, this._radius);
    this.setGridPos();
  }
  get diameter() {
    return this._diameter;
  }
  clone() {
    return new _Circ(this.radius, this.position.x, this.position.y).setGrid(this.grid);
  }
  copy(circ) {
    this.position.copy(circ.position);
    this.halfSize.copy(circ.halfSize);
    this._radius = circ.radius;
    this._diameter = circ.diameter;
    return this.setGrid(circ.grid);
  }
  setGrid(grid) {
    this.grid = grid;
    if (grid)
      this.setGridPos();
    else
      clearGridCells(this.gridCells);
    return this;
  }
  setPosition(position) {
    this.position.copy(position);
    this.setGridPos();
    return this;
  }
  translate(offset) {
    this.position.add(offset);
    this.setGridPos();
    return this;
  }
  getClosestPoint(point, target = new Vec2()) {
    const dSq = point.getDistance(this.position, true);
    if (dSq <= this.radius * this.radius)
      return target.copy(point);
    const d = Math.sqrt(dSq);
    return target.subVectors(point, this.position).scale(this.radius / d).add(this.position);
  }
  setRadius(radius) {
    this.radius = radius;
    return this;
  }
  setDiameter(diameter) {
    this.diameter = diameter;
    return this;
  }
  scale(scalar) {
    this.radius *= scalar;
    return this;
  }
  isIn(v) {
    return v.getDistance(this.position, true) <= this.radius * this.radius;
  }
  overlapsCircle(centerOrCirc, radius) {
    const center = "position" in centerOrCirc ? centerOrCirc.position : centerOrCirc;
    const r = "radius" in centerOrCirc ? centerOrCirc.radius : radius ?? 0;
    const totalR = this.radius + r;
    return this.position.getDistance(center, true) <= totalR * totalR;
  }
  overlapsRect(rect) {
    return rect.overlapsCircle(this.position, this.radius);
  }
  overlapsBounds(min, max) {
    _Circ.scratchMin.minVectors(min, max);
    _Circ.scratchMax.maxVectors(min, max);
    _Circ.scratchClosest.clampVectors(this.position, _Circ.scratchMin, _Circ.scratchMax);
    return this.position.getDistance(_Circ.scratchClosest, true) <= this._radius * this._radius;
  }
  getBounds(outMin, outMax) {
    outMin.subVectors(this.position, this.halfSize);
    outMax.addVectors(this.position, this.halfSize);
  }
  get boundsMin() {
    return new Vec2().subVectors(this.position, this.halfSize);
  }
  get boundsMax() {
    return new Vec2().addVectors(this.position, this.halfSize);
  }
  raycast(start, end, target) {
    const d = _Circ.scratchD.subVectors(end, start);
    const a = d.getMagnitude(true);
    const m = _Circ.scratchM.subVectors(start, this.position);
    const c = m.getMagnitude(true) - this._radius * this._radius;
    if (c <= 0) {
      const out2 = target ?? { fraction: 0, point: new Vec2(), normal: new Vec2() };
      out2.fraction = 0;
      out2.point.copy(start);
      if (m.getMagnitude(true) > 0)
        out2.normal.normalizeVector(m);
      else if (a > 0)
        out2.normal.normalizeVector(d).opposite();
      else
        out2.normal.setScalar(0, -1);
      return out2;
    }
    if (a === 0)
      return null;
    const halfB = m.dotProduct(d);
    if (halfB > 0)
      return null;
    const discriminant = halfB * halfB - a * c;
    if (discriminant < 0)
      return null;
    const t = (-halfB - Math.sqrt(discriminant)) / a;
    if (t < 0 || t > 1)
      return null;
    const out = target ?? { fraction: 0, point: new Vec2(), normal: new Vec2() };
    out.fraction = t;
    out.point.lerpVectors(start, end, t);
    if (this._radius > 0)
      out.normal.subVectors(out.point, this.position).divideScalar(this._radius);
    else
      out.normal.normalizeVector(d).opposite();
    return out;
  }
  draw(context, fillColor, strokeColor, strokeWidth) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Trigo.twopi, false);
    applyCanvasStyle(context, fillColor, strokeColor, strokeWidth);
  }
  setGridPos() {
    if (!this.grid)
      return;
    this.getBounds(_Circ.scratchMin, _Circ.scratchMax);
    this.grid.getCellsForBounds(_Circ.scratchMin, _Circ.scratchMax, this.gridCells);
  }
};
__publicField(_Circ, "scratchMin", new Vec2());
__publicField(_Circ, "scratchMax", new Vec2());
__publicField(_Circ, "scratchClosest", new Vec2());
__publicField(_Circ, "scratchD", new Vec2());
__publicField(_Circ, "scratchM", new Vec2());
var Circ = _Circ;
var _Rect = class _Rect {
  constructor(sizeOrWidth, heightOrPosition, positionXOrPosition, positionY) {
    __publicField(this, "position");
    __publicField(this, "topLeftCorner");
    __publicField(this, "bottomRightCorner");
    __publicField(this, "size");
    __publicField(this, "halfSize");
    __publicField(this, "gridCells", [GRID_EMPTY_CELL]);
    __publicField(this, "grid");
    __publicField(this, "shape", "aabb");
    if (sizeOrWidth instanceof Vec2) {
      const pos = heightOrPosition instanceof Vec2 ? heightOrPosition : new Vec2();
      this.position = new Vec2(pos.x, pos.y);
      this.size = new Vec2(sizeOrWidth.x, sizeOrWidth.y);
    } else {
      const w = sizeOrWidth;
      const h = typeof heightOrPosition === "number" ? heightOrPosition : w;
      if (positionXOrPosition instanceof Vec2)
        this.position = new Vec2(positionXOrPosition.x, positionXOrPosition.y);
      else {
        const px = typeof positionXOrPosition === "number" ? positionXOrPosition : 0;
        const py = typeof positionY === "number" ? positionY : 0;
        this.position = new Vec2(px, py);
      }
      this.size = new Vec2(w, h);
    }
    this.halfSize = new Vec2();
    this.topLeftCorner = new Vec2();
    this.bottomRightCorner = new Vec2();
    this.grid = null;
    this.setHalfSize();
    this.setCorners();
  }
  clone() {
    return new _Rect(this.size.x, this.size.y, this.position.x, this.position.y).setGrid(this.grid);
  }
  copy(rect) {
    this.size.copy(rect.size);
    this.position.copy(rect.position);
    this.setHalfSize();
    this.setCorners();
    return this.setGrid(rect.grid);
  }
  setGrid(grid) {
    this.grid = grid;
    if (grid)
      this.setGridPos();
    else
      clearGridCells(this.gridCells);
    return this;
  }
  setPosition(position) {
    this.position.copy(position);
    this.setCorners();
    this.setGridPos();
    return this;
  }
  translate(offset) {
    this.position.add(offset);
    this.topLeftCorner.add(offset);
    this.bottomRightCorner.add(offset);
    this.setGridPos();
    return this;
  }
  getClosestPoint(point, target = new Vec2()) {
    return target.clampVectors(point, this.topLeftCorner, this.bottomRightCorner);
  }
  setSize(sizeOrWidth, height) {
    if (sizeOrWidth instanceof Vec2)
      this.size.copy(sizeOrWidth);
    else
      this.size.setScalar(sizeOrWidth, height ?? sizeOrWidth);
    this.setHalfSize();
    this.setCorners();
    this.setGridPos();
    return this;
  }
  isIn(vector) {
    return vector.isInBounds(this.topLeftCorner, this.bottomRightCorner);
  }
  overlapsRect(rect) {
    return this.topLeftCorner.x <= rect.bottomRightCorner.x && this.bottomRightCorner.x >= rect.topLeftCorner.x && this.topLeftCorner.y <= rect.bottomRightCorner.y && this.bottomRightCorner.y >= rect.topLeftCorner.y;
  }
  overlapsBounds(min, max) {
    _Rect.scratchMin.minVectors(min, max);
    _Rect.scratchMax.maxVectors(min, max);
    return this.topLeftCorner.x <= _Rect.scratchMax.x && this.bottomRightCorner.x >= _Rect.scratchMin.x && this.topLeftCorner.y <= _Rect.scratchMax.y && this.bottomRightCorner.y >= _Rect.scratchMin.y;
  }
  overlapsCircle(centerOrCirc, radius) {
    const center = "position" in centerOrCirc ? centerOrCirc.position : centerOrCirc;
    const r = "radius" in centerOrCirc ? centerOrCirc.radius : radius ?? 0;
    _Rect.scratchClosest.clampVectors(center, this.topLeftCorner, this.bottomRightCorner);
    return center.getDistance(_Rect.scratchClosest, true) <= r * r;
  }
  getBounds(outMin, outMax) {
    outMin.copy(this.topLeftCorner);
    outMax.copy(this.bottomRightCorner);
  }
  get boundsMin() {
    return this.topLeftCorner;
  }
  get boundsMax() {
    return this.bottomRightCorner;
  }
  raycast(start, end, target) {
    const minX = this.topLeftCorner.x;
    const maxX = this.bottomRightCorner.x;
    const minY = this.topLeftCorner.y;
    const maxY = this.bottomRightCorner.y;
    if (start.isInBounds(this.topLeftCorner, this.bottomRightCorner)) {
      const out2 = target ?? { fraction: 0, point: new Vec2(), normal: new Vec2() };
      out2.fraction = 0;
      out2.point.copy(start);
      const distLeft = start.x - minX;
      const distRight = maxX - start.x;
      const distTop = start.y - minY;
      const distBottom = maxY - start.y;
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      if (minDist === distLeft)
        out2.normal.setScalar(-1, 0);
      else if (minDist === distRight)
        out2.normal.setScalar(1, 0);
      else if (minDist === distTop)
        out2.normal.setScalar(0, -1);
      else
        out2.normal.setScalar(0, 1);
      return out2;
    }
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let tMin = 0;
    let tMax = 1;
    let normalX = 0;
    let normalY = 0;
    if (Math.abs(dx) < 1e-8 && (start.x < minX || start.x > maxX))
      return null;
    if (Math.abs(dx) >= 1e-8) {
      const invD = 1 / dx;
      let t1 = (minX - start.x) * invD;
      let t2 = (maxX - start.x) * invD;
      let sign = -1;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        normalX = sign;
        normalY = 0;
      }
      if (t2 < tMax)
        tMax = t2;
      if (tMin > tMax)
        return null;
    }
    if (Math.abs(dy) < 1e-8 && (start.y < minY || start.y > maxY))
      return null;
    if (Math.abs(dy) >= 1e-8) {
      const invD = 1 / dy;
      let t1 = (minY - start.y) * invD;
      let t2 = (maxY - start.y) * invD;
      let sign = -1;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        normalX = 0;
        normalY = sign;
      }
      if (t2 < tMax)
        tMax = t2;
      if (tMin > tMax)
        return null;
    }
    const out = target ?? { fraction: 0, point: new Vec2(), normal: new Vec2() };
    out.fraction = tMin;
    out.point.lerpVectors(start, end, tMin);
    out.normal.x = normalX;
    out.normal.y = normalY;
    return out;
  }
  draw(context, fillColor, strokeColor, strokeWidth) {
    context.beginPath();
    context.rect(this.topLeftCorner.x, this.topLeftCorner.y, this.size.x, this.size.y);
    applyCanvasStyle(context, fillColor, strokeColor, strokeWidth);
  }
  setCorners() {
    this.topLeftCorner.subVectors(this.position, this.halfSize);
    this.bottomRightCorner.addVectors(this.position, this.halfSize);
  }
  setHalfSize() {
    this.halfSize.scaleVector(this.size, 0.5);
  }
  setGridPos() {
    if (this.grid)
      this.grid.getCellsForBounds(this.topLeftCorner, this.bottomRightCorner, this.gridCells);
  }
};
__publicField(_Rect, "scratchMin", new Vec2());
__publicField(_Rect, "scratchMax", new Vec2());
__publicField(_Rect, "scratchClosest", new Vec2());
var Rect = _Rect;
var _Vec3 = class _Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    this.x = x;
    this.y = y;
    this.z = z;
  }
  setScalar(x, y, z) {
    this.x = x ?? this.x;
    this.y = y ?? this.y;
    this.z = z ?? this.z;
    return this;
  }
  setArray(array, offset = 0) {
    this.x = array[offset] ?? this.x;
    this.y = array[offset + 1] ?? this.y;
    this.z = array[offset + 2] ?? this.z;
    return this;
  }
  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
    return this;
  }
  isPositive() {
    return this.x >= 0 && this.y >= 0 && this.z >= 0;
  }
  isEqualTo(scalar) {
    return this.x === scalar && this.y === scalar && this.z === scalar;
  }
  equals(vector) {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
  }
  isOrigin() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }
  toArray(target = []) {
    target[0] = this.x;
    target[1] = this.y;
    target[2] = this.z;
    target.length = 3;
    return target;
  }
  toString() {
    return `(x = ${this.x}; y = ${this.y}; z = ${this.z})`;
  }
  origin() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }
  getMagnitude(square = false) {
    const squared = this.x * this.x + this.y * this.y + this.z * this.z;
    return square ? squared : Math.sqrt(squared);
  }
  getDistance(vector, square = false) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    const dz = this.z - vector.z;
    const squared = dx * dx + dy * dy + dz * dz;
    return square ? squared : Math.sqrt(squared);
  }
  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    return this;
  }
  addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  }
  addScaledVector(vector, scalar) {
    this.x += vector.x * scalar;
    this.y += vector.y * scalar;
    this.z += vector.z * scalar;
    return this;
  }
  addScalar(scalar) {
    this.x += scalar;
    this.y += scalar;
    this.z += scalar;
    return this;
  }
  addComponents() {
    return this.x + this.y + this.z;
  }
  subtract(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    return this;
  }
  subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }
  subtractScaledVector(vector, scalar) {
    this.x -= vector.x * scalar;
    this.y -= vector.y * scalar;
    this.z -= vector.z * scalar;
    return this;
  }
  subtractScalar(scalar) {
    this.x -= scalar;
    this.y -= scalar;
    this.z -= scalar;
    return this;
  }
  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;
    this.z *= vector.z;
    return this;
  }
  multiplyVectors(a, b) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  }
  multiplyScaledVector(vector, scalar) {
    this.x *= vector.x * scalar;
    this.y *= vector.y * scalar;
    this.z *= vector.z * scalar;
    return this;
  }
  scale(scalar, axis) {
    if (!axis) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      return this;
    }
    this[axis] *= scalar;
    return this;
  }
  scaleVector(vector, scalar) {
    this.x = vector.x * scalar;
    this.y = vector.y * scalar;
    this.z = vector.z * scalar;
    return this;
  }
  divide(vector) {
    this.x /= vector.x;
    this.y /= vector.y;
    this.z /= vector.z;
    return this;
  }
  divideVectors(a, b) {
    this.x = a.x / b.x;
    this.y = a.y / b.y;
    this.z = a.z / b.z;
    return this;
  }
  divideScaledVector(vector, scalar) {
    this.x /= vector.x * scalar;
    this.y /= vector.y * scalar;
    this.z /= vector.z * scalar;
    return this;
  }
  divideScalar(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;
    return this;
  }
  halve() {
    this.x *= 0.5;
    this.y *= 0.5;
    this.z *= 0.5;
    return this;
  }
  max(vector) {
    this.x = Math.max(this.x, vector.x);
    this.y = Math.max(this.y, vector.y);
    this.z = Math.max(this.z, vector.z);
    return this;
  }
  min(vector) {
    this.x = Math.min(this.x, vector.x);
    this.y = Math.min(this.y, vector.y);
    this.z = Math.min(this.z, vector.z);
    return this;
  }
  minVectors(a, b) {
    this.x = Math.min(a.x, b.x);
    this.y = Math.min(a.y, b.y);
    this.z = Math.min(a.z, b.z);
    return this;
  }
  maxVectors(a, b) {
    this.x = Math.max(a.x, b.x);
    this.y = Math.max(a.y, b.y);
    this.z = Math.max(a.z, b.z);
    return this;
  }
  maxScalar(scalar) {
    this.x = Math.max(this.x, scalar);
    this.y = Math.max(this.y, scalar);
    this.z = Math.max(this.z, scalar);
    return this;
  }
  minScalar(scalar) {
    this.x = Math.min(this.x, scalar);
    this.y = Math.min(this.y, scalar);
    this.z = Math.min(this.z, scalar);
    return this;
  }
  normalize(fallback) {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length) {
      if (length !== 1) {
        const inv = 1 / length;
        this.x *= inv;
        this.y *= inv;
        this.z *= inv;
      }
    } else if (fallback) {
      this.x = fallback.x;
      this.y = fallback.y;
      this.z = fallback.z;
    }
    return this;
  }
  normalizeVector(vector, fallback) {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    if (length) {
      const inv = 1 / length;
      this.x = vector.x * inv;
      this.y = vector.y * inv;
      this.z = vector.z * inv;
    } else if (fallback) {
      this.x = fallback.x;
      this.y = fallback.y;
      this.z = fallback.z;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  }
  setLength(length) {
    return this.normalize().scale(length);
  }
  setLengthVector(vector, length) {
    return this.normalizeVector(vector).scale(length);
  }
  absolute(axis) {
    if (!axis) {
      this.x = Math.abs(this.x);
      this.y = Math.abs(this.y);
      this.z = Math.abs(this.z);
      return this;
    }
    this[axis] = Math.abs(this[axis]);
    return this;
  }
  absoluteVector(vector) {
    this.x = Math.abs(vector.x);
    this.y = Math.abs(vector.y);
    this.z = Math.abs(vector.z);
    return this;
  }
  opposite(axis) {
    if (!axis) {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      return this;
    }
    this[axis] = -this[axis];
    return this;
  }
  oppositeVector(vector) {
    this.x = -vector.x;
    this.y = -vector.y;
    this.z = -vector.z;
    return this;
  }
  sign() {
    this.x = Math.sign(this.x);
    this.y = Math.sign(this.y);
    this.z = Math.sign(this.z);
    return this;
  }
  floor(axis) {
    if (!axis) {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    }
    this[axis] = Math.floor(this[axis]);
    return this;
  }
  ceil(axis) {
    if (!axis) {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    }
    this[axis] = Math.ceil(this[axis]);
    return this;
  }
  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  clone() {
    return new _Vec3(this.x, this.y, this.z);
  }
  cross(v) {
    const x = this.x, y = this.y, z = this.z;
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    return this;
  }
  crossVectors(a, b) {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }
  getAngle(vector) {
    const magnitudes = this.getMagnitude() * vector.getMagnitude();
    if (!magnitudes)
      return false;
    return Math.acos(Utils.clamp(this.dotProduct(vector) / magnitudes, -1, 1));
  }
  quadraticBezier(p0, p1, p2, t) {
    this.x = Bezier.quadratic(p0.x, p1.x, p2.x, t);
    this.y = Bezier.quadratic(p0.y, p1.y, p2.y, t);
    this.z = Bezier.quadratic(p0.z, p1.z, p2.z, t);
    return this;
  }
  cubicBezier(p0, p1, p2, p3, t) {
    this.x = Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t);
    this.y = Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t);
    this.z = Bezier.cubic(p0.z, p1.z, p2.z, p3.z, t);
    return this;
  }
  quadraticBezierDerivative(p0, p1, p2, t) {
    this.x = Bezier.quadraticDerivative(p0.x, p1.x, p2.x, t);
    this.y = Bezier.quadraticDerivative(p0.y, p1.y, p2.y, t);
    this.z = Bezier.quadraticDerivative(p0.z, p1.z, p2.z, t);
    return this;
  }
  cubicBezierDerivative(p0, p1, p2, p3, t) {
    this.x = Bezier.cubicDerivative(p0.x, p1.x, p2.x, p3.x, t);
    this.y = Bezier.cubicDerivative(p0.y, p1.y, p2.y, p3.y, t);
    this.z = Bezier.cubicDerivative(p0.z, p1.z, p2.z, p3.z, t);
    return this;
  }
  quadraticBezierSplit(p0, p1, p2, t, left, right) {
    if (!left[0])
      left[0] = new _Vec3();
    if (!left[1])
      left[1] = new _Vec3();
    if (!left[2])
      left[2] = new _Vec3();
    if (!right[0])
      right[0] = new _Vec3();
    if (!right[1])
      right[1] = new _Vec3();
    if (!right[2])
      right[2] = new _Vec3();
    left[0].copy(p0);
    const p01 = left[1].lerpVectors(p0, p1, t);
    const p12 = right[1].lerpVectors(p1, p2, t);
    const mid = left[2].lerpVectors(p01, p12, t);
    right[0].copy(mid);
    right[2].copy(p2);
    left.length = 3;
    right.length = 3;
  }
  cubicBezierSplit(p0, p1, p2, p3, t, left, right) {
    if (!left[0])
      left[0] = new _Vec3();
    if (!left[1])
      left[1] = new _Vec3();
    if (!left[2])
      left[2] = new _Vec3();
    if (!left[3])
      left[3] = new _Vec3();
    if (!right[0])
      right[0] = new _Vec3();
    if (!right[1])
      right[1] = new _Vec3();
    if (!right[2])
      right[2] = new _Vec3();
    if (!right[3])
      right[3] = new _Vec3();
    left[0].copy(p0);
    const p01 = left[1].lerpVectors(p0, p1, t);
    const p12 = _Vec3.scratchSplit1.lerpVectors(p1, p2, t);
    const p23 = right[2].lerpVectors(p2, p3, t);
    const p012 = left[2].lerpVectors(p01, p12, t);
    const p123 = right[1].lerpVectors(p12, p23, t);
    const mid = left[3].lerpVectors(p012, p123, t);
    right[0].copy(mid);
    right[3].copy(p3);
    left.length = 4;
    right.length = 4;
  }
  quadraticBezierLength(p0, p1, p2, samples) {
    return sampleCurveLength((t) => Bezier.quadratic(p0.x, p1.x, p2.x, t), (t) => Bezier.quadratic(p0.y, p1.y, p2.y, t), (t) => Bezier.quadratic(p0.z, p1.z, p2.z, t), samples);
  }
  cubicBezierLength(p0, p1, p2, p3, samples) {
    return sampleCurveLength((t) => Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t), (t) => Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t), (t) => Bezier.cubic(p0.z, p1.z, p2.z, p3.z, t), samples);
  }
  quadraticBezierParameterAtLength(p0, p1, p2, distance, samples) {
    return sampleCurveParameterAtLength((t) => Bezier.quadratic(p0.x, p1.x, p2.x, t), (t) => Bezier.quadratic(p0.y, p1.y, p2.y, t), (t) => Bezier.quadratic(p0.z, p1.z, p2.z, t), distance, samples);
  }
  cubicBezierParameterAtLength(p0, p1, p2, p3, distance, samples) {
    return sampleCurveParameterAtLength((t) => Bezier.cubic(p0.x, p1.x, p2.x, p3.x, t), (t) => Bezier.cubic(p0.y, p1.y, p2.y, p3.y, t), (t) => Bezier.cubic(p0.z, p1.z, p2.z, p3.z, t), distance, samples);
  }
  clamp(min, max) {
    return this.clampVectors(this, min, max);
  }
  clampVectors(value, min, max) {
    this.x = Utils.clamp(value.x, min.x, max.x);
    this.y = Utils.clamp(value.y, min.y, max.y);
    this.z = Utils.clamp(value.z, min.z, max.z);
    return this;
  }
  project(normal) {
    return this.scaleVector(normal, this.dotProduct(normal));
  }
  projectVector(vector, normal) {
    return this.scaleVector(normal, vector.dotProduct(normal));
  }
  reflect(normal) {
    return this.subtractScaledVector(normal, 2 * this.dotProduct(normal));
  }
  reflectVector(vector, normal) {
    return this.copy(vector).subtractScaledVector(normal, 2 * vector.dotProduct(normal));
  }
  clampScalar(min, max) {
    this.x = Utils.clamp(this.x, min, max);
    this.y = Utils.clamp(this.y, min, max);
    this.z = Utils.clamp(this.z, min, max);
    return this;
  }
  clampToExtent(extent) {
    this.x = Utils.clamp(this.x, -extent.x, extent.x);
    this.y = Utils.clamp(this.y, -extent.y, extent.y);
    this.z = Utils.clamp(this.z, -extent.z, extent.z);
    return this;
  }
  clampToExtentVectors(vector, extent) {
    this.x = Utils.clamp(vector.x, -extent.x, extent.x);
    this.y = Utils.clamp(vector.y, -extent.y, extent.y);
    this.z = Utils.clamp(vector.z, -extent.z, extent.z);
    return this;
  }
  isInBounds(min, max) {
    const minX = Math.min(min.x, max.x);
    const maxX = Math.max(min.x, max.x);
    const minY = Math.min(min.y, max.y);
    const maxY = Math.max(min.y, max.y);
    const minZ = Math.min(min.z, max.z);
    const maxZ = Math.max(min.z, max.z);
    return this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY && this.z >= minZ && this.z <= maxZ;
  }
  lerp(minOrTarget, maxOrAmount, amount) {
    if (typeof maxOrAmount === "number") {
      this.x = Utils.lerp(this.x, minOrTarget.x, maxOrAmount);
      this.y = Utils.lerp(this.y, minOrTarget.y, maxOrAmount);
      this.z = Utils.lerp(this.z, minOrTarget.z, maxOrAmount);
      return this;
    }
    this.x = Utils.lerp(minOrTarget.x, maxOrAmount.x, amount);
    this.y = Utils.lerp(minOrTarget.y, maxOrAmount.y, amount);
    this.z = Utils.lerp(minOrTarget.z, maxOrAmount.z, amount);
    return this;
  }
  lerpVectors(min, max, amount) {
    this.x = Utils.lerp(min.x, max.x, amount);
    this.y = Utils.lerp(min.y, max.y, amount);
    this.z = Utils.lerp(min.z, max.z, amount);
    return this;
  }
};
__publicField(_Vec3, "scratchSplit1", new _Vec3());
var Vec3 = _Vec3;
function matrixToArray(matrix, target) {
  if (target) {
    target.set(matrix);
    return target;
  }
  return matrix;
}
function transposeLinear3(m, stride) {
  let t = m[1];
  m[1] = m[stride];
  m[stride] = t;
  t = m[2];
  m[2] = m[2 * stride];
  m[2 * stride] = t;
  t = m[stride + 2];
  m[stride + 2] = m[2 * stride + 1];
  m[2 * stride + 1] = t;
}
function transpose4(m) {
  let t = m[1];
  m[1] = m[4];
  m[4] = t;
  t = m[2];
  m[2] = m[8];
  m[8] = t;
  t = m[3];
  m[3] = m[12];
  m[12] = t;
  t = m[6];
  m[6] = m[9];
  m[9] = t;
  t = m[7];
  m[7] = m[13];
  m[13] = t;
  t = m[11];
  m[11] = m[14];
  m[14] = t;
}
function determinantLinear3(m, stride) {
  const a00 = m[0], a10 = m[1], a20 = m[2];
  const a01 = m[stride], a11 = m[stride + 1], a21 = m[stride + 2];
  const a02 = m[2 * stride], a12 = m[2 * stride + 1], a22 = m[2 * stride + 2];
  return a00 * (a11 * a22 - a12 * a21) - a01 * (a10 * a22 - a12 * a20) + a02 * (a10 * a21 - a11 * a20);
}
function invertLinear3(m, stride) {
  const a00 = m[0], a10 = m[1], a20 = m[2];
  const a01 = m[stride], a11 = m[stride + 1], a21 = m[stride + 2];
  const a02 = m[2 * stride], a12 = m[2 * stride + 1], a22 = m[2 * stride + 2];
  const b00 = a11 * a22 - a12 * a21;
  const b10 = a12 * a20 - a10 * a22;
  const b20 = a10 * a21 - a11 * a20;
  const det = a00 * b00 + a10 * b10 + a20 * b20;
  if (!det)
    return false;
  const inv = 1 / det;
  m[0] = b00 * inv;
  m[1] = b10 * inv;
  m[2] = b20 * inv;
  m[stride] = (a02 * a21 - a01 * a22) * inv;
  m[stride + 1] = (a00 * a22 - a02 * a20) * inv;
  m[stride + 2] = (a01 * a20 - a00 * a21) * inv;
  m[2 * stride] = (a01 * a12 - a02 * a11) * inv;
  m[2 * stride + 1] = (a02 * a10 - a00 * a12) * inv;
  m[2 * stride + 2] = (a00 * a11 - a01 * a10) * inv;
  return true;
}
function determinant4(m) {
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function invert4(m) {
  const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
  const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
  const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
  const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det)
    return false;
  det = 1 / det;
  m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return true;
}
var Mat3 = class {
  constructor(x1, x2, x3, y1, y2, y3, t1, t2, t3) {
    __publicField(this, "m");
    this.m = new Float32Array(9);
    if (arguments.length === 0)
      this.identity();
    else
      this.make(x1, x2, x3, y1, y2, y3, t1, t2, t3);
  }
  make(x1, x2, x3, y1, y2, y3, t1, t2, t3) {
    this.m[0] = x1 ?? 0;
    this.m[1] = x2 ?? 0;
    this.m[2] = x3 ?? 0;
    this.m[3] = y1 ?? 0;
    this.m[4] = y2 ?? 0;
    this.m[5] = y3 ?? 0;
    this.m[6] = t1 ?? 0;
    this.m[7] = t2 ?? 0;
    this.m[8] = t3 ?? 0;
  }
  copy(matrix3x3) {
    matrixToArray(matrix3x3.m, this.m);
    return this;
  }
  toArray(target) {
    return matrixToArray(this.m, target);
  }
  toString() {
    return "(" + this.m[0] + "," + this.m[1] + "," + this.m[2] + ";" + this.m[3] + "," + this.m[4] + "," + this.m[5] + ";" + this.m[6] + "," + this.m[7] + "," + this.m[8] + ")";
  }
  identity() {
    this.make(1, 0, 0, 0, 1, 0, 0, 0, 1);
    return this;
  }
  scale(vector2) {
    const m = this.m;
    const sx = vector2.x;
    const sy = vector2.y;
    m[0] *= sx;
    m[1] *= sx;
    m[2] *= sx;
    m[3] *= sy;
    m[4] *= sy;
    m[5] *= sy;
    return this;
  }
  rotate(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x0 = m[0], x1 = m[1], x2 = m[2];
    const y0 = m[3], y1 = m[4], y2 = m[5];
    m[0] = c * x0 + s * y0;
    m[1] = c * x1 + s * y1;
    m[2] = c * x2 + s * y2;
    m[3] = -s * x0 + c * y0;
    m[4] = -s * x1 + c * y1;
    m[5] = -s * x2 + c * y2;
    return this;
  }
  translate(vector2) {
    const m = this.m;
    const tx = vector2.x;
    const ty = vector2.y;
    m[6] += m[0] * tx + m[3] * ty;
    m[7] += m[1] * tx + m[4] * ty;
    m[8] += m[2] * tx + m[5] * ty;
    return this;
  }
  multiply(matrix3x3) {
    const a = this.m;
    const b = matrix3x3.m;
    const a0 = a[0], a1 = a[1], a2 = a[2];
    const a3 = a[3], a4 = a[4], a5 = a[5];
    const a6 = a[6], a7 = a[7], a8 = a[8];
    a[0] = a0 * b[0] + a3 * b[1] + a6 * b[2];
    a[1] = a1 * b[0] + a4 * b[1] + a7 * b[2];
    a[2] = a2 * b[0] + a5 * b[1] + a8 * b[2];
    a[3] = a0 * b[3] + a3 * b[4] + a6 * b[5];
    a[4] = a1 * b[3] + a4 * b[4] + a7 * b[5];
    a[5] = a2 * b[3] + a5 * b[4] + a8 * b[5];
    a[6] = a0 * b[6] + a3 * b[7] + a6 * b[8];
    a[7] = a1 * b[6] + a4 * b[7] + a7 * b[8];
    a[8] = a2 * b[6] + a5 * b[7] + a8 * b[8];
    return this;
  }
  transpose() {
    transposeLinear3(this.m, 3);
    return this;
  }
  determinant() {
    return determinantLinear3(this.m, 3);
  }
  invert() {
    invertLinear3(this.m, 3);
    return this;
  }
};
var PARALLEL = 1e-16;
function setLookAtAxes(eye, target, up, xAxis, yAxis, zAxis) {
  zAxis.subVectors(eye, target);
  if (!zAxis.getMagnitude(true))
    return false;
  zAxis.normalize();
  xAxis.crossVectors(up, zAxis);
  if (xAxis.getMagnitude(true) < PARALLEL) {
    if (Math.abs(zAxis.y) < 0.999)
      xAxis.setScalar(0, 1, 0).cross(zAxis);
    else
      xAxis.setScalar(1, 0, 0).cross(zAxis);
  }
  xAxis.normalize();
  yAxis.crossVectors(zAxis, xAxis);
  return true;
}
var Mat4x3 = class {
  constructor(x1, x2, x3, y1, y2, y3, z1, z2, z3, t1, t2, t3) {
    __publicField(this, "m");
    __publicField(this, "xAxis");
    __publicField(this, "yAxis");
    __publicField(this, "zAxis");
    this.m = new Float32Array(16);
    if (arguments.length === 0)
      this.identity();
    else
      this.make(x1, x2, x3, y1, y2, y3, z1, z2, z3, t1, t2, t3);
  }
  make(x1, x2, x3, y1, y2, y3, z1, z2, z3, t1, t2, t3) {
    this.m[0] = x1 ?? 0;
    this.m[1] = x2 ?? 0;
    this.m[2] = x3 ?? 0;
    this.m[3] = 0;
    this.m[4] = y1 ?? 0;
    this.m[5] = y2 ?? 0;
    this.m[6] = y3 ?? 0;
    this.m[7] = 0;
    this.m[8] = z1 ?? 0;
    this.m[9] = z2 ?? 0;
    this.m[10] = z3 ?? 0;
    this.m[11] = 0;
    this.m[12] = t1 ?? 0;
    this.m[13] = t2 ?? 0;
    this.m[14] = t3 ?? 0;
    this.m[15] = 1;
  }
  copy(matrix4x3) {
    matrixToArray(matrix4x3.m, this.m);
    return this;
  }
  toArray(target) {
    return matrixToArray(this.m, target);
  }
  toString() {
    return "(" + this.m[0] + "," + this.m[1] + "," + this.m[2] + "," + this.m[3] + ";" + this.m[4] + "," + this.m[5] + "," + this.m[6] + "," + this.m[7] + ";" + this.m[8] + "," + this.m[9] + "," + this.m[10] + "," + this.m[11] + ";" + this.m[12] + "," + this.m[13] + "," + this.m[14] + "," + this.m[15] + ")";
  }
  identity() {
    this.make(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
    return this;
  }
  scale(vector3) {
    const m = this.m;
    const sx = vector3.x;
    const sy = vector3.y;
    const sz = vector3.z;
    m[0] *= sx;
    m[1] *= sx;
    m[2] *= sx;
    m[4] *= sy;
    m[5] *= sy;
    m[6] *= sy;
    m[8] *= sz;
    m[9] *= sz;
    m[10] *= sz;
    return this;
  }
  rotateX(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const y0 = m[4], y1 = m[5], y2 = m[6];
    const z0 = m[8], z1 = m[9], z2 = m[10];
    m[4] = c * y0 + s * z0;
    m[5] = c * y1 + s * z1;
    m[6] = c * y2 + s * z2;
    m[8] = -s * y0 + c * z0;
    m[9] = -s * y1 + c * z1;
    m[10] = -s * y2 + c * z2;
    return this;
  }
  rotateY(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x0 = m[0], x1 = m[1], x2 = m[2];
    const z0 = m[8], z1 = m[9], z2 = m[10];
    m[0] = c * x0 - s * z0;
    m[1] = c * x1 - s * z1;
    m[2] = c * x2 - s * z2;
    m[8] = s * x0 + c * z0;
    m[9] = s * x1 + c * z1;
    m[10] = s * x2 + c * z2;
    return this;
  }
  rotateZ(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x0 = m[0], x1 = m[1], x2 = m[2];
    const y0 = m[4], y1 = m[5], y2 = m[6];
    m[0] = c * x0 + s * y0;
    m[1] = c * x1 + s * y1;
    m[2] = c * x2 + s * y2;
    m[4] = -s * x0 + c * y0;
    m[5] = -s * x1 + c * y1;
    m[6] = -s * x2 + c * y2;
    return this;
  }
  translate(vector3) {
    const m = this.m;
    const tx = vector3.x;
    const ty = vector3.y;
    const tz = vector3.z;
    m[12] += m[0] * tx + m[4] * ty + m[8] * tz;
    m[13] += m[1] * tx + m[5] * ty + m[9] * tz;
    m[14] += m[2] * tx + m[6] * ty + m[10] * tz;
    return this;
  }
  multiply(matrix4x3) {
    const a = this.m;
    const b = matrix4x3.m;
    const a0 = a[0], a1 = a[1], a2 = a[2];
    const a4 = a[4], a5 = a[5], a6 = a[6];
    const a8 = a[8], a9 = a[9], a10 = a[10];
    const a12 = a[12], a13 = a[13], a14 = a[14];
    a[0] = a0 * b[0] + a4 * b[1] + a8 * b[2];
    a[1] = a1 * b[0] + a5 * b[1] + a9 * b[2];
    a[2] = a2 * b[0] + a6 * b[1] + a10 * b[2];
    a[4] = a0 * b[4] + a4 * b[5] + a8 * b[6];
    a[5] = a1 * b[4] + a5 * b[5] + a9 * b[6];
    a[6] = a2 * b[4] + a6 * b[5] + a10 * b[6];
    a[8] = a0 * b[8] + a4 * b[9] + a8 * b[10];
    a[9] = a1 * b[8] + a5 * b[9] + a9 * b[10];
    a[10] = a2 * b[8] + a6 * b[9] + a10 * b[10];
    a[12] = a0 * b[12] + a4 * b[13] + a8 * b[14] + a12;
    a[13] = a1 * b[12] + a5 * b[13] + a9 * b[14] + a13;
    a[14] = a2 * b[12] + a6 * b[13] + a10 * b[14] + a14;
    return this;
  }
  lookAtRH(eye, target, up) {
    if (!this.zAxis)
      this.zAxis = new Vec3();
    if (!this.xAxis)
      this.xAxis = new Vec3();
    if (!this.yAxis)
      this.yAxis = new Vec3();
    const zAxis = this.zAxis;
    const xAxis = this.xAxis;
    const yAxis = this.yAxis;
    if (!setLookAtAxes(eye, target, up, xAxis, yAxis, zAxis))
      return this.identity();
    this.make(xAxis.x, yAxis.x, zAxis.x, xAxis.y, yAxis.y, zAxis.y, xAxis.z, yAxis.z, zAxis.z, -xAxis.dotProduct(eye), -yAxis.dotProduct(eye), -zAxis.dotProduct(eye));
    return this;
  }
  transposeLinear() {
    transposeLinear3(this.m, 4);
    return this;
  }
  determinantLinear() {
    return determinantLinear3(this.m, 4);
  }
  invertAffine() {
    const m = this.m;
    const tx = m[12], ty = m[13], tz = m[14];
    if (!invertLinear3(m, 4))
      return this;
    m[12] = -(m[0] * tx + m[4] * ty + m[8] * tz);
    m[13] = -(m[1] * tx + m[5] * ty + m[9] * tz);
    m[14] = -(m[2] * tx + m[6] * ty + m[10] * tz);
    return this;
  }
};
var Mat4 = class {
  constructor(x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4, t1, t2, t3, t4) {
    __publicField(this, "m");
    __publicField(this, "xAxis");
    __publicField(this, "yAxis");
    __publicField(this, "zAxis");
    this.m = new Float32Array(16);
    if (arguments.length === 0)
      this.identity();
    else
      this.make(x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4, t1, t2, t3, t4);
  }
  make(x1, x2, x3, x4, y1, y2, y3, y4, z1, z2, z3, z4, t1, t2, t3, t4) {
    this.m[0] = x1 ?? 0;
    this.m[1] = x2 ?? 0;
    this.m[2] = x3 ?? 0;
    this.m[3] = x4 ?? 0;
    this.m[4] = y1 ?? 0;
    this.m[5] = y2 ?? 0;
    this.m[6] = y3 ?? 0;
    this.m[7] = y4 ?? 0;
    this.m[8] = z1 ?? 0;
    this.m[9] = z2 ?? 0;
    this.m[10] = z3 ?? 0;
    this.m[11] = z4 ?? 0;
    this.m[12] = t1 ?? 0;
    this.m[13] = t2 ?? 0;
    this.m[14] = t3 ?? 0;
    this.m[15] = t4 ?? 0;
  }
  copy(matrix4x4) {
    matrixToArray(matrix4x4.m, this.m);
    return this;
  }
  toArray(target) {
    return matrixToArray(this.m, target);
  }
  toString() {
    return "(" + this.m[0] + "," + this.m[1] + "," + this.m[2] + "," + this.m[3] + ";" + this.m[4] + "," + this.m[5] + "," + this.m[6] + "," + this.m[7] + ";" + this.m[8] + "," + this.m[9] + "," + this.m[10] + "," + this.m[11] + ";" + this.m[12] + "," + this.m[13] + "," + this.m[14] + "," + this.m[15] + ")";
  }
  identity() {
    this.make(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    return this;
  }
  scale(vector3) {
    const m = this.m;
    const sx = vector3.x;
    const sy = vector3.y;
    const sz = vector3.z;
    m[0] *= sx;
    m[1] *= sx;
    m[2] *= sx;
    m[3] *= sx;
    m[4] *= sy;
    m[5] *= sy;
    m[6] *= sy;
    m[7] *= sy;
    m[8] *= sz;
    m[9] *= sz;
    m[10] *= sz;
    m[11] *= sz;
    return this;
  }
  rotateX(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const y0 = m[4], y1 = m[5], y2 = m[6], y3 = m[7];
    const z0 = m[8], z1 = m[9], z2 = m[10], z3 = m[11];
    m[4] = c * y0 + s * z0;
    m[5] = c * y1 + s * z1;
    m[6] = c * y2 + s * z2;
    m[7] = c * y3 + s * z3;
    m[8] = -s * y0 + c * z0;
    m[9] = -s * y1 + c * z1;
    m[10] = -s * y2 + c * z2;
    m[11] = -s * y3 + c * z3;
    return this;
  }
  rotateY(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x0 = m[0], x1 = m[1], x2 = m[2], x3 = m[3];
    const z0 = m[8], z1 = m[9], z2 = m[10], z3 = m[11];
    m[0] = c * x0 - s * z0;
    m[1] = c * x1 - s * z1;
    m[2] = c * x2 - s * z2;
    m[3] = c * x3 - s * z3;
    m[8] = s * x0 + c * z0;
    m[9] = s * x1 + c * z1;
    m[10] = s * x2 + c * z2;
    m[11] = s * x3 + c * z3;
    return this;
  }
  rotateZ(angle) {
    const m = this.m;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x0 = m[0], x1 = m[1], x2 = m[2], x3 = m[3];
    const y0 = m[4], y1 = m[5], y2 = m[6], y3 = m[7];
    m[0] = c * x0 + s * y0;
    m[1] = c * x1 + s * y1;
    m[2] = c * x2 + s * y2;
    m[3] = c * x3 + s * y3;
    m[4] = -s * x0 + c * y0;
    m[5] = -s * x1 + c * y1;
    m[6] = -s * x2 + c * y2;
    m[7] = -s * x3 + c * y3;
    return this;
  }
  translate(vector3) {
    const m = this.m;
    const tx = vector3.x;
    const ty = vector3.y;
    const tz = vector3.z;
    m[12] += m[0] * tx + m[4] * ty + m[8] * tz;
    m[13] += m[1] * tx + m[5] * ty + m[9] * tz;
    m[14] += m[2] * tx + m[6] * ty + m[10] * tz;
    m[15] += m[3] * tx + m[7] * ty + m[11] * tz;
    return this;
  }
  multiply(matrix4x4) {
    const a = this.m;
    const b = matrix4x4.m;
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
    const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
    const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
    const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];
    a[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
    a[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
    a[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
    a[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
    a[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
    a[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
    a[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
    a[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
    a[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
    a[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
    a[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
    a[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
    a[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
    a[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
    a[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
    a[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
    return this;
  }
  perspective(fovy, aspect, znear, zfar) {
    let f = Math.tan(Trigo.halfpi - 0.5 * fovy * Trigo.pi / 180);
    let rangeInv = 1 / (znear - zfar);
    this.make(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (znear + zfar) * rangeInv, -1, 0, 0, znear * zfar * rangeInv * 2, 0);
    return this;
  }
  orthographic(left, right, top, bottom, near, far) {
    const w = right - left;
    const h = top - bottom;
    const p = far - near;
    const x = (right + left) / w;
    const y = (top + bottom) / h;
    const z = (far + near) / p;
    this.make(2 / w, 0, 0, 0, 0, 2 / h, 0, 0, 0, 0, -2 / p, 0, -x, -y, -z, 1);
    return this;
  }
  transpose() {
    transpose4(this.m);
    return this;
  }
  determinant() {
    return determinant4(this.m);
  }
  invert() {
    invert4(this.m);
    return this;
  }
  lookAtRH(eye, target, up) {
    if (!this.zAxis)
      this.zAxis = new Vec3();
    if (!this.xAxis)
      this.xAxis = new Vec3();
    if (!this.yAxis)
      this.yAxis = new Vec3();
    const zAxis = this.zAxis;
    const xAxis = this.xAxis;
    const yAxis = this.yAxis;
    if (!setLookAtAxes(eye, target, up, xAxis, yAxis, zAxis))
      return this.identity();
    this.make(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, -xAxis.dotProduct(eye), -yAxis.dotProduct(eye), -zAxis.dotProduct(eye), 1);
    return this;
  }
};
var Quat = class _Quat {
  constructor(w = 1, x = 0, y = 0, z = 0) {
    __publicField(this, "w");
    __publicField(this, "vector");
    this.vector = new Vec3(x, y, z);
    this.w = w;
  }
  set(w, x, y, z) {
    this.w = w;
    this.vector.setScalar(x, y, z);
    return this;
  }
  identity() {
    return this.set(1, 0, 0, 0);
  }
  setAxisAngle(axis, angle) {
    const length = axis.getMagnitude();
    if (!length)
      return this.identity();
    const half = angle * 0.5;
    this.vector.scaleVector(axis, Math.sin(half) / length);
    this.w = Math.cos(half);
    return this;
  }
  setFromEuler(xOrEuler, y, z) {
    const ex = xOrEuler instanceof Vec3 ? xOrEuler.x : xOrEuler;
    const ey = xOrEuler instanceof Vec3 ? xOrEuler.y : y;
    const ez = xOrEuler instanceof Vec3 ? xOrEuler.z : z;
    const hx = ex * 0.5;
    const hy = ey * 0.5;
    const hz = ez * 0.5;
    const cx = Math.cos(hx);
    const cy = Math.cos(hy);
    const cz = Math.cos(hz);
    const sx = Math.sin(hx);
    const sy = Math.sin(hy);
    const sz = Math.sin(hz);
    this.w = cx * cy * cz - sx * sy * sz;
    this.vector.x = sx * cy * cz + cx * sy * sz;
    this.vector.y = cx * sy * cz - sx * cy * sz;
    this.vector.z = cx * cy * sz + sx * sy * cz;
    return this;
  }
  getAxisAngle(axis) {
    const length = this.vector.getMagnitude();
    if (length < 1e-8) {
      axis.setScalar(1, 0, 0);
      return 0;
    }
    axis.normalizeVector(this.vector);
    return 2 * Math.acos(Utils.clamp(this.w, -1, 1));
  }
  clone() {
    return new _Quat(this.w, this.vector.x, this.vector.y, this.vector.z);
  }
  copy(q) {
    this.w = q.w;
    this.vector.copy(q.vector);
    return this;
  }
  toArray(target = []) {
    target[0] = this.w;
    target[1] = this.vector.x;
    target[2] = this.vector.y;
    target[3] = this.vector.z;
    target.length = 4;
    return target;
  }
  toString() {
    return `(x = ${this.vector.x}; y = ${this.vector.y}; z = ${this.vector.z}; w = ${this.w})`;
  }
  getMagnitude(square = false) {
    const squared = this.w * this.w + this.vector.getMagnitude(true);
    return square ? squared : Math.sqrt(squared);
  }
  normalize() {
    const length = this.getMagnitude();
    if (length && length !== 1) {
      const inv = 1 / length;
      this.w *= inv;
      this.vector.scale(inv);
    }
    return this;
  }
  conjugate() {
    this.vector.opposite();
    return this;
  }
  invert() {
    const squared = this.getMagnitude(true);
    if (!squared)
      return this;
    this.conjugate();
    if (squared !== 1) {
      const inv = 1 / squared;
      this.w *= inv;
      this.vector.scale(inv);
    }
    return this;
  }
  dot(q) {
    return this.w * q.w + this.vector.dotProduct(q.vector);
  }
  multiply(q) {
    return this.setProduct(this.vector.x, this.vector.y, this.vector.z, this.w, q.vector.x, q.vector.y, q.vector.z, q.w);
  }
  premultiply(q) {
    return this.setProduct(q.vector.x, q.vector.y, q.vector.z, q.w, this.vector.x, this.vector.y, this.vector.z, this.w);
  }
  rotateX(angle) {
    const half = angle * 0.5;
    const bx = Math.sin(half);
    const bw = Math.cos(half);
    const ax = this.vector.x, ay = this.vector.y, az = this.vector.z, aw = this.w;
    this.vector.x = ax * bw + aw * bx;
    this.vector.y = ay * bw + az * bx;
    this.vector.z = az * bw - ay * bx;
    this.w = aw * bw - ax * bx;
    return this;
  }
  rotateY(angle) {
    const half = angle * 0.5;
    const by = Math.sin(half);
    const bw = Math.cos(half);
    const ax = this.vector.x, ay = this.vector.y, az = this.vector.z, aw = this.w;
    this.vector.x = ax * bw - az * by;
    this.vector.y = ay * bw + aw * by;
    this.vector.z = az * bw + ax * by;
    this.w = aw * bw - ay * by;
    return this;
  }
  rotateZ(angle) {
    const half = angle * 0.5;
    const bz = Math.sin(half);
    const bw = Math.cos(half);
    const ax = this.vector.x, ay = this.vector.y, az = this.vector.z, aw = this.w;
    this.vector.x = ax * bw + ay * bz;
    this.vector.y = ay * bw - ax * bz;
    this.vector.z = az * bw + aw * bz;
    this.w = aw * bw - az * bz;
    return this;
  }
  slerp(q, t) {
    if (t === 0)
      return this;
    if (t === 1)
      return this.copy(q);
    let bx = q.vector.x, by = q.vector.y, bz = q.vector.z, bw = q.w;
    const ax = this.vector.x, ay = this.vector.y, az = this.vector.z, aw = this.w;
    let cosom = aw * bw + ax * bx + ay * by + az * bz;
    if (cosom < 0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    if (cosom > 0.9995) {
      this.w = aw + t * (bw - aw);
      this.vector.setScalar(ax + t * (bx - ax), ay + t * (by - ay), az + t * (bz - az));
      return this.normalize();
    }
    const omega = Math.acos(Utils.clamp(cosom, -1, 1));
    const sinom = Math.sin(omega);
    const scale0 = Math.sin((1 - t) * omega) / sinom;
    const scale1 = Math.sin(t * omega) / sinom;
    this.w = scale0 * aw + scale1 * bw;
    this.vector.setScalar(scale0 * ax + scale1 * bx, scale0 * ay + scale1 * by, scale0 * az + scale1 * bz);
    return this;
  }
  multiplyVector(vector, target = new Vec3()) {
    const ux = this.vector.x, uy = this.vector.y, uz = this.vector.z, w = this.w;
    const vx = vector.x, vy = vector.y, vz = vector.z;
    const cx = uy * vz - uz * vy;
    const cy = uz * vx - ux * vz;
    const cz = ux * vy - uy * vx;
    target.x = vx + 2 * (w * cx + uy * cz - uz * cy);
    target.y = vy + 2 * (w * cy + uz * cx - ux * cz);
    target.z = vz + 2 * (w * cz + ux * cy - uy * cx);
    return target;
  }
  toMat4(target = new Mat4()) {
    this.writeRotation(target.toArray());
    return target;
  }
  toMat4x3(target = new Mat4x3()) {
    this.writeRotation(target.toArray());
    return target;
  }
  isIdentity() {
    return Math.abs(this.w - 1) < 1e-6 && this.vector.getMagnitude(true) < 1e-12;
  }
  setProduct(ax, ay, az, aw, bx, by, bz, bw) {
    this.vector.x = ax * bw + aw * bx + ay * bz - az * by;
    this.vector.y = ay * bw + aw * by + az * bx - ax * bz;
    this.vector.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;
    return this;
  }
  writeRotation(m) {
    const x = this.vector.x, y = this.vector.y, z = this.vector.z, w = this.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    m[0] = 1 - (yy + zz);
    m[1] = xy + wz;
    m[2] = xz - wy;
    m[3] = 0;
    m[4] = xy - wz;
    m[5] = 1 - (xx + zz);
    m[6] = yz + wx;
    m[7] = 0;
    m[8] = xz + wy;
    m[9] = yz - wx;
    m[10] = 1 - (xx + yy);
    m[11] = 0;
    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;
  }
};
export {
  Accumulator,
  Bezier,
  Circ,
  GRID_EMPTY_CELL,
  Grid,
  Mat3,
  Mat4,
  Mat4x3,
  NumArray,
  Quat,
  Rand,
  Rect,
  RollingAverage,
  Time,
  Trigo,
  Utils,
  Vec2,
  Vec3
};
//# sourceMappingURL=@1pizzateam_spock.js.map
