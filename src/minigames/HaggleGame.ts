import Phaser from 'phaser';
import { MiniGameBase } from './MiniGameBase';
import type { MiniGameConfig } from '../types';
import type { PlayerState } from '../systems/PlayerState';

/**
 * HaggleGame — timing-based negotiation minigame.
 *
 * An indicator sweeps left-to-right across a bar with 4 zones:
 *   LOWBALL (red)     — take the hit, small payout
 *   FAIR (yellow)     — normal payout
 *   GOOD (green)      — premium payout
 *   GREED (red)       — fence walks out, you get nothing
 *
 * Player presses SPACE or clicks to lock in. 3 rounds of haggling.
 * Sobriety shrinks the "GOOD" zone (drunk haggling is bad haggling).
 *
 * Launch from GameScene.launchMinigame with:
 *   scene.launch('HaggleGame', { config, playerState, parentSceneKey, items })
 * where `items` is an array of { label, basePrice }.
 *
 * Rewards/penalties are NOT applied via config.rewards; the parent scene
 * reads `playerState.state.flags.haggleEarnings` to compute final cash.
 */
export interface HaggleItem {
  label: string;
  basePrice: number;
}

export class HaggleGame extends MiniGameBase {
  private items: HaggleItem[] = [];
  private itemIdx = 0;
  private earnings = 0;

  // Indicator state
  private indicatorX = 0;
  private direction = 1;
  private speed = 280; // px/sec
  private barX = 150;
  private barY = 250;
  private barW = 500;
  private barH = 32;

  // Zones — x offsets within the bar, by order
  private zones: Array<{ x: number; w: number; color: number; label: string; payoutMult: number }> = [];

  // UI
  private bgRect!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private itemText!: Phaser.GameObjects.Text;
  private priceText!: Phaser.GameObjects.Text;
  private earningsText!: Phaser.GameObjects.Text;
  private resultText!: Phaser.GameObjects.Text;
  private instructText!: Phaser.GameObjects.Text;
  private barGfx!: Phaser.GameObjects.Graphics;

  // Input
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;

  // State
  private locked = false;
  private lockTimer = 0;

  constructor() {
    super('HaggleGame');
  }

  init(data: {
    config: MiniGameConfig;
    playerState: PlayerState;
    parentSceneKey: string;
    items: HaggleItem[];
  }): void {
    super.init(data);
    this.items = data.items;
    this.itemIdx = 0;
    this.earnings = 0;
    this.locked = false;
    this.lockTimer = 0;
    this.indicatorX = 0;
    this.direction = 1;
    this.difficulty.duration = 600; // don't auto-fail

    // Build zones — shrunk by sobriety
    this.buildZones();
  }

  private buildZones(): void {
    const sobriety = this.playerState.state.sobriety;
    // GOOD zone shrinks when drunk; GREED zone grows
    const drunkFactor = Math.max(0, (100 - sobriety) / 100);
    const goodW = this.barW * (0.12 - drunkFactor * 0.07);  // 12% sober → 5% wasted
    const greedW = this.barW * (0.15 + drunkFactor * 0.15); // 15% sober → 30% wasted

    this.zones = [
      { x: 0, w: this.barW * 0.2, color: 0xcc3333, label: 'LOWBALL', payoutMult: 0.5 },
      { x: this.barW * 0.2, w: this.barW * 0.35, color: 0xe0b040, label: 'FAIR', payoutMult: 1.0 },
      { x: this.barW * 0.2 + this.barW * 0.35, w: goodW, color: 0x44cc66, label: 'GOOD', payoutMult: 1.8 },
      { x: this.barW * 0.2 + this.barW * 0.35 + goodW, w: this.barW - (this.barW * 0.2 + this.barW * 0.35 + goodW), color: 0x882211, label: 'GREED', payoutMult: 0 },
    ];
  }

  protected onStart(): void {
    const { width, height } = this.cameras.main;

    // Darkened bg
    this.bgRect = this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a1a, 0.95)
      .setDepth(0);

    this.titleText = this.add.text(width / 2, 60, 'HAGGLE', {
      fontSize: '32px', color: '#f5c542', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.itemText = this.add.text(width / 2, 110, '', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'Georgia, serif',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.priceText = this.add.text(width / 2, 150, '', {
      fontSize: '14px', color: '#cccccc', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.earningsText = this.add.text(width - 16, 16, '', {
      fontSize: '14px', color: '#44ee77', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(10);

    this.barGfx = this.add.graphics().setDepth(5);

    this.instructText = this.add.text(width / 2, 320, 'Press SPACE or E to lock in your offer', {
      fontSize: '13px', color: '#ffff99', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0.5).setDepth(10);

    this.resultText = this.add.text(width / 2, 380, '', {
      fontSize: '22px', color: '#ffffff', fontFamily: 'Georgia, serif', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5, 0.5).setDepth(11);

    this.spaceKey = this.input.keyboard!.addKey('SPACE');
    this.eKey = this.input.keyboard!.addKey('E');
    // Clicking anywhere on the bar also locks in
    this.bgRect.setInteractive();
    this.bgRect.on('pointerdown', () => {
      if (!this.locked) this.lockIn();
    });

    this.showItem();
  }

  private showItem(): void {
    if (this.itemIdx >= this.items.length) {
      this.finish();
      return;
    }
    const item = this.items[this.itemIdx];
    this.itemText.setText(`${item.label}`);
    this.priceText.setText(`Asking: $${item.basePrice}   Round ${this.itemIdx + 1} of ${this.items.length}`);
    this.earningsText.setText(`Earnings so far: $${this.earnings}`);
    this.resultText.setText('');
    this.indicatorX = 0;
    this.direction = 1;
    this.locked = false;
  }

  protected onUpdate(dt: number): void {
    if (this.locked) {
      this.lockTimer -= dt;
      if (this.lockTimer <= 0) {
        this.itemIdx++;
        this.showItem();
      }
      this.drawBar();
      return;
    }

    // Advance indicator, bounce off ends
    this.indicatorX += this.direction * this.speed * dt;
    if (this.indicatorX >= this.barW) { this.indicatorX = this.barW; this.direction = -1; }
    if (this.indicatorX <= 0) { this.indicatorX = 0; this.direction = 1; }

    // Input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.lockIn();
    }

    this.drawBar();
  }

  private lockIn(): void {
    this.locked = true;
    this.lockTimer = 1.4;

    // Which zone?
    const zone = this.zones.find(z => this.indicatorX >= z.x && this.indicatorX <= z.x + z.w);
    const item = this.items[this.itemIdx];
    const payout = Math.round(item.basePrice * (zone?.payoutMult ?? 0));

    if (!zone || zone.payoutMult === 0) {
      this.resultText.setText(`FENCE WALKED! +$0`).setColor('#ff5555');
    } else if (zone.label === 'GOOD') {
      this.resultText.setText(`GREAT DEAL! +$${payout}`).setColor('#66ff88');
    } else if (zone.label === 'FAIR') {
      this.resultText.setText(`Fair. +$${payout}`).setColor('#ffcc66');
    } else {
      this.resultText.setText(`Lowballed. +$${payout}`).setColor('#ff9966');
    }
    this.earnings += payout;
  }

  private drawBar(): void {
    this.barGfx.clear();
    // Zone bars
    for (const z of this.zones) {
      this.barGfx.fillStyle(z.color, 0.85);
      this.barGfx.fillRect(this.barX + z.x, this.barY, z.w, this.barH);
    }
    // Zone labels
    for (const z of this.zones) {
      if (z.w > 20) {
        this.barGfx.lineStyle(1, 0x000000, 0.4);
        this.barGfx.strokeRect(this.barX + z.x, this.barY, z.w, this.barH);
      }
    }
    // Outer border
    this.barGfx.lineStyle(2, 0xffffff, 0.8);
    this.barGfx.strokeRect(this.barX, this.barY, this.barW, this.barH);
    // Indicator
    this.barGfx.fillStyle(0xffffff);
    this.barGfx.fillRect(this.barX + this.indicatorX - 2, this.barY - 6, 4, this.barH + 12);
    this.barGfx.fillStyle(0xf5c542);
    this.barGfx.fillTriangle(
      this.barX + this.indicatorX - 6, this.barY - 6,
      this.barX + this.indicatorX + 6, this.barY - 6,
      this.barX + this.indicatorX, this.barY + 2,
    );
  }

  private finish(): void {
    this.playerState.state.flags.haggleEarnings = this.earnings;
    // Success always — parent decides what the result means
    this.succeed();
  }
}
