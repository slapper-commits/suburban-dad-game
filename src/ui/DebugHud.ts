import Phaser from 'phaser';
import type { PlayerState } from '../systems/PlayerState';
import type { TimeClock } from '../systems/TimeClock';
import type { DialogueEngine } from '../systems/DialogueEngine';
import type { InteractionZone } from '../entities/InteractionZone';

/**
 * DebugHud — F9-toggleable overlay showing live game state.
 *
 * Draws a semi-transparent panel in the top-right with:
 *   - currentLocation + time
 *   - sobriety / suspicion / energy / reputation / cash
 *   - all vice depths
 *   - every truthy flag
 *   - active dialogue node + beat index
 *   - zones currently in range
 *
 * Updates every frame while visible. Invisible by default; a tiny `[F9]`
 * hint is always visible in the bottom-right corner so the player knows.
 */
export class DebugHud {
  private scene: Phaser.Scene;
  private panel!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.build();
  }

  private build(): void {
    const DEPTH = 1000;
    const W = 320;
    const H = 260;
    // Panel (top-right, anchored)
    this.panel = this.scene.add
      .rectangle(800 - 8, 8, W, H, 0x000000, 0.82)
      .setOrigin(1, 0)
      .setStrokeStyle(1, 0x66ff88, 0.6)
      .setDepth(DEPTH)
      .setVisible(false);
    this.text = this.scene.add
      .text(800 - 8 - W + 8, 16, '', {
        fontSize: '10px',
        color: '#c8ffc8',
        fontFamily: 'monospace',
      })
      .setOrigin(0, 0)
      .setDepth(DEPTH + 1)
      .setVisible(false);

    // Persistent hint in bottom-right so user knows F9 exists
    this.hint = this.scene.add
      .text(800 - 6, 450 - 6, '[F9 debug]', {
        fontSize: '9px',
        color: '#444',
        fontFamily: 'monospace',
      })
      .setOrigin(1, 1)
      .setDepth(DEPTH - 1);
  }

  toggle(): void {
    this.visible = !this.visible;
    this.panel.setVisible(this.visible);
    this.text.setVisible(this.visible);
  }

  update(
    playerState: PlayerState,
    clock: TimeClock,
    dialogueEngine: DialogueEngine,
    zones: InteractionZone[],
    playerX: number,
  ): void {
    if (!this.visible) return;
    const st = playerState.state;

    const truthyFlags = Object.entries(st.flags)
      .filter(([, v]) => v === true || (typeof v === 'number' && v > 0) || (typeof v === 'string' && v.length > 0 && v !== 'not_started'))
      .map(([k, v]) => `${k}=${v}`);

    const vices = Object.entries(st.vices)
      .filter(([, n]) => (n as number) > 0)
      .map(([k, n]) => `${k}:${n}`)
      .join(' ') || '(none)';

    const inRange = zones
      .filter((z) => z.inRange)
      .map((z) => z.config.id)
      .join(', ') || '(none)';

    const dActive = dialogueEngine.isActive;
    // Access private-ish state via bracket notation (debug only)
    const dNode = dActive ? ((dialogueEngine as any).currentNode?.id ?? '?') : '—';
    const dBeat = dActive ? ((dialogueEngine as any).currentBeatIndex ?? 0) : '—';

    const lines = [
      `LOC: ${st.currentLocation}    TIME: ${clock.displayTime}`,
      `SOB:${Math.round(st.sobriety).toString().padStart(3)}  SUS:${Math.round(st.suspicion).toString().padStart(3)}  EN:${Math.round(st.energy).toString().padStart(3)}  REP:${Math.round(st.reputation).toString().padStart(3)}`,
      `CASH:$${st.flags.cash ?? 0}   LAWN:${st.flags.lawnStatus ?? 0}   GRILL:${st.flags.grillStatus ?? 'none'}`,
      '',
      `VICES: ${vices}`,
      '',
      `FLAGS:`,
      ...wrapLines(truthyFlags.join(', ') || '(none)', 48),
      '',
      `DIALOGUE: active=${dActive}  node=${dNode}  beat=${dBeat}`,
      `PLAYER_X: ${Math.round(playerX)}`,
      `ZONES IN RANGE: ${inRange}`,
    ];
    this.text.setText(lines.join('\n'));
  }
}

function wrapLines(s: string, width: number): string[] {
  if (s.length <= width) return ['  ' + s];
  const out: string[] = [];
  let line = '';
  for (const word of s.split(', ')) {
    if ((line + word).length > width) {
      out.push('  ' + line);
      line = word;
    } else {
      line = line ? line + ', ' + word : word;
    }
  }
  if (line) out.push('  ' + line);
  return out;
}
