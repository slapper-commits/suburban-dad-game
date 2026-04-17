import Phaser from 'phaser';
import { GameRegistry } from '../GameRegistry';
import endingsData from '../data/endings.json';
import type { EndingDefinition } from '../types';

/**
 * EndingScene — it's 8:00 PM. Time to face the music.
 */
export class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const reg = GameRegistry.instance;

    // Load endings & compute flags
    reg.playerState.computeEndingFlags();
    reg.endingResolver.loadEndings(endingsData as unknown as EndingDefinition[]);
    const ending = reg.endingResolver.resolve(reg.playerState);

    if (!ending) {
      console.error('No ending resolved!');
      return;
    }

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d1a);

    // Time
    const timeText = this.add.text(width / 2, 30, '8:00 PM', {
      fontSize: '16px', color: '#f5c542', fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0);

    // Letter grade — big and colored
    const gradeColors: Record<string, number> = {
      'A+': 0x33ff33, 'A': 0x33ff33,
      'B+': 0xaacc33, 'B': 0xcccc33, 'B-': 0xcccc33,
      'C+': 0xddaa33, 'C': 0xdd8833, 'C-': 0xdd8833,
      'D+': 0xdd4444, 'D': 0xdd4444,
      'F': 0xff2222,
    };
    const grade = (ending as any).grade || 'C';
    const gradeColor = gradeColors[grade] ?? 0xcccc33;

    const gradeText = this.add.text(width / 2, height * 0.17, grade, {
      fontSize: '72px',
      color: `#${gradeColor.toString(16).padStart(6, '0')}`,
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    // Title
    const titleText = this.add.text(width / 2, height * 0.32, ending.title, {
      fontSize: '32px', color: '#f5c542',
      fontFamily: 'Georgia, serif', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    // Description
    const descText = this.add.text(width / 2, height * 0.42, ending.description, {
      fontSize: '14px', color: '#a0a0c0',
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      align: 'center', wordWrap: { width: width * 0.7 },
    }).setOrigin(0.5).setAlpha(0);

    // Epilogue
    const epilogueText = this.add.text(width / 2, height * 0.52, ending.epilogue, {
      fontSize: '13px', color: '#d0d0e0',
      fontFamily: 'Georgia, serif', align: 'center',
      wordWrap: { width: width * 0.75 }, lineSpacing: 6,
    }).setOrigin(0.5, 0).setAlpha(0);

    // Stats
    const state = reg.playerState.state;
    const lawn = Math.round((state.flags.lawnStatus as number) ?? 0);
    const grill = (state.flags.grillStatus as string) ?? 'not_started';
    const cash = (state.flags.cash as number) ?? 0;

    const statsLines = [
      `Sobriety: ${state.sobriety}%  |  Suspicion: ${state.suspicion}%  |  Energy: ${state.energy}%`,
      `Lawn: ${lawn}%  |  Grill: ${grill}  |  Cash: $${cash}`,
      `Dominant vice: ${reg.playerState.dominantVice}  |  Vices explored: ${reg.playerState.viceCount}`,
    ];

    const statsText = this.add.text(width / 2, height * 0.78, statsLines.join('\n'), {
      fontSize: '10px', color: '#606070', fontFamily: 'monospace',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Play again button
    const btnBg = this.add.rectangle(width / 2, height * 0.92, 200, 44, 0xf5c542, 0.9)
      .setInteractive({ useHandCursor: true }).setAlpha(0);
    const btnText = this.add.text(width / 2, height * 0.92, 'TRY AGAIN', {
      fontSize: '18px', color: '#1a1a2e', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);

    btnBg.on('pointerdown', () => {
      this.scene.start('BootScene');
    });

    // Animate in
    this.tweens.add({ targets: timeText, alpha: 1, duration: 600, delay: 300 });
    this.tweens.add({ targets: gradeText, alpha: 1, duration: 800, delay: 900, ease: 'Bounce.easeOut' });
    this.tweens.add({ targets: titleText, alpha: 1, duration: 800, delay: 1800 });
    this.tweens.add({ targets: descText, alpha: 1, duration: 600, delay: 2600 });
    this.tweens.add({ targets: epilogueText, alpha: 1, duration: 800, delay: 3400 });
    this.tweens.add({ targets: statsText, alpha: 1, duration: 600, delay: 4500 });
    this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 600, delay: 5200 });
  }
}
