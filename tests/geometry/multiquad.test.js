import { MultiQuad, Rect } from "../../dist/roostr";

test("starts with empty vertices, indices and uvs arrays", () => {
  const multiQuad = new MultiQuad(2, 2);
  expect(multiQuad.vertices).toEqual([]);
  expect(multiQuad.indices).toEqual([]);
  expect(multiQuad.uvs).toEqual([]);
});

test("sets a single submesh spanning 4 vertices by default", () => {
  const multiQuad = new MultiQuad(2, 2);
  expect(multiQuad.subMeshes.length).toBe(1);
  expect(multiQuad.subMeshes[0].start).toBe(0);
  expect(multiQuad.subMeshes[0].count).toBe(4);
});

test("createQuads appends one quad's worth of vertices, indices and uvs per iteration", () => {
  const multiQuad = new MultiQuad(2, 2);
  multiQuad.createQuads(3);
  expect(multiQuad.vertices.length).toBe(3 * 4 * 3); // 3 quads * 4 vertices * 3 components
  expect(multiQuad.uvs.length).toBe(3 * 4 * 2); // 3 quads * 4 vertices * 2 components
  expect(multiQuad.indices.length).toBe(3 * 6); // 3 quads * 6 indices
});

test("createQuads offsets indices by 4 per quad", () => {
  const multiQuad = new MultiQuad(2, 2);
  multiQuad.createQuads(2);
  expect(multiQuad.indices.slice(0, 6)).toEqual([0, 1, 2, 0, 3, 1]);
  expect(multiQuad.indices.slice(6, 12)).toEqual([4, 5, 6, 4, 7, 5]);
});

test("createQuads with length 0 leaves arrays empty", () => {
  const multiQuad = new MultiQuad(2, 2);
  multiQuad.createQuads(0);
  expect(multiQuad.vertices).toEqual([]);
  expect(multiQuad.indices).toEqual([]);
  expect(multiQuad.uvs).toEqual([]);
});

test("createQuads updates subMeshes[0].count to match total indices created", () => {
  const multiQuad = new MultiQuad(2, 2);
  multiQuad.createQuads(4);
  expect(multiQuad.subMeshes[0].count).toBe(4 * 6);
});

test("supports initialization with Spock Rect", () => {
  const rect = new Rect(4, 2);
  const multiQuad = new MultiQuad(rect);
  multiQuad.createQuads(1);
  expect(multiQuad.vertices.slice(0, 3)).toEqual([2, -1, 0]);
});
