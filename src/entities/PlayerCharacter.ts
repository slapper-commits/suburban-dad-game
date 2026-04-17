import Phaser from 'phaser';
import { drawCharacter, getDadFace, getDadEyes, getDadDishevelment, CharacterConfig } from '../rendering/CharacterRenderer';
import type { DadState } from '../types';

const MOVE_SPEED = 140;       // pixels per second (slightly faster for arcade feel)
const JUMP_SPEED_BONUS = 50;  // extra horizontal speed while jumping
const BOB_SPEED = 10;         // bob frequency (snappier)
const BOB_HEIGHT = 2;         // bob amplitude in pixels
const WOBBLE_SPEED = 3;       // drunk wobble frequency
const WOBBLE_MAX = 4;         // max wobble amplitude

// Jump physics
const JUMP_VELOCITY = -280;   // initial upward velocity (pixels/sec)
const GRAVITY = 800;          // gravity (pixels/sec²)

/**
 * PlayerCharacter — Dad as a controllable walking entity.
 *
 * Uses arrow keys / WASD to move left/right along the ground plane.
 * Space / W / Up to jump (slight forward momentum boost — arcade style).
 * Drawn each frame via CharacterRenderer on its own Graphics object.
 */
export class PlayerCharacter {
  private gfx: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  // Position
  private posX: number;
  private groundY: number;
  private minX = 30;
  private maxX = 770;

  // State
  private facingLeft = false;
  private frozen = false;
  private walkTime = 0;
  private isMoving = false;

  // Jump state
  private jumpY = 0;          // vertical offset from ground (negative = up)
  private jumpVelY = 0;       // current vertical velocity
  private isJumping = false;
  private jumpCooldown = 0;   // prevents spamming

  // Shadow for grounding effect
  private shadowAlpha = 0;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    this.scene = scene;
    this.posX = x;
    this.groundY = groundY;

    this.gfx = scene.add.graphics().setDepth(5);

    // Input
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keyA = scene.input.keyboard!.addKey('A');
    this.keyD = scene.input.keyboard!.addKey('D');
    this.keyW = scene.input.keyboard!.addKey('W');
    this.keySpace = scene.input.keyboard!.addKey('SPACE');
  }

  /** Call every frame with delta in ms */
  update(delta: number, state: DadState, consumptionKind?: string | null): void {
    const dt = delta / 1000; // seconds

    if (!this.frozen) {
      this.handleMovement(dt, state.sobriety);
      this.handleJump(dt, state.sobriety);
    } else {
      this.isMoving = false;
    }

    this.draw(state, consumptionKind ?? null);
  }

  private handleMovement(dt: number, sobriety: number): void {
    let dx = 0;

    if (this.cursors.left.isDown || this.keyA.isDown) {
      dx = -MOVE_SPEED;
      this.facingLeft = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      dx = MOVE_SPEED;
      this.facingLeft = false;
    }

    this.isMoving = dx !== 0;

    // Jump gives a forward momentum boost
    if (this.isJumping && dx !== 0) {
      dx += (dx > 0 ? JUMP_SPEED_BONUS : -JUMP_SPEED_BONUS);
    }

    if (this.isMoving || this.isJumping) {
      this.walkTime += dt;
      this.posX += dx * dt;

      // Sobriety wobble (worse when jumping drunk — hilarious)
      if (sobriety < 50) {
        const wobbleAmount = WOBBLE_MAX * ((50 - sobriety) / 50);
        const wobbleMult = this.isJumping ? 1.5 : 1;
        this.posX += Math.sin(this.walkTime * WOBBLE_SPEED) * wobbleAmount * dt * 10 * wobbleMult;
      }

      // Clamp to walk bounds
      this.posX = Math.max(this.minX, Math.min(this.maxX, this.posX));
    }
  }

  private handleJump(dt: number, sobriety: number): void {
    // Cooldown tick
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= dt;
    }

    // Initiate jump
    const jumpPressed = this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown;
    if (jumpPressed && !this.isJumping && this.jumpCooldown <= 0) {
      this.isJumping = true;
      // Drunk dads can't jump as high
      const jumpPower = sobriety < 30 ? JUMP_VELOCITY * 0.6 : sobriety < 60 ? JUMP_VELOCITY * 0.8 : JUMP_VELOCITY;
      this.jumpVelY = jumpPower;
      this.jumpCooldown = 0.15; // prevent double-jump spam
    }

    // Apply physics
    if (this.isJumping) {
      this.jumpVelY += GRAVITY * dt;
      this.jumpY += this.jumpVelY * dt;

      // Landing
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpVelY = 0;
        this.isJumping = false;
        this.jumpCooldown = 0.1;
      }
    }

    // Shadow alpha based on height
    this.shadowAlpha = this.isJumping ? Math.min(0.3, Math.abs(this.jumpY) / 100) : 0;
  }

  private draw(state: DadState, consumptionKind: string | null = null): void {
    this.gfx.clear();

    // Walking bob (disabled while jumping)
    let bobOffset = 0;
    if (this.isMoving && !this.isJumping) {
      bobOffset = Math.sin(this.walkTime * BOB_SPEED * Math.PI) * BOB_HEIGHT;
    }

    // Jump shadow on ground
    if (this.shadowAlpha > 0) {
      const shadowScale = 1 - Math.abs(this.jumpY) / 150;
      const shadowW = 16 * Math.max(0.3, shadowScale);
      gfx_shadow(this.gfx, this.posX, this.groundY, shadowW, this.shadowAlpha);
    }

    const feetY = this.groundY + bobOffset + this.jumpY;
    const mouth = getDadFace(state.sobriety, state.suspicion);
    const hasBeer = state.vices.alcohol >= 1 && state.sobriety < 80;
    // Monotonic scene time (seconds) — drives breathe/blink regardless of movement
    const animTime = this.scene.time.now / 1000;
    const dishevel = getDadDishevelment(state, animTime);

    const config: CharacterConfig = {
      x: this.posX,
      y: feetY,
      mouth,
      eyes: getDadEyes(state),
      beer: hasBeer && !consumptionKind,  // hide passive beer when actively drinking
      flipX: this.facingLeft,
      animTime,
      animSeed: 0,
      // Use walkTime * step rate as walk phase (full cycle ~0.5s of walking)
      walkPhase: this.walkTime * 2,
      isWalking: this.isMoving && !this.isJumping && !consumptionKind,
      consumption: consumptionKind as CharacterConfig['consumption'] ?? undefined,
      ...dishevel,
    };

    drawCharacter(this.gfx, config);
  }

  // ── Public API ────────────────────────────────────────────

  get x(): number {
    return this.posX;
  }

  get jumping(): boolean {
    return this.isJumping;
  }

  setPosition(x: number): void {
    this.posX = x;
  }

  setWalkBounds(minX: number, maxX: number, groundY: number): void {
    this.minX = minX;
    this.maxX = maxX;
    this.groundY = groundY;
    // Reset jump state on scene change
    this.jumpY = 0;
    this.jumpVelY = 0;
    this.isJumping = false;
  }

  freeze(): void {
    this.frozen = true;
  }

  unfreeze(): void {
    this.frozen = false;
  }

  get isFrozen(): boolean {
    return this.frozen;
  }

  /** Check if player is near the left edge */
  isAtLeftEdge(threshold = 50): boolean {
    return this.posX <= this.minX + threshold;
  }

  /** Check if player is near the right edge */
  isAtRightEdge(threshold = 50): boolean {
    return this.posX >= this.maxX - threshold;
  }

  destroy(): void {
    this.gfx.destroy();
  }
}

// ── Helpers ─────────────────────────────────────────────────

/** Draw a small elliptical shadow on the ground */
function gfx_shadow(gfx: Phaser.GameObjects.Graphics, x: number, y: number, w: number, alpha: number): void {
  gfx.fillStyle(0x000000, alpha);
  gfx.fillEllipse(x, y + 2, w, 4);
}
