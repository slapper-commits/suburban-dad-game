import Phaser from 'phaser';
import { drawCharacter, drawTinyPerson } from './CharacterRenderer';
import type { CharacterConfig } from './CharacterRenderer';
import { getNpcConfig } from '../data/npc-registry';
import type { DadState } from '../types';

const GROUND_Y = 337;
const SCREEN_W = 800;
const SCREEN_H = 450;

// ============================================================
// Shared helpers — the scene component toolkit
// ============================================================

export function drawSky(gfx: Phaser.GameObjects.Graphics, time: number): void {
  let topColor: number;
  let bottomColor: number;

  if (time < 780) {
    topColor = 0x87ceeb;
    bottomColor = 0xa8d8ea;
  } else if (time < 960) {
    topColor = 0x6a9aca;
    bottomColor = 0xc8a870;
  } else if (time < 1020) {
    topColor = 0x5a7aaa;
    bottomColor = 0xf0c040;
  } else if (time < 1140) {
    topColor = 0x2d3a6a;
    bottomColor = 0xf0a040;
  } else {
    topColor = 0x1a1a3a;
    bottomColor = 0x4a2040;
  }

  gfx.fillGradientStyle(topColor, topColor, bottomColor, bottomColor);
  gfx.fillRect(0, 0, SCREEN_W, 300);
}

export function drawSun(gfx: Phaser.GameObjects.Graphics, time: number): void {
  const t = (time - 420) / (1200 - 420);
  const x = 80 + (720 - 80) * t;
  const y = 250 - 200 * Math.sin(t * Math.PI);

  gfx.fillStyle(0xf0e060);
  gfx.fillCircle(x, y, 15);

  const rayLen = 8;
  gfx.lineStyle(2, 0xf0e060);
  gfx.lineBetween(x, y - 15 - rayLen, x, y - 15);
  gfx.lineBetween(x, y + 15, x, y + 15 + rayLen);
  gfx.lineBetween(x - 15 - rayLen, y, x - 15, y);
  gfx.lineBetween(x + 15, y, x + 15 + rayLen, y);
}

export function drawClouds(gfx: Phaser.GameObjects.Graphics): void {
  gfx.fillStyle(0xffffff, 0.4);
  gfx.fillEllipse(200, 80, 90, 30);
  gfx.fillEllipse(450, 55, 110, 35);
  gfx.fillEllipse(650, 100, 80, 25);
}

export function drawGround(gfx: Phaser.GameObjects.Graphics, color: number): void {
  gfx.fillStyle(color);
  gfx.fillRect(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y);

  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const darker = ((Math.max(0, r - 30) << 16) | (Math.max(0, g - 30) << 8) | Math.max(0, b - 30));
  gfx.fillStyle(darker);
  gfx.fillRect(0, GROUND_Y, SCREEN_W, 3);
}

/**
 * Draw a full outdoor scene base: sky + sun + clouds + ground.
 * Most outdoor scenes call this as their first line.
 */
export function drawOutdoorBase(gfx: Phaser.GameObjects.Graphics, time: number, groundColor: number): void {
  drawSky(gfx, time);
  drawSun(gfx, time);
  drawClouds(gfx);
  drawGround(gfx, groundColor);
}

/**
 * Draw a suburban-dad minivan centered at (x, groundY).
 * ~70×26 body + wheels below. Dark red by default.
 */
export function drawMinivan(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  groundY: number,
  options?: { color?: number },
): void {
  const color = options?.color ?? 0x8a2a2a;  // dark red, Karen approved
  const W = 70, H = 26;
  const cx = x;
  const topY = groundY - H - 4;  // room for wheels below

  // Shadow
  gfx.fillStyle(0x000000, 0.25);
  gfx.fillEllipse(cx, groundY + 2, W + 10, 6);

  // Body
  gfx.fillStyle(color);
  gfx.fillRoundedRect(cx - W / 2, topY, W, H, 6);

  // Roof stripe (slightly darker)
  gfx.fillStyle(Math.max(0, color - 0x111111));
  gfx.fillRect(cx - W / 2 + 4, topY, W - 8, 4);

  // Windshield (front, right side)
  gfx.fillStyle(0xaac6dd);
  gfx.fillRect(cx + 10, topY + 5, 16, 10);
  // Side window
  gfx.fillStyle(0x88aabb);
  gfx.fillRect(cx - 20, topY + 5, 24, 10);
  // Window divider
  gfx.lineStyle(1, 0x222222);
  gfx.lineBetween(cx + 6, topY + 5, cx + 6, topY + 15);

  // Chrome trim line
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(cx - W / 2 + 4, topY + H - 6, W - 8, 1);

  // Bumper sticker (suburban-dad meme fuel — yellow)
  gfx.fillStyle(0xffde4a);
  gfx.fillRect(cx - W / 2 + 6, topY + H - 4, 14, 3);

  // Headlight hint (right side = front)
  gfx.fillStyle(0xffe08a);
  gfx.fillRect(cx + W / 2 - 3, topY + H - 10, 3, 4);
  // Taillight hint (left side = rear)
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(cx - W / 2, topY + H - 10, 3, 4);

  // Wheels
  gfx.fillStyle(0x111111);
  gfx.fillCircle(cx - W / 2 + 12, groundY - 2, 5);
  gfx.fillCircle(cx + W / 2 - 12, groundY - 2, 5);
  // Hubcaps
  gfx.fillStyle(0x888888);
  gfx.fillCircle(cx - W / 2 + 12, groundY - 2, 2);
  gfx.fillCircle(cx + W / 2 - 12, groundY - 2, 2);
}

/**
 * Module-level animation time (seconds). Set by GameScene before each frame's redraw
 * so drawNpc can inject it into every character without per-callsite changes.
 */
let _sceneAnimTime = 0;
export function setSceneAnimTime(seconds: number): void {
  _sceneAnimTime = seconds;
}

/**
 * Draw an NPC from the registry at the given position.
 * Usage: drawNpc(gfx, 'doug', 335, GROUND_Y)
 *
 * Reads the module-level animTime so the NPC idle-animates:
 * breathing, blinks, subtle arm sway. A stable `animSeed` is derived
 * from the NPC id so their animations don't all sync up.
 */
export function drawNpc(
  gfx: Phaser.GameObjects.Graphics,
  npcId: string,
  x: number,
  y: number,
  overrides?: Partial<CharacterConfig>,
): void {
  const config = getNpcConfig(npcId, overrides);
  // Stable 0-1 seed per NPC id so their blinks/breaths don't sync up
  let h = 0;
  for (let i = 0; i < npcId.length; i++) h = (h * 31 + npcId.charCodeAt(i)) & 0xffff;
  const seed = (h % 1000) / 1000;
  drawCharacter(gfx, {
    x, y,
    animTime: _sceneAnimTime,
    animSeed: seed,
    ...config,
  } as CharacterConfig);
}

// ============================================================
// Vice color overlay
// ============================================================

const VICE_COLORS: Record<string, number> = {
  drugs: 0x9b6b9b,
  alcohol: 0xd4a54a,
  gambling: 0x4a8a3a,
  prostitution: 0xcc5588,
  guns: 0x4a5a6a,
  pyramid: 0x22aa55,
  racing: 0xe08030,
  theft: 0x2a6a6a,
  digital: 0x22aacc,
};

export function drawViceOverlay(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  let maxVice = '';
  let maxDepth = 0;
  for (const [vice, depth] of Object.entries(state.vices)) {
    if (depth > maxDepth) { maxDepth = depth; maxVice = vice; }
  }
  if (maxDepth < 2 || !VICE_COLORS[maxVice]) return;
  const alpha = maxDepth >= 3 ? 0.12 : 0.06;
  gfx.fillStyle(VICE_COLORS[maxVice], alpha);
  gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

// ============================================================
// Intoxication overlay
// ============================================================

export function drawIntoxOverlay(gfx: Phaser.GameObjects.Graphics, sobriety: number): void {
  if (sobriety >= 80) return;

  let color: number;
  let alpha: number;

  if (sobriety < 20) {
    color = 0x9b6b9b;
    alpha = 0.3;
  } else if (sobriety < 40) {
    color = 0x9b6b9b;
    alpha = 0.2;
  } else if (sobriety < 60) {
    color = 0xd4a54a;
    alpha = 0.15;
  } else {
    color = 0xd4a54a;
    alpha = 0.08;
  }

  gfx.fillStyle(color, alpha);
  gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);
}

// ============================================================
// Interior + Mood primitives (reusable across dark scenes)
// ============================================================

/**
 * Draw a dark interior base — walls + floor + subtle radial vignette.
 * Used for strip club, trap house, motel, etc.
 */
export function drawDimInterior(
  gfx: Phaser.GameObjects.Graphics,
  palette: { wall: number; floor: number; floorLine?: number; vignetteAlpha?: number },
): void {
  const { wall, floor, floorLine = 0x000000, vignetteAlpha = 0.4 } = palette;

  // Walls
  gfx.fillStyle(wall);
  gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Floor (lower ~25%)
  gfx.fillStyle(floor);
  gfx.fillRect(0, SCREEN_H - 100, SCREEN_W, 100);
  // Floor trim line
  gfx.lineStyle(1, floorLine, 0.6);
  gfx.lineBetween(0, SCREEN_H - 100, SCREEN_W, SCREEN_H - 100);

  // Radial vignette — subtle darkening at edges
  gfx.fillStyle(0x000000, vignetteAlpha * 0.6);
  gfx.fillRect(0, 0, 60, SCREEN_H);
  gfx.fillRect(SCREEN_W - 60, 0, 60, SCREEN_H);
  gfx.fillStyle(0x000000, vignetteAlpha * 0.4);
  gfx.fillRect(0, 0, SCREEN_W, 40);
  gfx.fillRect(0, SCREEN_H - 30, SCREEN_W, 30);
}

/** Soft colored light halo — neon, lamp, bar light. */
export function drawMoodLight(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number,
  radius: number,
): void {
  gfx.fillStyle(color, 0.4);
  gfx.fillCircle(x, y, radius * 0.7);
  gfx.fillStyle(color, 0.18);
  gfx.fillCircle(x, y, radius);
  gfx.fillStyle(color, 0.08);
  gfx.fillCircle(x, y, radius * 1.5);
}

/** Couch. Anchored at bottom-center of its footprint. */
export function drawCouch(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number = 0x6a4a3a,
): void {
  const w = 100, h = 40;
  // Shadow
  gfx.fillStyle(0x000000, 0.35);
  gfx.fillEllipse(x, y + 3, w + 14, 6);
  // Base
  gfx.fillStyle(color);
  gfx.fillRect(x - w / 2, y - h, w, h);
  // Backrest
  gfx.fillStyle(color);
  gfx.fillRect(x - w / 2, y - h - 18, w, 18);
  // Cushion seams
  gfx.lineStyle(1, 0x000000, 0.3);
  gfx.lineBetween(x - w / 4, y - h, x - w / 4, y - 4);
  gfx.lineBetween(x + w / 4, y - h, x + w / 4, y - 4);
  // Arm rests
  gfx.fillStyle(color);
  gfx.fillRect(x - w / 2 - 6, y - h - 4, 8, h + 4);
  gfx.fillRect(x + w / 2 - 2, y - h - 4, 8, h + 4);
}

/** Bed. For motel scene. */
export function drawBed(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  options?: { rumpled?: boolean },
): void {
  const w = 140, h = 50;
  // Shadow
  gfx.fillStyle(0x000000, 0.3);
  gfx.fillEllipse(x, y + 3, w + 10, 6);
  // Frame
  gfx.fillStyle(0x4a3a2a);
  gfx.fillRect(x - w / 2, y - h, w, h);
  // Mattress
  gfx.fillStyle(0xe8d8c0);
  gfx.fillRect(x - w / 2 + 4, y - h + 4, w - 8, h - 10);
  // Headboard
  gfx.fillStyle(0x6a4a3a);
  gfx.fillRect(x - w / 2 - 4, y - h - 16, w + 8, 18);
  // Pillows
  gfx.fillStyle(0xffffff);
  gfx.fillRect(x - w / 2 + 10, y - h + 6, 28, 14);
  gfx.fillRect(x - w / 2 + 44, y - h + 6, 28, 14);
  // Rumpled sheet
  if (options?.rumpled) {
    gfx.fillStyle(0xc8b8a0);
    gfx.fillRect(x, y - h + 22, 50, 14);
    gfx.lineStyle(0.5, 0x000000, 0.3);
    gfx.lineBetween(x + 10, y - h + 25, x + 40, y - h + 30);
  }
}

/** Bar counter with a dark wood front. */
export function drawBarCounter(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number = 200,
): void {
  const h = 60;
  gfx.fillStyle(0x3a2a1a);
  gfx.fillRect(x - w / 2, y - h, w, h);
  gfx.fillStyle(0x5a4a2a);
  gfx.fillRect(x - w / 2, y - h, w, 6);
  // Bottles behind
  const bottleColors = [0x88aa66, 0xaa6633, 0x336699, 0x884488];
  for (let i = 0; i < 6; i++) {
    gfx.fillStyle(bottleColors[i % bottleColors.length]);
    gfx.fillRect(x - w / 2 + 12 + i * (w - 24) / 6, y - h - 26, 8, 22);
  }
}

/** Raised stage with front light spill. */
export function drawStage(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number = 180,
): void {
  // Stage platform
  gfx.fillStyle(0x2a1a2a);
  gfx.fillRect(x - w / 2, y - 8, w, 8);
  gfx.fillStyle(0x3a2a3a);
  gfx.fillRect(x - w / 2, y - 10, w, 2);
  // Front light spill
  gfx.fillStyle(0xffb8d8, 0.18);
  gfx.fillTriangle(x - w / 2, y, x + w / 2, y, x, y + 100);
}

/** Stripper pole vertical from stage. */
export function drawStripperPole(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  h: number = 180,
): void {
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(x - 2, y - h, 4, h);
  // Highlight
  gfx.fillStyle(0xffffff, 0.6);
  gfx.fillRect(x - 1, y - h, 1, h);
}

/** Lay down N silhouette people around a base point. */
export function drawCrowdSilhouettes(
  gfx: Phaser.GameObjects.Graphics,
  baseX: number,
  baseY: number,
  count: number,
  spread: number = 120,
): void {
  // Simple deterministic distribution so it looks the same frame-to-frame
  for (let i = 0; i < count; i++) {
    const fx = (i / Math.max(1, count - 1)) - 0.5;
    const x = baseX + fx * spread + Math.sin(i * 12.3) * 12;
    const y = baseY + Math.cos(i * 7.7) * 4;
    const color = [0x222222, 0x333333, 0x2a2a2a, 0x3a2a3a][i % 4];
    // Head
    gfx.fillStyle(color);
    gfx.fillCircle(x, y - 24, 4);
    // Body
    gfx.fillRect(x - 5, y - 20, 10, 20);
  }
}

// ============================================================
// Per-location renderers
// ============================================================

export function drawKitchen(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  // Wall
  gfx.fillStyle(0xc8b890);
  gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Floor
  gfx.fillStyle(0x8a6a4a);
  gfx.fillRect(0, 350, SCREEN_W, SCREEN_H - 350);

  // Counter
  gfx.fillStyle(0x8a6a4a);
  gfx.fillRect(0, 350 - 60, 300, 60);

  // Coffee maker on counter
  gfx.fillStyle(0x555555);
  gfx.fillRect(60, 350 - 60 - 20, 15, 20);

  // Coffee mug on counter
  gfx.fillStyle(0xc4a878);
  gfx.fillRect(100, 350 - 60 - 10, 8, 10);

  // Fridge
  gfx.fillStyle(0xd4a078);
  gfx.fillRect(SCREEN_W - 80, 350 - 120, 60, 120);
  gfx.lineStyle(2, 0x3a2a1a);
  gfx.strokeRect(SCREEN_W - 80, 350 - 120, 60, 120);

  // Yellow note on fridge
  gfx.fillStyle(0xf0e080);
  gfx.fillRect(SCREEN_W - 65, 350 - 100, 15, 12);

  // Overhead light
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(SCREEN_W / 2, 30, 8);
}

export function drawFrontYard(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Lawn color adjustment based on mowQuality
  const mowQuality = (state.flags.mowQuality as number) ?? 50;
  if (mowQuality < 60) {
    // Overlay slightly brown for unmaintained lawn
    gfx.fillStyle(0x7a8e3a, 0.5);
    gfx.fillRect(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y);
  }

  // Lawn stripes
  const lawnStatus = (state.flags.lawnStatus as number) ?? 0;
  const stripeCount = Math.floor(lawnStatus / 33);
  const isCrooked = mowQuality < 50;
  for (let i = 0; i < stripeCount; i++) {
    const sy = GROUND_Y + 10 + i * 20;
    if (sy + 6 > SCREEN_H) break;
    gfx.fillStyle(0x6aae4a, 0.35);
    if (isCrooked) {
      // Wobbly stripes for drunk mowing
      for (let sx = 0; sx < SCREEN_W; sx += 20) {
        const wobble = Math.sin(sx * 0.05 + i * 2) * 4;
        gfx.fillRect(sx, sy + wobble, 20, 6);
      }
    } else {
      gfx.fillRect(0, sy, SCREEN_W, 6);
    }
  }

  // Tree behind fence
  gfx.fillStyle(0x6b4c2a);
  gfx.fillRect(740, GROUND_Y - 80, 8, 80);
  gfx.fillStyle(0x3a8a3a);
  gfx.fillEllipse(744, GROUND_Y - 100, 50, 40);

  // Fence section at far right
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(760, GROUND_Y - 60, 6, 60);

  // House
  gfx.fillStyle(0xe8d4b8);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);

  // Roof
  gfx.fillStyle(0x8b4513);
  gfx.fillRect(20, GROUND_Y - 140, 190, 25);

  // Door
  gfx.fillStyle(0x654321);
  gfx.fillRect(90, GROUND_Y - 48, 30, 48);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(113, GROUND_Y - 24, 3);

  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(140, GROUND_Y - 95, 30, 25);
  gfx.lineStyle(1, 0xffffff);
  gfx.strokeRect(45, GROUND_Y - 95, 30, 25);
  gfx.strokeRect(140, GROUND_Y - 95, 30, 25);

  // Karen in window
  const karenHome = state.currentLocation !== 'kitchen';
  if (karenHome) {
    gfx.fillStyle(0xf0c89a);
    gfx.fillRect(150, GROUND_Y - 92, 10, 12);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(153, GROUND_Y - 87, 1);
    gfx.fillCircle(157, GROUND_Y - 87, 1);
  }

  // Mailbox
  gfx.fillStyle(0x4a6fa5);
  gfx.fillRect(650, GROUND_Y - 30, 15, 30);

  // Minivan in driveway (aligned with the 'car' interaction zone at x=287)
  drawMinivan(gfx, 287, GROUND_Y);

  // Lawn mower (visible when lawn not done)
  if (lawnStatus < 100) {
    // Mower body
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(430, GROUND_Y - 14, 20, 10);
    // Handle
    gfx.lineStyle(2, 0x555555);
    gfx.lineBetween(440, GROUND_Y - 14, 440, GROUND_Y - 30);
    gfx.lineBetween(435, GROUND_Y - 30, 445, GROUND_Y - 30);
    // Wheels
    gfx.fillStyle(0x333333);
    gfx.fillCircle(433, GROUND_Y - 4, 3);
    gfx.fillCircle(447, GROUND_Y - 4, 3);
  }

  // Background person (jogger)
  drawTinyPerson(gfx, 600, GROUND_Y, 0x4488cc, 0.35);
}

export function drawGarage(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const GFLOOR = 350;

  // Back wall — warm brown wood paneling
  gfx.fillStyle(0x3d2b1f);
  gfx.fillRect(0, 0, SCREEN_W, GFLOOR);
  // Horizontal plank lines
  gfx.lineStyle(1, 0x2a1a10, 0.6);
  for (let y = 60; y < GFLOOR; y += 40) {
    gfx.lineBetween(0, y, SCREEN_W, y);
  }

  // Floor (concrete with oil stains)
  gfx.fillStyle(0x555555);
  gfx.fillRect(0, GFLOOR, SCREEN_W, SCREEN_H - GFLOOR);
  gfx.fillStyle(0x3a3a3a, 0.45);
  gfx.fillEllipse(420, GFLOOR + 40, 60, 10);
  gfx.fillEllipse(550, GFLOOR + 55, 40, 8);

  // Garage door outline at back center
  gfx.lineStyle(3, 0x8b6914);
  gfx.strokeRect(300, 50, 200, 200);
  // Door panels
  gfx.lineStyle(1, 0x6b4914, 0.8);
  gfx.lineBetween(300, 100, 500, 100);
  gfx.lineBetween(300, 150, 500, 150);
  gfx.lineBetween(300, 200, 500, 200);

  // Window in the garage door (light leaks through)
  gfx.fillStyle(0xf0e8aa, 0.25);
  gfx.fillRect(340, 70, 120, 20);

  // Workbench (left)
  gfx.fillStyle(0x8a6a4a);
  gfx.fillRect(30, GFLOOR - 50, 150, 50);
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(30, GFLOOR - 50, 150, 4);
  // Workbench legs
  gfx.fillRect(35, GFLOOR - 46, 4, 46);
  gfx.fillRect(171, GFLOOR - 46, 4, 46);
  // Pegboard behind workbench
  gfx.fillStyle(0x5a4a3a);
  gfx.fillRect(30, GFLOOR - 120, 150, 70);
  // Tool silhouettes on pegboard
  gfx.fillStyle(0x444444);
  gfx.fillRect(50, GFLOOR - 110, 4, 30);   // screwdriver
  gfx.fillRect(80, GFLOOR - 115, 20, 3);   // wrench
  gfx.fillRect(120, GFLOOR - 108, 18, 4);  // hammer head
  gfx.fillRect(125, GFLOOR - 104, 2, 20);  // hammer handle

  // Toolbox on workbench (red, classic Craftsman)
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(80, GFLOOR - 50 - 20, 40, 20);
  gfx.fillStyle(0x992222);
  gfx.fillRect(80, GFLOOR - 50 - 20, 40, 4);
  // Toolbox latch (hints at secrets)
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(97, GFLOOR - 50 - 18, 6, 2);
  // Weed glow hint if found but not yet smoked
  if (state.flags.foundWeed === true && !(state.flags.weedSmoked === true)) {
    gfx.fillStyle(0x66cc66, 0.35);
    gfx.fillCircle(100, GFLOOR - 66, 10);
  }

  // Mini fridge — ALWAYS visible (right side)
  const fridgeX = SCREEN_W - 90;
  const fridgeY = GFLOOR - 70;
  // Fridge body
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(fridgeX, fridgeY, 50, 70);
  // Fridge door seam
  gfx.lineStyle(1, 0x888888);
  gfx.lineBetween(fridgeX, fridgeY + 25, fridgeX + 50, fridgeY + 25);
  // Handle
  gfx.fillStyle(0x666666);
  gfx.fillRect(fridgeX + 42, fridgeY + 8, 3, 12);
  gfx.fillRect(fridgeX + 42, fridgeY + 35, 3, 12);
  // "BEER" sticker
  gfx.fillStyle(0xf0d020);
  gfx.fillRect(fridgeX + 8, fridgeY + 8, 20, 10);
  gfx.fillStyle(0x222222);
  // Dark pixels to suggest text
  gfx.fillRect(fridgeX + 11, fridgeY + 12, 2, 2);
  gfx.fillRect(fridgeX + 15, fridgeY + 12, 2, 2);
  gfx.fillRect(fridgeX + 19, fridgeY + 12, 2, 2);
  gfx.fillRect(fridgeX + 23, fridgeY + 12, 2, 2);
  // Magnets
  gfx.fillStyle(0xd04040);
  gfx.fillCircle(fridgeX + 10, fridgeY + 30, 2);
  gfx.fillStyle(0x40a0d0);
  gfx.fillCircle(fridgeX + 18, fridgeY + 33, 2);

  // Beers on top of fridge — shows how many you've had in the garage this session
  const beersHad = (state.flags.garageBeersHad as number) ?? 0;
  for (let i = 0; i < Math.min(beersHad, 6); i++) {
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(fridgeX + 4 + i * 7, fridgeY - 10, 5, 10);
    gfx.fillStyle(0xffffff);
    gfx.fillRect(fridgeX + 5 + i * 7, fridgeY - 6, 3, 2);
  }

  // Crumpled beer cans on the floor (appear as you drink more)
  if (beersHad >= 2) {
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(460, GFLOOR + 35, 8, 5);
  }
  if (beersHad >= 4) {
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(490, GFLOOR + 42, 8, 5);
    gfx.fillRect(520, GFLOOR + 36, 8, 5);
  }
  if (beersHad >= 6) {
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(250, GFLOOR + 40, 8, 5);
    gfx.fillRect(280, GFLOOR + 36, 8, 5);
    gfx.fillRect(200, GFLOOR + 42, 8, 5);
  }

  // Patio chair in the garage — the drinking throne
  gfx.fillStyle(0x5a6a7a);
  gfx.fillRect(600, GFLOOR - 35, 40, 30);
  gfx.fillRect(600, GFLOOR - 50, 40, 20);
  gfx.fillRect(600, GFLOOR - 5, 4, 10);
  gfx.fillRect(636, GFLOOR - 5, 4, 10);

  // Bong hint on the workbench if weed has been smoked
  if (state.flags.weedSmoked === true) {
    gfx.fillStyle(0x448855);
    gfx.fillRect(145, GFLOOR - 56, 6, 6);
    gfx.fillRect(146, GFLOOR - 70, 4, 16);
  }

  // Bare light bulb
  gfx.fillStyle(0xf0e060);
  gfx.fillCircle(SCREEN_W / 2, 30, 6);
  gfx.fillStyle(0xf0e060, 0.2);
  gfx.fillCircle(SCREEN_W / 2, 30, 18);
  // Pull chain
  gfx.lineStyle(1, 0x888888);
  gfx.lineBetween(SCREEN_W / 2, 36, SCREEN_W / 2, 55);
}

export function drawBackyard(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Back of house at left edge
  gfx.fillStyle(0xe8d4b8);
  gfx.fillRect(0, GROUND_Y - 150, 100, 150);

  // Patio area
  gfx.fillStyle(0xc4a878);
  gfx.fillRect(100, GROUND_Y - 10, 150, 60);

  // Fence at right
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(750, GROUND_Y - 60, 6, 60);

  // Tree behind fence
  gfx.fillStyle(0x6b4c2a);
  gfx.fillRect(770, GROUND_Y - 80, 8, 80);
  gfx.fillStyle(0x3a8a3a);
  gfx.fillEllipse(774, GROUND_Y - 100, 50, 40);

  // Table
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(530, GROUND_Y - 40, 130, 5);
  gfx.fillRect(540, GROUND_Y - 35, 4, 35);
  gfx.fillRect(650, GROUND_Y - 35, 4, 35);

  // Grill (state-dependent)
  const grillStatus = (state.flags.grillStatus as string) ?? 'not_started';
  drawGrill(gfx, 350, GROUND_Y - 24, grillStatus);

  // String lights (evening only)
  if (time >= 1020) {
    drawStringLights(gfx);
  }
}

export function drawDougs(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Doug's house
  gfx.fillStyle(0xc8d4b8);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);

  // Roof
  gfx.fillStyle(0x5a6b4a);
  gfx.fillRect(20, GROUND_Y - 140, 190, 25);

  // Door
  gfx.fillStyle(0x4a5a3a);
  gfx.fillRect(90, GROUND_Y - 48, 30, 48);

  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(140, GROUND_Y - 95, 30, 25);

  // Brenda in window with frowny mouth
  gfx.fillStyle(0xf0c89a);
  gfx.fillRect(150, GROUND_Y - 92, 10, 12);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(153, GROUND_Y - 87, 1);
  gfx.fillCircle(157, GROUND_Y - 87, 1);
  gfx.lineStyle(1, 0x000000);
  gfx.lineBetween(152, GROUND_Y - 82, 155, GROUND_Y - 83);
  gfx.lineBetween(155, GROUND_Y - 83, 158, GROUND_Y - 82);

  // Lawn chair
  gfx.fillStyle(0x8b4513);
  gfx.fillRect(250, GROUND_Y - 24, 80, 24);
  gfx.fillRect(250, GROUND_Y - 50, 8, 30);

  // Cooler
  gfx.fillStyle(0x3a7bc8);
  gfx.fillRect(340, GROUND_Y - 20, 30, 20);

  // Doug NPC (from registry)
  drawNpc(gfx, 'doug', 335, GROUND_Y);
}

export function drawBBQ(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Back of house at left edge
  gfx.fillStyle(0xe8d4b8);
  gfx.fillRect(0, GROUND_Y - 150, 100, 150);

  // Patio area
  gfx.fillStyle(0xc4a878);
  gfx.fillRect(100, GROUND_Y - 10, 150, 60);

  // Fence at right
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(750, GROUND_Y - 60, 6, 60);

  // Tree behind fence
  gfx.fillStyle(0x6b4c2a);
  gfx.fillRect(770, GROUND_Y - 80, 8, 80);
  gfx.fillStyle(0x3a8a3a);
  gfx.fillEllipse(774, GROUND_Y - 100, 50, 40);

  // Grill
  const grillStatus = (state.flags.grillStatus as string) ?? 'not_started';
  drawGrill(gfx, 350, GROUND_Y - 24, grillStatus);

  // String lights always ON at BBQ party
  drawStringLights(gfx);

  // Table with plates
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(530, GROUND_Y - 40, 130, 5);
  gfx.fillRect(540, GROUND_Y - 35, 4, 35);
  gfx.fillRect(650, GROUND_Y - 35, 4, 35);

  // Plates
  gfx.fillStyle(0xffffff);
  gfx.fillRect(545, GROUND_Y - 48, 14, 8);
  gfx.fillRect(580, GROUND_Y - 48, 14, 8);
  gfx.fillRect(615, GROUND_Y - 48, 14, 8);

  // NPCs (from registry)
  drawNpc(gfx, 'mil', 150, GROUND_Y);
  drawNpc(gfx, 'doug', 320, GROUND_Y);
  drawNpc(gfx, 'karen', 500, GROUND_Y);
  drawNpc(gfx, 'brenda', 630, GROUND_Y);

  // Kevin shows up uninvited if you're in the pyramid
  if ((state.vices.pyramid ?? 0) >= 1) {
    drawNpc(gfx, 'kevin', 620, GROUND_Y);
  }

  // Craig lurks near the fence if you've been in the gun business
  if ((state.vices.guns ?? 0) >= 1) {
    drawNpc(gfx, 'craig', 700, GROUND_Y);
  }

  // Neighbor Greg — always at the BBQ
  drawTinyPerson(gfx, 80, GROUND_Y, 0x6688aa);

  // Callback NPCs — show up if earlier flags set
  const f = state.flags;
  if (f.rayray_invited === true) {
    drawNpc(gfx, 'tweaker_rayray', 740, GROUND_Y);
  }
  if (f.amber_confidante === true) {
    drawNpc(gfx, 'amber', 430, GROUND_Y);
  }
  if (f.sharon_helped === true) {
    drawTinyPerson(gfx, 760, GROUND_Y, 0x222222, 1.2);  // silent ex lurking
  }

  // Background party crowd — makes the BBQ feel populated
  drawCrowdSilhouettes(gfx, 400, GROUND_Y + 2, 6, 560);
}

// ============================================================
// Phase 1 — New location renderers
// ============================================================

export function drawSidewalk(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Sidewalk strip
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(0, GROUND_Y - 2, SCREEN_W, 20);
  // Sidewalk cracks
  gfx.lineStyle(1, 0x888888);
  gfx.lineBetween(200, GROUND_Y - 2, 200, GROUND_Y + 18);
  gfx.lineBetween(400, GROUND_Y - 2, 400, GROUND_Y + 18);
  gfx.lineBetween(600, GROUND_Y - 2, 600, GROUND_Y + 18);

  // Road behind sidewalk
  gfx.fillStyle(0x444444);
  gfx.fillRect(0, GROUND_Y - 25, SCREEN_W, 23);
  // Yellow center line
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(100, GROUND_Y - 15, 40, 2);
  gfx.fillRect(200, GROUND_Y - 15, 40, 2);
  gfx.fillRect(350, GROUND_Y - 15, 40, 2);
  gfx.fillRect(500, GROUND_Y - 15, 40, 2);
  gfx.fillRect(650, GROUND_Y - 15, 40, 2);

  // Row of houses in background
  // House 1 — blue
  gfx.fillStyle(0x7a9ab8);
  gfx.fillRect(80, GROUND_Y - 100, 100, 75);
  gfx.fillStyle(0x5a6a7a);
  gfx.fillRect(70, GROUND_Y - 115, 120, 18);
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(100, GROUND_Y - 80, 18, 14);
  gfx.fillRect(145, GROUND_Y - 80, 18, 14);

  // House 2 — yellow
  gfx.fillStyle(0xd4c090);
  gfx.fillRect(300, GROUND_Y - 110, 110, 85);
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(290, GROUND_Y - 125, 130, 18);
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(320, GROUND_Y - 85, 18, 14);
  gfx.fillRect(370, GROUND_Y - 85, 18, 14);

  // House 3 — green
  gfx.fillStyle(0x8ab888);
  gfx.fillRect(530, GROUND_Y - 95, 100, 70);
  gfx.fillStyle(0x5a8a5a);
  gfx.fillRect(520, GROUND_Y - 110, 120, 18);
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(550, GROUND_Y - 78, 18, 14);
  gfx.fillRect(595, GROUND_Y - 78, 18, 14);

  // Fire hydrant
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(700, GROUND_Y - 15, 8, 15);
  gfx.fillRect(697, GROUND_Y - 10, 14, 4);

  // Background people
  drawTinyPerson(gfx, 150, GROUND_Y, 0x4488cc, 0.3);  // jogger
  drawTinyPerson(gfx, 650, GROUND_Y, 0x6a5a4a, 0.3);  // dog walker

  // The Girls (conditional: time >= 570, drugs < 1)
  if (time >= 570 && (state.vices.drugs ?? 0) < 1) {
    drawNpc(gfx, 'the_girls', 480, GROUND_Y);
  } else if ((state.vices.drugs ?? 0) >= 1) {
    // They still hang around if you're in the club
    drawNpc(gfx, 'the_girls', 480, GROUND_Y);
  }
}

export function drawCraigs(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Craig's house — muted gray
  gfx.fillStyle(0x8a8a8a);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);
  // Roof — dark
  gfx.fillStyle(0x4a4a4a);
  gfx.fillRect(20, GROUND_Y - 140, 190, 25);
  // Door
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(90, GROUND_Y - 48, 30, 48);
  // Windows — slightly tinted
  gfx.fillStyle(0x6a8aaa);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(140, GROUND_Y - 95, 30, 25);

  // Pickup truck
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(350, GROUND_Y - 30, 100, 30);
  // Truck cab
  gfx.fillStyle(0x2d2d2d);
  gfx.fillRect(410, GROUND_Y - 50, 40, 20);
  // Truck bed
  gfx.fillStyle(0x333333);
  gfx.fillRect(350, GROUND_Y - 35, 60, 5);
  // Wheels
  gfx.fillStyle(0x111111);
  gfx.fillCircle(370, GROUND_Y, 6);
  gfx.fillCircle(430, GROUND_Y, 6);

  // Stacked boxes near truck
  gfx.fillStyle(0x6b5a3a);
  gfx.fillRect(300, GROUND_Y - 20, 18, 20);
  gfx.fillRect(320, GROUND_Y - 20, 18, 20);
  gfx.fillRect(308, GROUND_Y - 38, 18, 18);

  // Chain-link fence hint
  gfx.lineStyle(1, 0x888888, 0.5);
  for (let i = 0; i < 8; i++) {
    const fx = 550 + i * 30;
    gfx.lineBetween(fx, GROUND_Y - 50, fx, GROUND_Y);
  }
  gfx.lineBetween(550, GROUND_Y - 40, 770, GROUND_Y - 40);
  gfx.lineBetween(550, GROUND_Y - 20, 770, GROUND_Y - 20);

  // Craig NPC (conditional: time >= 690)
  if (time >= 690) {
    drawNpc(gfx, 'craig', 280, GROUND_Y);
  }
}

export function drawKevins(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Kevin's house — aggressively cheerful
  gfx.fillStyle(0xe8d4a0);
  gfx.fillRect(30, GROUND_Y - 130, 180, 130);
  // Roof — warm
  gfx.fillStyle(0xcc8844);
  gfx.fillRect(20, GROUND_Y - 150, 200, 25);
  // Door — bright
  gfx.fillStyle(0x22aa55);
  gfx.fillRect(100, GROUND_Y - 48, 30, 48);
  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(50, GROUND_Y - 100, 30, 25);
  gfx.fillRect(155, GROUND_Y - 100, 30, 25);

  // Open garage
  gfx.fillStyle(0x555555);
  gfx.fillRect(300, GROUND_Y - 100, 160, 100);
  // Garage interior — darker
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(305, GROUND_Y - 95, 150, 90);

  // Whiteboard inside garage
  gfx.fillStyle(0xf0f0f0);
  gfx.fillRect(320, GROUND_Y - 85, 60, 45);
  // Green scribble lines (the "plan")
  gfx.lineStyle(1, 0x22aa55);
  gfx.lineBetween(330, GROUND_Y - 75, 350, GROUND_Y - 65);
  gfx.lineBetween(350, GROUND_Y - 65, 370, GROUND_Y - 75);
  gfx.lineBetween(340, GROUND_Y - 60, 360, GROUND_Y - 50);
  // Arrow pointing UP (it's definitely a pyramid)
  gfx.lineBetween(350, GROUND_Y - 80, 350, GROUND_Y - 70);
  gfx.lineBetween(345, GROUND_Y - 75, 350, GROUND_Y - 80);
  gfx.lineBetween(355, GROUND_Y - 75, 350, GROUND_Y - 80);

  // ELEVATÉ banner
  gfx.fillStyle(0x22aa55);
  gfx.fillRect(310, GROUND_Y - 95, 140, 10);

  // Boxes of "product" in garage
  gfx.fillStyle(0x22aa55, 0.6);
  gfx.fillRect(400, GROUND_Y - 25, 15, 20);
  gfx.fillRect(420, GROUND_Y - 25, 15, 20);
  gfx.fillRect(408, GROUND_Y - 43, 15, 18);

  // Kevin NPC (always there, always grinning)
  drawNpc(gfx, 'kevin', 370, GROUND_Y);
}

export function drawKidsPorch(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x5a9e3a);

  // Modest house
  gfx.fillStyle(0xb8a898);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);
  // Roof
  gfx.fillStyle(0x6a5a4a);
  gfx.fillRect(20, GROUND_Y - 140, 190, 25);
  // Door
  gfx.fillStyle(0x5a4a3a);
  gfx.fillRect(90, GROUND_Y - 48, 30, 48);
  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(140, GROUND_Y - 95, 30, 25);

  // Raised porch platform
  gfx.fillStyle(0x8a7a6a);
  gfx.fillRect(250, GROUND_Y - 15, 200, 15);
  // Porch railing
  gfx.lineStyle(2, 0x6a5a4a);
  gfx.lineBetween(250, GROUND_Y - 40, 250, GROUND_Y - 15);
  gfx.lineBetween(450, GROUND_Y - 40, 450, GROUND_Y - 15);
  gfx.lineBetween(250, GROUND_Y - 40, 450, GROUND_Y - 40);

  // Energy drink cans scattered
  gfx.fillStyle(0x33cc33);
  gfx.fillRect(280, GROUND_Y - 20, 4, 6);
  gfx.fillRect(310, GROUND_Y - 20, 4, 6);
  gfx.fillRect(350, GROUND_Y - 20, 4, 6);
  gfx.fillRect(390, GROUND_Y - 20, 4, 6);
  // One knocked over
  gfx.fillRect(420, GROUND_Y - 18, 6, 4);

  // The Kid NPC (conditional: time >= 720)
  if (time >= 720) {
    drawNpc(gfx, 'the_kid', 340, GROUND_Y - 15);
  }
}

export function drawQuikstop(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x444444);  // asphalt ground

  // Player's minivan parked on the left (zone at x=60)
  drawMinivan(gfx, 60, GROUND_Y);

  // Store building
  gfx.fillStyle(0xd4c4a8);
  gfx.fillRect(100, GROUND_Y - 130, 350, 130);
  // Store front window
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(120, GROUND_Y - 100, 150, 60);
  // Store door
  gfx.fillStyle(0x555555);
  gfx.fillRect(290, GROUND_Y - 60, 30, 60);
  // QUIKSTOP sign
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(150, GROUND_Y - 135, 200, 18);
  // Fluorescent glow from windows
  gfx.fillStyle(0xf0f0e0, 0.15);
  gfx.fillRect(120, GROUND_Y - 100, 150, 60);

  // Gas pump out front
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(500, GROUND_Y - 50, 12, 50);
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(496, GROUND_Y - 55, 20, 8);
  // Pump hose
  gfx.lineStyle(2, 0x333333);
  gfx.lineBetween(512, GROUND_Y - 40, 525, GROUND_Y - 30);

  // Parked cars
  gfx.fillStyle(0x6b8cae);
  gfx.fillRect(530, GROUND_Y - 18, 50, 18);
  gfx.fillStyle(0x8b4513);
  gfx.fillRect(600, GROUND_Y - 18, 50, 18);

  // Dumpster at right
  gfx.fillStyle(0x3a5a3a);
  gfx.fillRect(700, GROUND_Y - 30, 50, 30);
  gfx.fillStyle(0x2a4a2a);
  gfx.fillRect(700, GROUND_Y - 35, 50, 5);

  // QuikStop teen (vaping outside)
  drawNpc(gfx, 'quikstop_teen', 470, GROUND_Y);

  // Kevin lurks everywhere when you're in the pyramid (conditional)
  if ((state.vices.pyramid ?? 0) >= 1) {
    drawNpc(gfx, 'kevin', 560, GROUND_Y);
  }
}

export function drawGasStation(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x444444);  // asphalt ground

  // Player's minivan parked on the left (zone at x=75)
  drawMinivan(gfx, 75, GROUND_Y);

  // Convenience store
  gfx.fillStyle(0xc8b890);
  gfx.fillRect(30, GROUND_Y - 110, 180, 110);
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(50, GROUND_Y - 80, 80, 40);
  gfx.fillStyle(0x555555);
  gfx.fillRect(145, GROUND_Y - 50, 25, 50);
  // Store sign
  gfx.fillStyle(0x3a7bc8);
  gfx.fillRect(50, GROUND_Y - 115, 140, 12);

  // Gas pump canopy
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(280, GROUND_Y - 100, 200, 8);
  // Canopy supports
  gfx.fillStyle(0x888888);
  gfx.fillRect(290, GROUND_Y - 100, 6, 100);
  gfx.fillRect(470, GROUND_Y - 100, 6, 100);

  // Gas pumps
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(340, GROUND_Y - 50, 12, 50);
  gfx.fillRect(400, GROUND_Y - 50, 12, 50);
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(336, GROUND_Y - 55, 20, 8);
  gfx.fillStyle(0x3a7bc8);
  gfx.fillRect(396, GROUND_Y - 55, 20, 8);

  // Stoplight
  gfx.fillStyle(0x333333);
  gfx.fillRect(580, GROUND_Y - 80, 8, 80);
  // Light housing
  gfx.fillStyle(0x222222);
  gfx.fillRect(572, GROUND_Y - 95, 24, 30);
  // Red light
  gfx.fillStyle(0xcc3333);
  gfx.fillCircle(584, GROUND_Y - 87, 4);
  // Yellow light
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(584, GROUND_Y - 78, 4);
  // Green light
  gfx.fillStyle(0x33aa33, 0.3);
  gfx.fillCircle(584, GROUND_Y - 69, 4);

  // Modded Honda Civic
  gfx.fillStyle(0x2244cc);
  gfx.fillRect(620, GROUND_Y - 20, 70, 20);
  // Lowered, with body kit
  gfx.fillStyle(0x1a1a4a);
  gfx.fillRect(615, GROUND_Y - 12, 80, 4);
  // Spoiler
  gfx.fillStyle(0x1a1a4a);
  gfx.fillRect(620, GROUND_Y - 28, 15, 8);
  // Wheels
  gfx.fillStyle(0xcccccc);
  gfx.fillCircle(638, GROUND_Y, 5);
  gfx.fillCircle(678, GROUND_Y, 5);
  // Ground effects glow
  gfx.fillStyle(0x6a00ff, 0.3);
  gfx.fillRect(620, GROUND_Y - 2, 70, 4);

  // Modded Car Guy NPC
  drawNpc(gfx, 'modded_car_guy', 600, GROUND_Y);

  // Sharon at the phone booth (hidden in morning and in high-heat)
  const tNow = state.currentTime;
  const suspicion = state.suspicion ?? 0;
  if (tNow >= 720 && suspicion < 60) {
    drawNpc(gfx, 'sharon', 500, GROUND_Y);
  }

  // Kevin pitches everyone, even at gas stations
  if ((state.vices.pyramid ?? 0) >= 1) {
    drawNpc(gfx, 'kevin', 250, GROUND_Y);
  }
}

// ============================================================
// Phase 2 — New location renderers
// ============================================================

export function drawStripMall(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x555555);  // parking lot asphalt

  // Player's minivan parked in the lot (zone at x=75)
  drawMinivan(gfx, 75, GROUND_Y);

  // Row of connected storefronts
  // Store 1 — Nail Salon (pink facade)
  gfx.fillStyle(0xd4a0b0);
  gfx.fillRect(80, GROUND_Y - 120, 150, 120);
  gfx.fillStyle(0xcc6688);
  gfx.fillRect(80, GROUND_Y - 130, 150, 14);
  // Window
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(100, GROUND_Y - 90, 60, 40);
  // Door
  gfx.fillStyle(0x555555);
  gfx.fillRect(180, GROUND_Y - 50, 25, 50);

  // Store 2 — Check Cashing (yellow facade)
  gfx.fillStyle(0xd4c870);
  gfx.fillRect(230, GROUND_Y - 120, 150, 120);
  gfx.fillStyle(0xb8a840);
  gfx.fillRect(230, GROUND_Y - 130, 150, 14);
  // Window
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(250, GROUND_Y - 90, 60, 40);
  // Door
  gfx.fillStyle(0x555555);
  gfx.fillRect(330, GROUND_Y - 50, 25, 50);

  // Store 3 — Karate Dojo (white facade)
  gfx.fillStyle(0xe8e8e8);
  gfx.fillRect(380, GROUND_Y - 120, 150, 120);
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(380, GROUND_Y - 130, 150, 14);
  // Window
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(400, GROUND_Y - 90, 60, 40);
  // Door
  gfx.fillStyle(0x555555);
  gfx.fillRect(480, GROUND_Y - 50, 25, 50);

  // Store 4 — Club Purrrple (opens at 9 AM) OR Vacant before then
  const clubOpen = time >= 540;
  if (clubOpen) {
    // Dark purple facade, neon signage
    gfx.fillStyle(0x2a0a2a);
    gfx.fillRect(530, GROUND_Y - 120, 120, 120);
    gfx.fillStyle(0x1a001a);
    gfx.fillRect(530, GROUND_Y - 130, 120, 14);
    // Blacked-out window
    gfx.fillStyle(0x111111);
    gfx.fillRect(550, GROUND_Y - 90, 60, 40);
    // Animated hot-pink neon "PURRRPLE" bar (with a heart glyph)
    const blink = Math.floor(time * 3) % 4 !== 0; // flicker
    gfx.fillStyle(0xff3388, blink ? 0.95 : 0.5);
    gfx.fillRect(545, GROUND_Y - 115, 90, 10);
    gfx.fillStyle(0xff99cc, blink ? 0.9 : 0.4);
    gfx.fillRect(547, GROUND_Y - 113, 86, 6);
    // Heart silhouette glyph on the facade
    gfx.fillStyle(0xff66aa, blink ? 0.9 : 0.4);
    gfx.fillCircle(570, GROUND_Y - 70, 5);
    gfx.fillCircle(580, GROUND_Y - 70, 5);
    gfx.fillTriangle(564, GROUND_Y - 69, 586, GROUND_Y - 69, 575, GROUND_Y - 55);
    // Door with "VIP" marker
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(620, GROUND_Y - 50, 25, 50);
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(625, GROUND_Y - 40, 15, 4);
    // Mood light spill on the sidewalk
    drawMoodLight(gfx, 630, GROUND_Y + 4, 0xff3388, 40);
  } else {
    // Vacant gray facade — club hasn't opened yet
    gfx.fillStyle(0x999999);
    gfx.fillRect(530, GROUND_Y - 120, 120, 120);
    gfx.fillStyle(0x777777);
    gfx.fillRect(530, GROUND_Y - 130, 120, 14);
    // Boarded window
    gfx.fillStyle(0x8a6a4a);
    gfx.fillRect(550, GROUND_Y - 90, 60, 40);
  }

  // Parked cars
  gfx.fillStyle(0x6b8cae);
  gfx.fillRect(120, GROUND_Y + 20, 50, 18);
  gfx.fillStyle(0x8b4513);
  gfx.fillRect(250, GROUND_Y + 20, 50, 18);
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(400, GROUND_Y + 20, 50, 18);

  // Parking lines
  gfx.lineStyle(1, 0xcccccc, 0.4);
  for (let i = 0; i < 8; i++) {
    const lx = 90 + i * 70;
    gfx.lineBetween(lx, GROUND_Y + 10, lx, GROUND_Y + 50);
  }

  // Dumpster at far right
  gfx.fillStyle(0x3a5a3a);
  gfx.fillRect(690, GROUND_Y - 30, 50, 30);
  gfx.fillStyle(0x2a4a2a);
  gfx.fillRect(690, GROUND_Y - 35, 50, 5);

  // The Girls — always visible at the alley (this is their hangout)
  drawNpc(gfx, 'the_girls', 710, GROUND_Y);

  // Kevin NPC pitching outside (conditional: pyramid >= 1)
  if ((state.vices.pyramid ?? 0) >= 1) {
    drawNpc(gfx, 'kevin', 200, GROUND_Y);
  }
}

export function drawSketchy(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x555555);  // concrete ground

  // Player's minivan — the one wholesome thing in this neighborhood (zone at x=75)
  drawMinivan(gfx, 75, GROUND_Y);

  // Run-down buildings — darker/dingier
  gfx.fillStyle(0x5a5a5a);
  gfx.fillRect(50, GROUND_Y - 110, 140, 110);
  gfx.fillStyle(0x4a4a4a);
  gfx.fillRect(50, GROUND_Y - 120, 140, 14);
  // Cracked windows
  gfx.fillStyle(0x6a7a8a, 0.5);
  gfx.fillRect(70, GROUND_Y - 85, 40, 30);
  gfx.lineStyle(1, 0x333333);
  gfx.lineBetween(70, GROUND_Y - 85, 110, GROUND_Y - 55);

  // Second building
  gfx.fillStyle(0x4a4a4a);
  gfx.fillRect(220, GROUND_Y - 100, 130, 100);
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(220, GROUND_Y - 110, 130, 14);
  gfx.fillStyle(0x6a7a8a, 0.5);
  gfx.fillRect(240, GROUND_Y - 80, 35, 25);

  // Warehouse
  gfx.fillStyle(0x4a4a4a);
  gfx.fillRect(500, GROUND_Y - 130, 200, 130);
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(500, GROUND_Y - 140, 200, 14);
  // Roll-up door
  gfx.fillStyle(0x5a5a5a);
  gfx.fillRect(550, GROUND_Y - 60, 60, 60);
  gfx.lineStyle(1, 0x444444);
  for (let i = 0; i < 5; i++) {
    gfx.lineBetween(550, GROUND_Y - 60 + i * 12, 610, GROUND_Y - 60 + i * 12);
  }

  // Chain-link fence sections
  gfx.lineStyle(1, 0x888888, 0.6);
  for (let i = 0; i < 6; i++) {
    const fx = 380 + i * 20;
    gfx.lineBetween(fx, GROUND_Y - 50, fx, GROUND_Y);
  }
  gfx.lineBetween(380, GROUND_Y - 40, 480, GROUND_Y - 40);
  gfx.lineBetween(380, GROUND_Y - 25, 480, GROUND_Y - 25);

  // Flickering streetlight
  gfx.fillStyle(0x555555);
  gfx.fillRect(430, GROUND_Y - 100, 4, 100);
  gfx.fillStyle(0x666666);
  gfx.fillRect(424, GROUND_Y - 105, 16, 8);
  // Flicker: visible on even seconds, dim on odd
  const flickerOn = Math.floor(time) % 2 === 0;
  gfx.fillStyle(0xf0e060, flickerOn ? 0.6 : 0.1);
  gfx.fillCircle(432, GROUND_Y - 108, 5);

  // Background shadowy people
  drawTinyPerson(gfx, 160, GROUND_Y, 0x3a3a3a, 0.3);
  drawTinyPerson(gfx, 310, GROUND_Y, 0x4a4a4a, 0.25);
  drawTinyPerson(gfx, 640, GROUND_Y, 0x3a3a3a, 0.2);

  // Fence Guy — always at the corner (this is his hangout)
  drawNpc(gfx, 'fence_guy', 300, GROUND_Y);

  // Warehouse Guy — appears when warehouse zone activates (guns >= 2)
  if ((state.vices.guns ?? 0) >= 2) {
    drawNpc(gfx, 'warehouse_guy', 580, GROUND_Y);
  }

  // Extra ambient crackheads make the area feel populated
  drawNpc(gfx, 'crackhead_guy', 120, GROUND_Y);
}

export function drawGasStationStore(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const FLOOR = 350;

  // Walls — cheap beige linoleum
  gfx.fillStyle(0xe8dcb0);
  gfx.fillRect(0, 0, SCREEN_W, FLOOR);

  // Ceiling panels
  gfx.fillStyle(0xc8bc90);
  gfx.fillRect(0, 0, SCREEN_W, 24);
  gfx.lineStyle(1, 0x9a8a60, 0.6);
  for (let x = 40; x < SCREEN_W; x += 80) {
    gfx.lineBetween(x, 0, x, 24);
  }

  // Floor (checkered tile)
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(0, FLOOR, SCREEN_W, SCREEN_H - FLOOR);
  gfx.fillStyle(0xaaaaaa);
  for (let x = 0; x < SCREEN_W; x += 40) {
    for (let y = FLOOR; y < SCREEN_H; y += 20) {
      if (((x / 40) + ((y - FLOOR) / 20)) % 2 === 0) {
        gfx.fillRect(x, y, 40, 20);
      }
    }
  }

  // Fluorescent ceiling light fixtures (3)
  for (const lx of [160, 400, 640]) {
    gfx.fillStyle(0x444444);
    gfx.fillRect(lx - 40, 26, 80, 10);
    gfx.fillStyle(0xffffcc, 0.9);
    gfx.fillRect(lx - 36, 28, 72, 6);
    // Faint glow
    gfx.fillStyle(0xffffcc, 0.08);
    gfx.fillCircle(lx, 32, 80);
  }

  // === Door / Exit (left side) ===
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(60, FLOOR - 140, 80, 140);   // door frame
  gfx.fillStyle(0xaac6dd);
  gfx.fillRect(66, FLOOR - 134, 68, 120);   // glass
  // Door handle
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(120, FLOOR - 80, 4, 14);
  // "PUSH" decal
  gfx.fillStyle(0x222222);
  gfx.fillRect(84, FLOOR - 64, 32, 4);
  // EXIT sign
  gfx.fillStyle(0x222222);
  gfx.fillRect(70, FLOOR - 168, 60, 20);
  gfx.fillStyle(0xd4202a);
  gfx.fillRect(72, FLOOR - 166, 56, 16);
  gfx.fillStyle(0xffffff);
  // faux "EXIT" letters (4 blocks)
  gfx.fillRect(78, FLOOR - 160, 6, 4);
  gfx.fillRect(90, FLOOR - 160, 6, 4);
  gfx.fillRect(102, FLOOR - 160, 6, 4);
  gfx.fillRect(114, FLOOR - 160, 6, 4);

  // Through-glass view of the outside (tiny van, gas pumps in distance)
  gfx.fillStyle(0x8a2a2a);
  gfx.fillRect(80, FLOOR - 80, 20, 10);
  gfx.fillStyle(0x222222);
  gfx.fillCircle(85, FLOOR - 70, 2);
  gfx.fillCircle(98, FLOOR - 70, 2);

  // === Snack aisle (middle-left) ===
  gfx.fillStyle(0x8a8a8a);
  gfx.fillRect(260, FLOOR - 120, 160, 100);
  gfx.fillStyle(0x6a6a6a);
  gfx.fillRect(260, FLOOR - 124, 160, 4);
  // Shelves
  gfx.lineStyle(1, 0x555555);
  for (const shy of [FLOOR - 100, FLOOR - 70, FLOOR - 40]) {
    gfx.lineBetween(260, shy, 420, shy);
  }
  // Boxes of chips/candy — bright colors
  const snackColors = [0xe04040, 0x4080e0, 0xf0c420, 0x40c060, 0xe08040, 0x9040c0];
  for (let i = 0; i < 12; i++) {
    const sx = 265 + (i % 6) * 26;
    const sy = FLOOR - 100 + Math.floor(i / 6) * 30;
    gfx.fillStyle(snackColors[i % snackColors.length]);
    gfx.fillRect(sx, sy, 22, 24);
  }
  // Taquito warmer on top
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(280, FLOOR - 144, 100, 20);
  gfx.fillStyle(0xc07040);
  for (let i = 0; i < 5; i++) {
    gfx.fillEllipse(290 + i * 20, FLOOR - 134, 14, 6);
  }
  gfx.fillStyle(0xffe060, 0.25);
  gfx.fillRect(282, FLOOR - 142, 96, 16);

  // === Counter (right side) with clerk behind it ===
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(440, FLOOR - 60, 180, 60);
  gfx.fillStyle(0x8a6a3a);
  gfx.fillRect(440, FLOOR - 64, 180, 4);
  // Register
  gfx.fillStyle(0x333333);
  gfx.fillRect(470, FLOOR - 88, 40, 28);
  gfx.fillStyle(0x22aa44);
  gfx.fillRect(474, FLOOR - 84, 32, 10);
  // Scratch-off lotto display
  gfx.fillStyle(0xf0c420);
  gfx.fillRect(530, FLOOR - 80, 60, 20);
  gfx.fillStyle(0x222222);
  gfx.fillRect(534, FLOOR - 76, 10, 12);
  gfx.fillRect(548, FLOOR - 76, 10, 12);
  gfx.fillRect(562, FLOOR - 76, 10, 12);
  gfx.fillRect(576, FLOOR - 76, 10, 12);
  // Cigarette rack above (blurred colored blocks)
  gfx.fillStyle(0x3a3a3a);
  gfx.fillRect(440, FLOOR - 170, 180, 80);
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      gfx.fillStyle([0xcc3333, 0x2a5ab0, 0xf0c420, 0x22aa44, 0x888888][i]);
      gfx.fillRect(448 + i * 35, FLOOR - 164 + j * 18, 30, 14);
    }
  }

  // Clerk — tall, bored. Draw behind counter.
  drawNpc(gfx, 'clerk', 500, FLOOR - 60);

  // === Beer cooler (far right) ===
  const cx = 650;
  gfx.fillStyle(0x444444);
  gfx.fillRect(cx - 40, FLOOR - 160, 100, 160);   // frame
  // Glass doors (with reflection)
  gfx.fillStyle(0xaaccdd, 0.85);
  gfx.fillRect(cx - 36, FLOOR - 156, 44, 152);
  gfx.fillRect(cx + 10, FLOOR - 156, 44, 152);
  // Cooler frost
  gfx.fillStyle(0xffffff, 0.2);
  gfx.fillRect(cx - 36, FLOOR - 156, 44, 10);
  gfx.fillRect(cx + 10, FLOOR - 156, 44, 10);
  // Cases of beer inside (stacked rectangles)
  const beerColors = [0xd4a020, 0xcc3333, 0x2a5aa0, 0x444444];
  for (let col = 0; col < 2; col++) {
    for (let row = 0; row < 4; row++) {
      const bx = cx - 32 + col * 46;
      const by = FLOOR - 140 + row * 30;
      gfx.fillStyle(beerColors[(col + row) % beerColors.length]);
      gfx.fillRect(bx, by, 36, 24);
      // label stripe
      gfx.fillStyle(0xffffff);
      gfx.fillRect(bx + 2, by + 10, 32, 4);
    }
  }
  // Cooler handles
  gfx.fillStyle(0x222222);
  gfx.fillRect(cx + 8, FLOOR - 90, 2, 24);
  gfx.fillRect(cx + 54, FLOOR - 90, 2, 24);

  // "BEER" sign above
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(cx - 40, FLOOR - 180, 100, 16);
  gfx.fillStyle(0x222222);
  gfx.fillRect(cx - 30, FLOOR - 176, 10, 8);
  gfx.fillRect(cx - 16, FLOOR - 176, 10, 8);
  gfx.fillRect(cx - 2, FLOOR - 176, 10, 8);
  gfx.fillRect(cx + 12, FLOOR - 176, 10, 8);

  // Neon "OPEN" sign
  const blink = Math.floor(state.currentTime) % 3 !== 0;
  gfx.fillStyle(0xff3377, blink ? 0.9 : 0.4);
  gfx.fillRect(210, 60, 50, 18);
  gfx.lineStyle(1, 0xff77aa, blink ? 0.9 : 0.3);
  gfx.strokeRect(210, 60, 50, 18);

  // Floor scuffs / shoe marks
  gfx.fillStyle(0x888888, 0.3);
  gfx.fillEllipse(200, FLOOR + 40, 40, 4);
  gfx.fillEllipse(350, FLOOR + 55, 30, 3);
}

export function drawHighway(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x444444);  // asphalt

  // Mountains in background (triangles)
  gfx.fillStyle(0x6a7a8a);
  gfx.fillTriangle(100, GROUND_Y - 60, 200, GROUND_Y - 160, 300, GROUND_Y - 60);
  gfx.fillStyle(0x5a6a7a);
  gfx.fillTriangle(250, GROUND_Y - 60, 380, GROUND_Y - 200, 500, GROUND_Y - 60);
  gfx.fillStyle(0x7a8a9a);
  gfx.fillTriangle(450, GROUND_Y - 60, 560, GROUND_Y - 140, 680, GROUND_Y - 60);
  // Snow caps
  gfx.fillStyle(0xffffff, 0.6);
  gfx.fillTriangle(185, GROUND_Y - 145, 200, GROUND_Y - 160, 215, GROUND_Y - 145);
  gfx.fillTriangle(360, GROUND_Y - 180, 380, GROUND_Y - 200, 400, GROUND_Y - 180);

  // Road extending to vanishing point (converging lines)
  const vanishX = 400;
  const vanishY = GROUND_Y - 40;
  // Left road edge
  gfx.lineStyle(2, 0xcccccc);
  gfx.lineBetween(0, SCREEN_H, vanishX - 5, vanishY);
  // Right road edge
  gfx.lineBetween(SCREEN_W, SCREEN_H, vanishX + 5, vanishY);

  // Dashed center line
  gfx.lineStyle(2, 0xd4a020);
  for (let i = 0; i < 12; i++) {
    const t0 = i / 12;
    const t1 = (i + 0.5) / 12;
    const x0 = vanishX + (SCREEN_W / 2 - vanishX) * 0;  // center line
    const y0start = vanishY + (SCREEN_H - vanishY) * t0;
    const y0end = vanishY + (SCREEN_H - vanishY) * t1;
    gfx.lineBetween(SCREEN_W / 2, y0start, SCREEN_W / 2, y0end);
  }

  // Guardrails (left side)
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(30, GROUND_Y - 15, 120, 3);
  // Posts
  gfx.fillRect(30, GROUND_Y - 20, 3, 20);
  gfx.fillRect(70, GROUND_Y - 20, 3, 20);
  gfx.fillRect(110, GROUND_Y - 20, 3, 20);
  gfx.fillRect(150, GROUND_Y - 20, 3, 20);

  // Guardrails (right side)
  gfx.fillRect(650, GROUND_Y - 15, 120, 3);
  gfx.fillRect(650, GROUND_Y - 20, 3, 20);
  gfx.fillRect(690, GROUND_Y - 20, 3, 20);
  gfx.fillRect(730, GROUND_Y - 20, 3, 20);
  gfx.fillRect(770, GROUND_Y - 20, 3, 20);

  // Road sign (right side)
  gfx.fillStyle(0x555555);
  gfx.fillRect(620, GROUND_Y - 80, 4, 80);
  gfx.fillStyle(0x228833);
  gfx.fillRect(600, GROUND_Y - 90, 50, 18);

  // Speed limit sign (left side)
  gfx.fillStyle(0x555555);
  gfx.fillRect(170, GROUND_Y - 70, 4, 70);
  gfx.fillStyle(0xffffff);
  gfx.fillRect(160, GROUND_Y - 85, 25, 20);
  gfx.lineStyle(1, 0x000000);
  gfx.strokeRect(160, GROUND_Y - 85, 25, 20);

  // Parked minivan at pulloff
  gfx.fillStyle(0x6b8cae);
  gfx.fillRect(250, GROUND_Y - 22, 80, 22);
  // Minivan roof
  gfx.fillStyle(0x5a7a9a);
  gfx.fillRect(260, GROUND_Y - 36, 55, 14);
  // Wheels
  gfx.fillStyle(0x222222);
  gfx.fillCircle(270, GROUND_Y, 5);
  gfx.fillCircle(315, GROUND_Y, 5);
  // Hazard lights
  gfx.fillStyle(0xf0a020, 0.7);
  gfx.fillRect(250, GROUND_Y - 16, 4, 4);
  gfx.fillRect(326, GROUND_Y - 16, 4, 4);

  // Modded Car Guy hanging out by the road — he's the t2 racer
  drawNpc(gfx, 'modded_car_guy', 400, GROUND_Y);
}

// ============================================================
// Shared scene elements
// ============================================================

function drawGrill(gfx: Phaser.GameObjects.Graphics, grillX: number, grillY: number, status: string): void {
  gfx.fillStyle(0x2d2d2d);
  gfx.fillRect(grillX, grillY, 40, 24);

  if (status === 'supplies_bought') {
    gfx.fillStyle(0x6b4c2a);
    gfx.fillRect(grillX + 50, grillY + 10, 12, 14);
  } else if (status === 'prepped') {
    gfx.fillStyle(0xff6600);
    gfx.fillCircle(grillX + 10, grillY + 8, 3);
    gfx.fillCircle(grillX + 22, grillY + 10, 3);
    gfx.fillCircle(grillX + 32, grillY + 8, 2);
  } else if (status === 'cooking') {
    gfx.fillStyle(0x6b4c2a);
    gfx.fillCircle(grillX + 10, grillY + 8, 4);
    gfx.fillCircle(grillX + 24, grillY + 8, 4);
    gfx.fillCircle(grillX + 35, grillY + 8, 4);
    gfx.lineStyle(1, 0xaaaaaa, 0.5);
    gfx.lineBetween(grillX + 15, grillY - 5, grillX + 12, grillY - 20);
    gfx.lineBetween(grillX + 25, grillY - 3, grillX + 28, grillY - 18);
  } else if (status === 'done') {
    gfx.fillStyle(0xc8a040);
    gfx.fillCircle(grillX + 10, grillY + 8, 4);
    gfx.fillCircle(grillX + 24, grillY + 8, 4);
    gfx.fillCircle(grillX + 35, grillY + 8, 4);
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(grillX + 50, grillY + 5, 25, 15);
  } else if (status === 'burnt') {
    gfx.fillStyle(0x111111);
    gfx.fillCircle(grillX + 10, grillY + 8, 4);
    gfx.fillCircle(grillX + 24, grillY + 8, 4);
    gfx.fillCircle(grillX + 35, grillY + 8, 4);
    gfx.lineStyle(2, 0x444444, 0.6);
    gfx.lineBetween(grillX + 15, grillY - 5, grillX + 10, grillY - 25);
    gfx.lineBetween(grillX + 25, grillY - 3, grillX + 30, grillY - 22);
  }
}

function drawStringLights(gfx: Phaser.GameObjects.Graphics): void {
  for (let i = 0; i < 10; i++) {
    const lx = 120 + i * 60;
    const ly = 40 + Math.sin(i * 0.5) * 10;
    gfx.fillStyle(0xf0e060);
    gfx.fillCircle(lx, ly, 3);
  }
}

// ============================================================
// Phase 2b — Strip Club + Trap House
// ============================================================

export function drawStripClub(gfx: Phaser.GameObjects.Graphics, _state: DadState): void {
  drawDimInterior(gfx, { wall: 0x1a0a1a, floor: 0x2a1a2a, vignetteAlpha: 0.5 });

  // Mood lights — pink center, blue/purple wings
  drawMoodLight(gfx, 400, 220, 0xff6688, 120);
  drawMoodLight(gfx, 120, 100, 0x66aaff, 120);
  drawMoodLight(gfx, 680, 100, 0xaa66ff, 120);

  // Stage with pole, downstage center
  drawStage(gfx, 400, 340);
  drawStripperPole(gfx, 400, 340, 180);

  // Bar (left)
  drawBarCounter(gfx, 150, 340);

  // Couch (right — for VIP-curious khakis)
  drawCouch(gfx, 620, 340, 0x4a2a4a);

  // Crowd silhouettes around the stage
  drawCrowdSilhouettes(gfx, 400, 310, 8, 200);

  // Foreground NPCs
  drawNpc(gfx, 'bouncer', 100, 400);
  drawNpc(gfx, 'bartender_club', 150, 400);
  drawNpc(gfx, 'candi', 320, 400);
  drawNpc(gfx, 'destiny', 480, 400);
  // Amber on stage (slightly raised — stage top sits at y≈340-10)
  drawNpc(gfx, 'amber', 400, 332);
}

export function drawStripClubVip(gfx: Phaser.GameObjects.Graphics, _state: DadState): void {
  drawDimInterior(gfx, { wall: 0x2a0a2a, floor: 0x3a1a3a, vignetteAlpha: 0.6 });

  // One unkind pink lamp
  drawMoodLight(gfx, 400, 220, 0xff3377, 180);

  // Red couch, center
  drawCouch(gfx, 400, 350, 0x4a1a3a);

  // Amber, centered
  drawNpc(gfx, 'amber', 400, 400);
}

export function drawGirlsApartment(gfx: Phaser.GameObjects.Graphics, _state: DadState): void {
  drawDimInterior(gfx, { wall: 0x3a2a3a, floor: 0x4a3a3a, vignetteAlpha: 0.3 });

  // Lava lamp warmth halo
  drawMoodLight(gfx, 200, 100, 0xffaa44, 140);

  // Couch
  drawCouch(gfx, 400, 380, 0x6a3a6a);

  // Lava lamp — base + glass cylinder + wavy blob
  const lampX = 200;
  const lampBaseY = 380;
  // Base
  gfx.fillStyle(0x222222);
  gfx.fillRect(lampX - 10, lampBaseY - 10, 20, 10);
  // Glass cylinder
  gfx.fillStyle(0xffaa44, 0.45);
  gfx.fillRect(lampX - 7, lampBaseY - 70, 14, 60);
  // Cap
  gfx.fillStyle(0x222222);
  gfx.fillRect(lampX - 10, lampBaseY - 76, 20, 6);
  // Wavy blob inside
  const blobOffset = Math.sin(_sceneAnimTime * 1.3) * 6;
  gfx.fillStyle(0xff7733);
  gfx.fillEllipse(lampX, lampBaseY - 35 + blobOffset, 10, 14);
  gfx.fillEllipse(lampX + 2, lampBaseY - 50 - blobOffset * 0.5, 6, 8);

  // The Girls on the couch
  drawNpc(gfx, 'the_girls', 380, 380);
}

export function drawTrapHouse(gfx: Phaser.GameObjects.Graphics, _state: DadState): void {
  drawDimInterior(gfx, { wall: 0x2a2a1a, floor: 0x1a2a1a, vignetteAlpha: 0.6 });

  // Sickly green light from one fixture
  drawMoodLight(gfx, 400, 120, 0x88aa66, 100);

  // Couch
  drawCouch(gfx, 500, 380, 0x3a3a2a);

  // Boarded window (upper left)
  gfx.fillStyle(0x111111);
  gfx.fillRect(80, 80, 100, 70);
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(80, 90, 100, 8);
  gfx.fillRect(80, 110, 100, 8);
  gfx.fillRect(80, 130, 100, 8);
  // Diagonal plank
  gfx.lineStyle(8, 0x6a4a2a);
  gfx.lineBetween(80, 80, 180, 150);

  // Card table with cash piles
  const tableX = 350;
  const tableY = 360;
  gfx.fillStyle(0x222222);
  gfx.fillRect(tableX - 50, tableY - 4, 100, 4);
  gfx.fillStyle(0x111111);
  gfx.fillRect(tableX - 48, tableY, 4, 18);
  gfx.fillRect(tableX + 44, tableY, 4, 18);
  // Four cash piles
  for (let i = 0; i < 4; i++) {
    gfx.fillStyle(0x4a8a4a);
    gfx.fillRect(tableX - 40 + i * 22, tableY - 10, 16, 6);
    gfx.fillStyle(0x6aa66a);
    gfx.fillRect(tableX - 40 + i * 22, tableY - 12, 16, 2);
  }

  // NPCs
  drawNpc(gfx, 'dealer', 150, 400);
  drawNpc(gfx, 'crackhead_jim', 300, 400);
  drawNpc(gfx, 'trina', 520, 380);
  drawNpc(gfx, 'tweaker_rayray', 650, 400);
}
