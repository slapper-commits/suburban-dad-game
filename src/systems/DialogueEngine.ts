import Phaser from 'phaser';
import type { DialogueTree, DialogueNode, DialogueChoice, DialogueBeat } from '../types';
import type { PlayerState } from './PlayerState';
import type { TimeClock } from './TimeClock';

/**
 * DialogueEngine — drives branching conversations.
 *
 * Features:
 * - Branching choice trees loaded from JSON
 * - Condition-gated choices (only show if conditions met)
 * - Router nodes (evaluate routes, jump to first match)
 * - Text templates: {{flags.lawnStatus}} interpolated from state
 * - State effects on nodes and choices
 * - Time costs on choices
 * - Scene transitions via exitScene
 */
export class DialogueEngine {
  private events: Phaser.Events.EventEmitter;
  private currentTree: DialogueTree | null = null;
  private currentNode: DialogueNode | null = null;
  private currentBeatIndex = 0;

  constructor(
    private playerState: PlayerState,
    private timeClock: TimeClock,
  ) {
    this.events = new Phaser.Events.EventEmitter();
  }

  /** Start a dialogue tree */
  start(tree: DialogueTree): void {
    this.currentTree = tree;
    this.goToNode(tree.startNode);
  }

  /** Jump to a specific node */
  goToNode(nodeId: string): void {
    if (!this.currentTree) return;

    const node = this.currentTree.nodes[nodeId];
    if (!node) {
      console.error(`Dialogue node not found: ${nodeId}`);
      this.end();
      return;
    }

    this.currentNode = node;

    // Apply node effects
    if (node.effects) {
      this.playerState.applyEffects(node.effects);
    }

    // Router: evaluate routes and jump to first match
    if (node.routes && node.routes.length > 0) {
      for (const route of node.routes) {
        if (this.playerState.checkConditions(route.conditions)) {
          this.goToNode(route.nextNode);
          return;
        }
      }
      // No route matched — fall through to next or end
      if (node.next) {
        this.goToNode(node.next);
        return;
      }
      this.end();
      return;
    }

    // If this node uses beat sequencing, show the first beat and wait for advance()
    if (node.beats && node.beats.length > 0) {
      this.currentBeatIndex = 0;
      // Apply first beat's effects if any
      const firstBeat = node.beats[0];
      if (firstBeat.effects) {
        this.playerState.applyEffects(firstBeat.effects);
      }
      this.emitCurrentBeat();
      return;
    }

    // Interpolate text templates
    const interpolatedText = this.interpolateText(node.text);
    const displayNode = { ...node, text: interpolatedText };

    // Filter choices by conditions
    const availableChoices = this.getAvailableChoices(node);

    // Interpolate choice text too
    const displayChoices = availableChoices.map(c => ({
      ...c,
      text: this.interpolateText(c.text),
    }));

    // Emit for UI to render
    this.events.emit('node', {
      node: displayNode,
      choices: displayChoices,
      isEnd: !node.next && displayChoices.length === 0,
    });

    // Check for scene transition on end node
    if (displayChoices.length === 0 && !node.next && node.exitScene) {
      this.events.emit('exit_scene', node.exitScene);
    }
  }

  /**
   * Emit the current beat of the current node as a 'node' event.
   * Choices (if any) are ALWAYS included — visible from the very first beat —
   * so the player can pick an option immediately without having to advance
   * through intro beats first.
   */
  private emitCurrentBeat(): void {
    const node = this.currentNode;
    if (!node) return;
    const beats = node.beats;
    if (!beats || beats.length === 0) return;
    const beat: DialogueBeat | undefined = beats[this.currentBeatIndex];
    if (!beat) return;

    const displayNode: DialogueNode = {
      ...node,
      speaker: beat.speaker ?? node.speaker,
      text: this.interpolateText(beat.text),
      mouth: beat.mouth ?? node.mouth,
      eyes: beat.eyes ?? node.eyes,
      eyebrows: beat.eyebrows ?? node.eyebrows,
    };

    const choicesOut: DialogueChoice[] = this.getAvailableChoices(node).map(
      c => ({ ...c, text: this.interpolateText(c.text) }),
    );

    // isEnd is true only on the last beat when there are no choices AND no next AND no exitScene
    const isLastBeat = this.currentBeatIndex === beats.length - 1;
    const willEnd = isLastBeat && choicesOut.length === 0 && !node.next && !node.exitScene;

    this.events.emit('node', {
      node: displayNode,
      choices: choicesOut,
      isEnd: willEnd,
    });
  }

  /** Interpolate {{field.path}} templates in text */
  private interpolateText(text: string): string {
    return text.replace(/\{\{(\w[\w.]*)\}\}/g, (_match, path: string) => {
      const val = this.playerState.resolveField(path);
      return val !== undefined ? String(val) : '???';
    });
  }

  /** Get choices the player can see (conditions met) */
  private getAvailableChoices(node: DialogueNode): DialogueChoice[] {
    if (!node.choices) return [];
    return node.choices.filter(choice => {
      if (!choice.conditions) return true;
      return this.playerState.checkConditions(choice.conditions);
    });
  }

  /** Player selects a choice */
  selectChoice(choiceIndex: number): void {
    if (!this.currentNode?.choices) return;

    const available = this.getAvailableChoices(this.currentNode);
    const choice = available[choiceIndex];
    if (!choice) return;

    // Apply choice effects
    if (choice.effects) {
      this.playerState.applyEffects(choice.effects);
    }

    // Advance time if the choice has a time cost
    if (choice.timeCost) {
      // Check if any effect reduces sobriety (for recovery logic)
      const reducesSobriety = choice.effects?.some(
        e => (e.type === 'add' && e.field === 'sobriety' && (e.value as number) < 0) ||
             (e.type === 'set' && e.field === 'sobriety')
      ) ?? false;

      this.timeClock.advance(choice.timeCost);

      // Sobriety recovery if not drinking
      if (!reducesSobriety && choice.timeCost >= 15) {
        this.playerState.recoverSobriety(choice.timeCost);
      }
    }

    this.events.emit('choice_made', choice, choiceIndex);

    // Navigate to next node
    this.goToNode(choice.nextNode);
  }

  /** Advance dialogue — step to next beat, or to next node, or close. */
  advance(): void {
    if (!this.currentNode) return;
    const node = this.currentNode;

    // Beat stepping: play through each beat.
    if (node.beats && node.beats.length > 0) {
      const lastIdx = node.beats.length - 1;

      // Not yet at last beat → show next beat
      if (this.currentBeatIndex < lastIdx) {
        this.currentBeatIndex++;
        const beat = node.beats[this.currentBeatIndex];
        if (beat.effects) this.playerState.applyEffects(beat.effects);
        this.emitCurrentBeat();
        return;
      }

      // On last beat: if the node has choices, the user must pick one.
      // Don't auto-advance past — let them click/keyboard-select a choice.
      const choices = this.getAvailableChoices(node);
      if (choices.length > 0) {
        // No-op; choices are already visible. Await a selectChoice() call.
        return;
      }
      // No choices → fall through to normal next/exit/end below
    }

    if (node.next) {
      this.goToNode(node.next);
    } else if (node.exitScene) {
      this.events.emit('exit_scene', node.exitScene);
      this.end();
    } else {
      this.end();
    }
  }

  /** End the current dialogue */
  end(): void {
    this.currentTree = null;
    this.currentNode = null;
    this.events.emit('end');
  }

  get isActive(): boolean {
    return this.currentTree !== null;
  }

  on(event: 'node' | 'choice_made' | 'exit_scene' | 'end', fn: (...args: any[]) => void): this {
    this.events.on(event, fn);
    return this;
  }

  off(event: string, fn: (...args: any[]) => void): this {
    this.events.off(event, fn);
    return this;
  }
}
