import Phaser from 'phaser';
import { MiniGameBase } from './MiniGameBase';

/**
 * GrillGame — flip burgers at the right time.
 *
 * A burger cooks on a grill. A moving indicator sweeps back and forth.
 * Hit the action button when the indicator is in the green zone to flip.
 * Sobriety affects wobble (the indicator jitters), making timing harder.
 *
 * Success = reputation boost, wife happy
 * Failure = burned burgers, reputation hit, suspicion if you're visibly impaired
 */
export class GrillGame extends MiniGameBase {
  private indicator!: Phaser.GameObjects.Rectangle;
  private greenZone!: Phaser.GameObjects.Rectangle;
  private grillBar!: Phaser.GameObjects.Rectangle;
  private statusText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;

  private indicatorX = 0;
  private indicatorSpeed = 200;
  private indicatorDirection = 1;
  private wobbleOffset = 0;
  private wobbleTimer = 0;
  private successCount = 0;
  private requiredFlips = 3;
  private greenZoneWidth = 80;

  constructor() {
    super('GrillGame');
  }

  protected onStart(): void {
    const { width, height } = this.cameras.main;
    const barY = height * 0.6;
    const barWidth = width * 0.8;
    const barX = (width - barWidth) / 2;

    // Adjust difficulty
    this.indicatorSpeed = 150 + this.difficulty.speed * 200;
    this.greenZoneWidth = Math.max(30, 80 * (1 - this.difficulty.precision));

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d1b0e);

    // Title
    this.add.text(width / 2, 40, 'FLIP THE BURGERS', {
      fontSize: '24px',
      color: '#f5c542',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Grill bar
    this.grillBar = this.add.rectangle(
      width / 2, barY, barWidth, 20, 0x555555
    );

    // Green zone (randomize position along bar)
    const greenX = barX + Math.random() * (barWidth - this.greenZoneWidth) + this.greenZoneWidth / 2;
    this.greenZone = this.add.rectangle(
      greenX, barY, this.greenZoneWidth, 20, 0x44aa44
    );

    // Moving indicator
    this.indicatorX = barX;
    this.indicator = this.add.rectangle(
      this.indicatorX, barY, 6, 36, 0xff4444
    );

    // Status
    this.statusText = this.add.text(width / 2, barY + 60, `Flips: ${this.successCount}/${this.requiredFlips}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Timer
    this.timerText = this.add.text(width / 2, barY + 90, '', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Input — spacebar or tap
    this.input.keyboard?.on('keydown-SPACE', () => this.tryFlip());
    this.input.on('pointerdown', () => this.tryFlip());
  }

  protected onUpdate(dt: number): void {
    const { width } = this.cameras.main;
    const barWidth = width * 0.8;
    const barX = (width - barWidth) / 2;

    // Move indicator
    this.indicatorX += this.indicatorSpeed * this.indicatorDirection * dt;

    // Bounce at edges
    if (this.indicatorX >= barX + barWidth) {
      this.indicatorX = barX + barWidth;
      this.indicatorDirection = -1;
    } else if (this.indicatorX <= barX) {
      this.indicatorX = barX;
      this.indicatorDirection = 1;
    }

    // Wobble from sobriety
    this.wobbleTimer += dt;
    this.wobbleOffset = Math.sin(this.wobbleTimer * 8) * this.difficulty.wobble * 30;

    this.indicator.x = this.indicatorX + this.wobbleOffset;

    // Timer display
    const remaining = Math.max(0, this.difficulty.duration - this.elapsed);
    this.timerText.setText(`Time: ${remaining.toFixed(1)}s`);
  }

  private tryFlip(): void {
    if (this.isComplete) return;

    const effectiveX = this.indicatorX + this.wobbleOffset;
    const greenLeft = this.greenZone.x - this.greenZoneWidth / 2;
    const greenRight = this.greenZone.x + this.greenZoneWidth / 2;

    if (effectiveX >= greenLeft && effectiveX <= greenRight) {
      // Hit!
      this.successCount++;
      this.statusText.setText(`Flips: ${this.successCount}/${this.requiredFlips}`);

      // Flash green
      this.cameras.main.flash(200, 68, 170, 68);

      if (this.successCount >= this.requiredFlips) {
        this.succeed();
      } else {
        // Randomize green zone for next flip
        const { width } = this.cameras.main;
        const barWidth = width * 0.8;
        const barX = (width - barWidth) / 2;
        const newX = barX + Math.random() * (barWidth - this.greenZoneWidth) + this.greenZoneWidth / 2;
        this.greenZone.x = newX;
      }
    } else {
      // Miss — flash red
      this.cameras.main.flash(200, 170, 68, 68);
    }
  }

  protected onSuccess(): void {
    this.statusText.setText('PERFECT FLIP!');
    this.statusText.setColor('#44ff44');
  }

  protected onFailure(): void {
    this.statusText.setText('BURNED!');
    this.statusText.setColor('#ff4444');
  }
}
