# Suburban Dad: Secret Saturday

A branching narrative RPG with mini-games. It's 10 AM on a Saturday. The neighborhood BBQ starts at 8 PM. What could possibly go wrong?

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Architecture

```
src/
├── main.ts                  # Phaser game config + bootstrap
├── types.ts                 # Shared type definitions
├── GameRegistry.ts          # Singleton access to all game systems
│
├── systems/                 # Reusable game logic modules
│   ├── TimeClock.ts         # 10am → 8pm game clock
│   ├── PlayerState.ts       # Meters, vices, inventory, flags
│   ├── DialogueEngine.ts    # Branching conversation driver
│   └── EndingResolver.ts    # Evaluates 12 endings at 8pm
│
├── scenes/                  # Phaser scenes
│   ├── BootScene.ts         # Title screen + asset preload
│   ├── GameScene.ts         # Main gameplay (locations, HUD, dialogue)
│   └── EndingScene.ts       # 8pm finale + ending display
│
├── minigames/               # Skill-check mini-games
│   ├── MiniGameBase.ts      # Abstract base class
│   └── GrillGame.ts         # Burger flipping (timing + wobble)
│
├── ui/                      # UI components (meters, panels, menus)
│
└── data/                    # All content is data-driven JSON
    ├── scenes/              # Location definitions
    │   └── garage.json
    ├── dialogues/           # Dialogue tree definitions
    │   └── garage_fridge.json
    ├── minigames/           # Mini-game configs
    │   └── grill_burgers.json
    └── endings.json         # All 12 endings with conditions
```

## How It Works

### Everything is a module
Each system (TimeClock, PlayerState, DialogueEngine) is a standalone TypeScript class. They communicate through events and shared state via GameRegistry.

### All content is JSON
Scenes, dialogues, mini-games, and endings are defined in JSON files. To add a new location, create a JSON file in `src/data/scenes/` and register it in GameScene. No code changes needed for content.

### State drives everything
The player's `DadState` object holds all meters (sobriety, suspicion, energy, reputation), vice exposure, inventory, and flags. Dialogue choices and actions modify this state. Conditions on hotspots, choices, and endings read from it.

### Mini-games adapt to state
All mini-games extend `MiniGameBase`. The base class automatically applies a wobble factor based on sobriety — the drunker you are, the harder every mini-game gets.

## Adding Content

### New location
1. Create `src/data/scenes/my_location.json` (copy garage.json as template)
2. Import it in `GameScene.ts` and add to `sceneDataMap`

### New dialogue
1. Create `src/data/dialogues/my_dialogue.json`
2. Import in `GameScene.ts` and add to `dialogueMap`
3. Reference the tree ID from a scene hotspot

### New mini-game
1. Create a class extending `MiniGameBase` in `src/minigames/`
2. Create a config JSON in `src/data/minigames/`
3. Register the scene in `main.ts`

### New ending
Add an entry to `src/data/endings.json`. Higher priority = checked first.

## Build Targets

| Target | Command | Wrapper |
|--------|---------|---------|
| Web (dev) | `npm run dev` | Vite dev server |
| Web (prod) | `npm run build` | Static HTML in `dist/` |
| Steam | `npm run build:steam` | Electron (TBD) |
| iOS/Android | TBD | Capacitor |

## Tech Stack

- **Phaser 3** — game engine (rendering, input, physics, audio, scenes)
- **TypeScript** — type safety across all systems
- **Vite** — instant HMR dev server + optimized builds
- **Electron** (planned) — Steam desktop wrapper
- **Capacitor** (planned) — iOS/Android wrapper
