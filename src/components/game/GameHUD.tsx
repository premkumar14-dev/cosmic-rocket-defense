interface GameHUDProps {
  score: number;
  gameTime: number;
  activePowerUps: {
    shield?: number;
    multiShot?: number;
  };
}

export const GameHUD = ({ score, gameTime, activePowerUps }: GameHUDProps) => {
  return (
    <>
      <div className="fixed top-4 left-4 text-xl font-bold">
        <div>Score: {score}</div>
        <div>Time: {(gameTime / 1000).toFixed(1)}s</div>
      </div>

      <div className="fixed top-4 right-4 text-xl font-bold">
        {activePowerUps.shield !== undefined && (
          <div className="text-cyan-400">
            Shield: {(activePowerUps.shield / 1000).toFixed(1)}s
          </div>
        )}
        {activePowerUps.multiShot !== undefined && (
          <div className="text-yellow-400">
            Multi-Shot: {(activePowerUps.multiShot / 1000).toFixed(1)}s
          </div>
        )}
      </div>
    </>
  );
};