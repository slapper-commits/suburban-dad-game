import Phaser from 'phaser';
import { GameRegistry } from '../GameRegistry';
import type { SceneData, DialogueTree, DialogueNode, DialogueChoice, MiniGameConfig } from '../types';
import type { WifeMessage } from '../systems/WifeTexts';
import { PlayerCharacter } from '../entities/PlayerCharacter';
import { InteractionZone } from '../entities/InteractionZone';
import { DebugHud } from '../ui/DebugHud';
import { sceneZones } from '../data/scene-zones';
import {
  drawKitchen, drawFrontYard, drawGarage, drawBackyard, drawDougs, drawBBQ,
  drawSidewalk, drawCraigs, drawKevins, drawKidsPorch, drawQuikstop, drawGasStation,
  drawStripMall, drawSketchy, drawHighway, drawGasStationStore, drawMotelRoom,
  drawMotelExterior, drawTeenAlley,
  drawStripClub, drawStripClubVip, drawGirlsApartment, drawTrapHouse,
  drawIntoxOverlay, setSceneAnimTime,
} from '../rendering/SceneRenderer';
import { drawCharacter } from '../rendering/CharacterRenderer';
import { getNpcConfig } from '../data/npc-registry';

// ── Scene data imports ──────────────────────────────────────
import kitchenData from '../data/scenes/kitchen.json';
import frontyardData from '../data/scenes/frontyard.json';
import garageData from '../data/scenes/garage.json';
import backyardData from '../data/scenes/backyard.json';
import dougsData from '../data/scenes/dougs.json';
import bbqData from '../data/scenes/bbq.json';
import sidewalkData from '../data/scenes/sidewalk.json';
import craigsData from '../data/scenes/craigs.json';
import kevinsData from '../data/scenes/kevins.json';
import kidsPorchData from '../data/scenes/kids_porch.json';
import quikstopData from '../data/scenes/quikstop.json';
import gasStationData from '../data/scenes/gas_station.json';
import stripMallData from '../data/scenes/strip_mall.json';
import sketchyData from '../data/scenes/sketchy.json';
import highwayData from '../data/scenes/highway.json';
import gasStationStoreData from '../data/scenes/gas_station_store.json';
import stripClubData from '../data/scenes/strip_club.json';
import stripClubVipData from '../data/scenes/strip_club_vip.json';
import girlsApartmentData from '../data/scenes/girls_apartment.json';
import trapHouseData from '../data/scenes/trap_house.json';

// ── Dialogue data imports ───────────────────────────────────
import kitchenHub from '../data/dialogues/kitchen_hub.json';
import frontyardHub from '../data/dialogues/frontyard_hub.json';
import frontyardMow from '../data/dialogues/frontyard_mow.json';
import backyardHub from '../data/dialogues/backyard_hub.json';
import backyardGrill from '../data/dialogues/backyard_grill.json';
import backyardSit from '../data/dialogues/backyard_sit.json';
import garageEnter from '../data/dialogues/garage_enter.json';
import garageFridge from '../data/dialogues/garage_fridge.json';
import garageWorkbench from '../data/dialogues/garage_workbench.json';
import dougsHub from '../data/dialogues/dougs_hub.json';
import dougsAlcohol from '../data/dialogues/dougs_alcohol.json';
import bbqHub from '../data/dialogues/bbq_hub.json';
import bbqMil from '../data/dialogues/bbq_mil.json';
import bbqDoug from '../data/dialogues/bbq_doug.json';
import bbqGrill from '../data/dialogues/bbq_grill.json';
import confrontation from '../data/dialogues/confrontation.json';
import sidewalkHub from '../data/dialogues/sidewalk_hub.json';
import sidewalkDrugs from '../data/dialogues/sidewalk_drugs.json';
import craigsHub from '../data/dialogues/craigs_hub.json';
import craigsGuns from '../data/dialogues/craigs_guns.json';
import kevinsHub from '../data/dialogues/kevins_hub.json';
import kevinsPyramid from '../data/dialogues/kevins_pyramid.json';
import kidsPorchHub from '../data/dialogues/kids_porch_hub.json';
import kidsDigital from '../data/dialogues/kids_digital.json';
import quikstopHub from '../data/dialogues/quikstop_hub.json';
import quikstopBuy from '../data/dialogues/quikstop_buy.json';
import quikstopTheft from '../data/dialogues/quikstop_theft.json';
import gasStationHub from '../data/dialogues/gas_station_hub.json';
import gasRacing from '../data/dialogues/gas_racing.json';
import gasProstitution from '../data/dialogues/gas_prostitution.json';
import stripMallHub from '../data/dialogues/strip_mall_hub.json';
import sketchyHub from '../data/dialogues/sketchy_hub.json';
import highwayHub from '../data/dialogues/highway_hub.json';
import bbqKaren from '../data/dialogues/bbq_karen.json';
import sidewalkDrugsT2 from '../data/dialogues/sidewalk_drugs_t2.json';
import dougsGamblingT2 from '../data/dialogues/dougs_gambling_t2.json';
import craigsGunsT2 from '../data/dialogues/craigs_guns_t2.json';
import kevinsPyramidT2 from '../data/dialogues/kevins_pyramid_t2.json';
import kidsDigitalT2 from '../data/dialogues/kids_digital_t2.json';
import quikstopTheftT2 from '../data/dialogues/quikstop_theft_t2.json';
import gasRacingT2 from '../data/dialogues/gas_racing_t2.json';
import gasProstitutionT2 from '../data/dialogues/gas_prostitution_t2.json';
import kevinPitch from '../data/dialogues/kevin_pitch.json';
import bbqCraig from '../data/dialogues/bbq_craig.json';
import bbqNeighbor from '../data/dialogues/bbq_neighbor.json';
// BBQ act-beat dialogues (fired by BBQDirector)
import bbqArrivalClean from '../data/dialogues/bbq_arrival_clean.json';
import bbqArrivalSuspicious from '../data/dialogues/bbq_arrival_suspicious.json';
import bbqArrivalWasted from '../data/dialogues/bbq_arrival_wasted.json';
import bbqRayrayArrives from '../data/dialogues/bbq_rayray_arrives.json';
import bbqAmberArrives from '../data/dialogues/bbq_amber_arrives.json';
import bbqMilScreams from '../data/dialogues/bbq_mil_screams.json';
import bbqNeighborEyes from '../data/dialogues/bbq_neighbor_eyes.json';
import bbqKarenDrinkThrow from '../data/dialogues/bbq_karen_drink_throw.json';
import bbqFistFight from '../data/dialogues/bbq_fist_fight.json';
import bbqSharonExArrives from '../data/dialogues/bbq_sharon_ex_arrives.json';
import bbqCopsRaid from '../data/dialogues/bbq_cops_raid.json';
import bbqGrillExplosion from '../data/dialogues/bbq_grill_explosion.json';
import bbqKarenDivorce from '../data/dialogues/bbq_karen_divorce.json';
import bbqHeroMoment from '../data/dialogues/bbq_hero_moment.json';
import bbqNormalClimax from '../data/dialogues/bbq_normal_climax.json';
import bbqResolution from '../data/dialogues/bbq_resolution.json';
import frontyardDrive from '../data/dialogues/frontyard_drive.json';
import garageChair from '../data/dialogues/garage_chair.json';
import gasStationStore from '../data/dialogues/gas_station_store.json';
import mountainView from '../data/dialogues/mountain_view.json';
import stripClubEnter from '../data/dialogues/strip_club_enter.json';
import stripClubHub from '../data/dialogues/strip_club_hub.json';
import stripClubBartender from '../data/dialogues/strip_club_bartender.json';
import stripClubDancer from '../data/dialogues/strip_club_dancer.json';
import stripClubVip from '../data/dialogues/strip_club_vip.json';
import stripClubTony from '../data/dialogues/strip_club_tony.json';
import pawnShop from '../data/dialogues/pawn_shop.json';
import dougsPoker from '../data/dialogues/dougs_poker.json';
import motelRoomData from '../data/scenes/motel_room.json';
import motelEncounter from '../data/dialogues/motel_encounter.json';
import motelExteriorData from '../data/scenes/motel_exterior.json';
import teenAlleyData from '../data/scenes/teen_alley.json';
import sharonMotelMeet from '../data/dialogues/sharon_motel_meet.json';
import tacoCart from '../data/dialogues/taco_cart.json';
import quikstopTeen from '../data/dialogues/quikstop_teen.json';
import teenAlleySmoke from '../data/dialogues/teen_alley_smoke.json';
import girlsApartmentHub from '../data/dialogues/girls_apartment_hub.json';
import trapHouseHub from '../data/dialogues/trap_house_hub.json';
import trapDealer from '../data/dialogues/trap_dealer.json';
import trapRayray from '../data/dialogues/trap_rayray.json';
import trapJim from '../data/dialogues/trap_jim.json';
import trapTrina from '../data/dialogues/trap_trina.json';

const SCREEN_W = 800;
const SCREEN_H = 450;
const EDGE_THRESHOLD = 50;
const EDGE_DWELL_TIME = 300; // ms at edge before transition

/**
 * GameScene — the main gameplay scene.
 *
 * Player controls Dad with WASD/arrows, walks up to NPCs/objects,
 * presses E to interact, and walks to screen edges to change locations.
 */
export class GameScene extends Phaser.Scene {
  private reg!: GameRegistry;
  private currentSceneData: SceneData | null = null;
  private currentSceneId = '';

  // Scene data registry
  private sceneDataMap: Record<string, SceneData> = {};
  private dialogueMap: Record<string, DialogueTree> = {};

  // Player character
  private player!: PlayerCharacter;

  // Interaction zones (per-scene)
  private interactionZones: InteractionZone[] = [];

  // Input
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactKeySpace!: Phaser.Input.Keyboard.Key;

  // Edge transition tracking
  private edgeDwellTime = 0;
  private edgeSide: 'left' | 'right' | null = null;

  // Display groups
  private hudGroup!: Phaser.GameObjects.Group;
  private dialogueGroup!: Phaser.GameObjects.Group;

  // Graphics for procedural rendering
  private sceneGfx!: Phaser.GameObjects.Graphics;

  // HUD elements
  private timeText!: Phaser.GameObjects.Text;
  private locationText!: Phaser.GameObjects.Text;
  private lawnText!: Phaser.GameObjects.Text;
  private grillText!: Phaser.GameObjects.Text;
  private cashText!: Phaser.GameObjects.Text;
  private sobrietyBar!: Phaser.GameObjects.Rectangle;
  private sobrietyFill!: Phaser.GameObjects.Rectangle;
  private suspicionBar!: Phaser.GameObjects.Rectangle;
  private suspicionFill!: Phaser.GameObjects.Rectangle;
  private energyBar!: Phaser.GameObjects.Rectangle;
  private energyFill!: Phaser.GameObjects.Rectangle;

  // Dialogue overlay state
  private dialogueActive = false;
  private dialoguePanel!: Phaser.GameObjects.Rectangle;
  private dialogueSpeaker!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private dialogueChoices: Phaser.GameObjects.Text[] = [];
  private dialogueContinue!: Phaser.GameObjects.Text;
  private dialoguePortraitGfx!: Phaser.GameObjects.Graphics;
  private dialoguePortraitFrame!: Phaser.GameObjects.Rectangle;

  // Toast queue for wife texts
  private toastQueue: WifeMessage[] = [];
  private activeToast: Phaser.GameObjects.Container | null = null;
  private toastTimer?: Phaser.Time.TimerEvent;

  // Confrontation tracking
  private confrontationFired = false;
  private debugHud!: DebugHud;
  private bbqTickAccum = 0;
  private forcedBBQ = false;

  // Track which scenes have had their enter dialogue fired
  private enteredScenes: Set<string> = new Set();

  constructor() {
    super('GameScene');
  }

  init(): void {
    this.reg = GameRegistry.instance;

    // Reset per-run state (Phaser reuses scene instances on restart)
    this.confrontationFired = false;
    this.forcedBBQ = false;
    this.enteredScenes = new Set();
    this.dialogueActive = false;
    this.toastQueue = [];
    this.activeToast = null;
    this.interactionZones = [];
    this.edgeDwellTime = 0;
    this.edgeSide = null;

    // Register all scene data
    this.sceneDataMap = {
      kitchen: kitchenData as unknown as SceneData,
      frontyard: frontyardData as unknown as SceneData,
      garage: garageData as unknown as SceneData,
      backyard: backyardData as unknown as SceneData,
      dougs: dougsData as unknown as SceneData,
      bbq: bbqData as unknown as SceneData,
      sidewalk: sidewalkData as unknown as SceneData,
      craigs: craigsData as unknown as SceneData,
      kevins: kevinsData as unknown as SceneData,
      kids_porch: kidsPorchData as unknown as SceneData,
      quikstop: quikstopData as unknown as SceneData,
      gas_station: gasStationData as unknown as SceneData,
      strip_mall: stripMallData as unknown as SceneData,
      sketchy: sketchyData as unknown as SceneData,
      highway: highwayData as unknown as SceneData,
      gas_station_store: gasStationStoreData as unknown as SceneData,
      motel_room: motelRoomData as unknown as SceneData,
      motel_exterior: motelExteriorData as unknown as SceneData,
      teen_alley: teenAlleyData as unknown as SceneData,
      strip_club: stripClubData as unknown as SceneData,
      strip_club_vip: stripClubVipData as unknown as SceneData,
      girls_apartment: girlsApartmentData as unknown as SceneData,
      trap_house: trapHouseData as unknown as SceneData,
    };

    // Register all dialogue trees
    this.dialogueMap = {
      kitchen_hub: kitchenHub as unknown as DialogueTree,
      frontyard_hub: frontyardHub as unknown as DialogueTree,
      frontyard_mow: frontyardMow as unknown as DialogueTree,
      backyard_hub: backyardHub as unknown as DialogueTree,
      backyard_grill: backyardGrill as unknown as DialogueTree,
      backyard_sit: backyardSit as unknown as DialogueTree,
      garage_enter: garageEnter as unknown as DialogueTree,
      garage_fridge: garageFridge as unknown as DialogueTree,
      garage_workbench: garageWorkbench as unknown as DialogueTree,
      dougs_hub: dougsHub as unknown as DialogueTree,
      dougs_alcohol: dougsAlcohol as unknown as DialogueTree,
      bbq_hub: bbqHub as unknown as DialogueTree,
      bbq_mil: bbqMil as unknown as DialogueTree,
      bbq_doug: bbqDoug as unknown as DialogueTree,
      bbq_grill: bbqGrill as unknown as DialogueTree,
      confrontation: confrontation as unknown as DialogueTree,
      sidewalk_hub: sidewalkHub as unknown as DialogueTree,
      sidewalk_drugs: sidewalkDrugs as unknown as DialogueTree,
      craigs_hub: craigsHub as unknown as DialogueTree,
      craigs_guns: craigsGuns as unknown as DialogueTree,
      kevins_hub: kevinsHub as unknown as DialogueTree,
      kevins_pyramid: kevinsPyramid as unknown as DialogueTree,
      kids_porch_hub: kidsPorchHub as unknown as DialogueTree,
      kids_digital: kidsDigital as unknown as DialogueTree,
      quikstop_hub: quikstopHub as unknown as DialogueTree,
      quikstop_buy: quikstopBuy as unknown as DialogueTree,
      quikstop_theft: quikstopTheft as unknown as DialogueTree,
      gas_station_hub: gasStationHub as unknown as DialogueTree,
      gas_racing: gasRacing as unknown as DialogueTree,
      gas_prostitution: gasProstitution as unknown as DialogueTree,
      strip_mall_hub: stripMallHub as unknown as DialogueTree,
      sketchy_hub: sketchyHub as unknown as DialogueTree,
      highway_hub: highwayHub as unknown as DialogueTree,
      bbq_karen: bbqKaren as unknown as DialogueTree,
      sidewalk_drugs_t2: sidewalkDrugsT2 as unknown as DialogueTree,
      dougs_gambling_t2: dougsGamblingT2 as unknown as DialogueTree,
      craigs_guns_t2: craigsGunsT2 as unknown as DialogueTree,
      kevins_pyramid_t2: kevinsPyramidT2 as unknown as DialogueTree,
      kids_digital_t2: kidsDigitalT2 as unknown as DialogueTree,
      quikstop_theft_t2: quikstopTheftT2 as unknown as DialogueTree,
      gas_racing_t2: gasRacingT2 as unknown as DialogueTree,
      gas_prostitution_t2: gasProstitutionT2 as unknown as DialogueTree,
      sharon_motel_meet: sharonMotelMeet as unknown as DialogueTree,
      taco_cart: tacoCart as unknown as DialogueTree,
      quikstop_teen: quikstopTeen as unknown as DialogueTree,
      teen_alley_smoke: teenAlleySmoke as unknown as DialogueTree,
      kevin_pitch: kevinPitch as unknown as DialogueTree,
      bbq_craig: bbqCraig as unknown as DialogueTree,
      bbq_neighbor: bbqNeighbor as unknown as DialogueTree,
      frontyard_drive: frontyardDrive as unknown as DialogueTree,
      garage_chair: garageChair as unknown as DialogueTree,
      gas_station_store: gasStationStore as unknown as DialogueTree,
      mountain_view: mountainView as unknown as DialogueTree,
      strip_club_enter: stripClubEnter as unknown as DialogueTree,
      strip_club_hub: stripClubHub as unknown as DialogueTree,
      strip_club_bartender: stripClubBartender as unknown as DialogueTree,
      strip_club_dancer: stripClubDancer as unknown as DialogueTree,
      strip_club_vip: stripClubVip as unknown as DialogueTree,
      strip_club_tony: stripClubTony as unknown as DialogueTree,
      pawn_shop: pawnShop as unknown as DialogueTree,
      dougs_poker: dougsPoker as unknown as DialogueTree,
      motel_encounter: motelEncounter as unknown as DialogueTree,
      girls_apartment_hub: girlsApartmentHub as unknown as DialogueTree,
      trap_house_hub: trapHouseHub as unknown as DialogueTree,
      trap_dealer: trapDealer as unknown as DialogueTree,
      trap_rayray: trapRayray as unknown as DialogueTree,
      trap_jim: trapJim as unknown as DialogueTree,
      trap_trina: trapTrina as unknown as DialogueTree,
      // BBQ act-beats
      bbq_arrival_clean: bbqArrivalClean as unknown as DialogueTree,
      bbq_arrival_suspicious: bbqArrivalSuspicious as unknown as DialogueTree,
      bbq_arrival_wasted: bbqArrivalWasted as unknown as DialogueTree,
      bbq_rayray_arrives: bbqRayrayArrives as unknown as DialogueTree,
      bbq_amber_arrives: bbqAmberArrives as unknown as DialogueTree,
      bbq_mil_screams: bbqMilScreams as unknown as DialogueTree,
      bbq_neighbor_eyes: bbqNeighborEyes as unknown as DialogueTree,
      bbq_karen_drink_throw: bbqKarenDrinkThrow as unknown as DialogueTree,
      bbq_fist_fight: bbqFistFight as unknown as DialogueTree,
      bbq_sharon_ex_arrives: bbqSharonExArrives as unknown as DialogueTree,
      bbq_cops_raid: bbqCopsRaid as unknown as DialogueTree,
      bbq_grill_explosion: bbqGrillExplosion as unknown as DialogueTree,
      bbq_karen_divorce: bbqKarenDivorce as unknown as DialogueTree,
      bbq_hero_moment: bbqHeroMoment as unknown as DialogueTree,
      bbq_normal_climax: bbqNormalClimax as unknown as DialogueTree,
      bbq_resolution: bbqResolution as unknown as DialogueTree,
    };

    // Give the BBQDirector access to the dialogue map so it can fire beats
    this.reg.bbqDirector.setTreeRegistry(this.dialogueMap);
  }

  create(data: { sceneId: string }): void {
    // Create procedural graphics layer (behind everything)
    this.sceneGfx = this.add.graphics().setDepth(0);

    // Create display groups
    this.hudGroup = this.add.group();
    this.dialogueGroup = this.add.group();

    // Create player character
    this.player = new PlayerCharacter(this, SCREEN_W / 2, 350);

    // Ensure clicks route to the topmost interactive object (so choice text
    // at depth 101 receives the event before the panel at depth 100).
    this.input.topOnly = true;

    // Interaction keys
    this.interactKey = this.input.keyboard!.addKey('E');
    this.interactKeySpace = this.input.keyboard!.addKey('SPACE');

    // Number-key dialogue choice shortcuts (1-9)
    // ASCII digit codes: '1' = 49, '2' = 50, … '9' = 57 — Phaser KeyCodes.ONE–NINE
    for (let i = 1; i <= 9; i++) {
      const key = this.input.keyboard!.addKey(48 + i);
      key.on('down', () => {
        if (!this.dialogueActive) return;
        if (this.dialogueChoices.length === 0) return;
        const idx = i - 1;
        if (idx >= this.dialogueChoices.length) return;
        this.reg.dialogueEngine.selectChoice(idx);
      });
    }

    // ENTER advances dialogue — also works while choices are visible (advances
    // through more beats without picking a choice). At end nodes, closes.
    const advanceKey = this.input.keyboard!.addKey('ENTER');
    advanceKey.on('down', () => {
      if (!this.dialogueActive) return;
      if (this.dialogueContinue.text.includes('done') && this.dialogueChoices.length === 0) {
        this.reg.dialogueEngine.end();
      } else {
        this.reg.dialogueEngine.advance();
      }
    });

    // Build HUD
    this.createHUD();

    // Debug HUD (F9 toggles)
    this.debugHud = new DebugHud(this);
    this.input.keyboard!.addKey('F9').on('down', () => this.debugHud.toggle());

    // Build dialogue overlay (hidden initially)
    this.createDialogueOverlay();

    // Wire up dialogue engine events
    this.reg.dialogueEngine.on('node', (payload: {
      node: DialogueNode;
      choices: DialogueChoice[];
      isEnd: boolean;
    }) => {
      this.showDialogueNode(payload.node, payload.choices, payload.isEnd);
    });

    this.reg.dialogueEngine.on('end', () => {
      this.hideDialogue();
      this.checkWifeTexts();
      this.checkGameFlow();
    });

    this.reg.dialogueEngine.on('exit_scene', (sceneId: string) => {
      this.hideDialogue();
      this.checkWifeTexts();
      this.checkGameFlow();
      if (this.forcedBBQ) return;
      if (sceneId.startsWith('MINIGAME:')) {
        const gameId = sceneId.substring('MINIGAME:'.length);
        this.launchMinigame(gameId);
        return;
      }
      this.loadLocation(sceneId);
    });

    // Wire up time events
    this.reg.timeClock.on('tick', () => {
      this.checkWifeTexts();
      this.checkGameFlow();
    });

    this.reg.timeClock.on('gameover', () => {
      this.reg.playerState.computeEndingFlags();
      this.scene.start('EndingScene');
    });

    // Wire up wife text display
    this.reg.wifeTexts.on('text', (msg: WifeMessage) => {
      this.queueToast(msg);
    });

    // Listen for minigame results
    this.events.on('minigame_result', (result: { gameId: string; result: 'success' | 'failure' }) => {
      this.handleMinigameResult(result);
    });

    // Load initial location
    this.loadLocation(data.sceneId || 'kitchen');
  }

  update(_time: number, delta: number): void {
    // Update player movement — pass active consumption animation if any
    const consumption = this.reg.playerState.getActiveConsumption();
    this.player.update(delta, this.reg.playerState.state, consumption);

    // Auto-tick the clock at BBQ so the game always reaches 7 PM and
    // resolves to an ending. 1 game minute per real second — BBQ is
    // ~2 real minutes if the player idles.
    if (this.reg.timeClock.isBBQTime && !this.reg.timeClock.isGameOver) {
      this.bbqTickAccum += delta / 1000;
      while (this.bbqTickAccum >= 1) {
        this.bbqTickAccum -= 1;
        this.reg.timeClock.advance(1);
      }
    }

    // While a consumption animation is playing, fade the dialogue panel so
    // the player can see Dad chugging / smoking / etc. (instead of it being
    // hidden behind the semi-transparent panel).
    if (this.dialogueActive && this.dialoguePanel) {
      const targetAlpha = consumption ? 0.18 : 1;
      this.dialoguePanel.setAlpha(targetAlpha);
      this.dialogueText?.setAlpha(targetAlpha);
      this.dialogueSpeaker?.setAlpha(targetAlpha);
      this.dialoguePortraitFrame?.setAlpha(targetAlpha);
      this.dialoguePortraitGfx?.setAlpha(targetAlpha);
      this.dialogueChoices.forEach(c => c.setAlpha(targetAlpha));
    }

    // Update interaction zones — even while a dialogue is active, so the
    // player can walk around, trigger a new zone (which closes the current
    // dialogue), or drift across an edge. The dialogue panel is a
    // non-intrusive overlay, not a modal.
    this.updateInteractionZones();
    this.checkEdgeTransitions(delta);
    this.checkInteractInput();

    // Animated scene redraw — re-renders the background + NPCs each frame
    // so NPCs can idle-breathe, blink, sway.
    if (this.currentSceneData) {
      setSceneAnimTime(this.time.now / 1000);
      this.drawBackground(this.currentSceneData);
    }

    this.updateHUD();
    this.debugHud.update(
      this.reg.playerState,
      this.reg.timeClock,
      this.reg.dialogueEngine,
      this.interactionZones,
      this.player.x,
    );
  }

  // ── Interaction zones ─────────────────────────────────────

  private updateInteractionZones(): void {
    const px = this.player.x;
    for (const zone of this.interactionZones) {
      // Check visibility conditions
      if (zone.config.visibleWhen) {
        if (!this.reg.playerState.checkConditions(zone.config.visibleWhen)) {
          zone.hide();
          continue;
        }
      }
      zone.update(px);
    }
  }

  private checkInteractInput(): void {
    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      return;
    }

    // Find the closest in-range zone
    for (const zone of this.interactionZones) {
      if (zone.inRange) {
        // Skip zones whose visibility conditions fail (e.g. mow zone after
        // lawnStatus reaches 100) — they're hidden on the UI but the in-range
        // check would otherwise still trigger them on an E press.
        if (zone.config.visibleWhen &&
            !this.reg.playerState.checkConditions(zone.config.visibleWhen)) {
          continue;
        }
        // Check action conditions
        if (zone.config.conditions &&
            !this.reg.playerState.checkConditions(zone.config.conditions)) {
          continue;
        }
        this.handleInteraction(zone);
        return;
      }
    }
  }

  private handleInteraction(zone: InteractionZone): void {
    const action = zone.config.action;

    switch (action.type) {
      case 'dialogue': {
        const tree = this.dialogueMap[action.treeId];
        if (tree) {
          // If a dialogue is already open (player walked to a new NPC
          // without closing the previous panel), close it cleanly first.
          if (this.dialogueActive) {
            this.reg.dialogueEngine.end();
          }
          this.reg.dialogueEngine.start(tree);
        }
        break;
      }
      case 'scene': {
        if (this.dialogueActive) this.reg.dialogueEngine.end();
        if (action.timeCost) {
          this.reg.timeClock.advance(action.timeCost);
          this.reg.playerState.recoverSobriety(action.timeCost);
        }
        this.loadLocation(action.sceneId);
        break;
      }
      case 'inspect': {
        if (this.dialogueActive) this.reg.dialogueEngine.end();
        this.showInspectText(action.text);
        break;
      }
      case 'conditional_inspect': {
        if (this.dialogueActive) this.reg.dialogueEngine.end();
        const match = action.routes.find(r =>
          this.reg.playerState.checkConditions(r.conditions)
        );
        this.showInspectText(match?.text ?? action.fallback);
        break;
      }
      case 'minigame': {
        if (this.dialogueActive) this.reg.dialogueEngine.end();
        this.launchMinigame(action.gameId);
        break;
      }
    }
  }

  // ── Edge transitions ──────────────────────────────────────

  private checkEdgeTransitions(delta: number): void {
    const zoneConfig = sceneZones[this.currentSceneId];
    if (!zoneConfig?.edges) return;

    let currentSide: 'left' | 'right' | null = null;

    if (this.player.isAtLeftEdge(EDGE_THRESHOLD) && zoneConfig.edges.left) {
      currentSide = 'left';
    } else if (this.player.isAtRightEdge(EDGE_THRESHOLD) && zoneConfig.edges.right) {
      currentSide = 'right';
    }

    if (currentSide && currentSide === this.edgeSide) {
      this.edgeDwellTime += delta;
      if (this.edgeDwellTime >= EDGE_DWELL_TIME) {
        const edge = zoneConfig.edges[currentSide]!;
        // Walking across a scene boundary closes any open dialogue panel.
        if (this.dialogueActive) this.reg.dialogueEngine.end();
        if (edge.timeCost) {
          this.reg.timeClock.advance(edge.timeCost);
          this.reg.playerState.recoverSobriety(edge.timeCost);
        }
        this.loadLocation(edge.sceneId, currentSide === 'left' ? 'fromLeft' : 'fromRight');
      }
    } else {
      this.edgeSide = currentSide;
      this.edgeDwellTime = 0;
    }
  }

  // ── Location loading ──────────────────────────────────────

  private loadLocation(sceneId: string, fromDirection?: 'fromLeft' | 'fromRight'): void {
    const sceneData = this.sceneDataMap[sceneId];
    if (!sceneData) {
      console.error(`Scene not found: ${sceneId}`);
      return;
    }

    this.currentSceneData = sceneData;
    this.currentSceneId = sceneId;
    this.reg.playerState.state.currentLocation = sceneId;

    if (!this.reg.playerState.state.visitedScenes.includes(sceneId)) {
      this.reg.playerState.state.visitedScenes.push(sceneId);
    }

    // Reset edge dwell
    this.edgeDwellTime = 0;
    this.edgeSide = null;

    // Clear old interaction zones
    for (const zone of this.interactionZones) {
      zone.destroy();
    }
    this.interactionZones = [];

    // Get zone config
    const zoneConfig = sceneZones[sceneId];

    if (zoneConfig) {
      // Set player walk bounds
      this.player.setWalkBounds(
        zoneConfig.walkBounds.minX,
        zoneConfig.walkBounds.maxX,
        zoneConfig.groundY,
      );

      // Position player based on entry direction
      if (fromDirection === 'fromLeft') {
        // Entering from left edge → appear on the right side
        this.player.setPosition(zoneConfig.walkBounds.maxX - 70);
      } else if (fromDirection === 'fromRight') {
        // Entering from right edge → appear on the left side
        this.player.setPosition(zoneConfig.walkBounds.minX + 70);
      } else {
        this.player.setPosition(zoneConfig.dadEntryX);
      }

      // Create interaction zones
      for (const zoneCfg of zoneConfig.zones) {
        this.interactionZones.push(
          new InteractionZone(this, zoneCfg, zoneConfig.groundY)
        );
      }
    }

    // Draw procedural background
    this.drawBackground(sceneData);

    // Update location name
    this.locationText.setText(sceneData.name);

    // Fire enter dialogue if defined (first visit only)
    if (sceneData.enterDialogue &&
        this.dialogueMap[sceneData.enterDialogue] &&
        !this.enteredScenes.has(sceneId)) {
      this.enteredScenes.add(sceneId);
      this.reg.dialogueEngine.start(this.dialogueMap[sceneData.enterDialogue]);
    }
  }

  private drawBackground(sceneData: SceneData): void {
    const state = this.reg.playerState.state;

    this.sceneGfx.clear();

    const renderers: Record<string, (gfx: Phaser.GameObjects.Graphics, state: any) => void> = {
      kitchen: drawKitchen,
      frontyard: drawFrontYard,
      garage: drawGarage,
      backyard: drawBackyard,
      dougs: drawDougs,
      bbq: drawBBQ,
      sidewalk: drawSidewalk,
      craigs: drawCraigs,
      kevins: drawKevins,
      kids_porch: drawKidsPorch,
      quikstop: drawQuikstop,
      gas_station: drawGasStation,
      strip_mall: drawStripMall,
      sketchy: drawSketchy,
      highway: drawHighway,
      gas_station_store: drawGasStationStore,
      motel_room: drawMotelRoom,
      motel_exterior: drawMotelExterior,
      teen_alley: drawTeenAlley,
      strip_club: drawStripClub,
      strip_club_vip: drawStripClubVip,
      girls_apartment: drawGirlsApartment,
      trap_house: drawTrapHouse,
    };

    const renderer = renderers[sceneData.background];
    if (renderer) {
      renderer(this.sceneGfx, state);
      drawIntoxOverlay(this.sceneGfx, state);
    } else {
      this.sceneGfx.fillStyle(0x2a2a3e);
      this.sceneGfx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
  }

  // ── Minigame ──────────────────────────────────────────────

  private driveDestinations: Record<string, { sceneId: string; distance: number; timeCost: number; pullOverPoints?: string[] }> = {
    drive_quikstop:    { sceneId: 'quikstop',    distance: 260, timeCost: 5,  pullOverPoints: [] },
    drive_gas_station: { sceneId: 'gas_station', distance: 420, timeCost: 8,  pullOverPoints: ['quikstop'] },
    drive_strip_mall:  { sceneId: 'strip_mall',  distance: 480, timeCost: 10, pullOverPoints: ['sidewalk', 'quikstop'] },
    drive_sketchy:     { sceneId: 'sketchy',     distance: 620, timeCost: 15, pullOverPoints: ['quikstop', 'gas_station'] },
    drive_frontyard:   { sceneId: 'frontyard',   distance: 360, timeCost: 7,  pullOverPoints: [] },
    // Race vs Modded Car Guy — stays at gas_station on complete
    drive_race:        { sceneId: 'gas_station', distance: 300, timeCost: 15, pullOverPoints: [] },
    // Drive Craig's truck to the warehouse (tier 2 guns)
    drive_warehouse:   { sceneId: 'sketchy',     distance: 560, timeCost: 90, pullOverPoints: [] },
    // Mountains run — long, scenic, unlocks in-drive drinking
    drive_mountains:   { sceneId: 'highway',     distance: 1100, timeCost: 60, pullOverPoints: [] },
  };

  private launchMinigame(gameId: string): void {
    this.player.freeze();

    if (gameId.startsWith('drive_')) {
      const dest = this.driveDestinations[gameId];
      if (!dest) return;
      const config: MiniGameConfig = {
        id: gameId,
        type: 'custom',
        name: 'Drive the Minivan',
        description: 'Navigate suburban streets',
        difficulty: { speed: 0.5, precision: 0.5, duration: 300, wobble: 0.1 },
        rewards: [],
        penalties: [],
      };
      this.scene.pause();
      this.scene.launch('DrivingGame', {
        config,
        playerState: this.reg.playerState,
        parentSceneKey: 'GameScene',
        destination: dest,
      });
      return;
    }

    if (gameId === 'mow') {
      const config: MiniGameConfig = {
        id: 'mow',
        type: 'custom',
        name: 'Mow the Lawn',
        description: 'Mow in straight lines! Sobriety affects steering.',
        difficulty: {
          speed: 0.5,
          precision: 0.5,
          duration: 60,
          wobble: 0.2,
        },
        rewards: [],
        penalties: [],
      };

      this.scene.pause();
      this.scene.launch('MowGame', {
        config,
        playerState: this.reg.playerState,
        parentSceneKey: 'GameScene',
      });
    } else if (gameId.startsWith('haggle_')) {
      // Haggle minigame — sell stolen items for cash.
      // Pick item list by haggle source (fence, pawn, tony, etc.)
      const haggleItems: Record<string, Array<{ label: string; basePrice: number }>> = {
        haggle_fence: [
          { label: "Someone's laptop (no password)", basePrice: 120 },
          { label: "'Decorative vase' (definitely stolen)", basePrice: 200 },
          { label: "Pink scooter (kid's?)", basePrice: 80 },
        ],
        haggle_pawn: [
          { label: "Grandpa's wedding ring", basePrice: 180 },
          { label: "Busted PlayStation", basePrice: 60 },
        ],
        haggle_tony: [
          { label: "Rolex (probably fake)", basePrice: 250 },
          { label: "Box of iPhone 11s", basePrice: 400 },
          { label: "Rare baseball card", basePrice: 150 },
        ],
      };
      const items = haggleItems[gameId] ?? haggleItems.haggle_fence;
      const config: MiniGameConfig = {
        id: gameId,
        type: 'custom',
        name: 'Haggle',
        description: 'Lock in the best price before they walk.',
        difficulty: { speed: 0.5, precision: 0.5, duration: 600, wobble: 0 },
        rewards: [],
        penalties: [],
      };
      this.scene.pause();
      this.scene.launch('HaggleGame', {
        config,
        playerState: this.reg.playerState,
        parentSceneKey: 'GameScene',
        items,
      });
    } else if (gameId === 'grill') {
      console.debug('[launchMinigame] grill launching', {
        grillStatus: this.reg.playerState.state.flags.grillStatus,
        boughtCharcoal: this.reg.playerState.state.flags.boughtCharcoal,
      });
      const config: MiniGameConfig = {
        id: 'grill',
        type: 'timing',
        name: 'Grill Game',
        description: 'Flip the burgers at the right time!',
        difficulty: { speed: 0.5, precision: 0.4, duration: 15, wobble: 0.2 },
        rewards: [
          { type: 'flag', field: 'grillStatus', value: 'done' },
          { type: 'flag', field: 'grilledPerfectly', value: true },
          { type: 'add', field: 'reputation', value: 15 },
        ],
        penalties: [
          { type: 'flag', field: 'grillStatus', value: 'burnt' },
          { type: 'flag', field: 'burnedBurgers', value: true },
          { type: 'add', field: 'reputation', value: -10 },
        ],
      };
      this.scene.pause();
      this.scene.launch('GrillGame', {
        config,
        playerState: this.reg.playerState,
        parentSceneKey: 'GameScene',
      });
    } else {
      console.warn('[launchMinigame] fallback to GrillGame for unknown gameId:', gameId);
      const config: MiniGameConfig = {
        id: gameId,
        type: 'timing',
        name: 'Grill Game',
        description: 'Flip the burgers at the right time!',
        difficulty: {
          speed: 0.5,
          precision: 0.4,
          duration: 15,
          wobble: 0.2,
        },
        rewards: [
          { type: 'flag', field: 'grillStatus', value: 'done' },
          { type: 'flag', field: 'grilledPerfectly', value: true },
          { type: 'add', field: 'reputation', value: 15 },
        ],
        penalties: [
          { type: 'flag', field: 'grillStatus', value: 'burnt' },
          { type: 'flag', field: 'burnedBurgers', value: true },
          { type: 'add', field: 'reputation', value: -10 },
        ],
      };

      this.scene.pause();
      this.scene.launch('GrillGame', {
        config,
        playerState: this.reg.playerState,
        parentSceneKey: 'GameScene',
      });
    }
  }

  private handleMinigameResult(result: { gameId: string; result: 'success' | 'failure' }): void {
    this.player.unfreeze();

    if (result.gameId.startsWith('drive_')) {
      const dest = this.driveDestinations[result.gameId];
      if (!dest) return;

      // Special case: drive_race (stoplight race vs Modded Car Guy)
      if (result.gameId === 'drive_race') {
        this.reg.timeClock.advance(dest.timeCost);
        if (result.result === 'success') {
          const currentCash = (this.reg.playerState.state.flags.cash as number) ?? 0;
          this.reg.playerState.state.flags.cash = currentCash + 30;
          this.showInspectText("The minivan LAUNCHES. Something falls off the undercarriage. You don't care. You WIN. The Civic guy hands over thirty bucks, stunned.");
        } else {
          const currentCash = (this.reg.playerState.state.flags.cash as number) ?? 0;
          this.reg.playerState.state.flags.cash = Math.max(0, currentCash - 30);
          this.reg.playerState.state.flags.injury = true;
          this.showInspectText("You clip a curb mid-race, bang your elbow on the door frame, and eat thirty bucks. The Civic guy is already a dot on the horizon.");
        }
        // Stay at gas_station — no scene change
        if (this.currentSceneData) this.drawBackground(this.currentSceneData);
        return;
      }

      if (result.result === 'success') {
        const pulledOverAt = this.reg.playerState.state.flags.pulledOverAt as string | undefined;
        const finalDestination = pulledOverAt || dest.sceneId;
        delete this.reg.playerState.state.flags.pulledOverAt;
        this.reg.timeClock.advance(dest.timeCost);
        // Mountains drive: you were actively drinking/smoking, no sobriety recovery.
        if (result.gameId !== 'drive_mountains') {
          this.reg.playerState.recoverSobriety(dest.timeCost);
        }
        this.loadLocation(finalDestination);
      } else {
        this.reg.timeClock.advance(dest.timeCost + 30);
        this.reg.playerState.applyEffect({ type: 'add', field: 'suspicion', value: 10 });
        this.reg.playerState.state.flags.injury = true;
        if (this.currentSceneData) {
          this.drawBackground(this.currentSceneData);
        }
        this.showInspectText("You wake up by the side of the road. The minivan is in a ditch. Your shoulder aches. This is fine.");
      }
      return;
    }

    if (result.gameId === 'mow') {
      // Mow results are set directly by MowGame (mowQuality, lawnStatus, crooked_mow)
      // Add time cost for mowing — 2 hours (suburban dad reality)
      this.reg.timeClock.advance(120);
      this.reg.playerState.recoverSobriety(120);
    } else if (result.gameId.startsWith('haggle_')) {
      // Haggle — apply earnings to cash and show inspect text with summary
      const earnings = (this.reg.playerState.state.flags.haggleEarnings as number) ?? 0;
      const currentCash = (this.reg.playerState.state.flags.cash as number) ?? 0;
      this.reg.playerState.state.flags.cash = currentCash + earnings;
      if (earnings >= 400) {
        this.reg.playerState.state.flags.cash_bulge = true;
      }
      this.reg.timeClock.advance(20);
      const flavor: Record<string, [string, string]> = {
        haggle_fence: [
          `You pocket $${earnings}. The fence slaps the hood of his Buick. 'Pleasure doin' business, khakis.'`,
          `You came out empty-handed. The fence is already on his phone to someone more reliable.`,
        ],
        haggle_pawn: [
          `You pocket $${earnings}. The pawnbroker signs the receipt. 'Come back when you've got more grandpas, chief.'`,
          `You walked out with less dignity than you walked in with. The pawnbroker's crossword is still on HUBRIS.`,
        ],
        haggle_tony: [
          `You pocket $${earnings}. Tony nods. 'Knew you had it in you, Khaki King.'`,
          `Tony's pinkie ring glints as he shrugs. 'Next time, chief. Next time.'`,
        ],
      };
      const [winMsg, loseMsg] = flavor[result.gameId] ?? flavor.haggle_fence;
      this.showInspectText(earnings > 0 ? winMsg : loseMsg);
      delete this.reg.playerState.state.flags.haggleEarnings;
    } else {
      // Grill game
      if (result.result === 'success') {
        this.reg.playerState.state.flags['grillStatus'] = 'done';
        this.reg.playerState.state.flags['grilledPerfectly'] = true;
        this.reg.playerState.state.reputation = Math.min(100,
          this.reg.playerState.state.reputation + 15);
      } else {
        this.reg.playerState.state.flags['grillStatus'] = 'burnt';
        this.reg.playerState.state.flags['burnedBurgers'] = true;
        this.reg.playerState.state.reputation = Math.max(0,
          this.reg.playerState.state.reputation - 10);
      }
    }

    // Redraw background to show updated state (lawn stripes, grill, etc.)
    if (this.currentSceneData) {
      this.drawBackground(this.currentSceneData);
    }
  }

  // ── Game flow checks ──────────────────────────────────────

  private checkGameFlow(): void {
    const state = this.reg.playerState.state;

    // Force BBQ at 5pm
    if (this.reg.timeClock.isBBQTime && !this.forcedBBQ) {
      this.forcedBBQ = true;
      if (state.currentLocation !== 'bbq') {
        this.hideDialogue();
        this.loadLocation('bbq');
        return;
      }
    }

    // Force home at 4:30pm
    if (this.reg.timeClock.isForceHomeTime && !this.forcedBBQ) {
      const scene = this.sceneDataMap[state.currentLocation];
      if (scene && !scene.isHome) {
        this.hideDialogue();
        this.loadLocation('frontyard');
        return;
      }
    }

    // Confrontation at suspicion >= 60 — only when player actually gets home.
    // Karen can't confront you while you're still at the gas station.
    const home = state.currentLocation === 'frontyard' || state.currentLocation === 'kitchen';
    if (home && state.suspicion >= 60 && !this.confrontationFired && !this.dialogueActive) {
      this.confrontationFired = true;
      const tree = this.dialogueMap['confrontation'];
      if (tree) {
        this.player.freeze();
        this.reg.dialogueEngine.start(tree);
      }
    }

    // BBQ director: fire scripted act-beats based on state at BBQ
    this.reg.bbqDirector.check();
  }

  private checkWifeTexts(): void {
    this.reg.wifeTexts.check();
  }

  // ── HUD ───────────────────────────────────────────────────

  private createHUD(): void {
    const barHeight = 8;
    const barWidth = 100;

    // HUD background
    const hudBg = this.add.rectangle(SCREEN_W / 2, 28, SCREEN_W, 56, 0x000000, 0.85)
      .setDepth(50);
    this.hudGroup.add(hudBg);

    const D = 51;

    // Time display (left)
    this.timeText = this.add.text(16, 8, '7:00 AM', {
      fontSize: '18px',
      color: '#f5c542',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setDepth(D);
    this.hudGroup.add(this.timeText);

    // Location name
    this.locationText = this.add.text(16, 32, '', {
      fontSize: '11px',
      color: '#808090',
      fontFamily: 'monospace',
    }).setDepth(D);
    this.hudGroup.add(this.locationText);

    // Center info: Lawn + Grill + Cash
    this.lawnText = this.add.text(240, 8, 'Lawn: 0%', {
      fontSize: '11px',
      color: '#6aae4a',
      fontFamily: 'monospace',
    }).setDepth(D);
    this.hudGroup.add(this.lawnText);

    this.grillText = this.add.text(240, 24, 'Grill: cold', {
      fontSize: '11px',
      color: '#d48a30',
      fontFamily: 'monospace',
    }).setDepth(D);
    this.hudGroup.add(this.grillText);

    this.cashText = this.add.text(240, 40, '$60', {
      fontSize: '11px',
      color: '#66cc66',
      fontFamily: 'monospace',
    }).setDepth(D);
    this.hudGroup.add(this.cashText);

    // Meter bars — right side
    const metersX = SCREEN_W - 130;

    // Sobriety
    this.add.text(metersX - 4, 8, 'SOB', { fontSize: '9px', color: '#66aa66', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(D);
    this.sobrietyBar = this.add.rectangle(metersX + barWidth / 2, 14, barWidth, barHeight, 0x333333).setDepth(D);
    this.sobrietyFill = this.add.rectangle(metersX, 14, barWidth, barHeight, 0x66aa66).setOrigin(0, 0.5).setDepth(D);
    this.hudGroup.add(this.sobrietyBar);
    this.hudGroup.add(this.sobrietyFill);

    // Suspicion
    this.add.text(metersX - 4, 22, 'SUS', { fontSize: '9px', color: '#aa4444', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(D);
    this.suspicionBar = this.add.rectangle(metersX + barWidth / 2, 28, barWidth, barHeight, 0x333333).setDepth(D);
    this.suspicionFill = this.add.rectangle(metersX, 28, 0, barHeight, 0xaa4444).setOrigin(0, 0.5).setDepth(D);
    this.hudGroup.add(this.suspicionBar);
    this.hudGroup.add(this.suspicionFill);

    // Energy
    this.add.text(metersX - 4, 36, 'ENRG', { fontSize: '9px', color: '#4488cc', fontFamily: 'monospace' }).setOrigin(1, 0).setDepth(D);
    this.energyBar = this.add.rectangle(metersX + barWidth / 2, 42, barWidth, barHeight, 0x333333).setDepth(D);
    this.energyFill = this.add.rectangle(metersX, 42, barWidth * 0.8, barHeight, 0x4488cc).setOrigin(0, 0.5).setDepth(D);
    this.hudGroup.add(this.energyBar);
    this.hudGroup.add(this.energyFill);
  }

  private updateHUD(): void {
    const state = this.reg.playerState.state;
    const barWidth = 100;

    this.timeText.setText(this.reg.timeClock.displayTime);
    this.sobrietyFill.width = (state.sobriety / 100) * barWidth;
    this.suspicionFill.width = (state.suspicion / 100) * barWidth;
    this.energyFill.width = (state.energy / 100) * barWidth;

    // Lawn status
    const lawn = (state.flags.lawnStatus as number) ?? 0;
    this.lawnText.setText(`Lawn: ${Math.round(lawn)}%`);
    if (lawn >= 95) this.lawnText.setColor('#33ff33');
    else if (lawn >= 60) this.lawnText.setColor('#6aae4a');
    else this.lawnText.setColor('#aa6644');

    // Grill status
    const grill = (state.flags.grillStatus as string) ?? 'not_started';
    const grillLabels: Record<string, string> = {
      not_started: 'Grill: cold',
      supplies_bought: 'Grill: charcoal ready',
      prepped: 'Grill: coals hot',
      cooking: 'Grill: COOKING',
      done: 'Grill: DONE!',
      burnt: 'Grill: BURNT',
    };
    this.grillText.setText(grillLabels[grill] ?? `Grill: ${grill}`);
    if (grill === 'done') this.grillText.setColor('#33ff33');
    else if (grill === 'burnt') this.grillText.setColor('#ff3333');
    else this.grillText.setColor('#d48a30');

    // Cash
    const cash = (state.flags.cash as number) ?? 0;
    this.cashText.setText(`$${cash}`);

    // Color warnings
    if (state.sobriety < 30) this.sobrietyFill.setFillStyle(0xff4444);
    else this.sobrietyFill.setFillStyle(0x66aa66);

    if (state.suspicion > 70) this.suspicionFill.setFillStyle(0xff2222);
    else this.suspicionFill.setFillStyle(0xaa4444);

    if (state.energy < 20) this.energyFill.setFillStyle(0xff6644);
    else this.energyFill.setFillStyle(0x4488cc);

    // Redraw scene when state changes (for grill visual, lawn stripes, etc.)
    if (this.currentSceneData) {
      this.drawBackground(this.currentSceneData);
    }
  }

  // ── Wife text toasts ──────────────────────────────────────

  private queueToast(msg: WifeMessage): void {
    this.toastQueue.push(msg);
    if (!this.activeToast) {
      this.showNextToast();
    }
  }

  private showNextToast(): void {
    if (this.toastQueue.length === 0) {
      this.activeToast = null;
      return;
    }

    const msg = this.toastQueue.shift()!;

    // Format time
    const h = Math.floor(msg.time / 60);
    const m = msg.time % 60;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const timeStr = `${dh}:${m.toString().padStart(2, '0')} ${suffix}`;

    const container = this.add.container(SCREEN_W / 2, -50).setDepth(200);

    // Background
    const bg = this.add.rectangle(0, 0, 360, 44, 0x2a1a2e, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.6);
    container.add(bg);

    // Pink avatar
    const avatar = this.add.rectangle(-165, 0, 26, 26, 0xff69b4);
    container.add(avatar);

    const avatarLetter = this.add.text(-165, 0, 'K', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(avatarLetter);

    // Message
    const bodyText = this.add.text(-145, -8, msg.body, {
      fontSize: '11px', color: '#e0d0e0', fontFamily: 'monospace',
      wordWrap: { width: 260 },
    }).setOrigin(0, 0);
    container.add(bodyText);

    // Timestamp
    const stamp = this.add.text(170, -8, timeStr, {
      fontSize: '9px', color: '#808090', fontFamily: 'monospace',
    }).setOrigin(1, 0);
    container.add(stamp);

    this.activeToast = container;

    // Slide in
    this.tweens.add({
      targets: container,
      y: 80,
      duration: 400,
      ease: 'Back.easeOut',
    });

    // Auto-dismiss after 4 seconds
    this.toastTimer = this.time.delayedCall(4000, () => {
      this.tweens.add({
        targets: container,
        y: -60,
        duration: 300,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          container.destroy();
          this.activeToast = null;
          this.showNextToast();
        },
      });
    });
  }

  // ── Dialogue overlay ──────────────────────────────────────

  /**
   * Map the `speaker` field from dialogue JSON to an NPC registry ID.
   * Accepts variations in casing and punctuation.
   */
  private speakerToNpcId(speaker: string): string | null {
    const s = speaker.trim().toLowerCase();
    const map: Record<string, string> = {
      'doug': 'doug',
      'craig': 'craig',
      'kevin': 'kevin',
      'karen': 'karen',
      'brenda': 'brenda',
      'mother-in-law': 'mil',
      'mil': 'mil',
      'barb': 'mil',
      'the girls': 'the_girls',
      'girls': 'the_girls',
      'the kid': 'the_kid',
      'kid': 'the_kid',
      'quikstop teen': 'quikstop_teen',
      'teen': 'quikstop_teen',
      'modded car guy': 'modded_car_guy',
      'race guy': 'modded_car_guy',
      'sharon': 'sharon',
      'tracksuit guy': 'tracksuit_guy',
      'fence guy': 'fence_guy',
      'fence': 'fence_guy',
      'warehouse guy': 'warehouse_guy',
      'crackhead': 'crackhead_guy',
      'dad': 'dad',
      'you': 'dad',
      // Strip club
      'bouncer': 'bouncer',
      'bartender': 'bartender_club',
      'amber': 'amber',
      'candi': 'candi',
      'destiny': 'destiny',
      'tony': 'tony',
      // Trap house
      'dealer': 'dealer',
      'jim': 'crackhead_jim',
      'crackhead jim': 'crackhead_jim',
      'rayray': 'tweaker_rayray',
      'ray-ray': 'tweaker_rayray',
      'ray ray': 'tweaker_rayray',
      'tweaker rayray': 'tweaker_rayray',
      'trina': 'trina',
      // Store clerk
      'clerk': 'clerk',
    };
    return map[s] ?? null;
  }

  /** Map current state → emotion override for the portrait (mouth/eyes). */
  private portraitEmotion(node: DialogueNode): Partial<{ mouth: string; eyes: string; eyebrows: string }> {
    const text = node.text.toLowerCase();
    const out: Partial<{ mouth: string; eyes: string; eyebrows: string }> = {};
    if (/\byell|shout|!+|screams?\b|SCREAM/i.test(node.text)) {
      out.mouth = 'shock'; out.eyes = 'wide'; out.eyebrows = 'angry';
    } else if (/laugh|grin|smile|hah/.test(text)) {
      out.mouth = 'grin'; out.eyebrows = 'raised';
    } else if (/frown|sigh|disappoint/.test(text)) {
      out.mouth = 'frown'; out.eyebrows = 'worried';
    } else if (/whisper|lean in|quiet/.test(text)) {
      out.mouth = 'smirk';
    } else if (/wink|nod|'sup|chill/.test(text)) {
      out.mouth = 'smirk';
    }
    return out;
  }

  private redrawPortrait(node: DialogueNode): void {
    this.dialoguePortraitGfx.clear();
    const npcId = node.speaker ? this.speakerToNpcId(node.speaker) : null;
    if (!npcId) {
      this.dialoguePortraitFrame.setVisible(false);
      return;
    }
    this.dialoguePortraitFrame.setVisible(true);
    const base = getNpcConfig(npcId);
    // Explicit beat/node emotion wins; fall back to heuristic
    const explicit = {
      mouth: (node as DialogueNode).mouth,
      eyes: (node as DialogueNode).eyes,
      eyebrows: (node as DialogueNode).eyebrows,
    };
    const heuristic = this.portraitEmotion(node);
    const emotion = {
      mouth: explicit.mouth ?? heuristic.mouth,
      eyes: explicit.eyes ?? heuristic.eyes,
      eyebrows: explicit.eyebrows ?? heuristic.eyebrows,
    };
    // Portrait is drawn inside a 64x64 frame positioned at bottom-left of dialogue
    // Character is drawn at 1.4x scale so the upper half (head+torso) fills the frame
    const portraitCenterX = 46;
    const portraitFeetY = SCREEN_H - 10;
    const cfg = {
      x: portraitCenterX,
      y: portraitFeetY,
      sz: 1.4,
      ...base,
      ...emotion,
      // Hide the in-hand beer/items in portrait for clarity
      beer: false,
      item: undefined,
    };
    drawCharacter(this.dialoguePortraitGfx, cfg as Parameters<typeof drawCharacter>[1]);
  }

  private createDialogueOverlay(): void {
    const panelH = 95;
    const panelY = SCREEN_H - panelH / 2;
    const DD = 100;

    this.dialoguePanel = this.add.rectangle(SCREEN_W / 2, panelY, SCREEN_W - 24, panelH, 0x0a0a1e, 0.72)
      .setStrokeStyle(1, 0xf5c542, 0.4)
      .setDepth(DD)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    // Click anywhere on the dialogue panel to advance. Advance steps through
    // beats even when choices are visible — the choices remain on-screen for
    // the player to pick at any time, but the panel-click / ENTER also lets
    // them read more intro beats without touching the choices.
    this.dialoguePanel.on('pointerdown', () => {
      if (!this.dialogueActive) return;
      // If the continue text says "done", this is an end node — close dialogue.
      if (this.dialogueContinue.text.includes('done') && this.dialogueChoices.length === 0) {
        this.reg.dialogueEngine.end();
      } else {
        this.reg.dialogueEngine.advance();
      }
    });

    // Portrait frame — 64x80 box at the bottom-left of the dialogue panel
    this.dialoguePortraitFrame = this.add.rectangle(46, SCREEN_H - panelH / 2, 64, panelH - 8, 0x1a1a2e, 0.95)
      .setStrokeStyle(1, 0xf5c542, 0.6)
      .setDepth(DD + 1)
      .setVisible(false);

    // Portrait character graphics (drawn via CharacterRenderer)
    this.dialoguePortraitGfx = this.add.graphics()
      .setDepth(DD + 2)
      .setVisible(false);

    // Shift speaker/text to the right to leave room for the portrait (48px + 12 margin = 60)
    const textLeftX = 86;

    this.dialogueSpeaker = this.add.text(textLeftX, SCREEN_H - panelH + 6, '', {
      fontSize: '12px',
      color: '#f5c542',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setDepth(DD + 1).setVisible(false);

    this.dialogueText = this.add.text(textLeftX, SCREEN_H - panelH + 20, '', {
      fontSize: '11px',
      color: '#d0d0e0',
      fontFamily: 'Georgia, serif',
      wordWrap: { width: SCREEN_W - textLeftX - 32 },
      lineSpacing: 2,
    }).setDepth(DD + 1).setVisible(false);

    this.dialogueContinue = this.add.text(SCREEN_W - 20, SCREEN_H - 8, '▶ click or press ENTER', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      backgroundColor: '#a07020',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 1).setDepth(DD + 1).setVisible(false).setInteractive({ useHandCursor: true });

    this.dialogueContinue.on('pointerdown', () => {
      this.reg.dialogueEngine.advance();
    });

    this.dialogueGroup.add(this.dialoguePanel);
    this.dialogueGroup.add(this.dialoguePortraitFrame);
    this.dialogueGroup.add(this.dialoguePortraitGfx);
    this.dialogueGroup.add(this.dialogueSpeaker);
    this.dialogueGroup.add(this.dialogueText);
    this.dialogueGroup.add(this.dialogueContinue);
  }

  private showDialogueNode(node: DialogueNode, choices: DialogueChoice[], isEnd: boolean): void {
    this.dialogueActive = true;
    // NOTE: player is NOT frozen — dialogue is a non-intrusive overlay.
    // The player can keep walking around and even engage other zones, which
    // cleanly closes this dialogue and opens the new one. Interaction zone
    // prompts stay visible so the player can see their options.

    this.dialoguePanel.setVisible(true);
    this.dialogueSpeaker.setVisible(true);
    this.dialogueText.setVisible(true);
    this.dialoguePortraitGfx.setVisible(true);

    this.dialogueSpeaker.setText(node.speaker || '');
    this.dialogueText.setText(node.text);
    this.redrawPortrait(node);

    // Clear old choices
    this.dialogueChoices.forEach(c => c.destroy());
    this.dialogueChoices = [];
    this.dialogueContinue.setVisible(false);

    if (choices.length > 0) {
      // Bottom-anchor the choice list so it grows upward when there are many options,
      // keeping everything inside the panel bounds regardless of count.
      const n = choices.length;
      const lineH = 16;
      const choicesHeight = n * lineH;
      const choiceStartY = SCREEN_H - 10 - choicesHeight;

      choices.forEach((choice, i) => {
        // Yellow "[#]" prefix makes choices visually pop and hints at keyboard shortcut
        const prefix = `[${i + 1}] `;
        const choiceText = this.add.text(92, choiceStartY + i * lineH, prefix + choice.text, {
          fontSize: '12px',
          color: '#f5c542',
          fontFamily: 'Georgia, serif',
          fontStyle: 'bold',
        }).setDepth(101).setInteractive({ useHandCursor: true });

        choiceText.on('pointerover', () => choiceText.setColor('#ffffff'));
        choiceText.on('pointerout', () => choiceText.setColor('#f5c542'));
        choiceText.on('pointerdown', () => {
          console.debug('[dialogue] choice clicked:', i, choice.text);
          this.reg.dialogueEngine.selectChoice(i);
        });

        this.dialogueChoices.push(choiceText);
        this.dialogueGroup.add(choiceText);
      });
    } else if (!isEnd) {
      this.dialogueContinue.setVisible(true);
    } else {
      this.dialogueContinue.setText('▶ done — click to close').setVisible(true);
      this.dialogueContinue.removeAllListeners('pointerdown');
      this.dialogueContinue.on('pointerdown', () => {
        this.reg.dialogueEngine.end();
      });
    }
  }

  private hideDialogue(): void {
    this.dialogueActive = false;
    // Player was never frozen for dialogue — nothing to unfreeze here.

    this.dialoguePanel.setVisible(false);
    this.dialogueSpeaker.setVisible(false);
    this.dialogueText.setVisible(false);
    this.dialogueContinue.setVisible(false);
    this.dialoguePortraitFrame.setVisible(false);
    this.dialoguePortraitGfx.setVisible(false);
    this.dialoguePortraitGfx.clear();
    this.dialogueContinue.setText('▶ click or press ENTER');
    this.dialogueContinue.removeAllListeners('pointerdown');
    this.dialogueContinue.on('pointerdown', () => {
      this.reg.dialogueEngine.advance();
    });
    this.dialogueChoices.forEach(c => c.destroy());
    this.dialogueChoices = [];
  }

  private showInspectText(text: string): void {
    this.showDialogueNode(
      { id: '_inspect', text, speaker: '' } as DialogueNode,
      [],
      true,
    );
    this.dialogueActive = true;
  }
}
