# Suburban Dad — Full Action Catalog

Use this while manually testing. Every scene, every NPC, every minigame, every scripted event the game fires — with their trigger conditions.

## How to use

- See also [`TEST_PLAN.md`](./TEST_PLAN.md) for a test checklist.
- Open browser console on the live game → type `dev.help()` for debug commands.
- Quick jumps:
  ```js
  dev.jumpTo("trap_house")          // teleport
  dev.setTime(1020)                 // 5 PM — BBQ time
  dev.setCash(500)
  dev.setVice("drugs", 2)
  dev.grantStripper()
  dev.grantTrap()
  dev.triggerBBQ()
  dev.triggerEnding()
  dev.state()                       // dump state
  ```

---

## 1 — Scenes (alphabetical)

Every reachable scene and every zone inside it. `→` = scene transition, `D:` = dialogue zone, `M:` = minigame zone, `I:` = inspect zone.

### `backyard` — Backyard
- **Enter**: edge-left from `frontyard` (5m), edge-right from `garage` (5m)
- **enterDialogue**: `backyard_hub`
- **Zones**:
  - D: Grill — `backyard_grill`
  - D: Patio Chair — `backyard_sit`

### `bbq` — BBQ (climax scene)
- **Enter**: auto-triggered at 1020min (5 PM) from anywhere
- **enterDialogue**: `bbq_hub`
- **Zones**:
  - D: Mother-in-Law — `bbq_mil`
  - D: Doug — `bbq_doug`
  - D: Grill — `bbq_grill`
  - D: Karen — `bbq_karen`
  - D: Kevin — `kevin_pitch` (visible when `vices.pyramid >= 1`)
  - D: Craig — `bbq_craig` (visible when `vices.guns >= 1`)
  - D: Neighbor — `bbq_neighbor`
- **BBQDirector fires scripted beats** at 15-min slots from 1020–1125. See Section 4.

### `craigs` — Craig's Place
- **Enter**: via `sidewalk.craigs_house` zone (5m)
- **enterDialogue**: `craigs_hub`
- **Zones**:
  - D: Craig — `craigs_guns` (visible when `currentTime >= 690`)
  - I: Boxes — conditional text based on `vices.guns`
- **Edges**: ← `sidewalk` (5m)

### `dougs` — Doug's House
- **Enter**: via `frontyard.dougs_house` zone (10m)
- **enterDialogue**: `dougs_hub`
- **Zones**:
  - D: Doug — `dougs_alcohol` (drinks + poker entry point)
  - I: Cooler — conditional on sobriety / `vices.alcohol`
  - **D: Poker Table** — `dougs_gambling_t2` (NEW — visible when `vices.gambling >= 1`)
- **Edges**: ← `frontyard` (10m)

### `frontyard` — Front Yard
- **Enter**: game start, edge-right from `backyard`, edge-left from `sidewalk`, and as a scene-transition target from lots of places
- **enterDialogue**: `frontyard_hub`
- **Zones**:
  - M: Lawn Mower — `mow` (visible when `flags.lawnStatus < 100`)
  - D: Minivan — `frontyard_drive` (hub for all 6 drive destinations)
  - →: Front Door — `kitchen` (3m)
  - →: Doug's House — `dougs` (10m)
- **Edges**: ← `backyard` (5m), → `sidewalk` (5m)

### `garage` — Garage
- **Enter**: edge-right from `kitchen` (3m), edge-left from `backyard` (5m)
- **enterDialogue**: `garage_enter`
- **Zones**:
  - D: Workbench — `garage_workbench` (rummage → find weed → bong hit)
  - D: Mini Fridge — `garage_fridge` (drink up to 6 beers, progression to `maxed`)
  - D: Patio Chair — `garage_chair` (nap/rest/think based on state)

### `gas_station` — Gas Station
- **Enter**: drive (`MINIGAME:drive_gas_station`), edge-right from `quikstop` (5m)
- **enterDialogue**: `gas_station_hub`
- **Zones**:
  - D: Minivan — `frontyard_drive`
  - D: Modded Car — `gas_racing` → `MINIGAME:drive_race`
  - I: Gas Pump — conditional on cash / sobriety
  - D: Phone Booth — `gas_prostitution` (Sharon)
  - **D: The Motel** — `gas_prostitution_t2` (NEW — visible when `vices.prostitution >= 1 AND suspicion < 70`)
  - →: Store — `gas_station_store` (1m)
  - D: Kevin — `kevin_pitch` (visible when `vices.pyramid >= 1`)
- **Edges**: ← `quikstop` (5m)

### `gas_station_store` — Inside the Gas Station
- **Enter**: scene transition from `gas_station.gas_store`
- **enterDialogue**: (none)
- **Zones**:
  - D: Clerk — `gas_station_store` (buy charcoal/ice/30-rack/smokes/lotto)
  - I: Beer Cooler — conditional on `flags.has30Rack`
  - I: Snacks
  - →: Exit — `gas_station` (1m)

### `girls_apartment` — The Girls' Apartment
- **Enter**: exitScene from `sidewalk_drugs.t1` (the drug acceptance)
- **enterDialogue**: `girls_apartment_hub`
- **Zones**:
  - D: The Girls (couch) — `girls_apartment_hub` (bong hit, can escalate to trap house)
  - →: Exit — `sidewalk` (5m)

### `highway` — Foot of the Mountains
- **Enter**: `MINIGAME:drive_mountains` (requires `flags.has30Rack`), edge-left from `gas_station`
- **enterDialogue**: `highway_hub`
- **Zones**:
  - D: Minivan — `frontyard_drive`
  - D: Road — `gas_racing_t2` → `MINIGAME:drive_race`
  - D: Mountain View — `mountain_view` (flavor, conditional on state)
- **Edges**: ← `gas_station` (10m)

### `kevins` — Kevin's Place
- **Enter**: via `sidewalk.kevins_house` zone (5m)
- **enterDialogue**: `kevins_hub`
- **Zones**:
  - D: Kevin — `kevins_pyramid` (ELEVATÉ pitch)
  - I: Whiteboard — flavor text
  - **D: Meet the Upline** — `kevins_pyramid_t2` (NEW — visible when `vices.pyramid >= 1`)
- **Edges**: ← `sidewalk` (5m)

### `kids_porch` — The Kid's Porch
- **Enter**: via `sidewalk.kids_house` zone (5m)
- **enterDialogue**: `kids_porch_hub`
- **Zones**:
  - D: The Kid — `kids_digital` (visible when `currentTime >= 720`)
  - I: Energy Cans — conditional on `vices.drugs`
  - **D: The Big One** — `kids_digital_t2` (NEW — visible when `vices.digital >= 1 AND currentTime >= 780`)
- **Edges**: ← `sidewalk` (5m)

### `kitchen` — Kitchen
- **Enter**: game start, or edge-right from `frontyard` (5m), edge-left from `garage` (3m)
- **enterDialogue**: `kitchen_hub`
- **Zones**:
  - I: Fridge Note — "CHARCOAL (KINGSFORD!), BUNS, LAWN. PARTY AT 5. ♥ —K"
  - I: Coffee Maker — flavor

### `quikstop` — Quik Stop
- **Enter**: `MINIGAME:drive_quikstop`, edge-right from `sidewalk` (10m), edge-left from `gas_station` (5m)
- **enterDialogue**: `quikstop_hub`
- **Zones**:
  - D: Minivan — `frontyard_drive`
  - D: Store — `quikstop_buy` (charcoal)
  - D: Dumpster — `quikstop_theft` (the duffel bag — +$150)
  - I: Teen (vaping)
  - D: Kevin — `kevin_pitch` (visible when `vices.pyramid >= 1`)
- **Edges**: ← `sidewalk` (10m), → `gas_station` (5m)

### `sidewalk` — The Sidewalk
- **Enter**: edge-right from `frontyard`, edge-left from `quikstop`, exit from `girls_apartment`, exit from `trap_house` etc.
- **enterDialogue**: `sidewalk_hub`
- **Zones**:
  - D: The Girls — `sidewalk_drugs` (visible when `currentTime >= 570`) — leads to `girls_apartment`
  - →: Craig's Place — `craigs` (5m)
  - →: Kevin's Place — `kevins` (5m)
  - →: Kid's Porch — `kids_porch` (5m)
- **Edges**: ← `frontyard` (5m), → `quikstop` (10m)

### `sketchy` — Sketchy End of Town
- **Enter**: `MINIGAME:drive_sketchy`, edge-left from `quikstop` (15m)
- **enterDialogue**: `sketchy_hub`
- **Zones**:
  - D: Minivan — `frontyard_drive`
  - D: Fence Guy — `quikstop_theft_t2` → `MINIGAME:haggle_fence`
  - D: Warehouse — `craigs_guns_t2` (visible when `vices.guns >= 2`)
- **Edges**: ← `quikstop` (15m)

### `strip_club` — Club Purrrple
- **Enter**: dialogue `strip_club_enter` → pay cover → enter from `strip_mall`
- **enterDialogue**: `strip_club_hub`
- **Zones**:
  - D: Bartender — `strip_club_bartender` ($15 whiskey)
  - D: Tony — `strip_club_tony` (3-card monte + haggle pivot)
  - D: Amber (stage) — `strip_club_dancer`
  - →: VIP Back Room — `strip_club_vip` (5m)
  - →: Exit — `strip_mall` (5m)

### `strip_club_vip` — VIP Back Room
- **Enter**: scene transition from `strip_club.vip_curtain` OR dialogue exit from `strip_club_dancer.to_vip`
- **enterDialogue**: `strip_club_vip`
- **Zones**:
  - D: Amber — `strip_club_vip` (watch / talk / break a rule / chicken out)

### `strip_mall` — Strip Mall
- **Enter**: `MINIGAME:drive_strip_mall`, edge-right from `sidewalk` (10m)
- **enterDialogue**: `strip_mall_hub`
- **Zones**:
  - D: Minivan — `frontyard_drive`
  - D: Alley — `sidewalk_drugs_t2` → exits to `trap_house`
  - I: Karate Dojo — "The sensei is 19."
  - D: Pawn Shop — `pawn_shop` → `MINIGAME:haggle_pawn`
  - D: Club Purrrple — `strip_club_enter` (visible when `currentTime >= 540`)
- **Edges**: ← `sidewalk` (10m)

### `trap_house` — The Trap House
- **Enter**: exitScene from `girls_apartment_hub` OR `sidewalk_drugs_t2.t2`
- **enterDialogue**: `trap_house_hub`
- **Zones**:
  - D: Dealer — `trap_dealer` (smoke crack / buy stash / shakedown)
  - D: Jim — `trap_jim` (flavor, Jim stares)
  - D: Trina — `trap_trina` (couch hit)
  - D: RayRay — `trap_rayray` (invite to BBQ — BBQ CALLBACK KEY)
  - →: Exit — `sidewalk` (10m)

---

## 2 — Dialogues

Compact table. "→" = exitScene. "M:" = launches minigame. Flags in **bold** are evidence flags that BBQ NPCs react to.

| Dialogue | Triggered by | Exits / Launches | Key effects |
|---|---|---|---|
| `backyard_grill` | backyard.backyard_grill | — | grillStatus tracking |
| `backyard_sit` | backyard.patio_chair | — | energy / sobriety recovery |
| `bbq_arrival_*` | BBQDirector 1020 | — | arrival flavor |
| `bbq_amber_arrives` | BBQDirector 1035/1080 | — | amber callback + suspicion |
| `bbq_cops_raid` | BBQDirector 1095/1110 | — | flags.cops_arrived |
| `bbq_craig` | bbq.bbq_craig | — | reputation mods |
| `bbq_doug` | bbq.bbq_doug | — | reputation |
| `bbq_fist_fight` | BBQDirector 1065 | — | fight flags |
| `bbq_grill` | bbq.bbq_grill | M: grill | grillStatus |
| `bbq_grill_explosion` | BBQDirector 1095 | — | flags.grill_exploded, reputation -15 |
| `bbq_hero_moment` | BBQDirector 1110 | — | flavor, terminal |
| `bbq_hub` | scene enter | — | intro narration |
| `bbq_karen` | bbq.bbq_karen | — | reads many evidence flags |
| `bbq_karen_divorce` | BBQDirector 1110 | — | flags.divorce_threatened |
| `bbq_karen_drink_throw` | BBQDirector 1065 | — | suspicion, karen_confronted |
| `bbq_mil` | bbq.bbq_mil | — | flavor |
| `bbq_mil_screams` | BBQDirector 1050 | — | triggered by **flags.lipstick** |
| `bbq_neighbor` | bbq.bbq_neighbor | — | reads evidence flags |
| `bbq_neighbor_eyes` | BBQDirector 1050 | — | triggered by **flags.crack_smoked** |
| `bbq_normal_climax` | BBQDirector 1110 | — | fallback climax |
| `bbq_rayray_arrives` | BBQDirector 1035/1110 | — | triggered by **flags.rayray_invited** |
| `bbq_resolution` | BBQDirector 1125 | — | routes by end-state flag (divorce/cops/hero/default) |
| `bbq_sharon_ex_arrives` | BBQDirector 1080 | — | triggered by **flags.sharon_helped** |
| `confrontation` | auto when `suspicion >= 60` | — | karen confrontation |
| `craigs_guns` | craigs.craig_talk | → frontyard | vices.guns +1, cash +50 |
| `craigs_guns_t2` | sketchy.warehouse | M: drive_warehouse | vices.guns +1 (big $), injury |
| `dougs_alcohol` | dougs.doug_talk | → frontyard | vices.alcohol tracking, hub for poker |
| `dougs_gambling_t2` | **dougs.doug_poker_t2** | — | vices.gambling +1-2 |
| `frontyard_drive` | minivan zones | M: drive_* (6 destinations) | — |
| `garage_chair` | garage.garage_chair | — | energy recovery |
| `garage_fridge` | garage.mini_fridge | — | 1–6 beers, **flags.smell**, sobriety |
| `garage_workbench` | garage.workbench | — | find weed → bong hit → **flags.dilated_pupils, smell, weedSmoked** |
| `gas_prostitution` | gas_station.phone_booth | — | vices.prostitution, suspicion |
| `gas_prostitution_t2` | **gas_station.sharon_motel** | — | deeper path, **flags.lipstick, perfume** |
| `gas_racing` | gas_station.modded_car | M: drive_race | vices.racing +1, cash ±30 |
| `gas_racing_t2` | highway.road | M: drive_race | higher stakes |
| `gas_station_store` | gas_station_store.store_clerk | — | buys: **flags.boughtCharcoal, boughtIce, has30Rack, hasCigs** |
| `girls_apartment_hub` | girls_apartment.girls_couch | → trap_house, → sidewalk | bong hit animation |
| `kevin_pitch` | kevin zones (bbq/quikstop/gas_station) | — | pyramid nudging |
| `kevins_pyramid` | kevins.kevin_talk | — | vices.pyramid +1 |
| `kevins_pyramid_t2` | **kevins.kevin_upline** | — | vices.pyramid +1-2 |
| `kids_digital` | kids_porch.kid_talk | — | vices.digital +1, cash |
| `kids_digital_t2` | **kids_porch.kid_big_hack** | — | vices.digital +1, big cash or heroicFlag |
| `kitchen_hub` | scene enter | — | intro beats |
| `mountain_view` | highway.mountain_view | — | flavor (conditional routes) |
| `pawn_shop` | strip_mall.pawn_shop | M: haggle_pawn | cash via haggle |
| `quikstop_buy` | quikstop.store | — | buys charcoal |
| `quikstop_theft` | quikstop.dumpster | — | vices.theft +1, cash +150, **flags.cash_bulge** |
| `quikstop_theft_t2` | sketchy.fence_guy | M: haggle_fence | cash via haggle |
| `sidewalk_drugs` | sidewalk.the_girls | → girls_apartment | vices.drugs +1, **flags.dilated_pupils, smell** |
| `sidewalk_drugs_t2` | strip_mall.alley | → trap_house | deeper drugs |
| `strip_club_bartender` | strip_club.bar | — | cash -$15, alcohol |
| `strip_club_dancer` | strip_club.amber_stage | → strip_club_vip | cash, **flags.lipstick, amber_met, amber_confidante** |
| `strip_club_enter` | strip_mall.club_entrance | → strip_club | cash -$20 cover |
| `strip_club_hub` | scene enter | — | short intro |
| `strip_club_tony` | strip_club.tony | M: haggle_tony | 3-card monte + bag run |
| `strip_club_vip` | scene enter OR dancer.to_vip | → strip_mall | deep consequences |
| `trap_dealer` | trap_house.dealer | — | vices.drugs=2, **flags.crack_smoked, paranoid, dilated_pupils, smell** |
| `trap_jim` | trap_house.jim | — | flavor |
| `trap_rayray` | trap_house.rayray | — | **flags.rayray_met, rayray_invited** (BBQ callback key) |
| `trap_trina` | trap_house.trina | — | optional crack hit |

---

## 3 — Minigames

| ID | Trigger | Mechanic | Outcome |
|---|---|---|---|
| `grill` | backyard_grill / bbq_grill | timing QTE (hit green zone) | grillStatus=done (success) or burnt (fail) |
| `mow` | frontyard.frontyard_mow | 3-pass steering with sobriety wobble | lawnStatus=100, mowQuality, **flags.crooked_mow** if <50 score |
| `drive_frontyard` | frontyard_drive menu | lane-switcher, obstacle dodge, sobriety wobble | loads `frontyard` |
| `drive_quikstop` | frontyard_drive menu | same | loads `quikstop` |
| `drive_gas_station` | frontyard_drive menu | same | loads `gas_station` |
| `drive_strip_mall` | frontyard_drive menu | same | loads `strip_mall` |
| `drive_sketchy` | frontyard_drive menu | same | loads `sketchy` |
| `drive_mountains` | frontyard_drive menu (requires `flags.has30Rack`) | same + scenery evolves, Q=beer X=bong mid-drive | loads `highway`, NO sobriety recovery |
| `drive_race` | gas_racing / gas_racing_t2 | same | cash +$30 win / -$30+injury lose |
| `drive_warehouse` | craigs_guns_t2 | same | cash +$300, suspicion +10 |
| `haggle_fence` | quikstop_theft_t2 | timing bar, lock in GOOD/FAIR/LOWBALL/GREED zone, 3 items | cash up to ~$720 |
| `haggle_pawn` | pawn_shop | same | cash up to ~$430 |
| `haggle_tony` | strip_club_tony | same | cash up to ~$1440 |

Drunk haggling shrinks the GOOD zone and grows the GREED zone.

---

## 4 — Karen's texts + BBQ act-beats

### Scripted (fires at fixed times)

| Time | Body |
|---|---|
| 435 (7:15) | "Morning! Charcoal (Kingsford!), buns, and the lawn. Party at 5. Love you" |
| 600 (10:00) | "Getting the charcoal today right? Kingsford NOT the cheap stuff" |
| 750 (12:30) | "How's the lawn coming?" |
| 840 (2:00) | "My mom's coming at 5. PLEASE have the lawn done." |
| 930 (3:30) | "Lawn looks great!" OR "Where are you??" (depends on `flags.lawnStatus > 80`) |
| 990 (4:30) | "People are here in 30 min" |
| 1020 (5:00) | "GET HOME. NOW." |

### Nags (one-shot once time+condition both met)

| After | Condition | Body |
|---|---|---|
| 540 | lawnStatus < 30 | "Lawn. Please. It's almost 9." |
| 600 | grillStatus = 'not_started' | "Did you get the charcoal??" |
| 720 | lawnStatus < 60 | "Babe. The LAWN." |
| 780 | grill not cooking/done | "Are the coals going yet?" |
| 840 | lawnStatus < 95 | "MOW. THE. LAWN." |
| 900 | grill not done/cooking | "burgers on by 3:30 ok?" |
| 960 | lawn<95 OR grill not ready | "where are you even right now" |

### Reactive (fires once when suspicion crosses)

| suspicion | Body |
|---|---|
| >=30 | "Everything ok? You're being quiet." |
| >=45 | "Hello?? Answer me." |
| >=55 | "I called Doug's wife. She said Doug hasn't seen you either." |
| >=60 | "I'm coming to find you." |
| >=80 | "Don't bother coming home." |

### BBQDirector act-beats (5 PM → 6:45 PM, at BBQ only)

| Slot | Time | Priority order — first match wins |
|---|---|---|
| arrival | 1020 | sobriety<30 → wasted; suspicion>=50 → suspicious; else → clean |
| first_callback | 1035 | rayray_invited → rayray; amber_confidante → amber |
| evidence | 1050 | lipstick → mil_screams; crack_smoked && !paranoid_outed → neighbor_eyes |
| escalation | 1065 | suspicion>=60 && !karen_confronted → karen_drink_throw; guns_fired → fist_fight |
| second_callback | 1080 | amber_confidante && rayray_invited → amber; sharon_helped → sharon_ex |
| penultimate | 1095 | vices.guns>=3 → cops_raid; grill!=done && sobriety<40 → grill_explosion |
| climax | 1110 | drugs>=2 && paranoid → cops_raid; suspicion>=80 → karen_divorce; crack_smoked → rayray; heroicFlag → hero_moment; else → normal_climax |
| resolution | 1125 | always fires → bbq_resolution |

---

## 5 — Endings (20)

All ending conditions in priority order (first match wins at 7 PM):

| # | id | priority | conditions |
|---|---|---|---|
| 1 | perfect_dad | 100 | sobriety>=80, suspicion<=20, lawnStatus>=95, grill=done |
| 2 | passed_out | 98 | sobriety<=15, energy<=15 |
| 3 | the_arrest | 97 | suspicion>=85, guns>=2 |
| 4 | divorce_papers | 96 | suspicion>=90 |
| 5 | neighborhood_hero | 95 | reputation>=85, grill=done, lawnStatus>=80 |
| 6 | hero_flip | 92 | flags.heroicFlag && grill=done |
| 7 | caught_red_handed | 90 | suspicion>=70, sobriety<50 |
| 8 | kingpin | 88 | guns>=3, gambling>=2, cash>=300 |
| 9 | lost_the_van | 87 | flags.lostCar |
| 10 | enlightenment | 86 | sobriety<40 |
| 11 | grill_disaster | 85 | grill=burnt |
| 12 | duffel_bag | 84 | cash>=500, grill=done |
| 13 | won_the_civic | 83 | flags.wonCar |
| 14 | secret_gambler | 82 | gambling>=2, cash<=0 |
| 15 | pyramid_king | 81 | pyramid>=3 |
| 16 | functional_drunk | 80 | sobriety 40-80, suspicion<=50 |
| 17 | good_enough_dad | 75 | lawn>=60, grill=done, suspicion<=60 |
| 18 | lawn_disaster | 70 | lawn<30 |
| 19 | no_grill | 68 | grill=not_started |
| 20 | default_mediocre | 1 | fallback |

---

## 6 — Known gaps (fixed in Phase 11B)

Previously the tier-2 dialogues below had **no entry point in the world**:
- `dougs_gambling_t2` — now reachable via **Poker Table** zone at Doug's (`vices.gambling >= 1`)
- `kevins_pyramid_t2` — now reachable via **Meet the Upline** zone at Kevin's (`vices.pyramid >= 1`)
- `kids_digital_t2` — now reachable via **The Big One** zone at Kid's Porch (`vices.digital >= 1 AND currentTime >= 780`)
- `gas_prostitution_t2` — now reachable via **The Motel** zone at gas_station (`vices.prostitution >= 1 AND suspicion < 70`)

If you find any other dialogue or scene that's unreachable, drop it in a bug with the dialogue id and the path you tried.
