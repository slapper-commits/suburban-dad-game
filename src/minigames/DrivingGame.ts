import Phaser from 'phaser';
import { MiniGameBase } from './MiniGameBase';
import type { MiniGameConfig } from '../types';
import type { PlayerState } from '../systems/PlayerState';

/**
 * DrivingGame — drive the minivan through suburban streets.
 *
 * Side-scrolling view. Van holds a fixed x; road and obstacles scroll past.
 * Player switches between 3 lanes with W/S or Up/Down. Sobriety adds a
 * wobble drift that fights lane control. Hitting an obstacle fails.
 * Reaching distance=0 succeeds. Mid-drive, if the player has visited a
 * valid pull-over point, they can press E to bail early.
 */

interface DriveDestination {
  sceneId: string;
  distance: number;
  pullOverPoints?: string[];
}

type ObstacleKind = 'trash_can' | 'other_car' | 'mailbox' | 'dog';

interface Obstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: number;
  dogDir?: number;   // vertical drift direction for dogs
  startLane?: number;
  gfx: Phaser.GameObjects.Graphics;
}

const SCROLL_SPEED = 320;  // pixels/sec road scroll (up from 220)
const LANE_Y = [230, 300, 370];
const VAN_X = 200;
const VAN_W = 50;
const VAN_H = 28;

// Ramp difficulty over time: obstacles spawn faster the longer you're driving.
const SPAWN_INTERVAL_START = 1.0;
const SPAWN_INTERVAL_MIN = 0.35;
const SPAWN_RAMP_PER_SEC = 0.04;  // subtract this much from interval every second

const CAR_COLORS = [0x3366cc, 0xcc6633, 0x66aa44, 0x992266];

export class DrivingGame extends MiniGameBase {
  private destination!: DriveDestination;

  // Van state
  private targetLane = 1;
  private vanY = LANE_Y[1];
  private vanDriftY = 0;
  private wobbleTimer = 0;

  // Distance tracking
  private distanceRemaining = 0;
  private distanceStart = 0;

  // Obstacles
  private obstacles: Obstacle[] = [];
  private spawnTimer = 0;
  private nextSpawnAt = 1.5;

  // Parallax background
  private bgGfx!: Phaser.GameObjects.Graphics;
  private bgScroll = 0;
  private bgItems: Array<{ x: number; kind: 'house' | 'tree'; color: number }> = [];

  // Road / foreground
  private roadGfx!: Phaser.GameObjects.Graphics;
  private vanGfx!: Phaser.GameObjects.Graphics;
  private obstacleLayer!: Phaser.GameObjects.Container;
  private roadLineScroll = 0;

  // HUD
  private distanceText!: Phaser.GameObjects.Text;
  private sobrietyText!: Phaser.GameObjects.Text;
  private pullOverText!: Phaser.GameObjects.Text;
  private instructText!: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyX!: Phaser.Input.Keyboard.Key;

  // In-drive vice counters (local to this drive)
  private beersDrunkDriving = 0;
  private bongHitsThisDrive = 0;
  private actionCooldown = 0;     // seconds — prevent spamming
  private actionFeedback = '';    // transient HUD text
  private actionFeedbackTimer = 0;

  // HUD for vices
  private beerText!: Phaser.GameObjects.Text;
  private bongText!: Phaser.GameObjects.Text;
  private actionFeedbackText!: Phaser.GameObjects.Text;

  private crashed = false;

  constructor() {
    super('DrivingGame');
  }

  init(data: {
    config: MiniGameConfig;
    playerState: PlayerState;
    parentSceneKey: string;
    destination: DriveDestination;
  }): void {
    super.init(data);
    this.destination = data.destination;
    this.difficulty.duration = 300; // prevent base-class timeout
    this.targetLane = 1;
    this.vanY = LANE_Y[1];
    this.vanDriftY = 0;
    this.wobbleTimer = 0;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.nextSpawnAt = 1.5;
    this.bgScroll = 0;
    this.bgItems = [];
    this.roadLineScroll = 0;
    this.crashed = false;
    this.distanceRemaining = data.destination.distance;
    this.distanceStart = data.destination.distance;
    this.beersDrunkDriving = 0;
    this.bongHitsThisDrive = 0;
    this.actionCooldown = 0;
    this.actionFeedback = '';
    this.actionFeedbackTimer = 0;
  }

  /** True when we're on the mountains run — scenery + tone evolves. */
  private get isMountainsDrive(): boolean {
    return this.config.id === 'drive_mountains';
  }

  /** 0 (start) → 1 (end). Used for scenery evolution on the mountains drive. */
  private get progress(): number {
    if (this.distanceStart <= 0) return 0;
    return Math.max(0, Math.min(1, 1 - this.distanceRemaining / this.distanceStart));
  }

  protected onStart(): void {
    const { width, height } = this.cameras.main;

    // Sky gradient (approx with 2 rects)
    this.add.rectangle(width / 2, 50, width, 100, 0x87ceeb).setDepth(0);
    this.add.rectangle(width / 2, 140, width, 80, 0xb8ddee).setDepth(0);

    // Ground (grass below road)
    this.add.rectangle(width / 2, (410 + height) / 2, width, height - 410, 0x4a8a3a).setDepth(0);

    // Parallax BG layer
    this.bgGfx = this.add.graphics().setDepth(1);
    // seed bg items
    for (let x = 0; x < width * 2; x += 80) {
      const kind = Math.random() < 0.5 ? 'house' : 'tree';
      const colors = [0xcc9966, 0x996644, 0xbb7755, 0xaa8866];
      this.bgItems.push({ x, kind, color: colors[Math.floor(Math.random() * colors.length)] });
    }

    // Road surface
    this.roadGfx = this.add.graphics().setDepth(2);
    this.drawRoad();

    // Obstacles container
    this.obstacleLayer = this.add.container(0, 0).setDepth(3);

    // Van graphics
    this.vanGfx = this.add.graphics().setDepth(4);

    // HUD
    this.distanceText = this.add.text(12, 6, '', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);

    this.sobrietyText = this.add.text(width - 12, 6, '', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(10);

    this.pullOverText = this.add.text(width / 2, height - 30, '', {
      fontSize: '14px', color: '#f5c542', fontFamily: 'monospace',
      backgroundColor: '#000000cc', padding: { x: 10, y: 4 },
    }).setOrigin(0.5).setDepth(10).setVisible(false);

    const hasBeer = (this.playerState.state.flags.has30Rack === true);
    const hasWeed = (this.playerState.state.flags.foundWeed === true);
    const instructParts = ['W/S or ↑/↓ lanes'];
    if (hasBeer) instructParts.push('Q: crack a beer');
    if (hasWeed) instructParts.push('X: rip bong');
    this.instructText = this.add.text(width / 2, 30, instructParts.join('    '), {
      fontSize: '11px', color: '#ffffcc', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey('W');
    this.keyS = this.input.keyboard!.addKey('S');
    this.keyE = this.input.keyboard!.addKey('E');
    this.keyQ = this.input.keyboard!.addKey('Q');
    this.keyX = this.input.keyboard!.addKey('X');

    // Vice HUD (beer count, bong hits)
    this.beerText = this.add.text(12, 26, '', {
      fontSize: '12px', color: '#f0d020', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);
    this.bongText = this.add.text(12, 44, '', {
      fontSize: '12px', color: '#66cc66', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 3,
    }).setDepth(10);
    this.actionFeedbackText = this.add.text(width / 2, height / 2 - 40, '', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(11);

    this.drawVan();
  }

  private drawRoad(): void {
    const { width } = this.cameras.main;
    this.roadGfx.clear();
    // Asphalt
    this.roadGfx.fillStyle(0x3a3a3a);
    this.roadGfx.fillRect(0, 190, width, 220);
    // Edge lines
    this.roadGfx.fillStyle(0xffffff);
    this.roadGfx.fillRect(0, 192, width, 2);
    this.roadGfx.fillRect(0, 408, width, 2);

    // Dashed center lines between lanes — animated scroll
    const dashLen = 28;
    const gap = 22;
    const stride = dashLen + gap;
    const offset = this.roadLineScroll % stride;
    for (const cy of [265, 335]) {
      for (let x = -offset; x < width + stride; x += stride) {
        this.roadGfx.fillStyle(0xffffcc);
        this.roadGfx.fillRect(x, cy - 1, dashLen, 2);
      }
    }
  }

  private drawVan(): void {
    this.vanGfx.clear();
    const x = VAN_X;
    const y = this.vanY;

    // Shadow
    this.vanGfx.fillStyle(0x000000, 0.25);
    this.vanGfx.fillEllipse(x, y + VAN_H / 2 + 3, VAN_W + 6, 6);

    // Body (dark red rounded)
    this.vanGfx.fillStyle(0x8a2a2a);
    this.vanGfx.fillRoundedRect(x - VAN_W / 2, y - VAN_H / 2, VAN_W, VAN_H, 6);

    // Windshield (lighter gray on left side, angled front)
    this.vanGfx.fillStyle(0xaac6dd);
    this.vanGfx.fillRect(x - VAN_W / 2 + 6, y - VAN_H / 2 + 4, 14, 10);

    // Side window
    this.vanGfx.fillStyle(0x88aabb);
    this.vanGfx.fillRect(x - VAN_W / 2 + 22, y - VAN_H / 2 + 4, 16, 10);

    // Wheels
    this.vanGfx.fillStyle(0x111111);
    this.vanGfx.fillCircle(x - VAN_W / 2 + 10, y + VAN_H / 2 - 1, 5);
    this.vanGfx.fillCircle(x + VAN_W / 2 - 10, y + VAN_H / 2 - 1, 5);
  }

  private drawBackground(dt: number): void {
    const { width } = this.cameras.main;
    this.bgScroll += SCROLL_SPEED * 0.3 * dt;

    // Mountains drive: scenery evolves suburb → rural → peaks
    if (this.isMountainsDrive) {
      this.drawMountainsBackground(dt);
      return;
    }

    this.bgGfx.clear();
    for (const item of this.bgItems) {
      let sx = item.x - this.bgScroll;
      // wrap
      while (sx < -100) sx += this.bgItems.length * 80;
      while (sx > width + 100) sx -= this.bgItems.length * 80;
      if (sx < -100 || sx > width + 100) continue;

      if (item.kind === 'house') {
        // body
        this.bgGfx.fillStyle(item.color);
        this.bgGfx.fillRect(sx, 110, 60, 70);
        // roof triangle
        this.bgGfx.fillStyle(0x663322);
        this.bgGfx.fillTriangle(sx - 4, 110, sx + 64, 110, sx + 30, 80);
        // window
        this.bgGfx.fillStyle(0xffeebb);
        this.bgGfx.fillRect(sx + 20, 135, 20, 18);
      } else {
        // trunk
        this.bgGfx.fillStyle(0x5a3a1a);
        this.bgGfx.fillRect(sx + 20, 140, 8, 40);
        // foliage
        this.bgGfx.fillStyle(0x3a7a2a);
        this.bgGfx.fillCircle(sx + 24, 130, 22);
      }
    }
  }

  /** Mountains-drive background: evolves from suburbs → rural → mountain peaks as progress grows. */
  private drawMountainsBackground(_dt: number): void {
    const { width } = this.cameras.main;
    this.bgGfx.clear();
    const p = this.progress;   // 0 → 1

    // Sky tint — fades cooler/more alpine as you climb
    const skyTop = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x87ceeb),   // suburb blue
      Phaser.Display.Color.ValueToColor(0x5a8bb8),   // alpine blue
      100, Math.floor(p * 100),
    );
    this.bgGfx.fillStyle(
      (Math.round(skyTop.r) << 16) | (Math.round(skyTop.g) << 8) | Math.round(skyTop.b),
    );
    this.bgGfx.fillRect(0, 0, width, 80);

    // Distant mountain layer — slides in as p increases
    if (p > 0.15) {
      const layerAlpha = Math.min(1, (p - 0.15) / 0.4);
      this.bgGfx.fillStyle(0x6a7a8a, layerAlpha);
      this.bgGfx.fillTriangle(-50, 150, 120, 40, 260, 150);
      this.bgGfx.fillTriangle(200, 150, 380, 30, 540, 150);
      this.bgGfx.fillTriangle(470, 150, 640, 60, 800, 150);
      // Snow caps when deep in the drive
      if (p > 0.5) {
        const snowA = Math.min(1, (p - 0.5) / 0.3);
        this.bgGfx.fillStyle(0xffffff, snowA * 0.8);
        this.bgGfx.fillTriangle(105, 55, 120, 40, 135, 55);
        this.bgGfx.fillTriangle(365, 45, 380, 30, 395, 45);
        this.bgGfx.fillTriangle(625, 75, 640, 60, 655, 75);
      }
    }

    // Closer ridgeline (darker, bigger)
    if (p > 0.35) {
      const ridgeA = Math.min(1, (p - 0.35) / 0.4);
      this.bgGfx.fillStyle(0x3a5a4a, ridgeA);
      this.bgGfx.fillTriangle(-60, 180, 90, 90, 240, 180);
      this.bgGfx.fillTriangle(220, 180, 380, 70, 540, 180);
      this.bgGfx.fillTriangle(500, 180, 660, 95, 820, 180);
    }

    // Foreground props — houses fade out, trees fade in as you leave the burbs
    const houseOpacity = Math.max(0, 1 - p * 2);      // gone by p=0.5
    const treeOpacity  = Math.min(1, p * 1.8);         // full by p≈0.55

    for (const item of this.bgItems) {
      let sx = item.x - this.bgScroll;
      while (sx < -100) sx += this.bgItems.length * 80;
      while (sx > width + 100) sx -= this.bgItems.length * 80;
      if (sx < -100 || sx > width + 100) continue;

      if (item.kind === 'house') {
        if (houseOpacity <= 0.02) continue;
        this.bgGfx.fillStyle(item.color, houseOpacity);
        this.bgGfx.fillRect(sx, 110, 60, 70);
        this.bgGfx.fillStyle(0x663322, houseOpacity);
        this.bgGfx.fillTriangle(sx - 4, 110, sx + 64, 110, sx + 30, 80);
        this.bgGfx.fillStyle(0xffeebb, houseOpacity);
        this.bgGfx.fillRect(sx + 20, 135, 20, 18);
      } else {
        // Trees dominate as we leave town
        const alpha = Math.max(treeOpacity, 0.6);
        this.bgGfx.fillStyle(0x5a3a1a, alpha);
        this.bgGfx.fillRect(sx + 20, 140, 8, 40);
        // Pine tree shape gets more pronounced near the mountains
        if (p > 0.5) {
          this.bgGfx.fillStyle(0x2a5a2a, alpha);
          this.bgGfx.fillTriangle(sx + 8, 145, sx + 40, 145, sx + 24, 100);
          this.bgGfx.fillTriangle(sx + 10, 130, sx + 38, 130, sx + 24, 90);
        } else {
          this.bgGfx.fillStyle(0x3a7a2a, alpha);
          this.bgGfx.fillCircle(sx + 24, 130, 22);
        }
      }
    }

    // "WELCOME TO THE MOUNTAINS" sign appears around p=0.85
    if (p > 0.82 && p < 0.95) {
      const signX = 700 - (p - 0.82) * 4000; // scrolls left fast
      if (signX > -100 && signX < width + 100) {
        this.bgGfx.fillStyle(0x5a4a2a);
        this.bgGfx.fillRect(signX, 90, 180, 44);
        this.bgGfx.fillStyle(0x8a6a3a);
        this.bgGfx.fillRect(signX + 4, 94, 172, 36);
        this.bgGfx.fillStyle(0x3a3a1a);
        this.bgGfx.fillRect(signX + 80, 130, 4, 30);
      }
    }
  }

  private spawnObstacle(): void {
    const { width } = this.cameras.main;
    const kinds: ObstacleKind[] = ['trash_can', 'other_car', 'mailbox', 'dog'];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const lane = Math.floor(Math.random() * 3);

    const gfx = this.add.graphics();
    this.obstacleLayer.add(gfx);

    const ob: Obstacle = {
      kind,
      x: width + 40,
      y: LANE_Y[lane],
      w: 20, h: 30,
      gfx,
    };

    switch (kind) {
      case 'trash_can':
        ob.w = 20; ob.h = 30;
        break;
      case 'other_car':
        ob.w = 45; ob.h = 24;
        ob.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
        break;
      case 'mailbox':
        ob.w = 12; ob.h = 20;
        break;
      case 'dog':
        ob.w = 24; ob.h = 14;
        ob.dogDir = Math.random() < 0.5 ? -1 : 1;
        ob.startLane = lane;
        break;
    }

    this.drawObstacle(ob);
    this.obstacles.push(ob);
  }

  private drawObstacle(ob: Obstacle): void {
    ob.gfx.clear();
    // shadow
    ob.gfx.fillStyle(0x000000, 0.2);
    ob.gfx.fillEllipse(ob.x, ob.y + ob.h / 2 + 2, ob.w + 4, 4);

    switch (ob.kind) {
      case 'trash_can':
        ob.gfx.fillStyle(0x777777);
        ob.gfx.fillRect(ob.x - ob.w / 2, ob.y - ob.h / 2, ob.w, ob.h);
        ob.gfx.fillStyle(0x555555);
        ob.gfx.fillRect(ob.x - ob.w / 2, ob.y - ob.h / 2, ob.w, 3);
        break;
      case 'other_car': {
        ob.gfx.fillStyle(ob.color ?? 0x3366cc);
        ob.gfx.fillRoundedRect(ob.x - ob.w / 2, ob.y - ob.h / 2, ob.w, ob.h, 4);
        // windshield
        ob.gfx.fillStyle(0xaac6dd);
        ob.gfx.fillRect(ob.x - ob.w / 2 + 8, ob.y - ob.h / 2 + 4, 12, 8);
        // wheels
        ob.gfx.fillStyle(0x111111);
        ob.gfx.fillCircle(ob.x - ob.w / 2 + 9, ob.y + ob.h / 2 - 1, 4);
        ob.gfx.fillCircle(ob.x + ob.w / 2 - 9, ob.y + ob.h / 2 - 1, 4);
        break;
      }
      case 'mailbox':
        // post
        ob.gfx.fillStyle(0x6a4a2a);
        ob.gfx.fillRect(ob.x - 2, ob.y - ob.h / 2 + 10, 4, ob.h - 10);
        // box
        ob.gfx.fillStyle(0x3366aa);
        ob.gfx.fillRect(ob.x - ob.w / 2, ob.y - ob.h / 2, ob.w, 12);
        break;
      case 'dog':
        ob.gfx.fillStyle(0x8a5a2a);
        ob.gfx.fillEllipse(ob.x, ob.y, ob.w, ob.h);
        // head
        ob.gfx.fillCircle(ob.x + ob.w / 2 - 2, ob.y - 2, 5);
        // tail
        ob.gfx.fillRect(ob.x - ob.w / 2 - 3, ob.y - 1, 4, 2);
        break;
    }
  }

  protected onUpdate(dt: number): void {
    if (this.crashed) return;

    // Lane input (edge-detect via JustDown)
    if (Phaser.Input.Keyboard.JustDown(this.keyW) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.targetLane = Math.max(0, this.targetLane - 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyS) ||
        Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.targetLane = Math.min(2, this.targetLane + 1);
    }

    // In-drive beer & bong actions
    this.actionCooldown = Math.max(0, this.actionCooldown - dt);
    this.actionFeedbackTimer = Math.max(0, this.actionFeedbackTimer - dt);
    if (this.actionFeedbackTimer === 0) this.actionFeedback = '';

    const hasBeer = this.playerState.state.flags.has30Rack === true;
    const beersRemaining = (this.playerState.state.flags.beersRemaining as number) ?? 0;
    if (hasBeer && beersRemaining > 0 && this.actionCooldown <= 0 &&
        Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      this.beersDrunkDriving++;
      this.playerState.state.flags.beersRemaining = beersRemaining - 1;
      // Each beer: -8 sobriety, +1 alcohol vice every 3 beers
      this.playerState.applyEffect({ type: 'add', field: 'sobriety', value: -8 });
      if (this.beersDrunkDriving % 3 === 0) {
        this.playerState.applyEffect({ type: 'add', field: 'vices.alcohol', value: 1 });
      }
      this.playerState.state.flags.smell = true;
      this.actionCooldown = 1.2;
      this.actionFeedback = '*CRACK* *HISS*  Beer #' + this.beersDrunkDriving;
      this.actionFeedbackTimer = 1.2;
    }

    const hasWeed = this.playerState.state.flags.foundWeed === true;
    if (hasWeed && this.actionCooldown <= 0 &&
        Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.bongHitsThisDrive++;
      // Each hit: -15 sobriety, +1 drugs vice on first hit
      this.playerState.applyEffect({ type: 'add', field: 'sobriety', value: -15 });
      if (this.bongHitsThisDrive === 1) {
        this.playerState.applyEffect({ type: 'add', field: 'vices.drugs', value: 1 });
      }
      this.playerState.state.flags.smell = true;
      this.playerState.state.flags.dilated_pupils = true;
      this.playerState.state.flags.weedSmoked = true;
      this.actionCooldown = 1.5;
      this.actionFeedback = '*bubble bubble*  *cough*';
      this.actionFeedbackTimer = 1.5;
    }

    // Lerp toward target lane Y (~200ms)
    const targetY = LANE_Y[this.targetLane];
    const lerpAmt = 1 - Math.pow(0.005, dt); // ~200ms time constant
    const baseY = this.vanY + (targetY - this.vanY) * lerpAmt;

    // Sobriety wobble (copied from MowGame pattern)
    this.wobbleTimer += dt;
    const sobriety = this.playerState.state.sobriety;
    const wobbleForce = Math.max(0, (50 - sobriety) / 50) * 80;
    const wobbleDrift = Math.sin(this.wobbleTimer * 2.5) * wobbleForce
                      + Math.sin(this.wobbleTimer * 6.3) * wobbleForce * 0.3;
    this.vanDriftY += wobbleDrift * dt * 0.1;
    this.vanDriftY *= Math.pow(0.3, dt);

    this.vanY = baseY;
    const finalY = baseY + this.vanDriftY;

    // Clamp final Y to road
    const displayY = Math.max(215, Math.min(395, finalY));

    // Draw van at displayY (temporarily override)
    const savedY = this.vanY;
    this.vanY = displayY;
    this.drawVan();
    this.vanY = savedY;

    // Scroll background and road lines
    this.drawBackground(dt);
    this.roadLineScroll += SCROLL_SPEED * dt;
    this.drawRoad();

    // Spawn obstacles (interval shrinks as drive goes longer → ramping difficulty)
    this.spawnTimer += dt;
    const elapsed = (this.distanceStart - this.distanceRemaining) / SCROLL_SPEED / 0.1;
    const currentInterval = Math.max(
      SPAWN_INTERVAL_MIN,
      SPAWN_INTERVAL_START - elapsed * SPAWN_RAMP_PER_SEC,
    );
    if (this.spawnTimer >= this.nextSpawnAt) {
      this.spawnObstacle();
      // Occasionally spawn a second obstacle in a different lane at the same time
      if (Math.random() < 0.35 && elapsed > 3) {
        this.spawnObstacle();
      }
      this.spawnTimer = 0;
      this.nextSpawnAt = currentInterval + Math.random() * 0.4;
    }

    // Move obstacles & check collisions
    const vanBox = {
      x: VAN_X - VAN_W / 2, y: displayY - VAN_H / 2,
      w: VAN_W, h: VAN_H,
    };

    const survivors: Obstacle[] = [];
    for (const ob of this.obstacles) {
      ob.x -= SCROLL_SPEED * dt;

      // Dog crosses lanes vertically
      if (ob.kind === 'dog' && ob.dogDir) {
        ob.y += ob.dogDir * 40 * dt;
        if (ob.y < LANE_Y[0] - 10 || ob.y > LANE_Y[2] + 10) {
          ob.dogDir *= -1;
        }
      }

      this.drawObstacle(ob);

      // AABB collision
      const obBox = { x: ob.x - ob.w / 2, y: ob.y - ob.h / 2, w: ob.w, h: ob.h };
      if (vanBox.x < obBox.x + obBox.w &&
          vanBox.x + vanBox.w > obBox.x &&
          vanBox.y < obBox.y + obBox.h &&
          vanBox.y + vanBox.h > obBox.y) {
        this.crashed = true;
        this.fail();
        return;
      }

      if (ob.x < -50) {
        ob.gfx.destroy();
      } else {
        survivors.push(ob);
      }
    }
    this.obstacles = survivors;

    // Distance tick-down
    this.distanceRemaining -= SCROLL_SPEED * dt * 0.1;
    if (this.distanceRemaining <= 0) {
      this.distanceRemaining = 0;
      this.succeed();
      return;
    }

    // HUD updates
    this.distanceText.setText(`Distance: ${Math.ceil(this.distanceRemaining)}m`);
    this.sobrietyText.setText(`Sobriety: ${Math.round(sobriety)}`);
    const hasBeerHud = this.playerState.state.flags.has30Rack === true;
    if (hasBeerHud) {
      const left = (this.playerState.state.flags.beersRemaining as number) ?? 0;
      this.beerText.setText(`🍺 ${this.beersDrunkDriving} drunk  (${left} left in case)`);
    } else {
      this.beerText.setText('');
    }
    const hasWeedHud = this.playerState.state.flags.foundWeed === true;
    this.bongText.setText(hasWeedHud && this.bongHitsThisDrive > 0
      ? `🌿 ${this.bongHitsThisDrive} hit${this.bongHitsThisDrive === 1 ? '' : 's'}`
      : '');
    this.actionFeedbackText.setText(this.actionFeedback);

    // Pull-over prompt
    const canPullOver = this.getAvailablePullOver();
    if (canPullOver &&
        this.distanceRemaining < this.distanceStart * 0.6) {
      this.pullOverText.setText(`E: Pull Over at ${this.prettyName(canPullOver)}`).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.playerState.state.flags.pulledOverAt = canPullOver;
        this.succeed();
        return;
      }
    } else {
      this.pullOverText.setVisible(false);
    }
  }

  private getAvailablePullOver(): string | null {
    const points = this.destination.pullOverPoints;
    if (!points || points.length === 0) return null;
    const visited = this.playerState.state.visitedScenes;
    for (const p of points) {
      if (visited.includes(p)) return p;
    }
    return null;
  }

  private prettyName(sceneId: string): string {
    const map: Record<string, string> = {
      quikstop: 'Quik Stop',
      gas_station: 'Gas Station',
      strip_mall: 'Strip Mall',
      sketchy: 'Sketchy End',
      sidewalk: 'Sidewalk',
    };
    return map[sceneId] ?? sceneId;
  }

  protected onFailure(): void {
    this.cameras.main.flash(300, 200, 40, 40);
    this.cameras.main.shake(400, 0.02);
    const { width, height } = this.cameras.main;
    this.add.text(width / 2, height / 2, 'CRASH!', {
      fontSize: '48px', color: '#ff3333', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(100);
  }

  protected onSuccess(): void {
    const { width, height } = this.cameras.main;
    const msg = this.playerState.state.flags.pulledOverAt ? 'PULLED OVER' : 'ARRIVED';
    this.add.text(width / 2, height / 2, msg, {
      fontSize: '36px', color: '#44ff44', fontFamily: 'monospace',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(100);
  }
}
