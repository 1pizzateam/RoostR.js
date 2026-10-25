import { Mat4x3, Mat3, Vec3, Quat, Box as BoundingBox, Sphere as BoundingSphere } from '@1pizzateam/spock';
import type { SceneGraph } from '../scene/sceneGraph';

export class Node<T extends Node<T> = any> {

  public position: Vec3;
  public scale: Vec3;
  public quaternion: Quat;
  public modelMatrix: Mat4x3;
  public worldMatrix: Mat4x3;
  public normalMatrix: Mat3;

  public boundingBox: BoundingBox;
  public boundingSphere: BoundingSphere;
  public localBoundingBox: BoundingBox;
  public localBoundingSphere: BoundingSphere;

  public parent: T | null = null;
  public children: T[] = [];

  // Scratch values owned by Scene: root detection and traversal.
  public traversalStamp: number = 0;

  public isBoundsDirty: boolean = true;
  public isNormalMatrixDirty: boolean = true;
  public isWorldDirty: boolean = true;

  // The quaternion is the single source of truth; Euler angles are derived on demand.
  private _rotation: Vec3;
  private isRotationStale: boolean = false;
  private isTransformDirty: boolean = false;

  private static readonly UP = new Vec3(0, 1, 0);
  private static readonly scratchQuat = new Quat();
  private static readonly scratchVec = new Vec3();

  constructor() {
    this.position = new Vec3();
    this._rotation = new Vec3();
    this.scale = new Vec3(1.0, 1.0, 1.0);
    this.quaternion = new Quat();
    this.modelMatrix = new Mat4x3();
    this.worldMatrix = new Mat4x3();
    this.normalMatrix = new Mat3();

    this.modelMatrix.identity();
    this.worldMatrix.identity();
    this.normalMatrix.identity();

    this.localBoundingBox = new BoundingBox();
    this.localBoundingSphere = new BoundingSphere();
    this.boundingBox = new BoundingBox();
    this.boundingSphere = new BoundingSphere();
  }

  public addChild(node: T): void {
    if (node.parent === (this as unknown as T))
      return;
    if (this.children.indexOf(node) === -1) {
      if (node.parent)
        node.parent.removeChild(node);
      this.children.push(node);
      node.parent = this as unknown as T;
      node.isWorldDirty = true;
    }
  }

  public removeChild(node: T): boolean {
    const index = this.children.indexOf(node);
    if (index !== -1) {
      this.children.splice(index, 1);
      node.parent = null;
      node.isWorldDirty = true;
      return true;
    }
    return false;
  }

  public markDirty(): void {
    this.isTransformDirty = true;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
  }

  // Euler angles (radians) derived from the quaternion.
  public get rotation(): Vec3 {
    if (this.isRotationStale) {
      this.quaternion.getEuler(this._rotation);
      this.isRotationStale = false;
    }
    return this._rotation;
  }

  public set rotation(euler: Vec3) {
    this.setRotation(euler);
  }

  private rotationChanged(): void {
    this.isRotationStale = true;
    this.markDirty();
  }

  public setPosition(position: Vec3): this {
    if (position !== this.position && this.position.equals(position))
      return this;
    this.position.copy(position);
    this.markDirty();
    return this;
  }

  public setRotation(rotation: Vec3): this {
    if (rotation !== this._rotation && !this.isRotationStale && this._rotation.equals(rotation))
      return this;
    this._rotation.copy(rotation);
    this.quaternion.setFromEuler(this._rotation);
    this.isRotationStale = false;
    this.markDirty();
    return this;
  }

  public setScale(scale: Vec3): this {
    if (scale !== this.scale && this.scale.equals(scale))
      return this;
    this.scale.copy(scale);
    this.markDirty();
    return this;
  }

  public scaleBy(factor: Vec3): this {
    this.scale.multiply(factor);
    this.markDirty();
    return this;
  }

  public setQuaternion(q: Quat): this {
    if (q !== this.quaternion && this.quaternion.equals(q))
      return this;
    this.quaternion.copy(q);
    this.rotationChanged();
    return this;
  }

  public slerp(targetQuat: Quat, t: number): this {
    this.quaternion.slerp(targetQuat, t);
    this.rotationChanged();
    return this;
  }

  public rotateX(angle: number): this {
    this.quaternion.rotateX(angle);
    this.rotationChanged();
    return this;
  }

  public rotateY(angle: number): this {
    this.quaternion.rotateY(angle);
    this.rotationChanged();
    return this;
  }

  public rotateZ(angle: number): this {
    this.quaternion.rotateZ(angle);
    this.rotationChanged();
    return this;
  }

  public rotateOnAxis(axis: Vec3, angle: number): this {
    this.quaternion.multiply(Node.scratchQuat.setAxisAngle(axis, angle));
    this.rotationChanged();
    return this;
  }

  public translate(translation: Vec3): this {
    this.position.add(translation);
    this.markDirty();
    return this;
  }

  // Orients the node so its -Z axis faces target.
  public lookAt(target: Vec3, up: Vec3 = Node.UP): this {
    if (this.position.equals(target)) return this;
    this.quaternion.lookAt(this.position, target, up);
    this.rotationChanged();
    return this;
  }

  // Rebuilds the local matrix from position, quaternion and scale. Returns true if it changed.
  public updateModelMatrix(): boolean {
    if (!this.isTransformDirty) return false;
    this.modelMatrix.compose(this.position, this.quaternion, this.scale);
    this.isTransformDirty = false;
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
    return true;
  }

  public computeNormalMatrix(): Mat3 {
    if (!this.isNormalMatrixDirty) return this.normalMatrix;
    this.worldMatrix.toNormalMatrix(this.normalMatrix.toArray());
    this.isNormalMatrixDirty = false;
    return this.normalMatrix;
  }

  public getWorldPosition(target: Vec3 = new Vec3()): Vec3 {
    return this.worldMatrix.getTranslation(target);
  }

  public getWorldDirection(target: Vec3 = new Vec3()): Vec3 {
    return this.worldMatrix.getColumn(2, target).opposite().normalize();
  }

  public distanceTo(target: Node | Vec3): number {
    const targetPos = target instanceof Vec3 ? target : target.getWorldPosition();
    return this.getWorldPosition(Node.scratchVec).getDistance(targetPos);
  }

  public isInsideBounds(box: BoundingBox): boolean {
    return box.containsPoint(this.getWorldPosition(Node.scratchVec));
  }

  // Sets the local-space bounds used for culling and picking, for geometry whose vertices change after
  // construction (the constructor measures the arrays it was given, so a buffer that starts empty has no size).
  public setLocalBounds(box: BoundingBox): this {
    this.localBoundingBox.copy(box);
    this.localBoundingBox.getCenter(Node.scratchVec);
    this.localBoundingSphere.set(Node.scratchVec, box.min.getDistance(box.max) / 2);
    this.isBoundsDirty = true;
    return this;
  }

  public computeBounds(): void {
    if (!this.isBoundsDirty) return;
    if (!this.localBoundingBox.isEmpty()) {
      this.boundingBox.copy(this.localBoundingBox).applyMatrix4(this.worldMatrix);
      this.boundingSphere.copy(this.localBoundingSphere).applyMatrix4(this.worldMatrix);
    } else {
      const pos = this.getWorldPosition(Node.scratchVec);
      this.boundingBox.set(pos, pos);
      this.boundingSphere.set(pos, 0);
    }
    this.isBoundsDirty = false;
  }

  public computeBoundingBox(): BoundingBox {
    this.computeBounds();
    return this.boundingBox;
  }

  public computeBoundingSphere(): BoundingSphere {
    this.computeBounds();
    return this.boundingSphere;
  }

  // Combines the parent world matrix with the local matrix.
  public setWorldMatrix(worldMatrix: Mat4x3): void {
    this.worldMatrix.copy(worldMatrix).multiply(this.modelMatrix);
    this.isBoundsDirty = true;
    this.isNormalMatrixDirty = true;
    this.isWorldDirty = false;
  }

  // Recomputes world matrices below this node; only changed branches are recomputed.
  public computeWorldMatrix(graph: SceneGraph): void {
    const modelChanged = this.updateModelMatrix();
    const changed = this.isWorldDirty || modelChanged;
    if (changed)
      this.setWorldMatrix(graph.getWorldMatrix());
    graph.pushModelMatrix(this.worldMatrix);

    for (const child of this.children) {
      if (changed)
        child.isWorldDirty = true;
      child.computeWorldMatrix(graph);
    }

    graph.popModelMatrix();
  }
}
