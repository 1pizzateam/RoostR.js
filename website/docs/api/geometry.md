# Geometry Primitives

RoostR provides built-in procedural geometry generators that output ready-to-render vertex coordinates, triangle indices, normal vectors, and UV mapping coordinates.

<GeometryDemo />

```javascript
import { Cube, Sphere, Cylinder, Plane, Quad, MultiQuad, Mesh, Vec3, Vec2 } from '@1pizzateam/roostr';

const cubeMesh     = new Mesh(new Cube(new Vec3(2, 3, 2)), gl);
const sphereMesh   = new Mesh(new Sphere(1.5, 32, 24), gl);
const cylinderMesh = new Mesh(new Cylinder(1.0, 1.0, 3.0, 24), gl);
const floorMesh    = new Mesh(new Plane(new Vec2(10, 10), 4, 4, 'xz'), gl);
```

---

## Available Primitives

### `Cube`

Generates an axis-aligned 6-sided box with face normals and per-face UV maps. Supports scalar uniform size or non-uniform `Vec3` dimensions.

```typescript
new Cube(sizeOrDimensions: Vec3 | number = 1.0, flat: boolean = false)
```

- Uniform cube: `new Cube(2.0)`
- Non-uniform box: `new Cube(new Vec3(2.0, 4.0, 1.0))`
- Unshared vertices with flat face normals: `new Cube(1.0, true)`

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

Generates a flat 2D grid subdivided into tiles along the `'xz'` (horizontal ground) or `'xy'` (vertical billboard) plane.

```typescript
new Plane(
  sizeOrWidth: Vec2 | number = 1.0,
  height?: number,
  segmentsW: number = 1,
  segmentsH: number = 1,
  orientation: 'xy' | 'xz' = 'xz'
)
```

```javascript
// Vector-first dimensions
const ground = new Plane(new Vec2(20, 20), 8, 8, 'xz');
```

---

### `Quad`

Generates a single 2-triangle rectangular quad with vertex positions and UVs.

```typescript
new Quad(sizeOrWidth?: Vec2 | Rect | number, height?: number)
```

```javascript
const quad = new Quad(new Vec2(4, 3));
```

---

### `MultiQuad`

Procedurally constructs multiple quad surfaces into a single batched mesh buffer.

```typescript
new MultiQuad(sizeOrWidth?: Vec2 | Rect | number, height?: number)
```

```javascript
const batch = new MultiQuad(new Vec2(1, 1));
batch.createQuads(100); // Batches 100 quads
```

---

### `FullscreenQuad`

Generates a normalized device coordinate (NDC) screen-covering quad with positions $[-1, 1]$ and UVs $[0, 1]$ designed for post-processing shaders.

```typescript
new FullscreenQuad()
```

---

### `Line`

Renders connected 3D line segments from a series of vertex coordinates using `gl.LINE_STRIP`.

```typescript
new Line(vertices: Vec3[] | number[], thickness: number = 1.0)
```
