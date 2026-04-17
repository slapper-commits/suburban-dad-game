import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { EndingScene } from './scenes/EndingScene';
import { GrillGame } from './minigames/GrillGame';
import { MowGame } from './minigames/MowGame';
import { DrivingGame } from './minigames/DrivingGame';

/**
 * Suburban Dad: Secret Saturday
 *
 * A branching narrative RPG about a suburban dad's secret Saturday.
 * It's 10 AM. The BBQ starts at 8 PM. What could possibly go wrong?
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    GameScene,
    EndingScene,
    GrillGame,
    MowGame,
    DrivingGame,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 2, // Support touch
  },
};

const game = new Phaser.Game(config);
(window as any).__PHASER_GAME__ = game;

// Hot module replacement for dev
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
