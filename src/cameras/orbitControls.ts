import { Vec3, Vec2, Trigo, Utils } from '@1pizzateam/spock';
import type { Camera } from './camera';

export class OrbitControls {

  camera: Camera;
  domElement: HTMLElement;

  distance: number;
  targetDistance: number;
  azimuth: number;
  targetAzimuth: number;
  elevation: number;
  targetElevation: number;

  minDistance: number;
  maxDistance: number;
  minElevation: number;
  maxElevation: number;

  rotateSpeed: number;
  zoomSpeed: number;
  panSpeed: number;

  enableDamping: boolean;
  dampingFactor: number;

  private isDragging: boolean;
  private dragMode: 'rotate' | 'pan' | null;
  private previousMouseX: number;
  private previousMouseY: number;
  private touchStartDistance: number;
  private activePointerId: number | null = null;
  // Last camera pose written by update(); lets idle frames skip the view matrix rebuild.
  private appliedPose: Vec3 = new Vec3(NaN, NaN, NaN);
  private appliedTarget: Vec3 = new Vec3(NaN, NaN, NaN);

  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerMoveBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;
  private onWheelBound: (e: WheelEvent) => void;
  private onContextMenuBound: (e: MouseEvent) => void;
  private onTouchStartBound: (e: TouchEvent) => void;
  private onTouchMoveBound: (e: TouchEvent) => void;
  private onTouchEndBound: (e: TouchEvent) => void;

  constructor(camera: Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.minDistance = 0.1;
    this.maxDistance = 10000;
    this.minElevation = -Trigo.halfpi + 0.01;
    this.maxElevation = Trigo.halfpi - 0.01;

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.0;
    this.panSpeed = 1.0;

    this.enableDamping = false;
    this.dampingFactor = 0.05;

    this.isDragging = false;
    this.dragMode = null;
    this.previousMouseX = 0;
    this.previousMouseY = 0;
    this.touchStartDistance = 0;

    // Calculate initial distance, azimuth, elevation from camera position and target
    const spherical = OrbitControls._scratchSpherical.subVectors(this.camera.position, this.camera.target).getSpherical(OrbitControls._scratchSpherical);
    this.distance = spherical.x || 10;
    this.targetDistance = this.distance;
    this.azimuth = spherical.y;
    this.targetAzimuth = this.azimuth;
    this.elevation = spherical.z;
    this.targetElevation = this.elevation;

    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
    this.onWheelBound = this.onWheel.bind(this);
    this.onContextMenuBound = (e: MouseEvent) => e.preventDefault();
    this.onTouchStartBound = this.onTouchStart.bind(this);
    this.onTouchMoveBound = this.onTouchMove.bind(this);
    this.onTouchEndBound = this.onTouchEnd.bind(this);

    this.attach();
    this.update();
  }

  private attach(): void {
    if (!this.domElement || typeof this.domElement.addEventListener !== 'function') return;
    if (this.domElement.style)
      this.domElement.style.touchAction = 'none';
    this.domElement.addEventListener('pointerdown', this.onPointerDownBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.onPointerMoveBound);
      window.addEventListener('pointerup', this.onPointerUpBound);
    }
    this.domElement.addEventListener('wheel', this.onWheelBound, { passive: false });
    this.domElement.addEventListener('contextmenu', this.onContextMenuBound);
    this.domElement.addEventListener('touchstart', this.onTouchStartBound, { passive: false });
    this.domElement.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
    this.domElement.addEventListener('touchend', this.onTouchEndBound);
    this.domElement.addEventListener('touchcancel', this.onTouchEndBound);
  }

  public dispose(): void {
    if (!this.domElement || typeof this.domElement.removeEventListener !== 'function') return;
    this.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.onPointerMoveBound);
      window.removeEventListener('pointerup', this.onPointerUpBound);
    }
    this.domElement.removeEventListener('wheel', this.onWheelBound);
    this.domElement.removeEventListener('contextmenu', this.onContextMenuBound);
    this.domElement.removeEventListener('touchstart', this.onTouchStartBound);
    this.domElement.removeEventListener('touchmove', this.onTouchMoveBound);
    this.domElement.removeEventListener('touchend', this.onTouchEndBound);
    this.domElement.removeEventListener('touchcancel', this.onTouchEndBound);
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.isPrimary === false) return;
    this.activePointerId = e.pointerId ?? null;
    this.isDragging = true;
    this.previousMouseX = e.clientX;
    this.previousMouseY = e.clientY;
    if (e.button === 2 || e.shiftKey)
      this.dragMode = 'pan';
    else
      this.dragMode = 'rotate';
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;
    if (this.activePointerId !== null && e.pointerId !== undefined && e.pointerId !== this.activePointerId) return;

    const deltaX = e.clientX - this.previousMouseX;
    const deltaY = e.clientY - this.previousMouseY;
    this.previousMouseX = e.clientX;
    this.previousMouseY = e.clientY;

    if (this.dragMode === 'rotate') {
      const elementHeight = this.domElement.clientHeight || 500;
      this.targetAzimuth -= (deltaX / elementHeight) * Trigo.pi * this.rotateSpeed;
      this.targetElevation += (deltaY / elementHeight) * Trigo.pi * this.rotateSpeed;
      this.targetElevation = Utils.clamp(this.targetElevation, this.minElevation, this.maxElevation);
    } else if (this.dragMode === 'pan')
      this.pan(deltaX, deltaY);

    if (!this.enableDamping) {
      this.azimuth = this.targetAzimuth;
      this.elevation = this.targetElevation;
      this.update();
    }
  }

  private onPointerUp(): void {
    this.isDragging = false;
    this.activePointerId = null;
    this.dragMode = null;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : (1 / 1.1);
    this.targetDistance *= Math.pow(factor, this.zoomSpeed);
    this.targetDistance = Utils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
    if (!this.enableDamping) {
      this.distance = this.targetDistance;
      this.update();
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.touchStartDistance = OrbitControls.touchDistance(e.touches);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = OrbitControls.touchDistance(e.touches);
      const factor = this.touchStartDistance / (currentDistance || 1);
      this.touchStartDistance = currentDistance;
      this.targetDistance *= factor;
      this.targetDistance = Utils.clamp(this.targetDistance, this.minDistance, this.maxDistance);
      if (!this.enableDamping) {
        this.distance = this.targetDistance;
        this.update();
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (e.touches.length < 2)
      this.touchStartDistance = 0;
  }

  private static _touchA = new Vec2();
  private static _touchB = new Vec2();

  private static touchDistance(touches: TouchList): number {
    return OrbitControls._touchA.setScalar(touches[0].clientX, touches[0].clientY)
      .getDistance(OrbitControls._touchB.setScalar(touches[1].clientX, touches[1].clientY));
  }

  private static _scratchForward = new Vec3();
  private static _scratchRight = new Vec3();
  private static _scratchUp = new Vec3();
  private static _scratchPan = new Vec3();
  private static _scratchSpherical = new Vec3();

  private pan(deltaX: number, deltaY: number): void {
    const factor = (this.distance / 1000) * this.panSpeed;
    const forward = this.camera.getViewDirection(OrbitControls._scratchForward);
    const right = OrbitControls._scratchRight.crossVectors(forward, this.camera.up).normalize();
    const up = OrbitControls._scratchUp.crossVectors(right, forward).normalize();

    OrbitControls._scratchPan.origin()
      .add(right.scale(-deltaX * factor))
      .add(up.scale(deltaY * factor));

    this.camera.target.add(OrbitControls._scratchPan);
    this.camera.position.add(OrbitControls._scratchPan);
  }

  // deltaTime (seconds) makes damping independent of the frame rate; without it each call
  // moves dampingFactor of the remaining distance.
  public update(deltaTime?: number): void {
    if (this.enableDamping) {
      const t = deltaTime === undefined
        ? this.dampingFactor
        : 1 - Math.pow(1 - this.dampingFactor, deltaTime * 60);
      // Take the shortest way around when the azimuth wraps.
      this.azimuth = Trigo.lerpRadian(this.azimuth, this.targetAzimuth, t);
      this.elevation = Utils.lerp(this.elevation, this.targetElevation, t);
      this.distance = Utils.lerp(this.distance, this.targetDistance, t);
    }

    const target = this.camera.target;
    const pose = OrbitControls._scratchSpherical.setScalar(this.distance, this.azimuth, this.elevation);
    if (pose.equals(this.appliedPose) && target.equals(this.appliedTarget))
      return;
    this.appliedPose.copy(pose);
    this.appliedTarget.copy(target);

    this.camera.position.setFromSpherical(this.distance, this.azimuth, this.elevation).add(target);
    this.camera.setViewMatrix();
  }

}
