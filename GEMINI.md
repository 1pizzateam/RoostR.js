# 1PizzaTeam Engineering Guidelines & Persistent Context

## 1. Strict Vector-Only API Architecture Everywhere
- **Vector-Only Signatures**: All spatial functions, methods, constructors, setters, options objects, and spatial interfaces MUST strictly accept vector types (`Vec3`, `Vec2`, `BoundingBox`, `BoundingSphere`, `Ray`, `Ray2`, `SpatialPlane`, `Frustum`, `Quat`, `Mat4`, `Mat4x3`, `Mat3`).
- **No Scalar or Array Fallbacks**: Never accept loose scalar coordinates (`x, y, z`, `width, height`) or raw number arrays (`[x, y, z]`). Multi-dimensional parameters (positions, rotations, scales, translations, directions, sizes, dimensions, viewports, near/far bounds, RGB colors) MUST strictly accept `Vec3` or `Vec2`.
- **Zero Runtime Type-Branching**: Do not implement polymorphic argument sniffing (`typeof === 'number'`, `instanceof`, `Array.isArray()`, or normalization helpers like `assignVec3`/`assignVec2`). Methods directly copy or reference the vector parameter.
- **Allocation-Free Getters**: All getter methods returning vectors (e.g., `getSize(target = new Vec2()): Vec2`, `getNearFar(target = new Vec2()): Vec2`) must accept an optional pre-allocated target vector to eliminate GC pressure in hot loops and render frames.

## 2. Zero Math Duplication — Leverage @1pizzateam/spock Everywhere
- **Single Source of Truth**: `@1pizzateam/spock` is the exclusive mathematical and spatial library across all 1PizzaTeam projects.
- **No Custom Math or Spatial Duplication**: Never write hand-rolled vector math, matrix calculations, quaternion conversions, ray-intersection tests, bounding volume checks, or frustum culling.
- **Direct Delegation**: All linear algebra, trigonometry, and spatial operations must delegate directly to Spock primitives:
  - Vector & Matrix: `Vec2`, `Vec3`, `Mat3`, `Mat4`, `Mat4x3`, `Quat`
  - Spatial: `Box` (`BoundingBox`), `Sphere` (`BoundingSphere`), `Ray3` (`Ray`), `Ray2`, `Plane` (`SpatialPlane`), `Frustum`
  - Math Utilities: `Trigo`, `Utils`, `Time`, `Accumulator`, `Rand`, `Bezier`, `Circ`, `Rect`, `Grid`, `NumArray`, `RollingAverage`
- **Re-Exporting Primitives**: Re-export Spock types directly from library entry points (e.g., `roostr.ts`) so consumers use unified instances without type discrepancies.

## 3. Code Style & Syntax Standards
- **Strict Braceless Style**: NEVER use curly braces `{ }` around single-statement `if`, `else`, `for`, `while` blocks. Place single-statement bodies on the next line or inline without braces.
- **Biome & TypeScript Guidelines**:
  - Prefer `import type` for type-only imports.
  - Avoid `any` unless required by polymorphic WebGL context methods.
  - Prefer template literals over string concatenation.
- **Verification & Testing**:
  - Every vector-only signature must have unit tests covering vector instances and target parameters.
  - Before concluding any work, always verify test suites in both the core library (`npm test`) and consumer projects (e.g. `DoomR.js`).
