import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { GAME_CONSTANTS, GameObject, Projectile, Asteroid, PowerUp } from '../game/constants';
import SoundManager from '../game/SoundManager';
import { PowerUpManager } from '../game/PowerUpManager';
import { RocketController } from '../game/RocketController';
import { GameOverScreen } from './game/GameOverScreen';
import { GameHUD } from './game/GameHUD';
import { GameObjects } from './game/GameObjects';
import { StarBackground } from './game/StarBackground';
import { supabase } from '@/integrations/supabase/client';

export const Game = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const rocketController = useRef(new RocketController()).current;
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rocket, setRocket] = useState<GameObject & { angle?: number }>({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2, 
    radius: GAME_CONSTANTS.ROCKET_RADIUS,
    angle: 0
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
      speed: GAME_CONSTANTS.INITIAL_ASTEROID_SPEED,
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

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isGameOver || rocketController.isDraggingActive()) return;
    
    let targetX: number;
    let targetY: number;
    
    if ('touches' in e) {
      const touch = e.touches[0];
      targetX = touch.clientX;
      targetY = touch.clientY;
    } else {
      targetX = (e as React.MouseEvent).clientX;
      targetY = (e as React.MouseEvent).clientY;
    }
    
    const angle = Math.atan2(
      targetY - rocket.y,
      targetX - rocket.x
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

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isGameOver) {
      let targetX: number;
      let targetY: number;
      
      if ('touches' in e) {
        const touch = e.touches[0];
        targetX = touch.clientX;
        targetY = touch.clientY;
      } else {
        targetX = (e as React.MouseEvent).clientX;
        targetY = (e as React.MouseEvent).clientY;
      }

      const angle = Math.atan2(
        targetY - rocket.y,
        targetX - rocket.x
      );

      const newRocket = rocketController.updatePosition(e, rocket);
      setRocket({ ...newRocket, angle });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    rocketController.startDragging();
    handleMove(e);
  };

  const handleTouchEnd = () => {
    rocketController.stopDragging();
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
  };

  const saveScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        return;
      }

      const { error } = await supabase
        .from('scores')
        .insert([
          { 
            score,
            game_time: gameTime,
            user_id: user.id
          }
        ]);

      if (error) {
        console.error('Error saving score:', error);
        toast({
          title: "Error",
          description: "Failed to save your score. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Score saved successfully');
        toast({
          title: "Success",
          description: "Your score has been saved!",
        });
      }
    } catch (err) {
      console.error('Error in saveScore:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your score.",
        variant: "destructive"
      });
    }
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

      setAsteroids(prev =>
        prev.filter(asteroid => {
          const angle = Math.atan2(
            rocket.y - asteroid.y,
            rocket.x - asteroid.x
          );
          asteroid.x += Math.cos(angle) * asteroid.speed;
          asteroid.y += Math.sin(angle) * asteroid.speed;

          if (checkCollision(asteroid, rocket) && !powerUpManager.isPowerUpActive("shield")) {
            setIsGameOver(true);
            soundManager.playSound("explosion", 0.6);
            toast({
              title: "Game Over!",
              description: `Final Score: ${score} - Time: ${(gameTime / 1000).toFixed(1)}s`,
            });
            return false;
          }

          const hitByProjectile = projectiles.some(projectile => {
            if (checkCollision(asteroid, projectile)) {
              setProjectiles(prev => prev.filter(p => p !== projectile));
              createParticles(asteroid.x, asteroid.y, 8);
              soundManager.playSound("explosion", 0.4);
              setScore(prev => prev + 100);
              
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

    };

    frameRef.current = requestAnimationFrame(updateGame);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [rocket, isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      saveScore();
    }
  }, [isGameOver]);

  return (
    <div 
      ref={canvasRef}
      className="game-container fixed inset-0 cursor-none overflow-hidden"
      onClick={handleClick}
      onMouseMove={handleMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleMove}
      onTouchEnd={handleTouchEnd}
    >
      <StarBackground />
      
      <GameHUD 
        score={score}
        gameTime={gameTime}
        activePowerUps={{
          shield: powerUpManager.isPowerUpActive("shield") ? powerUpManager.getRemainingTime("shield") : undefined,
          multiShot: powerUpManager.isPowerUpActive("multiShot") ? powerUpManager.getRemainingTime("multiShot") : undefined,
        }}
      />

      <GameObjects
        rocket={rocket}
        projectiles={projectiles}
        asteroids={asteroids}
        powerUps={powerUps}
        particles={particles}
        hasShield={powerUpManager.isPowerUpActive("shield")}
      />

      {isGameOver && (
        <GameOverScreen score={score} gameTime={gameTime} />
      )}
    </div>
  );
};
