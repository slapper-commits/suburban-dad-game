import Phaser from 'phaser';
import type { DadState } from '../types';

/**
 * TimeClock — manages the in-game clock from 7:00 AM to 8:00 PM.
 *
 * Time is stored as absolute minutes since midnight:
 *   420 = 7:00 AM (game start)
 *   720 = 12:00 PM (noon)
 *   1020 = 5:00 PM (BBQ forced)
 *   1200 = 8:00 PM (game ends)
 *
 * Time advances discretely when the player takes actions.
 */
export class TimeClock {
  private events: Phaser.Events.EventEmitter;

  /** Minute thresholds that trigger narrative beats */
  private milestones = new Map<number, string>([
    [720,  'noon'],
    [840,  'afternoon'],
    [960,  'late_afternoon'],
    [990,  'force_home'],
    [1020, 'bbq_time'],
    [1140, 'evening'],
    [1200, 'game_over'],
  ]);

  private firedMilestones = new Set<number>();

  constructor(private state: DadState) {
    this.events = new Phaser.Events.EventEmitter();
  }

  /** Current time as a display string like "7:00 AM" */
  get displayTime(): string {
    const totalMin = this.state.currentTime;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const displayM = m.toString().padStart(2, '0');
    return `${displayH}:${displayM} ${suffix}`;
  }

  /** How many game-minutes remain until 8:00 PM */
  get minutesRemaining(): number {
    return Math.max(0, 1200 - this.state.currentTime);
  }

  /** 0–1 progress through the day (0 = 7am, 1 = 8pm) */
  get dayProgress(): number {
    const elapsed = this.state.currentTime - 420;
    const total = 780; // 13 hours
    return Math.min(1, Math.max(0, elapsed / total));
  }

  /** Is it 8pm or later? */
  get isGameOver(): boolean {
    return this.state.currentTime >= 1200;
  }

  /** Is it 5pm or later? (BBQ time) */
  get isBBQTime(): boolean {
    return this.state.currentTime >= 1020;
  }

  /** Is it 4:30pm or later? (force home) */
  get isForceHomeTime(): boolean {
    return this.state.currentTime >= 990;
  }

  /**
   * Advance the clock by `minutes` game-minutes.
   * Returns any milestones that were crossed.
   */
  advance(minutes: number): string[] {
    const crossedMilestones: string[] = [];

    this.state.currentTime += minutes;

    // Cap at 8:00 PM (1200)
    if (this.state.currentTime > 1200) {
      this.state.currentTime = 1200;
    }

    // Check milestones
    for (const [minute, label] of this.milestones) {
      if (this.state.currentTime >= minute && !this.firedMilestones.has(minute)) {
        this.firedMilestones.add(minute);
        crossedMilestones.push(label);
        this.events.emit('milestone', label, minute);
      }
    }

    // Emit generic tick
    this.events.emit('tick', this.state.currentTime);

    if (this.isGameOver) {
      this.events.emit('gameover');
    }

    return crossedMilestones;
  }

  /** Subscribe to clock events */
  on(event: 'tick' | 'milestone' | 'gameover', fn: (...args: any[]) => void): this {
    this.events.on(event, fn);
    return this;
  }

  off(event: string, fn: (...args: any[]) => void): this {
    this.events.off(event, fn);
    return this;
  }

  /** Reset for new game */
  reset(): void {
    this.state.currentTime = 420; // 7:00 AM
    this.firedMilestones.clear();
  }
}
