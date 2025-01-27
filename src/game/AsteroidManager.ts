import { GAME_CONSTANTS, Asteroid } from './constants';

export class AsteroidManager {
  private getRandomSpeed(baseSpeed: number): number {
    const variation = baseSpeed * 0.3;
    return baseSpeed + (Math.random() * variation * 2 - variation);
  }

  private calculateBaseSpeed(currentTime: number): number {
    const timeInMinutes = currentTime / 60000;
    const speedMultiplier = Math.min(1 + (timeInMinutes * 0.2), 3);
    return GAME_CONSTANTS.INITIAL_ASTEROID_SPEED * speedMultiplier;
  }

  spawnAsteroid(gameTime: number): Asteroid {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight);
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    const baseSpeed = this.calculateBaseSpeed(gameTime);
    const randomizedSpeed = this.getRandomSpeed(baseSpeed);
    
    return {
      x,
      y,
      radius: GAME_CONSTANTS.ASTEROID_RADIUS,
      speed: randomizedSpeed,
    };
  }

  updateAsteroidPositions(asteroids: Asteroid[], rocketX: number, rocketY: number): Asteroid[] {
    return asteroids.map(asteroid => {
      const angle = Math.atan2(
        rocketY - asteroid.y,
        rocketX - asteroid.x
      );
      return {
        ...asteroid,
        x: asteroid.x + Math.cos(angle) * asteroid.speed,
        y: asteroid.y + Math.sin(angle) * asteroid.speed,
      };
    });
  }
}