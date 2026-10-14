import { Shader } from './shader';

interface ICachedProgram {
  program: WebGLProgram;
  key: string;
  refs: number;
}

const caches = new WeakMap<object, Map<string, ICachedProgram>>();
const owners = new WeakMap<object, ICachedProgram>();

export const Program = {

  create(context: WebGLRenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram | null {
    //find vert and frag shader before deleting lines and tabs.
    //var reg = shader.match(/"vertex":"([\s\S]*)",[\s\S]*"fragment":"([\s\S]*)"/mi);
    const program = context.createProgram();
    if (program) {
      const vshader = Shader.create(context, vertexShader, 'VERTEX_SHADER');
      const fshader = Shader.create(context, fragmentShader, 'FRAGMENT_SHADER');
      if (!vshader || !fshader) {
        if (vshader)
          context.deleteShader(vshader);
        if (fshader)
          context.deleteShader(fshader);
        context.deleteProgram(program);
        return null;
      }
      context.attachShader(program, vshader);
      context.attachShader(program, fshader);
      context.linkProgram(program);
    
      if(!context.getProgramParameter(program, context.LINK_STATUS)){
        console.error('Program link failed:', context.getProgramInfoLog(program));
        context.deleteShader(vshader);
        context.deleteShader(fshader);
        context.deleteProgram(program);
        return null;
      }

      // The linked program keeps its own copy of the compiled code.
      context.detachShader(program, vshader);
      context.detachShader(program, fshader);
      context.deleteShader(vshader);
      context.deleteShader(fshader);
    }

    return program;
  },

  // Returns a program shared by every caller using the same shader sources on this context.
  // Pair each call with Program.release.
  acquire(context: WebGLRenderingContext, vertexShader: string, fragmentShader: string): WebGLProgram | null {
    let cache = caches.get(context);
    if (!cache) {
      cache = new Map();
      caches.set(context, cache);
    }
    const key = vertexShader + '\u0000' + fragmentShader;
    let entry = cache.get(key);
    if (!entry) {
      const program = Program.create(context, vertexShader, fragmentShader);
      if (!program)
        return null;
      entry = { program, key, refs: 0 };
      cache.set(key, entry);
      owners.set(program, entry);
    }
    entry.refs++;
    return entry.program;
  },

  // Drops one reference; the program is deleted when no user remains.
  // Programs that did not come from acquire are deleted immediately.
  release(context: WebGLRenderingContext, program: WebGLProgram): void {
    const entry = owners.get(program);
    if (!entry) {
      context.deleteProgram(program);
      return;
    }
    if (--entry.refs > 0)
      return;
    // after Program.reset the cache may already hold a newer program under the same key
    const cache = caches.get(context);
    if (cache?.get(entry.key) === entry)
      cache.delete(entry.key);
    owners.delete(program);
    context.deleteProgram(program);
  },

  // The shader sources of a program that came from acquire, or null for any other program.
  sources(program: WebGLProgram): { vertex: string; fragment: string } | null {
    const entry = owners.get(program);
    if (!entry)
      return null;
    const [vertex, fragment] = entry.key.split('\u0000');
    return { vertex, fragment };
  },

  // Forgets every shared program of a context. Use it once the context is lost and restored, when all
  // of them are dead; the next acquire compiles them again.
  reset(context: WebGLRenderingContext): void {
    caches.delete(context);
  }
};
