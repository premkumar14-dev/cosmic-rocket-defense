import { GameObject } from './constants';

export class RocketController {
  private lastPosition: { x: number; y: number } | null = null;
  
  updatePosition(e: React.MouseEvent, currentRocket: GameObject): GameObject {
    return {
      ...currentRocket,
      x: e.clientX,
      y: e.clientY
    };
  }
}