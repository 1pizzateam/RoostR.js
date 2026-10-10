// Per-context cache of GL bindings that RoostR sets repeatedly, so redundant calls are skipped
// and vertex attribute arrays enabled by one program never leak into the next draw.
export class GLState {

  program: WebGLProgram | null = null;
  arrayBuffer: WebGLBuffer | null = null;
  elementBuffer: WebGLBuffer | null = null;

  // Bit i set when vertex attribute array i is enabled; null when unknown.
  attributeMask: number | null = null;
  // Number of attribute slots (queried lazily from the context, at most 16).
  maxAttributes: number = 0;

  // Last frame token that uploaded the per-frame uniforms of a program.
  readonly frameOfProgram = new WeakMap<object, number>();
  // Last material (and version) uploaded to a program.
  readonly materialOfProgram = new WeakMap<object, object>();
  readonly materialVersionOfProgram = new WeakMap<object, number>();

  // Call when GL state may have been changed outside RoostR.
  public invalidate(): void {
    this.program = null;
    this.arrayBuffer = null;
    this.elementBuffer = null;
    this.attributeMask = null;
  }

}

const states = new WeakMap<object, GLState>();

export function getGLState(context: WebGLRenderingContext): GLState {
  let state = states.get(context);
  if (!state) {
    state = new GLState();
    states.set(context, state);
  }
  return state;
}
