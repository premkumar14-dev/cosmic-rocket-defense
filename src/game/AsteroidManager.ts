import { GAME_CONSTANTS, Asteroid } from './constants';

export class AsteroidManager {
  private getRandomSpeed(baseSpeed: number): number {
    const variation = baseSpeed * 0.3; // 30% variation
    return baseSpeed + (Math.random() * variation * 2 - variation);
  }

  private calculateBaseSpeed(currentTime: number): number {
    const timeInMinutes = currentTime / 60000;
    const speedMultiplier = Math.min(1 + (timeInMinutes * 0.2), 3); // Cap at 3x speed
    return GAME_CONSTANTS.INITIAL_ASTEROID_SPEED * speedMultiplier;
  }

  spawnAsteroid(gameTime: number): Asteroid {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight);
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    const baseSpeed = this.calculateBaseSpeed(gameTime);
    const speed = this.getRandomSpeed(baseSpeed);
    
    return {
      x,
      y,
      radius: GAME_CONSTANTS.ASTEROID_RADIUS,
      speed,
      // Store initial position for movement calculation
      initialX: x,
      initialY: y,
      // Store target position (will be updated each frame)
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2
    };
  }

  updateAsteroidPositions(asteroids: Asteroid[], rocketX: number, rocketY: number): Asteroid[] {
    return asteroids.map(asteroid => {
      // Update the target position to the current rocket position
      asteroid.targetX = rocketX;
      asteroid.targetY = rocketY;

      // Calculate direction vector
      const dx = asteroid.targetX - asteroid.x;
      const dy = asteroid.targetY - asteroid.y;
      
      // Normalize the direction vector
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // Update asteroid position
      return {
        ...asteroid,
        x: asteroid.x + normalizedDx * asteroid.speed,
        y: asteroid.y + normalizedDy * asteroid.speed
      };
    });
  }
}