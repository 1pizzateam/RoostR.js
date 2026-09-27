/**
 * RoostR.js Logo: The Camera Frustum & Coordinate Gimbal (3D Engine Core)
 *
 * An abstract 3D visualization of the heart of a WebGL rendering engine:
 * - Perfectly centered 3D Frustum & Gimbal (zero eccentric wobble)
 * - Fixed aesthetic tilt (matching Spock.js) with smooth turntable rotation
 * - Natural, distortion-free perspective projection (CAMERA_DIST = 5.2)
 * - Tri-axial spherical coordinate gimbal rings (X, Y, Z orbital planes) with precision angle ticks
 * - Depth-attenuated line weights, alpha fading, and glowing vertex nodes
 * - Interactive mouse tracking & drag rotation, dark/light theme support
 */

function reducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

// 3D Geometry: centered at origin (0, 0, 0)
const FRUSTUM = {
  apex: [0, 0, -1.05],
  near: [
    [-0.35,  0.26, -0.35],
    [ 0.35,  0.26, -0.35],
    [ 0.35, -0.26, -0.35],
    [-0.35, -0.26, -0.35],
  ],
  far: [
    [-0.90,  0.68, 0.95],
    [ 0.90,  0.68, 0.95],
    [ 0.90, -0.68, 0.95],
    [-0.90, -0.68, 0.95],
  ]
};

// Tri-axial Gimbal rings (radius = 1.25)
const GIMBAL_RADIUS = 1.25;
const RING_SEGMENTS = 48;
const GIMBAL_XZ = [];
const GIMBAL_YZ = [];
const GIMBAL_XY = [];

for (let i = 0; i < RING_SEGMENTS; i++) {
  const a = (i / RING_SEGMENTS) * Math.PI * 2;
  const cosA = Math.cos(a) * GIMBAL_RADIUS;
  const sinA = Math.sin(a) * GIMBAL_RADIUS;
  GIMBAL_XZ.push([cosA, 0, sinA]);
  GIMBAL_YZ.push([0, cosA, sinA]);
  GIMBAL_XY.push([cosA, sinA, 0]);
}

// Perspective Camera Distance: 5.2 gives a natural, distortion-free projection
const CAMERA_DIST = 5.2;
const TILT_ANGLE = 0.35; // ~20 deg fixed tilt, matching Spock.js
const SPIN_SPEED = 0.45;

/**
 * Draw the homepage mark: animated 3D Camera Frustum & Coordinate Gimbal.
 * Shared by the Vue component and the offscreen renderer.
 */
export function drawLogo(context, state, theme) {
  const { width, height } = state;
  const cx = width * 0.5;
  const cy = height * 0.5;
  const scale = Math.min(width, height) * 0.31;

  if (scale <= 0) return;

  const isReduced = reducedMotion();
  const t = isReduced ? 1.0 : state.time;

  // 1. Ambient radial aura
  context.save();
  const glow = context.createRadialGradient(cx, cy, scale * 0.2, cx, cy, scale * 1.8);
  glow.addColorStop(0, theme.accentGlow || (theme.dark ? 'rgba(245, 124, 0, 0.28)' : 'rgba(245, 124, 0, 0.18)'));
  glow.addColorStop(1, 'transparent');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
  context.fill();

  // 2. 3D Orientation (Smooth turntable around Y, fixed aesthetic tilt around X)
  let yaw = isReduced ? 0.72 : t * SPIN_SPEED;
  let pitch = TILT_ANGLE;

  // Mouse interaction
  if (!isReduced && state.pointer) {
    const dx = (state.pointer.x - cx) / scale;
    const dy = (state.pointer.y - cy) / scale;
    yaw += dx * 0.35;
    pitch += dy * 0.20;
  }

  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch), sinP = Math.sin(pitch);

  function transform(v) {
    let [x, y, z] = v;

    // Yaw around Y
    let x1 = x * cosY + z * sinY;
    let y1 = y;
    let z1 = -x * sinY + z * cosY;

    // Pitch around X
    let x2 = x1;
    let y2 = y1 * cosP - z1 * sinP;
    let z2 = y1 * sinP + z1 * cosP;

    // Distortion-free perspective division
    const depth = CAMERA_DIST / (CAMERA_DIST - z2);

    return {
      x: cx + x2 * scale * depth,
      y: cy - y2 * scale * depth,
      z: z2,
      depthFactor: depth
    };
  }

  // Project Frustum Geometry
  const pApex = transform(FRUSTUM.apex);
  const pNear = FRUSTUM.near.map(transform);
  const pFar = FRUSTUM.far.map(transform);

  // Project Gimbal Rings
  const pGimbalXZ = GIMBAL_XZ.map(transform);
  const pGimbalYZ = GIMBAL_YZ.map(transform);
  const pGimbalXY = GIMBAL_XY.map(transform);

  // 3. Assemble Line Segments for Depth-Sorted Rendering
  const segments = [];

  function addRing(pts, color, baseWidth, isDashed = false) {
    const len = pts.length;
    for (let i = 0; i < len; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % len];
      const depth = (p1.z + p2.z) * 0.5;
      segments.push({
        type: 'ring',
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        depth,
        color,
        baseWidth,
        isDashed
      });
    }
  }

  // Add Coordinate Gimbal Rings
  addRing(pGimbalXZ, theme.dark ? '#f57c00' : '#e65100', 1.4); // Equatorial ring
  addRing(pGimbalYZ, theme.dark ? '#ffb74d' : '#f57c00', 1.0, true); // Meridian ring
  addRing(pGimbalXY, theme.dark ? '#ff9800' : '#ef6c00', 1.0); // Coronal ring

  // Equatorial Tick Marks
  const numTicks = 24;
  for (let i = 0; i < numTicks; i++) {
    const a = (i / numTicks) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const rIn = GIMBAL_RADIUS * (isMajor ? 0.90 : 0.94);
    const rOut = GIMBAL_RADIUS;
    const ptIn = transform([Math.cos(a) * rIn, 0, Math.sin(a) * rIn]);
    const ptOut = transform([Math.cos(a) * rOut, 0, Math.sin(a) * rOut]);
    const depth = (ptIn.z + ptOut.z) * 0.5;
    segments.push({
      type: 'tick',
      x1: ptIn.x, y1: ptIn.y,
      x2: ptOut.x, y2: ptOut.y,
      depth,
      color: isMajor ? (theme.dark ? '#ffe082' : '#e65100') : (theme.dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)'),
      baseWidth: isMajor ? 1.6 : 0.9,
      isDashed: false
    });
  }

  // Sightline Rays (Apex -> Far Viewport Corners)
  for (let i = 0; i < 4; i++) {
    const depth = (pApex.z + pFar[i].z) * 0.5;
    segments.push({
      type: 'ray',
      x1: pApex.x, y1: pApex.y,
      x2: pFar[i].x, y2: pFar[i].y,
      depth,
      color: theme.dark ? '#ffa726' : '#f57c00',
      baseWidth: 1.8,
      isDashed: false
    });
  }

  // Near Plane Edges
  for (let i = 0; i < 4; i++) {
    const p1 = pNear[i];
    const p2 = pNear[(i + 1) % 4];
    const depth = (p1.z + p2.z) * 0.5;
    segments.push({
      type: 'nearEdge',
      x1: p1.x, y1: p1.y,
      x2: p2.x, y2: p2.y,
      depth,
      color: theme.dark ? '#ffe082' : '#fb8c00',
      baseWidth: 1.6,
      isDashed: false
    });
  }

  // Far Viewport Edges
  for (let i = 0; i < 4; i++) {
    const p1 = pFar[i];
    const p2 = pFar[(i + 1) % 4];
    const depth = (p1.z + p2.z) * 0.5;
    segments.push({
      type: 'farEdge',
      x1: p1.x, y1: p1.y,
      x2: p2.x, y2: p2.y,
      depth,
      color: theme.dark ? '#ff9800' : '#d84315',
      baseWidth: 2.2,
      isDashed: false
    });
  }

  // Sort segments by depth back-to-front
  segments.sort((a, b) => a.depth - b.depth);

  const farAvgZ = (pFar[0].z + pFar[1].z + pFar[2].z + pFar[3].z) * 0.25;
  let farPlaneRendered = false;

  // 4. Render Segments
  context.lineCap = 'round';
  for (const seg of segments) {
    if (!farPlaneRendered && seg.depth >= farAvgZ) {
      context.beginPath();
      context.moveTo(pFar[0].x, pFar[0].y);
      context.lineTo(pFar[1].x, pFar[1].y);
      context.lineTo(pFar[2].x, pFar[2].y);
      context.lineTo(pFar[3].x, pFar[3].y);
      context.closePath();
      context.fillStyle = theme.dark ? 'rgba(245, 124, 0, 0.12)' : 'rgba(245, 124, 0, 0.08)';
      context.fill();

      // Viewport crosshair grid
      const topMid = { x: (pFar[0].x + pFar[1].x) * 0.5, y: (pFar[0].y + pFar[1].y) * 0.5 };
      const botMid = { x: (pFar[3].x + pFar[2].x) * 0.5, y: (pFar[3].y + pFar[2].y) * 0.5 };
      const lMid = { x: (pFar[0].x + pFar[3].x) * 0.5, y: (pFar[0].y + pFar[3].y) * 0.5 };
      const rMid = { x: (pFar[1].x + pFar[2].x) * 0.5, y: (pFar[1].y + pFar[2].y) * 0.5 };

      context.beginPath();
      context.moveTo(topMid.x, topMid.y);
      context.lineTo(botMid.x, botMid.y);
      context.moveTo(lMid.x, lMid.y);
      context.lineTo(rMid.x, rMid.y);
      context.strokeStyle = theme.dark ? 'rgba(255, 235, 180, 0.22)' : 'rgba(230, 81, 0, 0.20)';
      context.lineWidth = 1;
      context.setLineDash([3, 3]);
      context.stroke();
      context.setLineDash([]);
      farPlaneRendered = true;
    }

    const near = Math.max(0, Math.min(1, (seg.depth + 1.5) / 3.0));
    context.globalAlpha = 0.22 + near * 0.78;
    context.strokeStyle = seg.color;
    context.lineWidth = seg.baseWidth * (0.65 + near * 0.75);

    if (seg.isDashed) {
      context.setLineDash([4, 4]);
    } else {
      context.setLineDash([]);
    }

    context.beginPath();
    context.moveTo(seg.x1, seg.y1);
    context.lineTo(seg.x2, seg.y2);
    context.stroke();
  }

  context.setLineDash([]);

  // 5. Render Glowing Vertex Nodes
  const nodes = [
    { p: pApex, r: 4.5, fill: theme.dark ? '#ffffff' : '#ffffff', stroke: '#f57c00' },
    ...pNear.map(p => ({ p, r: 2.5, fill: theme.dark ? '#fff3e0' : '#ffe082', stroke: '#ff9800' })),
    ...pFar.map(p => ({ p, r: 3.5, fill: theme.dark ? '#ffb74d' : '#f57c00', stroke: '#ffe082' }))
  ];

  nodes.sort((a, b) => a.p.z - b.p.z);

  for (const node of nodes) {
    const near = Math.max(0, Math.min(1, (node.p.z + 1.5) / 3.0));
    context.globalAlpha = 0.35 + near * 0.65;
    const nodeR = node.r * (0.75 + near * 0.45);

    context.beginPath();
    context.arc(node.p.x, node.p.y, nodeR, 0, Math.PI * 2);
    context.fillStyle = node.fill;
    context.fill();

    context.strokeStyle = node.stroke;
    context.lineWidth = 1.2;
    context.stroke();
  }

  context.restore();
}
