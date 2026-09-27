import { Vec3 } from '@1pizzateam/spock';
import { Camera } from './camera';

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

  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerMoveBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;
  private onWheelBound: (e: WheelEvent) => void;
  private onContextMenuBound: (e: MouseEvent) => void;
  private onTouchStartBound: (e: TouchEvent) => void;
  private onTouchMoveBound: (e: TouchEvent) => void;

  constructor(camera: Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.minDistance = 0.1;
    this.maxDistance = 10000;
    this.minElevation = -Math.PI * 0.5 + 0.01;
    this.maxElevation = Math.PI * 0.5 - 0.01;

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
    const offset = new Vec3().subVectors(this.camera.position, this.camera.target);
    this.distance = offset.getMagnitude() || 10;
    this.targetDistance = this.distance;

    this.azimuth = Math.atan2(offset.x, offset.z);
    this.targetAzimuth = this.azimuth;

    this.elevation = Math.asin(Math.max(-1, Math.min(1, offset.y / (this.distance || 1))));
    this.targetElevation = this.elevation;

    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
    this.onWheelBound = this.onWheel.bind(this);
    this.onContextMenuBound = (e: MouseEvent) => e.preventDefault();
    this.onTouchStartBound = this.onTouchStart.bind(this);
    this.onTouchMoveBound = this.onTouchMove.bind(this);

    this.attach();
    this.update();
  }

  private attach(): void {
    if (!this.domElement || typeof this.domElement.addEventListener !== 'function') return;
    this.domElement.addEventListener('pointerdown', this.onPointerDownBound);
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.onPointerMoveBound);
      window.addEventListener('pointerup', this.onPointerUpBound);
    }
    this.domElement.addEventListener('wheel', this.onWheelBound, { passive: false });
    this.domElement.addEventListener('contextmenu', this.onContextMenuBound);
    this.domElement.addEventListener('touchstart', this.onTouchStartBound, { passive: false });
    this.domElement.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
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
  }

  private onPointerDown(e: PointerEvent): void {
    this.isDragging = true;
    this.previousMouseX = e.clientX;
    this.previousMouseY = e.clientY;
    if (e.button === 2 || e.shiftKey) {
      this.dragMode = 'pan';
    } else {
      this.dragMode = 'rotate';
    }
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousMouseX;
    const deltaY = e.clientY - this.previousMouseY;
    this.previousMouseX = e.clientX;
    this.previousMouseY = e.clientY;

    if (this.dragMode === 'rotate') {
      const elementHeight = this.domElement.clientHeight || 500;
      this.targetAzimuth -= (deltaX / elementHeight) * Math.PI * this.rotateSpeed;
      this.targetElevation += (deltaY / elementHeight) * Math.PI * this.rotateSpeed;
      this.targetElevation = Math.max(this.minElevation, Math.min(this.maxElevation, this.targetElevation));
    } else if (this.dragMode === 'pan') {
      this.pan(deltaX, deltaY);
    }

    if (!this.enableDamping) {
      this.azimuth = this.targetAzimuth;
      this.elevation = this.targetElevation;
      this.update();
    }
  }

  private onPointerUp(): void {
    this.isDragging = false;
    this.dragMode = null;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : (1 / 1.1);
    this.targetDistance *= Math.pow(factor, this.zoomSpeed);
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    if (!this.enableDamping) {
      this.distance = this.targetDistance;
      this.update();
    }
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchStartDistance = Math.hypot(dx, dy);
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      const factor = this.touchStartDistance / (currentDistance || 1);
      this.touchStartDistance = currentDistance;
      this.targetDistance *= factor;
      this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
      if (!this.enableDamping) {
        this.distance = this.targetDistance;
        this.update();
      }
    }
  }

  private static _scratchForward = new Vec3();
  private static _scratchRight = new Vec3();
  private static _scratchUp = new Vec3();
  private static _scratchPan = new Vec3();

  private pan(deltaX: number, deltaY: number): void {
    const factor = (this.distance / 1000) * this.panSpeed;
    const forward = this.camera.getViewDirection(OrbitControls._scratchForward);
    const right = OrbitControls._scratchRight.crossVectors(forward, this.camera.up).normalize();
    const up = OrbitControls._scratchUp.crossVectors(right, forward).normalize();

    OrbitControls._scratchPan.setScalar(0, 0, 0)
      .add(right.scale(-deltaX * factor))
      .add(up.scale(deltaY * factor));

    this.camera.target.add(OrbitControls._scratchPan);
    this.camera.position.add(OrbitControls._scratchPan);
  }

  public update(): void {
    if (this.enableDamping) {
      this.azimuth += (this.targetAzimuth - this.azimuth) * this.dampingFactor;
      this.elevation += (this.targetElevation - this.elevation) * this.dampingFactor;
      this.distance += (this.targetDistance - this.distance) * this.dampingFactor;
    }

    const cosElev = Math.cos(this.elevation);
    const x = this.distance * cosElev * Math.sin(this.azimuth);
    const y = this.distance * Math.sin(this.elevation);
    const z = this.distance * cosElev * Math.cos(this.azimuth);

    this.camera.position.setScalar(
      this.camera.target.x + x,
      this.camera.target.y + y,
      this.camera.target.z + z
    );
    this.camera.setViewMatrix();
  }

}
