# Geometry Primitives

RoostR provides built-in procedural geometry generators that output ready-to-render vertex coordinates, triangle indices, normal vectors, and UV mapping coordinates.

<GeometryDemo />

```javascript
import { Cube, Sphere, Cylinder, Plane, Mesh } from '@1pizzateam/roostr';

const cubeMesh     = new Mesh(gl, new Cube(2.0));
const sphereMesh   = new Mesh(gl, new Sphere(1.5, 32, 24));
const cylinderMesh = new Mesh(gl, new Cylinder(1.0, 1.0, 3.0, 24));
const floorMesh    = new Mesh(gl, new Plane(10.0, 10.0, 4, 4));
```

---

## Available Primitives

### `Cube`

Generates an axis-aligned 6-sided cuboid with sharp face normals and per-face UV maps.

```typescript
new Cube(size: number = 1.0)
```

---

### `Sphere`

Generates a UV sphere with latitude/longitude tessellation and smooth vertex normals.

```typescript
new Sphere(radius: number = 1.0, segmentsW: number = 16, segmentsH: number = 16)
```

---

### `Hemisphere`

Generates a half-sphere dome with a closed flat circular base.

```typescript
new Hemisphere(radius: number = 1.0, segmentsW: number = 16, segmentsH: number = 16)
```

---

### `Cylinder`

Generates a cylinder or truncated cone with top and bottom cap lids.

```typescript
new Cylinder(
  radiusTop: number = 1.0,
  radiusBottom: number = 1.0,
  height: number = 2.0,
  radialSegments: number = 16
)
```

---

### `Plane`

Generates a flat horizontal 2D grid subdivided into tiles.

```typescript
new Plane(
  width: number = 1.0,
  height: number = 1.0,
  segmentsW: number = 1,
  segmentsH: number = 1
)
```

---

### `Quad`

Generates a simple 2-triangle rectangular quad with vertex positions and UVs.

```typescript
new Quad(width: number = 1.0, height: number = 1.0)
```

---

### `FullscreenQuad`

Generates a normalized device coordinate (NDC) screen-covering quad with positions $[-1, 1]$ and UVs $[0, 1]$ designed for post-processing shaders.

```typescript
new FullscreenQuad()
```

---

### `Line`

Generates a 3D line segment between two coordinates.

```typescript
new Line(start: Vec3, end: Vec3)
```
