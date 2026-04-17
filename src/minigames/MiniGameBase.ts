import Phaser from 'phaser';
import type { MiniGameConfig, MiniGameDifficulty } from '../types';
import type { PlayerState } from '../systems/PlayerState';

/**
 * MiniGameBase — abstract base class for all mini-games.
 *
 * Each mini-game is a Phaser Scene that:
 * 1. Reads its config from JSON
 * 2. Adjusts difficulty based on player state (sobriety affects wobble)
 * 3. Runs the game
 * 4. Reports success/failure back to the parent scene
 *
 * Extend this and implement: onStart(), onUpdate(), onSuccess(), onFailure()
 */
export abstract class MiniGameBase extends Phaser.Scene {
  protected config!: MiniGameConfig;
  protected playerState!: PlayerState;
  protected difficulty!: MiniGameDifficulty;
  protected elapsed = 0;
  protected isComplete = false;
  protected parentSceneKey = '';

  init(data: {
    config: MiniGameConfig;
    playerState: PlayerState;
    parentSceneKey: string;
  }): void {
    this.config = data.config;
    this.playerState = data.playerState;
    this.parentSceneKey = data.parentSceneKey;
    this.elapsed = 0;
    this.isComplete = false;

    // Calculate effective difficulty
    this.difficulty = { ...this.config.difficulty };

    // Apply state-based wobble (drunkness makes everything harder)
    this.difficulty.wobble = Math.min(1,
      this.difficulty.wobble + this.playerState.wobbleFactor * 0.5
    );

    // Apply conditional modifiers from config
    if (this.config.modifiers) {
      for (const mod of this.config.modifiers) {
        if (this.playerState.checkCondition(mod.condition)) {
          Object.assign(this.difficulty, {
            ...this.difficulty,
            ...Object.fromEntries(
              Object.entries(mod.difficultyDelta).map(([k, v]) => [
                k,
                (this.difficulty as any)[k] + (v as number),
              ])
            ),
          });
        }
      }
    }
  }

  create(): void {
    this.onStart();
  }

  update(_time: number, delta: number): void {
    if (this.isComplete) return;

    this.elapsed += delta / 1000;

    // Time's up
    if (this.elapsed >= this.difficulty.duration) {
      this.fail();
      return;
    }

    this.onUpdate(delta / 1000);
  }

  /** Called when the mini-game starts */
  protected abstract onStart(): void;

  /** Called every frame during gameplay */
  protected abstract onUpdate(dt: number): void;

  /** Complete the mini-game successfully */
  protected succeed(): void {
    if (this.isComplete) return;
    this.isComplete = true;
    this.playerState.applyEffects(this.config.rewards);
    this.onSuccess();
    this.returnToParent('success');
  }

  /** Fail the mini-game */
  protected fail(): void {
    if (this.isComplete) return;
    this.isComplete = true;
    this.playerState.applyEffects(this.config.penalties);
    this.onFailure();
    this.returnToParent('failure');
  }

  /** Override for success animation/feedback */
  protected onSuccess(): void {}

  /** Override for failure animation/feedback */
  protected onFailure(): void {}

  private returnToParent(result: 'success' | 'failure'): void {
    // Small delay for feedback, then return
    this.time.delayedCall(1500, () => {
      this.scene.stop();
      this.scene.resume(this.parentSceneKey);
      // Emit result to parent
      this.scene.get(this.parentSceneKey)?.events.emit('minigame_result', {
        gameId: this.config.id,
        result,
      });
    });
  }
}
