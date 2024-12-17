import { Howl } from 'howler';

class SoundManager {
  private static instance: SoundManager;
  private sounds: {
    shoot: Howl;
    explosion: Howl;
    powerup: Howl;
    background: Howl;
  };

  private constructor() {
    this.sounds = {
      shoot: new Howl({
        src: ['data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='],
        volume: 0.3
      }),
      explosion: new Howl({
        src: ['data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='],
        volume: 0.4
      }),
      powerup: new Howl({
        src: ['data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='],
        volume: 0.5
      }),
      background: new Howl({
        src: ['data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='],
        volume: 0.2,
        loop: true
      })
    };
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playSound(sound: keyof typeof this.sounds, volume?: number) {
    if (volume !== undefined) {
      this.sounds[sound].volume(volume);
    }
    this.sounds[sound].play();
  }

  public startBackground() {
    this.sounds.background.play();
  }

  public stopBackground() {
    this.sounds.background.stop();
  }

  public setBackgroundVolume(difficulty: number) {
    // Increase background music intensity with difficulty
    const volume = Math.min(0.2 + (difficulty * 0.1), 0.8);
    this.sounds.background.volume(volume);
  }
}

export default SoundManager;