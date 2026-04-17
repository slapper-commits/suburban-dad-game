import type { InteractionZoneConfig } from '../entities/InteractionZone';

export interface SceneZoneConfig {
  groundY: number;
  walkBounds: { minX: number; maxX: number };
  dadEntryX: number;          // default spawn x (center of scene)
  zones: InteractionZoneConfig[];
  edges?: {
    left?: { sceneId: string; timeCost?: number };
    right?: { sceneId: string; timeCost?: number };
  };
}

/**
 * Per-scene zone configurations.
 *
 * Replaces percentage-based hotspot coordinates with absolute world positions
 * for proximity-based interaction. Edge transitions let the player walk
 * between locations by reaching the screen edges.
 */
export const sceneZones: Record<string, SceneZoneConfig> = {
  kitchen: {
    groundY: 350,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 350,
    zones: [
      {
        id: 'fridge_note',
        label: 'Fridge Note',
        x: 720,
        action: {
          type: 'inspect',
          text: 'CHARCOAL (KINGSFORD!), BUNS, LAWN. PARTY AT 5. \u2665 \u2014K',
        },
      },
      {
        id: 'coffee',
        label: 'Coffee Maker',
        x: 100,
        radius: 35,
        action: {
          type: 'inspect',
          text: "Yesterday's pot. Still warm. You grab a swig. Tastes like regret and ambition.",
        },
      },
    ],
    edges: {
      left: { sceneId: 'frontyard', timeCost: 5 },
      right: { sceneId: 'garage', timeCost: 3 },
    },
  },

  frontyard: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 400,
    zones: [
      {
        id: 'frontyard_mow',
        label: 'Lawn Mower',
        x: 440,
        action: { type: 'minigame', gameId: 'mow' },
        visibleWhen: [{ field: 'flags.lawnStatus', op: '<', value: 100 }],
      },
      {
        id: 'car',
        label: 'Minivan',
        x: 287,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'house_door',
        label: 'Front Door',
        x: 105,
        action: { type: 'scene', sceneId: 'kitchen', timeCost: 3 },
      },
      {
        id: 'detached_garage',
        label: 'Garage',
        x: 660,
        radius: 50,
        action: { type: 'scene', sceneId: 'garage', timeCost: 2 },
      },
    ],
    edges: {
      left: { sceneId: 'backyard', timeCost: 5 },
      right: { sceneId: 'sidewalk', timeCost: 5 },
    },
  },

  garage: {
    groundY: 350,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 400,
    zones: [
      {
        id: 'workbench',
        label: 'Workbench',
        x: 100,
        radius: 60,
        action: { type: 'dialogue', treeId: 'garage_workbench' },
      },
      {
        id: 'mini_fridge',
        label: 'Mini Fridge',
        x: 715,
        action: { type: 'dialogue', treeId: 'garage_fridge' },
      },
      {
        id: 'garage_chair',
        label: 'Patio Chair',
        x: 620,
        radius: 30,
        action: { type: 'dialogue', treeId: 'garage_chair' },
      },
    ],
    edges: {
      left: { sceneId: 'backyard', timeCost: 5 },
      right: { sceneId: 'kitchen', timeCost: 3 },
    },
  },

  backyard: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 430,
    zones: [
      {
        id: 'backyard_grill',
        label: 'Grill',
        x: 370,
        action: { type: 'dialogue', treeId: 'backyard_grill' },
      },
      {
        id: 'patio_chair',
        label: 'Patio Chair',
        x: 530,
        action: { type: 'dialogue', treeId: 'backyard_sit' },
      },
    ],
    edges: {
      right: { sceneId: 'frontyard', timeCost: 5 },
    },
  },

  dougs: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 500,
    zones: [
      {
        id: 'doug_talk',
        label: 'Doug',
        x: 335,
        action: { type: 'dialogue', treeId: 'dougs_alcohol' },
      },
      {
        id: 'doug_poker',
        label: 'Poker Table',
        x: 560,
        radius: 40,
        action: { type: 'dialogue', treeId: 'dougs_poker' },
      },
      {
        id: 'cooler',
        label: 'Cooler',
        x: 355,
        radius: 30,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'sobriety', op: '<', value: 30 }],
              text: "The cooler swims in your vision. You've had enough. Even Doug's cooler is judging you now. The Natty Lights all look like triplets.",
            },
            {
              conditions: [{ field: 'vices.alcohol', op: '>=', value: 2 }],
              text: "Doug's cooler. You and this cooler have HISTORY now. It knows your secrets. The Natty Lights gleam with familiarity.",
            },
          ],
          fallback:
            "Doug's cooler. Natty Light tall boys, packed in ice. Classic Doug.",
        },
      },
    ],
    edges: {
      left: { sceneId: 'frontyard', timeCost: 10 },
    },
  },

  bbq: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 430,
    zones: [
      {
        id: 'bbq_mil',
        label: 'Mother-in-Law',
        x: 150,
        action: { type: 'dialogue', treeId: 'bbq_mil' },
      },
      {
        id: 'bbq_doug',
        label: 'Doug',
        x: 320,
        action: { type: 'dialogue', treeId: 'bbq_doug' },
      },
      {
        id: 'bbq_grill',
        label: 'Grill',
        x: 370,
        action: { type: 'dialogue', treeId: 'bbq_grill' },
      },
      {
        id: 'bbq_karen',
        label: 'Karen',
        x: 500,
        action: { type: 'dialogue', treeId: 'bbq_karen' },
      },
      {
        id: 'bbq_kevin',
        label: 'Kevin',
        x: 620,
        action: { type: 'dialogue', treeId: 'kevin_pitch' },
        visibleWhen: [{ field: 'vices.pyramid', op: '>=', value: 1 }],
      },
      {
        id: 'bbq_craig',
        label: 'Craig',
        x: 700,
        action: { type: 'dialogue', treeId: 'bbq_craig' },
        visibleWhen: [{ field: 'vices.guns', op: '>=', value: 1 }],
      },
      {
        id: 'bbq_neighbor',
        label: 'Neighbor',
        x: 80,
        action: { type: 'dialogue', treeId: 'bbq_neighbor' },
      },
    ],
  },

  // ── Phase 1 — New locations ───────────────────────────────

  sidewalk: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 400,
    zones: [
      {
        id: 'the_girls',
        label: 'The Girls',
        x: 480,
        action: { type: 'dialogue', treeId: 'sidewalk_drugs' },
        visibleWhen: [{ field: 'currentTime', op: '>=', value: 570 }],
      },
      {
        id: 'craigs_house',
        label: "Craig's Place",
        x: 200,
        radius: 35,
        action: { type: 'scene', sceneId: 'craigs', timeCost: 5 },
      },
      {
        id: 'kevins_house',
        label: "Kevin's Place",
        x: 350,
        radius: 35,
        action: { type: 'scene', sceneId: 'kevins', timeCost: 5 },
      },
      {
        id: 'kids_house',
        label: "Kid's Porch",
        x: 550,
        radius: 35,
        action: { type: 'scene', sceneId: 'kids_porch', timeCost: 5 },
      },
    ],
    edges: {
      left: { sceneId: 'frontyard', timeCost: 5 },
      right: { sceneId: 'quikstop', timeCost: 10 },
    },
  },

  craigs: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 600,
    zones: [
      {
        id: 'craig_talk',
        label: 'Craig',
        x: 280,
        action: { type: 'dialogue', treeId: 'craigs_guns' },
        visibleWhen: [{ field: 'currentTime', op: '>=', value: 690 }],
      },
      {
        id: 'craig_boxes',
        label: 'Boxes',
        x: 310,
        radius: 30,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'vices.guns', op: '>=', value: 1 }],
              text: "You know what's in them now. The word 'AUTO PARTS' feels like a threat. You carried these. Your back remembers.",
            },
          ],
          fallback:
            "Heavy cardboard boxes. 'AUTO PARTS' written in Sharpie. The handwriting is... aggressive.",
        },
      },
    ],
    edges: {
      left: { sceneId: 'sidewalk', timeCost: 5 },
    },
  },

  kevins: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 600,
    zones: [
      {
        id: 'kevin_talk',
        label: 'Kevin',
        x: 370,
        action: { type: 'dialogue', treeId: 'kevins_pyramid' },
      },
      {
        id: 'whiteboard',
        label: 'Whiteboard',
        x: 350,
        radius: 30,
        action: {
          type: 'inspect',
          text: "A whiteboard covered in arrows. All arrows point up. 'YOU' is written at the bottom of a triangle. This is a pyramid.",
        },
      },
      {
        id: 'kevin_upline',
        label: 'Meet the Upline',
        x: 540,
        radius: 40,
        action: { type: 'dialogue', treeId: 'kevins_pyramid_t2' },
        visibleWhen: [{ field: 'vices.pyramid', op: '>=', value: 1 }],
      },
    ],
    edges: {
      left: { sceneId: 'sidewalk', timeCost: 5 },
    },
  },

  kids_porch: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 600,
    zones: [
      {
        id: 'kid_talk',
        label: 'The Kid',
        x: 340,
        action: { type: 'dialogue', treeId: 'kids_digital' },
        visibleWhen: [{ field: 'currentTime', op: '>=', value: 720 }],
      },
      {
        id: 'energy_cans',
        label: 'Energy Drinks',
        x: 400,
        radius: 30,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'vices.drugs', op: '>=', value: 1 }],
              text: "You eye the energy drink cans differently now. Everything is a delivery mechanism. The line between 'dad fuel' and 'illegal substance' is blurrier than you thought.",
            },
          ],
          fallback:
            "Six empty energy drink cans. Four different brands. It's 7 AM. This kid is operating on another plane of existence.",
        },
      },
      {
        id: 'kid_big_hack',
        label: 'The Big One',
        x: 500,
        radius: 40,
        action: { type: 'dialogue', treeId: 'kids_digital_t2' },
        visibleWhen: [
          { field: 'vices.digital', op: '>=', value: 1 },
          { field: 'currentTime', op: '>=', value: 780 },
        ],
      },
    ],
    edges: {
      left: { sceneId: 'sidewalk', timeCost: 5 },
    },
  },

  quikstop: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 200,
    zones: [
      {
        id: 'minivan_quikstop',
        label: 'Minivan',
        x: 60,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'store',
        label: 'Store',
        x: 290,
        action: { type: 'dialogue', treeId: 'quikstop_buy' },
      },
      {
        id: 'dumpster',
        label: 'Dumpster',
        x: 725,
        action: { type: 'dialogue', treeId: 'quikstop_theft' },
      },
      {
        id: 'quikstop_teen_talk',
        label: 'Vaping Teen',
        x: 470,
        radius: 40,
        action: { type: 'dialogue', treeId: 'quikstop_teen' },
      },
      {
        id: 'quikstop_kevin',
        label: 'Kevin',
        x: 560,
        action: { type: 'dialogue', treeId: 'kevin_pitch' },
        visibleWhen: [{ field: 'vices.pyramid', op: '>=', value: 1 }],
      },
    ],
    edges: {
      left: { sceneId: 'sidewalk', timeCost: 10 },
      right: { sceneId: 'gas_station', timeCost: 5 },
    },
  },

  gas_station: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 200,
    zones: [
      {
        id: 'minivan_gas',
        label: 'Minivan',
        x: 250,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'modded_car',
        label: 'Modded Car',
        x: 600,
        action: { type: 'dialogue', treeId: 'gas_racing' },
      },
      {
        id: 'gas_pump',
        label: 'Gas Pump',
        x: 370,
        radius: 30,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'flags.cash', op: '<', value: 20 }],
              text: "$4.89 a gallon. You can't afford a gallon. How did this happen? You used to HAVE money. Where did it all go? (You know where it went.)",
            },
            {
              conditions: [{ field: 'sobriety', op: '<', value: 40 }],
              text: 'The numbers on the pump swim. Is it $4.89 or $48.90? Both feel like a scam.',
            },
          ],
          fallback:
            "$4.89 a gallon. You don't need gas. You just like reading the price and feeling outraged. It's a suburban dad thing.",
        },
      },
      {
        id: 'phone_booth',
        label: 'Sharon (phone booth)',
        x: 500,
        radius: 45,
        action: { type: 'dialogue', treeId: 'gas_prostitution' },
        visibleWhen: [{ field: 'currentTime', op: '>=', value: 600 }],
      },
      {
        id: 'gas_store',
        label: 'Store',
        x: 155,
        radius: 40,
        action: { type: 'scene', sceneId: 'gas_station_store', timeCost: 1 },
      },
      {
        id: 'gas_kevin',
        label: 'Kevin',
        x: 200,
        action: { type: 'dialogue', treeId: 'kevin_pitch' },
        visibleWhen: [{ field: 'vices.pyramid', op: '>=', value: 1 }],
      },
    ],
    edges: {
      left: { sceneId: 'quikstop', timeCost: 5 },
      right: { sceneId: 'motel_exterior', timeCost: 5 },
    },
  },

  // ── Phase 2 — New locations ───────────────────────────────

  strip_mall: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 400,
    zones: [
      {
        id: 'minivan_strip',
        label: 'Minivan',
        x: 75,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'alley',
        label: 'Alley',
        x: 710,
        radius: 35,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'vices.drugs', op: '>=', value: 1 }],
              text: "You could cut through the back alley... but the real party is at the Girls' apartment. They aren't out here today.",
            },
          ],
          fallback:
            "Empty alley. A dumpster, a humming vent, a pigeon with terrible opinions. Nobody's here.",
        },
      },
      {
        id: 'karate_dojo',
        label: 'Karate Dojo',
        x: 455,
        radius: 35,
        action: {
          type: 'inspect',
          text: 'A strip mall karate dojo. The sensei is 19.',
        },
      },
      {
        id: 'pawn_shop',
        label: 'Pawn Shop',
        x: 270,
        radius: 40,
        action: { type: 'dialogue', treeId: 'pawn_shop' },
      },
      {
        id: 'club_entrance',
        label: 'Club Purrrple',
        x: 620,
        radius: 40,
        action: { type: 'dialogue', treeId: 'strip_club_enter' },
        visibleWhen: [{ field: 'currentTime', op: '>=', value: 540 }],
      },
    ],
    edges: {
      left: { sceneId: 'motel_exterior', timeCost: 10 },
      right: { sceneId: 'sketchy', timeCost: 10 },
    },
  },

  strip_club: {
    groundY: 340,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 100,
    zones: [
      {
        id: 'bar',
        label: 'Bartender',
        x: 150,
        radius: 40,
        action: { type: 'dialogue', treeId: 'strip_club_bartender' },
      },
      {
        id: 'tony',
        label: 'Tony',
        x: 250,
        radius: 40,
        action: { type: 'dialogue', treeId: 'strip_club_tony' },
      },
      {
        id: 'amber_stage',
        label: 'Amber (stage)',
        x: 400,
        radius: 50,
        action: { type: 'dialogue', treeId: 'strip_club_dancer' },
      },
      {
        id: 'vip_curtain',
        label: 'VIP Back Room',
        x: 660,
        radius: 40,
        action: { type: 'scene', sceneId: 'strip_club_vip', timeCost: 5 },
      },
      {
        id: 'exit',
        label: 'Exit',
        x: 80,
        radius: 30,
        action: { type: 'scene', sceneId: 'strip_mall', timeCost: 5 },
      },
    ],
  },

  strip_club_vip: {
    groundY: 340,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 200,
    zones: [
      {
        id: 'amber_vip',
        label: 'Amber',
        x: 400,
        radius: 60,
        action: { type: 'dialogue', treeId: 'strip_club_vip' },
      },
    ],
  },

  girls_apartment: {
    groundY: 340,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 200,
    zones: [
      {
        id: 'girls_couch',
        label: 'The Girls',
        x: 380,
        radius: 60,
        action: { type: 'dialogue', treeId: 'girls_apartment_hub' },
      },
      {
        id: 'exit',
        label: 'Exit',
        x: 80,
        radius: 30,
        action: { type: 'scene', sceneId: 'sidewalk', timeCost: 5 },
      },
    ],
  },

  motel_room: {
    groundY: 340,
    walkBounds: { minX: 50, maxX: 750 },
    dadEntryX: 200,
    zones: [
      {
        id: 'motel_bed',
        label: 'Sharon (bed)',
        x: 460,
        radius: 60,
        action: { type: 'dialogue', treeId: 'motel_encounter' },
      },
      {
        id: 'motel_exit',
        label: 'Leave',
        x: 70,
        radius: 30,
        action: { type: 'scene', sceneId: 'gas_station', timeCost: 5 },
      },
    ],
  },

  trap_house: {
    groundY: 340,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 200,
    zones: [
      {
        id: 'dealer',
        label: 'Dealer',
        x: 150,
        radius: 45,
        action: { type: 'dialogue', treeId: 'trap_dealer' },
      },
      {
        id: 'jim',
        label: 'Jim',
        x: 300,
        radius: 30,
        action: { type: 'dialogue', treeId: 'trap_jim' },
      },
      {
        id: 'trina',
        label: 'Trina',
        x: 520,
        radius: 40,
        action: { type: 'dialogue', treeId: 'trap_trina' },
      },
      {
        id: 'rayray',
        label: 'RayRay',
        x: 650,
        radius: 40,
        action: { type: 'dialogue', treeId: 'trap_rayray' },
      },
      {
        id: 'exit',
        label: 'Exit',
        x: 80,
        radius: 30,
        action: { type: 'scene', sceneId: 'sidewalk', timeCost: 10 },
      },
    ],
  },

  sketchy: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 400,
    zones: [
      {
        id: 'minivan_sketchy',
        label: 'Minivan',
        x: 75,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'fence_guy',
        label: 'Fence Guy',
        x: 300,
        action: { type: 'dialogue', treeId: 'quikstop_theft_t2' },
      },
      {
        id: 'warehouse',
        label: 'Warehouse',
        x: 580,
        action: { type: 'dialogue', treeId: 'craigs_guns_t2' },
        visibleWhen: [{ field: 'vices.guns', op: '>=', value: 2 }],
      },
    ],
    edges: {
      left: { sceneId: 'strip_mall', timeCost: 10 },
    },
  },

  gas_station_store: {
    groundY: 350,
    walkBounds: { minX: 80, maxX: 720 },
    dadEntryX: 150,
    zones: [
      {
        id: 'store_clerk',
        label: 'Clerk',
        x: 500,
        radius: 50,
        action: { type: 'dialogue', treeId: 'gas_station_store' },
      },
      {
        id: 'store_beer_cooler',
        label: 'Beer Cooler',
        x: 650,
        radius: 35,
        action: {
          type: 'conditional_inspect',
          routes: [
            {
              conditions: [{ field: 'flags.has30Rack', op: '==', value: true }],
              text: "The beer cooler hums. You already grabbed a 30-rack. The cooler knows. The cooler understands.",
            },
          ],
          fallback:
            "Glass door cooler. Behind it: every bad decision you've ever made, stacked in cardboard cases, lit from behind like a shrine.",
        },
      },
      {
        id: 'store_snacks',
        label: 'Snacks',
        x: 330,
        radius: 35,
        action: {
          type: 'inspect',
          text: 'Rotating taquitos of unknown provenance. Beef jerky from a brand you\u2019ve never heard of. A single sad banana.',
        },
      },
      {
        id: 'store_exit',
        label: 'Exit',
        x: 100,
        radius: 40,
        action: { type: 'scene', sceneId: 'gas_station', timeCost: 1 },
      },
    ],
    edges: {
      right: { sceneId: 'strip_mall', timeCost: 5 },
    },
  },

  motel_exterior: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 80,
    zones: [
      {
        id: 'motel_sharon',
        label: 'Sharon',
        x: 520,
        radius: 50,
        action: { type: 'dialogue', treeId: 'sharon_motel_meet' },
      },
      {
        id: 'taco_cart',
        label: 'Taco Cart',
        x: 300,
        radius: 45,
        action: { type: 'dialogue', treeId: 'taco_cart' },
      },
      {
        id: 'motel_door_12',
        label: 'Room 12',
        x: 660,
        radius: 40,
        action: { type: 'scene', sceneId: 'motel_room', timeCost: 2 },
        visibleWhen: [{ field: 'flags.sharon_invited_in', op: '==', value: true }],
      },
    ],
    edges: {
      left: { sceneId: 'gas_station', timeCost: 5 },
      right: { sceneId: 'strip_mall', timeCost: 10 },
    },
  },

  teen_alley: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 200,
    zones: [
      {
        id: 'teen_alley_teen',
        label: 'The Teen',
        x: 500,
        radius: 50,
        action: { type: 'dialogue', treeId: 'teen_alley_smoke' },
      },
    ],
  },

  highway: {
    groundY: 337,
    walkBounds: { minX: 30, maxX: 770 },
    dadEntryX: 280,
    zones: [
      {
        id: 'minivan_highway',
        label: 'Minivan',
        x: 290,
        radius: 35,
        action: { type: 'dialogue', treeId: 'frontyard_drive' },
      },
      {
        id: 'road',
        label: 'Road',
        x: 550,
        action: { type: 'dialogue', treeId: 'gas_racing_t2' },
      },
      {
        id: 'mountain_view',
        label: 'Mountain View',
        x: 120,
        radius: 40,
        action: { type: 'dialogue', treeId: 'mountain_view' },
      },
    ],
    edges: {
      left: { sceneId: 'gas_station', timeCost: 10 },
    },
  },
};
