# Shaders & Programs

RoostR provides ready-to-use standard shaders and low-level wrappers for compiling GLSL vertex and fragment shaders into linked GPU executable programs.

```javascript
import { PhongShader, BasicShader, NormalShader, Program, Shader } from '@1pizzateam/roostr';

// 1. Using built-in shaders:
const phongProgram = PhongShader.create(gl);
mesh.addProgram(phongProgram);
```

---

## Built-in Standard Shaders

### `PhongShader`

Full Blinn-Phong illumination model supporting up to 4 directional lights, 8 point lights, 4 spotlights, ambient lighting, diffuse texture mapping, specular highlights, and real-time atmospheric distance fog.

```javascript
const program = PhongShader.create(gl);
```

#### Uniforms
- `uModelMatrix`: `Mat4x3` model transformation
- `uViewMatrix`: `Mat4x3` world-to-eye transform
- `uProjectionMatrix`: `Mat4` projection matrix
- `uNormalMatrix`: `Mat3` normal matrix
- `uCamPosition`: `Vec3` camera eye position
- `uMaterialAmbient`, `uMaterialDiffuse`, `uMaterialSpecular`, `uMaterialShininess`
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

## Low-Level GLSL Pipeline

### `Shader`

Compiles a single vertex (`gl.VERTEX_SHADER`) or fragment (`gl.FRAGMENT_SHADER`) GLSL shader stage.

```typescript
new Shader(context: WebGLRenderingContext, type: number, source: string)
```

Throws descriptive errors with GLSL compiler info log upon syntax failure.

---

### `Program`

Links compiled vertex and fragment `Shader` stages into a GPU executable program.

```typescript
new Program(
  context: WebGLRenderingContext,
  vertexShader: Shader,
  fragmentShader: Shader
)
```

Provides helper methods:
- `use()`: Calls `gl.useProgram`.
- `getUniformLocation(name)`: Retrieves uniform handle.
- `getAttribLocation(name)`: Retrieves attribute handle.

---

### `Uniform`

Binds JavaScript / typed array values to a GLSL uniform handle according to its type (`1f`, `1i`, `2fv`, `3fv`, `4fv`, `Matrix3fv`, `Matrix4fv`).
