import type { Mesh } from '../objects/mesh';
import type { Camera } from '../cameras/camera';
import { Frustum, Vec3 } from '@1pizzateam/spock';
import type { IFlatLights, IFrameInfo } from '../interfaces';
import type { Scene } from './scene';

export class SceneCollector {
  public opaqueList: Mesh[] = [];
  public blendedList: Mesh[] = [];
  public scratchFrustum: Frustum = new Frustum();
  private scratchVec: Vec3 = new Vec3();

  public collect(
    meshes: Mesh[],
    camera: Camera,
    frustum: Frustum | null,
    opaque: boolean,
    blended: boolean,
    stamp: number
  ): void {
    this.opaqueList.length = 0;
    this.blendedList.length = 0;
    const visit = (mesh: Mesh): void => {
      if (!mesh.isActive()) return;
      const wanted = mesh.blendMode ? blended : opaque;
      if (wanted && !(frustum && !frustum.intersectsSphere(mesh.computeBoundingSphere()))) {
        if (mesh.blendMode) {
          mesh.sortKey = mesh.getWorldPosition(this.scratchVec).getDistance(camera.position, true);
          this.blendedList.push(mesh);
        } else
          this.opaqueList.push(mesh);
      }
      for (const child of mesh.children)
        visit(child);
    };
    for (const mesh of meshes)
      if (mesh.traversalStamp !== stamp)
        visit(mesh);
  }

  public drawBlended(
    scene: Scene,
    camera: Camera,
    time: number,
    flatLights: IFlatLights,
    frame: IFrameInfo
  ): number {
    const list = this.blendedList;
    if (list.length === 0)
      return 0;
    if (list.length > 1)
      list.sort((a, b) => b.sortKey - a.sortKey);

    const projMatrix = camera.getProjectionMatrix();
    const viewMatrix = camera.getViewMatrix();
    const camPos = camera.position;

    for (const mesh of list) {
      const blend = mesh.blendOptions;
      scene.enableBlendMode(blend.equation, blend.source, blend.destination);
      scene.renderer.setDepthWrite(mesh.depthWrite);
      mesh.renderSelf(projMatrix, viewMatrix, flatLights, time, true, camPos, scene.fog, frame);
    }

    scene.disableBlendMode();
    scene.renderer.setDepthWrite(true);
    return list.length;
  }
}
