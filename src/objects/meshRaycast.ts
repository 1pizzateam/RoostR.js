import { Mat4x3, Vec3, Ray3 as Ray } from '@1pizzateam/spock';
import type { SubMesh } from '../geometry/submesh';

export interface IRaycastMeshTarget {
  worldMatrix: Mat4x3;
  primitive: string | null;
  subMeshes: SubMesh[];
  vertices: number[] | Float32Array | null;
  indices: number[] | Int32Array | Uint16Array | null;
  itemSize: number | null;
}

const scratchInverse = new Mat4x3();
const scratchRay = new Ray();
const scratchVec = new Vec3();
const scratchDir = new Vec3();
const scratchA = new Vec3();
const scratchB = new Vec3();
const scratchC = new Vec3();
const scratchHit = new Vec3();
const scratchWorldHit = new Vec3();

function getVertex(targetMesh: IRaycastMeshTarget, index: number, target: Vec3): Vec3 {
  const vertices = targetMesh.vertices as ArrayLike<number>;
  const size = targetMesh.itemSize || 3;
  const offset = (targetMesh.indices ? targetMesh.indices[index] : index) * size;
  return target.setScalar(vertices[offset], vertices[offset + 1], size > 2 ? vertices[offset + 2] : 0);
}

export function raycastTriangles(
  mesh: IRaycastMeshTarget,
  ray: Ray
): { distance: number; point: Vec3 } | null {
  const inverse = scratchInverse.copy(mesh.worldMatrix).invertAffine();
  const localRay = scratchRay.set(
    inverse.transformPoint(ray.origin, scratchVec),
    inverse.transformDirection(ray.direction, scratchDir)
  );
  const strip = mesh.primitive === 'TRIANGLE_STRIP';
  let best: Vec3 | null = null;
  let bestDistance = Infinity;

  for (const subMesh of mesh.subMeshes) {
    const end = subMesh.start + subMesh.count;
    for (let i = subMesh.start; i + 2 < end; i += strip ? 1 : 3) {
      getVertex(mesh, i, scratchA);
      // Odd strip triangles flip their winding.
      if (strip && (i - subMesh.start) % 2 === 1) {
        getVertex(mesh, i + 2, scratchB);
        getVertex(mesh, i + 1, scratchC);
      } else {
        getVertex(mesh, i + 1, scratchB);
        getVertex(mesh, i + 2, scratchC);
      }
      const local = localRay.intersectTriangle(scratchA, scratchB, scratchC, false, scratchHit);
      if (!local) continue;
      const world = mesh.worldMatrix.transformPoint(local, scratchWorldHit);
      const distance = ray.origin.getDistance(world);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = (best ?? new Vec3()).copy(world);
      }
    }
  }
  return best ? { distance: bestDistance, point: best } : null;
}
