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

// ============================================================
// Pixel font — 3×5 monospace for signage
// ============================================================

const FONT_3x5: Record<string, string[]> = {
  'A': ['010','101','111','101','101'],
  'B': ['110','101','110','101','110'],
  'C': ['011','100','100','100','011'],
  'D': ['110','101','101','101','110'],
  'E': ['111','100','110','100','111'],
  'F': ['111','100','110','100','100'],
  'G': ['011','100','101','101','011'],
  'H': ['101','101','111','101','101'],
  'I': ['111','010','010','010','111'],
  'J': ['001','001','001','101','010'],
  'K': ['101','101','110','101','101'],
  'L': ['100','100','100','100','111'],
  'M': ['101','111','111','101','101'],
  'N': ['101','111','111','111','101'],
  'O': ['010','101','101','101','010'],
  'P': ['110','101','110','100','100'],
  'Q': ['010','101','101','111','011'],
  'R': ['110','101','110','110','101'],
  'S': ['011','100','010','001','110'],
  'T': ['111','010','010','010','010'],
  'U': ['101','101','101','101','111'],
  'V': ['101','101','101','101','010'],
  'W': ['101','101','111','111','101'],
  'X': ['101','101','010','101','101'],
  'Y': ['101','101','010','010','010'],
  'Z': ['111','001','010','100','111'],
  '0': ['010','101','101','101','010'],
  '1': ['010','110','010','010','111'],
  '2': ['110','001','010','100','111'],
  '3': ['110','001','010','001','110'],
  '4': ['101','101','111','001','001'],
  '5': ['111','100','110','001','110'],
  '6': ['011','100','110','101','010'],
  '7': ['111','001','010','010','010'],
  '8': ['010','101','010','101','010'],
  '9': ['010','101','011','001','110'],
  "'": ['010','010','000','000','000'],
  '.': ['000','000','000','000','010'],
  '!': ['010','010','010','000','010'],
  '?': ['110','001','010','000','010'],
  '$': ['011','110','010','011','110'],
  '&': ['010','101','010','111','011'],
  ' ': ['000','000','000','000','000'],
  '-': ['000','000','111','000','000'],
  ':': ['000','010','000','010','000'],
};

/**
 * Render uppercase pixel text at (x, y) with the top-left of the first glyph.
 * Each glyph is 3 cols × 5 rows. `scale` multiplies pixel size. Letters are
 * separated by a 1-pixel (scaled) gap.
 */
export function drawPixelText(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  text: string,
  scale: number = 2,
  color: number = 0xffffff,
  alpha: number = 1,
): void {
  const chars = text.toUpperCase().split('');
  gfx.fillStyle(color, alpha);
  let cx = x;
  for (const c of chars) {
    const pat = FONT_3x5[c] ?? FONT_3x5[' '];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (pat[row][col] === '1') {
          gfx.fillRect(cx + col * scale, y + row * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;   // 3 col glyph + 1 col gap
  }
}

/** Returns the pixel width of `text` rendered with drawPixelText at `scale`. */
export function pixelTextWidth(text: string, scale: number = 2): number {
  if (text.length === 0) return 0;
  return text.length * 4 * scale - scale;  // drop the trailing gap
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

export function drawIntoxOverlay(gfx: Phaser.GameObjects.Graphics, sobrietyOrState: number | DadState): void {
  // Support legacy sobriety-only calls
  const state: DadState | null = typeof sobrietyOrState === 'number' ? null : sobrietyOrState;
  const sobriety = state ? state.sobriety : (sobrietyOrState as number);
  const drugs = state ? (state.vices?.drugs ?? 0) : 0;
  const suspicion = state ? (state.suspicion ?? 0) : 0;

  if (sobriety >= 80 && drugs === 0) return;

  // Base color + alpha from sobriety
  let color: number;
  let alpha: number;
  if (sobriety < 20) { color = 0x9b6b9b; alpha = 0.3; }
  else if (sobriety < 40) { color = 0x9b6b9b; alpha = 0.2; }
  else if (sobriety < 60) { color = 0xd4a54a; alpha = 0.15; }
  else { color = 0xd4a54a; alpha = 0.08; }

  // Drugs add a subtle magenta tint — NOT darken. Keep the scene readable.
  if (drugs >= 1) {
    color = 0xcc66bb;
    alpha = Math.min(0.14, 0.04 + drugs * 0.04);
  }

  gfx.fillStyle(color, alpha);
  gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Only the extreme "crawl to the Ferrari" state adds a tunnel vision hint.
  // Triggered only when vices.drugs >= 2 AND sobriety < 20 — a narrow window.
  if (drugs >= 2 && sobriety < 20) {
    const pulseT = performance.now() / 1000;
    const pulse = Math.sin(pulseT * 1.2) * 0.5 + 0.5;
    gfx.fillStyle(0xff77cc, 0.05 + pulse * 0.03);
    gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  // Suspicion tints slightly red — very subtle
  if (suspicion >= 80) {
    gfx.fillStyle(0xcc2222, 0.04);
    gfx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
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
  void state;
  const FLOOR_Y = 350;

  // ── Walls ──
  // Upper wall — warm cream
  gfx.fillStyle(0xf0e4c8);
  gfx.fillRect(0, 0, SCREEN_W, FLOOR_Y);
  // Ceiling shadow
  gfx.fillStyle(0x000000, 0.08);
  gfx.fillRect(0, 0, SCREEN_W, 14);
  // Crown molding — layered white + beige
  gfx.fillStyle(0xffffff);
  gfx.fillRect(0, 10, SCREEN_W, 6);
  gfx.fillStyle(0xe4d0a8);
  gfx.fillRect(0, 16, SCREEN_W, 2);
  // Wainscoting (bottom third of wall) — off-white panels
  gfx.fillStyle(0xf8f4e8);
  gfx.fillRect(0, FLOOR_Y - 78, SCREEN_W, 78);
  // Chair rail
  gfx.fillStyle(0xd4c8a8);
  gfx.fillRect(0, FLOOR_Y - 82, SCREEN_W, 4);
  gfx.fillStyle(0xe8dcbc);
  gfx.fillRect(0, FLOOR_Y - 80, SCREEN_W, 1);
  // Baseboard
  gfx.fillStyle(0xffffff);
  gfx.fillRect(0, FLOOR_Y - 8, SCREEN_W, 8);
  gfx.fillStyle(0xd4c8a8);
  gfx.fillRect(0, FLOOR_Y - 9, SCREEN_W, 1);
  // Wainscoting vertical panel dividers
  gfx.lineStyle(1, 0xd8ccb0, 0.55);
  for (let vx = 60; vx < SCREEN_W; vx += 70) {
    gfx.lineBetween(vx, FLOOR_Y - 76, vx, FLOOR_Y - 10);
  }

  // ── Hardwood floor ──
  gfx.fillStyle(0x8a5a2a);
  gfx.fillRect(0, FLOOR_Y, SCREEN_W, SCREEN_H - FLOOR_Y);
  gfx.lineStyle(1, 0x5a3a1a, 0.55);
  for (let py = FLOOR_Y + 14; py < SCREEN_H; py += 14) {
    gfx.lineBetween(0, py, SCREEN_W, py);
  }
  // Plank seams (staggered)
  for (let row = 0; row < 7; row++) {
    const ry = FLOOR_Y + row * 14;
    const stagger = (row % 2) * 40;
    for (let px = 20 + stagger; px < SCREEN_W; px += 90) {
      gfx.lineBetween(px, ry, px, ry + 14);
    }
  }

  // ── Big picture window (center back wall) ──
  const winX = 280, winY = 34, winW = 220, winH = 170;
  // Outer trim (shadow)
  gfx.fillStyle(0xd4c8a8);
  gfx.fillRect(winX - 14, winY - 12, winW + 28, winH + 24);
  // Inner frame — crisp white
  gfx.fillStyle(0xffffff);
  gfx.fillRect(winX - 10, winY - 8, winW + 20, winH + 16);
  // Sky gradient (morning)
  gfx.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xd8e8f0, 0xd8e8f0);
  gfx.fillRect(winX, winY, winW, winH);
  // Clouds
  gfx.fillStyle(0xffffff, 0.85);
  gfx.fillEllipse(winX + 54, winY + 36, 40, 14);
  gfx.fillEllipse(winX + 164, winY + 58, 52, 16);
  gfx.fillEllipse(winX + 110, winY + 90, 30, 10);
  // Distant sun glow
  gfx.fillStyle(0xfff4c8, 0.5);
  gfx.fillCircle(winX + winW - 50, winY + 44, 16);
  // Neighborhood background — row of suburban houses
  // Neighbor 1 — blue
  gfx.fillStyle(0xb8c8d8);
  gfx.fillRect(winX + 12, winY + 118, 54, 40);
  gfx.fillStyle(0x4a5a7a);
  gfx.fillTriangle(winX + 8, winY + 118, winX + 70, winY + 118, winX + 39, winY + 96);
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(winX + 22, winY + 130, 10, 10);
  gfx.fillRect(winX + 44, winY + 130, 10, 10);
  // Neighbor 2 — warm yellow
  gfx.fillStyle(0xe8d4a8);
  gfx.fillRect(winX + 82, winY + 114, 64, 44);
  gfx.fillStyle(0x7a3a14);
  gfx.fillTriangle(winX + 76, winY + 114, winX + 152, winY + 114, winX + 114, winY + 90);
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(winX + 92, winY + 128, 12, 12);
  gfx.fillRect(winX + 124, winY + 128, 12, 12);
  // Neighbor 3 — sage
  gfx.fillStyle(0xc8d4a8);
  gfx.fillRect(winX + 162, winY + 120, 48, 38);
  gfx.fillStyle(0x4a5a2a);
  gfx.fillTriangle(winX + 158, winY + 120, winX + 214, winY + 120, winX + 186, winY + 100);
  // Tree in the middle
  gfx.fillStyle(0x6b4c2a);
  gfx.fillRect(winX + 72, winY + 122, 6, 36);
  gfx.fillStyle(0x3a8a3a);
  gfx.fillEllipse(winX + 75, winY + 110, 34, 28);
  // Picket fence across the front
  gfx.fillStyle(0xffffff);
  for (let fx = winX + 4; fx < winX + winW - 4; fx += 10) {
    gfx.fillRect(fx, winY + 148, 3, 12);
  }
  gfx.fillRect(winX, winY + 154, winW, 2);
  // Lush lawn
  gfx.fillStyle(0x5a9e3a);
  gfx.fillRect(winX, winY + 160, winW, 10);
  // Window mullions — cross + vertical thirds
  gfx.fillStyle(0xffffff);
  gfx.fillRect(winX + winW / 3 - 2, winY, 4, winH);
  gfx.fillRect(winX + (winW * 2) / 3 - 2, winY, 4, winH);
  gfx.fillRect(winX, winY + winH / 2 - 2, winW, 4);
  // Sill + apron
  gfx.fillStyle(0xe4d0a8);
  gfx.fillRect(winX - 18, winY + winH + 8, winW + 36, 8);
  gfx.fillStyle(0xd4c08c);
  gfx.fillRect(winX - 12, winY + winH + 16, winW + 24, 3);
  // Curtains — cream sheers with gold tie-backs
  gfx.fillStyle(0xf4e8cc, 0.85);
  gfx.fillRect(winX - 24, winY - 12, 20, winH + 26);
  gfx.fillRect(winX + winW + 4, winY - 12, 20, winH + 26);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(winX - 16, winY + winH / 2, 3);
  gfx.fillCircle(winX + winW + 14, winY + winH / 2, 3);

  // ── Floral wall art (above sofa, left of window) ──
  const fX = 110, fY = 58, fW = 88, fH = 108;
  // Gilded frame layers
  gfx.fillStyle(0x8a6a1a);
  gfx.fillRect(fX - 8, fY - 8, fW + 16, fH + 16);
  gfx.fillStyle(0xd4a838);
  gfx.fillRect(fX - 5, fY - 5, fW + 10, fH + 10);
  gfx.fillStyle(0xffdc84);
  gfx.fillRect(fX - 3, fY - 3, fW + 6, 2);
  gfx.fillRect(fX - 3, fY + fH + 1, fW + 6, 2);
  // Canvas — aged cream
  gfx.fillStyle(0xf0dcc0);
  gfx.fillRect(fX, fY, fW, fH);
  // Porcelain vase
  gfx.fillStyle(0xe8ecf4);
  gfx.fillTriangle(fX + 28, fY + 64, fX + 60, fY + 64, fX + 52, fY + 94);
  gfx.fillTriangle(fX + 28, fY + 64, fX + 52, fY + 94, fX + 36, fY + 94);
  // Blue china pattern
  gfx.fillStyle(0x3a6aa8);
  gfx.fillRect(fX + 32, fY + 76, 24, 2);
  gfx.fillCircle(fX + 44, fY + 84, 3);
  // Stems
  gfx.fillStyle(0x2a6a2a);
  for (let st = 0; st < 4; st++) {
    gfx.lineStyle(1, 0x2a6a2a);
    gfx.lineBetween(fX + 40 + st * 3, fY + 64, fX + 38 + st * 4, fY + 28 + st * 2);
  }
  // Roses (layered petals)
  const roses: [number, number, number, number][] = [
    [fX + 30, fY + 32, 8, 0xff99aa],
    [fX + 52, fY + 24, 8, 0xffb8c4],
    [fX + 64, fY + 42, 7, 0xff99aa],
    [fX + 42, fY + 46, 6, 0xffccdc],
    [fX + 20, fY + 48, 6, 0xff8aa0],
  ];
  for (const [rx, ry, rr, rc] of roses) {
    gfx.fillStyle(rc);
    gfx.fillCircle(rx, ry, rr);
    gfx.fillStyle(0xcc3a5a);
    gfx.fillCircle(rx, ry, Math.max(2, rr - 4));
    // Highlight
    gfx.fillStyle(0xffffff, 0.6);
    gfx.fillCircle(rx - rr / 3, ry - rr / 3, 1.5);
  }
  // Leaves
  gfx.fillStyle(0x2a6a2a);
  gfx.fillEllipse(fX + 20, fY + 52, 12, 4);
  gfx.fillEllipse(fX + 62, fY + 58, 14, 4);
  gfx.fillEllipse(fX + 48, fY + 60, 10, 3);

  // ── Eagle-soaring landscape (above dining, right of window) ──
  const eX = 544, eY = 42, eW = 200, eH = 110;
  // Heavy rustic wood frame
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(eX - 10, eY - 10, eW + 20, eH + 20);
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(eX - 7, eY - 7, eW + 14, eH + 14);
  gfx.fillStyle(0x8a6a3a);
  gfx.fillRect(eX - 4, eY - 4, eW + 8, 2);
  gfx.fillRect(eX - 4, eY + eH + 2, eW + 8, 2);
  // Sunset sky
  gfx.fillGradientStyle(0xf0a040, 0xf0a040, 0xf4d488, 0xf4d488);
  gfx.fillRect(eX, eY, eW, Math.floor(eH * 0.55));
  // Distant sun disc
  gfx.fillStyle(0xfff0a8);
  gfx.fillCircle(eX + eW - 48, eY + 22, 12);
  gfx.fillStyle(0xffd468, 0.6);
  gfx.fillCircle(eX + eW - 48, eY + 22, 18);
  // Mountain silhouettes (back range — lighter)
  gfx.fillStyle(0x5a6a8a);
  gfx.fillTriangle(eX, eY + eH * 0.6, eX + 70, eY + eH * 0.3, eX + 130, eY + eH * 0.55);
  gfx.fillTriangle(eX + 90, eY + eH * 0.55, eX + 160, eY + eH * 0.25, eX + eW, eY + eH * 0.5);
  // Mountain silhouettes (front range — darker)
  gfx.fillStyle(0x3a4a5a);
  gfx.fillTriangle(eX - 4, eY + eH * 0.7, eX + 48, eY + eH * 0.42, eX + 100, eY + eH * 0.7);
  gfx.fillTriangle(eX + 70, eY + eH * 0.7, eX + 130, eY + eH * 0.4, eX + 180, eY + eH * 0.7);
  gfx.fillTriangle(eX + 150, eY + eH * 0.7, eX + 190, eY + eH * 0.5, eX + eW, eY + eH * 0.7);
  // Snowcaps
  gfx.fillStyle(0xffffff);
  gfx.fillTriangle(eX + 44, eY + eH * 0.46, eX + 52, eY + eH * 0.42, eX + 58, eY + eH * 0.5);
  gfx.fillTriangle(eX + 126, eY + eH * 0.44, eX + 134, eY + eH * 0.4, eX + 140, eY + eH * 0.48);
  // Evergreen forest at base
  gfx.fillStyle(0x1a3a1a);
  gfx.fillRect(eX, eY + eH * 0.7, eW, eH * 0.3);
  for (let tr = 0; tr < 14; tr++) {
    const tx = eX + 4 + tr * 14;
    const th = 10 + (tr % 3) * 3;
    gfx.fillStyle(0x2a5a2a);
    gfx.fillTriangle(tx - 4, eY + eH * 0.72 + th, tx + 4, eY + eH * 0.72 + th, tx, eY + eH * 0.72);
  }
  // Reflective lake (small patch at base)
  gfx.fillStyle(0x6a8aba);
  gfx.fillRect(eX + 60, eY + eH - 10, 90, 8);
  gfx.fillStyle(0xaaccee, 0.5);
  gfx.fillRect(eX + 60, eY + eH - 10, 90, 2);
  // The bald eagle — center, wings spread
  const egX = eX + eW / 2 - 8;
  const egY = eY + eH * 0.32;
  gfx.fillStyle(0x3a2a1a);
  // Body
  gfx.fillEllipse(egX, egY + 2, 14, 6);
  // Wings — swept with multiple feather segments
  gfx.fillTriangle(egX - 7, egY, egX - 36, egY - 10, egX - 12, egY + 4);
  gfx.fillTriangle(egX - 26, egY - 8, egX - 42, egY + 2, egX - 14, egY + 3);
  gfx.fillTriangle(egX + 7, egY, egX + 36, egY - 10, egX + 12, egY + 4);
  gfx.fillTriangle(egX + 26, egY - 8, egX + 42, egY + 2, egX + 14, egY + 3);
  // Wing tip feathers
  gfx.fillStyle(0x1a0a00);
  gfx.fillRect(egX - 42, egY, 4, 2);
  gfx.fillRect(egX + 38, egY, 4, 2);
  // White head
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(egX, egY - 1, 3);
  // Yellow beak
  gfx.fillStyle(0xd4a020);
  gfx.fillTriangle(egX + 2, egY - 2, egX + 5, egY, egX + 2, egY + 1);
  // Eye
  gfx.fillStyle(0x000000);
  gfx.fillCircle(egX - 1, egY - 1, 0.8);
  // White tail feathers
  gfx.fillStyle(0xffffff);
  gfx.fillTriangle(egX - 4, egY + 6, egX + 4, egY + 6, egX, egY + 12);

  // Small brass plaque on the eagle frame
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(eX + eW / 2 - 22, eY + eH + 4, 44, 6);
  {
    const label = 'AMERICA';
    const scale = 1;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, eX + eW / 2 - tw / 2, eY + eH + 5, label, scale, 0x3a1a0a);
  }

  // ── Sofa (living room area, left) ──
  const sfX = 86, sfY = FLOOR_Y - 58;
  gfx.fillStyle(0x4a6a8a);
  gfx.fillRect(sfX, sfY, 142, 24);
  gfx.fillRect(sfX - 8, sfY, 10, 52);
  gfx.fillRect(sfX + 140, sfY, 10, 52);
  gfx.fillStyle(0x3a5a7a);
  gfx.fillRect(sfX, sfY + 24, 142, 28);
  // Cushion seams
  gfx.lineStyle(1, 0x2a3a5a, 0.6);
  gfx.lineBetween(sfX + 47, sfY + 24, sfX + 47, sfY + 52);
  gfx.lineBetween(sfX + 95, sfY + 24, sfX + 95, sfY + 52);
  // Floral throw pillows
  const drawThrowPillow = (ppx: number) => {
    gfx.fillStyle(0xf0d4c8);
    gfx.fillRect(ppx, sfY + 4, 24, 22);
    gfx.fillStyle(0xff99aa);
    gfx.fillCircle(ppx + 6, sfY + 10, 3);
    gfx.fillCircle(ppx + 18, sfY + 16, 3);
    gfx.fillStyle(0x3a7a3a);
    gfx.fillRect(ppx + 9, sfY + 12, 6, 1);
    gfx.fillRect(ppx + 13, sfY + 18, 6, 1);
  };
  drawThrowPillow(sfX + 6);
  drawThrowPillow(sfX + 112);
  // Sofa legs (dark wood)
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(sfX + 2, sfY + 52, 4, 6);
  gfx.fillRect(sfX + 136, sfY + 52, 4, 6);

  // Coffee table
  gfx.fillStyle(0x5a3a1a);
  gfx.fillRect(116, FLOOR_Y - 18, 104, 5);
  gfx.fillStyle(0x7a4a20);
  gfx.fillRect(116, FLOOR_Y - 18, 104, 1);
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(120, FLOOR_Y - 13, 3, 12);
  gfx.fillRect(213, FLOOR_Y - 13, 3, 12);
  // Coaster + magazine
  gfx.fillStyle(0xc4c4a0);
  gfx.fillRect(140, FLOOR_Y - 22, 26, 4);
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(140, FLOOR_Y - 22, 6, 4);
  gfx.fillStyle(0xffffff);
  gfx.fillCircle(190, FLOOR_Y - 20, 3);

  // Persian-style area rug
  gfx.fillStyle(0x8a2a2a);
  gfx.fillRect(58, FLOOR_Y - 8, 196, 22);
  gfx.fillStyle(0xd4a020, 0.45);
  gfx.fillRect(62, FLOOR_Y - 6, 188, 2);
  gfx.fillRect(62, FLOOR_Y + 10, 188, 2);
  gfx.fillStyle(0x3a6a8a);
  for (let rx = 80; rx < 252; rx += 22) gfx.fillCircle(rx, FLOOR_Y + 2, 2);
  gfx.fillStyle(0xd4a020);
  for (let rx = 91; rx < 252; rx += 22) gfx.fillCircle(rx, FLOOR_Y + 2, 1.5);
  // Fringe
  gfx.lineStyle(1, 0xd4a020, 0.6);
  for (let fx2 = 58; fx2 < 254; fx2 += 4) {
    gfx.lineBetween(fx2, FLOOR_Y + 14, fx2, FLOOR_Y + 18);
  }

  // Floor lamp in corner
  gfx.fillStyle(0x3a2a1a);
  gfx.fillRect(40, FLOOR_Y - 2, 16, 2);
  gfx.fillRect(46, FLOOR_Y - 112, 4, 110);
  gfx.fillStyle(0xe4d0a0);
  gfx.fillTriangle(36, FLOOR_Y - 114, 62, FLOOR_Y - 114, 49, FLOOR_Y - 138);
  gfx.fillStyle(0xc8a878);
  gfx.fillRect(36, FLOOR_Y - 114, 26, 2);
  // Warm glow
  gfx.fillStyle(0xfff0a0, 0.35);
  gfx.fillEllipse(49, FLOOR_Y - 110, 60, 14);

  // ── Dining table (right side) ──
  const tX = 520, tY = FLOOR_Y - 26;
  const tW = 180;
  // Tabletop — mahogany with highlight
  gfx.fillStyle(0x5a2a1a);
  gfx.fillRect(tX, tY, tW, 8);
  gfx.fillStyle(0x7a4020);
  gfx.fillRect(tX, tY, tW, 2);
  // Apron
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(tX + 4, tY + 8, tW - 8, 4);
  // Legs (turned, tapered)
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(tX + 10, tY + 12, 6, 14);
  gfx.fillRect(tX + tW - 16, tY + 12, 6, 14);
  // Dining chairs — two backs visible at the far side
  const drawDiningChair = (ccx: number) => {
    gfx.fillStyle(0x3a1a0a);
    gfx.fillRect(ccx - 12, tY - 26, 24, 24);
    gfx.fillStyle(0x5a2a1a);
    gfx.fillRect(ccx - 12, tY - 26, 24, 3);
    // Back slats
    gfx.fillStyle(0x2a0a00);
    gfx.fillRect(ccx - 7, tY - 22, 2, 16);
    gfx.fillRect(ccx - 1, tY - 22, 2, 16);
    gfx.fillRect(ccx + 5, tY - 22, 2, 16);
    // Seat cushion peek
    gfx.fillStyle(0xcc9966);
    gfx.fillRect(ccx - 10, tY - 4, 20, 3);
  };
  drawDiningChair(tX + 44);
  drawDiningChair(tX + 136);
  // Front-facing chair seats visible through the table
  gfx.fillStyle(0x4a2a1a);
  gfx.fillRect(tX + 30, tY + 8, 28, 4);
  gfx.fillRect(tX + 122, tY + 8, 28, 4);

  // Dining table runner + centerpiece
  gfx.fillStyle(0xe8dcbc);
  gfx.fillRect(tX + 30, tY + 1, tW - 60, 5);
  gfx.fillStyle(0xd4a020, 0.6);
  gfx.fillRect(tX + 30, tY + 1, tW - 60, 1);
  // Crystal vase
  gfx.fillStyle(0xdce8f4, 0.9);
  gfx.fillTriangle(tX + tW / 2 - 10, tY - 2, tX + tW / 2 + 10, tY - 2, tX + tW / 2 + 6, tY + 2);
  gfx.fillTriangle(tX + tW / 2 - 10, tY - 2, tX + tW / 2 + 6, tY + 2, tX + tW / 2 - 6, tY + 2);
  // Flowers (mixed)
  gfx.fillStyle(0xff99aa);
  gfx.fillCircle(tX + tW / 2 - 4, tY - 10, 3);
  gfx.fillCircle(tX + tW / 2 + 3, tY - 13, 3);
  gfx.fillStyle(0xfff0a0);
  gfx.fillCircle(tX + tW / 2 + 8, tY - 8, 2.5);
  gfx.fillStyle(0xff6699);
  gfx.fillCircle(tX + tW / 2 - 2, tY - 10, 1);
  // Leaves
  gfx.fillStyle(0x2a6a2a);
  gfx.fillEllipse(tX + tW / 2 - 7, tY - 5, 7, 2);
  gfx.fillEllipse(tX + tW / 2 + 7, tY - 4, 7, 2);

  // Brass candlesticks flanking the centerpiece
  for (const cdx of [tX + 40, tX + tW - 40]) {
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(cdx - 1, tY - 16, 2, 16);
    gfx.fillEllipse(cdx, tY, 6, 2);
    gfx.fillStyle(0xf0e8d0);
    gfx.fillRect(cdx - 1, tY - 20, 2, 4);
    gfx.fillStyle(0xffcc33);
    gfx.fillCircle(cdx, tY - 22, 2);
  }

  // Chandelier over the dining table
  const chX = tX + tW / 2;
  const chY = 24;
  gfx.fillStyle(0x6a6a6a);
  gfx.fillRect(chX - 1, 0, 2, chY);
  gfx.fillStyle(0xd4a020);
  gfx.fillEllipse(chX, chY, 44, 6);
  gfx.fillEllipse(chX, chY + 6, 32, 4);
  // Candles
  for (let ci = 0; ci < 5; ci++) {
    const cix = chX - 18 + ci * 9;
    gfx.fillStyle(0xf0e8d0);
    gfx.fillRect(cix - 1, chY - 4, 2, 4);
    gfx.fillStyle(0xfff0a0);
    gfx.fillCircle(cix, chY - 6, 1.5);
  }
  // Warm glow
  gfx.fillStyle(0xfff0a0, 0.25);
  gfx.fillEllipse(chX, chY + 4, 70, 18);

  // ── Bar cart / coffee station (left, preserves x=100 zone) ──
  gfx.fillStyle(0x3a2a1a);
  gfx.fillRect(86, FLOOR_Y - 44, 34, 44);
  gfx.fillStyle(0x5a3a1a);
  gfx.fillRect(86, FLOOR_Y - 44, 34, 2);
  gfx.fillRect(86, FLOOR_Y - 22, 34, 2);
  // Wheels
  gfx.fillStyle(0x222222);
  gfx.fillCircle(90, FLOOR_Y - 2, 2);
  gfx.fillCircle(116, FLOOR_Y - 2, 2);
  // Coffee maker on top
  gfx.fillStyle(0x111111);
  gfx.fillRect(92, FLOOR_Y - 62, 16, 18);
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(94, FLOOR_Y - 52, 12, 2);
  gfx.fillStyle(0x4a2a1a);
  gfx.fillRect(98, FLOOR_Y - 56, 6, 5);
  // Coffee mug beside it
  gfx.fillStyle(0xf4e4c0);
  gfx.fillRect(112, FLOOR_Y - 54, 9, 10);
  gfx.fillRect(121, FLOOR_Y - 51, 3, 4);
  gfx.fillStyle(0x5a3a1a);
  gfx.fillRect(113, FLOOR_Y - 53, 7, 2);
  // Steam
  gfx.lineStyle(1, 0xcccccc, 0.7);
  gfx.lineBetween(115, FLOOR_Y - 56, 118, FLOOR_Y - 68);
  gfx.lineBetween(118, FLOOR_Y - 56, 116, FLOOR_Y - 68);

  // ── Fridge (right edge, preserves x=720 note zone) ──
  const frX = SCREEN_W - 80, frY = FLOOR_Y - 120, frW = 64, frH = 120;
  // Shadow
  gfx.fillStyle(0x000000, 0.12);
  gfx.fillRect(frX + 4, FLOOR_Y - 4, frW, 4);
  // Body
  gfx.fillStyle(0xe8ece8);
  gfx.fillRect(frX, frY, frW, frH);
  gfx.fillStyle(0xf4f8f4);
  gfx.fillRect(frX, frY, 3, frH);
  gfx.lineStyle(1, 0xaaaaaa);
  gfx.strokeRect(frX, frY, frW, frH);
  // Freezer seam
  gfx.lineBetween(frX, frY + 36, frX + frW, frY + 36);
  // Handles
  gfx.fillStyle(0xb8b8b8);
  gfx.fillRect(frX + frW - 8, frY + 8, 3, 22);
  gfx.fillRect(frX + frW - 8, frY + 48, 3, 60);
  // Yellow note + magnet
  gfx.fillStyle(0xf0e080);
  gfx.fillRect(frX + 12, frY + 14, 22, 18);
  gfx.lineStyle(0.5, 0x6a5a0a, 0.7);
  gfx.lineBetween(frX + 15, frY + 20, frX + 32, frY + 20);
  gfx.lineBetween(frX + 15, frY + 24, frX + 32, frY + 24);
  gfx.lineBetween(frX + 15, frY + 28, frX + 28, frY + 28);
  gfx.fillStyle(0xcc3333);
  gfx.fillCircle(frX + 23, frY + 13, 2);
  // Family photo + extra magnet decoration
  gfx.fillStyle(0xffffff);
  gfx.fillRect(frX + 40, frY + 50, 18, 22);
  gfx.fillStyle(0xffa060);
  gfx.fillRect(frX + 42, frY + 54, 14, 12);
  gfx.fillStyle(0x3a2a1a);
  gfx.fillCircle(frX + 46, frY + 58, 2);
  gfx.fillCircle(frX + 52, frY + 58, 2);
  gfx.fillStyle(0xcc6699);
  gfx.fillCircle(frX + 54, frY + 66, 1.5);

  // ── Thanksgiving-ready sideboard under the eagle painting ──
  const sbX = 544, sbY = FLOOR_Y - 42;
  gfx.fillStyle(0x5a2a1a);
  gfx.fillRect(sbX, sbY, 200, 34);
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(sbX + 4, sbY + 4, 58, 26);
  gfx.fillRect(sbX + 70, sbY + 4, 58, 26);
  gfx.fillRect(sbX + 136, sbY + 4, 58, 26);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(sbX + 33, sbY + 17, 1.5);
  gfx.fillCircle(sbX + 99, sbY + 17, 1.5);
  gfx.fillCircle(sbX + 165, sbY + 17, 1.5);

  // ── American flag on a stand in the corner by the dining room ──
  gfx.fillStyle(0x6a4a2a);
  gfx.fillRect(SCREEN_W - 94, FLOOR_Y - 88, 3, 88);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(SCREEN_W - 93, FLOOR_Y - 92, 3);
  // Red stripes
  gfx.fillStyle(0xcc2233);
  for (let si = 0; si < 7; si++) {
    gfx.fillRect(SCREEN_W - 91, FLOOR_Y - 86 + si * 6, 44, 3);
  }
  // White stripes (transparent background between reds; add crisp white between)
  gfx.fillStyle(0xffffff);
  for (let si = 0; si < 6; si++) {
    gfx.fillRect(SCREEN_W - 91, FLOOR_Y - 83 + si * 6, 44, 3);
  }
  // Canton (blue field)
  gfx.fillStyle(0x2a3a88);
  gfx.fillRect(SCREEN_W - 91, FLOOR_Y - 86, 20, 18);
  // Stars (small dots)
  gfx.fillStyle(0xffffff);
  for (let sr = 0; sr < 4; sr++) {
    for (let sc = 0; sc < 4; sc++) {
      gfx.fillRect(SCREEN_W - 89 + sc * 5, FLOOR_Y - 84 + sr * 4, 1, 1);
    }
  }
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

  // ── Main house ─────────────────────────────────────────────
  // Shadow
  gfx.fillStyle(0x000000, 0.15);
  gfx.fillRect(30, GROUND_Y - 2, 170, 4);
  // Siding
  gfx.fillStyle(0xe8d4b8);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);
  // Roof (gable triangle above the rect)
  gfx.fillStyle(0x7a3a14);
  gfx.fillTriangle(15, GROUND_Y - 118, 205, GROUND_Y - 118, 110, GROUND_Y - 158);
  // Roof fascia
  gfx.fillStyle(0x5a2a0a);
  gfx.fillRect(15, GROUND_Y - 122, 190, 6);
  // Door
  gfx.fillStyle(0x654321);
  gfx.fillRect(90, GROUND_Y - 50, 30, 50);
  // Door glass
  gfx.fillStyle(0xaad4f0, 0.6);
  gfx.fillRect(95, GROUND_Y - 46, 10, 14);
  gfx.fillRect(109, GROUND_Y - 46, 10, 14);
  // Doorknob
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(116, GROUND_Y - 24, 2.5);
  // Door step
  gfx.fillStyle(0xb0966e);
  gfx.fillRect(86, GROUND_Y - 2, 38, 4);
  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(145, GROUND_Y - 95, 26, 25);
  gfx.lineStyle(1, 0xffffff, 0.9);
  gfx.strokeRect(45, GROUND_Y - 95, 30, 25);
  gfx.strokeRect(145, GROUND_Y - 95, 26, 25);
  // Window cross mullions
  gfx.lineStyle(1, 0xffffff, 0.6);
  gfx.lineBetween(60, GROUND_Y - 95, 60, GROUND_Y - 70);
  gfx.lineBetween(45, GROUND_Y - 82, 75, GROUND_Y - 82);
  gfx.lineBetween(158, GROUND_Y - 95, 158, GROUND_Y - 70);
  gfx.lineBetween(145, GROUND_Y - 82, 171, GROUND_Y - 82);
  // Karen in right window
  const karenHome = state.currentLocation !== 'kitchen';
  if (karenHome) {
    gfx.fillStyle(0xf0c89a);
    gfx.fillRect(151, GROUND_Y - 92, 10, 12);
    gfx.fillStyle(0x000000);
    gfx.fillCircle(154, GROUND_Y - 87, 1);
    gfx.fillCircle(158, GROUND_Y - 87, 1);
  }
  // Shutters
  gfx.fillStyle(0x3d5a28);
  gfx.fillRect(36, GROUND_Y - 97, 7, 27);
  gfx.fillRect(73, GROUND_Y - 97, 7, 27);
  gfx.fillRect(137, GROUND_Y - 97, 7, 27);
  gfx.fillRect(171, GROUND_Y - 97, 7, 27);

  // ── Detached garage (right beside the main house) ─────────
  const gx = 205;            // left edge of garage, adjacent to house (ends at x=200)
  const gy = GROUND_Y - 100; // top of garage walls
  const gw = 150;
  const gh = 100;

  // Shadow
  gfx.fillStyle(0x000000, 0.18);
  gfx.fillRect(gx + 4, GROUND_Y - 2, gw, 5);
  // Siding — same beige as main house
  gfx.fillStyle(0xe2cfa8);
  gfx.fillRect(gx, gy, gw, gh);
  // Gable roof (triangle peak)
  gfx.fillStyle(0x7a3a14);
  gfx.fillTriangle(gx - 8, gy + 2, gx + gw + 8, gy + 2, gx + gw / 2, gy - 40);
  // Roof fascia
  gfx.fillStyle(0x5a2a0a);
  gfx.fillRect(gx - 8, gy - 2, gw + 16, 5);
  // Roof shingles (horizontal lines)
  gfx.lineStyle(1, 0x5a2a0a, 0.4);
  for (let r = 0; r < 4; r++) {
    const rowY = gy - 8 - r * 10;
    const halfW = (gw / 2 + 8) * ((gy - rowY) / 40);
    gfx.lineBetween(gx + gw / 2 - halfW, rowY, gx + gw / 2 + halfW, rowY);
  }

  // Garage door — sectional panel door, slightly inset
  const gdx = gx + 14;
  const gdw = gw - 28;
  const gdh = 58;
  const gdy = GROUND_Y - gdh;
  // Door frame
  gfx.fillStyle(0x888888);
  gfx.fillRect(gdx - 2, gdy - 2, gdw + 4, gdh + 2);
  // Door panels (4 horizontal rows)
  const panelColors = [0xdddddd, 0xcccccc, 0xdddddd, 0xcccccc];
  const panelH = gdh / 4;
  for (let p = 0; p < 4; p++) {
    gfx.fillStyle(panelColors[p]);
    gfx.fillRect(gdx, gdy + p * panelH, gdw, panelH - 1);
    // Vertical ribs
    gfx.fillStyle(0xbbbbbb, 0.5);
    gfx.fillRect(gdx + Math.floor(gdw / 3), gdy + p * panelH, 1, panelH - 1);
    gfx.fillRect(gdx + Math.floor(gdw * 2 / 3), gdy + p * panelH, 1, panelH - 1);
  }
  // Center handle
  gfx.fillStyle(0x888888);
  gfx.fillRect(gdx + gdw / 2 - 7, gdy + gdh - 12, 14, 3);
  // Door track side rails
  gfx.fillStyle(0x777777);
  gfx.fillRect(gdx - 2, gdy - 2, 3, gdh + 2);
  gfx.fillRect(gdx + gdw - 1, gdy - 2, 3, gdh + 2);

  // Small window above garage door
  gfx.fillStyle(0x87ceeb, 0.85);
  gfx.fillRect(gx + gw / 2 - 12, gy + 8, 24, 16);
  gfx.lineStyle(1, 0xffffff, 0.6);
  gfx.lineBetween(gx + gw / 2, gy + 8, gx + gw / 2, gy + 24);
  gfx.lineBetween(gx + gw / 2 - 12, gy + 15, gx + gw / 2 + 12, gy + 15);

  // ── Concrete driveway ──────────────────────────────────────
  gfx.fillStyle(0xc8bfa8, 0.6);
  gfx.fillRect(gx, GROUND_Y - 2, 280, 20);   // driveway apron in front of garage

  // ── Property tree ─────────────────────────────────────────
  gfx.fillStyle(0x6b4c2a);
  gfx.fillRect(380, GROUND_Y - 62, 6, 62);
  gfx.fillStyle(0x3a8a3a);
  gfx.fillEllipse(383, GROUND_Y - 82, 38, 32);
  gfx.fillStyle(0x2a7a2a, 0.5);
  gfx.fillEllipse(393, GROUND_Y - 75, 22, 20);

  // ── Mailbox (at curb, property line) ──────────────────────
  gfx.fillStyle(0x555555);
  gfx.fillRect(530, GROUND_Y - 28, 2, 28);
  gfx.fillStyle(0x4a6fa5);
  gfx.fillRect(522, GROUND_Y - 38, 18, 12);
  gfx.fillStyle(0x6a8fc5);
  gfx.fillRect(522, GROUND_Y - 38, 18, 3);

  // ── Doug's house (right side of frontyard) ────────────────
  const dx = 560;
  const dy = GROUND_Y - 110;
  const dw = 180;
  const dh = 110;
  // Shadow
  gfx.fillStyle(0x000000, 0.15);
  gfx.fillRect(dx, GROUND_Y - 2, dw, 4);
  // Siding — pale olive / sage, distinct from main house
  gfx.fillStyle(0xc8d4a8);
  gfx.fillRect(dx, dy, dw, dh);
  // Roof gable — dark green asphalt
  gfx.fillStyle(0x4a5a2a);
  gfx.fillTriangle(dx - 8, dy + 2, dx + dw + 8, dy + 2, dx + dw / 2, dy - 38);
  gfx.fillStyle(0x2a3a1a);
  gfx.fillRect(dx - 8, dy - 2, dw + 16, 5);
  // Door — dark green
  gfx.fillStyle(0x3a5a3a);
  gfx.fillRect(dx + dw / 2 - 15, GROUND_Y - 48, 30, 48);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(dx + dw / 2 + 10, GROUND_Y - 24, 2.5);
  // Windows
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(dx + 15, dy + 20, 30, 25);
  gfx.fillRect(dx + dw - 45, dy + 20, 30, 25);
  gfx.lineStyle(1, 0xffffff, 0.9);
  gfx.strokeRect(dx + 15, dy + 20, 30, 25);
  gfx.strokeRect(dx + dw - 45, dy + 20, 30, 25);
  // Brenda in the left window (frowny)
  gfx.fillStyle(0xf0c89a);
  gfx.fillRect(dx + 25, dy + 22, 10, 12);
  gfx.fillStyle(0x000000);
  gfx.fillCircle(dx + 28, dy + 27, 1);
  gfx.fillCircle(dx + 32, dy + 27, 1);
  gfx.lineStyle(1, 0x000000);
  gfx.lineBetween(dx + 27, dy + 32, dx + 30, dy + 31);
  gfx.lineBetween(dx + 30, dy + 31, dx + 33, dy + 32);
  // "DOUG" mailbox style tag on the door (tiny gold)
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(dx + dw / 2 - 8, GROUND_Y - 58, 16, 4);
  // American flag on a little pole
  gfx.fillStyle(0x555555);
  gfx.fillRect(dx + dw - 10, dy + 60, 1, 40);
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(dx + dw - 10, dy + 60, 16, 10);
  gfx.fillStyle(0x2a3a88);
  gfx.fillRect(dx + dw - 10, dy + 60, 6, 5);

  // ── Minivan in driveway (in front of our garage) ──────────
  drawMinivan(gfx, 430, GROUND_Y);

  // Lawn mower (visible when lawn not done)
  if (lawnStatus < 100) {
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(490, GROUND_Y - 14, 20, 10);
    gfx.lineStyle(2, 0x555555);
    gfx.lineBetween(500, GROUND_Y - 14, 500, GROUND_Y - 30);
    gfx.lineBetween(495, GROUND_Y - 30, 505, GROUND_Y - 30);
    gfx.fillStyle(0x333333);
    gfx.fillCircle(493, GROUND_Y - 4, 3);
    gfx.fillCircle(507, GROUND_Y - 4, 3);
  }

  // ── Tamika's porch visible across the way (up-right, distant) ──
  // A small snippet of her coral-stucco porch peeks past Doug's house
  // to signal "she's right over there on the sidewalk". Sit her on the
  // chaise with her pink flamingo so it's unmistakably Tamika.
  {
    const tpx = 748;                 // distant porch anchor X
    const tpy = GROUND_Y - 42;       // elevated (further back in perspective)
    // Stucco wall corner peeking out
    gfx.fillStyle(0xf0c8a8);
    gfx.fillRect(tpx, tpy - 50, 52, 50);
    // Terracotta roof edge
    gfx.fillStyle(0xb45a2a);
    gfx.fillRect(tpx - 2, tpy - 58, 56, 10);
    // Porch deck
    gfx.fillStyle(0xc0a088);
    gfx.fillRect(tpx - 8, tpy, 60, 6);
    // Railing
    gfx.lineStyle(1, 0x8a7055);
    gfx.lineBetween(tpx - 8, tpy - 10, tpx - 8, tpy);
    gfx.lineBetween(tpx + 52, tpy - 10, tpx + 52, tpy);
    gfx.lineBetween(tpx - 8, tpy - 10, tpx + 52, tpy - 10);
    // Pink flamingo out front
    gfx.fillStyle(0xff6b9d);
    gfx.fillRect(tpx - 4, tpy + 6, 1, 9);
    gfx.fillEllipse(tpx - 3, tpy + 4, 6, 3);
    gfx.fillCircle(tpx - 1, tpy + 1, 1);
    // Chaise lounge sliver
    gfx.fillStyle(0xffd4a0);
    gfx.fillRect(tpx + 8, tpy - 4, 30, 3);
    gfx.fillRect(tpx + 30, tpy - 14, 10, 10);
    // Tamika silhouette on the chaise — dark skin, pink top, shades
    //   Head
    gfx.fillStyle(0x6a3a1a);
    gfx.fillCircle(tpx + 33, tpy - 16, 3);
    //   Shades
    gfx.fillStyle(0x111111);
    gfx.fillRect(tpx + 31, tpy - 17, 5, 1);
    //   Hot pink top
    gfx.fillStyle(0xff6b9d);
    gfx.fillRect(tpx + 15, tpy - 11, 20, 5);
    //   Curvy lower body
    gfx.fillStyle(0xf5d4a0);
    gfx.fillEllipse(tpx + 22, tpy - 5, 18, 4);
    //   Hair puff behind head
    gfx.fillStyle(0x1a1a1a);
    gfx.fillCircle(tpx + 31, tpy - 17, 2);
  }
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

  // Grill (state-dependent, Weber kettle)
  const grillStatus = (state.flags.grillStatus as string) ?? 'not_started';
  drawGrill(gfx, 350, GROUND_Y - 24, grillStatus);

  // Adirondack chair on the patio
  drawAdirondackChair(gfx, 180, GROUND_Y, 0xe8dcc0, 0xb8a880);
  // Second chair facing the other way, a bit back
  drawAdirondackChair(gfx, 470, GROUND_Y, 0x8fb4c8, 0x6a8ea0);

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

  // Poker Table — back corner of the "garage," visible always
  const pt = 560;
  // Table shadow
  gfx.fillStyle(0x000000, 0.3);
  gfx.fillEllipse(pt, GROUND_Y + 2, 80, 8);
  // Green felt
  gfx.fillStyle(0x2a6a3a);
  gfx.fillRect(pt - 36, GROUND_Y - 22, 72, 20);
  // Trim
  gfx.fillStyle(0x1a4a2a);
  gfx.fillRect(pt - 36, GROUND_Y - 24, 72, 2);
  // Stacked chips
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(pt - 28, GROUND_Y - 28, 10, 6);
  gfx.fillStyle(0x3333cc);
  gfx.fillRect(pt - 16, GROUND_Y - 28, 10, 6);
  gfx.fillStyle(0x33cc33);
  gfx.fillRect(pt - 4, GROUND_Y - 28, 10, 6);
  gfx.fillStyle(0x333333);
  gfx.fillRect(pt + 8, GROUND_Y - 28, 10, 6);
  // Playing cards (fan)
  gfx.fillStyle(0xffffff);
  gfx.fillRect(pt - 10, GROUND_Y - 12, 8, 10);
  gfx.fillRect(pt, GROUND_Y - 12, 8, 10);
  // Red suit dots
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(pt - 7, GROUND_Y - 9, 2, 2);
  gfx.fillRect(pt + 3, GROUND_Y - 9, 2, 2);
  // Legs
  gfx.fillStyle(0x444444);
  gfx.fillRect(pt - 30, GROUND_Y - 2, 2, 16);
  gfx.fillRect(pt + 28, GROUND_Y - 2, 2, 16);
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

  // The Girls — always two of them, hanging out together
  if (time >= 570 || (state.vices.drugs ?? 0) >= 1) {
    drawNpc(gfx, 'the_girls', 468, GROUND_Y);
    drawNpc(gfx, 'candi', 494, GROUND_Y, { sz: 0.95 });
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

  // Stucco ranch house (pale coral — Florida vibes)
  gfx.fillStyle(0xf0c8a8);
  gfx.fillRect(30, GROUND_Y - 120, 170, 120);
  // Terracotta tile roof
  gfx.fillStyle(0xb45a2a);
  gfx.fillRect(20, GROUND_Y - 140, 190, 25);
  gfx.lineStyle(1, 0x7a3a14, 0.5);
  for (let i = 0; i < 8; i++) {
    gfx.lineBetween(20 + i * 25, GROUND_Y - 140, 20 + i * 25, GROUND_Y - 115);
  }
  // Door — teal
  gfx.fillStyle(0x3a8a8a);
  gfx.fillRect(90, GROUND_Y - 48, 30, 48);
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(113, GROUND_Y - 24, 2);
  // Windows (with pink drapes visible)
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(45, GROUND_Y - 95, 30, 25);
  gfx.fillRect(140, GROUND_Y - 95, 30, 25);
  gfx.fillStyle(0xff99b8, 0.6);
  gfx.fillRect(45, GROUND_Y - 95, 7, 25);
  gfx.fillRect(68, GROUND_Y - 95, 7, 25);
  gfx.fillRect(140, GROUND_Y - 95, 7, 25);
  gfx.fillRect(163, GROUND_Y - 95, 7, 25);

  // Raised porch platform — painted wood
  gfx.fillStyle(0xc0a088);
  gfx.fillRect(250, GROUND_Y - 15, 240, 15);
  // Porch railing
  gfx.lineStyle(2, 0x8a7055);
  gfx.lineBetween(250, GROUND_Y - 42, 250, GROUND_Y - 15);
  gfx.lineBetween(490, GROUND_Y - 42, 490, GROUND_Y - 15);
  gfx.lineBetween(250, GROUND_Y - 42, 490, GROUND_Y - 42);
  // Post caps
  gfx.fillStyle(0x8a7055);
  gfx.fillRect(248, GROUND_Y - 46, 6, 4);
  gfx.fillRect(488, GROUND_Y - 46, 6, 4);

  // Pink flamingo lawn statue out front
  gfx.fillStyle(0xff6b9d);
  gfx.fillRect(215, GROUND_Y - 28, 3, 28);   // leg
  gfx.fillEllipse(218, GROUND_Y - 32, 14, 8); // body
  gfx.fillCircle(225, GROUND_Y - 38, 2);     // head
  gfx.fillStyle(0xd44a7a);
  gfx.fillRect(226, GROUND_Y - 38, 3, 1.5);  // beak

  // Potted palm on the porch
  gfx.fillStyle(0x5a2a1a);
  gfx.fillRect(260, GROUND_Y - 30, 14, 15);
  gfx.fillStyle(0x2a6a2a);
  gfx.fillTriangle(267, GROUND_Y - 30, 253, GROUND_Y - 48, 281, GROUND_Y - 48);
  gfx.fillTriangle(267, GROUND_Y - 30, 247, GROUND_Y - 42, 287, GROUND_Y - 42);

  // Chaise lounge for Tamika (visible beneath her feet)
  gfx.fillStyle(0xffd4a0);
  gfx.fillRect(315, GROUND_Y - 18, 80, 6);
  gfx.fillStyle(0xf5c089);
  gfx.fillRect(315, GROUND_Y - 18, 80, 2);
  // Chaise legs
  gfx.fillStyle(0x555555);
  gfx.fillRect(320, GROUND_Y - 12, 2, 12);
  gfx.fillRect(390, GROUND_Y - 12, 2, 12);
  // Raised back of chaise
  gfx.fillStyle(0xffd4a0);
  gfx.fillRect(368, GROUND_Y - 40, 26, 22);

  // Iced tea glass on a little side table
  gfx.fillStyle(0x8a6a4a);
  gfx.fillRect(420, GROUND_Y - 22, 20, 22);
  gfx.fillStyle(0xc89068);
  gfx.fillRect(420, GROUND_Y - 24, 20, 3);
  gfx.fillStyle(0xd49a3a, 0.7);
  gfx.fillRect(426, GROUND_Y - 34, 8, 12);
  gfx.fillStyle(0xffffff);
  gfx.fillRect(427, GROUND_Y - 34, 6, 2);

  // "TAMIKA" name plaque above the door
  gfx.fillStyle(0xffffff);
  gfx.fillRect(94, GROUND_Y - 56, 22, 6);
  {
    const label = 'TAMIKA';
    const scale = 1;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 94 + (22 - tw) / 2, GROUND_Y - 55, label, scale, 0x6a3a1a);
  }

  // Tamika herself, lounging on the chaise (conditional: time >= 720)
  if (time >= 720) {
    drawNpc(gfx, 'the_kid', 360, GROUND_Y - 15);
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
  // QUIKSTOP sign — red backer, yellow pinstripe, bold white letters
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(150, GROUND_Y - 138, 220, 24);
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(150, GROUND_Y - 140, 220, 3);
  gfx.fillRect(150, GROUND_Y - 116, 220, 3);
  // "QUIK-STOP" in 3x5 pixel font, centered on the backer
  {
    const label = 'QUIK-STOP';
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 150 + (220 - tw) / 2, GROUND_Y - 134, label, scale, 0xffffff);
  }
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

  // Convenience store (drawn BEFORE the minivan so it's behind it)
  gfx.fillStyle(0xc8b890);
  gfx.fillRect(30, GROUND_Y - 110, 180, 110);
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(50, GROUND_Y - 80, 80, 40);
  gfx.fillStyle(0x555555);
  gfx.fillRect(145, GROUND_Y - 50, 25, 50);
  // Store sign — blue backer with white "DAVE'S GAS"
  gfx.fillStyle(0x3a7bc8);
  gfx.fillRect(50, GROUND_Y - 120, 140, 18);
  gfx.fillStyle(0xffffff);
  gfx.fillRect(50, GROUND_Y - 122, 140, 2);
  {
    const label = "DAVE'S GAS";
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 50 + (140 - tw) / 2, GROUND_Y - 117, label, scale, 0xffffff);
  }

  // Player's minivan — parked to the right of the store (zone at x=250)
  drawMinivan(gfx, 250, GROUND_Y);

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

  // Sharon at the phone booth (visible from 10 AM when she's working)
  const tNow = state.currentTime;
  const suspicion = state.suspicion ?? 0;
  if (tNow >= 600 && suspicion < 60) {
    drawNpc(gfx, 'sharon', 500, GROUND_Y);
  }

  // Sunset Motel sign (right side) — visible once prostitution vice started
  if ((state.vices.prostitution ?? 0) >= 1 && suspicion < 70) {
    // Sign post
    gfx.fillStyle(0x444444);
    gfx.fillRect(547, GROUND_Y - 130, 4, 130);
    // Sign — red background
    gfx.fillStyle(0xcc2233);
    gfx.fillRect(518, GROUND_Y - 140, 64, 30);
    const blink = Math.floor(tNow * 3) % 3 !== 0;
    // "SUNSET" line
    {
      const scale = 1;
      const label = 'SUNSET';
      const tw = pixelTextWidth(label, scale);
      drawPixelText(gfx, 518 + (64 - tw) / 2, GROUND_Y - 137, label, scale, 0xffffaa, blink ? 0.95 : 0.45);
    }
    // "MOTEL" line
    {
      const scale = 1;
      const label = 'MOTEL';
      const tw = pixelTextWidth(label, scale);
      drawPixelText(gfx, 518 + (64 - tw) / 2, GROUND_Y - 127, label, scale, 0xffffaa, blink ? 0.9 : 0.35);
    }
    // "VACANCY" tag below
    gfx.fillStyle(0x1a3a1a);
    gfx.fillRect(521, GROUND_Y - 118, 58, 10);
    {
      const scale = 1;
      const label = 'VACANCY';
      const tw = pixelTextWidth(label, scale);
      drawPixelText(gfx, 521 + (58 - tw) / 2, GROUND_Y - 115, label, scale, 0x66ff66);
    }
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
  gfx.fillRect(80, GROUND_Y - 132, 150, 18);
  // "LUCKY NAILS" sign text
  {
    const label = 'LUCKY NAILS';
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 80 + (150 - tw) / 2, GROUND_Y - 128, label, scale, 0xffffff);
  }
  // Window
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(100, GROUND_Y - 90, 60, 40);
  // Door
  gfx.fillStyle(0x555555);
  gfx.fillRect(180, GROUND_Y - 50, 25, 50);

  // Store 2 — Tony's Pawn (yellow facade with red PAWN sign)
  gfx.fillStyle(0xd4c870);
  gfx.fillRect(230, GROUND_Y - 120, 150, 120);
  gfx.fillStyle(0xb8a840);
  gfx.fillRect(230, GROUND_Y - 132, 150, 18);
  // PAWN sign — red backer, white letters
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(235, GROUND_Y - 130, 140, 14);
  {
    const label = "TONY'S PAWN";
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 235 + (140 - tw) / 2, GROUND_Y - 127, label, scale, 0xffffff);
  }
  // Window with "$" sign
  gfx.fillStyle(0x87ceeb, 0.6);
  gfx.fillRect(250, GROUND_Y - 90, 60, 40);
  gfx.fillStyle(0x22aa22);
  gfx.fillRect(275, GROUND_Y - 82, 10, 24);
  gfx.fillRect(268, GROUND_Y - 78, 24, 3);
  gfx.fillRect(268, GROUND_Y - 68, 24, 3);
  // 3 gold balls (pawnshop symbol)
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(340, GROUND_Y - 96, 4);
  gfx.fillCircle(352, GROUND_Y - 96, 4);
  gfx.fillCircle(346, GROUND_Y - 104, 4);
  // Door
  gfx.fillStyle(0x333333);
  gfx.fillRect(330, GROUND_Y - 50, 25, 50);

  // Store 3 — Karate Dojo (white facade)
  gfx.fillStyle(0xe8e8e8);
  gfx.fillRect(380, GROUND_Y - 120, 150, 120);
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(380, GROUND_Y - 132, 150, 18);
  {
    const label = 'KARATE DOJO';
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 380 + (150 - tw) / 2, GROUND_Y - 128, label, scale, 0xffffff);
  }
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
    // Animated hot-pink neon "PURRRPLE" sign (with flicker)
    const blink = Math.floor(time * 3) % 4 !== 0;
    gfx.fillStyle(0x3a0a3a);
    gfx.fillRect(535, GROUND_Y - 128, 110, 16);
    {
      const label = 'PURRRPLE';
      const scale = 2;
      const tw = pixelTextWidth(label, scale);
      drawPixelText(gfx, 535 + (110 - tw) / 2, GROUND_Y - 125, label, scale, 0xff3388, blink ? 0.95 : 0.55);
    }
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

  // (The Girls are at the SIDEWALK, not here. The alley is just an alley.)

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

  // Storefront WINDOW on the left — shows the minivan parked outside
  const winX = 80, winY = 50, winW = 170, winH = 140;
  // Sky beyond
  gfx.fillStyle(0x87ceeb);
  gfx.fillRect(winX, winY, winW, winH * 0.55);
  // Ground beyond
  gfx.fillStyle(0x444444);
  gfx.fillRect(winX, winY + winH * 0.55, winW, winH * 0.45);
  // Minivan through the window
  drawMinivan(gfx, winX + 80, winY + winH - 8);
  // Window frame
  gfx.lineStyle(3, 0x6a4a2a);
  gfx.strokeRect(winX, winY, winW, winH);
  // Cross mullion
  gfx.lineBetween(winX, winY + winH / 2, winX + winW, winY + winH / 2);
  gfx.lineBetween(winX + winW / 2, winY, winX + winW / 2, winY + winH);
  // Subtle glass reflection
  gfx.fillStyle(0xffffff, 0.08);
  gfx.fillTriangle(winX + 6, winY + 6, winX + 60, winY + 6, winX + 6, winY + 60);

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

/**
 * Classic Weber kettle charcoal grill.
 * Tripod legs, round black bowl, domed lid, knob handle, bottom ash catcher.
 * `grillX`, `grillY` roughly mark the top-left of the kettle bowl for layout compat.
 */
function drawGrill(gfx: Phaser.GameObjects.Graphics, grillX: number, grillY: number, status: string): void {
  const cx = grillX + 20;              // kettle center X
  const bowlY = grillY + 14;           // center Y of the bowl
  const bowlW = 50;
  const bowlH = 16;
  const lidOpen = status === 'cooking' || status === 'prepped' || status === 'done' || status === 'burnt';

  // ── Tripod legs (3 angled black legs from ground up to the bowl) ──
  gfx.lineStyle(2, 0x1a1a1a, 1);
  const legTop = bowlY + 2;
  const legBottomY = grillY + 38;
  gfx.lineBetween(cx - 18, legBottomY, cx - 8, legTop);
  gfx.lineBetween(cx + 18, legBottomY, cx + 8, legTop);
  gfx.lineBetween(cx, legBottomY + 2, cx, legTop);

  // ── Ash catcher (small disc hanging below the bowl) ──
  gfx.fillStyle(0x1a1a1a);
  gfx.fillEllipse(cx, bowlY + 12, 16, 5);

  // Optional little wheel on lower-right leg
  gfx.fillStyle(0x111111);
  gfx.fillCircle(cx + 19, legBottomY, 2);

  // ── Bowl (black kettle body) ──
  gfx.fillStyle(0x1a1a1a);
  gfx.fillEllipse(cx, bowlY, bowlW, bowlH);
  // Soft highlight on the bowl to suggest curvature
  gfx.fillStyle(0x3a3a3a, 0.6);
  gfx.fillEllipse(cx - 8, bowlY - 2, 24, 6);
  // Side vent (small round hole)
  gfx.fillStyle(0x0a0a0a);
  gfx.fillCircle(cx - 18, bowlY + 1, 1.5);

  // ── Weber red badge (tiny accent on the bowl) ──
  gfx.fillStyle(0xb5271f);
  gfx.fillRect(cx + 8, bowlY + 1, 8, 2);

  // ── Grill grate line across the bowl (visible when lid is up) ──
  if (lidOpen) {
    gfx.lineStyle(1, 0x555555, 1);
    for (let i = -18; i <= 18; i += 5) {
      gfx.lineBetween(cx + i, bowlY - 5, cx + i, bowlY - 1);
    }
    gfx.lineBetween(cx - 20, bowlY - 5, cx + 20, bowlY - 5);
  }

  // ── Domed lid ──
  // Closed: sits flush on top of bowl
  // Open: slid up-back and slightly tilted, showing contents
  const lidCx = lidOpen ? cx + 22 : cx;
  const lidCy = lidOpen ? bowlY - 18 : bowlY - 6;
  const lidW = bowlW;
  const lidH = 14;
  gfx.fillStyle(0x1a1a1a);
  gfx.fillEllipse(lidCx, lidCy, lidW, lidH * 2);
  // Mask the bottom half of the dome so it's a half-ellipse
  gfx.fillStyle(lidOpen ? 0x5a9e3a : 0x1a1a1a, lidOpen ? 0 : 1);
  // Lid highlight
  gfx.fillStyle(0x3a3a3a, 0.7);
  gfx.fillEllipse(lidCx - 6, lidCy - 2, 18, 5);
  // Lid handle knob
  gfx.fillStyle(0x111111);
  gfx.fillCircle(lidCx, lidCy - lidH + 2, 2.5);
  gfx.fillStyle(0x2a2a2a);
  gfx.fillRect(lidCx - 1, lidCy - lidH + 4, 2, 3);
  // Top lid vent (small chimney hole)
  gfx.fillStyle(0x000000);
  gfx.fillCircle(lidCx - 6, lidCy - lidH + 3, 1);

  // ── Contents on the grate (state-driven) ──
  if (status === 'supplies_bought') {
    // Unopened charcoal bag next to the grill
    gfx.fillStyle(0x6b4c2a);
    gfx.fillRect(cx + 28, grillY + 18, 14, 18);
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(cx + 30, grillY + 22, 10, 3);
  } else if (status === 'prepped') {
    // Glowing coals visible through the open lid
    gfx.fillStyle(0xff4400);
    gfx.fillCircle(cx - 10, bowlY - 3, 3);
    gfx.fillCircle(cx + 2, bowlY - 2, 3);
    gfx.fillStyle(0xff8800);
    gfx.fillCircle(cx + 12, bowlY - 3, 2.5);
    gfx.fillStyle(0xffcc33, 0.8);
    gfx.fillCircle(cx - 4, bowlY - 4, 2);
  } else if (status === 'cooking') {
    // Raw-ish patties searing
    gfx.fillStyle(0x8b4a2a);
    gfx.fillCircle(cx - 12, bowlY - 6, 4);
    gfx.fillCircle(cx, bowlY - 6, 4);
    gfx.fillCircle(cx + 12, bowlY - 6, 4);
    gfx.fillStyle(0xff5500, 0.7);
    gfx.fillCircle(cx - 8, bowlY - 2, 2);
    // Smoke wisps
    gfx.lineStyle(1, 0xcccccc, 0.5);
    gfx.lineBetween(cx - 6, bowlY - 10, cx - 10, bowlY - 30);
    gfx.lineBetween(cx + 6, bowlY - 10, cx + 4, bowlY - 34);
    gfx.lineBetween(cx + 14, bowlY - 10, cx + 18, bowlY - 28);
  } else if (status === 'done') {
    // Golden-brown patties
    gfx.fillStyle(0xc8a040);
    gfx.fillCircle(cx - 12, bowlY - 6, 4);
    gfx.fillCircle(cx, bowlY - 6, 4);
    gfx.fillCircle(cx + 12, bowlY - 6, 4);
    // Plate to the side with finished burgers
    gfx.fillStyle(0xeeeeee);
    gfx.fillEllipse(cx + 38, grillY + 28, 22, 6);
    gfx.fillStyle(0xc8a040);
    gfx.fillCircle(cx + 32, grillY + 26, 3);
    gfx.fillCircle(cx + 42, grillY + 26, 3);
  } else if (status === 'burnt') {
    // Black hockey pucks
    gfx.fillStyle(0x0a0a0a);
    gfx.fillCircle(cx - 12, bowlY - 6, 4);
    gfx.fillCircle(cx, bowlY - 6, 4);
    gfx.fillCircle(cx + 12, bowlY - 6, 4);
    // Heavy black smoke
    gfx.lineStyle(2, 0x333333, 0.7);
    gfx.lineBetween(cx - 5, bowlY - 10, cx - 14, bowlY - 38);
    gfx.lineBetween(cx + 5, bowlY - 10, cx + 16, bowlY - 40);
    gfx.lineBetween(cx + 14, bowlY - 10, cx + 22, bowlY - 32);
  }
}

/**
 * Classic painted-wood Adirondack chair, front-3/4 view.
 * `x` is the center bottom (feet of the chair), `y` is ground line.
 */
function drawAdirondackChair(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number = 0xe8dcc0,
  shade: number = 0xb8a880,
): void {
  // Shadow
  gfx.fillStyle(0x000000, 0.25);
  gfx.fillEllipse(x, y + 2, 70, 8);

  // Front legs
  gfx.fillStyle(shade);
  gfx.fillRect(x - 28, y - 20, 4, 20);
  gfx.fillRect(x + 24, y - 20, 4, 20);

  // Seat (slats) — slightly tilted back
  gfx.fillStyle(color);
  gfx.fillRect(x - 30, y - 24, 60, 4);
  // Seat slat shadow lines
  gfx.fillStyle(shade, 0.6);
  gfx.fillRect(x - 20, y - 24, 1, 4);
  gfx.fillRect(x - 5, y - 24, 1, 4);
  gfx.fillRect(x + 10, y - 24, 1, 4);
  gfx.fillRect(x + 22, y - 24, 1, 4);

  // Back support angled bracket
  gfx.fillStyle(shade);
  gfx.fillRect(x - 26, y - 52, 3, 30);
  gfx.fillRect(x + 23, y - 52, 3, 30);

  // High back with 5 vertical slats, slight fan
  const backTopY = y - 64;
  const slats = [
    { bx: x - 20, tilt: -2 },
    { bx: x - 10, tilt: -1 },
    { bx: x,      tilt: 0 },
    { bx: x + 10, tilt: 1 },
    { bx: x + 20, tilt: 2 },
  ];
  gfx.fillStyle(color);
  for (const s of slats) {
    // Each slat: trapezoid via triangle pair
    gfx.fillTriangle(
      s.bx - 3, y - 24,
      s.bx + 3, y - 24,
      s.bx + 3 + s.tilt, backTopY,
    );
    gfx.fillTriangle(
      s.bx - 3, y - 24,
      s.bx + 3 + s.tilt, backTopY,
      s.bx - 3 + s.tilt, backTopY,
    );
  }
  // Slat separators
  gfx.lineStyle(0.5, shade, 0.7);
  for (const s of slats) {
    gfx.lineBetween(s.bx + 3, y - 24, s.bx + 3 + s.tilt, backTopY);
  }

  // Arms — wide flat planks over the front legs
  gfx.fillStyle(color);
  gfx.fillRect(x - 34, y - 32, 18, 4);
  gfx.fillRect(x + 16, y - 32, 18, 4);

  // Arm shadow underside
  gfx.fillStyle(shade, 0.6);
  gfx.fillRect(x - 34, y - 28, 18, 1);
  gfx.fillRect(x + 16, y - 28, 18, 1);
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
  drawNpc(gfx, 'bouncer', 100, 340);
  drawNpc(gfx, 'bartender_club', 150, 340);
  drawNpc(gfx, 'tony', 250, 340);    // shady dude at the end of the bar
  drawNpc(gfx, 'candi', 320, 340);
  drawNpc(gfx, 'destiny', 480, 340);
  // Amber on stage (slightly raised — stage top sits at y≈340-10)
  drawNpc(gfx, 'amber', 400, 332);

  // VIP curtain — red velvet drape on the right side, leads to back room
  gfx.fillStyle(0x5a0a2a);
  gfx.fillRect(640, 260, 48, 140);
  // Vertical pleats
  for (let i = 0; i < 4; i++) {
    gfx.fillStyle(0x7a1a3a, 0.7);
    gfx.fillRect(640 + i * 12 + 2, 260, 2, 140);
  }
  // "VIP" gold signage above
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(632, 246, 62, 14);
  gfx.fillStyle(0x222222);
  gfx.fillRect(638, 250, 6, 6);   // V
  gfx.fillRect(648, 250, 6, 6);   // I
  gfx.fillRect(658, 250, 6, 6);   // P
  gfx.fillRect(670, 250, 18, 6);  // decorative
  // Pink glow spilling from behind curtain
  drawMoodLight(gfx, 664, 330, 0xff3377, 28);
}

export function drawMotelExterior(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  drawOutdoorBase(gfx, time, 0x444444);  // parking lot asphalt

  // Dusty motel building — long 2-story beige
  gfx.fillStyle(0xc4a878);
  gfx.fillRect(200, GROUND_Y - 180, 560, 180);
  // Second-story trim
  gfx.fillStyle(0x8a6a4a);
  gfx.fillRect(200, GROUND_Y - 95, 560, 6);
  // Row of doors (3 on ground)
  for (let i = 0; i < 6; i++) {
    const dx = 240 + i * 90;
    gfx.fillStyle(0x5a2a1a);
    gfx.fillRect(dx, GROUND_Y - 60, 30, 60);
    // Door number plate
    gfx.fillStyle(0xd4a020);
    gfx.fillRect(dx + 8, GROUND_Y - 52, 14, 6);
  }
  // Room 12 door — highlighted at x=660 (match the zone)
  gfx.fillStyle(0x7a1a1a);
  gfx.fillRect(645, GROUND_Y - 66, 34, 66);
  gfx.fillStyle(0xffd040);
  gfx.fillRect(655, GROUND_Y - 58, 14, 8);
  // Door knob glint
  gfx.fillStyle(0xffe080);
  gfx.fillCircle(676, GROUND_Y - 34, 1.5);

  // Upper-story windows
  for (let i = 0; i < 6; i++) {
    const wx = 240 + i * 90;
    gfx.fillStyle(0x87ceeb, 0.5);
    gfx.fillRect(wx, GROUND_Y - 150, 30, 40);
    gfx.lineStyle(1, 0x444444);
    gfx.strokeRect(wx, GROUND_Y - 150, 30, 40);
  }

  // Large "SUNSET MOTEL" neon sign on pole (left side)
  gfx.fillStyle(0x444444);
  gfx.fillRect(130, GROUND_Y - 180, 4, 180);
  // Sign board — red with yellow pinstripes
  gfx.fillStyle(0xcc2233);
  gfx.fillRect(62, GROUND_Y - 200, 140, 60);
  gfx.fillStyle(0xd4a020);
  gfx.fillRect(62, GROUND_Y - 200, 140, 3);
  gfx.fillRect(62, GROUND_Y - 143, 140, 3);
  // "SUNSET" and "MOTEL" neon (animated blink)
  const blink = Math.floor(time * 3) % 3 !== 0;
  {
    const scale = 2;
    const label1 = 'SUNSET';
    const tw1 = pixelTextWidth(label1, scale);
    drawPixelText(gfx, 62 + (140 - tw1) / 2, GROUND_Y - 192, label1, scale, 0xffffaa, blink ? 0.95 : 0.4);
    const label2 = 'MOTEL';
    const tw2 = pixelTextWidth(label2, scale);
    drawPixelText(gfx, 62 + (140 - tw2) / 2, GROUND_Y - 174, label2, scale, 0xffffaa, blink ? 0.95 : 0.4);
  }
  // "VACANCY" tab below the board
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(82, GROUND_Y - 140, 100, 14);
  {
    const label = 'VACANCY';
    const scale = 2;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, 82 + (100 - tw) / 2, GROUND_Y - 137, label, scale, 0x66ff66);
  }

  // Taco cart (center-left) — metallic cart + yellow canopy + steam
  const cx = 300;
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(cx - 40, GROUND_Y - 50, 80, 40);
  // Wheels
  gfx.fillStyle(0x111111);
  gfx.fillCircle(cx - 28, GROUND_Y - 6, 6);
  gfx.fillCircle(cx + 28, GROUND_Y - 6, 6);
  // Yellow canopy
  gfx.fillStyle(0xd4a020);
  gfx.fillTriangle(cx - 50, GROUND_Y - 50, cx + 50, GROUND_Y - 50, cx, GROUND_Y - 100);
  // Canopy fringe
  gfx.fillRect(cx - 50, GROUND_Y - 50, 100, 4);
  // "EL FUEGO" painted sign panel on the canopy lip
  gfx.fillStyle(0x222222);
  gfx.fillRect(cx - 44, GROUND_Y - 82, 88, 14);
  gfx.fillStyle(0xffcc33);
  gfx.fillRect(cx - 44, GROUND_Y - 82, 88, 2);
  gfx.fillRect(cx - 44, GROUND_Y - 70, 88, 2);
  {
    const label = 'EL FUEGO';
    const scale = 1;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, cx - tw / 2, GROUND_Y - 78, label, scale, 0xffcc33);
  }
  // Small "TACOS" sub-label on the cart body
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(cx - 20, GROUND_Y - 44, 40, 9);
  {
    const label = 'TACOS';
    const scale = 1;
    const tw = pixelTextWidth(label, scale);
    drawPixelText(gfx, cx - tw / 2, GROUND_Y - 42, label, scale, 0xffffff);
  }
  // Steam puffs (animated)
  const puffT = time * 2;
  for (let i = 0; i < 3; i++) {
    const px = cx + Math.sin(puffT + i * 0.7) * 3;
    const py = GROUND_Y - 54 - i * 10 - (puffT * 3 % 12);
    gfx.fillStyle(0xeeeeee, 0.45 - i * 0.1);
    gfx.fillCircle(px, py, 4 + i);
  }
  // Griddle
  gfx.fillStyle(0x333333);
  gfx.fillRect(cx - 30, GROUND_Y - 56, 60, 6);

  // Player's minivan parked (zone at x=75)
  drawMinivan(gfx, 75, GROUND_Y);

  // Sharon waiting by Room 12
  drawNpc(gfx, 'sharon', 520, GROUND_Y);

  // Taco Vendor — use generic clerk config (silhouette behind cart)
  drawTinyPerson(gfx, cx, GROUND_Y - 60, 0xc89878, 0.8);
}

export function drawTeenAlley(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  const time = state.currentTime;
  // Dim alley — brick walls close in
  drawDimInterior(gfx, { wall: 0x3a3a2a, floor: 0x2a2a1a, vignetteAlpha: 0.55 });

  // Brick pattern on walls
  gfx.fillStyle(0x4a3a2a, 0.5);
  for (let y = 40; y < 280; y += 22) {
    for (let x = 0; x < SCREEN_W; x += 60) {
      const offset = (Math.floor(y / 22) % 2) * 30;
      gfx.fillRect(x + offset, y, 54, 3);
    }
  }

  // Dumpster (right side)
  gfx.fillStyle(0x2a5a3a);
  gfx.fillRect(560, 260, 160, 80);
  gfx.fillStyle(0x3a6a4a);
  gfx.fillRect(560, 250, 160, 12);
  gfx.fillStyle(0x1a3a2a);
  gfx.fillRect(580, 275, 120, 8);

  // Spray paint tag on far wall
  gfx.fillStyle(0xcc2266);
  gfx.fillRect(120, 100, 90, 12);
  gfx.fillRect(130, 116, 60, 10);
  gfx.lineStyle(2, 0x66ff33);
  gfx.lineBetween(200, 140, 240, 100);

  // Flickering single alley light
  const flicker = Math.floor(time * 4) % 4 !== 0;
  gfx.fillStyle(0x555555);
  gfx.fillRect(396, 60, 4, 80);
  gfx.fillStyle(0x888888);
  gfx.fillRect(384, 52, 28, 12);
  gfx.fillStyle(0xffffaa, flicker ? 0.7 : 0.15);
  gfx.fillCircle(398, 58, 8);
  drawMoodLight(gfx, 398, 80, 0xffffaa, flicker ? 120 : 40);

  // Milk crate
  gfx.fillStyle(0xcc2233);
  gfx.fillRect(480, 310, 34, 30);
  gfx.lineStyle(1, 0x880011);
  for (let i = 0; i < 4; i++) {
    gfx.lineBetween(480 + i * 8, 310, 480 + i * 8, 340);
  }

  // Teen sitting on milk crate
  drawNpc(gfx, 'quikstop_teen', 500, GROUND_Y);
}

export function drawMotelRoom(gfx: Phaser.GameObjects.Graphics, state: DadState): void {
  // Low-rent love motel vibe: dim interior, pink mood light, heart bed, bedside lamp, cheap art
  drawDimInterior(gfx, { wall: 0x3a1a2a, floor: 0x2a1a22, vignetteAlpha: 0.55 });

  // Pink mood light from the bedside lamp
  drawMoodLight(gfx, 620, 220, 0xff3388, 180);
  drawMoodLight(gfx, 180, 100, 0xaa3366, 120);

  // Mirrored ceiling — subtle grey band at top
  gfx.fillStyle(0x555566, 0.4);
  gfx.fillRect(0, 0, 800, 28);
  gfx.fillStyle(0x222233);
  gfx.fillRect(0, 28, 800, 3);

  // Heart-shaped bed — centered
  const bx = 400, by = 310;
  // Shadow
  gfx.fillStyle(0x000000, 0.4);
  gfx.fillEllipse(bx, by + 50, 280, 14);

  // Red satin sheets — two overlapping circles + triangle = heart
  gfx.fillStyle(0xcc2255);
  gfx.fillCircle(bx - 50, by + 5, 55);
  gfx.fillCircle(bx + 50, by + 5, 55);
  gfx.fillTriangle(bx - 95, by + 15, bx + 95, by + 15, bx, by + 90);
  // Heart outline/shine
  gfx.fillStyle(0xff5588, 0.6);
  gfx.fillCircle(bx - 48, by + 2, 12);
  gfx.fillCircle(bx + 52, by + 2, 10);
  // Wooden bed frame base
  gfx.fillStyle(0x3a1a0a);
  gfx.fillRect(bx - 110, by + 40, 220, 8);
  // Legs
  gfx.fillRect(bx - 108, by + 48, 6, 14);
  gfx.fillRect(bx + 102, by + 48, 6, 14);

  // Pillows — two white
  gfx.fillStyle(0xf0f0f0);
  gfx.fillRect(bx - 70, by - 10, 50, 18);
  gfx.fillRect(bx + 20, by - 10, 50, 18);

  // Nightstand (right)
  gfx.fillStyle(0x4a2a2a);
  gfx.fillRect(600, 310, 50, 30);
  // Lamp
  gfx.fillStyle(0x888888);
  gfx.fillRect(618, 282, 4, 28);
  gfx.fillStyle(0xffaacc);
  gfx.fillTriangle(605, 282, 635, 282, 620, 258);

  // Ceiling fan — slowly rotating (animated via time)
  const t = state.currentTime / 10;
  const cx = 400, cy = 40;
  gfx.fillStyle(0x222222);
  gfx.fillCircle(cx, cy, 6);
  for (let i = 0; i < 3; i++) {
    const a = t + (i * Math.PI * 2) / 3;
    const ex = cx + Math.cos(a) * 40;
    const ey = cy + Math.sin(a) * 4; // foreshortened
    gfx.fillStyle(0x444444);
    gfx.fillRect(cx, cy - 1, ex - cx, 3);
    void ey;
  }

  // Painting above bed — crooked, "Dogs Playing Poker" style cheap art
  gfx.fillStyle(0x5a3a1a);
  gfx.fillRect(bx - 70, 80, 140, 60);
  gfx.fillStyle(0xa0a0a0);
  gfx.fillRect(bx - 64, 86, 128, 48);
  gfx.fillStyle(0x884400);
  gfx.fillCircle(bx - 40, 110, 8);
  gfx.fillCircle(bx - 10, 110, 8);
  gfx.fillCircle(bx + 20, 110, 8);
  // Slight tilt line to show crooked
  gfx.lineStyle(1, 0x222222, 0.3);
  gfx.lineBetween(bx - 70, 80, bx + 70, 83);

  // Door (left)
  gfx.fillStyle(0x5a2a2a);
  gfx.fillRect(40, 220, 60, 170);
  gfx.fillStyle(0x3a1a1a);
  gfx.fillRect(40, 220, 60, 6);
  // Door knob
  gfx.fillStyle(0xd4a020);
  gfx.fillCircle(88, 310, 3);
  // EXIT tag above door
  gfx.fillStyle(0xcc2233);
  gfx.fillRect(44, 204, 52, 14);
  gfx.fillStyle(0xffffff);
  gfx.fillRect(50, 210, 4, 4);
  gfx.fillRect(58, 210, 4, 4);
  gfx.fillRect(66, 210, 4, 4);
  gfx.fillRect(74, 210, 4, 4);

  // Sharon seated on the edge of the bed
  drawNpc(gfx, 'sharon', 460, by + 36);
}

export function drawStripClubVip(gfx: Phaser.GameObjects.Graphics, _state: DadState): void {
  drawDimInterior(gfx, { wall: 0x2a0a2a, floor: 0x3a1a3a, vignetteAlpha: 0.6 });

  // One unkind pink lamp
  drawMoodLight(gfx, 400, 220, 0xff3377, 180);

  // Red couch, center
  drawCouch(gfx, 400, 350, 0x4a1a3a);

  // Amber, centered
  drawNpc(gfx, 'amber', 400, 340);
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

  // The Girls on the couch — there are two of them
  drawNpc(gfx, 'the_girls', 368, 340);
  drawNpc(gfx, 'candi', 394, 340, { sz: 0.95 });
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
  drawNpc(gfx, 'dealer', 150, 340);
  drawNpc(gfx, 'crackhead_jim', 300, 340);
  drawNpc(gfx, 'trina', 520, 340);
  drawNpc(gfx, 'tweaker_rayray', 650, 340);
}
