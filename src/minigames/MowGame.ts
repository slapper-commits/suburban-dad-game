import Phaser from 'phaser';
import { MiniGameBase } from './MiniGameBase';

/**
 * MowGame — mow the lawn in straight lines.
 *
 * Top-down view. The mower auto-advances forward (upward on screen).
 * Player steers left/right with A/D or arrows. A center guide shows
 * the ideal straight line. Sobriety wobble pushes the mower off-center.
 *
 * 3 passes required. Each pass scores straightness (0-100).
 * Average straightness → mowQuality flag.
 * Low quality → crooked_mow evidence flag → BBQ comments.
 *
 * Drunk mowing is hilariously difficult. The mower drifts,
 * overcorrects, and carves abstract art into the lawn.
 */
export class MowGame extends MiniGameBase {
  // Mower state
  private mowerX = 0;
  private mowerY = 0;
  private mowerSpeed = 100;        // pixels/sec forward
  private steerSpeed = 150;        // pixels/sec lateral

  // Pass tracking
  private currentPass = 0;
  private totalPasses = 3;
  private passScores: number[] = [];
  private passDeviations: number[] = [];  // accumulated deviation for current pass
  private passFrames = 0;

  // Lane
  private laneCenter = 0;
  private laneWidth = 60;
  private passStartY = 0;
  private passEndY = 0;

  // Wobble
  private wobbleTimer = 0;
  private wobbleForce = 0;

  // Trail
  private trailGfx!: Phaser.GameObjects.Graphics;
  private mowerGfx!: Phaser.GameObjects.Graphics;

  // UI
  private straightnessBar!: Phaser.GameObjects.Rectangle;
  private straightnessFill!: Phaser.GameObjects.Rectangle;
  private passText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private instructText!: Phaser.GameObjects.Text;

  // Input
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Transition state
  private betweenPasses = false;
  private betweenTimer = 0;

  constructor() {
    super('MowGame');
  }

  protected onStart(): void {
    const { width, height } = this.cameras.main;

    // Background — top-down lawn
    this.add.rectangle(width / 2, height / 2, width, height, 0x4a8a3a);

    // Mowed area darkening
    this.trailGfx = this.add.graphics().setDepth(1);
    this.mowerGfx = this.add.graphics().setDepth(3);

    // Guide lines (faint center line for each pass)
    const guideGfx = this.add.graphics().setDepth(0);
    guideGfx.lineStyle(1, 0x3a7a2a, 0.4);
    for (let i = 0; i < this.totalPasses; i++) {
      const cx = this.getPassCenterX(i);
      guideGfx.lineBetween(cx, 50, cx, height - 50);
    }

    // HUD background strip
    this.add.rectangle(width / 2, 20, width, 40, 0x1a1a2e, 0.8).setDepth(4);

    // Pass counter
    this.passText = this.add.text(16, 8, '', {
      fontSize: '14px',
      color: '#f5c542',
      fontFamily: 'monospace',
    }).setDepth(5);

    // Straightness meter
    this.add.text(width / 2 - 80, 6, 'STRAIGHTNESS', {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setDepth(5);

    this.straightnessBar = this.add.rectangle(width / 2, 26, 160, 10, 0x333333).setDepth(5);
    this.straightnessFill = this.add.rectangle(width / 2 - 80, 26, 0, 10, 0x44cc44)
      .setOrigin(0, 0.5).setDepth(5);

    // Status text (center, for feedback)
    this.statusText = this.add.text(width / 2, height / 2, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10).setVisible(false);

    // Instructions
    this.instructText = this.add.text(width / 2, height - 20, '← A/D → to steer', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(5);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyD = this.input.keyboard!.addKey('D');

    // Calculate wobble from sobriety
    this.wobbleForce = this.difficulty.wobble * 120;

    // Start first pass
    this.startPass(0);
  }

  private getPassCenterX(pass: number): number {
    const { width } = this.cameras.main;
    const margin = 80;
    const usable = width - margin * 2;
    return margin + (usable / this.totalPasses) * (pass + 0.5);
  }

  private startPass(passIndex: number): void {
    const { height } = this.cameras.main;
    this.currentPass = passIndex;
    this.laneCenter = this.getPassCenterX(passIndex);
    this.mowerX = this.laneCenter;
    this.mowerY = height - 60;
    this.passStartY = height - 60;
    this.passEndY = 60;
    this.passDeviations = [];
    this.passFrames = 0;
    this.betweenPasses = false;
    this.updatePassText();
  }

  private updatePassText(): void {
    const scores = this.passScores.map((s, i) => `P${i + 1}:${s}`).join(' ');
    this.passText.setText(`Pass ${this.currentPass + 1}/${this.totalPasses}  ${scores}`);
  }

  protected onUpdate(dt: number): void {
    if (this.betweenPasses) {
      this.betweenTimer -= dt;
      if (this.betweenTimer <= 0) {
        this.statusText.setVisible(false);
        if (this.currentPass + 1 < this.totalPasses) {
          this.startPass(this.currentPass + 1);
        } else {
          this.finishMowing();
        }
      }
      return;
    }

    // Steering input
    let steer = 0;
    if (this.cursors.left.isDown || this.keyA.isDown) {
      steer = -this.steerSpeed;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      steer = this.steerSpeed;
    }

    // Sobriety wobble — random drift that fights the player
    this.wobbleTimer += dt;
    const wobbleDrift = Math.sin(this.wobbleTimer * 2.5) * this.wobbleForce
                      + Math.sin(this.wobbleTimer * 6.3) * this.wobbleForce * 0.3;

    // Apply movement
    this.mowerX += (steer + wobbleDrift) * dt;
    this.mowerY -= this.mowerSpeed * dt;

    // Clamp X
    const { width } = this.cameras.main;
    this.mowerX = Math.max(20, Math.min(width - 20, this.mowerX));

    // Track deviation from center
    const deviation = Math.abs(this.mowerX - this.laneCenter);
    this.passDeviations.push(deviation);
    this.passFrames++;

    // Draw mower trail (the cut grass stripe)
    const trailWidth = 24;
    this.trailGfx.fillStyle(0x5aae4a, 0.6);
    this.trailGfx.fillRect(this.mowerX - trailWidth / 2, this.mowerY, trailWidth, this.mowerSpeed * dt + 2);

    // Draw mower
    this.drawMower();

    // Update straightness meter
    const avgDev = this.passDeviations.reduce((a, b) => a + b, 0) / this.passDeviations.length;
    const straightness = Math.max(0, Math.min(100, 100 - avgDev * 3));
    this.straightnessFill.width = (straightness / 100) * 160;
    this.straightnessFill.fillColor = straightness > 60 ? 0x44cc44 : straightness > 30 ? 0xccaa44 : 0xcc4444;

    // Check if pass is complete
    if (this.mowerY <= this.passEndY) {
      this.endPass(straightness);
    }
  }

  private drawMower(): void {
    this.mowerGfx.clear();
    const mx = this.mowerX;
    const my = this.mowerY;

    // Mower body (red)
    this.mowerGfx.fillStyle(0xcc3333);
    this.mowerGfx.fillRect(mx - 10, my - 6, 20, 12);

    // Handle
    this.mowerGfx.fillStyle(0x555555);
    this.mowerGfx.fillRect(mx - 2, my + 6, 4, 12);
    this.mowerGfx.fillRect(mx - 6, my + 16, 12, 3);

    // Wheels
    this.mowerGfx.fillStyle(0x222222);
    this.mowerGfx.fillCircle(mx - 8, my + 6, 3);
    this.mowerGfx.fillCircle(mx + 8, my + 6, 3);
    this.mowerGfx.fillCircle(mx - 8, my - 6, 3);
    this.mowerGfx.fillCircle(mx + 8, my - 6, 3);

    // Grass clipping particles (fun visual)
    if (this.passFrames % 3 === 0) {
      this.mowerGfx.fillStyle(0x5aae4a, 0.7);
      const px = mx + (Math.random() - 0.5) * 30;
      const py = my - 8 + (Math.random() - 0.5) * 6;
      this.mowerGfx.fillRect(px, py, 2, 2);
    }
  }

  private endPass(straightness: number): void {
    const score = Math.round(straightness);
    this.passScores.push(score);
    this.updatePassText();

    // Feedback
    let feedback: string;
    let color: string;
    if (score >= 80) {
      feedback = 'STRAIGHT AS AN ARROW!';
      color = '#44ff44';
    } else if (score >= 60) {
      feedback = 'Pretty decent';
      color = '#aaff44';
    } else if (score >= 40) {
      feedback = 'A bit wobbly...';
      color = '#ffaa44';
    } else if (score >= 20) {
      feedback = 'Modern art?';
      color = '#ff6644';
    } else {
      feedback = 'THE LAWN IS RUINED';
      color = '#ff4444';
    }

    this.statusText.setText(feedback).setColor(color).setVisible(true);
    this.betweenPasses = true;
    this.betweenTimer = 1.5;
  }

  private finishMowing(): void {
    const avgScore = Math.round(
      this.passScores.reduce((a, b) => a + b, 0) / this.passScores.length
    );

    // Set mow quality and lawn status
    this.playerState.state.flags['mowQuality'] = avgScore;
    this.playerState.state.flags['lawnStatus'] = 100;

    // Set crooked_mow evidence if quality is bad
    if (avgScore < 50) {
      this.playerState.state.flags['crooked_mow'] = true;
    }

    // Show final result
    let finalText: string;
    if (avgScore >= 80) {
      finalText = `LAWN PERFECTION!\nScore: ${avgScore}/100\nKaren might actually smile.`;
      this.cameras.main.flash(500, 68, 170, 68);
    } else if (avgScore >= 50) {
      finalText = `Lawn's done.\nScore: ${avgScore}/100\nIt'll do. Probably.`;
    } else {
      finalText = `Oh no.\nScore: ${avgScore}/100\nThe neighbors will talk.`;
      this.cameras.main.flash(500, 170, 68, 68);
    }

    this.statusText.setText(finalText).setColor('#ffffff').setVisible(true);
    this.instructText.setVisible(false);

    // Use succeed/fail based on quality
    if (avgScore >= 40) {
      this.succeed();
    } else {
      this.fail();
    }
  }

  protected onSuccess(): void {
    // Already handled in finishMowing
  }

  protected onFailure(): void {
    // Already handled in finishMowing
  }
}
