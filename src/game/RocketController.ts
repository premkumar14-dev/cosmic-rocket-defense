import { GameObject } from './constants';

export class RocketController {
  private lastPosition: { x: number; y: number } | null = null;
  private isDragging: boolean = false;
  private lastAngle: number = 0;
  
  updatePosition(e: React.MouseEvent | React.TouchEvent, currentRocket: GameObject): GameObject & { angle: number } {
    let x: number, y: number;
    
    // For touch events
    if ('touches' in e) {
      const touch = e.touches[0];
      x = touch.clientX;
      y = touch.clientY;
    } else {
      // For mouse events
      x = e.clientX;
      y = e.clientY;
    }

    // Calculate angle between current and last position
    if (this.lastPosition) {
      const dx = x - this.lastPosition.x;
      const dy = y - this.lastPosition.y;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        this.lastAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + 90;
      }
    }

    this.lastPosition = { x, y };
    
    return {
      ...currentRocket,
      x,
      y,
      angle: this.lastAngle
    };
  }

  startDragging() {
    this.isDragging = true;
  }

  stopDragging() {
    this.isDragging = false;
    this.lastPosition = null;
  }

  isDraggingActive() {
    return this.isDragging;
  }
}