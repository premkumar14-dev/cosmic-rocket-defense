import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface GameObject {
  x: number;
  y: number;
  radius: number;
}

interface Projectile extends GameObject {
  dx: number;
  dy: number;
}

interface Asteroid extends GameObject {
  speed: number;
}

const ROCKET_RADIUS = 20;
const PROJECTILE_SPEED = 8;
const PROJECTILE_RADIUS = 3;
const ASTEROID_RADIUS = 15;
const INITIAL_ASTEROID_SPEED = 2;
const DIFFICULTY_INCREASE = 0.1;

export const Game = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rocket, setRocket] = useState<GameObject>({ x: 0, y: 0, radius: ROCKET_RADIUS });
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [particles, setParticles] = useState<GameObject[]>([]);

  const spawnAsteroid = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(window.innerWidth, window.innerHeight);
    const x = window.innerWidth / 2 + Math.cos(angle) * radius;
    const y = window.innerHeight / 2 + Math.sin(angle) * radius;
    
    return {
      x,
      y,
      radius: ASTEROID_RADIUS,
      speed: INITIAL_ASTEROID_SPEED + (gameTime / 10000) * DIFFICULTY_INCREASE,
    };
  };

  const createParticles = (x: number, y: number, count: number) => {
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
    
    const projectile: Projectile = {
      x: rocket.x,
      y: rocket.y,
      radius: PROJECTILE_RADIUS,
      dx: Math.cos(angle) * PROJECTILE_SPEED,
      dy: Math.sin(angle) * PROJECTILE_SPEED,
    };
    
    setProjectiles(prev => [...prev, projectile]);
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
      const spawnInterval = setInterval(() => {
        setAsteroids(prev => [...prev, spawnAsteroid()]);
      }, 1000);

      const timeInterval = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);

      return () => {
        clearInterval(spawnInterval);
        clearInterval(timeInterval);
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

      // Update asteroids
      setAsteroids(prev =>
        prev.filter(asteroid => {
          const angle = Math.atan2(
            rocket.y - asteroid.y,
            rocket.x - asteroid.x
          );
          asteroid.x += Math.cos(angle) * asteroid.speed;
          asteroid.y += Math.sin(angle) * asteroid.speed;

          // Check collision with rocket
          if (checkCollision(asteroid, rocket)) {
            setIsGameOver(true);
            toast({
              title: "Game Over!",
              description: `Final Score: ${score} - Time: ${(gameTime / 1000).toFixed(1)}s`,
            });
            return false;
          }

          // Check collision with projectiles
          const hitByProjectile = projectiles.some(projectile => {
            if (checkCollision(asteroid, projectile)) {
              setProjectiles(prev => 
                prev.filter(p => p !== projectile)
              );
              createParticles(asteroid.x, asteroid.y, 8);
              setScore(prev => prev + 100);
              return true;
            }
            return false;
          });

          return !hitByProjectile;
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
        className="absolute w-4 h-4 bg-primary rounded-full"
        style={{
          transform: `translate(${rocket.x - rocket.radius}px, ${rocket.y - rocket.radius}px)`,
          boxShadow: '0 0 10px #4DEEEA',
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