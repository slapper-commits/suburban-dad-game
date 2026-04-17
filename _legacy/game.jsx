/* SATURDAY — side-scroller pixel art edition
   Single-file React game. Loaded by index.html via Babel standalone.
   All rendering: inline SVG. No canvas. No <g transform>. */

const { useState, useEffect, useReducer, useCallback, useRef } = React;

/* ---------- utilities ---------- */
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const ft = m => { const h = Math.floor(m / 60); const mm = m % 60; const d = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${String(mm).padStart(2, "0")} ${d}`; };
const F = "'Courier New',monospace";

/* ---------- Person component (extended with item prop) ---------- */
function P({ x, y, shirt="#4a90d9", skin="#f0c89a", hair="#6b4c2a", pants="#4a5568",
  mouth="neutral", shades=false, beer=false, hat=false, hatColor="#cc3333",
  sz=1, sleepy=false, item=null }) {
  const s = sz;
  const headY = y - 41*s, headH = 12*s, headW = 14*s;
  const headX = x - 7*s;
  const eyeY = y - 36*s;
  const mouthY = y - 31.5*s;
  return <>
    <ellipse cx={x} cy={y+1} rx={9*s} ry={3*s} fill="rgba(0,0,0,0.1)" />
    <rect x={x-5*s} y={y-13*s} width={5*s} height={13*s} fill={pants} rx="1" />
    <rect x={x+1*s} y={y-13*s} width={5*s} height={13*s} fill={pants} rx="1" />
    <rect x={x-6*s} y={y-1*s} width={6*s} height={3*s} fill="#fff" rx="1" />
    <rect x={x+1*s} y={y-1*s} width={6*s} height={3*s} fill="#eee" rx="1" />
    <rect x={x-8*s} y={y-30*s} width={16*s} height={19*s} fill={shirt} rx="2" />
    <rect x={x-12*s} y={y-28*s} width={5*s} height={13*s} fill={shirt} rx="2" />
    <rect x={x-11*s} y={y-16*s} width={4*s} height={3.5*s} fill={skin} rx="1" />
    <rect x={x+7*s} y={y-28*s} width={5*s} height={13*s} fill={shirt} rx="2" />
    <rect x={x+8*s} y={y-16*s} width={4*s} height={3.5*s} fill={skin} rx="1" />
    {beer && <>
      <rect x={x+8*s} y={y-22*s} width={5*s} height={9*s} fill="#f0c040" rx="1" />
      <rect x={x+8*s} y={y-22*s} width={5*s} height={2*s} fill="#ccc" rx="0.5" />
    </>}
    {item === "spatula" && <>
      <rect x={x+9*s} y={y-34*s} width={1.5*s} height={18*s} fill="#888" />
      <rect x={x+6*s} y={y-36*s} width={7*s} height={4*s} fill="#aaa" rx="1" />
    </>}
    {item === "phone" && <rect x={x+8*s} y={y-20*s} width={4*s} height={6*s} fill="#222" rx="0.5" />}
    {item === "pipe" && <>
      <rect x={x+8*s} y={y-34*s} width={4*s} height={1.5*s} fill="#333" />
      <circle cx={x+14*s} cy={y-33.5*s} r={2*s} fill="#222" />
      <circle cx={x+14*s} cy={y-36*s} r={1*s} fill="#f0a040" opacity="0.7" />
    </>}
    {item === "gun" && <>
      <rect x={x+8*s} y={y-20*s} width={7*s} height={3*s} fill="#222" rx="0.5" />
      <rect x={x+9*s} y={y-18*s} width={2*s} height={4*s} fill="#222" />
    </>}
    {item === "briefcase" && <>
      <rect x={x+8*s} y={y-18*s} width={10*s} height={7*s} fill="#5a3a1a" rx="1" />
      <rect x={x+11*s} y={y-20*s} width={4*s} height={2*s} fill="#5a3a1a" rx="0.5" />
    </>}
    {item === "brochure" && <>
      <rect x={x+8*s} y={y-20*s} width={6*s} height={8*s} fill="#22aa55" rx="0.3" />
      <line x1={x+9*s} y1={y-17*s} x2={x+13*s} y2={y-17*s} stroke="#fff" strokeWidth="0.4" />
      <line x1={x+9*s} y1={y-15*s} x2={x+13*s} y2={y-15*s} stroke="#fff" strokeWidth="0.4" />
    </>}
    <rect x={headX} y={headY} width={headW} height={headH} fill={skin} rx={4*s} />
    {hat === "cap" ? <>
      <rect x={x-8*s} y={y-44*s} width={16*s} height={5*s} fill={hatColor} rx={2*s} />
      <rect x={x-12*s} y={y-40*s} width={12*s} height={2.5*s} fill={hatColor} rx="1" />
    </> : hat === "cowboy" ? <>
      <rect x={x-6*s} y={y-47*s} width={12*s} height={6*s} fill={hatColor} rx="1" />
      <rect x={x-12*s} y={y-42*s} width={24*s} height={2.5*s} fill={hatColor} rx="1" />
    </> : (
      <rect x={headX} y={y-43*s} width={headW} height={5*s} fill={hair} rx={3*s} />
    )}
    {shades ? <>
      <rect x={x-6*s} y={y-38*s} width={5.5*s} height={4*s} fill="#222" rx="1" />
      <rect x={x+1*s} y={y-38*s} width={5.5*s} height={4*s} fill="#222" rx="1" />
      <line x1={x-0.5*s} y1={eyeY} x2={x+1*s} y2={eyeY} stroke="#222" strokeWidth={0.8*s} />
    </> : sleepy ? <>
      <line x1={x-4.5*s} y1={eyeY} x2={x-1.5*s} y2={eyeY} stroke="#333" strokeWidth={1.2*s} strokeLinecap="round" />
      <line x1={x+2*s} y1={eyeY} x2={x+5*s} y2={eyeY} stroke="#333" strokeWidth={1.2*s} strokeLinecap="round" />
    </> : <>
      <circle cx={x-3*s} cy={eyeY} r={1.2*s} fill="#333" />
      <circle cx={x+3.5*s} cy={eyeY} r={1.2*s} fill="#333" />
    </>}
    {mouth==="neutral" && <line x1={x-2*s} y1={mouthY} x2={x+3*s} y2={mouthY} stroke="#a07050" strokeWidth={1.2*s} strokeLinecap="round" />}
    {mouth==="smile" && <path d={`M${x-2.5*s},${mouthY} Q${x+0.5*s},${mouthY+3*s} ${x+3*s},${mouthY}`} fill="none" stroke="#a07050" strokeWidth={1.2*s} strokeLinecap="round" />}
    {mouth==="grin" && <path d={`M${x-3*s},${mouthY-0.5*s} Q${x+0.5*s},${mouthY+4*s} ${x+3.5*s},${mouthY-0.5*s}`} fill="none" stroke="#a07050" strokeWidth={1.4*s} strokeLinecap="round" />}
    {mouth==="frown" && <path d={`M${x-2*s},${mouthY+1*s} Q${x+0.5*s},${mouthY-2*s} ${x+3*s},${mouthY+1*s}`} fill="none" stroke="#a07050" strokeWidth={1.2*s} strokeLinecap="round" />}
    {mouth==="shock" && <ellipse cx={x+0.5*s} cy={mouthY} rx={2*s} ry={2.5*s} fill="#a07050" opacity="0.5" />}
    {mouth==="smirk" && <>
      <line x1={x-2*s} y1={mouthY} x2={x+0.5*s} y2={mouthY} stroke="#a07050" strokeWidth={1*s} strokeLinecap="round" />
      <path d={`M${x+0.5*s},${mouthY} Q${x+2.5*s},${mouthY-2*s} ${x+4*s},${mouthY}`} fill="none" stroke="#a07050" strokeWidth={1.2*s} strokeLinecap="round" />
    </>}
  </>;
}

function Tp({ x, y, c="#666" }) {
  return <>
    <circle cx={x} cy={y-11} r={2.5} fill={c} />
    <rect x={x-2.5} y={y-9} width={5} height={7} fill={c} rx="1" />
    <rect x={x-3} y={y-2} width={2.5} height={5} fill={c} rx="0.5" />
    <rect x={x+0.5} y={y-2} width={2.5} height={5} fill={c} rx="0.5" />
  </>;
}

/* ---------- state derivations ---------- */
function getDadFace(s) {
  if (s.sobriety < 20) return "sleepy";
  if (s.sobriety < 40) return "grin";
  if (s.sobriety < 60) return "smile";
  if (s.suspicion > 70) return "shock";
  return "neutral";
}

/* vice signature colors (spec §2.6) */
const VICE_COLOR = {
  drugs: "#9b6b9b", alcohol: "#d4a54a", gambling: "#4a8a3a",
  prostitution: "#cc5588", guns: "#4a5a6a", pyramid: "#22aa55",
  racing: "#e08030", theft: "#2a6a6a", digital: "#22aacc",
};

/* location names for UI */
const LN = {
  kitchen: "Kitchen", frontyard: "Front Yard", garage: "The Garage",
  backyard: "Backyard", driveway: "Driveway",
  dougs: "Doug's", craigs: "Craig's", kevins: "Kevin's",
  kids_porch: "The Kid's Porch", sidewalk: "The Sidewalk",
  strip_mall: "Strip Mall", gas_station: "Gas Station",
  sketchy: "Sketchy Part of Town", highway: "Highway",
  store: "QuikStop", park: "Memorial Park", bbq: "The BBQ",
};

/* ---------- scripted wife texts (spec §7.1) ---------- */
const SCRIPTED_TEXTS = [
  { at: 435, body: "Morning! Charcoal (Kingsford!), buns, and the lawn. Party at 5. Love you" },
  { at: 600, body: "Getting the charcoal today right? Kingsford NOT the cheap stuff" },
  { at: 750, body: "How's the lawn coming?" },
  { at: 840, body: "My mom's coming at 4. PLEASE have the lawn done." },
  { at: 930, body: "" /* filled dynamically */, dyn: true },
  { at: 990, body: "People are here in 30 min" },
  { at: 1020, body: "GET HOME. NOW." },
];
/* Status-reactive nags: fire once when condition+time both met (spec: more reminders about shit you aren't doing) */
const NAGS = [
  { id:"lawn_9", after: 540, cond: s => s.lawnStatus < 30, body: "Lawn. Please. It's almost 9." },
  { id:"charcoal_10", after: 600, cond: s => s.grillStatus === "not_started", body: "Did you get the charcoal??" },
  { id:"lawn_noon", after: 720, cond: s => s.lawnStatus < 60, body: "Babe. The LAWN." },
  { id:"grill_1", after: 780, cond: s => s.grillStatus === "not_started" || s.grillStatus === "supplies_bought", body: "Are the coals going yet?" },
  { id:"lawn_2", after: 840, cond: s => s.lawnStatus < 95, body: "MOW. THE. LAWN." },
  { id:"grill_3", after: 900, cond: s => s.grillStatus !== "cooking" && s.grillStatus !== "done", body: "burgers on by 3:30 ok?" },
  { id:"both_4", after: 960, cond: s => s.lawnStatus < 95 || s.grillStatus !== "done", body: "where are you even right now" },
];
const REACTIVE = [
  { at: 30, body: "Everything ok? You're being quiet." },
  { at: 45, body: "Hello?? Answer me." },
  { at: 55, body: "I called Doug's wife. She said Doug hasn't seen you either." },
  { at: 60, body: "I'm coming to find you." },
  { at: 80, body: "Don't bother coming home." },
];

/* ---------- SCENARIOS ---------- */
/* Mutations per choice (all optional): next, loc, sob (sobriety delta), sus, cash,
   time (minutes), lawn, grill, vice:[id,depth], evidence, heroic, ending */
const S = {};

/* KITCHEN — start */
S.kitchen = {
  intro: { text: "Saturday, 7 AM. Kitchen smells like yesterday's coffee. Karen's note on the fridge: CHARCOAL (KINGSFORD!), BUNS, LAWN. PARTY AT 5. ♥", choices: [
    { text: "Grab keys. Head out front.", next: "outside", loc: "frontyard", time: 5 },
    { text: "Peek in the garage first", next: "intro", loc: "garage", time: 3 },
    { text: "Pour another coffee", next: "coffee", time: 10 },
  ]},
  coffee: { text: "The mug says #1 DAD. You bought it yourself. The lawn waits. Everything waits.", choices: [
    { text: "Enough stalling. Front yard.", next: "outside", loc: "frontyard", time: 5 },
    { text: "Check your phone", next: "coffee", time: 15, sus: 3 },
  ]},
};

/* FRONT YARD */
S.frontyard = {
  outside: {
    text: s => {
      if (s.lawnStatus >= 95) return "Lawn: immaculate. Stripes like a Rothko. Karen's face in the window is unreadable in a good way.";
      if (s.lawnStatus >= 60) return "Most of the lawn is stripes. The last stretch sits there like unfinished homework. Mailbox still leans.";
      if (s.lawnStatus >= 30) return "Half a lawn. A stark visible line where you stopped. The mown side smells like summer. The other side smells like guilt.";
      if (s.lawnStatus > 0) return "A few stripes down. The rest: shaggy. Mower's still in the driveway, blades still warm.";
      return "Your lawn. Shaggy. Mailbox leans slightly. The day is wide open. Down the street: Doug's already got a beer. At 8 AM.";
    },
    choices: s => [
      s.lawnStatus === 0
        ? { text: "Pull out the mower", next: "mow", time: 5 }
        : s.lawnStatus >= 95
          ? null
          : { text: `Resume mowing (${s.lawnStatus}% done)`, next: "mow", time: 5 },
      s.lawnStatus >= 95 ? { text: "Admire the lawn", next: "outside", time: 5 } : null,
      { text: "Wander toward Doug's", next: "intro", loc: "dougs", time: 10 },
      { text: "Kevin's waving you over", next: "intro", loc: "kevins", time: 10 },
      { text: "Walk the sidewalk", next: "intro", loc: "sidewalk", time: 8 },
      { text: "Backyard / grill", next: "prep", loc: "backyard", time: 3 },
      { text: "Garage", next: "intro", loc: "garage", time: 3 },
      { text: "Hop in the car", next: "intro", loc: "driveway", time: 2 },
      { text: "Drive to the store", next: "intro", loc: "store", time: 12, drive: true },
    ].filter(Boolean),
  },
  mow: {
    text: s => {
      const after = Math.min(100, s.lawnStatus + 33);
      if (s.lawnStatus === 0) return "Engine pulls on the third try. You carve the first stripe. God's own line of chlorophyll.";
      if (after >= 100) return "Final pass. You trim the last patch near the fence. It is complete. You are, for one moment, every dad who ever lived.";
      if (s.lawnStatus >= 60) return "Sweat on your brow. One more strip and the Hendersons will SEE this lawn.";
      return "More stripes. The sound of a two-stroke engine is the sound of a man at peace.";
    },
    choices: s => {
      const after = Math.min(100, s.lawnStatus + 33);
      const done = after >= 100;
      return [
        done
          ? { text: "Park the mower. Admire it.", next: "outside", time: 30, lawn: 33 }
          : { text: `Keep going (+33%)`, next: "mow", time: 30, lawn: 33 },
        { text: '"I deserve a break"', next: "intro", loc: "dougs", time: 8, lawn: 33 },
        { text: "Hydrate. Garage fridge.", next: "intro", loc: "garage", time: 5, lawn: 33 },
        { text: "Store run", next: "intro", loc: "store", time: 15, lawn: 33 },
      ];
    },
  },
  back: {
    text: s => s.lawnStatus >= 60
      ? "Back on your own lawn. Stripes you cut earlier still hold their line."
      : s.lawnStatus > 0
        ? "Back in the yard. The half-mowed line is still there, judging you."
        : "Back in the yard. The grass is still exactly as shaggy as you left it.",
    choices: [
      { text: "Back to the front", next: "outside", time: 3 },
      { text: "Backyard / grill", next: "prep", loc: "backyard", time: 5 },
      { text: "Garage", next: "intro", loc: "garage", time: 3 },
      { text: "Sidewalk", next: "intro", loc: "sidewalk", time: 8 },
    ],
  },
  confrontation: { text: "Karen is in the driveway. Arms crossed. 'We need to talk. NOW.'",
    beats: [
      { at: 0.05, who: "karen", emotion: "furious" },
      { at: 0.3,  who: "dad",   emotion: "guilty", fx: "sweatdrop" },
      { at: 0.6,  who: "karen", bubble: { text: "NOW.", kind: "shout" }, anchor: [340, 120] },
    ],
    choices: [
      { text: '"Babe I can explain"', next: "back", sus: -10, time: 15 },
      { text: "Try to hug her", next: "back", sus: -5, time: 10 },
      { text: "Mumble something", next: "back", sus: 5, time: 10 },
  ]},
};

/* GARAGE */
S.garage = {
  intro: { text: "The garage. Your sanctuary. Blink-182 poster. Beer fridge humming. Half-built birdhouse since February judges you.", choices: [
    { text: "Open the fridge", next: "beer" },
    { text: "Finish the birdhouse", next: "bird", time: 40 },
    { text: "Back outside", next: "outside", loc: "frontyard", time: 3 },
  ]},
  beer: { text: "Coors Light. IPA with a dog. A lonely seltzer. Cold air on your face feels like forgiveness.", choices: [
    { text: "Just one Coors", next: "buzzed", sob: -10, time: 5, vice: ["alcohol", 1] },
    { text: "Mystery IPA", next: "buzzed", sob: -20, time: 5, evidence: "smell", vice: ["alcohol", 1] },
    { text: "Close it. Not today.", next: "intro", time: 2 },
  ]},
  buzzed: { text: "Warmth. Lower stakes. The birdhouse looks finishable. The Hendersons look lovable.",
    beats: s => [
      { at: 0.2, who: "dad", emotion: s.sobriety < 50 ? "drunk" : "smirk" },
      s.sobriety < 40 && { at: 0.6, fx: "zzz", anchor: [260, 130] },
    ].filter(Boolean),
    choices: [
    { text: "Go be a dad", next: "outside", loc: "frontyard", time: 5 },
    { text: "To Doug's", next: "intro", loc: "dougs", time: 8 },
    { text: "Take the car for a run", next: "intro", loc: "store", time: 10, drive: true },
    { text: "One more wouldn't hurt", next: "beer" },
  ]},
  bird: { text: "Crooked but charming. You nailed the roof on straight for once. Genuine pride swells.", choices: [
    { text: "Show Karen later", next: "outside", loc: "frontyard", time: 5, sus: -10 },
  ]},
  confrontation: { text: "Karen in the garage doorway. 'What are you doing in here?' Her nose wrinkles.", choices: [
    { text: '"Organizing."', next: "intro", sus: -5, time: 15 },
    { text: "Hide the can", next: "intro", sus: 5, evidence: "smell", time: 10 },
  ]},
};

/* BACKYARD / GRILL — narration reflects grillStatus */
S.backyard = {
  prep: {
    text: s => {
      if (s.grillStatus === "done") return "Burgers resting on the platter. The grill ticks as it cools. You did a thing today.";
      if (s.grillStatus === "burnt") return "The grill is black. The kitchen is loud. Somewhere inside, a smoke alarm apologizes for nothing.";
      if (s.grillStatus === "cooking") return "Burgers on the grates. Grease flare. You should probably be watching these.";
      if (s.grillStatus === "prepped") return "Coals glowing white around the edges. Grill ready. Burgers in the fridge, waiting for their moment.";
      if (s.grillStatus === "supplies_bought") return "Charcoal bag on the patio. Lighter fluid next to it. Grill itself still cold. Time to build the pyramid.";
      return "The grill. Cold grates. No charcoal yet. String lights droop, waiting for dusk.";
    },
    choices: s => {
      const c = [];
      if (s.grillStatus === "not_started") c.push({ text: "Go to the store for charcoal", next: "intro", loc: "store", time: 15 });
      if (s.grillStatus === "supplies_bought") c.push({ text: "Build the fire (prep)", next: "charcoal", grill: "prepped", time: 20 });
      if (s.grillStatus === "prepped") c.push({ text: "Lay burgers on the grate", next: "cook", grill: "cooking", time: 30 });
      if (s.grillStatus === "cooking") {
        c.push({ text: "Flip attentively", next: "done", grill: "done", time: 15 });
        c.push({ text: "Walk away for a minute", next: "burnt", grill: "burnt", time: 20 });
      }
      if (s.grillStatus === "done" || s.grillStatus === "burnt") c.push({ text: "Bring the platter inside", next: "prep", time: 5 });
      c.push({ text: "Sit in the patio chair", next: "sit", time: 15 });
      c.push({ text: "Front yard", next: "outside", loc: "frontyard", time: 3 });
      c.push({ text: "Garage", next: "intro", loc: "garage", time: 3 });
      return c;
    },
  },
  charcoal: { text: "Pyramid of briquettes. Lighter fluid. Match. WHOOMPF. You are the architect of meat.", choices: [
    { text: "Back to the grill", next: "prep", time: 5 },
  ]},
  cook: { text: "Sizzle. Smoke. Burger smell rolling over the fence making dogs cry.", choices: [
    { text: "Back to the grill", next: "prep", time: 2 },
  ]},
  done: { text: "Perfect char. Pink centers. You are a craftsman. The platter looks professional.", choices: [
    { text: "Back to the grill", next: "prep", time: 2 },
  ]},
  burnt: { text: "Hockey pucks. Smoke alarm inside. Karen screams your name.", choices: [
    { text: "'They're blackened!'", next: "prep", sus: 10, time: 5 },
  ]},
  sit: {
    text: s => s.time >= 1020
      ? "You sit. Guests will arrive in minutes. The chair creaks like it knows."
      : "The chair creaks. A squirrel stares at you. You stare back. Nobody wins.",
    choices: [
      { text: "Get up. Do something.", next: "prep", time: 5 },
      { text: "Sit longer", next: "sit", time: 20, sus: 3 },
    ],
  },
};

/* DOUG'S — alcohol entry (spec §6.2) */
S.dougs = {
  intro: { text: "Doug's driveway. Lawn chair. Cooler. 'Saturday, brother. Sun's out, beers are cold. Don't start on me.'", choices: [
    { text: "Just one — it IS Saturday", next: "t1", sob: -10, time: 20, vice: ["alcohol", 1] },
    { text: '"Maybe later, Doug"', next: "back", loc: "frontyard", time: 3 },
    { text: "He mentioned poker?", next: "poker_hint", time: 5 },
  ]},
  t1: { text: "Beer. Sun. Doug's wife Brenda waves from the window with an expression the Geneva Convention has opinions about.", choices: [
    { text: "One more — water really", next: "t2", sob: -20, time: 40, vice: ["alcohol", 2], evidence: "smell" },
    { text: '"I gotta mow"', next: "outside", loc: "frontyard", time: 3 },
    { text: "Doug nods toward the garage", next: "poker_intro", time: 5 },
  ]},
  t2: { text: "Day drinking. Official. The words 'let me show you something' leave Doug's mouth and your spine goes still.", choices: [
    { text: "Follow Doug in", next: "t3", sob: -20, time: 60, vice: ["alcohol", 3] },
    { text: "Stumble home", next: "outside", loc: "frontyard", time: 10, evidence: "smell" },
  ]},
  t3: { text: "Blackout adjacent. You wake up on Doug's floor. The cooler is empty. Your phone has 14 missed things.", choices: [
    { text: "Crawl home", next: "outside", loc: "frontyard", sob: 10, time: 60, sus: 25, evidence: "smell" },
  ]},
  poker_hint: { text: "'Game starts around 11. Bring cash. Bring a better story than you had last time.'", choices: [
    { text: '"I\'ll be here"', next: "poker_intro", time: 3 },
    { text: "Walk away", next: "back", loc: "frontyard", time: 3 },
  ]},
  poker_intro: { text: "Folding table. Six chairs. Chips already stacked. Someone you don't know nurses a bourbon in the corner.", choices: [
    { text: "Play a few hands", next: "poker_t1", time: 45, cash: -20, vice: ["gambling", 1] },
    { text: "Watch one round", next: "intro", time: 15 },
  ]},
  poker_t1: { text: "You're up $30. Table laughs. Stranger doesn't. Stranger raises. Pot swells like a bruise.", choices: [
    { text: '"I\'m feeling lucky"', next: "poker_t2", time: 60, cash: -100, vice: ["gambling", 2] },
    { text: '"I\'m out"', next: "intro", cash: 30, time: 10 },
  ]},
  poker_t2: { text: "Stranger slides a card: 'If you need a bigger game, talk to me after.' His eyes don't blink enough.", choices: [
    { text: '"Where is it?"', next: "poker_t3", loc: "sketchy", time: 5 },
    { text: "Cash out. Leave.", next: "intro", time: 10 },
  ]},
  poker_t3: { text: "Basement. Real money. You're wearing khakis in a room that smells like smoke and decisions.", choices: [
    { text: "Go all in", next: "intro", loc: "frontyard", time: 120, cash: 600, vice: ["gambling", 3], evidence: "cash_bulge" },
    { text: "Fold and walk", next: "intro", loc: "frontyard", time: 120, cash: -200, vice: ["gambling", 3] },
  ]},
  confrontation: { text: "Karen's car in Doug's driveway. She's rolling down the window slowly. Like a horror movie.", choices: [
    { text: "Get in the car", next: "outside", loc: "frontyard", sus: -5, time: 10 },
  ]},
};

/* KEVIN'S — pyramid scheme (spec §6.6) */
S.kevins = {
  intro: { text: "Kevin's garage. Whiteboard. Laminated brochures. A banner: ELEVATÉ WELLNESS. He is smiling. He is ALWAYS smiling.", choices: [
    { text: '"Alright, five minutes"', next: "t1", time: 20, vice: ["pyramid", 1] },
    { text: '"Not today, Kevin"', next: "back", loc: "frontyard", time: 3 },
  ]},
  t1: { text: "'It's not a pyramid, it's a REVERSE FUNNEL SYSTEM.' He has drawn a pyramid. Upside down. On the whiteboard.", choices: [
    { text: '"Tell me about comp structure"', next: "t2", time: 60, cash: -200, vice: ["pyramid", 2] },
    { text: '"This is a pyramid scheme"', next: "t1", time: 5 },
    { text: "Back away slowly", next: "back", loc: "frontyard", time: 5 },
  ]},
  t2: { text: "You bought the starter kit. Seventeen bottles of 'mental clarity spray.' Kevin puts a hand on your shoulder. You are 'in.'", choices: [
    { text: "Go pitch strangers", next: "t3", time: 90, vice: ["pyramid", 3], evidence: "brochure" },
    { text: "Hide the bottles in the car", next: "back", loc: "frontyard", time: 10 },
  ]},
  t3: { text: "You are now Kevin. You cornered Doug. You cornered Craig. You cornered a teenager at the QuikStop. The word 'downline' has left your mouth.", choices: [
    { text: "Snap out of it. Go home.", next: "back", loc: "frontyard", time: 15 },
  ]},
  confrontation: { text: "Karen at Kevin's garage. Kevin is trying to pitch her. Karen is radiating heat.", choices: [
    { text: '"I was just leaving"', next: "back", loc: "frontyard", sus: -5, time: 10 },
  ]},
};

/* SIDEWALK — drugs entry (spec §6.1) */
S.sidewalk = {
  intro: { text: "Sidewalk. Sunny. Two women pass, laughing. One slows: 'You look like you could use a break from all that.' She nods at your lawn.", choices: [
    { text: '"I could, actually"', next: "t1", loc: "strip_mall", time: 30, vice: ["drugs", 1] },
    { text: '"Just cutting my grass"', next: "back", loc: "frontyard", time: 3 },
    { text: "Walk to the store", next: "intro", loc: "store", time: 10 },
    { text: "Walk to the gas station", next: "intro", loc: "gas_station", time: 12 },
  ]},
  back: { text: "Sidewalk. Same suburb. Somehow slightly different.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 5 },
    { text: "Store", next: "intro", loc: "store", time: 10 },
    { text: "Gas station", next: "intro", loc: "gas_station", time: 12 },
  ]},
};

/* STRIP MALL — drugs tier 1-2 */
S.strip_mall = {
  t1: { text: "Behind the dollar store. Milk crates. Bluetooth speaker. Glass pipe on a folded napkin. Nobody asks your name.", choices: [
    { text: "See what the fuss is about", next: "t1_done", sob: -20, time: 30, evidence: "dilated_pupils", vice: ["drugs", 1] },
    { text: "Just hang out, soak in the vibe", next: "t1_done", sob: -5, time: 20 },
    { text: '"Actually, I should go"', next: "intro", loc: "sidewalk", time: 5 },
  ]},
  t1_done: { text: "One of them slides you a number. 'We moved — way better.' The number says APT.", choices: [
    { text: '"Send me the address"', next: "t2", time: 10 },
    { text: "Pocket the number. Leave.", next: "intro", loc: "sidewalk", time: 10 },
  ]},
  t2: { text: "Apartment. Dim. Harder stuff on the coffee table. Nobody introduces themselves.", choices: [
    { text: "Stay for a bit — you earned it", next: "t2_done", sob: -35, time: 90, sus: 15, vice: ["drugs", 2], evidence: "dilated_pupils" },
    { text: "This is heavier than I expected", next: "intro", loc: "sidewalk", sob: -15, time: 60, vice: ["drugs", 2] },
  ]},
  t2_done: { text: "A guy in a jacket stands. 'There's a thing happening. You should come.' His keys are already out.", choices: [
    { text: "Get in the car", next: "t3", loc: "highway", time: 10 },
    { text: '"I gotta be somewhere"', next: "intro", loc: "sidewalk", time: 10 },
  ]},
  intro: { text: "Strip mall parking lot. Fluorescent, liminal. Kevin is somehow here with a clipboard.", choices: [
    { text: "Behind the building", next: "t1", time: 3 },
    { text: "Home", next: "outside", loc: "frontyard", time: 10 },
  ]},
};

/* HIGHWAY — drugs t3 / racing */
S.highway = {
  t3: { text: "Highway. Wrong direction. You're in someone's passenger seat. The sun is low and unhelpful.", choices: [
    { text: "Might as well see where this goes", next: "t3_end", sob: -50, time: 150, vice: ["drugs", 3], evidence: "dilated_pupils" },
    { text: '"I need to get out of this car"', next: "hero", sob: -40, time: 45, heroic: true, vice: ["drugs", 3] },
  ]},
  t3_end: { text: "You wake up in a gas station bathroom at dusk. You have a tattoo. It's a dolphin.", choices: [
    { text: "Drag yourself home", next: "outside", loc: "frontyard", time: 60, evidence: "dilated_pupils" },
  ]},
  hero: { text: "You grabbed the wheel. Saved someone's sister. Dropped at a gas station. Still wrecked. Still a hero.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 45, evidence: "dilated_pupils" },
  ]},
  /* Street racing tier 2-3 */
  r_meet: { text: "Parking lot. Modded Civics. A woman in a leather jacket laughs. 'Run for money?'", choices: [
    { text: '"How much?"', next: "r_t2", time: 60, cash: 100, vice: ["racing", 2] },
    { text: '"I drive a Camry"', next: "back", loc: "gas_station", time: 5 },
  ]},
  r_t2: { text: "You won by three car lengths. Nobody more surprised than you. 'You want a REAL race?'", choices: [
    { text: "Pink slips", next: "r_t3", time: 90, vice: ["racing", 3] },
    { text: "Take the cash. Leave.", next: "back", loc: "gas_station", time: 10 },
  ]},
  r_t3: { text: "You bet the car. The car your kids were born in. The car Karen calls 'the family car.'", choices: [
    { text: "Punch it", next: "r_win", time: 30, vice: ["racing", 3] },
    { text: "Hit the brakes. Bail.", next: "back", loc: "gas_station", time: 30 },
  ]},
  r_win: { text: "You win. Two cars now. Good luck explaining.", choices: [
    { text: "Drive home", next: "outside", loc: "frontyard", time: 30, evidence: "cash_bulge" },
  ]},
  back: { text: "Back on the shoulder. Cars whipping past. You are small.", choices: [
    { text: "Turn around", next: "outside", loc: "frontyard", time: 30 },
  ]},
};

/* CRAIG'S — guns (spec §6.5) */
S.craigs = {
  intro: { text: "Craig's driveway. Pickup bed full of boxes taped like secrets. Craig in a black tee. 'I need a hand moving some stuff.'", choices: [
    { text: '"Sure, what are neighbors for"', next: "t1", time: 30, cash: 50, vice: ["guns", 1] },
    { text: '"Can\'t right now, Craig"', next: "back", loc: "frontyard", time: 3 },
  ]},
  t1: { text: "Boxes are heavy. One clinks. Craig says 'don't drop that one.' His jaw is tight.", choices: [
    { text: '"Got another run?"', next: "t2", time: 90, cash: 300, vice: ["guns", 2] },
    { text: "Pocket the cash. Leave.", next: "back", loc: "frontyard", time: 5, evidence: "cash_bulge" },
  ]},
  t2: { text: "Craig's truck across town. You drive. He's quiet. At the meet, men you don't know don't introduce themselves.", choices: [
    { text: "Do the real job", next: "t3", time: 150, cash: 1000, vice: ["guns", 3] },
    { text: "Walk to the heroic door instead", next: "hero", time: 60, heroic: true, vice: ["guns", 3] },
    { text: '"I\'m out"', next: "back", loc: "frontyard", time: 45 },
  ]},
  t3: { text: "Warehouse. Life-changing money. You're wearing khakis. You can never unsee this room.", choices: [
    { text: "Home.", next: "outside", loc: "frontyard", time: 60, evidence: "cash_bulge", vice: ["guns", 3] },
  ]},
  hero: { text: "You called it in from a gas station payphone you didn't know still existed. Craig gets taken quietly. You get a handshake from a man in a windbreaker.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 60 },
  ]},
  back: { text: "Driveway. Your heart is too loud.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 5 },
  ]},
  confrontation: { text: "Karen at Craig's. She sees the boxes. Craig smiles like a lizard. 'Nice to meet you.'", choices: [
    { text: "Physically remove yourself", next: "back", loc: "frontyard", sus: 10, time: 10 },
  ]},
};

/* KID'S PORCH — digital crime (spec §6.9) */
S.kids_porch = {
  intro: { text: "A fifteen-year-old with three monitors on a porch. Energy drink graveyard. 'Hey mister — you know anything about computers?'", choices: [
    { text: '"What kind of crazy?"', next: "t1", time: 20, vice: ["digital", 1] },
    { text: '"Busy day, sorry kid"', next: "back", loc: "sidewalk", time: 3 },
  ]},
  t1: { text: "He's into an unsecured system that shouldn't be. You're impressed. You shouldn't be impressed.", choices: [
    { text: '"Let me help"', next: "t2", time: 60, cash: 300, vice: ["digital", 2] },
    { text: "Back slowly away", next: "back", loc: "sidewalk", time: 5 },
  ]},
  t2: { text: "You're the getaway driver. He's on your phone. 'Turn left. Wait. Now go.' You are a suburban dad in a cybercrime.", choices: [
    { text: "The Big One", next: "t3", time: 90, vice: ["digital", 3] },
    { text: "Drop him at his porch. Done.", next: "back", loc: "sidewalk", time: 15, evidence: "cash_bulge" },
  ]},
  t3: { text: "Corporate lobby. Earpiece. 'Look like you belong.' You are wearing your #1 DAD polo. You belong.", choices: [
    { text: "Execute", next: "outside", loc: "frontyard", time: 90, cash: 800, vice: ["digital", 3], evidence: "cash_bulge" },
    { text: "Heroic pivot: tip security", next: "outside", loc: "frontyard", time: 90, heroic: true, vice: ["digital", 3] },
  ]},
  back: { text: "Back on the sidewalk. The kid waves. Somehow ominous.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 5 },
  ]},
};

/* STORE — QuikStop */
S.store = {
  intro: { text: "QuikStop. Fluorescent judgment. The teenager at the vape display smirks at you. Dumpster out back — is that a leather bag?", choices: [
    { text: "Get charcoal & buns", next: "supplies", time: 15, cash: -20, grill: "supplies_bought" },
    { text: "Check the dumpster", next: "theft_t1", time: 15, vice: ["theft", 1] },
    { text: "Leave. Walk home.", next: "outside", loc: "frontyard", time: 15 },
  ]},
  supplies: { text: "Kingsford. Potato buns. A six-pack you'll regret later. The cashier has never in her life said hello.", choices: [
    { text: "Drive home", next: "outside", loc: "frontyard", time: 10, drive: true },
    { text: "Walk home", next: "outside", loc: "frontyard", time: 15 },
    { text: "One more aisle", next: "intro", time: 5 },
  ]},
  theft_t1: { text: "Leather bag behind the dumpster. $150 cash. And a small key. And a phone that isn't yours.", choices: [
    { text: "Take it all", next: "theft_t2", cash: 150, time: 15, vice: ["theft", 1] },
    { text: "Not my business", next: "intro", time: 5 },
  ]},
  theft_t2: { text: "Text on the strange phone: 'you hold that for me?' You now have a job.", choices: [
    { text: "Fence it for more", next: "theft_t3", time: 60, cash: 300, vice: ["theft", 2] },
    { text: "Ditch it. Go home.", next: "outside", loc: "frontyard", time: 10, evidence: "cash_bulge" },
  ]},
  theft_t3: { text: "The job is a house. In your neighborhood. Two doors from your in-laws.", choices: [
    { text: "Do it", next: "outside", loc: "frontyard", time: 120, cash: 500, vice: ["theft", 3], evidence: "cash_bulge" },
    { text: "Tip off the cops (heroic)", next: "outside", loc: "frontyard", time: 120, heroic: true, vice: ["theft", 3] },
  ]},
  confrontation: { text: "Karen at the QuikStop. Holding a receipt. 'This does not match the list.'", choices: [
    { text: '"I got extra"', next: "intro", sus: -5, time: 10 },
  ]},
};

/* GAS STATION — prostitution + racing entry */
S.gas_station = {
  intro: { text: "Pumps. $4.29. A woman in the next car smiles like she has nowhere to be and isn't rushing.", choices: [
    { text: '"She seems nice — hear her out"', next: "p_t1", time: 30, vice: ["prostitution", 1] },
    { text: "A modded Civic revs next to you", next: "r_light", time: 5 },
    { text: "Just getting gas", next: "back", time: 5 },
  ]},
  p_t1: { text: "Flirtatious. Warm. She writes a number on your hand.", choices: [
    { text: '"Where are you staying?"', next: "p_t2", time: 60, sus: 20, vice: ["prostitution", 2], evidence: "lipstick" },
    { text: "Thank her. Drive away.", next: "back", time: 5, sus: 5 },
  ]},
  p_t2: { text: "Motel. Not a nice one. The door locks twice.", choices: [
    { text: "Stay", next: "p_t3", time: 90, vice: ["prostitution", 3] },
    { text: "Can't do this", next: "back", time: 45, evidence: "lipstick" },
  ]},
  p_t3: { text: "A knock. Boyfriend. Money dispute. He is taller than you but less sober than you.", choices: [
    { text: "Pay him off", next: "back", cash: -300, time: 30, vice: ["prostitution", 3], evidence: "injury" },
    { text: "De-escalate, call a cab (heroic)", next: "back", time: 45, heroic: true, vice: ["prostitution", 3] },
  ]},
  r_light: { text: "He revs. You look. He knows.", choices: [
    { text: "Rev back", next: "r_race", time: 15, vice: ["racing", 1] },
    { text: "Stare straight ahead", next: "back", time: 3 },
  ]},
  r_race: { text: "Red light, green light, gone. You lost. Exhilarated. His brake lights say 'meet me at the lot.'", choices: [
    { text: "Follow him", next: "r_meet", loc: "highway", time: 15 },
    { text: "Go home, heart pounding", next: "back", time: 10 },
  ]},
  back: { text: "Pumps. You stare at the numbers tick up. You are still you.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", time: 15 },
    { text: "Sketchy part of town", next: "intro", loc: "sketchy", time: 20 },
  ]},
};

/* SKETCHY */
S.sketchy = {
  intro: { text: "Chain link. Boarded windows. A pit bull that doesn't bark — just watches. You don't belong and everyone knows.", choices: [
    { text: "Underground poker basement", next: "poker_t3", loc: "dougs", time: 10 },
    { text: "Back to the gas station", next: "back", loc: "gas_station", time: 20 },
  ]},
};

/* PARK */
S.park = {
  intro: { text: "Memorial Park. Dog. Jogger. Two men playing chess. 'In memory of Gerald.' You didn't know Gerald. You feel him anyway.", choices: [
    { text: "Walk the path (sober up)", next: "walk", sob: 15, time: 20 },
    { text: "Sit on Gerald's bench", next: "bench", sob: 5, time: 15 },
    { text: "Home", next: "outside", loc: "frontyard", time: 15 },
  ]},
  walk: { text: "Past the playground where your kids were small. You feel human again.", choices: [
    { text: "Home", next: "outside", loc: "frontyard", sob: 10, sus: -5, time: 15 },
  ]},
  bench: { text: "A leaf lands on your shoe. You consider Gerald's garage fridge.", choices: [
    { text: "Home, better", next: "outside", loc: "frontyard", sob: 10, time: 10 },
  ]},
};

/* DRIVEWAY — gateway */
S.driveway = {
  intro: { text: "Car. Basketball hoop. Garage door ajar. The day fans out.", choices: [
    { text: "Drive to QuikStop", next: "intro", loc: "store", time: 20, drive: true },
    { text: "Drive to the gas station", next: "intro", loc: "gas_station", time: 25, drive: true },
    { text: "Drive to Craig's", next: "intro", loc: "craigs", time: 15, drive: true },
    { text: "Drive to Doug's", next: "intro", loc: "dougs", time: 10, drive: true },
    { text: "Back inside", next: "outside", loc: "frontyard", time: 2 },
  ]},
};

/* BBQ — Act 5 social survival */
S.bbq = {
  intro: { text: "5 PM. Guests trickle in. String lights flick on. You have one hand on tongs and one hand on panic.", choices: [
    { text: "Greet mother-in-law", next: "mil" },
    { text: "Small-talk with Doug", next: "doug" },
    { text: "Drink with Brenda", next: "brenda" },
    { text: "Check the grill", next: "grill_check" },
  ]},
  mil: { text: "Mother-in-law leans in. Her perfume predates the war.", choices: [
    { text: '"So glad you came"', next: "intro", time: 10, sus: -5 },
    { text: "Deflect", next: "intro", time: 5 },
  ]},
  doug: { text: "Doug gives you the nod. The one that says 'I know.' You nod back. The ancient suburban treaty.", choices: [
    { text: "Laugh it off", next: "intro", time: 10 },
  ]},
  brenda: { text: "Brenda arrives with a salad and a grievance. 'Doug has been AT your house ALL DAY.' She has not brought Doug.", choices: [
    { text: '"He was a huge help"', next: "intro", time: 10, sus: -3 },
    { text: '"I wouldn\'t know"', next: "intro", time: 5, sus: 5 },
  ]},
  grill_check: { text: "Grill status check.", choices: [
    { text: "Plate the burgers", next: "ending_check", grill: "done", time: 15 },
    { text: "Back to the guests", next: "intro", time: 5 },
  ]},
  ending_check: { text: "It's nearly 8. Karen is watching you from across the patio with an expression you can't read.", choices: [
    { text: "Take the verdict", next: "intro", time: 60 },
  ]},
  confrontation: { text: "Karen pulls you aside. The guests pretend not to watch. They are watching.", choices: [
    { text: "Own it", next: "intro", sus: -20, time: 15 },
    { text: "Lie", next: "intro", sus: 10, time: 10 },
  ]},
};

/* ---------- Scene sub-renderers ---------- */
const g = 195;
function SkyStops(time) {
  if (time >= 1140) return [["0%","#1a1a3a"],["60%","#2d1f4e"],["100%","#4a2040"]];
  if (time >= 1020) return [["0%","#2d3a6a"],["60%","#d4785a"],["100%","#f0a040"]];
  if (time >= 960) return [["0%","#5a7aaa"],["70%","#e0a060"],["100%","#f0c040"]];
  if (time >= 780) return [["0%","#6a9aca"],["100%","#c8a870"]];
  return [["0%","#87CEEB"],["100%","#a8d8ea"]];
}

function Sun({time}) {
  if (time >= 1140) return <circle cx={420} cy={40} r={10} fill="#dde0ff" opacity="0.8" />;
  const sx = 380 - ((time - 420) / 780) * 340;
  const sy = 20 + Math.abs(((time - 720) / 500)) * 60;
  return <>
    <circle cx={sx} cy={sy} r={14} fill="#f0c040"/>
    {[0,45,90,135,180,225,270,315].map(a=>{const r=Math.PI*a/180;return <line key={a} x1={sx+Math.cos(r)*18} y1={sy+Math.sin(r)*18} x2={sx+Math.cos(r)*23} y2={sy+Math.sin(r)*23} stroke="#f0c040" strokeWidth="1.5" strokeLinecap="round"/>;})}
  </>;
}

function Clouds() {
  return <>
    <ellipse cx={80} cy={35} rx={22} ry={7} fill="#fff" opacity="0.7"/>
    <ellipse cx={300} cy={28} rx={18} ry={6} fill="#fff" opacity="0.6"/>
    <ellipse cx={420} cy={42} rx={16} ry={5} fill="#fff" opacity="0.5"/>
  </>;
}

function Ground() {
  return <>
    <rect x={0} y={g} width={480} height={65} fill="#5a9e3a"/>
    <rect x={0} y={g+35} width={480} height={30} fill="#d4cbb8"/>
    <line x1={0} y1={g+50} x2={480} y2={g+50} stroke="#c4bba8" strokeWidth="1" strokeDasharray="10 7"/>
  </>;
}

function DadChar({state, df}) {
  const beer = state.sobriety < 80 || state.viceDepth.alcohol > 0;
  const sz = state.sobriety < 20 ? 0.95 : 1;
  return <P x={250} y={g} mouth={df} beer={beer} shirt="#4a90d9" sz={sz} sleepy={state.sobriety < 20}/>;
}

function HouseScene({state, df, karen=true, lawn=true}) {
  const lawnQ = state.mowQuality < 60 ? "#7a8e3a" : "#5a9e3a";
  const stripes = state.lawnStatus > 30;
  return <>
    <rect x={50} y={g-60} width={85} height={60} fill="#e8d4b8"/>
    <polygon points={`42,${g-60} 92,${g-90} 143,${g-60}`} fill="#8B4513"/>
    <rect x={82} y={g-28} width={18} height={28} fill="#654321" rx="1"/>
    <circle cx={96} cy={g-14} r={1.5} fill="#d4a020"/>
    <rect x={58} y={g-48} width={14} height={12} fill="#87CEEB" stroke="#fff" strokeWidth="1.5"/>
    <rect x={110} y={g-48} width={14} height={12} fill="#87CEEB" stroke="#fff" strokeWidth="1.5"/>
    {karen && <>
      <rect x={114} y={g-46} width={8} height={7} fill="#f0c89a" rx="1"/>
      <circle cx={116.5} cy={g-44.5} r={0.7} fill="#333"/>
      <circle cx={119.5} cy={g-44.5} r={0.7} fill="#333"/>
      <rect x={113} y={g-48} width={10} height={3} fill="#8B4513" rx="1"/>
      <line x1={115} y1={g-41} x2={120} y2={g-41} stroke="#a07050" strokeWidth="0.7" strokeLinecap="round"/>
    </>}
    {/* lawn stripes */}
    {lawn && stripes && [0,1,2,3,4,5].map(i=>(
      <rect key={i} x={150+i*50} y={g+2} width={40} height={10} fill={lawnQ} opacity={i%2?0.4:0.15}/>
    ))}
    {/* grill */}
    <rect x={175} y={g-18} width={24} height={14} fill="#2d2d2d" rx="2"/>
    <rect x={180} y={g-4} width={2.5} height={10} fill="#555"/><rect x={192} y={g-4} width={2.5} height={10} fill="#555"/>
    {[0,1,2,3,4].map(i=><rect key={i} x={220+i*12} y={g-24} width={2.5} height={24} fill="#d4c9a8"/>)}
    <rect x={220} y={g-18} width={52} height={1.5} fill="#c4b998"/>
    <rect x={160} y={g-26} width={3} height={26} fill="#8B6914"/>
    <rect x={154} y={g-32} width={14} height={8} fill="#4a6fa5" rx="1"/>
    <rect x={336} y={g-30} width={7} height={32} fill="#8B6914" rx="1"/><ellipse cx={340} cy={g-42} rx={16} ry={16} fill="#3a8a3a"/>
    <rect x={370} y={g-14} width={45} height={14} fill="#6b8cae" rx="2"/>
    <rect x={378} y={g-22} width={27} height={10} fill="#6b8cae" rx="2"/>
    <circle cx={380} cy={g+1} r={4} fill="#333"/><circle cx={406} cy={g+1} r={4} fill="#333"/>
    <DadChar state={state} df={df}/>
  </>;
}

function KitchenScene({state, df}) {
  return <>
    <rect x={0} y={0} width={480} height={260} fill="#c8b890"/>
    <rect x={0} y={g} width={480} height={65} fill="#8a6a4a"/>
    <rect x={60} y={g-60} width={180} height={60} fill="#d4a078" rx="1"/>
    <rect x={60} y={g-60} width={180} height={4} fill="#3a2a1a"/>
    <rect x={70} y={g-50} width={30} height={44} fill="#eee" rx="1" stroke="#999" strokeWidth="0.5"/>
    <rect x={76} y={g-38} width={18} height={22} fill="#f0e080" rx="0.5"/>
    <text x={85} y={g-28} textAnchor="middle" fontSize="3" fill="#333" fontFamily="monospace">NOTE</text>
    <rect x={110} y={g-30} width={24} height={24} fill="#c4a878" rx="1"/>
    <rect x={150} y={g-28} width={40} height={22} fill="#555" rx="1"/>
    <rect x={200} y={g-24} width={14} height={14} fill="#fff" rx="7"/>
    <path d={`M205,${g-30} Q203,${g-35} 207,${g-38} Q209,${g-34} 205,${g-30}`} fill="#eee" opacity="0.4"/>
    <DadChar state={state} df={df}/>
  </>;
}

function GarageScene({state, df}) {
  return <>
    <rect x={30} y={g-70} width={110} height={70} fill="#d4c9a8"/>
    <rect x={40} y={g-58} width={90} height={58} fill="#8a7a5a" rx="1"/>
    {[0,1,2,3].map(i=><line key={i} x1={42} y1={g-48+i*13} x2={128} y2={g-48+i*13} stroke="#7a6a4a" strokeWidth="0.8"/>)}
    <rect x={175} y={g-44} width={26} height={44} fill="#ddd" rx="2"/>
    <rect x={177} y={g-42} width={22} height={18} fill="#cee8f0" rx="1"/>
    <rect x={177} y={g-22} width={22} height={18} fill="#eee" rx="1"/>
    <rect x={192} y={g-34} width={2} height={10} fill="#aaa" rx="1"/>
    <rect x={160} y={g-66} width={20} height={14} fill="#1a1a2e" rx="1"/>
    <text x={170} y={g-56} textAnchor="middle" fontSize="3.5" fill="#eee" fontFamily="monospace">B-182</text>
    <rect x={260} y={g-26} width={70} height={3} fill="#8B6914"/>
    <rect x={264} y={g-23} width={3} height={23} fill="#6b5310"/><rect x={324} y={g-23} width={3} height={23} fill="#6b5310"/>
    <rect x={285} y={g-38} width={10} height={10} fill="#d4a020" rx="1"/>
    <polygon points={`283,${g-38} 290,${g-44} 297,${g-38}`} fill="#8B4513"/>
    <ellipse cx={310} cy={g-30} rx={4} ry={3} fill="#555"/>
    <circle cx={312} cy={g-34} r={2.5} fill="#555"/>
    <circle cx={311} cy={g-35} r={0.7} fill="#5a5"/>
    <circle cx={313.5} cy={g-35} r={0.7} fill="#5a5"/>
    <line x1={370} y1={g} x2={366} y2={g-38} stroke="#aaa" strokeWidth="1.5"/>
    <line x1={374} y1={g} x2={369} y2={g-36} stroke="#999" strokeWidth="1.5"/>
    <P x={220} y={g} mouth={df} beer={state.viceDepth.alcohol>0} shirt="#4a90d9" sz={state.sobriety<20?0.95:1} sleepy={state.sobriety<20}/>
  </>;
}

function DougsScene({state, df}) {
  return <>
    <rect x={40} y={g-60} width={85} height={60} fill="#c8d4b8"/>
    <polygon points={`32,${g-60} 82,${g-90} 133,${g-60}`} fill="#5a6b4a"/>
    <rect x={72} y={g-28} width={18} height={28} fill="#4a5a3a" rx="1"/>
    <rect x={48} y={g-48} width={14} height={12} fill="#87CEEB" stroke="#fff" strokeWidth="1.5"/>
    <rect x={100} y={g-48} width={14} height={12} fill="#87CEEB" stroke="#fff" strokeWidth="1.5"/>
    <rect x={103} y={g-46} width={8} height={7} fill="#f0c89a" rx="1"/>
    <circle cx={105.5} cy={g-44.5} r={0.7} fill="#333"/>
    <circle cx={108.5} cy={g-44.5} r={0.7} fill="#333"/>
    <path d={`M104,${g-41.5} Q107,${g-43} 110,${g-41.5}`} fill="none" stroke="#a07050" strokeWidth="0.7"/>
    <rect x={160} y={g-16} width={50} height={16} fill="#8B4513" rx="2"/>
    <rect x={170} y={g-24} width={28} height={10} fill="#8B4513" rx="2"/>
    <circle cx={172} cy={g+1} r={4} fill="#333"/><circle cx={200} cy={g+1} r={4} fill="#333"/>
    <rect x={230} y={g-12} width={18} height={12} fill="#3a7bc8" rx="2"/>
    <rect x={232} y={g-14} width={14} height={2.5} fill="#2a6bb8" rx="1"/>
    <P x={200} y={g} mouth="smile" shades beer skin="#f0c89a" hair="#8B6914" shirt="#5a8a5a" pants="#555"/>
    <DadChar state={state} df={df}/>
  </>;
}

function CraigsScene({state, df}) {
  return <>
    <rect x={40} y={g-60} width={85} height={60} fill="#9a9a9a"/>
    <polygon points={`32,${g-60} 82,${g-90} 133,${g-60}`} fill="#4a4a4a"/>
    <rect x={72} y={g-28} width={18} height={28} fill="#2a2a2a" rx="1"/>
    <rect x={48} y={g-48} width={14} height={12} fill="#2a3a4a" stroke="#555"/>
    <rect x={100} y={g-48} width={14} height={12} fill="#2a3a4a" stroke="#555"/>
    <rect x={150} y={g-18} width={55} height={18} fill="#3a3a3a" rx="2"/>
    <rect x={160} y={g-28} width={30} height={12} fill="#3a3a3a" rx="2"/>
    <circle cx={160} cy={g+1} r={5} fill="#222"/><circle cx={198} cy={g+1} r={5} fill="#222"/>
    {/* boxes */}
    <rect x={145} y={g-32} width={14} height={10} fill="#8B6914"/>
    <rect x={160} y={g-32} width={14} height={10} fill="#8B6914"/>
    <line x1={145} y1={g-27} x2={159} y2={g-27} stroke="#3a2a1a" strokeWidth="0.6"/>
    <P x={220} y={g} mouth="neutral" skin="#d4a878" hair="#333" shirt="#2d2d2d" pants="#3d3d3d" item="briefcase"/>
    <DadChar state={state} df={df}/>
  </>;
}

function KevinsScene({state, df}) {
  return <>
    <rect x={30} y={g-70} width={120} height={70} fill="#f0e0a0"/>
    <polygon points={`22,${g-70} 90,${g-105} 158,${g-70}`} fill="#c44a4a"/>
    <rect x={40} y={g-54} width={100} height={54} fill="#3a3a3a" rx="1"/>
    {/* banner */}
    <rect x={45} y={g-50} width={90} height={10} fill="#22aa55"/>
    <text x={90} y={g-42} textAnchor="middle" fontSize="5" fill="#fff" fontFamily="monospace">ELEVATÉ WELLNESS</text>
    {/* whiteboard */}
    <rect x={55} y={g-36} width={60} height={28} fill="#fff"/>
    <polygon points={`70,${g-12} 85,${g-32} 100,${g-12}`} fill="none" stroke="#222" strokeWidth="0.8"/>
    <P x={220} y={g} mouth="grin" skin="#f0c89a" hair="#d4a020" shirt="#22aa55" pants="#3a3a5a" item="brochure"/>
    <DadChar state={state} df={df}/>
  </>;
}

function KidsPorchScene({state, df}) {
  return <>
    <rect x={30} y={g-60} width={120} height={60} fill="#c8c0b0"/>
    <rect x={20} y={g-20} width={140} height={20} fill="#8a7a5a"/>
    <rect x={22} y={g-22} width={4} height={22} fill="#6b5310"/>
    <rect x={154} y={g-22} width={4} height={22} fill="#6b5310"/>
    <rect x={60} y={g-28} width={30} height={8} fill="#222" rx="1"/>
    <rect x={62} y={g-26} width={26} height={4} fill="#22aacc"/>
    <P x={230} y={g} mouth="smirk" skin="#d4a878" hair="#222" shirt="#222" pants="#111" sz={0.85} item="phone"/>
    <DadChar state={state} df={df}/>
  </>;
}

function SidewalkScene({state, df}) {
  return <>
    <rect x={0} y={g-60} width={480} height={60} fill="#e8d4b8" opacity="0.3"/>
    <rect x={20} y={g-50} width={60} height={50} fill="#d4a078"/>
    <rect x={100} y={g-55} width={60} height={55} fill="#c8d4b8"/>
    <rect x={180} y={g-45} width={50} height={45} fill="#f0c89a"/>
    <P x={150} y={g} mouth="smile" skin="#c89878" hair="#333" shirt="#9b6b9b" pants="#444" sz={0.9}/>
    <P x={180} y={g} mouth="smile" skin="#c89878" hair="#333" shirt="#9b6b9b" pants="#444" sz={0.9}/>
    <DadChar state={state} df={df}/>
    <Tp x={420} y={g} c="#e06040"/>
  </>;
}

function StripMallScene({state, df}) {
  return <>
    <rect x={0} y={g-80} width={480} height={80} fill="#b8b0a0"/>
    <rect x={20} y={g-70} width={120} height={70} fill="#a49888"/>
    <rect x={160} y={g-70} width={120} height={70} fill="#9a8e7e"/>
    <rect x={300} y={g-70} width={120} height={70} fill="#a49888"/>
    <rect x={40} y={g-60} width={80} height={14} fill="#222"/>
    <text x={80} y={g-50} textAnchor="middle" fontSize="7" fill="#f0c040" fontFamily="monospace">DOLLAR</text>
    {/* crate */}
    <rect x={170} y={g-12} width={14} height={12} fill="#8B6914"/>
    <rect x={200} y={g-12} width={14} height={12} fill="#8B6914"/>
    <circle cx={192} cy={g-16} r={3} fill="#ddd" opacity="0.3"/>
    <P x={175} y={g} mouth="smile" skin="#c89878" hair="#333" shirt="#9b6b9b" pants="#444" sz={0.85} item="pipe"/>
    <DadChar state={state} df={df}/>
  </>;
}

function GasStationScene({state, df}) {
  return <>
    <rect x={40} y={g-80} width={180} height={80} fill="#e8e0d0"/>
    <rect x={60} y={g-92} width={140} height={18} fill="#e24b4a"/>
    <text x={130} y={g-79} textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">GAS &amp; GO</text>
    <rect x={260} y={g-34} width={14} height={34} fill="#ddd" rx="2"/>
    <rect x={278} y={g-34} width={14} height={34} fill="#ddd" rx="2"/>
    <rect x={300} y={g-14} width={45} height={14} fill="#b06060" rx="2"/>
    <rect x={308} y={g-22} width={27} height={10} fill="#b06060" rx="2"/>
    <circle cx={310} cy={g+1} r={4} fill="#333"/><circle cx={336} cy={g+1} r={4} fill="#333"/>
    <P x={380} y={g} mouth="smile" skin="#f5d0a0" hair="#8B4513" shirt="#cc5588" pants="#6a3a5a" sz={0.9}/>
    <DadChar state={state} df={df}/>
  </>;
}

function StoreScene({state, df}) {
  return <>
    <rect x={30} y={g-80} width={150} height={80} fill="#e8e0d0"/>
    <rect x={50} y={g-92} width={80} height={22} fill="#e24b4a" rx="2"/>
    <text x={90} y={g-77} textAnchor="middle" fontSize="9" fontWeight="500" fill="#fff" fontFamily="monospace">QUIKSTOP</text>
    <rect x={50} y={g-44} width={26} height={44} fill="#87CEEB" opacity="0.4"/>
    <rect x={86} y={g-44} width={26} height={44} fill="#87CEEB" opacity="0.4"/>
    <rect x={122} y={g-36} width={20} height={36} fill="#654321" rx="1"/>
    <rect x={220} y={g-34} width={14} height={34} fill="#ddd" rx="2"/>
    <rect x={300} y={g-14} width={45} height={14} fill="#9a6b4a" rx="2"/>
    <rect x={308} y={g-22} width={27} height={10} fill="#9a6b4a" rx="2"/>
    <circle cx={310} cy={g+1} r={4} fill="#333"/><circle cx={336} cy={g+1} r={4} fill="#333"/>
    {/* dumpster */}
    <rect x={400} y={g-18} width={40} height={18} fill="#3a5a3a"/>
    <rect x={402} y={g-22} width={36} height={4} fill="#2a4a2a"/>
    <P x={155} y={g} mouth="smirk" skin="#d4a878" hair="#222" shirt="#222" pants="#111" sz={0.85}/>
    <DadChar state={state} df={df}/>
  </>;
}

function HighwayScene({state, df}) {
  return <>
    <rect x={0} y={g-60} width={480} height={60} fill="#9a8e7e" opacity="0.3"/>
    <rect x={0} y={g} width={480} height={65} fill="#3a3a3a"/>
    <line x1={0} y1={g+32} x2={480} y2={g+32} stroke="#f0c040" strokeWidth="2" strokeDasharray="20 15"/>
    {/* mountains */}
    <polygon points={`0,${g} 80,${g-60} 160,${g-20} 240,${g-50} 320,${g-10} 400,${g-40} 480,${g}`} fill="#6a7a8a" opacity="0.5"/>
    <rect x={200} y={g-24} width={60} height={20} fill="#c44a4a" rx="3"/>
    <rect x={212} y={g-36} width={36} height={14} fill="#c44a4a" rx="2"/>
    <circle cx={216} cy={g+1} r={5} fill="#222"/><circle cx={254} cy={g+1} r={5} fill="#222"/>
    <rect x={240} y={g-32} width={10} height={10} fill="#222"/>
    {/* speed lines */}
    {[0,1,2].map(i=><line key={i} x1={60+i*40} y1={g-12} x2={100+i*40} y2={g-12} stroke="#fff" strokeWidth="1" opacity="0.6"/>)}
  </>;
}

function SketchyScene({state, df}) {
  return <>
    <rect x={0} y={g-90} width={480} height={90} fill="#5a4a3a"/>
    <rect x={30} y={g-70} width={100} height={70} fill="#3a2a1a"/>
    <rect x={150} y={g-80} width={100} height={80} fill="#2a2a2a"/>
    <rect x={270} y={g-70} width={100} height={70} fill="#3a3a2a"/>
    {/* boards */}
    <rect x={40} y={g-50} width={30} height={20} fill="#6b5310" opacity="0.8"/>
    <rect x={170} y={g-60} width={30} height={20} fill="#6b5310" opacity="0.8"/>
    {/* chain link */}
    {[0,1,2,3,4,5,6].map(i=><line key={i} x1={380+i*10} y1={g-30} x2={390+i*10} y2={g-10} stroke="#888" strokeWidth="0.5"/>)}
    <P x={160} y={g} mouth="neutral" skin="#a07858" hair="#222" shirt="#222" pants="#111" sz={0.9}/>
    <DadChar state={state} df={df}/>
  </>;
}

function ParkScene({state, df}) {
  return <>
    <rect x={46} y={g-30} width={7} height={32} fill="#8B6914" rx="1"/><ellipse cx={50} cy={g-42} rx={18} ry={18} fill="#3a8a3a"/>
    <rect x={96} y={g-28} width={7} height={30} fill="#8B6914" rx="1"/><ellipse cx={100} cy={g-40} rx={15} ry={15} fill="#4a9a4a"/>
    <rect x={140} y={g-7} width={28} height={2.5} fill="#8B6914" rx="1"/>
    <rect x={142} y={g-12} width={24} height={2.5} fill="#8B6914" rx="1"/>
    <rect x={144} y={g-4} width={2.5} height={10} fill="#6b5310"/><rect x={163} y={g-4} width={2.5} height={10} fill="#6b5310"/>
    <rect x={149} y={g-6} width={10} height={2} fill="#d4a020" rx="0.5"/>
    <ellipse cx={260} cy={g} rx={40} ry={10} fill="#5a9ec8" opacity="0.5"/>
    <ellipse cx={250} cy={g-4} rx={4} ry={2.5} fill="#f0c040"/>
    <circle cx={253} cy={g-7} r={2.5} fill="#f0c040"/>
    <ellipse cx={200} cy={g-2} rx={6} ry={4} fill="#c89060"/>
    <circle cx={205} cy={g-6} r={3} fill="#c89060"/>
    <rect x={316} y={g-26} width={6} height={28} fill="#8B6914" rx="1"/><ellipse cx={319} cy={g-38} rx={14} ry={14} fill="#2d7a2d"/>
    <P x={355} y={g} mouth="neutral" skin="#d4a878" hair="#ccc" shirt="#5a6a4a" pants="#555" sz={0.8}/>
    <P x={395} y={g} mouth="smirk" skin="#e8b888" hair="#ddd" shirt="#6a5a4a" pants="#444" sz={0.8}/>
    <P x={170} y={g} mouth={df} beer={state.sobriety<60} shirt="#4a90d9"/>
  </>;
}

function BbqScene({state, df}) {
  const stripes = state.lawnStatus > 30;
  const lawnQ = state.mowQuality < 60 ? "#7a8e3a" : "#5a9e3a";
  return <>
    {/* back of the house */}
    <rect x={20} y={g-70} width={100} height={70} fill="#e8d4b8"/>
    <rect x={30} y={g-30} width={80} height={30} fill="#c4a878"/>
    {/* string lights */}
    <path d={`M120,${g-60} Q240,${g-50} 360,${g-60}`} fill="none" stroke="#8B6914" strokeWidth="0.8"/>
    {[0,1,2,3,4].map(i=><circle key={i} cx={140+i*55} cy={g-55} r={2.5} fill="#f0c040"/>)}
    {/* grill */}
    <rect x={140} y={g-18} width={24} height={14} fill="#2d2d2d" rx="2"/>
    <rect x={144} y={g-24} width={16} height={6} fill="#888" opacity="0.6"/>
    {/* table */}
    <rect x={260} y={g-14} width={80} height={3} fill="#8B6914"/>
    <rect x={265} y={g-11} width={3} height={11} fill="#6b5310"/><rect x={332} y={g-11} width={3} height={11} fill="#6b5310"/>
    <rect x={272} y={g-20} width={14} height={8} fill="#fff"/>
    <rect x={292} y={g-20} width={14} height={8} fill="#fff"/>
    <rect x={312} y={g-20} width={14} height={8} fill="#fff"/>
    {/* lawn */}
    {stripes && [0,1,2,3,4].map(i=>(
      <rect key={i} x={0+i*96} y={g+8} width={80} height={6} fill={lawnQ} opacity={i%2?0.4:0.15}/>
    ))}
    {/* guests */}
    <P x={90} y={g} mouth="frown" skin="#f0c89a" hair="#ccc" shirt="#6a5a6a" pants="#5a5a5a" sz={0.9}/>
    <P x={190} y={g} mouth="smile" shades beer hat="cap" skin="#e8b888" hair="#8B4513" shirt="#cc4444" pants="#2d3a4a"/>
    <P x={380} y={g} mouth="frown" skin="#f0c89a" hair="#8B4513" shirt="#cc6688" pants="#6a5a7a"/>
    <DadChar state={state} df={df}/>
  </>;
}

/* ---------- Scene dispatcher ---------- */
/* Cast positions per location — head center (x, headY) for each character
   present in the scene. Used by the cartoon Director to paint emotions/FX
   over the right face. Falls back to a default if loc is unknown. */
const CAST_POS = {
  kitchen:    { dad:{ x:160, headY:128 }, karen:{ x:320, headY:128 } },
  frontyard:  { dad:{ x:240, headY:160 }, karen:{ x:380, headY:160 } },
  backyard:   { dad:{ x:260, headY:155 }, karen:{ x:180, headY:155 } },
  garage:     { dad:{ x:240, headY:155 }, doug:{ x:360, headY:155 } },
  dougs:      { dad:{ x:240, headY:155 }, doug:{ x:340, headY:155 } },
  craigs:     { dad:{ x:240, headY:155 }, craig:{ x:340, headY:155 } },
  kevins:     { dad:{ x:240, headY:155 }, kevin:{ x:340, headY:155 } },
  kids_porch: { dad:{ x:240, headY:155 } },
  sidewalk:   { dad:{ x:240, headY:155 } },
  strip_mall: { dad:{ x:240, headY:155 } },
  gas_station:{ dad:{ x:240, headY:155 } },
  highway:    { dad:{ x:240, headY:155 } },
  sketchy:    { dad:{ x:240, headY:155 } },
  store:      { dad:{ x:240, headY:155 } },
  park:       { dad:{ x:240, headY:155 } },
  driveway:   { dad:{ x:240, headY:160 } },
  bbq:        { dad:{ x:260, headY:155 }, karen:{ x:180, headY:155 }, mil:{ x:120, headY:155 }, doug:{ x:340, headY:155 } },
};

function Scene({ loc, state, beats, progress, nowTs }) {
  const df = getDadFace(state);
  const stops = SkyStops(state.time);
  const cast = CAST_POS[loc] || { dad:{ x:240, headY:155 } };
  return (
    <svg width="100%" viewBox="0 0 480 260" style={{display:"block"}}>
      <defs>
        <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o,c])=><stop key={o} offset={o} stopColor={c}/>)}
        </linearGradient>
      </defs>
      <rect width="480" height="260" fill="url(#sk)"/>
      <Sun time={state.time}/>
      <Clouds/>
      <Ground/>
      {loc==="kitchen" && <KitchenScene state={state} df={df}/>}
      {loc==="frontyard" && <HouseScene state={state} df={df}/>}
      {loc==="garage" && <GarageScene state={state} df={df}/>}
      {loc==="backyard" && <BbqScene state={{...state, lawnStatus: state.lawnStatus, mowQuality: state.mowQuality}} df={df}/>}
      {loc==="dougs" && <DougsScene state={state} df={df}/>}
      {loc==="craigs" && <CraigsScene state={state} df={df}/>}
      {loc==="kevins" && <KevinsScene state={state} df={df}/>}
      {loc==="kids_porch" && <KidsPorchScene state={state} df={df}/>}
      {loc==="sidewalk" && <SidewalkScene state={state} df={df}/>}
      {loc==="strip_mall" && <StripMallScene state={state} df={df}/>}
      {loc==="gas_station" && <GasStationScene state={state} df={df}/>}
      {loc==="highway" && <HighwayScene state={state} df={df}/>}
      {loc==="sketchy" && <SketchyScene state={state} df={df}/>}
      {loc==="store" && <StoreScene state={state} df={df}/>}
      {loc==="park" && <ParkScene state={state} df={df}/>}
      {loc==="bbq" && <BbqScene state={state} df={df}/>}
      {loc==="driveway" && <HouseScene state={state} df={df} karen={false}/>}
      {/* intox overlays */}
      {state.sobriety < 80 && <rect width="480" height="260" fill="#d4a54a" opacity={Math.min(0.25,(80-state.sobriety)/200)} pointerEvents="none"/>}
      {state.sobriety < 40 && <rect width="480" height="260" fill="#9b6b9b" opacity="0.1" pointerEvents="none"/>}
      {/* vice tint (strongest) */}
      {Object.entries(state.viceDepth).filter(([,d])=>d>=2).slice(0,1).map(([v])=>(
        <rect key={v} width="480" height="260" fill={VICE_COLOR[v]} opacity="0.08" pointerEvents="none"/>
      ))}
      {/* Cartoon Director — emotions/FX/bubbles synced to typewriter */}
      {window.Cartoon && <window.Cartoon.Beat beats={beats} progress={progress} cast={cast} nowTs={nowTs}/>}
    </svg>
  );
}

/* ---------- reducer ---------- */
const INITIAL_STATE = {
  time: 420, sobriety: 100, suspicion: 0, cash: 60,
  lawnStatus: 0, mowQuality: 100, grillStatus: "not_started",
  viceDepth: { drugs:0, alcohol:0, gambling:0, prostitution:0, guns:0, pyramid:0, racing:0, theft:0, digital:0 },
  heroicFlag: false, evidence: [], contacts: [],
  loc: "kitchen", scn: "intro",
  sentTexts: [], sentReactive: [], sentNags: [],
  phoneQueue: [],
  ended: false, endingIdx: null,
};

function reducer(state, action) {
  if (action.type === "APPLY") {
    const c = action.choice;
    let ns = { ...state };
    const prevSob = state.sobriety;
    if (c.sob) ns.sobriety = cl(ns.sobriety + c.sob, 0, 100);
    if (c.sus) ns.suspicion = cl(ns.suspicion + c.sus, 0, 100);
    if (c.cash) ns.cash = Math.max(0, ns.cash + c.cash);
    if (c.time) ns.time = ns.time + c.time;
    if (c.lawn) ns.lawnStatus = cl(ns.lawnStatus + c.lawn, 0, 100);
    if (c.grill) ns.grillStatus = c.grill;
    if (c.vice) ns.viceDepth = { ...ns.viceDepth, [c.vice[0]]: Math.max(ns.viceDepth[c.vice[0]], c.vice[1]) };
    if (c.evidence && !ns.evidence.includes(c.evidence)) ns.evidence = [...ns.evidence, c.evidence];
    if (c.heroic) ns.heroicFlag = true;
    /* sobriety recovery if this choice didn't reduce sobriety */
    if (!c.sob && c.time && c.time >= 15) ns.sobriety = cl(ns.sobriety + Math.floor(c.time/30)*5, 0, 100);
    /* mowing drunk = crooked_mow evidence */
    if (c.lawn && prevSob < 60 && !ns.evidence.includes("crooked_mow")) {
      ns.evidence = [...ns.evidence, "crooked_mow"];
      ns.mowQuality = Math.max(0, ns.mowQuality - 20);
    }
    if (c.loc) ns.loc = c.loc;
    if (c.next) ns.scn = c.next;
    /* check scripted texts */
    const newToasts = [];
    SCRIPTED_TEXTS.forEach((t,i)=>{
      if (!ns.sentTexts.includes(i) && ns.time >= t.at) {
        let body = t.body;
        if (t.dyn) body = ns.lawnStatus > 80 ? "Lawn looks great! ❤️" : "Where are you??";
        newToasts.push({ from: "Karen", body, time: t.at });
        ns.sentTexts = [...ns.sentTexts, i];
      }
    });
    REACTIVE.forEach((t,i)=>{
      if (!ns.sentReactive.includes(i) && ns.suspicion >= t.at) {
        newToasts.push({ from: "Karen", body: t.body, time: ns.time });
        ns.sentReactive = [...ns.sentReactive, i];
      }
    });
    NAGS.forEach(n => {
      if (!ns.sentNags.includes(n.id) && ns.time >= n.after && n.cond(ns)) {
        newToasts.push({ from: "Karen", body: n.body, time: ns.time });
        ns.sentNags = [...ns.sentNags, n.id];
      }
    });
    if (newToasts.length) ns.phoneQueue = [...ns.phoneQueue, ...newToasts];
    /* confrontation trigger */
    if (ns.suspicion >= 60 && state.suspicion < 60) {
      if (S[ns.loc] && S[ns.loc].confrontation) ns.scn = "confrontation";
    }
    /* Force-yank toward home at 4:30 if far away */
    const HOME_LOCS = ["frontyard","backyard","kitchen","driveway","garage","bbq"];
    if (ns.time >= 990 && ns.time < 1020 && !HOME_LOCS.includes(ns.loc)) {
      ns.loc = "frontyard"; ns.scn = "outside";
      ns.phoneQueue = [...ns.phoneQueue, { from:"Karen", body:"you better be walking in the door RIGHT NOW", time: ns.time }];
    }
    /* BBQ force-trigger from ANYWHERE at 5 PM */
    if (ns.time >= 1020) { ns.loc = "bbq"; ns.scn = "intro"; }
    /* check end */
    if (ns.time >= 1200) ns.ended = true;
    return ns;
  }
  if (action.type === "DISMISS_TOAST") {
    return { ...state, phoneQueue: state.phoneQueue.slice(1) };
  }
  if (action.type === "RESET") return INITIAL_STATE;
  return state;
}

/* ---------- endings (spec §9, evaluated 12→1, first match fires) ---------- */
function getEnding(s) {
  const maxVice = Math.max(...Object.values(s.viceDepth));
  const viceCount = Object.values(s.viceDepth).filter(d=>d>=1).length;
  /* 12: Loop — hidden, requires perfect + specific flag (we skip specific flag; show if perfect) */
  /* 11: Enlightenment */
  if (viceCount >= 3 && s.sobriety < 40) return { n:11, t:"THE ENLIGHTENMENT", g:"C", d:"You laid in the grass and watched clouds become Gerald. You are changed. Karen is also changed. Not in a good way." };
  /* 10: Kingpin */
  if (s.viceDepth.guns >= 3 && (s.viceDepth.gambling >= 2 || s.viceDepth.pyramid >= 2) && s.cash > 300) return { n:10, t:"THE KINGPIN", g:"D+", d:"Dark money in a gym bag. Two neighbors 'work for you' now. The kids call you sir. This is not the man she married." };
  /* 9: Arrest */
  if (s.viceDepth.guns >= 3 || s.viceDepth.theft >= 3 || s.viceDepth.digital >= 3) return { n:9, t:"THE ARREST", g:"F", d:"Pixel police. Pixel handcuffs. Mother-in-law still holding the potato salad as you are read your rights." };
  /* 8: Confrontation Collapse */
  if (s.suspicion >= 85) return { n:8, t:"THE CONFRONTATION COLLAPSE", g:"F", d:"She already packed a bag. Everything you loved fits in the Camry's back seat. She keeps the house." };
  /* 7: No-Show */
  if (s.time >= 1080 && s.loc !== "bbq" && s.loc !== "frontyard" && s.loc !== "backyard") return { n:7, t:"THE NO-SHOW", g:"D", d:"6 PM. You are not home. Karen is explaining your absence with a face that has stopped trying." };
  /* 6: Duffel Bag */
  if (s.cash > 500 && !s.heroicFlag && maxVice < 3) return { n:6, t:"THE DUFFEL BAG", g:"B-", d:"Burgers were fine. Lawn was fine. There is a duffel bag in the garage you cannot explain. You will explain it eventually." };
  /* 5: Hero Flip */
  if (s.heroicFlag && maxVice >= 2) return { n:5, t:"THE HERO FLIP", g:"B", d:"You saw the bottom of a bad thing and pulled somebody out. Nobody at the BBQ knows. You know. Maybe that's enough." };
  /* 4: Half-Mow */
  if (s.lawnStatus >= 30 && s.lawnStatus < 70 && s.suspicion < 70) return { n:4, t:"THE HALF-MOW", g:"C", d:"A perfect visible line down the middle of the yard where you stopped. It's kind of art. Kind of a cry for help." };
  /* 3: Functioning Disaster */
  if (s.lawnStatus >= 50 && s.grillStatus === "cooking" || (maxVice >= 2 && s.suspicion >= 30 && s.suspicion <= 60)) return { n:3, t:"THE FUNCTIONING DISASTER", g:"C+", d:"You're talking too loud. The burgers are slightly charred. Karen is watching. You hold it together, a held-together that has visible seams." };
  /* 2: Close Call */
  if (s.lawnStatus >= 80 && s.grillStatus === "done" && maxVice <= 1 && s.suspicion < 40) return { n:2, t:"THE CLOSE CALL", g:"B+", d:"You were almost a bad guy today. You weren't. Karen squeezes your shoulder. You almost cry into the coleslaw." };
  /* 1: Perfect Saturday */
  if (s.lawnStatus >= 95 && s.grillStatus === "done" && viceCount === 0 && s.suspicion < 30) return { n:1, t:"THE PERFECT SATURDAY", g:"A+", d:"Lawn: immaculate. Burgers: medium. Karen: proud. You: hollow. You wash your hands for too long in the half-bath." };
  return { n:0, t:"THE SURVIVOR", g:"C", d:"BBQ happened. People ate. No authorities. You collapse at 9:15, asleep before the bridge documentary." };
}

/* ---------- UI atoms ---------- */
function Meter({l,v,c}){ return (
  <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.6)",padding:"3px 8px",borderRadius:8}}>
    <span style={{fontSize:9,color:"#ccc",minWidth:54,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"monospace"}}>{l}</span>
    <div style={{width:50,height:5,background:"rgba(255,255,255,0.15)",borderRadius:3,overflow:"hidden"}}>
      <div style={{width:`${v}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.5s"}}/>
    </div>
    <span style={{fontSize:9,color:c,minWidth:18,textAlign:"right",fontFamily:"monospace"}}>{v}</span>
  </div>
);}

function PhoneToast({ toast, onDismiss }) {
  useEffect(()=>{
    if (!toast) return;
    const t = setTimeout(onDismiss, 4000);
    return ()=>clearTimeout(t);
  }, [toast, onDismiss]);
  if (!toast) return null;
  return (
    <div onClick={onDismiss} style={{
      position:"absolute", top:10, left:"50%", transform:"translateX(-50%)",
      background:"#1e1b17", border:"1px solid rgba(240,192,64,0.3)", borderRadius:10,
      padding:"8px 14px", minWidth:240, maxWidth:360, zIndex:50, cursor:"pointer",
      boxShadow:"0 8px 24px rgba(0,0,0,0.5)", animation:"slideDown 0.5s ease"
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <div style={{width:18,height:18,borderRadius:"50%",background:"#cc6688",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700}}>K</div>
        <span style={{fontSize:9,color:"#f0c040",letterSpacing:1}}>KAREN · {ft(toast.time)}</span>
      </div>
      <div style={{fontSize:12,color:"#c8cce0",lineHeight:1.4,fontFamily:F}}>{toast.body}</div>
    </div>
  );
}

function EvidenceDots({ev }) {
  if (!ev.length) return null;
  const icons = { dilated_pupils:"👁", smell:"🍺", lipstick:"💋", cash_bulge:"💵", injury:"🩹", crooked_mow:"✂", brochure:"📄" };
  return (
    <div style={{display:"flex",gap:3,background:"rgba(0,0,0,0.6)",padding:"3px 8px",borderRadius:8}}>
      <span style={{fontSize:9,color:"#ccc",letterSpacing:0.5,fontFamily:"monospace"}}>EV</span>
      {ev.map((e,i)=><span key={i} title={e} style={{fontSize:10}}>{icons[e]||"·"}</span>)}
    </div>
  );
}

/* ---------- App ---------- */
/* Driving mini-game: dodge obstacles, get wilder the drunker you are. */
function DriveMinigame({ from, to, sobriety, onComplete }) {
  const buzz = Math.max(0, 100 - (sobriety ?? 100));
  const [carLane, setCarLane] = useState(1); // 0,1,2
  const [offset, setOffset] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [hits, setHits] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState(null);
  const DURATION = buzz > 60 ? 9 : 7; // seconds
  const W = 480, H = 260;
  const lanes = [120, 240, 360];
  const laneRef = useRef(carLane);
  const hitRef = useRef(hits);
  const obsRef = useRef(obstacles);
  laneRef.current = carLane; hitRef.current = hits; obsRef.current = obstacles;

  // spawn + scroll
  useEffect(()=>{
    if (done) return;
    const iv = setInterval(()=>{
      setOffset(o => (o + 8 + buzz*0.05) % 40);
      setElapsed(e => e + 0.06);
      // auto-drift if drunk
      if (buzz > 40 && Math.random() < buzz/2000) {
        setCarLane(l => {
          const dir = Math.random() < 0.5 ? -1 : 1;
          return Math.max(0, Math.min(2, l + dir));
        });
      }
      setObstacles(prev => {
        let next = prev.map(o => ({...o, y: o.y + 14 + buzz*0.08 })).filter(o => o.y < H + 30);
        // spawn
        if (Math.random() < 0.08 + buzz*0.002) {
          const kinds = ["cone","car","mail"];
          const k = kinds[Math.floor(Math.random()*kinds.length)];
          next.push({ id: Math.random(), lane: Math.floor(Math.random()*3), y: -30, kind: k });
        }
        // collision
        next = next.filter(o => {
          if (o.lane === laneRef.current && o.y > 180 && o.y < 230 && !o.hit) {
            o.hit = true;
            setHits(h => h + 1);
            return false;
          }
          return true;
        });
        return next;
      });
    }, 60);
    return () => clearInterval(iv);
  }, [done, buzz]);

  // end timer
  useEffect(()=>{
    if (done) return;
    if (elapsed >= DURATION) {
      const hs = hitRef.current;
      const crashed = hs >= 3 || (buzz > 70 && hs >= 2);
      const sob = buzz > 50 ? -3 : 0; // the stress sobers you a bit? no — driving drunk doesn't sober. Keep 0.
      const result = {
        hits: hs,
        crash: crashed,
        clean: hs === 0,
        sus: crashed ? 10 : hs > 0 ? 3 : 0,
        sob: 0,
        cash: crashed ? -40 : 0,
        evidence: crashed ? (buzz > 60 ? "dented_fender" : "parking_scratch") : null,
      };
      setSummary(result);
      setDone(true);
    }
  }, [elapsed, DURATION, buzz, done]);

  // keyboard
  useEffect(()=>{
    const k = e => {
      if (done) return;
      if (e.key === "ArrowLeft" || e.key === "a") setCarLane(l => Math.max(0, l-1));
      if (e.key === "ArrowRight" || e.key === "d") setCarLane(l => Math.min(2, l+1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [done]);

  const wobble = buzz > 40 ? Math.sin(elapsed*4) * (buzz/20) : 0;
  const blur = buzz > 75 ? 2 : buzz > 55 ? 1 : 0;
  const carX = lanes[carLane] - 20 + wobble;
  const skyTint = buzz > 60 ? "#2a1a2a" : "#4a5a8a";

  return (
    <div style={{fontFamily:F,background:"#111118",borderRadius:12,overflow:"hidden",position:"relative"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{display:"block",width:"100%",filter:blur?`blur(${blur}px)`:"none"}}>
        <rect x="0" y="0" width={W} height={H} fill={skyTint}/>
        {/* horizon + road */}
        <rect x="0" y={H*0.45} width={W} height={H*0.55} fill="#1a1a20"/>
        <polygon points={`60,${H} 180,${H*0.45} 300,${H*0.45} 420,${H}`} fill="#2a2a35"/>
        {/* lane dashes */}
        {[0,1,2,3,4,5,6].map(i => (
          <g key={i}>
            <rect x={W/2 - 60 - (i*10)} y={H*0.45 + i*30 - (offset/2)} width="4" height="14" fill="#d0b050"/>
            <rect x={W/2 + 56 + (i*10)} y={H*0.45 + i*30 - (offset/2)} width="4" height="14" fill="#d0b050"/>
          </g>
        ))}
        {/* obstacles */}
        {obstacles.map(o => {
          const x = lanes[o.lane] - 16;
          const c = o.kind === "cone" ? "#e06030" : o.kind === "car" ? "#8a4a4a" : "#6a5a3a";
          return <rect key={o.id} x={x} y={o.y} width="32" height="24" fill={c} stroke="#000" strokeWidth="1"/>;
        })}
        {/* player car */}
        <rect x={carX} y="195" width="40" height="40" fill="#4a8acc" stroke="#000" strokeWidth="1"/>
        <rect x={carX+4} y="200" width="32" height="10" fill="#6acfff"/>
        <rect x={carX+2} y="230" width="8" height="6" fill="#222"/>
        <rect x={carX+30} y="230" width="8" height="6" fill="#222"/>
        {/* HUD */}
        <rect x="8" y="8" width="120" height="18" fill="rgba(0,0,0,0.6)"/>
        <text x="14" y="21" fill="#f0c040" fontSize="10" fontFamily="monospace">{from} → {to}</text>
        <rect x={W-90} y="8" width="82" height="18" fill="rgba(0,0,0,0.6)"/>
        <text x={W-84} y="21" fill={hits>0?"#e24b4a":"#5DCAA5"} fontSize="10" fontFamily="monospace">HITS: {hits}</text>
        {buzz > 50 && <text x={W/2} y="40" fill="#e24b4a" fontSize="11" textAnchor="middle" fontFamily="monospace" opacity={0.5+Math.sin(elapsed*6)*0.3}>★ DRUNK ★</text>}
      </svg>
      {!done && (
        <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
          <button onClick={()=>setCarLane(l=>Math.max(0,l-1))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.15)",color:"#f0c040",padding:"12px",fontSize:18,cursor:"pointer",borderRadius:6,fontFamily:F}}>◀ LEFT</button>
          <div style={{fontSize:10,color:"#8a9aba",minWidth:60,textAlign:"center"}}>{Math.max(0,DURATION-elapsed).toFixed(1)}s</div>
          <button onClick={()=>setCarLane(l=>Math.min(2,l+1))} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.15)",color:"#f0c040",padding:"12px",fontSize:18,cursor:"pointer",borderRadius:6,fontFamily:F}}>RIGHT ▶</button>
        </div>
      )}
      {done && summary && (
        <div style={{padding:"14px 18px",color:"#c8cce0",fontSize:13,lineHeight:1.7}}>
          <div style={{color:"#f0c040",fontSize:11,letterSpacing:2,marginBottom:8}}>▸ DRIVE COMPLETE</div>
          {summary.crash ? <div>You get there. The front bumper does not. {buzz>60?"You don't remember the last three blocks.":"A mailbox lost a leg."}</div>
            : summary.clean ? <div>Clean drive. The radio plays a song you used to like.</div>
            : <div>You made it. Mostly. There's a scuff on the rim you'll explain later.</div>}
          <div style={{marginTop:8,fontSize:11,color:"#8a9aba"}}>
            Hits: {summary.hits} {summary.crash && "· crashed"} {summary.evidence && `· +${summary.evidence}`}
          </div>
          <button onClick={()=>onComplete(summary)} style={{marginTop:14,background:"none",border:"1px solid #f0c040",color:"#f0c040",padding:"8px 20px",fontSize:11,fontFamily:F,cursor:"pointer",letterSpacing:2,borderRadius:4}}>Continue →</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("title");
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [rev, setRev] = useState(0);
  const [showC, setShowC] = useState(false);
  const [fade, setFade] = useState(false);
  const [slideDir, setSlideDir] = useState(0); // -1 left, 1 right, 0 none
  const rawSc = S[state.loc]?.[state.scn];
  const HOME_SET = { frontyard:1, backyard:1, kitchen:1, driveway:1, garage:1, bbq:1 };
  const [nowTs, setNowTs] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setNowTs(t => t + 1), 120);
    return () => clearInterval(iv);
  }, []);
  const sc = rawSc ? (() => {
    const text = typeof rawSc.text === "function" ? rawSc.text(state) : rawSc.text;
    let choices = typeof rawSc.choices === "function" ? rawSc.choices(state) : rawSc.choices;
    // Always offer a way home from remote locations (unless confrontation)
    if (!HOME_SET[state.loc] && state.scn !== "confrontation") {
      const already = choices.some(c => c && c.loc === "frontyard");
      if (!already) {
        const urgent = state.time >= 900; // 3 PM +
        const label = urgent ? "⚠ Bail — drive home" : "Head home";
        choices = [...choices, { text: label, next: "outside", loc: "frontyard", time: 12, drive: true }];
      }
    }
    const rawBeats = rawSc.beats
      ? (typeof rawSc.beats === "function" ? rawSc.beats(state) : rawSc.beats)
      : (window.Cartoon ? window.Cartoon.inferBeats(text) : []);
    return { text, choices, beats: rawBeats };
  })() : null;
  const progress = sc ? Math.min(1, rev / Math.max(1, sc.text.length)) : 0;

  useEffect(()=>{
    if (mode !== "play" || !sc) return;
    setRev(0); setShowC(false);
    let i = 0;
    const iv = setInterval(()=>{
      i++;
      setRev(i);
      if (i >= sc.text.length) { clearInterval(iv); setTimeout(()=>setShowC(true), 200); }
    }, 18);
    return ()=>clearInterval(iv);
  }, [state.loc, state.scn, mode]);

  useEffect(()=>{
    if (mode === "play" && state.ended) setMode("end");
  }, [state.ended, mode]);

  const [driveChoice, setDriveChoice] = useState(null);

  const pick = useCallback((c)=>{
    setShowC(false);
    if (c.drive) {
      setDriveChoice(c);
      setMode("drive");
      return;
    }
    if (c.loc && c.loc !== state.loc) {
      setSlideDir(1);
      setFade(true);
      setTimeout(()=>{
        dispatch({ type:"APPLY", choice: c });
        setSlideDir(-1);
        setTimeout(()=>{ setFade(false); setSlideDir(0); }, 30);
      }, 380);
    } else {
      dispatch({ type:"APPLY", choice: c });
    }
  }, [state.loc]);

  const finishDrive = useCallback((result) => {
    // apply the drive consequences on top of the original choice
    const mut = { ...driveChoice };
    mut.sus = (mut.sus || 0) + (result.sus || 0);
    mut.sob = (mut.sob || 0) + (result.sob || 0);
    mut.cash = (mut.cash || 0) + (result.cash || 0);
    if (result.evidence) mut.evidence = result.evidence;
    if (result.crash) {
      // wrong destination: detour to sketchy if we hit too much drunk
      if ((100 - (state.sobriety + (mut.sob||0))) > 70) mut.loc = "sketchy";
    }
    dispatch({ type:"APPLY", choice: mut });
    setDriveChoice(null);
    setMode("play");
  }, [driveChoice, state.sobriety]);

  const reset = () => { dispatch({ type:"RESET" }); setMode("title"); };

  if (mode === "title") return (
    <div style={{fontFamily:F,background:"#111118",minHeight:440,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",position:"relative",overflow:"hidden",borderRadius:12,padding:24}}>
      <div style={{fontSize:10,letterSpacing:5,color:"#5a7aaa",marginBottom:8,textTransform:"uppercase"}}>A suburban odyssey</div>
      <h1 style={{fontSize:44,fontWeight:700,letterSpacing:3,margin:"0 0 8px",color:"#f0c040"}}>SATURDAY</h1>
      <div style={{fontSize:13,color:"#6a7a9a",marginBottom:6,fontStyle:"italic",textAlign:"center"}}>Two tasks. Nine temptations. One suburban dad.</div>
      <div style={{fontSize:11,color:"#4a5a7a",marginBottom:28,textAlign:"center"}}>The BBQ is at 5. It's 7 AM. What could go wrong?</div>
      <button onClick={()=>setMode("play")} style={{background:"none",border:"1px solid #f0c040",color:"#f0c040",padding:"10px 32px",fontSize:12,fontFamily:F,cursor:"pointer",letterSpacing:3,textTransform:"uppercase",borderRadius:4}}>Start your Saturday</button>
      <div style={{marginTop:16,fontSize:9,color:"#3a4a6a"}}>12 endings · 9 vices · 0 excuses</div>
    </div>
  );

  if (mode === "drive") {
    return <DriveMinigame from={LN[state.loc]||state.loc} to={LN[driveChoice?.loc]||driveChoice?.loc||"?"} sobriety={state.sobriety} onComplete={finishDrive}/>;
  }

  if (mode === "end") {
    const e = getEnding(state);
    const gc = e.g[0]==="A"?"#5DCAA5":e.g[0]==="B"?"#f0c040":e.g[0]==="C"?"#e08020":"#e24b4a";
    const endState = { ...state, time: 1200 };
    return (
      <div style={{fontFamily:F,background:"#111118",color:"#fff",borderRadius:12,overflow:"hidden"}}>
        <div style={{position:"relative"}}>
          <Scene loc="backyard" state={endState}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 40%, rgba(17,17,24,0.9) 100%)"}}/>
          <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center",fontSize:10,letterSpacing:4,color:"#f0c040"}}>8:00 PM · BACKYARD</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"18px 28px 28px",textAlign:"center"}}>
        <div style={{fontSize:9,letterSpacing:4,color:"#5a7aaa",marginBottom:12}}>— FINAL —</div>
        <div style={{fontSize:52,fontWeight:700,color:gc,marginBottom:4}}>{e.g}</div>
        <h2 style={{fontSize:18,margin:"0 0 12px",color:"#f0c040",fontWeight:500}}>{e.t}</h2>
        <p style={{fontSize:12,lineHeight:1.75,maxWidth:420,color:"#8a9aba",marginBottom:24}}>{e.d}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, auto)",gap:16,marginBottom:24,fontSize:11}}>
          {[["Sobriety",state.sobriety,state.sobriety>50?"#5DCAA5":"#e24b4a"],
            ["Suspicion",state.suspicion,state.suspicion>50?"#e24b4a":"#5DCAA5"],
            ["Lawn",state.lawnStatus,state.lawnStatus>80?"#5DCAA5":"#e24b4a"],
            ["Cash",state.cash,"#f0c040"]].map(([a,v,c])=>(
            <div key={a}><div style={{color:"#5a7aaa",marginBottom:2,fontSize:9,letterSpacing:1}}>{a}</div><div style={{fontSize:16,color:c}}>{typeof v==="number"?v:v}</div></div>
          ))}
        </div>
        <button onClick={reset} style={{background:"none",border:"1px solid #f0c040",color:"#f0c040",padding:"9px 28px",fontSize:12,fontFamily:F,cursor:"pointer",letterSpacing:2,borderRadius:4}}>Try another Saturday</button>
        </div>
      </div>
    );
  }

  const tc = state.time >= 1080 ? "#e24b4a" : state.time >= 1020 ? "#f0a040" : "#fff";
  const bw = state.time >= 1080 ? "BBQ NOW" : state.time >= 1020 ? "GUESTS ARRIVING" : state.time >= 960 ? "Getting late..." : "";
  const toast = state.phoneQueue[0];

  return (
    <div style={{fontFamily:F,background:"#111118",borderRadius:12,overflow:"hidden",position:"relative"}}>
      <style>{`
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .cb:hover { background: rgba(240,192,64,0.08) !important; border-color: rgba(240,192,64,0.25) !important; color: #f0c040 !important; }
      `}</style>
      <div style={{position:"relative",opacity:fade?0:1,transform:`translateX(${slideDir*60}px)`,transition:"opacity 0.35s, transform 0.35s cubic-bezier(.4,.1,.3,1)"}}>
        <Scene loc={state.loc} state={state} beats={sc?.beats} progress={progress} nowTs={nowTs}/>
        <div style={{position:"absolute",top:6,left:6,display:"flex",flexDirection:"column",gap:3}}>
          <Meter l="Sobriety" v={state.sobriety} c={state.sobriety<40?"#e24b4a":state.sobriety<60?"#f0c040":"#5DCAA5"}/>
          <Meter l="Suspicion" v={state.suspicion} c={state.suspicion>60?"#e24b4a":state.suspicion>30?"#f0c040":"#5DCAA5"}/>
          <Meter l="Lawn" v={state.lawnStatus} c={state.lawnStatus>70?"#5DCAA5":state.lawnStatus>30?"#f0c040":"#e24b4a"}/>
          <EvidenceDots ev={state.evidence}/>
        </div>
        <div style={{position:"absolute",top:6,right:6,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
          <div style={{background:"rgba(0,0,0,0.6)",padding:"3px 9px",borderRadius:8,fontSize:13,fontWeight:700,color:tc,fontFamily:F}}>{ft(state.time)}</div>
          <div style={{background:"rgba(0,0,0,0.6)",padding:"2px 7px",borderRadius:6,fontSize:8,color:"#aaa",letterSpacing:1,textTransform:"uppercase"}}>{LN[state.loc]}</div>
          <div style={{background:"rgba(0,0,0,0.6)",padding:"2px 7px",borderRadius:6,fontSize:8,color:"#f0c040",letterSpacing:1,fontFamily:F}}>${state.cash}</div>
          {bw && <div style={{background:state.time>=1080?"rgba(226,75,74,0.8)":"rgba(240,160,64,0.7)",padding:"2px 7px",borderRadius:6,fontSize:7,color:"#fff",letterSpacing:1,fontWeight:700}}>{bw}</div>}
        </div>
        <PhoneToast toast={toast} onDismiss={()=>dispatch({type:"DISMISS_TOAST"})}/>
      </div>
      <div style={{padding:"14px 18px",minHeight:160,display:"flex",flexDirection:"column"}}>
        {sc && <div style={{fontSize:13,lineHeight:1.75,color:"#c8cce0",marginBottom:14,minHeight:48,fontStyle:"italic"}}>
          <span style={{color:"#f0c040",fontStyle:"normal",fontSize:10,marginRight:5}}>▸</span>
          {sc.text.slice(0,rev)}
          {rev<sc.text.length && <span style={{color:"#f0c040",animation:"blink 0.6s step-end infinite"}}>▌</span>}
        </div>}
        {!sc && <div style={{color:"#e24b4a",fontSize:12}}>Missing scene: {state.loc}/{state.scn}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5,opacity:showC?1:0,transform:showC?"none":"translateY(6px)",transition:"all 0.35s"}}>
          {sc?.choices.map((c,i)=>(
            <button key={i} onClick={()=>pick(c)} className="cb" style={{
              background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:6,
              padding:"9px 12px",color:"#8a9aba",fontSize:12,fontFamily:F,
              cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"
            }}>
              <span style={{fontSize:10,color:"#f0c040",opacity:0.4,fontWeight:700,minWidth:12}}>{String.fromCharCode(65+i)}</span>
              {c.text}
              {c.loc && <span style={{marginLeft:"auto",fontSize:8,opacity:0.3}}>→</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
