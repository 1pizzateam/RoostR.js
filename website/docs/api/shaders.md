# Shaders & Programs

RoostR provides ready-to-use standard shaders and low-level utilities for compiling GLSL vertex and fragment shaders into cached, reference-counted GPU executable programs.

```javascript
import { PhongShader, BasicShader, NormalShader, SpriteShader, Program, Shader } from '@1pizzateam/roostr';

// 1. Using built-in shaders via Mesh helpers or addProgram:
mesh.usePhongMaterial({ diffuse: new Vec3(0.9, 0.5, 0.1) });
// or:
mesh.addProgram(PhongShader.vertex, PhongShader.fragment, material);
```

---

## Built-in Standard Shaders

### `PhongShader`

Full Blinn-Phong illumination model supporting up to `MAX_LIGHTS` (8) dynamic lights (directional, point, spot, and ambient) via packed `vec4` uniforms (`uLightPositionType`, `uLightDiffuseCutoff`, `uLightSpecularExponent`, `uLightDirection`, `uLightAttenuation`), diffuse texture mapping, specular highlights, and real-time atmospheric distance fog.

```javascript
const program = PhongShader.create(gl);
// or share across meshes:
mesh.addProgram(PhongShader.vertex, PhongShader.fragment, material);
```

#### Uniforms
- `uModelMatrix`: `Mat4x3` model transformation
- `uViewMatrix`: `Mat4x3` world-to-eye transform
- `uProjectionMatrix`: `Mat4` projection matrix
- `uNormalMatrix`: `Mat3` normal matrix
- `uCamPosition`: `Vec3` camera eye position
- `uMaterialAmbient`, `uMaterialDiffuse`, `uMaterialSpecular`, `uMaterialShininess`
- `uLightPositionType`, `uLightDiffuseCutoff`, `uLightSpecularExponent`, `uLightDirection`, `uLightAttenuation`, `uAmbientLight`
- `uHasFog`, `uFogColor`, `uFogNear`, `uFogFar`

---

### `BasicShader`

Unlit shader that renders flat or textured surfaces without lighting calculations. Ideal for skyboxes, UI overlays, and particles.

```javascript
const program = BasicShader.create(gl);
```

---

### `NormalShader`

Diagnostic shader that maps surface normals $[-1, 1]$ directly into RGB colors $[0, 1]$ to visualize mesh curvature and verify normal vector orientation.

```javascript
const program = NormalShader.create(gl);
```

---

### `SpriteShader`

Built-in billboard vertex and alpha-tested/fog-enabled fragment shader used by [`Sprite`](/api/sprite).

---

## Low-Level GLSL Pipeline

### `Shader`

Compiles a single vertex (`'VERTEX_SHADER'`) or fragment (`'FRAGMENT_SHADER'`) GLSL shader stage.

```typescript
Shader.create(
  context: WebGLRenderingContext,
  source: string,
  type: 'VERTEX_SHADER' | 'FRAGMENT_SHADER'
): WebGLShader | null
```

Logs descriptive GLSL compiler diagnostics and deletes the shader handle upon syntax failure.

---

### `Program`

Compiles, links, and caches shared `WebGLProgram` instances per `WebGLRenderingContext`.

```typescript
Program.create(context: WebGLRenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram | null
Program.acquire(context: WebGLRenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram | null
Program.release(context: WebGLRenderingContext, program: WebGLProgram): void
Program.sources(program: WebGLProgram): { vertex: string; fragment: string } | null
Program.reset(context: WebGLRenderingContext): void
```

- `Program.create`: Compiles and links a new standalone `WebGLProgram`, detaching and deleting the intermediate shader stages once linked.
- `Program.acquire`: Returns a reference-counted `WebGLProgram` shared by all callers using the same vertex and fragment shader sources on the given context.
- `Program.release`: Decrements the reference count for an acquired program and deletes the GPU program when no references remain.
- `Program.sources`: Returns `{ vertex, fragment }` for an acquired program (used by `Mesh.restore()`), or `null` otherwise.
- `Program.reset`: Clears the per-context shared program cache after WebGL context loss/restoration.

---

### `Uniform`

Wraps a custom uniform type and value (`Vec2`, `Vec3`, `Quat`, `Mat3`, `Mat4`, `Mat4x3`, `Float32Array`, `Int32Array`, `number`, or `number[]`) for upload to a GLSL uniform location.
