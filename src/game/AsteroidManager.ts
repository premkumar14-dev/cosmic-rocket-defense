import { GAME_CONSTANTS, Asteroid } from './constants';

export class AsteroidManager {
  private getRandomSpeed(baseSpeed: number): number {
    // Increase variation range to make speed differences more noticeable
    const minSpeed = baseSpeed * 0.5;  // 50% slower
    const maxSpeed = baseSpeed * 2;    // 100% faster
    return minSpeed + Math.random() * (maxSpeed - minSpeed);
  }

  private calculateBaseSpeed(currentTime: number): number {
    const timeInMinutes = currentTime / 60000;
    // Increase speed more aggressively over time
    const speedMultiplier = Math.min(1 + (timeInMinutes * 0.3), 4); // Cap at 4x speed
    return GAME_CONSTANTS.INITIAL_ASTEROID_SPEED * speedMultiplier;
  }

  spawnAsteroid(gameTime: number): Asteroid {
    // Spawn asteroids from outside the visible area
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight);
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    const baseSpeed = this.calculateBaseSpeed(gameTime);
    const speed = this.getRandomSpeed(baseSpeed);
    
    console.log(`Spawning asteroid with speed: ${speed}`);
    
    return {
      x,
      y,
      radius: GAME_CONSTANTS.ASTEROID_RADIUS,
      speed,
      initialX: x,
      initialY: y,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      direction: { x: 0, y: 0 }
    };
  }

  updateAsteroidPositions(asteroids: Asteroid[], rocketX: number, rocketY: number): Asteroid[] {
    return asteroids.map(asteroid => {
      // Always update target to current rocket position
      asteroid.targetX = rocketX;
      asteroid.targetY = rocketY;

      // Calculate direction vector
      const dx = asteroid.targetX - asteroid.x;
      const dy = asteroid.targetY - asteroid.y;
      
      // Normalize the direction vector
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / distance || 0;
      const normalizedDy = dy / distance || 0;

      // Update asteroid position using its individual speed
      const newX = asteroid.x + normalizedDx * asteroid.speed;
      const newY = asteroid.y + normalizedDy * asteroid.speed;

      return {
        ...asteroid,
        x: newX,
        y: newY,
        direction: { x: normalizedDx, y: normalizedDy }
      };
    });
  }
}