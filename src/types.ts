// ============================================================
// CORE TYPES — shared across all systems
// ============================================================

/** The 9 vice categories */
export type ViceType =
  | 'alcohol' | 'drugs' | 'gambling' | 'prostitution'
  | 'guns' | 'pyramid' | 'racing' | 'theft' | 'digital';

/** Player state that persists across scenes */
export interface DadState {
  name: string;

  // Core meters (0–100)
  sobriety: number;
  suspicion: number;    // Wife's suspicion level
  energy: number;
  reputation: number;   // Neighborhood standing

  // Vice exposure tracking (0–3 depth per vice)
  vices: Record<ViceType, number>;
  activeEffects: ActiveEffect[];

  // Inventory
  inventory: string[];

  // Time — absolute minutes since midnight (420 = 7:00 AM, 1200 = 8:00 PM)
  currentTime: number;

  // Flags for branching — stores lawnStatus, grillStatus, cash, evidence, etc.
  flags: Record<string, boolean | number | string>;

  // Scene history
  visitedScenes: string[];

  // Current location ID (for force-home / force-BBQ checks)
  currentLocation: string;
}

/** Temporary effects from vices or items */
export interface ActiveEffect {
  id: string;
  type: ViceType | 'item';
  label: string;
  meterDeltas: Partial<Record<'sobriety' | 'suspicion' | 'energy' | 'reputation', number>>;
  durationMinutes: number;   // in game-time minutes
  startedAt: number;         // absolute minutes when effect started
}

// ============================================================
// SCENE DATA — loaded from JSON
// ============================================================

export interface SceneData {
  id: string;
  name: string;
  description: string;
  background: string;          // scene renderer key (kitchen, frontyard, etc.)
  music?: string;              // asset key for ambient audio
  hotspots: Hotspot[];
  enterDialogue?: string;      // dialogue tree ID to fire on enter
  conditions?: StateCondition[]; // conditions to even enter this scene
  /** Whether this is a "home" location (not forced-home from here) */
  isHome?: boolean;
}

export interface Hotspot {
  id: string;
  label: string;
  x: number;                   // percentage 0–100 of scene width
  y: number;                   // percentage 0–100 of scene height
  width: number;
  height: number;
  action: HotspotAction;
  conditions?: StateCondition[];
  visibleWhen?: StateCondition[];
}

export type HotspotAction =
  | { type: 'dialogue'; treeId: string }
  | { type: 'scene'; sceneId: string; timeCost?: number }
  | { type: 'minigame'; gameId: string }
  | { type: 'item'; itemId: string; dialogue?: string }
  | { type: 'inspect'; text: string }
  | {
      type: 'conditional_inspect';
      routes: Array<{ conditions: StateCondition[]; text: string }>;
      fallback: string;
    };

// ============================================================
// DIALOGUE DATA — loaded from JSON
// ============================================================

export interface DialogueTree {
  id: string;
  startNode: string;
  nodes: Record<string, DialogueNode>;
}

/** A single "panel" within a multi-beat dialogue node (comic-book style). */
export interface DialogueBeat {
  speaker?: string;
  text: string;
  /** Mouth style ('neutral'|'smile'|'grin'|'frown'|'shock'|'smirk'|'sleepy') */
  mouth?: string;
  /** Eye style ('normal'|'sleepy'|'shades'|'stoned'|'drunk'|'wide'|'angry') */
  eyes?: string;
  /** Eyebrow style ('none'|'neutral'|'raised'|'angry'|'worried') */
  eyebrows?: string;
  /** Per-beat effects — apply when this beat is shown */
  effects?: StateEffect[];
}

export interface DialogueNode {
  id: string;
  speaker?: string;           // character name or empty for narrator
  portrait?: string;          // asset key for speaker portrait
  text: string;
  choices?: DialogueChoice[];
  effects?: StateEffect[];    // applied when this node is displayed
  next?: string;              // auto-advance to this node (if no choices)
  exitScene?: string;         // transition to this scene after node

  /** Router: evaluate conditions on each route, jump to first match */
  routes?: Array<{
    conditions: StateCondition[];
    nextNode: string;
  }>;

  /** If present, the node is shown as a sequence of beats — one per advance(). */
  beats?: DialogueBeat[];

  /** Node-level expression overrides (forwarded to portrait renderer). */
  mouth?: string;
  eyes?: string;
  eyebrows?: string;
}

export interface DialogueChoice {
  text: string;
  nextNode: string;
  conditions?: StateCondition[];
  effects?: StateEffect[];    // applied when this choice is selected
  timeCost?: number;          // minutes consumed by this choice
}

// ============================================================
// MINI-GAME DATA — loaded from JSON
// ============================================================

export interface MiniGameConfig {
  id: string;
  type: 'timing' | 'balance' | 'stealth' | 'qte' | 'custom';
  name: string;
  description: string;
  difficulty: MiniGameDifficulty;
  rewards: StateEffect[];
  penalties: StateEffect[];
  /** State-based difficulty modifiers */
  modifiers?: {
    condition: StateCondition;
    difficultyDelta: Partial<MiniGameDifficulty>;
  }[];
}

export interface MiniGameDifficulty {
  speed: number;           // 0–1 base speed multiplier
  precision: number;       // 0–1 how tight the success window is
  duration: number;        // seconds
  wobble: number;          // 0–1 how much controls drift (affected by sobriety)
}

// ============================================================
// STATE CONDITIONS & EFFECTS — the glue
// ============================================================

export interface StateCondition {
  field: string;                            // dot-path into DadState, e.g. "sobriety" or "flags.lawnStatus"
  op: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'has' | '!has';
  value: number | string | boolean;
}

export interface StateEffect {
  type: 'set' | 'add' | 'flag' | 'addItem' | 'removeItem' | 'addEffect' | 'animate';
  field?: string;
  value?: number | string | boolean;
  effect?: Omit<ActiveEffect, 'startedAt'>;
}

// ============================================================
// ENDING DATA
// ============================================================

export interface EndingDefinition {
  id: string;
  title: string;
  description: string;
  grade: string;              // A+, B+, B, C+, C, D, F etc.
  conditions: StateCondition[];
  priority: number;           // higher = checked first
  epilogue: string;           // final narrative text
}
