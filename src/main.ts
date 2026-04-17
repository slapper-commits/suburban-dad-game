import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { EndingScene } from './scenes/EndingScene';
import { GrillGame } from './minigames/GrillGame';
import { MowGame } from './minigames/MowGame';
import { DrivingGame } from './minigames/DrivingGame';
import { HaggleGame } from './minigames/HaggleGame';

/**
 * Suburban Dad: Secret Saturday
 *
 * A branching narrative RPG about a suburban dad's secret Saturday.
 * It's 10 AM. The BBQ starts at 8 PM. What could possibly go wrong?
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 450,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    GameScene,
    EndingScene,
    GrillGame,
    MowGame,
    DrivingGame,
    HaggleGame,
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 2, // Support touch
  },
};

const game = new Phaser.Game(config);
(window as any).__PHASER_GAME__ = game;

// ── Debug console harness (dev aid) ─────────────────────────
// Type `dev.help()` in the browser console for available commands.
(window as any).dev = {
  help(): void {
    console.log(`
Debug commands:
  dev.jumpTo("sceneId")           Teleport to any scene (kitchen, frontyard, garage,
                                  backyard, dougs, bbq, sidewalk, craigs, kevins,
                                  kids_porch, quikstop, gas_station, gas_station_store,
                                  strip_mall, sketchy, highway, strip_club, strip_club_vip,
                                  girls_apartment, trap_house)
  dev.setFlag("name", value)      Set any state flag
  dev.setCash(n)                  Set cash directly
  dev.setTime(min)                Set current game time (e.g. 1020 = 5pm BBQ)
  dev.setSobriety(n)              Set sobriety (0-100)
  dev.setSuspicion(n)             Set suspicion (0-100)
  dev.setVice("name", n)          Set vice depth (alcohol, drugs, gambling, prostitution,
                                  guns, pyramid, racing, theft, digital)
  dev.grantStripper()             Give all strip club flags (amber_confidante etc.)
  dev.grantTrap()                 Give all trap house flags (crack_smoked, rayray_invited)
  dev.triggerBBQ()                Skip straight to 5pm BBQ
  dev.triggerEnding()             Force game over
  dev.state()                     Dump current state
`);
  },
  _scene(): any {
    const g = (window as any).__PHASER_GAME__;
    return g.scene.scenes.find((s: any) => s.scene.key === 'GameScene');
  },
  jumpTo(sceneId: string): void {
    const s = this._scene();
    if (!s?.reg) return console.warn('GameScene not ready');
    s.reg.dialogueEngine.end();
    s.loadLocation(sceneId);
  },
  setFlag(name: string, value: any): void {
    const s = this._scene();
    s.reg.playerState.state.flags[name] = value;
  },
  setCash(n: number): void { this.setFlag('cash', n); },
  setTime(min: number): void {
    const s = this._scene();
    s.reg.playerState.state.currentTime = min;
  },
  setSobriety(n: number): void {
    this._scene().reg.playerState.state.sobriety = n;
  },
  setSuspicion(n: number): void {
    this._scene().reg.playerState.state.suspicion = n;
  },
  setVice(name: string, n: number): void {
    this._scene().reg.playerState.state.vices[name] = n;
  },
  grantStripper(): void {
    const f = this._scene().reg.playerState.state.flags;
    f.stripper_visited = true;
    f.amber_met = true;
    f.amber_confidante = true;
    f.lipstick = true;
    f.perfume = true;
  },
  grantTrap(): void {
    const f = this._scene().reg.playerState.state.flags;
    f.trap_visited = true;
    f.crack_smoked = true;
    f.paranoid = true;
    f.rayray_met = true;
    f.rayray_invited = true;
    f.smell = true;
    f.dilated_pupils = true;
  },
  triggerBBQ(): void {
    this.setTime(1020);
    this.jumpTo('bbq');
  },
  triggerEnding(): void {
    this._scene().reg.timeClock.advance(9999);
  },
  state(): any {
    const st = this._scene().reg.playerState.state;
    console.table({
      time: st.currentTime,
      loc: st.currentLocation,
      sobriety: st.sobriety,
      suspicion: st.suspicion,
      cash: st.flags.cash,
    });
    console.log('flags:', st.flags);
    console.log('vices:', st.vices);
    return st;
  },
};

// Hot module replacement for dev
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game.destroy(true);
  });
}
