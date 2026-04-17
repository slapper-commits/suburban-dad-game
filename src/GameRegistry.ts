import { PlayerState, TimeClock, DialogueEngine, EndingResolver, WifeTexts, BBQDirector } from './systems';

/**
 * GameRegistry — singleton access to all shared game systems.
 */
export class GameRegistry {
  private static _instance: GameRegistry;

  public playerState: PlayerState;
  public timeClock: TimeClock;
  public dialogueEngine: DialogueEngine;
  public endingResolver: EndingResolver;
  public wifeTexts: WifeTexts;
  public bbqDirector: BBQDirector;

  private constructor() {
    this.playerState = new PlayerState();
    this.timeClock = new TimeClock(this.playerState.state);
    this.dialogueEngine = new DialogueEngine(this.playerState, this.timeClock);
    this.endingResolver = new EndingResolver();
    this.wifeTexts = new WifeTexts(this.playerState);
    this.bbqDirector = new BBQDirector(this.playerState, this.timeClock, this.dialogueEngine, {});
  }

  static get instance(): GameRegistry {
    if (!GameRegistry._instance) {
      GameRegistry._instance = new GameRegistry();
    }
    return GameRegistry._instance;
  }

  /** Reset everything for a new game */
  newGame(): void {
    this.playerState.reset();
    this.timeClock = new TimeClock(this.playerState.state);
    this.dialogueEngine = new DialogueEngine(this.playerState, this.timeClock);
    this.wifeTexts = new WifeTexts(this.playerState);
    this.wifeTexts.reset();
    this.bbqDirector = new BBQDirector(this.playerState, this.timeClock, this.dialogueEngine, {});
  }
}
