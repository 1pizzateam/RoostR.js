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
  frameOfProgram = new WeakMap<object, number>();
  // Last material (and version) uploaded to a program.
  materialOfProgram = new WeakMap<object, object>();
  materialVersionOfProgram = new WeakMap<object, number>();

  // Call when GL state may have been changed outside RoostR.
  public invalidate(): void {
    this.program = null;
    this.arrayBuffer = null;
    this.elementBuffer = null;
    this.attributeMask = null;
  }

  // Call when the context lost and came back: every program and buffer the cache knows is gone.
  // Resets in place, because meshes keep a reference to this object.
  public reset(): void {
    this.invalidate();
    this.maxAttributes = 0;
    this.frameOfProgram = new WeakMap();
    this.materialOfProgram = new WeakMap();
    this.materialVersionOfProgram = new WeakMap();
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
