import { Button } from "@/components/ui/button";

interface GameOverScreenProps {
  score: number;
  gameTime: number;
}

export const GameOverScreen = ({ score, gameTime }: GameOverScreenProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="text-center p-8 rounded-lg bg-background/90">
        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
        <p className="text-xl mb-4">Score: {score}</p>
        <p className="text-xl mb-4">Time: {(gameTime / 1000).toFixed(1)}s</p>
        <Button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          onClick={() => window.location.reload()}
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};