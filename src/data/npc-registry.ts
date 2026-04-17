import type { CharacterConfig } from '../rendering/CharacterRenderer';

/**
 * NPC Registry — single source of truth for every NPC's visual identity.
 *
 * Every recurring character is defined once here and referenced by ID everywhere.
 * Colors and accessories from SATURDAY_GAME_SPEC.md section 2.3.
 */
export const npcRegistry: Record<string, Partial<CharacterConfig>> = {
  // ── Home & Family ─────────────────────────────────────────
  dad: {
    shirt: 0x4a90d9,    // blue polo
    skin: 0xf0c89a,
    hair: 0x6b4c2a,     // brown
    pants: 0x4a5568,    // khakis
  },
  karen: {
    shirt: 0xcc6688,    // pink-red
    skin: 0xf0c89a,
    hair: 0x8b4513,     // auburn
    pants: 0x6a5a7a,
    item: 'phone',
    mouth: 'frown',
    sz: 0.9,
  },
  brenda: {
    skin: 0xf0c89a,
    hair: 0xc4783c,     // red
    shirt: 0xcc6688,
    mouth: 'frown',
    sz: 0.9,
  },
  mil: {
    shirt: 0x6a5a6a,    // purplish
    skin: 0xf0c89a,
    hair: 0xcccccc,     // gray
    pants: 0x5a5a5a,
    item: 'purse',
    mouth: 'frown',
    sz: 0.9,
  },

  // ── Neighbors ─────────────────────────────────────────────
  doug: {
    shirt: 0x5a8a5a,    // green
    skin: 0xf0c89a,
    hair: 0x8b6914,     // dirty blonde
    pants: 0x555555,
    eyes: 'shades',
    beer: true,
    mouth: 'smile',
  },
  craig: {
    shirt: 0x2d2d2d,    // black tee
    skin: 0xd4a878,
    hair: 0x333333,
    hairStyle: 'buzzcut',
    pants: 0x3d3d3d,
    mouth: 'neutral',
    eyebrows: 'angry',
  },
  kevin: {
    shirt: 0x22aa55,    // bright green (ELEVATÉ)
    skin: 0xf0c89a,
    hair: 0xd4a020,     // blonde
    pants: 0x3a3a5a,
    item: 'brochure',
    mouth: 'grin',
    eyebrows: 'raised',
  },

  // ── Vice NPCs ─────────────────────────────────────────────
  // Tamika from Tampa — the porch lady. Runs a lucrative side operation
  // from her porch. Florida to the bone. Curvy on purpose.
  the_kid: {
    shirt: 0xff6b9d,    // hot pink top
    skin: 0x6a3a1a,     // deep brown
    hair: 0x1a1a1a,     // black braids
    pants: 0xf5d4a0,    // cream linen shorts
    item: 'laptop',
    mouth: 'smirk',
    eyes: 'shades',
    eyebrows: 'raised',
    bodyType: 'female',
    curvy: true,
  },
  the_girls: {
    shirt: 0x9b6b9b,    // purple
    skin: 0xc89878,
    hair: 0x333333,
    pants: 0x444444,
    mouth: 'smile',
  },
  quikstop_teen: {
    shirt: 0x222222,
    skin: 0xd4a878,
    hair: 0x222222,
    pants: 0x111111,
    item: 'vape',
    mouth: 'smirk',
  },
  modded_car_guy: {
    shirt: 0xe08030,    // orange
    skin: 0xd4a878,
    hair: 0x333333,
    pants: 0x2d2d2d,
    eyes: 'shades',
    mouth: 'smirk',
  },
  chess_old1: {
    shirt: 0x5a6a4a,
    skin: 0xd4a878,
    hair: 0xcccccc,
    pants: 0x555555,
    mouth: 'neutral',
  },
  chess_old2: {
    shirt: 0x6a5a4a,
    skin: 0xe8b888,
    hair: 0xdddddd,
    pants: 0x444444,
    mouth: 'smirk',
  },
  tracksuit_guy: {
    shirt: 0x3a3a3a,    // dark tracksuit jacket
    skin: 0xd4a878,
    hair: 0x222222,
    pants: 0x2a2a2a,
    mouth: 'smirk',
    eyebrows: 'angry',
  },
  warehouse_guy: {
    shirt: 0x4a4a4a,    // industrial gray
    skin: 0xc89878,
    hair: 0x2a2a2a,
    hairStyle: 'buzzcut',
    pants: 0x333333,
    mouth: 'neutral',
    eyebrows: 'angry',
    eyes: 'shades',
  },
  sharon: {
    shirt: 0xcc5588,    // pink top
    skin: 0xe8b888,
    hair: 0xd4a020,     // bleached blonde
    pants: 0x222222,    // leather
    mouth: 'smile',
    item: 'purse',
    sz: 0.95,
  },
  fence_guy: {
    shirt: 0x5a4a3a,    // olive bomber
    skin: 0xd4a878,
    hair: 0x333333,
    pants: 0x2d2d2d,
    mouth: 'smirk',
    eyebrows: 'raised',
  },
  clerk: {
    shirt: 0x2a5aa0,    // blue polo work shirt
    skin: 0xe8c898,
    hair: 0x6b4c2a,
    hairStyle: 'buzzcut',
    pants: 0x3a3a3a,
    mouth: 'sleepy',
    eyebrows: 'neutral',
    sz: 1.0,
  },
  crackhead_guy: {
    shirt: 0x887766,    // beat up shirt
    skin: 0xcca888,
    hair: 0x554433,
    hairStyle: 'messy',
    pants: 0x3a3a3a,
    mouth: 'neutral',
    eyes: 'wide',
    eyebrows: 'worried',
    sz: 0.95,
  },

  // ── Strip Club ────────────────────────────────────────────
  bouncer: {
    shirt: 0x111111,
    skin: 0xc89878,
    hair: 0x222222,
    hairStyle: 'buzzcut',
    pants: 0x222222,
    eyes: 'shades',
    eyebrows: 'angry',
    mouth: 'neutral',
    sz: 1.15,
  },
  bartender_club: {
    shirt: 0x222222,
    skin: 0xe8c8a8,
    hair: 0x3a2a2a,
    pants: 0x111111,
    mouth: 'smirk',
    eyebrows: 'raised',
    bodyType: 'female',
    sz: 0.95,
  },
  amber: {
    shirt: 0xcc3366,    // hot pink
    skin: 0xe8c8a8,
    hair: 0xffaa55,    // strawberry blonde
    pants: 0x2a2a3a,
    eyes: 'sultry',
    mouth: 'pouty',
    bodyType: 'female',
    sz: 0.95,
  },
  candi: {
    shirt: 0x8a2a8a,
    skin: 0xc89878,
    hair: 0x111111,
    pants: 0x1a1a1a,
    eyes: 'lidded',
    mouth: 'smirk',
    bodyType: 'female',
    sz: 0.95,
  },
  destiny: {
    shirt: 0x2a88cc,
    skin: 0xe8c8a8,
    hair: 0xdd3333,
    pants: 0x222244,
    eyes: 'sultry',
    mouth: 'smile',
    bodyType: 'female',
    sz: 0.95,
  },
  tony: {
    shirt: 0x3a1a1a,      // dark leather jacket
    skin: 0xd4a878,
    hair: 0x111111,
    hairStyle: 'normal',
    pants: 0x1a1a1a,
    eyes: 'shades',
    mouth: 'smirk',
    eyebrows: 'raised',
  },

  // ── Trap House ────────────────────────────────────────────
  dealer: {
    shirt: 0x111111,
    skin: 0xd4a878,
    hair: 0x222222,
    pants: 0x1a1a1a,
    eyes: 'shades',
    eyebrows: 'angry',
    mouth: 'neutral',
    item: 'gun',
  },
  crackhead_jim: {
    shirt: 0x6a5a4a,
    skin: 0xc8a878,
    hair: 0x3a2a1a,
    hairStyle: 'messy',
    pants: 0x2a2a2a,
    eyes: 'vacant',
    mouth: 'blank',
    eyebrows: 'none',
    sz: 0.95,
  },
  tweaker_rayray: {
    shirt: 0x44aa44,    // neon green windbreaker
    skin: 0xd4a878,
    hair: 0x222222,
    hairStyle: 'messy',
    pants: 0x554422,
    eyes: 'wide',
    mouth: 'grin',
    eyebrows: 'raised',
    item: 'vape',
    sz: 0.95,
  },
  trina: {
    shirt: 0xa06688,
    skin: 0xe8c8a8,
    hair: 0x222222,
    hairStyle: 'long',
    pants: 0x3a2a4a,
    eyes: 'sleepy',
    mouth: 'neutral',
    bodyType: 'female',
    sz: 0.9,
  },
};

/**
 * Get an NPC's visual config with optional overrides.
 * Usage: drawCharacter(gfx, { x: 300, y: GROUND_Y, ...getNpcConfig('doug') })
 */
export function getNpcConfig(
  id: string,
  overrides?: Partial<CharacterConfig>,
): Partial<CharacterConfig> {
  const base = npcRegistry[id] ?? {};
  return overrides ? { ...base, ...overrides } : base;
}
