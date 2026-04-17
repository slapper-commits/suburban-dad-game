import Phaser from 'phaser';
import { GameRegistry } from '../GameRegistry';

/**
 * BootScene — title screen.
 * No asset preloading needed — all rendering is procedural.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const reg = GameRegistry.instance;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, height * 0.2, 'SATURDAY', {
      fontSize: '56px',
      color: '#f5c542',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, 'A Suburban Dad Simulator', {
      fontSize: '20px',
      color: '#a0a0c0',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.48, "It's 7 AM. The BBQ starts at 5.\nKaren left a note. The lawn needs mowing.\nWhat could possibly go wrong?", {
      fontSize: '14px',
      color: '#808090',
      fontFamily: 'monospace',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Start button
    const btnBg = this.add.rectangle(width / 2, height * 0.7, 220, 50, 0xf5c542, 0.9)
      .setInteractive({ useHandCursor: true });
    const btnText = this.add.text(width / 2, height * 0.7, 'START DAY', {
      fontSize: '22px',
      color: '#1a1a2e',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => btnBg.setFillStyle(0xf5c542, 1));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0xf5c542, 0.9));
    btnBg.on('pointerdown', () => {
      reg.newGame();
      this.scene.start('GameScene', { sceneId: 'kitchen' });
    });

    // Version
    this.add.text(width - 10, height - 10, 'v0.2.0', {
      fontSize: '10px',
      color: '#404050',
      fontFamily: 'monospace',
    }).setOrigin(1, 1);
  }
}
