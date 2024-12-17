import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GAME_CONSTANTS, GameObject, Projectile, Asteroid, PowerUp } from '../game/constants';
import SoundManager from '../game/SoundManager';
import { PowerUpManager } from '../game/PowerUpManager';

export const Game = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rocket, setRocket] = useState<GameObject>({ 
    x: 0, 
    y: 0, 
    radius: GAME_CONSTANTS.ROCKET_RADIUS 
  });
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [particles, setParticles] = useState<GameObject[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  
  const soundManager = SoundManager.getInstance();
  const powerUpManager = useRef(new PowerUpManager()).current;

  const spawnAsteroid = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight);
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    return {
      x,
      y,
      radius: GAME_CONSTANTS.ASTEROID_RADIUS,
      speed: GAME_CONSTANTS.INITIAL_ASTEROID_SPEED + (gameTime / 10000) * GAME_CONSTANTS.DIFFICULTY_INCREASE,
    };
  };

  const createParticles = (x: number, y: number, count: number, color: string = "#FFE66D") => {
    const newParticles: GameObject[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        radius: Math.random() * 2 + 1,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.slice(count));
    }, 500);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isGameOver) return;
    
    const angle = Math.atan2(
      e.clientY - rocket.y,
      e.clientX - rocket.x
    );
    
    const createProjectile = (angleOffset: number = 0) => ({
      x: rocket.x,
      y: rocket.y,
      radius: GAME_CONSTANTS.PROJECTILE_RADIUS,
      dx: Math.cos(angle + angleOffset) * GAME_CONSTANTS.PROJECTILE_SPEED,
      dy: Math.sin(angle + angleOffset) * GAME_CONSTANTS.PROJECTILE_SPEED,
    });

    const newProjectiles = [createProjectile()];
    
    if (powerUpManager.isPowerUpActive("multiShot")) {
      newProjectiles.push(
        createProjectile(-0.2),
        createProjectile(0.2)
      );
    }
    
    setProjectiles(prev => [...prev, ...newProjectiles]);
    soundManager.playSound("shoot", 0.3 + (gameTime / 60000) * 0.3);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isGameOver) {
      setRocket(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
  };

  useEffect(() => {
    if (!isGameOver) {
      soundManager.startBackground();
      
      const spawnInterval = setInterval(() => {
        setAsteroids(prev => [...prev, spawnAsteroid()]);
      }, 1000);

      const timeInterval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 100;
          soundManager.setBackgroundVolume(newTime / 60000);
          return newTime;
        });
      }, 100);

      return () => {
        clearInterval(spawnInterval);
        clearInterval(timeInterval);
        soundManager.stopBackground();
      };
    }
  }, [isGameOver]);

  useEffect(() => {
    const updateGame = () => {
      // Update projectiles
      setProjectiles(prev => 
        prev.filter(projectile => {
          projectile.x += projectile.dx;
          projectile.y += projectile.dy;
          return (
            projectile.x > 0 &&
            projectile.x < window.innerWidth &&
            projectile.y > 0 &&
            projectile.y < window.innerHeight
          );
        })
      );

      // Update asteroids and check collisions
      setAsteroids(prev =>
        prev.filter(asteroid => {
          const angle = Math.atan2(
            rocket.y - asteroid.y,
            rocket.x - asteroid.x
          );
          asteroid.x += Math.cos(angle) * asteroid.speed;
          asteroid.y += Math.sin(angle) * asteroid.speed;

          // Check collision with rocket
          if (checkCollision(asteroid, rocket) && !powerUpManager.isPowerUpActive("shield")) {
            setIsGameOver(true);
            soundManager.playSound("explosion", 0.6);
            toast({
              title: "Game Over!",
              description: `Final Score: ${score} - Time: ${(gameTime / 1000).toFixed(1)}s`,
            });
            return false;
          }

          // Check collision with projectiles
          const hitByProjectile = projectiles.some(projectile => {
            if (checkCollision(asteroid, projectile)) {
              setProjectiles(prev => prev.filter(p => p !== projectile));
              createParticles(asteroid.x, asteroid.y, 8);
              soundManager.playSound("explosion", 0.4);
              setScore(prev => prev + 100);
              
              // Chance to spawn power-up
              const powerUp = powerUpManager.spawnPowerUp(asteroid.x, asteroid.y);
              if (powerUp) {
                setPowerUps(prev => [...prev, powerUp]);
              }
              
              return true;
            }
            return false;
          });

          return !hitByProjectile;
        })
      );

      // Update power-ups
      setPowerUps(prev => 
        prev.filter(powerUp => {
          if (checkCollision(powerUp, rocket)) {
            powerUpManager.activatePowerUp(powerUp.type);
            soundManager.playSound("powerup");
            createParticles(
              powerUp.x, 
              powerUp.y, 
              12, 
              powerUp.type === "shield" ? GAME_CONSTANTS.SHIELD_COLOR : GAME_CONSTANTS.MULTI_SHOT_COLOR
            );
            toast({
              title: `Power-up Activated!`,
              description: `${powerUp.type === "shield" ? "Shield" : "Multi-Shot"} active for ${GAME_CONSTANTS.POWERUP_DURATION / 1000}s`,
            });
            return false;
          }
          return true;
        })
      );

      frameRef.current = requestAnimationFrame(updateGame);
    };

    frameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [rocket, isGameOver]);

  return (
    <div 
      ref={canvasRef}
      className="game-container fixed inset-0 bg-background cursor-none"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
    >
      {/* Score and Timer */}
      <div className="fixed top-4 left-4 text-xl font-bold">
        <div>Score: {score}</div>
        <div>Time: {(gameTime / 1000).toFixed(1)}s</div>
      </div>

      {/* Active Power-ups */}
      <div className="fixed top-4 right-4 text-xl font-bold">
        {powerUpManager.isPowerUpActive("shield") && (
          <div className="text-cyan-400">
            Shield: {(powerUpManager.getRemainingTime("shield") / 1000).toFixed(1)}s
          </div>
        )}
        {powerUpManager.isPowerUpActive("multiShot") && (
          <div className="text-yellow-400">
            Multi-Shot: {(powerUpManager.getRemainingTime("multiShot") / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center p-8 rounded-lg bg-background/90">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <p className="text-xl mb-4">Time: {(gameTime / 1000).toFixed(1)}s</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Rocket */}
      <div
        className={cn(
          "absolute w-4 h-4 bg-primary rounded-full transition-all duration-300",
          powerUpManager.isPowerUpActive("shield") && "animate-pulse"
        )}
        style={{
          transform: `translate(${rocket.x - rocket.radius}px, ${rocket.y - rocket.radius}px)`,
          boxShadow: powerUpManager.isPowerUpActive("shield") 
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
          className="absolute w-8 h-8 bg-destructive rounded-full animate-pulse"
          style={{
            transform: `translate(${asteroid.x - asteroid.radius}px, ${asteroid.y - asteroid.radius}px)`,
            boxShadow: `0 0 ${10 + (gameTime / 10000) * 10}px #FF4444`,
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
    </div>
  );
};