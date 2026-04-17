import type { PlayerState } from './PlayerState';
import type { TimeClock } from './TimeClock';
import type { DialogueEngine } from './DialogueEngine';
import type { DialogueTree } from '../types';

/**
 * A scripted act-beat that fires at a specific BBQ time slot.
 *
 * The first act in the list whose `pick` function returns a tree id
 * (looked up in `treeRegistry`) fires at that slot. If nothing matches,
 * no dialogue fires that slot (silence is OK).
 */
export interface BBQActBeat {
  /** Absolute game-minute the slot fires at (e.g. 1035 = 5:15 PM). */
  at: number;
  /** Returns the dialogue tree id to play, or null to pass on this slot. */
  pick: (state: any) => string | null;
  /** Optional stable identifier for debugging / analytics. */
  id?: string;
}

/**
 * BBQDirector — fires scripted "act" dialogues at BBQ time slots
 * based on player state.
 *
 * Listens to TimeClock ticks; at each of 8 slots between 5pm and 6:45pm
 * picks a scripted beat based on flag priority and calls dialogueEngine.start().
 *
 * Pattern mirrors WifeTexts. No new effect types required.
 */
export class BBQDirector {
  private firedSlots = new Set<number>();

  constructor(
    private playerState: PlayerState,
    private timeClock: TimeClock,
    private dialogueEngine: DialogueEngine,
    private treeRegistry: Record<string, DialogueTree>,
  ) {}

  /** Wire to the TimeClock — call on every tick. */
  check(): void {
    const state = this.playerState.state;
    const t = state.currentTime;

    // Only fire during BBQ window, only at BBQ.
    if (t < 1020 || t >= 1140) return;
    if (state.currentLocation !== 'bbq') return;
    // Don't interrupt an active dialogue.
    if (this.dialogueEngine.isActive) return;

    for (const beat of this.acts) {
      if (this.firedSlots.has(beat.at)) continue;
      if (t < beat.at) continue;

      // Eligible — try to pick a tree. If pick returns null, still mark
      // fired so we don't retry every tick.
      this.firedSlots.add(beat.at);
      const treeId = beat.pick(state);
      if (!treeId) continue;
      const tree = this.treeRegistry[treeId];
      if (!tree) {
        // Safe-fail in dev — log and continue.
        // eslint-disable-next-line no-console
        console.warn(`[BBQDirector] tree not found: ${treeId}`);
        continue;
      }
      this.dialogueEngine.start(tree);
      // One beat per tick to avoid back-to-back dialogue chains.
      return;
    }
  }

  /** Reset for a new game. */
  reset(): void {
    this.firedSlots.clear();
  }

  /** Update the tree registry reference (e.g. after GameScene init). */
  setTreeRegistry(registry: Record<string, DialogueTree>): void {
    this.treeRegistry = registry;
  }

  /**
   * The act list — ordered slots, each slot picks the highest-priority
   * tree its `pick` function matches.
   *
   * Authoring goal: every run's BBQ is different based on what the player
   * did during the day. "Callback" trees fire when the player met that NPC earlier.
   */
  private acts: BBQActBeat[] = [
    // 5:00 PM arrival — one-time greeting that changes based on state
    {
      at: 1020,
      id: 'arrival',
      pick: (s) => {
        if (s.sobriety < 30) return 'bbq_arrival_wasted';
        if (s.suspicion >= 50) return 'bbq_arrival_suspicious';
        return 'bbq_arrival_clean';
      },
    },
    // 5:15 PM — first callback NPCs try to arrive
    {
      at: 1035,
      id: 'first_callback',
      pick: (s) => {
        if (s.flags.rayray_invited === true) return 'bbq_rayray_arrives';
        if (s.flags.amber_confidante === true) return 'bbq_amber_arrives';
        return null;
      },
    },
    // 5:30 PM — evidence detection
    {
      at: 1050,
      id: 'evidence',
      pick: (s) => {
        if (s.flags.lipstick === true) return 'bbq_mil_screams';
        if (s.flags.crack_smoked === true && !s.flags.paranoid_outed) return 'bbq_neighbor_eyes';
        return null;
      },
    },
    // 5:45 PM — social escalation
    {
      at: 1065,
      id: 'escalation',
      pick: (s) => {
        if (s.suspicion >= 60 && !s.flags.karen_confronted) return 'bbq_karen_drink_throw';
        if (s.flags.guns_fired === true) return 'bbq_fist_fight';
        return null;
      },
    },
    // 6:00 PM — SECOND callback slot (different from first)
    {
      at: 1080,
      id: 'second_callback',
      pick: (s) => {
        if (s.flags.amber_confidante === true && s.flags.rayray_invited === true) {
          // Whichever hasn't fired — but we fired first_callback at 1035.
          // If rayray fired first, amber now arrives.
          return 'bbq_amber_arrives';
        }
        if (s.flags.sharon_helped === true) return 'bbq_sharon_ex_arrives';
        return null;
      },
    },
    // 6:15 PM — penultimate event
    {
      at: 1095,
      id: 'penultimate',
      pick: (s) => {
        if ((s.vices.guns ?? 0) >= 3) return 'bbq_cops_raid';
        if ((s.flags.grillStatus ?? 'not_started') !== 'done' && s.sobriety < 40) return 'bbq_grill_explosion';
        return null;
      },
    },
    // 6:30 PM — CLIMAX. Pick the most dramatic applicable event.
    {
      at: 1110,
      id: 'climax',
      pick: (s) => {
        if ((s.vices.drugs ?? 0) >= 2 && s.flags.paranoid === true) return 'bbq_cops_raid';
        if (s.suspicion >= 80) return 'bbq_karen_divorce';
        if (s.flags.crack_smoked === true) return 'bbq_rayray_arrives';
        if (s.flags.heroicFlag === true) return 'bbq_hero_moment';
        return 'bbq_normal_climax';
      },
    },
    // 6:45 PM — resolution. Always fires. Forces the game toward its ending.
    {
      at: 1125,
      id: 'resolution',
      pick: () => 'bbq_resolution',
    },
  ];
}
