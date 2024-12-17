import { PowerUp, PowerUpType, GAME_CONSTANTS } from './constants';

export class PowerUpManager {
  private activePowerUps: Map<PowerUpType, number> = new Map();

  public spawnPowerUp(x: number, y: number): PowerUp | null {
    if (Math.random() > GAME_CONSTANTS.POWERUP_SPAWN_CHANCE) return null;

    const types: PowerUpType[] = ["shield", "multiShot"];
    const type = types[Math.floor(Math.random() * types.length)];

    return {
      x,
      y,
      type,
      radius: GAME_CONSTANTS.POWERUP_RADIUS
    };
  }

  public activatePowerUp(type: PowerUpType) {
    this.activePowerUps.set(type, Date.now() + GAME_CONSTANTS.POWERUP_DURATION);
  }

  public isPowerUpActive(type: PowerUpType): boolean {
    const expiryTime = this.activePowerUps.get(type);
    if (!expiryTime) return false;
    
    if (Date.now() > expiryTime) {
      this.activePowerUps.delete(type);
      return false;
    }
    return true;
  }

  public getRemainingTime(type: PowerUpType): number {
    const expiryTime = this.activePowerUps.get(type);
    if (!expiryTime) return 0;
    return Math.max(0, expiryTime - Date.now());
  }
}