import Phaser from 'phaser';
import type {
  DadState, ViceType, ActiveEffect, StateCondition, StateEffect,
} from '../types';

export type ConsumptionKind = 'beer' | 'bong' | 'crack' | 'cigarette' | 'shot';

/**
 * PlayerState — the central nervous system of the game.
 *
 * Manages all meters, vice tracking, active effects, inventory,
 * and flag-based branching. Every other system writes to this
 * and reads from it.
 */
export class PlayerState {
  public state: DadState;
  private events: Phaser.Events.EventEmitter;

  /** Transient consumption animation state (beer/bong/crack/cig). */
  public consumption: { kind: ConsumptionKind; endAt: number } | null = null;

  constructor() {
    this.events = new Phaser.Events.EventEmitter();
    this.state = this.createFreshState();
  }

  /** Trigger a visible consumption animation on the player for `ms` milliseconds. */
  triggerConsumption(kind: ConsumptionKind, ms = 1600): void {
    this.consumption = { kind, endAt: performance.now() + ms };
  }

  /** Active kind if consumption is still in flight, else null. */
  getActiveConsumption(): ConsumptionKind | null {
    if (!this.consumption) return null;
    if (performance.now() >= this.consumption.endAt) {
      this.consumption = null;
      return null;
    }
    return this.consumption.kind;
  }

  private createFreshState(): DadState {
    return {
      name: 'Dave',
      sobriety: 100,
      suspicion: 0,
      energy: 80,
      reputation: 70,
      vices: {
        alcohol: 0,
        drugs: 0,
        gambling: 0,
        prostitution: 0,
        guns: 0,
        pyramid: 0,
        racing: 0,
        theft: 0,
        digital: 0,
      },
      activeEffects: [],
      inventory: [],
      currentTime: 420, // 7:00 AM
      flags: {
        lawnStatus: 0,
        mowQuality: 100,
        grillStatus: 'not_started',
        cash: 60,
        evidence: '',
        heroicFlag: false,
      },
      visitedScenes: [],
      currentLocation: 'kitchen',
    };
  }

  // ── Meter operations ──────────────────────────────────────

  adjustMeter(meter: 'sobriety' | 'suspicion' | 'energy' | 'reputation', delta: number): void {
    const old = this.state[meter];
    this.state[meter] = Math.max(0, Math.min(100, old + delta));
    this.events.emit('meter_change', meter, old, this.state[meter]);

    if (meter === 'suspicion' && this.state.suspicion >= 60) {
      this.events.emit('danger', 'suspicion_high');
    }
    if (meter === 'sobriety' && this.state.sobriety <= 20) {
      this.events.emit('danger', 'very_drunk');
    }
    if (meter === 'energy' && this.state.energy <= 10) {
      this.events.emit('danger', 'exhausted');
    }
  }

  get wobbleFactor(): number {
    const drunkWobble = (100 - this.state.sobriety) / 100;
    const tiredWobble = (100 - this.state.energy) / 200;
    return Math.min(1, drunkWobble + tiredWobble);
  }

  // ── Vice tracking ─────────────────────────────────────────

  addViceExposure(vice: ViceType, amount: number): void {
    this.state.vices[vice] = Math.min(3, this.state.vices[vice] + amount);
    this.events.emit('vice', vice, this.state.vices[vice]);
  }

  get dominantVice(): ViceType {
    let max: ViceType = 'alcohol';
    let maxVal = 0;
    for (const [vice, val] of Object.entries(this.state.vices)) {
      if (val > maxVal) {
        maxVal = val;
        max = vice as ViceType;
      }
    }
    return max;
  }

  get maxViceDepth(): number {
    return Math.max(...Object.values(this.state.vices));
  }

  get viceCount(): number {
    return Object.values(this.state.vices).filter(d => d >= 1).length;
  }

  // ── Evidence system ───────────────────────────────────────

  addEvidence(ev: string): void {
    const current = (this.state.flags.evidence as string) || '';
    const list = current ? current.split(',') : [];
    if (!list.includes(ev)) {
      list.push(ev);
      this.state.flags.evidence = list.join(',');
      this.events.emit('evidence_added', ev);
    }
  }

  hasEvidence(ev: string): boolean {
    const current = (this.state.flags.evidence as string) || '';
    return current.split(',').includes(ev);
  }

  // ── Active effects ────────────────────────────────────────

  addEffect(effect: Omit<ActiveEffect, 'startedAt'>): void {
    const full: ActiveEffect = {
      ...effect,
      startedAt: this.state.currentTime,
    };
    this.state.activeEffects.push(full);
    this.events.emit('effect_added', full);
  }

  processEffects(): void {
    const now = this.state.currentTime;
    const remaining: ActiveEffect[] = [];

    for (const fx of this.state.activeEffects) {
      if (now - fx.startedAt < fx.durationMinutes) {
        for (const [meter, delta] of Object.entries(fx.meterDeltas)) {
          this.adjustMeter(meter as any, delta as number);
        }
        remaining.push(fx);
      } else {
        this.events.emit('effect_expired', fx);
      }
    }

    this.state.activeEffects = remaining;
  }

  // ── Sobriety recovery ────────────────────────────────────

  recoverSobriety(minutesPassed: number): void {
    if (this.state.sobriety < 100) {
      const recovery = Math.floor(minutesPassed / 30) * 5;
      if (recovery > 0) {
        this.adjustMeter('sobriety', recovery);
      }
    }
  }

  // ── Inventory ─────────────────────────────────────────────

  addItem(itemId: string): void {
    if (!this.state.inventory.includes(itemId)) {
      this.state.inventory.push(itemId);
      this.events.emit('item_added', itemId);
    }
  }

  removeItem(itemId: string): void {
    const idx = this.state.inventory.indexOf(itemId);
    if (idx !== -1) {
      this.state.inventory.splice(idx, 1);
      this.events.emit('item_removed', itemId);
    }
  }

  hasItem(itemId: string): boolean {
    return this.state.inventory.includes(itemId);
  }

  // ── Flags ─────────────────────────────────────────────────

  setFlag(key: string, value: boolean | number | string): void {
    this.state.flags[key] = value;
  }

  getFlag(key: string): boolean | number | string | undefined {
    return this.state.flags[key];
  }

  // ── Condition evaluation ──────────────────────────────────

  checkCondition(cond: StateCondition): boolean {
    const val = this.resolveField(cond.field);

    switch (cond.op) {
      case '>':   return (val as number) > (cond.value as number);
      case '<':   return (val as number) < (cond.value as number);
      case '>=':  return (val as number) >= (cond.value as number);
      case '<=':  return (val as number) <= (cond.value as number);
      case '==':  return val === cond.value;
      case '!=':  return val !== cond.value;
      case 'has': {
        const resolved = this.resolveField(cond.field);
        if (Array.isArray(resolved)) return resolved.includes(cond.value as string);
        return this.state.inventory.includes(cond.value as string);
      }
      case '!has': {
        const resolved = this.resolveField(cond.field);
        if (Array.isArray(resolved)) return !resolved.includes(cond.value as string);
        return !this.state.inventory.includes(cond.value as string);
      }
      default:    return false;
    }
  }

  checkConditions(conditions: StateCondition[]): boolean {
    return conditions.every(c => this.checkCondition(c));
  }

  resolveField(path: string): any {
    const parts = path.split('.');
    let obj: any = this.state;
    for (const p of parts) {
      if (obj == null) return undefined;
      obj = obj[p];
    }
    return obj;
  }

  // ── Apply effects from dialogue/actions ───────────────────

  applyEffect(effect: StateEffect): void {
    switch (effect.type) {
      case 'set':
        if (effect.field) this.setNestedField(effect.field, effect.value!);
        break;
      case 'add':
        if (effect.field) {
          const current = this.resolveField(effect.field);
          const base = typeof current === 'number' ? current : 0;
          this.setNestedField(effect.field, base + (effect.value as number));
        }
        break;
      case 'flag':
        if (effect.field) this.setFlag(effect.field, effect.value!);
        break;
      case 'addItem':
        this.addItem(effect.value as string);
        break;
      case 'removeItem':
        this.removeItem(effect.value as string);
        break;
      case 'addEffect':
        if (effect.effect) this.addEffect(effect.effect);
        break;
      case 'animate':
        if (typeof effect.value === 'string') {
          this.triggerConsumption(effect.value as ConsumptionKind);
        }
        break;
    }
  }

  applyEffects(effects: StateEffect[]): void {
    for (const e of effects) this.applyEffect(e);
  }

  private setNestedField(path: string, value: any): void {
    const meters = ['sobriety', 'suspicion', 'energy', 'reputation'];
    if (meters.includes(path)) {
      (this.state as any)[path] = Math.max(0, Math.min(100, value));
      return;
    }
    const parts = path.split('.');
    let obj: any = this.state;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  /** Update computed flags for ending conditions */
  computeEndingFlags(): void {
    this.state.flags.maxViceDepth = this.maxViceDepth;
    this.state.flags.viceCount = this.viceCount;
  }

  // ── Events ────────────────────────────────────────────────

  on(event: string, fn: (...args: any[]) => void): this {
    this.events.on(event, fn);
    return this;
  }

  off(event: string, fn: (...args: any[]) => void): this {
    this.events.off(event, fn);
    return this;
  }

  reset(): void {
    this.state = this.createFreshState();
  }
}
