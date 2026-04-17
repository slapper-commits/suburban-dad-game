import Phaser from 'phaser';
import type { PlayerState } from './PlayerState';

export interface WifeMessage {
  from: string;
  body: string;
  time: number;
}

interface ScriptedText {
  at: number;
  body: string | ((state: any) => string);
}

interface NagText {
  id: string;
  after: number;
  condition: (state: any) => boolean;
  body: string;
}

interface ReactiveText {
  threshold: number;
  body: string;
}

/**
 * WifeTexts — Karen's message system.
 *
 * Three layers:
 * 1. Scripted: fire once at fixed game times
 * 2. Nags: fire once when time + condition both met
 * 3. Reactive: fire once when suspicion crosses thresholds
 */
export class WifeTexts {
  private events: Phaser.Events.EventEmitter;
  private sentScripted = new Set<number>();
  private sentNags = new Set<string>();
  private sentReactive = new Set<number>();

  private scripted: ScriptedText[] = [
    { at: 435,  body: "Morning! Charcoal (Kingsford!), buns, and the lawn. Party at 5. Love you" },
    { at: 600,  body: "Getting the charcoal today right? Kingsford NOT the cheap stuff" },
    { at: 750,  body: "How's the lawn coming?" },
    { at: 840,  body: "My mom's coming at 4. PLEASE have the lawn done." },
    { at: 930,  body: (s: any) =>
        (s.flags.lawnStatus as number) > 80
          ? "Lawn looks great!"
          : "Where are you??"
    },
    { at: 990,  body: "People are here in 30 min" },
    { at: 1020, body: "GET HOME. NOW." },
  ];

  private nags: NagText[] = [
    { id: 'lawn_9',    after: 540,  condition: s => (s.flags.lawnStatus as number) < 30,          body: "Lawn. Please. It's almost 9." },
    { id: 'grill_10',  after: 600,  condition: s => s.flags.grillStatus === 'not_started',        body: "Did you get the charcoal??" },
    { id: 'lawn_12',   after: 720,  condition: s => (s.flags.lawnStatus as number) < 60,          body: "Babe. The LAWN." },
    { id: 'grill_1',   after: 780,  condition: s => s.flags.grillStatus !== 'cooking' && s.flags.grillStatus !== 'done',
                                                                                                   body: "Are the coals going yet?" },
    { id: 'lawn_2',    after: 840,  condition: s => (s.flags.lawnStatus as number) < 95,          body: "MOW. THE. LAWN." },
    { id: 'grill_3',   after: 900,  condition: s => s.flags.grillStatus !== 'done' && s.flags.grillStatus !== 'cooking',
                                                                                                   body: "burgers on by 3:30 ok?" },
    { id: 'combo_4',   after: 960,  condition: s => (s.flags.lawnStatus as number) < 95 || (s.flags.grillStatus !== 'done' && s.flags.grillStatus !== 'cooking'),
                                                                                                   body: "where are you even right now" },
  ];

  private reactive: ReactiveText[] = [
    { threshold: 30, body: "Everything ok? You're being quiet." },
    { threshold: 45, body: "Hello?? Answer me." },
    { threshold: 55, body: "I called Doug's wife. She said Doug hasn't seen you either." },
    { threshold: 60, body: "I'm coming to find you." },
    { threshold: 80, body: "Don't bother coming home." },
  ];

  constructor(private playerState: PlayerState) {
    this.events = new Phaser.Events.EventEmitter();
  }

  /**
   * Check all message conditions. Call after every time advance.
   * Emits 'text' events for any messages that should fire.
   */
  check(): void {
    const state = this.playerState.state;
    const time = state.currentTime;

    // Scripted messages
    for (const msg of this.scripted) {
      if (time >= msg.at && !this.sentScripted.has(msg.at)) {
        this.sentScripted.add(msg.at);
        const body = typeof msg.body === 'function' ? msg.body(state) : msg.body;
        this.emit({ from: 'Karen', body, time: msg.at });
      }
    }

    // Nag messages
    for (const nag of this.nags) {
      if (time >= nag.after && !this.sentNags.has(nag.id) && nag.condition(state)) {
        this.sentNags.add(nag.id);
        this.emit({ from: 'Karen', body: nag.body, time });
      }
    }

    // Reactive messages (suspicion thresholds)
    for (const rx of this.reactive) {
      if (state.suspicion >= rx.threshold && !this.sentReactive.has(rx.threshold)) {
        this.sentReactive.add(rx.threshold);
        this.emit({ from: 'Karen', body: rx.body, time });
      }
    }
  }

  private emit(msg: WifeMessage): void {
    this.events.emit('text', msg);

    // Auto-reply after a short delay based on sobriety
    const sobriety = this.playerState.state.sobriety;
    const reply = this.getDrunkReply(sobriety);
    if (reply) {
      // Delay the auto-reply slightly so it appears after Karen's text
      setTimeout(() => {
        this.events.emit('text', {
          from: 'You',
          body: reply,
          time: msg.time,
        });
      }, 2500);
    }
  }

  /**
   * Generate Dad's auto-reply based on sobriety level.
   * The drunker he is, the worse the texting gets.
   */
  private getDrunkReply(sobriety: number): string | null {
    if (sobriety >= 80) {
      // Sober — clean, responsible reply
      const replies = [
        "On it! 👍",
        "Yep, getting it done.",
        "No worries, everything under control.",
        "Already on the list!",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (sobriety >= 60) {
      // Buzzed — casual, a little too chill
      const replies = [
        "Yep all good babe!",
        "Haha no worries got it",
        "On it! Havin a great day actually",
        "Lol ok ok im going",
        "Relaaax its saturday 😎",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (sobriety >= 30) {
      // Drunk — typos, overly affectionate
      const replies = [
        "Im fine babe don worry",
        "Yep yep yep im oin it",
        "Lovr you so much karren",
        "Lwan is goin grate!!",
        "Hahaha ur so funnt",
        "Ok ok ok ok ill do iy",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    // Wasted — gibberish, concerning
    const replies = [
      "lovr u hnney evrythin is gooood",
      "im at the. the place. the good one",
      "KARENNN ur the best wifd",
      "whta charcoal? oh yaeh the thing",
      "hahahHAHAH ill be hoem soon probly",
      "doug says hi. or was that the other guy",
      "🍺🍺🍺👍👍👍",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  on(event: 'text', fn: (msg: WifeMessage) => void): this {
    this.events.on(event, fn);
    return this;
  }

  off(event: string, fn: (...args: any[]) => void): this {
    this.events.off(event, fn);
    return this;
  }

  reset(): void {
    this.sentScripted.clear();
    this.sentNags.clear();
    this.sentReactive.clear();
  }
}
