export const GAME_CONSTANTS = {
  ROCKET_RADIUS: 16,
  PROJECTILE_SPEED: 8,
  PROJECTILE_RADIUS: 3,
  ASTEROID_RADIUS: 15,
  INITIAL_ASTEROID_SPEED: 2, // Reduced base speed to make variations more noticeable
  POWERUP_RADIUS: 15,
  POWERUP_SPAWN_CHANCE: 0.1,
  POWERUP_DURATION: 5000,
  SHIELD_COLOR: "#4DEEEA",
  MULTI_SHOT_COLOR: "#FFE66D",
};

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
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  direction: {
    x: number;
    y: number;
  };
}

export type PowerUpType = "shield" | "multiShot";

export interface PowerUp extends GameObject {
  type: PowerUpType;
}