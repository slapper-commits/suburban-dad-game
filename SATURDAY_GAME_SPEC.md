# SATURDAY — Complete Game Design Specification

# Side-Scroller Pixel Art Edition

## Build Instructions

You are building a complete, playable single-file web game as a **React JSX artifact** (`.jsx`). The game uses **inline SVG pixel art** rendered via React components — NOT canvas. This document is the entire game design. A working demo exists with a proven `Person` component (`P`), scene renderer, and game loop. **Extend that architecture — do not rewrite from scratch.**

The visual style is pixel-art side-scroller. Think King of the Hill meets Untitled Goose Game meets It's Always Sunny — warm, charming pixel art clashing with escalating degeneracy. The comedy is the contrast.

---

## 1. GAME OVERVIEW

**Title:** SATURDAY

**Logline:** A suburban dad has one Saturday, two simple tasks, and a universe conspiring to destroy his life.

**Concept:** The player is an unnamed everyman dad on a Saturday morning. Two responsibilities: mow the lawn and grill hamburgers for a 5pm BBQ. The neighborhood is saturated with increasingly unhinged temptations: drugs, alcohol, gambling, prostitution, gun running, pyramid schemes, street racing, theft, and digital crime. Every vice is a rabbit hole with three tiers of escalation. Every choice is framed euphemistically — the player never chooses evil, they're just "checking something out" or "hanging around." The day ends at 8pm with a playable BBQ where every accumulated consequence collides in front of wife, in-laws, friends, and neighbors.

**Tone:** Dark comedy. Absurd, funny, escalating. It's Always Sunny degeneracy levels +15%. The pixel art is warm and wholesome — which makes crack smoking, gun deals, and arrests hit harder. The comedy comes from situations and escalation, never from cruelty. South Park / King of the Hill / Always Sunny energy.

**Target Playthrough:** 15-20 minutes. A degenerate speedrun: 10-12 min. A "perfect Saturday" (just do your chores): 8-10 min but feels eerily hollow.

---

## 2. VISUAL STYLE — PIXEL ART SIDE-SCROLLER

### 2.1 Rendering Architecture

**Format:** React JSX with inline SVG. Each scene is a full SVG viewport (`viewBox="0 0 480 260"`) showing a side-scrolling pixel art scene with characters, environment, and atmospheric details. Text narration and choice buttons render below the SVG in a dark dialog panel.

**NO canvas. NO external images. NO `<g transform="scale(...)">`.** These break in the artifact sandbox.

### 2.2 The Person Component (`P`)

Proven working component. Renders a pixel character using absolute coordinate math. **Every character in the game uses this component.**

```jsx
<P x={250} y={groundY} 
   shirt="#4a90d9" skin="#f0c89a" hair="#6b4c2a" pants="#4a5568"
   mouth="smile"   // neutral|smile|grin|frown|shock|smirk
   shades={false}  // sunglasses instead of eyes
   beer={true}     // beer can in right hand
   hat="cap"       // false|"cap"|"cowboy"
   hatColor="#cc3333"
   sz={0.85}       // scale (default 1)
   sleepy={false}  // closed eyes
/>
```

**Key constraints (from debugging):**

- Uses absolute coords: `x + offset * sz`, NOT `<g transform>`
- No CSS animations on SVG groups — they break rendering
- No negative scale for flipping — just adjust element positions
- All shapes are `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<path>` with hardcoded coordinates

**Face expressions available:**

|Expression|Use case|
|---|---|
|`neutral`|Default idle|
|`smile`|Slight buzz, friendly|
|`grin`|Drunk, thrilled, chaos|
|`frown`|Bad situation, regret|
|`shock`|Caught, surprised|
|`smirk`|Scheming, teenagers, cool|
|`shades`|Dave, cool NPCs|
|`sleepy`|Wasted, exhausted|

**Accessories:**

- `beer={true}` — beer can in hand
- `hat="cap"` / `hat="cowboy"` — headwear
- Future: `item="spatula"`, `item="phone"`, `item="pipe"`, `item="gun"`, `item="briefcase"`, `item="brochure"`

### 2.3 Character Cast — Pixel Definitions

Every recurring NPC has a fixed visual identity:

|Character|Shirt|Skin|Hair|Pants|Hat|Accessories|Default face|
|---|---|---|---|---|---|---|---|
|**Dad** (player)|`#4a90d9` polo|`#f0c89a`|`#6b4c2a` brown|`#4a5568` khakis|none|varies by state|varies by buzz|
|**Karen** (wife)|`#cc6688`|`#f0c89a`|`#8B4513` auburn|`#6a5a7a`|none|phone|frown→smile|
|**Dave** (neighbor/alcohol)|`#cc4444` red|`#e8b888` tan|`#8B4513`|`#2d3a4a` dark|`"cap"` red|beer always|`shades`|
|**Doug** (alcohol host)|`#5a8a5a` green|`#f0c89a`|`#8B6914` dirty blonde|`#555`|none|beer, cooler|`smile`|
|**Craig** (guns)|`#2d2d2d` black tee|`#d4a878`|`#333` buzzcut|`#3d3d3d`|none|boxes|`neutral`→`frown`|
|**Kevin** (pyramid scheme)|`#22aa55` bright green|`#f0c89a`|`#d4a020` blonde|`#3a3a5a`|none|brochure|`grin` always|
|**The Kid** (digital crime)|`#222` hoodie|`#d4a878`|`#222`|`#111`|none|laptop|`smirk`|
|**The Girls** (drugs entry)|`#9b6b9b` purple|`#c89878`|`#333`|`#444`|none|—|`smile`|
|**Brenda** (Dave's wife)|—|`#f0c89a`|`#c4783c` red|—|—|—|`frown`|
|**Mother-in-law**|`#6a5a6a`|`#f0c89a`|`#ccc` gray|`#5a5a5a`|none|purse|`frown`|
|**QuikStop Teen**|`#222`|`#d4a878`|`#222`|`#111`|none|vape|`smirk`|
|**Chess Old Men**|`#5a6a4a`/`#6a5a4a`|`#d4a878`/`#e8b888`|`#ccc`/`#ddd`|`#555`/`#444`|none|—|`neutral`/`smirk`|

### 2.4 Scene Composition Rules

Every scene SVG follows this structure:

```
1. Sky gradient (time-based)
2. Sun/moon position (time-based) 
3. Clouds (static, 2-3 ellipses)
4. Background elements (distant trees, buildings)
5. Ground plane (grass + road/sidewalk)
6. Mid-ground elements (houses, buildings, fences, props)
7. Characters (using P component)
8. Foreground details (mailbox, cooler, items)
```

**Ground level:** `const g = 195;` — all characters stand at `y={g}`.

**Viewport:** `viewBox="0 0 480 260"` — consistent across all scenes.

**Sky changes with time:**

|Game Time|Sky Gradient|
|---|---|
|7-9am|`#87CEEB` → `#a8d8ea` (bright morning)|
|10am-12pm|`#87CEEB` → `#a8d8ea` (full day)|
|1-3pm|`#6a9aca` → `#c8a870` (harsh afternoon)|
|4-5pm|`#5a7aaa` → `#e0a060` → `#f0c040` (golden hour)|
|5-7pm|`#2d3a6a` → `#d4785a` → `#f0a040` (sunset)|
|7-8pm|`#1a1a3a` → `#2d1f4e` → `#4a2040` (twilight)|

### 2.5 Intoxication Visual Effects

Instead of canvas overlays, use SVG overlays and UI changes:

- **Sobriety 80-60:** Dad's `mouth` shifts to `smile`/`grin`. Warm amber `<rect>` overlay at 5% opacity over the scene.
- **Sobriety 60-40:** Overlay at 15% opacity. Choice text gets slightly looser wording. Dad gets `beer={true}`.
- **Sobriety below 40:** Overlay at 25% opacity (purple-ish). Choice labels contain typos. Dad's face is `grin` or `sleepy`. Scene descriptions get poetic/unhinged.
- **Sobriety below 20:** Dad rendered with `sz={0.95}` (slightly smaller — "shrinking"). Multiple overlay rects. Narration goes full stream-of-consciousness.

### 2.6 Vice Color Bleeding

Each vice has a signature color. When deep in a vice, add a subtle tinted `<rect>` overlay to the scene:

|Vice|Color|Overlay hex|
|---|---|---|
|Drugs|Purple/magenta|`#9b6b9b`|
|Alcohol|Warm amber|`#d4a54a`|
|Gambling|Green/gold|`#4a8a3a`|
|Prostitution|Neon pink|`#cc5588`|
|Guns|Gunmetal grey|`#4a5a6a`|
|Pyramid scheme|Toxic green|`#22aa55`|
|Street racing|Hot orange|`#e08030`|
|Theft|Dark teal|`#2a6a6a`|
|Digital crime|Electric cyan|`#22aacc`|

---

## 3. WORLD & LOCATIONS — SCENE DESIGNS

Each location is a distinct SVG scene with its own pixel art composition and cast of characters.

### 3.1 Home Locations

**Kitchen** (starting scene)

- Interior: counter, coffee mug, note on fridge, keys/wallet/phone
- Characters: Dad alone
- Props: wife's note (yellow sticky), coffee steam

**Front Yard / Lawn**

- Your house (beige, brown roof), mailbox, fence
- Lawn state visible: green (unmowed) → striped (mowed) → crooked stripes (drunk-mowed)
- Characters: Dad + lawnmower (when mowing), Karen in window
- Neighbor kid on bike in background

**Garage**

- Interior: beer fridge (glowing), workbench, golf clubs, B-182 poster, birdhouse
- Characters: Dad, cat on workbench
- The fridge is always there. Always humming. Always tempting.

**Backyard / Patio**

- Grill, patio chairs, string lights (lit during BBQ), table with plates
- Characters: Dad, and during BBQ: full cast

**Driveway**

- Car (sedan), basketball hoop, garage door
- Gateway to driving scenes

### 3.2 Neighborhood Locations

**Doug's Driveway** — Alcohol Entry

- Doug's house (green-ish), lawn chairs, cooler (masterwork), truck
- Characters: Doug (beer, smile), later: poker guys inside garage
- Atmosphere: lazy, warm, tempting

**Craig's Driveway** — Guns Entry

- Craig's house (gray/muted), pickup truck, mysterious boxes
- Characters: Craig (black tee, neutral/tense), sometimes hooded figures in background
- Atmosphere: quiet, tense, something's off

**Kevin's Garage** — Pyramid Scheme Entry

- Kevin's house (aggressively cheerful, bright), garage open, whiteboard visible, ELEVATÉ WELLNESS banner
- Characters: Kevin (green shirt, grin ALWAYS, brochure), sometimes victims inside
- Atmosphere: too bright, too positive, uncanny valley

**The Kid's Porch** — Digital Crime Entry

- Modest house, porch with laptop setup, energy drinks
- Characters: The Kid (hoodie, smirk, laptop)
- Atmosphere: bored, suburban ennui, surprising competence

**The Sidewalk / Street** — Drugs Entry + General Traversal

- Neighborhood street, houses in background, sidewalk
- Characters: The Girls (walking by), jogger, dog walker
- Atmosphere: normal suburban until it isn't

### 3.3 Driving Locations

**The Store (QuikStop)**

- Store building with QUIKSTOP sign, gas pump, parking lot, parked cars
- Characters: QuikStop Teen (smirk, vaping), Cashier (bored through window), Cake Guy (smile)
- Props: OPEN neon sign, gas price ($4.29)
- Theft entry: duffel bag behind dumpster

**The Strip Mall**

- Row of shops, parking lot, alley behind
- Characters: The Girls (drug tier 1-2), shady figures, Kevin (showing up to recruit)
- Atmosphere: fluorescent, liminal, behind the building is another world

**The Gas Station**

- Gas pumps, convenience store, stoplight
- Characters: Prostitution entry NPC, Modded Car Guy (street racing)
- Atmosphere: transitional, anything can happen at a gas station

**The Sketchy Part of Town**

- Run-down buildings, chain link fence, dim lighting even in daytime
- Characters: Tier 2-3 NPCs for drugs, guns, prostitution
- Dad clearly doesn't belong here (pixel art makes this funnier)

**The Highway**

- Open road, distant mountains, speed lines
- Characters: Dad in car, racing opponents
- Street racing tier 2-3

### 3.4 BBQ Scene (Act 5)

- Backyard: grill (Dad manning it), table with food, string lights, lawn visible (state shown)
- Characters rotate through: Wife, Mother-in-law, Doug, Kevin, Craig, neighbors
- Each conversation is a 2-3 exchange social survival minigame
- Evidence checks trigger specific NPC reactions

---

## 4. PLAYER STATE SYSTEM

### 4.1 State Variables

```javascript
const INITIAL_STATE = {
  time: 7.0,            // 7.0 to 20.0 (7am-8pm)
  sobriety: 100,         // 0-100
  suspicion: 0,          // 0-100 (wife's distrust)
  cash: 60,              // dollars
  lawnStatus: 0,         // 0-100%
  mowQuality: 100,       // affected by sobriety when mowing
  grillStatus: "not_started", // not_started|supplies_bought|prepped|cooking|done|burnt
  viceDepth: {           // 0-3 each
    drugs: 0, alcohol: 0, gambling: 0, prostitution: 0,
    guns: 0, pyramid: 0, racing: 0, theft: 0, digital: 0,
  },
  heroicFlag: false,
  evidence: [],          // strings: dilated_pupils, smell, lipstick, cash_bulge, injury, crooked_mow, etc.
  contacts: [],          // NPC IDs who can text you
};
```

### 4.2 Dad's Face (Derived from State)

```javascript
function getDadFace(state) {
  if (state.sobriety < 20) return "sleepy";
  if (state.sobriety < 40) return "grin";   // sloppy happy
  if (state.sobriety < 60) return "smile";  // buzzed
  if (state.suspicion > 70) return "shock";  // oh no
  return "neutral";                          // sober dad
}
```

### 4.3 Sobriety Recovery

Sobriety slowly recovers (+5 per 30 game-minutes) if not re-using. Walking/park activities help more (+10). This creates a tension: do you sober up for the BBQ or keep going?

---

## 5. TIME SYSTEM & PACING

### 5.1 Time Costs

|Action|Game Time Cost|
|---|---|
|Walk to neighbor|10-15 min|
|Drive somewhere|20-30 min|
|Mow full lawn (sober)|90 min|
|Buy supplies|15 min|
|Grill burgers|90 min|
|Vice tier 1|30-45 min|
|Vice tier 2|60-90 min|
|Vice tier 3|90-150 min|
|Wife confrontation|30-45 min|

### 5.2 Act Structure

|Act|Game Time|Real Time|Purpose|
|---|---|---|---|
|Act 1: Morning|7:00-10:00|~4 min|Setup. House, lawn, neighbors. First vice entries: Doug (alcohol), Kevin (pyramid), sidewalk girls (drugs), Kid (digital).|
|Act 2: Midday|10:00-1:00|~5 min|Expansion. Store run opens driving. Craig (guns), gas station (prostitution, racing), store (theft). Wife texts start.|
|Act 3: Afternoon|1:00-4:00|~5 min|Escalation. Tier 2-3 unlocks. Wife confrontation possible. Time pressure.|
|Act 4: The Rush|4:00-5:00|~2 min|Scramble. Last chance to get home, finish tasks, clean up.|
|Act 5: The BBQ|5:00-8:00|~4 min|Social survival finale. Every variable collides.|

---

## 6. THE NINE VICES — ENCOUNTER TREES

### Writing Rule: ALWAYS EUPHEMISTIC

Choice text never reveals moral weight:

- NOT: "Smoke crack" → YES: "See what the fuss is about"
- NOT: "Accept the gun deal" → YES: "Help Craig out — he's a neighbor"
- NOT: "Ignore your wife" → YES: "You'll reply in a minute"
- NOT: "Go to the prostitute" → YES: "She seems nice — hear her out"

### 6.1 DRUGS (Purple #9b6b9b)

**Entry:** Sidewalk, ~9:30am. Girls walking by. "Hey! You look like you could use a break."

- Scene: Street with houses, The Girls walking past
- [Take a breather from yard work] → Tier 1
- [Get back to it] → Continue

**Tier 1 — "The Break" (30 min):** Behind strip mall. Milk crates, speaker, glass pipe.

- Scene: Alley behind strip mall, crates, The Girls sitting, one holds pipe
- [See what the fuss is about] → Sobriety -20, evidence: dilated_pupils, smell. Get contact.
- [Just hang out and soak in the vibe] → Sobriety -5. Get number. Less time.
- [Actually, I should go] → Leave clean.

**Tier 2 — "The Apartment" (60-90 min):** Text lure: "We moved to [address], way better here."

- Scene: Sketchy apartment interior. Darker lighting. Harder stuff visible.
- [Stay for a bit — you've earned it] → Sobriety -35. Miss wife text. Suspicion +15.
- [This is heavier than I expected] → Leave. Sobriety -15.

**Tier 3 — "The Ride" (120-150 min):** You're in someone else's car going out of town.

- Scene: Highway, unfamiliar car, Dad in passenger seat looking uncertain
- [Might as well see where this goes] → Sobriety -50. Evidence: everything. **Heroic moment available.**
- [I need to get out of this car] → Dropped at gas station. Still wrecked. 45 min home.

### 6.2 ALCOHOL (Amber #d4a54a)

**Entry:** Doug's driveway, ~8:30am. "Saturday, brother. Sun's out, beers are cold."

- Scene: Doug's house, lawn chairs, cooler, Doug leaning with beer
- [Just one — it is Saturday] → Tier 1
- [Maybe later, got the lawn to do] → Doug: "I'll be here all day."

**Tier 1 — "Just One" (20 min):** Doug's driveway. One becomes two.

- [One more can't hurt] → Sobriety -10. Doug mentions poker.
- [Alright, I really gotta mow] → Leave buzzed.

**Tier 2 — "Day Drinking" (60 min):** Doug's garage. Hard liquor. Poker table setting up.

- [What's everyone having?] → Sobriety -30. Suspicion +10.
- [I'll stick to beer] → Sobriety -15. Functional.

**Tier 3 — "The Blackout" (90-120 min):** Sobriety below 40 at Doug's. Screen goes dark. You wake up somewhere — Doug's floor, the park, your own backyard. Clock jumped. Multiple missed texts. Suspicion +25.

**Key mechanic:** Alcohol lowers resistance to ALL other vices. Below sobriety 60, euphemistic labels for other vices become more tempting.

### 6.3 GAMBLING (Green/Gold #4a8a3a)

**Entry:** Doug or neighbor mentions poker, ~11am. "Bring cash."

- Scene: Doug's garage, folding table, poker chips, beer cans
- [Could be fun] → Tier 1

**Tier 1 — "Friendly Game" (45 min):** $5-10 hands.

- [Play a few hands] → Cash ±$20 random.
- [Raise the stakes?] → Tier 2

**Tier 2 — "Real Money" (60-90 min):** $50 hands. Unknown outsider joins.

- [I'm feeling lucky] → Cash ±$100. Loss → connection to Guns/Theft.
- [Too rich for me] → Drop out.

**Tier 3 — "The Underground Game" (120 min):** Sketchy location. Cash ±$500+.

- [Go all in] → Win big (Duffel Bag ending setup) OR lose everything.
- [Fold and walk away] → Leave with whatever.

### 6.4 PROSTITUTION (Neon Pink #cc5588)

**Entry:** Gas station, ~10:30am. Someone approaches during errands.

- Scene: Gas station, charming NPC approaches
- [She seems nice — hear her out] → Tier 1
- [Just getting gas, thanks] → Drive away.

**Tier 1 — "The Conversation" (30 min):** Flirtatious. Number exchange. Suspicion +5. **Tier 2 — "The Detour" (60 min):** Motel. Suspicion +20. Evidence: perfume, lipstick. **Tier 3 — "The Situation" (90 min):** Complications. Boyfriend. Money dispute. **Heroic moment available.**

### 6.5 GUNS (Gunmetal #4a5a6a)

**Entry:** Craig's driveway, ~11:30am. "I need a hand moving some stuff."

- Scene: Craig's house, truck, boxes, Craig loading
- [Sure, what are neighbors for?] → Tier 1
- [Can't right now, Craig] → He texts later.

**Tier 1 — "The Favor" (30 min):** Load boxes. One is heavy, metallic. $50. **Tier 2 — "The Run" (90 min):** Drive Craig's truck across town. Cash +$300. Meet bad people. **Tier 3 — "The Deal" (120-150 min):** Warehouse. Life-changing money. Cash +$1000. **Heroic moment available.** Sets up Kingpin/Arrest endings.

### 6.6 PYRAMID SCHEME (Toxic Green #22aa55)

**Entry:** Kevin's driveway, ~9am. "Five minutes — this will change your life."

- Scene: Kevin's garage, whiteboard, ELEVATÉ WELLNESS banner, laminated brochure
- [Alright Kevin, five minutes] → Tier 1
- [Not today, Kevin] → He texts motivational quotes ALL DAY.

**Tier 1 — "The Pitch" (20 min):** "ELEVATÉ WELLNESS." Almost legitimate.

- [Tell me more about the comp structure] → Sucked in.
- [This is a pyramid scheme, Kevin] → "It's a REVERSE FUNNEL SYSTEM."

**Tier 2 — "The Investment" (60 min):** "Regional meetup." Cash -$200. You're "in." **Tier 3 — "The Recruitment Drive" (90 min):** You ARE Kevin. Walking around pitching strangers.

**Running gag:** Kevin appears at OTHER vice locations pitching those NPCs. He pitches the poker players. The strip mall girls. Craig. He is indestructible.

### 6.7 STREET RACING (Orange #e08030)

**Entry:** Any driving scene. Stoplight. Modded car revs.

- [Rev back] → Tier 1
- [Stare straight ahead] → He peels off. You feel something.

**Tier 1 — "The Stoplight" (15 min):** Short race. You lose. Exhilarating. Meet info. **Tier 2 — "The Meet" (60 min):** Parking lot, modded cars, racing for money. Cash ±$100. **Tier 3 — "Pink Slips" (90 min):** Bet your car. Win = two cars. Lose = no car. Explaining at BBQ is a problem.

### 6.8 THEFT (Teal #2a6a6a)

**Entry:** Store parking lot, ~10:15am. Leather bag behind dumpster.

- [Take a closer look] → Tier 1
- [Not my business] → Walk away.

**Tier 1 — "The Find" (15 min):** Cash $150 + mystery item. **Tier 2 — "The Fence" (60 min):** Someone buys "found items." Cash +$200-500. **Tier 3 — "The Job" (120 min):** Active theft. Suburban dad heist. Comedy of errors. **Heroic moment available.**

### 6.9 DIGITAL CRIME (Cyan #22aacc)

**Entry:** Kid's porch, ~12pm. "Hey Mr., you know anything about computers?"

- [What kind of crazy?] → Tier 1
- [Busy day, sorry kid] → Walk past.

**Tier 1 — "The Discovery" (20 min):** Kid shows unsecured system. Fascinating. **Tier 2 — "The Hack" (60 min):** Your phone + car for wifi. Getaway driver for cybercrime. Cash +$300. **Tier 3 — "The Big One" (90 min):** Inside a building following a teenager's earpiece instructions. Peak absurdity. **Heroic moment available.**

---

## 7. THE WIFE — SUSPICION SYSTEM

### 7.1 Text Messages (Slide-in notification above scene)

**Scripted:**

|Time|Message|
|---|---|
|7:15am|"Morning! Charcoal (Kingsford!), buns, and the lawn. Party at 5. Love you"|
|10:00am|"Getting the charcoal today right? Kingsford NOT the cheap stuff"|
|12:30pm|"How's the lawn coming?"|
|2:00pm|"My mom's coming at 4. PLEASE have the lawn done."|
|3:30pm|"Where are you??" (if not home) / "Lawn looks great!" (if lawn >80%)|
|4:30pm|"People are here in 30 min"|

**Suspicion-reactive:**

|Suspicion|Message|
|---|---|
|30|"Everything ok? You're being quiet."|
|45|"Hello?? Answer me."|
|55|"I called Doug's wife. She said Doug hasn't seen you either."|
|60+|**Confrontation.** She comes to find you.|
|80+|"Don't bother coming home."|

**Drunk text responses** (player auto-responses affected by sobriety):

- 80+: "On it! Picking up charcoal now."
- 60-80: "Yep all good! Havin a great day"
- 30-60: "Im fine babe don worry about me lol"
- <30: "lovr u hnney evrythin is gooood" — always increases suspicion

Ignoring a text: Suspicion +5 each time.

### 7.2 The Confrontation (Suspicion 60+)

Wife pixel character physically appears in whatever scene you're in. Branching scene based on location, visible state, task progress.

---

## 8. ACT 5 — THE BBQ

If home by 5pm, BBQ is playable. Interactive social survival.

### 8.1 Scene

- Backyard: grill (Dad at it), table, string lights, guests
- Lawn visible in background (mow state shown)
- Characters rotate through conversations

### 8.2 Guest Conversations

Each is a 2-3 choice exchange. Evidence triggers specific reactions:

- `dilated_pupils` → Mother-in-law: "Are you feeling alright? Your eyes look strange."
- `smell` → Wife: "Have you been drinking? Before the party?"
- `lipstick` → Wife's friend: "Ooh, who's wearing perfume?"
- `cash_bulge` → Neighbor: "Business must be good!"
- `crooked_mow` → Father-in-law: "Interesting pattern on the lawn."
- `injury` → Everyone: "What happened to your face?"

### 8.3 Grill Mechanic

Periodic "check the grill" prompts interrupt conversations. Sobriety affects timing.

---

## 9. THE 12 ENDINGS

Evaluated at 8pm, checked 12→1, first match fires.

|#|Title|Trigger|Grade|
|---|---|---|---|
|1|The Perfect Saturday|Lawn 100%, grill done, no vices, suspicion <30|A+ (hollow)|
|2|The Close Call|Lawn 80%+, grill done, max vice ≤1, suspicion <40|B+|
|3|The Functioning Disaster|Lawn 50%+, grill cooking, vice ≥2, suspicion 30-60|C+|
|4|The Half-Mow|Lawn 30-70%, home by 5, suspicion <70|C|
|5|The Hero Flip|heroicFlag, vice ≥2, home for BBQ|B (redemptive)|
|6|The Duffel Bag|Cash >$500 from vice, home by 5, no arrest|B- (ominous)|
|7|The No-Show|Not home at 6pm|D|
|8|The Confrontation Collapse|Suspicion ≥85|F|
|9|The Arrest|guns=3 OR theft=3 OR digital=3, home|F (spectacular)|
|10|The Kingpin|guns=3 AND (gambling≥2 OR pyramid≥2), cash>$300|D+ (dark)|
|11|The Enlightenment|3+ vices depth≥1, sobriety<40, introspective choices|C (transcendent)|
|12|The Loop|HIDDEN. Ending 1 conditions + examined specific object in Act 1|???|

---

## 10. UI DESIGN

### 10.1 Layout

```
┌─────────────────────────────────────┐
│  [SVG SCENE - 480x260 viewBox]     │
│  ┌──────┐              ┌─────────┐ │
│  │Meters│              │Clock    │ │
│  │Buzz  │              │Location │ │
│  │Susp. │              │BBQ warn │ │
│  │Rep   │              └─────────┘ │
│  └──────┘                          │
│     [Pixel art scene with          │
│      characters & environment]      │
├─────────────────────────────────────┤
│  ▸ Narration text with typewriter  │
│    effect, 2-3 sentences max...    │
│                                     │
│  [A] Choice one                  → │
│  [B] Choice two                    │
│  [C] Choice three                → │
└─────────────────────────────────────┘
```

### 10.2 Phone Notifications

Wife texts render as a slide-down card above the scene SVG:

```
┌──────────────────────────┐
│ 📱 Karen          10:00am│
│ "Getting the charcoal    │
│  today right?"           │
└──────────────────────────┘
```

Auto-dismisses after 4 seconds or on click.

### 10.3 Style Tokens

- Background: `#111118` (deep dark)
- Narration text: `#c8cce0` (cool cream)
- Accent: `#f0c040` (gold)
- Danger: `#e24b4a` (red)
- Success: `#5DCAA5` (teal)
- Warning: `#f0a040` (amber)
- Font: `'Courier New', monospace`
- Choice hover: `rgba(240,192,64,0.08)` bg, `#f0c040` text

---

## 11. TECHNICAL ARCHITECTURE

### 11.1 File Structure

Single `.jsx` React artifact. All state in React hooks. All rendering in JSX with inline SVG.

### 11.2 Scene Data Format

```javascript
const SCENARIOS = {
  locationId: {
    sceneId: {
      text: "Narration. 2-3 sentences. Present tense. Punchy.",
      choices: [
        { 
          text: "Euphemistic choice label",
          next: "next_scene_id",      // within same location
          loc: "new_location_id",     // if changing location
          // State mutations (all optional):
          buzz: 15,    // added to buzz
          sus: 10,     // added to suspicion  
          rep: -5,     // added to reputation
          time: 30,    // minutes added to clock
          cash: -50,   // cash change
          sob: -20,    // sobriety change
          evidence: "dilated_pupils", // evidence added
          vice: ["drugs", 1],        // [viceId, newDepth]
        },
      ],
    },
  },
};
```

### 11.3 Core Game Loop

```
title screen → "Start your Saturday" →
  show scene (SVG + narration + choices) →
  player picks choice →
  apply state mutations →
  check wife text triggers →
  check ending conditions →
  transition to next scene →
  ... repeat until time ≥ 20.0 or ending triggered →
  show ending screen (grade + title + description + stats)
```

### 11.4 Scene Transition

Location changes: `setFade(true)` → 500ms opacity transition → update location + scene → `setFade(false)`.

---

## 12. PRIORITY STACK

**P0 — MUST SHIP:**

1. Scene engine (narration, choices, transitions, state)
2. All 9 vice entry points + tier 1 for each
3. Lawn mowing system
4. Grill/supply system
5. Wife text system (scripted + suspicion-reactive)
6. Time system with clock
7. At least 8 endings
8. SVG pixel art scenes for all locations (characters populated)
9. Title screen + ending screen
10. Sobriety affecting Dad's face + choice text

**P1 — STRONGLY DESIRED:** 11. Full tier 2-3 for all 9 vices 12. All 12 endings 13. Wife confrontation scene 14. Playable BBQ social survival 15. Intoxication overlays 16. Vice interconnections 17. Evidence system for BBQ 18. Kevin appearing at other vice locations 19. Drunk text response variants 20. Phone notification UI

**P2 — NICE TO HAVE:** 21. Sound (Web Audio API) 22. Environmental time lighting shifts 23. Ending collection tracker 24. Mow quality tracking 25. Vice color bleeding 26. Multiple BBQ conversation rounds 27. The Loop ending (hidden) 28. Pay-what-you-want prompt

---

## 13. WRITING GUIDELINES

**Tone:** It's Always Sunny levels of moral bankruptcy delivered in King of the Hill's warm suburban setting. The player is Dennis Reynolds in Hank Hill's neighborhood. The art style is Bluey. The content is Trainspotting. THAT'S the joke.

**Choice text:** ALWAYS euphemistic. ALWAYS.

**Narration:** 2-3 sentences. Present tense. Punchy. "The strip mall parking lot smells like hot asphalt and bad decisions."

**NPC dialogue:** Natural, exaggerated for comedy. NPCs are archetypes not cartoons. Doug is likable. Craig is intense. Kevin is unstoppable. That's what makes temptation work — these aren't villains, they're guys.

**Drunk variants:** Realistic typos, autocorrect errors, inappropriate emoji. "Im fine babe don worry" energy.

**Escalation:** Act 1 is light. By Act 3, the same casual tone applied to dark situations IS the comedy. Never break the fourth wall (except Ending 12).

**Memeable moments to engineer:**

- Dad smoking crack in pixel art while Karen texts "How's the lawn?"
- Kevin pitching ELEVATÉ to Craig's gun buyers
- Dad at an underground poker game still wearing his polo and khakis
- The arrest scene: pixel police, pixel handcuffs, mother-in-law holding potato salad
- Dad following a teenager's earpiece instructions into a corporate building
- The Half-Mow: a perfect visible line where you stopped mowing

**Length:** KEEP IT SHORT. Every word earns its place. 3+ sentence narration = too long.

---

## 14. COMPONENT REFERENCE

### Person Component (`P`)

```jsx
// PROVEN WORKING — uses absolute coords, no transform groups
function P({ x, y, shirt, skin, hair, pants, mouth, shades, beer, hat, hatColor, sz, sleepy })
```

### Tiny Background Person (`Tp`)

```jsx
// For distant/background characters
function Tp({ x, y, c })  // c = single fill color
```

### Scene Template

```jsx
function Scene({ loc, time, buzz, sobriety, viceDepth }) {
  const g = 195; // ground level
  const df = getDadFace({ sobriety, suspicion, buzz });
  
  return (
    <svg width="100%" viewBox="0 0 480 260" style={{display:"block"}}>
      {/* 1. Sky gradient (time-based) */}
      {/* 2. Sun/moon */}
      {/* 3. Clouds */}
      {/* 4. Ground + road */}
      {/* 5. Location-specific environment */}
      {/* 6. Characters (P components) */}
      {/* 7. Intoxication overlay (if applicable) */}
    </svg>
  );
}
```

---

_Build this game. Make every scene alive with people. Make it funny. Make it dark. Make it memeable. Make it replayable. Ship it as one JSX file._