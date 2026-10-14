Version 0.8.0 (October 14th 2026)
-----------------------------
 * New `Node` scene-graph base class extracted from `Mesh`:
   - Encapsulates hierarchical transforms (position, rotation Euler / Quaternion synchronization, scale), parent-child relationships, world matrix computation, dirty flagging, local/world bounds, and distance/inside-bounds checks.
   - `Mesh` now extends `Node`, inheriting all transform and hierarchy capabilities while focusing on rendering, geometry, programs, materials, and textures.
   - Exported as `Node` in root package exports.
 * New `Sprite` mesh: a flat image that turns to face the camera, for enemies, pickups, trees and particles. `new Sprite(gl, { size, texture, frames, anchor, billboard, alphaCutoff, depthBias, material, fragment })`.
   - `billboard` is `'spherical'` (default, faces the camera), `'cylindrical'` (stays upright, turns about the vertical axis) or `'none'`; `anchor` is `'center'` or `'bottom'` (feet on the mesh position).
   - The image can be a sprite sheet: `frames` is the number of equal cells side by side and `setFrame(n)` picks one. The material's diffuse colour tints the image, pixels under `alphaCutoff` are discarded, and scene fog is applied.
   - Position, scale and parent work as on any mesh; frustum culling uses bounds that cover every way a billboard can turn. The texture is owned by the mesh, so `Scene.restore()` rebuilds it. A custom `fragment` shader can replace the built-in one and receives `vTextureCoord` and `vDepth`.
   - `depthBias` draws a sprite as if it were nearer the camera, in depth only, so a big one (an explosion) is not cut off flat by the walls and floor round it.
   - New exports: `Sprite`, `SpriteShader`, `ISpriteOptions`, `SpriteBillboard`, `SpriteAnchor`.
 * New `Mesh.setLocalBounds(min, max)` sets the bounds used by frustum culling and picking for geometry that is filled after construction. The constructor measures the vertex arrays it receives, so a buffer that starts empty had zero-size bounds and was culled wrongly.
 * Context loss and restore: after `webglcontextrestored` the browser hands back the same context object, but every GPU object is dead and RoostR's per-context caches still pointed at them (`useProgram: object does not belong to this context`).
   - `Renderer` now forgets the shared programs and the cached GL state before calling `onContextRestored`.
   - New `Scene.restore()`, `Mesh.restore()` and `RenderTarget.restore()` rebuild buffers, programs, custom-uniform locations and owned textures from the data kept on the CPU. Call them from `onContextRestored`. Data uploaded by hand (`bufferSubData`), textures passed as a `WebGLTexture` (including a render target's) and programs passed as a `WebGLProgram` are not rebuilt: upload or assign them again. A mesh whose program cannot be rebuilt stops drawing instead of misdrawing.
   - New `Program.reset(context)` and `Program.sources(program)`. `Program.release` no longer evicts a newer program that shares the cache key of a pre-reset one.
 * Strict Vector-Only Architecture across all spatial APIs leveraging `@1pizzateam/spock`:
   - Enforced strict vector types (`Vec3`, `Vec2`, `BoundingBox`, `BoundingSphere`, `Ray`, `Ray2`, `SpatialPlane`, `Frustum`, `Quat`, `Mat4`, `Mat4x3`, `Mat3`) across all constructors, setters, methods, and options.
   - Eliminated scalar coordinate overloads `(x, y, z)` / `(width, height)` and raw array fallbacks `[x, y, z]` for spatial parameters.
   - Zero runtime type-branching / polymorphism in hot paths.
   - Allocation-free getters supporting optional pre-allocated target vector instances.
   - Primitive geometries updated: `Cube(size: Vec3)`, `Cylinder(radii: Vec2)`, `Plane(size: Vec2, segments?: Vec2)`, `Quad(size?: Vec2 | Rect)`, `MultiQuad(size?: Vec2 | Rect)`.
   - Cameras & Renderer updated: `PerspectiveCamera(fov, nearFar: Vec2)`, `OrthographicCamera(bounds: Rect, nearFar: Vec2)`, `RenderTarget(size: Vec2)`, `Renderer.setSize(Vec2)`, `Renderer.setViewport(Vec2)`.
   - Complete documentation and interactive website demos updated to the new strict vector architecture.

Version 0.7.0 (October 10th 2026)
-----------------------------
 * Uses `@1pizzateam/spock` ^4.3.0 and its new 3D helpers instead of hand-rolled matrix math:
   - `Mat4x3.compose`, `getTranslation`, `getColumn`, `getScale`, `transformPoint`, `toNormalMatrix`, `Mat4.multiplyAffine`/`transformPoint`, `Quat.lookAt`/`getEuler`, `Vec3.setFromSpherical`/`getSpherical`/`maxComponent`, and typed-array `setArray`/`toArray(target, offset)`.
   - Bounds (`BoundingBox`/`BoundingSphere.applyMatrix4`), `Ray`, `CustomMesh.computeVertexNormals`, `OrbitControls` and `Camera.getRay` are now written with Vec3/Quat/Mat operations.
   - Added `Uniform` support for Spock values: custom uniforms accept `Vec2`, `Vec3`, `Quat`, `Mat3`, `Mat4` and `Mat4x3` directly.
   - Setters, constructors of lights/materials and `Mesh` transforms accept `Vec3`, number arrays or scalars (`Vec3Like`); array arguments were previously turned into `NaN` in light and material constructors.
 * Spatial types now live in Spock (`Box`, `Sphere`, `Ray3`, `Plane`, `Frustum`). RoostR re-exports them under the existing names `BoundingBox`, `BoundingSphere`, `Ray`, `SpatialPlane` and `Frustum`, so imports do not change.
 * Picking: `Mesh.raycast(ray, precise)` and `Scene.raycast(ray, precise)` optionally test triangles (`TRIANGLES` / `TRIANGLE_STRIP`) in local space with `Mat4x3.invertAffine` / `transformPoint` / `transformDirection` and `Ray3.intersectTriangle`; the default is still the bounding sphere.
 * Lighting and blending:
   - `PhongShader` uses packed vec4 light uniforms (`uLightPositionType`, `uLightDiffuseCutoff`, `uLightSpecularExponent`), about 40% fewer uniform vectors, so it fits mobile GPUs limited to 64 fragment uniform vectors. The classic `uLightPosition`/`uLightType`/... uniforms are still uploaded to custom shaders that declare them.
   - Added per-mesh blending: `Mesh.setBlend(source, destination, equation)` (default stays additive `SRC_ALPHA`, `ONE`) and `Mesh.setDepthWrite(enabled)`. The scene only changes blend/depth state between meshes that differ.
 * Scene graph and rendering model:
   - The `quaternion` is the single rotation source; `Mesh.rotation` is derived (`Quat.getEuler`) and `lookAt` orients the quaternion.
   - Programs (and their uniform locations) are shared between meshes that use the same shader sources (`Program.acquire` / `Program.release`).
   - `Scene` throws if it has neither `context` nor a resolvable `canvasId`.
   - `Scene.render` draws through `Mesh.renderSelf` (one call per scene-graph node); `Mesh.render` still draws a mesh plus its children.
 * Fixes:
   - Scene ambient color (`Scene.ambientColor`) was ignored by shaders; it is now part of `Lights.flatten(extraAmbient)`.
   - Vertex attribute arrays enabled by one mesh no longer leak into the next draw (per-draw attribute mask).
   - Blend mode and frustum culling are evaluated per scene-graph node; children of blended or culled parents render correctly and meshes that are both child and scene member are drawn once.
   - `uScreenResolution` is updated every frame from `Scene.resolution` (`setSize` / `setViewport`).
   - Indices above 65535 use `UNSIGNED_INT` with `OES_element_index_uint` (warning otherwise) instead of being truncated.
   - Bounding sphere ignored `itemSize`; `setFromPoints` and `BoundingBox.setFromPoints` honor strides of 2.
   - `Scene.setFog` numeric overload used the wrong arguments; `Scene.raycast` now includes child meshes.
   - Shaders are detached and deleted after linking; compile and link errors use `console.error`.
   - Textures: `Texture.update` honors `flipY`, mipmaps are skipped for non power-of-two textures on WebGL1, user-supplied textures are no longer deleted by `Mesh.destroy`, and `setTexture` keeps the old texture if creation fails.
   - Meshes without explicit submeshes get one covering the whole geometry so material shortcuts work.
   - Phong shader uses `highp` where available. More than `MAX_LIGHTS` (8) lights logs a warning.
   - `OrbitControls`: ignores secondary pointers, sets `touch-action: none`, takes the shortest azimuth path, supports `update(deltaTime)` for frame-rate independent damping, and skips the view-matrix rebuild when idle.
   - `Renderer` accepts `IRendererOptions` (size, context attributes, context lost/restored callbacks).
 * Performance:
   - Programs are cached per context by shader source and reference counted.
   - Camera, lights, fog and time uniforms are uploaded once per program per frame; material uniforms only when the material changed; `useProgram` and buffer binds are skipped when already bound.
   - World matrices, bounds and normal matrices are only recomputed for changed branches of the scene graph.
   - `Camera` caches projection-view and its inverse (used for culling and ray casting).
   - `Lights.flatten` reuses typed arrays; the transparent sort uses precomputed squared distances without allocations.
 * Rebranded and modernized as `@1pizzateam/roostr`:
   - Published as native ES module (`dist/roostr.js`) with TypeScript declarations (`dist/roostr.d.ts`).
   - Replaced legacy Grunt, Babel, and Uglify build pipeline with npm scripts, Rollup, and Jest.
   - Updated engine requirement to Node.js >= 22.
 * Migrated from `@lcluber/type6js` to `@1pizzateam/spock` v4.3.0:
   - Updated all math representations across cameras, meshes, lights, materials, and geometries to use Spock `Vec3`, `Vec2`, `Mat4`, `Mat4x3`, `Mat3`, and `Quat`.
   - Re-exported full Spock math and utility suite (`Vec3`, `Vec2`, `Mat4x3`, `Mat4`, `Mat3`, `Quat`, `Trigo`, `Utils`, `Time`, `Accumulator`, `Rand`, `Bezier`, `Circ`, `Rect`, `Grid`, `NumArray`, `RollingAverage`) directly from `@1pizzateam/roostr`.
   - Simplified `Camera.setViewMatrix()` using Spock `lookAtRH()`.
   - Added vector-based camera helpers: `getViewDirection()`, `getDistance()`, and `dolly()`.
   - Added vector-first overloads across public APIs: `Camera.getRay(ndc: Vec2)`, `Scene.setSize(size: Vec2)`, `Renderer.setSize(size: Vec2)`, `RenderTarget(size: Vec2)`, `RenderTarget.setSize(size: Vec2)`, and vector dimension constructors (`Quad` and `MultiQuad` with `Vec2` / `Rect`, `Plane` with `Vec2`, and `Cube` with `Vec3`).
 * Cameras & Interactive Controls:
   - Added `OrbitControls` providing smooth 3D orbital camera rotation (azimuthal and polar angles), panning, zooming/dollying, damping/inertia, touch gesture support, and configurable distance and angle constraints.
   - Added `setFov()` and `setNearFar()` helpers to `PerspectiveCamera`.
   - Added `setBounds()` helper to `OrthographicCamera`.
   - Added guard against null/empty context viewport in `PerspectiveCamera`.
   - Fixed camera view matrix degeneracy when camera position equals target.
 * Spatial Math, Frustum Culling & Raycasting:
   - Added 3D spatial query structures:
     - `BoundingBox` (Spock `Box`): Axis-aligned bounding box with containment, matrix transformation, union, and intersection tests.
     - `BoundingSphere`: Bounding sphere with containment, matrix transformation, and intersection tests.
     - `Ray`: 3D ray with point-at-distance, ray-sphere, ray-box, and Möller-Trumbore ray-triangle intersection testing.
     - `Frustum` & `SpatialPlane`: 6-plane viewing frustum extraction from projection-view matrix with sphere and box intersection testing for frustum culling.
   - Added screen-space ray unprojection via `Camera.getRay(ndc: Vec2)`.
   - Added `Scene.raycast(ray: Ray)` to cast rays into the scene and retrieve sorted mesh intersection hits.
 * Shaders & Offscreen Rendering:
   - Added built-in GLSL shaders: `PhongShader` (Blinn-Phong specular/diffuse/ambient), `BasicShader` (unlit diffuse/color), and `NormalShader` (world/surface normal visualization).
   - Added fluent material helper methods to `Mesh`: `usePhongMaterial()`, `useBasicMaterial()`, and `useNormalMaterial()`.
   - Added `RenderTarget` for offscreen rendering to framebuffer textures and post-processing passes.
 * Lighting Pipeline:
   - Added `AmbientLight` for omnidirectional ambient illumination.
   - Enhanced dynamic multi-light management supporting Directional, Point (with attenuation), Spot (with cutoff and exponent), and Ambient lights.
 * Procedural Geometries:
   - Added procedural `Cylinder` (and cone) geometry with configurable radius, height, radial/height segment subdivisions, and open-ended options.
   - Added procedural `Plane` geometry (XY and XZ orientations) with grid subdivisions.
   - Added flat-shaded option to `Cube` with 24 distinct vertices and face normals.
   - Added automatic vertex normal calculation (`computeVertexNormals()`) in `CustomMesh` for indexed and non-indexed meshes.
 * Mesh & Scene Graph Enhancements:
   - Added fluent / chainable transform API to `Mesh` (`setPosition`, `setRotation`, `setScale`, `rotateX`, `rotateY`, `rotateZ`, `translate`, `scaleBy`, `lookAt`).
   - Added spatial utility methods to `Mesh`: `slerp()`, `getWorldDirection()`, `distanceTo()`, and `isInsideBounds()`.
   - Fixed child mesh rendering in Scene Graph group nodes.
   - Fixed `Mesh.addMaterial()` crash when adding material after program creation.
   - Added `removeMesh()`, `removeLight()`, and `removeChild()` methods to `Scene` and `Mesh`.
   - Added `getCanvas()`, `setSize()`, and `destroy()` methods to `Scene` and `Renderer` for lifecycle and canvas management.
   - Fixed mutual starvation in `Mesh` bounding volume caching by synchronizing box and sphere in `computeBounds()`.
   - Added `NaN` division guard to `Ray.intersectBox()` for axis-parallel rays intersecting boundaries.
   - Extended `BoundingBox.applyMatrix4()` and `BoundingSphere.applyMatrix4()` to accept both `Mat4x3` and `Mat4`.
   - Re-exported core TypeScript interfaces (`IMesh`, `IGeometry`, `IFlatLights`, `IProgram`, `ICustomUniforms`, `IMaterialUniforms`) from the library root.
   - Defaulted `Scene.render()` timestamp parameter to `Time.now()`.
 * WebGL State & Resource Management:
   - Passed `transpose: false` for WebGL uniform matrix calls.
   - Supported `Float32Array` and `Int32Array` in `Uniform` and custom uniforms.
   - Enabled UV attribute binding independent of texture presence.
   - Enhanced `Texture` class supporting HTMLImageElement, HTMLCanvasElement, ImageData, mipmaps, NPOT textures, wrap, filter, and flipY options.
   - Prevented GPU memory leaks by deleting shaders on compilation/link failure, deleting WebGL programs on `clearPrograms()`, deleting textures on reassignment, and adding recursive `Mesh.destroy()`.
 * Documentation & Tests:
   - Added comprehensive VitePress documentation site with interactive 3D WebGL demo components (`SceneDemo`, `LightingDemo`, `GeometryDemo`), installation guide, overview, and complete API references.
   - Expanded unit test suite to 331 passing tests with high branch and statement coverage.

Version 0.6.0 (July 22th 2026)
-----------------------------
 * Updated build configuration and dependencies (Rollup, Jest, TypeScript, UglifyJS).
 * Refactored project structure (replaced Grunt build pipeline with npm scripts and Rollup).
 * Added a complete test suite.

Version 0.5.12 (June 13th 2021)
-----------------------------
 * Fix duplicate identifier in definitions file

Version 0.5.11 (May 24th 2021)
-----------------------------
 * Delete Dom dependency

Version 0.5.10 (May 23th 2021)
-----------------------------
 * Delete logger dependency

Version 0.5.9 (June 06th 2020)
-----------------------------
 * Fix range out of bounds of buffer for quads meshes

Version 0.5.8 (May 14th 2020)
-----------------------------
 * Update Type6.js dependency to version 2

Version 0.5.7 (January 04th 2019)
-----------------------------
 * Updated typings for Angular

Version 0.5.6 (December 22th 2019)
-----------------------------
 * Updated dependencies.

Version 0.5.5 (April 04th 2019)
-----------------------------
 * Improved typings.

Version 0.5.4 (December 16th 2018)
-----------------------------
 * Added clearMeshes() method to Scene class.
 * Added clearPrograms() method to Mesh class.
 * setPosition(), setTarget() and setUp() methods in Camera class now uses Vector3 as parameter.
 * setPosition(), setDiffuse() and setSpecular() methods in directionalLight class now uses Vector3 as parameter.

Version 0.5.3 (October 16th 2018)
-----------------------------
 * RoostR.js published on NPM at @lcluber/roostrjs.
 * Updated README.md with NPM installation procedure.

Version 0.5.2 (July 22th 2018)
------------------------------
 * Library exported as ES6 and IIFE modules instead of UMD.
 * ROOSTR namespace becomes Roostr

Version 0.5.1 (July 2nd 2018)
-----------------------------
* Documentation automatically generated in /doc folder
* Typedoc and grunt-typedoc added in devDependencies
* New "typedoc" task in Gruntfile.js
* Typescript upgraded to version 2.9.2

Version 0.5.0 (June 9th 2018)
------------------------------
 * Now written in Typescript. And can be used as a module.

Version 0.4.0 (September 16th 2017)
------------------------------
 * Added material class

Version 0.3.0 (September 10th 2017)
------------------------------
 * Added activateBlendMode() and deactivateBlendMode() to the Mesh class
 * Blend modes are now at material level instead of scene level
 * Added customMesh geometry to create custom shapes easily
 * Added lights classes for a better lights management system

Version 0.2.7 (August 27th 2017)
------------------------------
 * Added multi materials capability to the mesh class

Version 0.2.6 (August 26th 2017)
------------------------------
 * Added a scene graph and the ability to add children to a mesh with mesh.addChild(mesh) method.
 * Added Gun0 geometry.

Version 0.2.5 (August 15th 2017)
------------------------------
 * Ability to send custom uniforms to the shaders using addUniform() and setUniform() methods in the mesh class.

Version 0.2.4 (August 10th 2017)
------------------------------
 * Added Hemisphere geometry.

Version 0.2.3 (July 30th 2017)
------------------------------
 * Added Line geometry to draw lines.

Version 0.2.2 (July 23th 2017)
------------------------------
 * Added Quad geometry to draw quads.
 * Fixed a bug with texture coordinates.
 * Added enableDepthTest(), disableDepthTest(), enableBlendMode() and disableBlendMode() methods in rendererTarget class to facilitate blending modifications along the rendering loop.

Version 0.2.1 (July 14th 2017)
------------------------------
 * New PerspectiveCamera and OrthographicCamera classes to chose different types of projections.
 * New setDepthTest(), setBlendFunction() and setBlendEquation() methods in rendererTarget class to allow different types of blendings.

Version 0.2.0 (July 5th 2017)
------------------------------
 * Updated for open source release on GitHub
 * Code reworked
 * Dedicated website
 * Examples

Version 0.1.0 (July 1st 2014)
-----------------------------
 * initial version
