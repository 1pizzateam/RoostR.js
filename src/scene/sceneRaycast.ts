import type { Mesh } from '../objects/mesh';
import type { Ray3 as Ray, Vec3 } from '@1pizzateam/spock';

export function raycastScene(
  meshes: Mesh[],
  traversalStamp: number,
  ray: Ray,
  precise: boolean = false
): { mesh: Mesh; distance: number; point: Vec3 }[] {
  const hits: { mesh: Mesh; distance: number; point: Vec3 }[] = [];
  const visit = (mesh: Mesh): void => {
    if (!mesh.isActive()) return;
    const hit = mesh.raycast(ray, precise);
    if (hit)
      hits.push({ mesh, distance: hit.distance, point: hit.point });
    for (const child of mesh.children)
      visit(child);
  };
  for (const mesh of meshes)
    if (mesh.traversalStamp !== traversalStamp)
      visit(mesh);
  hits.sort((a, b) => a.distance - b.distance);
  return hits;
}
