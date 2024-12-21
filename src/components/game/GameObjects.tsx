import { cn } from "@/lib/utils";
import { GameObject, Projectile, Asteroid, PowerUp, GAME_CONSTANTS } from "@/game/constants";
import { Rocket } from "lucide-react";

interface GameObjectsProps {
  rocket: GameObject & { angle?: number };
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
          "absolute w-10 h-10 transition-transform duration-100",
          hasShield && "animate-pulse"
        )}
        style={{
          transform: `translate(${rocket.x - 20}px, ${rocket.y - 20}px) rotate(${rocket.angle || 0}deg)`,
          filter: hasShield 
            ? `drop-shadow(0 0 8px ${GAME_CONSTANTS.SHIELD_COLOR})`
            : 'drop-shadow(0 0 4px rgba(77, 238, 234, 0.6))',
        }}
      >
        <Rocket className="w-full h-full text-primary animate-pulse" />
      </div>

      {/* Projectiles */}
      {projectiles.map((projectile, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
          style={{
            transform: `translate(${projectile.x - projectile.radius}px, ${projectile.y - projectile.radius}px)`,
            boxShadow: '0 0 8px #FFE66D, 0 0 16px rgba(255, 230, 109, 0.5)',
          }}
        />
      ))}

      {/* Asteroids */}
      {asteroids.map((asteroid, index) => (
        <div
          key={index}
          className="absolute w-8 h-8 rounded-full animate-pulse"
          style={{
            transform: `translate(${asteroid.x - asteroid.radius}px, ${asteroid.y - asteroid.radius}px)`,
            background: 'radial-gradient(circle at 30% 30%, rgb(255, 107, 107), rgb(255, 68, 68))',
            boxShadow: '0 0 15px rgba(255, 68, 68, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.3)',
          }}
        />
      ))}

      {/* Power-ups */}
      {powerUps.map((powerUp, index) => (
        <div
          key={index}
          className="absolute w-8 h-8 rounded-full power-up"
          style={{
            transform: `translate(${powerUp.x - powerUp.radius}px, ${powerUp.y - powerUp.radius}px)`,
            backgroundColor: powerUp.type === "shield" ? GAME_CONSTANTS.SHIELD_COLOR : GAME_CONSTANTS.MULTI_SHOT_COLOR,
            boxShadow: `0 0 20px ${powerUp.type === "shield" ? GAME_CONSTANTS.SHIELD_COLOR : GAME_CONSTANTS.MULTI_SHOT_COLOR}`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          className="particle w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            background: 'radial-gradient(circle at center, #FFE66D, #FFD700)',
            boxShadow: '0 0 8px rgba(255, 230, 109, 0.8)',
          }}
        />
      ))}
    </>
  );
};