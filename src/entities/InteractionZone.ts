import Phaser from 'phaser';
import type { HotspotAction, StateCondition } from '../types';

export interface InteractionZoneConfig {
  id: string;
  label: string;
  x: number;              // world x-coordinate
  radius?: number;        // proximity radius (default 40)
  action: HotspotAction;
  conditions?: StateCondition[];
  visibleWhen?: StateCondition[];
}

/**
 * InteractionZone — proximity-based trigger that replaces clickable hotspot rects.
 *
 * Shows a floating "E: <label>" prompt when the player is within radius.
 * The zone itself is invisible; only the prompt text is drawn.
 */
export class InteractionZone {
  readonly config: InteractionZoneConfig;
  readonly x: number;
  readonly radius: number;

  private prompt: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private _inRange = false;

  constructor(scene: Phaser.Scene, config: InteractionZoneConfig, groundY: number) {
    this.scene = scene;
    this.config = config;
    this.x = config.x;
    this.radius = config.radius ?? 40;

    // Floating prompt above the zone position
    this.prompt = scene.add.text(config.x, groundY - 52, `E: ${config.label}`, {
      fontSize: '11px',
      color: '#f5c542',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 3 },
    })
      .setOrigin(0.5, 1)
      .setDepth(6)
      .setVisible(false);
  }

  /** Check if player x is within interaction radius */
  isPlayerInRange(playerX: number): boolean {
    return Math.abs(playerX - this.x) <= this.radius;
  }

  /** Update prompt visibility based on player position */
  update(playerX: number): void {
    this._inRange = this.isPlayerInRange(playerX);
    this.prompt.setVisible(this._inRange);
  }

  get inRange(): boolean {
    return this._inRange;
  }

  /** Hide the prompt (e.g., during dialogue) */
  hide(): void {
    this.prompt.setVisible(false);
  }

  /** Resume showing prompt if in range */
  show(): void {
    // Will be re-evaluated on next update
  }

  destroy(): void {
    this.prompt.destroy();
  }
}
