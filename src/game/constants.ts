export const GAME_CONSTANTS = {
  ROCKET_RADIUS: 20,
  PROJECTILE_SPEED: 8,
  PROJECTILE_RADIUS: 3,
  ASTEROID_RADIUS: 15,
  INITIAL_ASTEROID_SPEED: 3, // Changed to a constant moderate speed
  DIFFICULTY_INCREASE: 0, // Removed speed increase over time
  POWERUP_RADIUS: 15,
  POWERUP_SPAWN_CHANCE: 0.1,
  POWERUP_DURATION: 5000,
  SHIELD_COLOR: "#4DEEEA",
  MULTI_SHOT_COLOR: "#FFE66D",
};

export type PowerUpType = "shield" | "multiShot";

export interface GameObject {
  x: number;
  y: number;
  radius: number;
}

export interface Projectile extends GameObject {
  dx: number;
  dy: number;
}

export interface Asteroid extends GameObject {
  speed: number;
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
}