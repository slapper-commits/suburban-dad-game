import type { DadState } from '../types';

/**
 * SceneChoreography — a reusable engine for theatrical "live-action" beats
 * that animate actors (NPCs, vehicles, props) on top of static scene renders.
 *
 * Conceptually each Beat is a short cutscene timeline that:
 *  - Triggers when a game-state condition becomes true (e.g. "deal closed")
 *  - Runs for a fixed duration, updating actor positions/flags every frame
 *  - Writes a persistent flag on completion so the world reflects the change
 *    permanently (the fence doesn't come back, the delivery truck stays parked)
 *
 * Scene renderers consume the live state via getActor() / isCompleted() and
 * fall back to static rendering when no beat is active.
 *
 * Add new dynamic moments by registering more beats (see ./choreography/beats.ts).
 */

export interface ActorState {
  /** World X in the scene. */
  x: number;
  /** World Y in the scene (usually GROUND_Y for ground NPCs). */
  y: number;
  /** If true, renderers should skip drawing this actor this frame
   *  (e.g. after they entered a car, before the car drives off). */
  hidden: boolean;
  /** Free-form pose hint readable by renderers: 'walking' | 'driving' | etc. */
  pose?: string;
  /** Free-form metadata for renderer consumption (colors, flipX, etc.). */
  meta?: Record<string, unknown>;
}

export interface ChoreographyBeat {
  /** Unique beat id — renderers look up actors via this. */
  id: string;
  /** Scene id this beat belongs to (e.g. 'sketchy'). */
  sceneId: string;
  /** Returns true when the beat should start. Checked each frame. */
  trigger: (state: DadState) => boolean;
  /**
   * Persistent flag name. Once set (in state.flags), the beat never triggers
   * again, and renderers can use isCompleted() to render the "post" world.
   */
  persistFlag: string;
  /** Total duration in seconds. */
  duration: number;
  /** Builds the initial actor dictionary when the beat kicks off. */
  initial: () => Record<string, ActorState>;
  /**
   * Per-frame update. `t` is normalized progression in [0, 1]. Mutate the
   * actor dictionary in place — renderers will read the latest values.
   */
  update: (t: number, actors: Record<string, ActorState>) => void;
  /** Fires once when the beat completes (just before persistFlag is set). */
  onComplete?: (state: DadState) => void;
}

interface ActiveBeat {
  beat: ChoreographyBeat;
  elapsed: number;
  actors: Record<string, ActorState>;
}

class Choreographer {
  private beats: ChoreographyBeat[] = [];
  private active: Map<string, ActiveBeat> = new Map();

  /** Register a beat. Safe to call at game boot. */
  register(beat: ChoreographyBeat): void {
    // Guard against double-registration if boot code runs twice.
    if (this.beats.some(b => b.id === beat.id)) return;
    this.beats.push(beat);
  }

  /**
   * Advance active beats and evaluate triggers. Call every frame from
   * GameScene.update with the raw frame delta (ms) and current player state.
   */
  update(deltaMs: number, state: DadState): void {
    const dt = deltaMs / 1000;

    // Advance active beats first (so a beat that just completed in this frame
    // still writes its persist flag before any trigger re-check).
    for (const [id, active] of this.active.entries()) {
      active.elapsed += dt;
      const t = Math.min(1, active.elapsed / active.beat.duration);
      active.beat.update(t, active.actors);
      if (active.elapsed >= active.beat.duration) {
        active.beat.onComplete?.(state);
        state.flags[active.beat.persistFlag] = true;
        this.active.delete(id);
      }
    }

    // Evaluate triggers for not-yet-active, not-yet-completed beats.
    for (const beat of this.beats) {
      if (this.active.has(beat.id)) continue;
      if (state.flags[beat.persistFlag] === true) continue;
      if (beat.trigger(state)) {
        this.active.set(beat.id, {
          beat,
          elapsed: 0,
          actors: beat.initial(),
        });
      }
    }
  }

  /** Lookup an actor position for an active beat. Returns null if not active. */
  getActor(beatId: string, actorId: string): ActorState | null {
    const active = this.active.get(beatId);
    if (!active) return null;
    return active.actors[actorId] ?? null;
  }

  /** True while the beat is actively playing. */
  isActive(beatId: string): boolean {
    return this.active.has(beatId);
  }

  /** True after the beat has completed (persist flag is set). */
  isCompleted(state: DadState, persistFlag: string): boolean {
    return state.flags[persistFlag] === true;
  }

  /** Reset (used by tests or "new game"). */
  reset(): void {
    this.active.clear();
  }
}

export const choreography = new Choreographer();
