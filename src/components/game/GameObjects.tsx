import { cn } from "@/lib/utils";
import { GameObject, Projectile, Asteroid, PowerUp, GAME_CONSTANTS } from "@/game/constants";

interface GameObjectsProps {
  rocket: GameObject;
  projectiles: Projectile[];
  asteroids: Asteroid[];
  powerUps: PowerUp[];
  particles: GameObject[];
  hasShield: boolean;
}

export const GameObjects = ({ 
  rocket, 
  projectiles, 
  asteroids, 
  powerUps, 
  particles,
  hasShield 
}: GameObjectsProps) => {
  return (
    <>
      {/* Rocket */}
      <div
        className={cn(
          "absolute w-4 h-4 bg-primary rounded-full transition-none",
          hasShield && "animate-pulse"
        )}
        style={{
          transform: `translate(${rocket.x - rocket.radius}px, ${rocket.y - rocket.radius}px)`,
          boxShadow: hasShield 
            ? `0 0 20px ${GAME_CONSTANTS.SHIELD_COLOR}, 0 0 40px ${GAME_CONSTANTS.SHIELD_COLOR}`
            : '0 0 10px #4DEEEA',
        }}
      />

      {/* Projectiles */}
      {projectiles.map((projectile, index) => (
        <div
          key={index}
          className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
          style={{
            transform: `translate(${projectile.x - projectile.radius}px, ${projectile.y - projectile.radius}px)`,
            boxShadow: '0 0 5px #FFE66D',
          }}
        />
      ))}

      {/* Asteroids */}
      {asteroids.map((asteroid, index) => (
        <div
          key={index}
          className="absolute w-8 h-8 bg-destructive rounded-full"
          style={{
            transform: `translate(${asteroid.x - asteroid.radius}px, ${asteroid.y - asteroid.radius}px)`,
            boxShadow: '0 0 10px #FF4444',
          }}
        />
      ))}

      {/* Power-ups */}
      {powerUps.map((powerUp, index) => (
        <div
          key={index}
          className="absolute w-8 h-8 rounded-full animate-bounce"
          style={{
            transform: `translate(${powerUp.x - powerUp.radius}px, ${powerUp.y - powerUp.radius}px)`,
            backgroundColor: powerUp.type === "shield" ? GAME_CONSTANTS.SHIELD_COLOR : GAME_CONSTANTS.MULTI_SHOT_COLOR,
            boxShadow: `0 0 15px ${powerUp.type === "shield" ? GAME_CONSTANTS.SHIELD_COLOR : GAME_CONSTANTS.MULTI_SHOT_COLOR}`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="particle w-1 h-1 bg-yellow-300 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
          }}
        />
      ))}
    </>
  );
};