import { GameObject } from './constants';

export class RocketController {
  private lastPosition: { x: number; y: number } | null = null;
  private isDragging: boolean = false;
  
  updatePosition(e: React.MouseEvent | React.TouchEvent, currentRocket: GameObject): GameObject {
    // For touch events
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        ...currentRocket,
        x: touch.clientX,
        y: touch.clientY
      };
    }
    
    // For mouse events
    return {
      ...currentRocket,
      x: e.clientX,
      y: e.clientY
    };
  }

  startDragging() {
    this.isDragging = true;
  }

  stopDragging() {
    this.isDragging = false;
  }

  isDraggingActive() {
    return this.isDragging;
  }
}