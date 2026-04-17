# Suburban Dad — Manual Test Plan

End-to-end checklist for verifying every narrative path + system is reachable and working. Use the browser console (`dev.help()` on http://localhost:3000 or the Vercel deployment) to jump around quickly.

## Debug console

Press F12 → Console tab, then:

```
dev.help()                       // lists every command
dev.jumpTo("strip_club")         // teleport
dev.setTime(1020)                // skip to 5pm BBQ
dev.setCash(500)
dev.setSobriety(25)              // wasted
dev.setVice("drugs", 2)
dev.grantStripper()              // flags for Amber callback at BBQ
dev.grantTrap()                  // flags for RayRay callback at BBQ
dev.triggerBBQ()                 // skip to BBQ scene at 5pm
dev.triggerEnding()              // force ending
dev.state()                      // snapshot current state
```

---

## 1. Core loop & bug regressions

- [ ] Start fresh game → walk right to garage → mow the lawn (not at it) is NOT blocked
- [ ] Walk to frontyard → approach mower → press E → MowGame launches
- [ ] Complete the mow → flags.lawnStatus = 100 → walk to minivan → E → **frontyard_drive opens** (NOT the mow minigame again)
- [ ] Open garage → fridge → drink 6 beers in a row → hit `maxed` blackout beat
- [ ] Open garage → workbench → rummage → find weed → take hit → Dad visibly holds bong
- [ ] Karen text at 2 PM reads **"mom's coming at 5"** (not 4)
- [ ] Talk to BBQ NPCs → clock advances each conversation
- [ ] Game ends at **7 PM (1140 min)** not 8 PM

## 2. Dialogue navigation

- [ ] Open any dialogue → press `1` → choice 1 selected
- [ ] Click anywhere on panel → advances to next beat
- [ ] Press ENTER → advances / closes at end
- [ ] Beats with multiple panels show choices from beat 1 (not only at end)
- [ ] Continue button reads `▶ click or press ENTER` in orange

## 3. Consumption animations (each visible for ~1.5s)

- [ ] Beer: raise gold can, splash droplets
- [ ] Bong: green bong + bubbles + orange flame + smoke
- [ ] Crack: glass pipe + blue flame + smoke
- [ ] Cigarette: white stick + smoke trail
- [ ] Shot: small glass

Trigger via:
- Beer → fridge → "Crack one open"
- Bong → workbench → rummage → "Take a hit"
- Crack → drugs t2 accept (The Girls)
- Cig → gas station store → "Pack of smokes"
- Shot → strip club → bartender → "$15 whiskey"

## 4. Dishevelment overlays (visible on Dad as he walks)

- [ ] Drunk sobriety < 50 → stain on shirt + tilt
- [ ] Weed smoked → green smell squiggles + stoned eyes
- [ ] Kissed by Amber (VIP watch) → lipstick mark on collar
- [ ] Won duffel bag → cash bulge in pants
- [ ] Crashed minivan → bandage on forehead

## 5. Racing + driving

- [ ] Gas station → Modded Car Guy → accept race → driving minigame
- [ ] Drive from any minivan zone → open destination menu
- [ ] Mountains run UNLOCKED after 30-rack purchase → drive_mountains launches
- [ ] Press Q during drive (if has 30-rack) → drinks beer, sobriety drops
- [ ] Press X during drive (if foundWeed) → rips bong, dilated_pupils set
- [ ] Complete drive → arrive at destination
- [ ] Crash mid-drive → back to starting scene + injury flag

## 6. Strip club rabbit hole

- [ ] **Get there**: from frontyard minivan → drive to strip_mall → walk right → approach club on the right side
- [ ] Club Purrrple storefront visible with flickering neon after 9 AM
- [ ] E on club door → bouncer dialogue → "Pay $20 cover" → enter club
- [ ] Inside: see bar, Tony (shady dude), stage with Amber, dancers, VIP curtain
- [ ] Talk to **Bartender** → buy whiskey (shot animation)
- [ ] Talk to **Tony** → play 3-card monte for $50 → win or lose outcomes
- [ ] Tony: lose → accept the bag run → +$600 + suspicion
- [ ] Tony: win → double or nothing → always lose big the second round
- [ ] Talk to **Amber** → 3 choices: tip / small talk / VIP
- [ ] VIP access: walk to the red velvet curtain on the right → E → enters strip_club_vip scene
- [ ] OR from Amber dialog → "Ask about the back room" → to_vip node → exitScene
- [ ] In VIP: 4 choices (watch / talk / break a rule / chicken out) → each with distinct outcomes

## 7. Trap house rabbit hole

- [ ] Sidewalk → The Girls visible (2 of them, not 1) at x≈480 after 9:30 AM
- [ ] E on Girls → "See what the fuss is about" → beats play → **scene transitions to girls_apartment**
- [ ] Girls apartment: 2 Girls on couch, lava lamp animated
- [ ] Talk to Girls on couch → "Take a hit" (bong animation) or "Want to see where the GOOD stuff lives" → scene transitions to trap_house
- [ ] Trap House: see Dealer, Jim (vacant stare), RayRay (twitchy), Trina
- [ ] Talk to Dealer → smoke crack (animation) OR buy stash OR (if cash_bulge) trigger shakedown
- [ ] Talk to RayRay → invite to BBQ → flags.rayray_invited
- [ ] All paranoia flags applied: dialogue in other scenes shifts after this

## 8. BBQ callback NPCs

- [ ] `dev.grantStripper()` then `dev.triggerBBQ()` → Amber shows up in BBQ scene + dialogue beat fires
- [ ] `dev.grantTrap()` then `dev.triggerBBQ()` → RayRay shows up at BBQ + dialogue beat fires
- [ ] Set `dev.setFlag("sharon_helped", true)` → Sharon's ex arrives
- [ ] Set `dev.setFlag("lipstick", true)` → MIL screams beat fires at 5:30

## 9. BBQ finale director (8 slots every 15 min from 5pm)

After `dev.triggerBBQ()`, wait/watch clock. Each slot should fire a different beat based on flags:

- [ ] 5:00 arrival (clean / wasted / suspicious based on state)
- [ ] 5:15 first callback slot (rayray OR amber)
- [ ] 5:30 evidence (MIL screams at lipstick, neighbor eyes for drug state)
- [ ] 5:45 escalation (Karen drink throw at suspicion≥60, fist fight at guns_fired)
- [ ] 6:00 second callback
- [ ] 6:15 penultimate (grill explosion if status != 'done' AND sobriety<40)
- [ ] 6:30 climax (cops raid / divorce / rayray / hero)
- [ ] 6:45 resolution → triggers ending

## 10. Time-of-day reactivity

- [ ] 7-9 AM: morning-drunk dialogue variants at NPCs
- [ ] 3-5 PM: late-afternoon urgency variants
- [ ] After 2+ vices used → cross-vice commentary at NPCs

## 11. Endings (20 total)

Force them with `dev.` helpers. Sample combos:

- [ ] **perfect_dad**: `dev.setSobriety(90); dev.setSuspicion(10); dev.setFlag("lawnStatus", 100); dev.setFlag("grillStatus", "done"); dev.triggerEnding()`
- [ ] **pyramid_king**: `dev.setVice("pyramid", 3); dev.triggerEnding()`
- [ ] **kingpin**: `dev.setVice("guns", 3); dev.setVice("gambling", 2); dev.setCash(500); dev.triggerEnding()`
- [ ] **divorce_papers**: `dev.setSuspicion(95); dev.triggerEnding()`
- [ ] **passed_out**: `dev.setSobriety(10); dev.state().energy = 10; dev.triggerEnding()`
- [ ] **hero_flip**: `dev.setFlag("heroicFlag", true); dev.setFlag("grillStatus", "done"); dev.triggerEnding()`
- [ ] **the_arrest**: `dev.setSuspicion(90); dev.setVice("guns", 3); dev.triggerEnding()`
- [ ] **lost_the_van**: `dev.setFlag("lostCar", true); dev.triggerEnding()`
- [ ] **won_the_civic**: `dev.setFlag("wonCar", true); dev.triggerEnding()`
- [ ] **enlightenment**: `dev.setSobriety(30); dev.triggerEnding()`
- [ ] **default_mediocre**: fresh game → `dev.triggerEnding()` → fallback

## 12. Full flows to stress-test (real playthroughs)

- [ ] **Clean run**: ignore all vices, mow lawn, grill well, arrive at BBQ sober → `perfect_dad` or `neighborhood_hero`
- [ ] **Messy run**: get drunk at Doug's, smoke weed in garage, visit stripper, visit trap house, arrive at BBQ wasted → expect: Amber arrives + RayRay arrives + MIL screams lipstick + Karen throws drink + cops raid + divorce threat + explosive ending
- [ ] **Hero run**: go deep into guns/drugs/theft but pick the heroic option at T3 → `hero_flip` if grill done
- [ ] **Broke run**: lose all money at Tony's monte game → forced to `no_cash` dialogue → return with empty pockets → `secret_gambler` ending

---

## What's known to work (automated verification)

- All JSON parses: `for f in src/data/dialogues/*.json; do node -e "JSON.parse(require('fs').readFileSync('$f'))"; done`
- TypeScript clean: `npx tsc --noEmit`
- Build succeeds: `npm run build`

## What to file as bug if it breaks

- Zone doesn't trigger dialogue even with correct `visibleWhen`
- Dialogue choice doesn't close/advance the dialogue
- Consumption pose doesn't render
- BBQ director fires wrong act beat for state
- Scene transition silently drops player to previous scene
