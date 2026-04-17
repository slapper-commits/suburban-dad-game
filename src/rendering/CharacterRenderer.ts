import Phaser from 'phaser';
import type { DadState } from '../types';

// ============================================================
// Character Config — the component system interface
// ============================================================

export type EyeStyle = 'normal' | 'sleepy' | 'shades' | 'stoned' | 'drunk' | 'wide' | 'angry';
export type EyebrowStyle = 'none' | 'neutral' | 'raised' | 'angry' | 'worried';
export type MouthStyle = 'neutral' | 'smile' | 'grin' | 'frown' | 'shock' | 'smirk' | 'sleepy';
export type HairStyleType = 'normal' | 'buzzcut' | 'long' | 'messy' | 'bald';
export type HatType = false | 'cap' | 'cowboy';
export type ItemType =
  | 'spatula' | 'phone' | 'pipe' | 'gun' | 'briefcase'
  | 'brochure' | 'laptop' | 'vape' | 'purse' | 'duffel';

export interface CharacterConfig {
  x: number;
  y: number;                    // bottom of feet (ground line)
  shirt?: number;               // hex color, default 0x4a90d9
  skin?: number;                // hex color, default 0xf0c89a
  hair?: number;                // hex color, default 0x6b4c2a
  pants?: number;               // hex color, default 0x4a5568
  mouth?: MouthStyle;
  eyes?: EyeStyle;              // unified eye system
  eyebrows?: EyebrowStyle;      // expressiveness
  beer?: boolean;               // beer can in right hand
  item?: ItemType;              // held item (drawn in left hand, or right if no beer)
  hat?: HatType;
  hatColor?: number;
  hairStyle?: HairStyleType;
  sz?: number;                  // scale factor, default 1
  flipX?: boolean;              // mirror character horizontally

  // ── Animation ───────────────────────────────────────────────
  /** Seconds since scene start (monotonic). Drives breathing/blink/idle. */
  animTime?: number;
  /** When true, arm+body swing to walking rhythm. */
  isWalking?: boolean;
  /** Seconds since character started walking (continuous). */
  walkPhase?: number;
  /** Offset used to stagger idle animations between characters (0-1). */
  animSeed?: number;
  /** Speaking — opens/closes mouth. */
  talking?: boolean;
  /** Active consumption pose (overrides arm rendering, adds prop). */
  consumption?: 'beer' | 'bong' | 'crack' | 'cigarette' | 'shot';

  // ── Dishevelment overlays (Dad state-driven) ────────────────
  /** Pink lipstick mark near the collar. */
  lipstickMark?: boolean;
  /** Brown stain on shirt (booze / BBQ sauce). */
  stain?: boolean;
  /** White bandage on forehead. */
  bandage?: boolean;
  /** Wavy green squiggles rising from body. */
  smellLines?: boolean;
  /** Bulge in pants from a wad of cash. */
  cashBulge?: boolean;
  /** Body tilt in radians (drunk sway). */
  tilt?: number;

  // BACKWARD COMPAT (mapped to eyes field internally)
  shades?: boolean;
  sleepy?: boolean;
}

// ============================================================
// Draw Character — the core component renderer
// ============================================================

/**
 * Draw a pixel-art character using Phaser Graphics primitives.
 * The character is ~40px tall at sz=1, drawn upward from (x, y) where y is the foot position.
 */
export function drawCharacter(gfx: Phaser.GameObjects.Graphics, config: CharacterConfig): void {
  const {
    x,
    y,
    shirt = 0x4a90d9,
    skin = 0xf0c89a,
    hair = 0x6b4c2a,
    pants = 0x4a5568,
    beer = false,
    item,
    hat = false,
    hatColor = 0x333333,
    sz = 1,
    flipX = false,
    hairStyle = 'normal',
    eyebrows = 'none',
    animTime = 0,
    isWalking = false,
    walkPhase = 0,
    animSeed = 0,
    talking = false,
    tilt = 0,
  } = config;
  let { mouth = 'neutral' } = config;

  // Resolve eyes: backward compat for shades/sleepy booleans
  let eyes: EyeStyle = config.eyes ?? 'normal';
  if (config.sleepy) eyes = 'sleepy';
  if (config.shades) eyes = 'shades';

  // Periodic blink — every ~3s, close eyes for 150ms. Stagger per character.
  const blinkCycle = 3 + animSeed * 2;
  const inCycle = (animTime + animSeed * blinkCycle) % blinkCycle;
  const isBlinking = inCycle < 0.15;
  if (isBlinking && eyes !== 'shades' && eyes !== 'sleepy') {
    eyes = 'sleepy';
  }

  // Talking: alternate mouth between closed and open every ~150ms
  if (talking) {
    const talkPhase = Math.floor(animTime * 7) % 2;
    mouth = talkPhase === 0 ? 'shock' : 'neutral';
  }

  const s = sz;
  // fx is reserved for future flipX-conditional logic
  void flipX;

  // Body dimensions
  const shoeH   = 2 * s;
  const legH    = 12 * s;
  const torsoH  = 12 * s;
  const headH   = 10 * s;

  const headW   = 12 * s;
  const torsoW  = 14 * s;
  const armW    = 3 * s;
  const armH    = 10 * s;
  const legW    = 5 * s;
  const shoeW   = 6 * s;

  // Hair height varies by style
  let hairH = 4 * s;
  if (hairStyle === 'buzzcut') hairH = 2 * s;
  else if (hairStyle === 'long') hairH = 6 * s;
  else if (hairStyle === 'bald') hairH = 0;

  // ── Breathing: subtle upper-body vertical offset ──────────
  const breatheAmount = 0.4 * s;
  const breathe = Math.sin((animTime + animSeed) * 2.1) * breatheAmount;

  // Key y positions — torso/head/arms pushed up by a fraction of breathe
  const feetY   = y - shoeH;
  const legsY   = feetY - legH;
  const torsoY  = legsY - torsoH + breathe;
  const headY   = torsoY - headH + breathe * 0.5;
  const hairY   = headY - hairH;

  // Drunk tilt: offset upper body sideways by sin(tilt) * torsoH
  const tiltOffset = Math.sin(tilt) * torsoH * 0.5;
  const cx = x + tiltOffset;

  // ── Hair ──────────────────────────────────────────────────
  if (hairStyle !== 'bald') {
    gfx.fillStyle(hair);

    if (hairStyle === 'long') {
      // Wider + taller
      gfx.fillRect(cx - headW / 2 - 2 * s, hairY, headW + 4 * s, hairH);
    } else if (hairStyle === 'messy') {
      // Base rect + jutting bits
      gfx.fillRect(cx - headW / 2, hairY, headW, hairH);
      gfx.fillRect(cx - headW / 2 - 1 * s, hairY - 2 * s, 3 * s, 3 * s);
      gfx.fillRect(cx + 2 * s, hairY - 3 * s, 2 * s, 3 * s);
      gfx.fillRect(cx + headW / 2 - 1 * s, hairY - 1 * s, 3 * s, 2 * s);
    } else {
      // normal or buzzcut — standard rect
      gfx.fillRect(cx - headW / 2, hairY, headW, hairH);
    }
  }

  // ── Hat ────────────────────────────────────────────────────
  const hatBaseY = hairStyle === 'bald' ? headY : hairY;
  if (hat === 'cap') {
    gfx.fillStyle(hatColor);
    gfx.fillRect(cx - headW / 2 - 2 * s, hatBaseY - 3 * s, headW + 4 * s, 3 * s);
  } else if (hat === 'cowboy') {
    gfx.fillStyle(hatColor);
    gfx.fillRect(cx - headW / 2, hatBaseY - 5 * s, headW, 5 * s);
    gfx.fillRect(cx - headW / 2 - 4 * s, hatBaseY, headW + 8 * s, 2 * s);
  }

  // ── Head ──────────────────────────────────────────────────
  gfx.fillStyle(skin);
  gfx.fillRect(cx - headW / 2, headY, headW, headH);

  // ── Eyes ──────────────────────────────────────────────────
  const eyeY = headY + 3 * s;
  const leftEyeX = cx - 3 * s;
  const rightEyeX = cx + 3 * s;

  switch (eyes) {
    case 'sleepy':
      // Closed eyes: horizontal lines
      gfx.lineStyle(1 * s, 0x000000);
      gfx.lineBetween(leftEyeX - 1.5 * s, eyeY, leftEyeX + 1.5 * s, eyeY);
      gfx.lineBetween(rightEyeX - 1.5 * s, eyeY, rightEyeX + 1.5 * s, eyeY);
      break;

    case 'shades':
      // Sunglasses: dark rect across eyes
      gfx.fillStyle(0x111111);
      gfx.fillRect(cx - 5 * s, eyeY - 1.5 * s, 10 * s, 3 * s);
      break;

    case 'stoned':
      // Smaller pupils + red-tint rings
      gfx.fillStyle(0x000000);
      gfx.fillCircle(leftEyeX, eyeY, 1 * s);
      gfx.fillCircle(rightEyeX, eyeY, 1 * s);
      gfx.lineStyle(0.5 * s, 0xcc3333, 0.6);
      gfx.strokeCircle(leftEyeX, eyeY, 2 * s);
      gfx.strokeCircle(rightEyeX, eyeY, 2 * s);
      break;

    case 'drunk':
      // Slightly cross-eyed: offset inward
      gfx.fillStyle(0x000000);
      gfx.fillCircle(leftEyeX + 0.5 * s, eyeY + 0.5 * s, 1.5 * s);
      gfx.fillCircle(rightEyeX - 0.5 * s, eyeY + 0.5 * s, 1.5 * s);
      break;

    case 'wide':
      // Big surprised eyes
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(leftEyeX, eyeY, 2.5 * s);
      gfx.fillCircle(rightEyeX, eyeY, 2.5 * s);
      gfx.fillStyle(0x000000);
      gfx.fillCircle(leftEyeX, eyeY, 1.5 * s);
      gfx.fillCircle(rightEyeX, eyeY, 1.5 * s);
      break;

    case 'angry':
      // Normal pupils + squinting lines above
      gfx.fillStyle(0x000000);
      gfx.fillCircle(leftEyeX, eyeY, 1.5 * s);
      gfx.fillCircle(rightEyeX, eyeY, 1.5 * s);
      // Squint lines angling down toward nose
      gfx.lineStyle(0.8 * s, 0x000000);
      gfx.lineBetween(leftEyeX - 2 * s, eyeY - 2 * s, leftEyeX + 1 * s, eyeY - 1 * s);
      gfx.lineBetween(rightEyeX + 2 * s, eyeY - 2 * s, rightEyeX - 1 * s, eyeY - 1 * s);
      break;

    default: // 'normal'
      gfx.fillStyle(0x000000);
      gfx.fillCircle(leftEyeX, eyeY, 1.5 * s);
      gfx.fillCircle(rightEyeX, eyeY, 1.5 * s);
      break;
  }

  // ── Eyebrows ──────────────────────────────────────────────
  if (eyebrows !== 'none') {
    const browY = eyeY - 2.5 * s;
    const browLen = 2 * s;
    gfx.lineStyle(0.8 * s, 0x000000);

    switch (eyebrows) {
      case 'neutral':
        // Flat horizontal
        gfx.lineBetween(leftEyeX - browLen, browY, leftEyeX + browLen, browY);
        gfx.lineBetween(rightEyeX - browLen, browY, rightEyeX + browLen, browY);
        break;
      case 'raised':
        // Angled up at outer edge (surprised)
        gfx.lineBetween(leftEyeX + browLen, browY, leftEyeX - browLen, browY - 1.5 * s);
        gfx.lineBetween(rightEyeX - browLen, browY, rightEyeX + browLen, browY - 1.5 * s);
        break;
      case 'angry':
        // V-shape: angled down at inner edge
        gfx.lineBetween(leftEyeX - browLen, browY - 1 * s, leftEyeX + browLen, browY + 0.5 * s);
        gfx.lineBetween(rightEyeX + browLen, browY - 1 * s, rightEyeX - browLen, browY + 0.5 * s);
        break;
      case 'worried':
        // Inverted V: angled up at inner edge
        gfx.lineBetween(leftEyeX - browLen, browY + 0.5 * s, leftEyeX + browLen, browY - 1 * s);
        gfx.lineBetween(rightEyeX + browLen, browY + 0.5 * s, rightEyeX - browLen, browY - 1 * s);
        break;
    }
  }

  // ── Mouth ─────────────────────────────────────────────────
  const mouthY = headY + 7 * s;
  gfx.lineStyle(1 * s, 0x000000);

  switch (mouth) {
    case 'neutral':
      gfx.lineBetween(cx - 2 * s, mouthY, cx + 2 * s, mouthY);
      break;
    case 'smile':
      gfx.lineBetween(cx - 2 * s, mouthY - 0.5 * s, cx, mouthY + 0.5 * s);
      gfx.lineBetween(cx, mouthY + 0.5 * s, cx + 2 * s, mouthY - 0.5 * s);
      break;
    case 'grin':
      gfx.lineBetween(cx - 3 * s, mouthY - 1 * s, cx, mouthY + 1 * s);
      gfx.lineBetween(cx, mouthY + 1 * s, cx + 3 * s, mouthY - 1 * s);
      break;
    case 'frown':
      gfx.lineBetween(cx - 2 * s, mouthY + 0.5 * s, cx, mouthY - 0.5 * s);
      gfx.lineBetween(cx, mouthY - 0.5 * s, cx + 2 * s, mouthY + 0.5 * s);
      break;
    case 'shock':
      gfx.lineStyle(1 * s, 0x000000);
      gfx.strokeCircle(cx, mouthY, 2 * s);
      break;
    case 'smirk':
      gfx.lineBetween(cx - 1 * s, mouthY, cx + 2 * s, mouthY - 1 * s);
      break;
    case 'sleepy':
      gfx.lineBetween(cx - 1.5 * s, mouthY, cx + 1.5 * s, mouthY);
      break;
  }

  // ── Torso ─────────────────────────────────────────────────
  gfx.fillStyle(shirt);
  gfx.fillRect(cx - torsoW / 2, torsoY, torsoW, torsoH);

  // ── Arms (animated: walk swing or idle sway) ──────────────
  // Per-arm Y offset so they swing. Left arm opposite of right.
  let leftArmOffY = 0;
  let rightArmOffY = 0;
  let leftArmOffX = 0;
  let rightArmOffX = 0;
  if (isWalking) {
    const p = walkPhase * Math.PI * 2;
    leftArmOffY = Math.sin(p) * 2 * s;
    rightArmOffY = -Math.sin(p) * 2 * s;
    leftArmOffX = Math.cos(p) * 1 * s;
    rightArmOffX = -Math.cos(p) * 1 * s;
  } else {
    // Idle sway — very subtle
    const idle = Math.sin((animTime + animSeed * 2) * 1.4);
    leftArmOffY = idle * 0.4 * s;
    rightArmOffY = -idle * 0.4 * s;
  }
  gfx.fillStyle(shirt);
  // Left arm
  gfx.fillRect(
    cx - torsoW / 2 - armW + leftArmOffX,
    torsoY + 1 * s + leftArmOffY,
    armW,
    armH,
  );
  // Right arm
  gfx.fillRect(
    cx + torsoW / 2 + rightArmOffX,
    torsoY + 1 * s + rightArmOffY,
    armW,
    armH,
  );

  // ── Beer can ──────────────────────────────────────────────
  if (beer) {
    const beerX = flipX
      ? cx - torsoW / 2 - armW
      : cx + torsoW / 2 + armW;
    const beerY = torsoY + armH - 4 * s;
    gfx.fillStyle(0xd4a017);
    gfx.fillRect(beerX - 2 * s, beerY, 4 * s, 6 * s);
  }

  // ── Held Item ─────────────────────────────────────────────
  if (item) {
    // Item goes in the opposite hand from beer, or right hand if no beer
    const itemOnLeft = beer && !flipX;
    const handX = itemOnLeft
      ? cx - torsoW / 2 - armW
      : (beer ? cx - torsoW / 2 - armW : cx + torsoW / 2 + armW);
    const handY = torsoY + armH - 2 * s;

    drawItem(gfx, item, handX, handY, s, cx, y);
  }

  // ── Legs (animated step) ──────────────────────────────────
  gfx.fillStyle(pants);
  let leftLegLift = 0;
  let rightLegLift = 0;
  if (isWalking) {
    const p = walkPhase * Math.PI * 2;
    leftLegLift = Math.max(0, Math.sin(p)) * 2 * s;
    rightLegLift = Math.max(0, -Math.sin(p)) * 2 * s;
  }
  const leftLegX = x - torsoW / 2 + 1 * s;   // legs stay at body X (no tilt)
  const rightLegX = x + torsoW / 2 - 1 * s - legW;
  gfx.fillRect(leftLegX, legsY - leftLegLift, legW, legH);
  gfx.fillRect(rightLegX, legsY - rightLegLift, legW, legH);

  // ── Shoes (follow legs) ───────────────────────────────────
  gfx.fillStyle(0x2d2d2d);
  gfx.fillRect(x - torsoW / 2 + 0.5 * s, feetY - leftLegLift, shoeW, shoeH);
  gfx.fillRect(x + torsoW / 2 - 0.5 * s - shoeW, feetY - rightLegLift, shoeW, shoeH);

  // ── Dishevelment overlays ─────────────────────────────────
  drawDishevelment(gfx, config, cx, torsoY, torsoW, torsoH, headY, headW, legsY, legH, s);

  // ── Consumption pose (drink / smoke) ──────────────────────
  if (config.consumption) {
    drawConsumption(gfx, config, cx, torsoY, torsoW, headY, headW, s);
  }
}

/** Overlay a raised-arm pose plus the appropriate prop (beer, bong, pipe, cig). */
function drawConsumption(
  gfx: Phaser.GameObjects.Graphics,
  config: CharacterConfig,
  cx: number,
  torsoY: number,
  torsoW: number,
  headY: number,
  headW: number,
  s: number,
): void {
  const kind = config.consumption!;
  const shirt = config.shirt ?? 0x4a90d9;
  const skin = config.skin ?? 0xf0c89a;
  const t = (config.animTime ?? 0) * 10; // faster time for consumption animation

  // Pulse amplitude makes the arm shake slightly — "chugging" feel
  const pulse = Math.sin(t * 2) * 0.5 * s;

  // Base raised-arm params (right arm raised toward mouth)
  const raisedArmX = cx + torsoW / 2 - 2 * s;
  const raisedArmBaseY = torsoY + 1 * s;
  const raisedArmEndY = headY + 4 * s + pulse;
  const armW = 3 * s;

  // Draw raised arm (over-top of the standard static arm)
  gfx.fillStyle(shirt);
  gfx.fillRect(raisedArmX, raisedArmEndY, armW, raisedArmBaseY - raisedArmEndY + armW);
  // Hand at the top
  gfx.fillStyle(skin);
  gfx.fillRect(raisedArmX - 0.5 * s, raisedArmEndY - 1 * s, armW + 1 * s, 2 * s);

  const handX = raisedArmX + armW / 2;
  const handY = raisedArmEndY - 1 * s;
  const mouthY = headY + 7 * s;

  switch (kind) {
    case 'beer': {
      // Gold-yellow can tilted toward mouth
      gfx.fillStyle(0xd4a017);
      gfx.fillRect(handX - 2 * s, handY - 5 * s, 4 * s, 6 * s);
      // Label band
      gfx.fillStyle(0xffffff);
      gfx.fillRect(handX - 2 * s, handY - 3 * s, 4 * s, 1 * s);
      // Pop-tab
      gfx.fillStyle(0x888888);
      gfx.fillRect(handX - 0.5 * s, handY - 6 * s, 1 * s, 1 * s);
      // Beer splash droplets near mouth
      if (Math.sin(t * 3) > 0) {
        gfx.fillStyle(0xffe080, 0.8);
        gfx.fillCircle(cx + 1 * s, mouthY + 1 * s, 1 * s);
      }
      break;
    }
    case 'shot': {
      // Tiny shot glass
      gfx.fillStyle(0xeeeeee, 0.6);
      gfx.fillRect(handX - 1.5 * s, handY - 3 * s, 3 * s, 3 * s);
      gfx.fillStyle(0xd4a017);
      gfx.fillRect(handX - 1 * s, handY - 2.5 * s, 2 * s, 2 * s);
      break;
    }
    case 'bong': {
      // Draw bong: vertical glass cylinder + chamber bubble + mouthpiece toward face
      // Bong body
      gfx.fillStyle(0x448855, 0.8);
      gfx.fillRect(handX - 2 * s, handY - 8 * s, 4 * s, 8 * s);
      // Water chamber (darker green, bubbling)
      gfx.fillStyle(0x2a6a3a);
      gfx.fillCircle(handX, handY - 1 * s, 3 * s);
      // Bubbles
      const b = (t * 2) % 6;
      gfx.fillStyle(0xaaffaa, 0.7);
      gfx.fillCircle(handX - 1 * s, handY - 1 * s - b * 0.5 * s, 0.8 * s);
      gfx.fillCircle(handX + 1 * s, handY - 2 * s - b * 0.3 * s, 0.6 * s);
      // Mouthpiece angles toward face
      gfx.fillStyle(0x448855);
      gfx.lineStyle(1 * s, 0x448855);
      gfx.lineBetween(handX - 1 * s, handY - 8 * s, cx + 2 * s, mouthY);
      // Flame below bowl (lighter in other hand — suggest via flame glow)
      const flameFlicker = Math.sin(t * 7) * 0.5 + 0.5;
      gfx.fillStyle(0xff8833, 0.6 + flameFlicker * 0.4);
      gfx.fillCircle(handX + 2 * s, handY + 1 * s, (1.2 + flameFlicker * 0.3) * s);
      gfx.fillStyle(0xffdd44, 0.5);
      gfx.fillCircle(handX + 2 * s, handY + 1 * s, (0.7 + flameFlicker * 0.2) * s);
      // Smoke puffs rising from the top
      for (let i = 0; i < 3; i++) {
        const puffA = 0.5 - i * 0.15;
        gfx.fillStyle(0xcccccc, puffA);
        gfx.fillCircle(handX + Math.sin(t + i) * 2 * s, handY - 10 * s - i * 3 * s, (1.5 + i * 0.4) * s);
      }
      break;
    }
    case 'crack': {
      // Glass pipe — straight stem with bulb
      gfx.fillStyle(0xe8e8e8, 0.8);
      gfx.fillRect(handX - 1 * s, handY - 2 * s, 5 * s, 1.5 * s);
      // Bulb end
      gfx.fillStyle(0xddddee, 0.9);
      gfx.fillCircle(handX + 5 * s, handY - 1 * s, 1.8 * s);
      // Bulb tint — smoke inside
      gfx.fillStyle(0x777777, 0.5);
      gfx.fillCircle(handX + 5 * s, handY - 1 * s, 1.2 * s);
      // Flame near bulb (lighter)
      const flicker = Math.sin(t * 8) * 0.3 + 0.7;
      gfx.fillStyle(0x4488ff, flicker);
      gfx.fillCircle(handX + 6.5 * s, handY - 1 * s, 1 * s);
      gfx.fillStyle(0xffffff, flicker * 0.6);
      gfx.fillCircle(handX + 6.5 * s, handY - 1 * s, 0.5 * s);
      // Smoke puffs rising
      for (let i = 0; i < 2; i++) {
        gfx.fillStyle(0xaaaaaa, 0.4 - i * 0.15);
        gfx.fillCircle(handX + 5 * s + Math.sin(t + i * 2) * 1.5 * s, handY - 4 * s - i * 3 * s, (1.2 + i * 0.4) * s);
      }
      // Wide stare eyes already handled by 'wide' eyes — but the pose is enough
      break;
    }
    case 'cigarette': {
      // Tiny white stick between fingers
      gfx.fillStyle(0xffffff);
      gfx.fillRect(handX - 0.5 * s, handY - 5 * s, 1 * s, 5 * s);
      // Orange cherry
      gfx.fillStyle(0xff4422);
      gfx.fillRect(handX - 0.5 * s, handY - 5.5 * s, 1 * s, 0.5 * s);
      // Smoke trail wafting up and left
      for (let i = 0; i < 3; i++) {
        gfx.fillStyle(0xcccccc, 0.4 - i * 0.1);
        gfx.fillCircle(
          handX - i * 1.5 * s + Math.sin(t + i * 2) * 0.8 * s,
          handY - 6 * s - i * 3 * s,
          (1 + i * 0.4) * s,
        );
      }
      break;
    }
  }

  // The character's mouth briefly opens when consuming
  const m = (kind === 'beer' || kind === 'shot') ? Math.sin(t) > -0.3 : Math.sin(t * 1.5) > 0;
  if (m) {
    gfx.fillStyle(0x000000);
    gfx.fillCircle(cx, mouthY, 1.3 * s);
  }
  // headW reserved for hat overlap logic if needed in future
  void headW;
}

/** Overlay pass: stain, lipstick, bandage, smell squiggles, cash bulge. */
function drawDishevelment(
  gfx: Phaser.GameObjects.Graphics,
  config: CharacterConfig,
  cx: number,
  torsoY: number,
  torsoW: number,
  torsoH: number,
  headY: number,
  headW: number,
  legsY: number,
  legH: number,
  s: number,
): void {
  const t = config.animTime ?? 0;

  // Shirt stain — brown blob on the lower torso
  if (config.stain) {
    gfx.fillStyle(0x5a3a1a, 0.85);
    gfx.fillEllipse(cx + 2 * s, torsoY + torsoH - 3 * s, 5 * s, 4 * s);
    gfx.fillStyle(0x3a2a10, 0.7);
    gfx.fillEllipse(cx + 3 * s, torsoY + torsoH - 4 * s, 2.5 * s, 2 * s);
  }

  // Lipstick mark near the collar
  if (config.lipstickMark) {
    gfx.fillStyle(0xcc2266);
    gfx.fillEllipse(cx - 4 * s, torsoY + 1.5 * s, 3 * s, 1.5 * s);
    // kiss-print detail
    gfx.fillStyle(0x991544, 0.6);
    gfx.fillRect(cx - 5 * s, torsoY + 1.2 * s, 2 * s, 0.6 * s);
  }

  // Bandage across the forehead
  if (config.bandage) {
    gfx.fillStyle(0xf5f5dc);
    gfx.fillRect(cx - headW / 2, headY + 0.5 * s, headW, 2 * s);
    // Red spot (the scrape)
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(cx + 1 * s, headY + 1 * s, 1.5 * s, 1 * s);
  }

  // Cash bulge — sticking out of pocket
  if (config.cashBulge) {
    gfx.fillStyle(0x4a8a4a);
    gfx.fillRect(cx + 2 * s, legsY + 2 * s, 4 * s, 5 * s);
    gfx.fillStyle(0x6aaa6a);
    gfx.fillRect(cx + 2.5 * s, legsY + 2.5 * s, 3 * s, 1 * s);
    gfx.fillRect(cx + 2.5 * s, legsY + 4 * s, 3 * s, 1 * s);
  }
  // `legH` reserved for future extensions (e.g. full-length-pants variants)
  void legH;

  // Smell squiggles — animated wavy lines rising from the body
  if (config.smellLines) {
    const drift = (t * 20) % 8;
    gfx.lineStyle(0.8 * s, 0x88cc66, 0.7);
    for (let i = 0; i < 2; i++) {
      const baseX = cx - 4 * s + i * 8 * s;
      const baseY = torsoY - 4 * s - drift;
      for (let seg = 0; seg < 3; seg++) {
        const y0 = baseY - seg * 3 * s;
        const y1 = baseY - (seg + 1) * 3 * s;
        const offset = seg % 2 === 0 ? 1.5 * s : -1.5 * s;
        gfx.lineBetween(baseX, y0, baseX + offset, y1);
      }
    }
  }
}

// ============================================================
// Item renderer — each item is 3-6 simple shapes
// ============================================================

function drawItem(
  gfx: Phaser.GameObjects.Graphics,
  item: ItemType,
  handX: number,
  handY: number,
  s: number,
  cx: number,
  feetY: number,
): void {
  switch (item) {
    case 'spatula':
      // Handle
      gfx.fillStyle(0x8b6914);
      gfx.fillRect(handX - 0.5 * s, handY - 6 * s, 1 * s, 6 * s);
      // Flat head
      gfx.fillStyle(0x999999);
      gfx.fillRect(handX - 1.5 * s, handY - 8 * s, 3 * s, 2 * s);
      break;

    case 'phone':
      gfx.fillStyle(0x222222);
      gfx.fillRect(handX - 1.5 * s, handY - 3 * s, 3 * s, 5 * s);
      // Screen glow
      gfx.fillStyle(0x4488cc, 0.8);
      gfx.fillRect(handX - 1 * s, handY - 2.5 * s, 2 * s, 3.5 * s);
      break;

    case 'pipe':
      // Bowl
      gfx.fillStyle(0x8b4513);
      gfx.fillCircle(handX, handY - 1 * s, 2 * s);
      // Stem
      gfx.fillRect(handX, handY - 1 * s, 4 * s, 1 * s);
      break;

    case 'gun':
      gfx.fillStyle(0x333333);
      // Barrel
      gfx.fillRect(handX - 1 * s, handY - 1 * s, 5 * s, 1.5 * s);
      // Grip
      gfx.fillRect(handX, handY, 2 * s, 3 * s);
      break;

    case 'briefcase':
      gfx.fillStyle(0x6b4c2a);
      gfx.fillRect(handX - 3 * s, handY, 6 * s, 4 * s);
      // Handle
      gfx.lineStyle(0.5 * s, 0x333333);
      gfx.lineBetween(handX - 1 * s, handY, handX + 1 * s, handY);
      break;

    case 'brochure':
      gfx.fillStyle(0x22aa55);
      gfx.fillRect(handX - 1.5 * s, handY - 3 * s, 3 * s, 4 * s);
      // White text lines
      gfx.fillStyle(0xffffff, 0.5);
      gfx.fillRect(handX - 1 * s, handY - 2 * s, 2 * s, 0.5 * s);
      gfx.fillRect(handX - 1 * s, handY - 1 * s, 2 * s, 0.5 * s);
      break;

    case 'laptop':
      // Base
      gfx.fillStyle(0x444444);
      gfx.fillRect(handX - 3 * s, handY - 1 * s, 6 * s, 1 * s);
      // Screen (angled up)
      gfx.fillStyle(0x333333);
      gfx.fillRect(handX - 3 * s, handY - 5 * s, 6 * s, 4 * s);
      gfx.fillStyle(0x4488cc, 0.6);
      gfx.fillRect(handX - 2.5 * s, handY - 4.5 * s, 5 * s, 3 * s);
      break;

    case 'vape':
      // Thin cylinder
      gfx.fillStyle(0x888888);
      gfx.fillRect(handX - 0.5 * s, handY - 4 * s, 1 * s, 4 * s);
      // Smoke puff
      gfx.fillStyle(0xcccccc, 0.4);
      gfx.fillCircle(handX, handY - 5.5 * s, 1.5 * s);
      break;

    case 'purse':
      gfx.fillStyle(0x8b4513);
      gfx.fillRect(handX - 2 * s, handY, 4 * s, 3 * s);
      // Strap
      gfx.lineStyle(0.5 * s, 0x6b3410);
      gfx.lineBetween(handX - 1 * s, handY, handX + 1 * s, handY - 2 * s);
      break;

    case 'duffel':
      // Large bag at feet
      gfx.fillStyle(0x2d4a2d);
      gfx.fillRect(cx - 5 * s, feetY - 3 * s, 10 * s, 3 * s);
      // Strap
      gfx.lineStyle(0.5 * s, 0x1d3a1d);
      gfx.lineBetween(cx - 3 * s, feetY - 3 * s, cx + 3 * s, feetY - 3 * s);
      break;
  }
}

// ============================================================
// Tiny Background Person — silhouette for distant characters
// ============================================================

export function drawTinyPerson(
  gfx: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  color: number,
  sz: number = 0.4,
): void {
  gfx.fillStyle(color);
  gfx.fillCircle(x, y - 8 * sz, 2 * sz);
  gfx.fillRect(x - 2 * sz, y - 6 * sz, 4 * sz, 6 * sz);
}

// ============================================================
// State-derived appearance helpers
// ============================================================

/**
 * Determine Dad's mouth expression based on game state.
 */
export function getDadFace(sobriety: number, suspicion: number): MouthStyle {
  if (sobriety < 20) return 'sleepy';
  if (sobriety < 40) return 'grin';
  if (sobriety < 60) return 'smile';
  if (suspicion > 70) return 'shock';
  return 'neutral';
}

/**
 * Determine Dad's eye expression based on game state.
 */
export function getDadEyes(state: DadState): EyeStyle {
  if (state.sobriety < 20) return 'sleepy';
  if (state.sobriety < 40) return 'drunk';
  if (state.vices.drugs >= 1 && state.sobriety < 60) return 'stoned';
  if (state.suspicion > 70) return 'wide';
  return 'normal';
}

/**
 * Compute Dad's dishevelment overlays from state flags.
 * Returns a partial CharacterConfig to merge into the draw call.
 */
export function getDadDishevelment(
  state: DadState,
  animTime: number,
): Partial<CharacterConfig> {
  const out: Partial<CharacterConfig> = {};
  const flags = state.flags;
  // Stain: drunk OR BBQ grease OR had beer in garage
  if (state.sobriety < 40 || flags.hadBeerInGarage === true) {
    out.stain = true;
  }
  // Lipstick evidence
  if (flags.lipstick === true) {
    out.lipstickMark = true;
  }
  // Bandage from injury
  if (flags.injury === true) {
    out.bandage = true;
  }
  // Smell — weed smoke or beer stink — waft lines
  if (flags.smell === true || flags.weedSmoked === true) {
    out.smellLines = true;
  }
  // Cash bulge
  if (flags.cash_bulge === true) {
    out.cashBulge = true;
  }
  // Drunk sway — slow sinusoidal tilt that worsens below 50 sobriety
  if (state.sobriety < 50) {
    const tiltAmount = (50 - state.sobriety) / 50 * 0.18; // up to ~10°
    out.tilt = Math.sin(animTime * 1.2) * tiltAmount;
  }
  return out;
}
