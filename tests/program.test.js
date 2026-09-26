import { Program, Shader } from "../dist/roostr";
import { createMockContext } from "./helpers/webgl-mock";

test("Program.create creates, compiles, attaches and links shaders into a program", () => {
  const context = createMockContext();
  const program = Program.create(context, "void main() {}", "void main() {}");
  expect(program).not.toBeNull();
  expect(context.createProgram).toHaveBeenCalledTimes(1);
  expect(context.createShader).toHaveBeenCalledTimes(2);
  expect(context.attachShader).toHaveBeenCalledTimes(2);
  expect(context.linkProgram).toHaveBeenCalledTimes(1);
});

test("Program.create cleans up shaders and deletes program if linking fails", () => {
  const context = createMockContext();
  context.getProgramParameter.mockReturnValue(false); // Link failed
  const program = Program.create(context, "void main() {}", "void main() {}");
  expect(program).toBeNull();
  expect(context.deleteShader).toHaveBeenCalledTimes(2);
  expect(context.deleteProgram).toHaveBeenCalledTimes(1);
});

test("Program.create cleans up compiled shader and program if fragment shader fails compilation", () => {
  const context = createMockContext();
  // First call (vertex shader) succeeds, second call (fragment shader) fails
  let callCount = 0;
  context.getShaderParameter.mockImplementation(() => {
    callCount++;
    return callCount === 1; // vertex succeeds, fragment fails
  });

  const program = Program.create(context, "void main() {}", "invalid fragment");
  expect(program).toBeNull();
  // The vertex shader that succeeded must be deleted
  expect(context.deleteShader).toHaveBeenCalledTimes(2); // once in Shader.create for failed fshader, once in Program.create for vshader
  expect(context.deleteProgram).toHaveBeenCalledTimes(1);
});

test("Shader.create returns null and deletes shader if compilation fails", () => {
  const context = createMockContext();
  context.getShaderParameter.mockReturnValue(false);
  const shader = Shader.create(context, "bad shader", "VERTEX_SHADER");
  expect(shader).toBeNull();
  expect(context.deleteShader).toHaveBeenCalledTimes(1);
});
