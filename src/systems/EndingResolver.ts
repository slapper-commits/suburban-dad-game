import type { EndingDefinition } from '../types';
import type { PlayerState } from './PlayerState';

/**
 * EndingResolver — at 8pm, evaluates conditions across all 12 endings
 * and returns the best match based on priority.
 */
export class EndingResolver {
  private endings: EndingDefinition[] = [];

  loadEndings(endings: EndingDefinition[]): void {
    // Sort by priority descending so we check specific endings first
    this.endings = [...endings].sort((a, b) => b.priority - a.priority);
  }

  /** Find the best matching ending for current state */
  resolve(playerState: PlayerState): EndingDefinition | null {
    for (const ending of this.endings) {
      if (playerState.checkConditions(ending.conditions)) {
        return ending;
      }
    }
    // Fallback — should never happen if endings are well-defined
    return this.endings[this.endings.length - 1] || null;
  }

  /** Get ALL endings that match (for debug/testing) */
  resolveAll(playerState: PlayerState): EndingDefinition[] {
    return this.endings.filter(e => playerState.checkConditions(e.conditions));
  }
}
