/* ============================================================
 * CARTOON — dynamic character expression library
 * ------------------------------------------------------------
 * Three layers:
 *   1. FACE ATOMS   — eyes / brows / mouths (raw SVG paint)
 *   2. FX + BUBBLES — sweat, stars, hearts, motion lines, speech, etc
 *   3. DIRECTOR     — beats synced to typewriter progress
 *
 * All coords are ABSOLUTE (no SVG <g transform>) so it composes
 * cleanly with the P component in game.jsx.
 * ============================================================ */
(function(){
  const { createElement: h, Fragment } = React;

  /* ---------- 1. FACE ATOMS --------------------------------- */
  // Eyes: each returns SVG at a given center (cx,cy) with size s
  const EYES = {
    normal:  (x,y,s)=> h("rect",{x:x-s/2,y:y-s/2,width:s,height:s,fill:"#000"}),
    wide:    (x,y,s)=> h(Fragment,null,
              h("rect",{x:x-s,y:y-s,width:s*2,height:s*2,fill:"#fff",stroke:"#000",strokeWidth:1}),
              h("rect",{x:x-s/2,y:y-s/2,width:s,height:s,fill:"#000"})),
    closed:  (x,y,s)=> h("rect",{x:x-s,y:y,width:s*2,height:1,fill:"#000"}),
    squint:  (x,y,s)=> h("rect",{x:x-s,y:y-1,width:s*2,height:2,fill:"#000"}),
    slant_a: (x,y,s)=> h("polygon",{points:`${x-s},${y+s/2} ${x+s},${y-s/2} ${x+s},${y+s/2}`,fill:"#000"}), // angry slant
    slant_s: (x,y,s)=> h("polygon",{points:`${x-s},${y-s/2} ${x+s},${y+s/2} ${x-s},${y+s/2}`,fill:"#000"}), // sad slant
    swirl:   (x,y,s)=> h("path",{d:`M ${x-s} ${y} a ${s} ${s} 0 1 1 ${s*2} 0 a ${s/2} ${s/2} 0 1 0 -${s} 0`,fill:"none",stroke:"#000",strokeWidth:1.5}),
    x_dead:  (x,y,s)=> h(Fragment,null,
              h("line",{x1:x-s,y1:y-s,x2:x+s,y2:y+s,stroke:"#000",strokeWidth:2}),
              h("line",{x1:x-s,y1:y+s,x2:x+s,y2:y-s,stroke:"#000",strokeWidth:2})),
    heart:   (x,y,s)=> h("path",{d:`M ${x} ${y+s} L ${x-s} ${y-s/2} A ${s/2} ${s/2} 0 0 1 ${x} ${y-s/2} A ${s/2} ${s/2} 0 0 1 ${x+s} ${y-s/2} Z`,fill:"#e24b6a"}),
    dollar:  (x,y,s)=> h("text",{x:x,y:y+s,fontSize:s*2.2,textAnchor:"middle",fill:"#2a8a4a",fontWeight:700},"$"),
    tear:    (x,y,s)=> h(Fragment,null,
              h("rect",{x:x-s/2,y:y-s/2,width:s,height:s,fill:"#000"}),
              h("path",{d:`M ${x-s/2} ${y+s} Q ${x} ${y+s*3} ${x+s/2} ${y+s}`,fill:"#6acfff",stroke:"#000",strokeWidth:0.5})),
  };

  // Brows: drawn above the eye line
  const BROWS = {
    none:    ()=> null,
    flat:    (x,y,w)=> h("rect",{x:x-w/2,y:y,width:w,height:1,fill:"#000"}),
    raised:  (x,y,w)=> h("rect",{x:x-w/2,y:y-2,width:w,height:1,fill:"#000"}),
    furrow:  (x,y,w,side)=> h("polygon",{points:side<0?`${x-w/2},${y} ${x+w/2},${y-2} ${x+w/2},${y}`:`${x-w/2},${y-2} ${x+w/2},${y} ${x-w/2},${y}`,fill:"#000"}),
    worry:   (x,y,w,side)=> h("polygon",{points:side<0?`${x-w/2},${y-2} ${x+w/2},${y} ${x+w/2},${y-1}`:`${x-w/2},${y} ${x+w/2},${y-2} ${x-w/2},${y-1}`,fill:"#000"}),
  };

  // Mouths: centered at (x,y), width w
  const MOUTHS = {
    neutral: (x,y,w)=> h("rect",{x:x-w/2,y:y,width:w,height:1,fill:"#000"}),
    smile:   (x,y,w)=> h("path",{d:`M ${x-w/2} ${y} Q ${x} ${y+w/2} ${x+w/2} ${y}`,fill:"none",stroke:"#000",strokeWidth:1.5}),
    grin:    (x,y,w)=> h("path",{d:`M ${x-w/2} ${y} Q ${x} ${y+w*0.8} ${x+w/2} ${y} Z`,fill:"#8a2020",stroke:"#000",strokeWidth:1}),
    frown:   (x,y,w)=> h("path",{d:`M ${x-w/2} ${y+w/3} Q ${x} ${y} ${x+w/2} ${y+w/3}`,fill:"none",stroke:"#000",strokeWidth:1.5}),
    shock_o: (x,y,w)=> h("ellipse",{cx:x,cy:y+w/4,rx:w/3,ry:w/2,fill:"#000"}),
    scream:  (x,y,w)=> h("rect",{x:x-w/2,y:y,width:w,height:w*0.7,fill:"#000"}),
    grit:    (x,y,w)=> h(Fragment,null,
              h("rect",{x:x-w/2,y:y,width:w,height:w/3,fill:"#fff",stroke:"#000",strokeWidth:1}),
              h("line",{x1:x,y1:y,x2:x,y2:y+w/3,stroke:"#000",strokeWidth:1}),
              h("line",{x1:x-w/4,y1:y,x2:x-w/4,y2:y+w/3,stroke:"#000",strokeWidth:1}),
              h("line",{x1:x+w/4,y1:y,x2:x+w/4,y2:y+w/3,stroke:"#000",strokeWidth:1})),
    smirk:   (x,y,w)=> h("path",{d:`M ${x-w/2} ${y} Q ${x-w/4} ${y+w/3} ${x+w/2} ${y}`,fill:"none",stroke:"#000",strokeWidth:1.5}),
    drool:   (x,y,w)=> h(Fragment,null,
              h("path",{d:`M ${x-w/2} ${y} Q ${x} ${y+w/3} ${x+w/2} ${y}`,fill:"none",stroke:"#000",strokeWidth:1.5}),
              h("path",{d:`M ${x+w/4} ${y+w/4} q 0 ${w} ${w/3} ${w*0.6}`,fill:"#bfe0ff",stroke:"#000",strokeWidth:0.5})),
    tongue:  (x,y,w)=> h(Fragment,null,
              h("rect",{x:x-w/2,y:y,width:w,height:w/3,fill:"#000"}),
              h("rect",{x:x-w/4,y:y+w/4,width:w/2,height:w/2,fill:"#e24b6a"})),
    lip_bite:(x,y,w)=> h("path",{d:`M ${x-w/2} ${y} L ${x+w/2} ${y} L ${x+w/3} ${y+w/4} Z`,fill:"#e24b6a",stroke:"#000",strokeWidth:0.5}),
  };

  /* ---------- 2. EMOTION PRESETS ---------------------------- */
  // Each preset: which eye, brow, mouth to compose, plus optional FX tags
  // that the Director can surface as nearby effects.
  const EMOTIONS = {
    neutral:  { eye:"normal",  brow:"flat",   mouth:"neutral",                   },
    happy:    { eye:"normal",  brow:"raised", mouth:"smile",                      },
    joyful:   { eye:"closed",  brow:"raised", mouth:"grin",     fx:["sparkle"]   },
    smirk:    { eye:"squint",  brow:"raised", mouth:"smirk",                      },
    sad:      { eye:"slant_s", brow:"worry",  mouth:"frown",    fx:["tear"]       },
    crying:   { eye:"tear",    brow:"worry",  mouth:"frown",    fx:["tear","tear"]},
    angry:    { eye:"slant_a", brow:"furrow", mouth:"grit",     fx:["vein"]       },
    furious:  { eye:"slant_a", brow:"furrow", mouth:"scream",   fx:["vein","fire"]},
    shocked:  { eye:"wide",    brow:"raised", mouth:"shock_o",  fx:["shocklines"] },
    disgusted:{ eye:"squint",  brow:"furrow", mouth:"tongue",   fx:[]             },
    worried:  { eye:"normal",  brow:"worry",  mouth:"frown",    fx:["sweatdrop"]  },
    panicked: { eye:"wide",    brow:"worry",  mouth:"scream",   fx:["sweatdrop","sweatdrop"]},
    drunk:    { eye:"swirl",   brow:"flat",   mouth:"drool",    fx:["blush","blush"]},
    dazed:    { eye:"x_dead",  brow:"flat",   mouth:"neutral",  fx:["stars"]      },
    smitten:  { eye:"heart",   brow:"raised", mouth:"smile",    fx:["heart","heart"]},
    greedy:   { eye:"dollar",  brow:"raised", mouth:"smirk",    fx:["dollar"]     },
    guilty:   { eye:"slant_s", brow:"worry",  mouth:"lip_bite", fx:["sweatdrop"]  },
    tired:    { eye:"closed",  brow:"flat",   mouth:"neutral",  fx:["zzz"]        },
    scheming: { eye:"squint",  brow:"furrow", mouth:"smirk",    fx:[]             },
    sheepish: { eye:"squint",  brow:"raised", mouth:"smirk",    fx:["blush"]      },
  };

  /* ---------- Expr: paint emotion over an existing face ----- */
  // at:[x,y] is the CENTER of the face on the SVG. scale is relative to 1.
  // Use over a P component by placing at its head center (head x + 8, head y + 8 for the default 16px head).
  function Expr({ at, emotion = "neutral", scale = 1 }) {
    const [cx, cy] = at;
    const p = EMOTIONS[emotion] || EMOTIONS.neutral;
    const es = 1.4 * scale; // eye size
    const eyeL = EYES[p.eye](cx - 4*scale, cy - 1*scale, es);
    const eyeR = EYES[p.eye](cx + 4*scale, cy - 1*scale, es);
    const browL = BROWS[p.brow] && BROWS[p.brow](cx - 4*scale, cy - 4*scale, 5*scale, -1);
    const browR = BROWS[p.brow] && BROWS[p.brow](cx + 4*scale, cy - 4*scale, 5*scale, +1);
    const mouth = MOUTHS[p.mouth](cx, cy + 4*scale, 5*scale);
    return h(Fragment, null, browL, browR, eyeL, eyeR, mouth);
  }

  /* ---------- 3. FX (nearby effects) ------------------------ */
  // All positioned around an anchor [ax,ay]. `t` is a 0..1 age for subtle animation.
  const FX = {
    sweatdrop: ({at,t=0})=> {
      const [x,y] = at;
      const dy = 4 + t*3;
      return h("path",{d:`M ${x} ${y+dy} q -3 -5 0 -10 q 3 5 0 10 Z`,fill:"#6acfff",stroke:"#000",strokeWidth:0.6});
    },
    vein: ({at})=> {
      const [x,y] = at;
      return h("path",{d:`M ${x-6} ${y-10} l 4 2 l -4 -2 l 6 5 l -6 -5 l 2 -5 l -2 5 z`,fill:"none",stroke:"#d03030",strokeWidth:1.5});
    },
    fire: ({at})=> {
      const [x,y] = at;
      return h(Fragment,null,
        h("path",{d:`M ${x-8} ${y-12} q 2 -6 4 -3 q 2 -5 3 -1 q 1 -5 3 -2 q 1 -3 2 0 q 0 4 -6 5 q -4 -1 -6 1 z`,fill:"#e26b30",stroke:"#c03010",strokeWidth:0.5}),
        h("path",{d:`M ${x-4} ${y-10} q 1 -4 3 -2 q 0 3 -3 4 z`,fill:"#f0c040"}));
    },
    shocklines: ({at})=> {
      const [x,y] = at;
      return h(Fragment,null, ...[0,1,2,3,4,5].map(i=>{
        const a = (i/6)*Math.PI*2;
        const r1 = 14, r2 = 20;
        return h("line",{key:i,x1:x+Math.cos(a)*r1,y1:y+Math.sin(a)*r1,x2:x+Math.cos(a)*r2,y2:y+Math.sin(a)*r2,stroke:"#f0c040",strokeWidth:1.5});
      }));
    },
    stars: ({at,t=0})=> {
      const [x,y] = at;
      return h(Fragment,null, ...[0,1,2].map(i=>{
        const a = t*6 + i*2.1;
        const r = 10;
        const sx = x + Math.cos(a)*r, sy = y - 6 + Math.sin(a)*r*0.4;
        return h("text",{key:i,x:sx,y:sy,fontSize:8,fill:"#f0c040",textAnchor:"middle"},"★");
      }));
    },
    sparkle: ({at,t=0})=> {
      const [x,y] = at;
      return h(Fragment,null, ...[0,1,2,3].map(i=>{
        const a = t*4 + i*1.57;
        const r = 10 + (t*3)%6;
        return h("text",{key:i,x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,fontSize:6,fill:"#f0f0a0",textAnchor:"middle"},"✦");
      }));
    },
    heart: ({at,t=0})=> {
      const [x,y] = at;
      return h("text",{x:x,y:y-8-t*6,fontSize:10,fill:"#e24b6a",textAnchor:"middle",opacity:1-t*0.6},"♥");
    },
    dollar: ({at,t=0})=> {
      const [x,y] = at;
      return h("text",{x:x+((t*10)%20-10),y:y-8-t*8,fontSize:9,fill:"#2a8a4a",fontWeight:700,textAnchor:"middle",opacity:1-t*0.5},"$");
    },
    zzz: ({at,t=0})=> {
      const [x,y] = at;
      const d = t*8;
      return h(Fragment,null,
        h("text",{x:x+6+d*0.3,y:y-8-d,fontSize:7,fill:"#8a9aba"},"z"),
        h("text",{x:x+10+d*0.5,y:y-14-d*1.2,fontSize:9,fill:"#8a9aba"},"Z"),
        h("text",{x:x+14+d*0.7,y:y-22-d*1.4,fontSize:11,fill:"#8a9aba"},"Z"));
    },
    blush: ({at,side=1})=> {
      const [x,y] = at;
      return h("ellipse",{cx:x+side*6,cy:y+2,rx:4,ry:2,fill:"#e08a8a",opacity:0.6});
    },
    tear: ({at,side=1})=> {
      const [x,y] = at;
      return h("path",{d:`M ${x+side*3} ${y+2} q -1 4 0 8 q 1 -4 0 -8 Z`,fill:"#6acfff",stroke:"#000",strokeWidth:0.4});
    },
    motionlines: ({at,dir=1})=> {
      const [x,y] = at;
      return h(Fragment,null,...[0,1,2].map(i=>
        h("line",{key:i,x1:x-dir*14,y1:y-4+i*4,x2:x-dir*24,y2:y-4+i*4,stroke:"#000",strokeWidth:1.2,opacity:0.6})));
    },
    impact: ({at})=> {
      const [x,y] = at;
      const pts = [];
      for (let i=0;i<10;i++){
        const a = (i/10)*Math.PI*2;
        const r = i%2===0 ? 14 : 7;
        pts.push(`${x+Math.cos(a)*r},${y+Math.sin(a)*r}`);
      }
      return h("polygon",{points:pts.join(" "),fill:"#f0c040",stroke:"#000",strokeWidth:1});
    },
    question: ({at})=> {
      const [x,y] = at;
      return h("text",{x,y:y-6,fontSize:14,fill:"#f0c040",textAnchor:"middle",fontWeight:700},"?");
    },
    exclaim: ({at})=> {
      const [x,y] = at;
      return h("text",{x,y:y-6,fontSize:16,fill:"#e24b4a",textAnchor:"middle",fontWeight:700},"!");
    },
  };

  /* ---------- Bubbles --------------------------------------- */
  function Bubble({ at, text = "", kind = "speech", tail = 1 }) {
    const [x, y] = at;
    const w = Math.max(60, Math.min(180, text.length * 5.5));
    const h_ = 18 + Math.ceil(text.length / 22) * 10;
    const fill = kind === "thought" ? "#f0f0f0" : kind === "shout" ? "#fff3b0" : "#fff";
    const stroke = "#000";
    const tailPath = kind === "thought"
      ? h(Fragment,null,
          h("circle",{cx:x+tail*6,cy:y+h_/2+6,r:3,fill,stroke,strokeWidth:1}),
          h("circle",{cx:x+tail*12,cy:y+h_/2+12,r:2,fill,stroke,strokeWidth:1}))
      : h("polygon",{points:`${x+tail*4},${y+h_/2} ${x+tail*14},${y+h_/2+12} ${x+tail*10},${y+h_/2}`,fill,stroke,strokeWidth:1});
    return h(Fragment, null,
      kind === "shout"
        ? h("polygon",{points:starPoints(x,y,w,h_),fill,stroke,strokeWidth:1.5})
        : h("rect",{x:x-w/2,y:y-h_/2,width:w,height:h_,rx:kind==="thought"?h_/2:6,fill,stroke,strokeWidth:1}),
      tailPath,
      h("text",{x,y:y+3,fontSize:kind==="shout"?10:9,fill:"#000",textAnchor:"middle",fontFamily:"Courier New, monospace"},
        text.length > 40 ? text.slice(0,38)+"…" : text));
  }
  function starPoints(cx,cy,w,h_){
    const r1 = w/2, r2 = w/2 - 6;
    const pts = [];
    for (let i=0;i<20;i++){
      const a = (i/20)*Math.PI*2 - Math.PI/2;
      const r = i%2===0 ? r1 : r2;
      pts.push(`${cx+Math.cos(a)*r},${cy+Math.sin(a)*(r*h_/w)}`);
    }
    return pts.join(" ");
  }

  /* ---------- 4. DIRECTOR: beats synced to typewriter ------- */
  // beats: [{at:0..1, who?:"dad", emotion?:, fx?:, bubble?:{text,kind}, anchor?:[x,y], hold?:true}]
  // progress: 0..1 (scene text revealed fraction)
  // cast: { dad:{x,y,headY}, karen:{x,y,headY}, ... } — positions of known characters
  // Beats with `hold:true` persist once crossed. Others linger 1.5s then fade.
  function Beat({ beats, progress, cast, nowTs }) {
    const active = [];
    for (const b of (beats || [])) {
      if (progress >= (b.at ?? 0)) active.push(b);
    }
    // last emotion per `who` wins
    const emoByWho = {};
    const fxList = [];
    const bubbles = [];
    for (const b of active) {
      if (b.who && b.emotion) emoByWho[b.who] = b.emotion;
      if (b.fx) {
        const anchor = b.anchor || (b.who && cast?.[b.who] ? [cast[b.who].x + 8, cast[b.who].headY + 8] : [240,80]);
        fxList.push({ kind: b.fx, at: anchor, id: b.at + "-" + b.fx });
      }
      if (b.bubble) {
        const anchor = b.anchor || (b.who && cast?.[b.who] ? [cast[b.who].x + 30, cast[b.who].headY - 10] : [240,40]);
        bubbles.push({ ...b.bubble, at: anchor, id: b.at + "-b" });
      }
    }
    // auto-add emotion-preset FX
    for (const who of Object.keys(emoByWho)) {
      const preset = EMOTIONS[emoByWho[who]];
      if (preset?.fx && cast?.[who]) {
        preset.fx.forEach((fx, i) => {
          const side = i === 0 ? -1 : 1;
          fxList.push({ kind: fx, at: [cast[who].x + 8 + side*6, cast[who].headY + 8], id: `auto-${who}-${fx}-${i}`, side });
        });
      }
    }
    const t = ((nowTs || 0) / 400) % 10;
    return h(Fragment, null,
      // emotions painted over cast heads
      ...Object.entries(emoByWho).map(([who, emo]) => {
        const c = cast?.[who]; if (!c) return null;
        return h(Expr, { key:"e-"+who, at:[c.x + 8, c.headY + 8], emotion: emo });
      }),
      ...fxList.map(f => {
        const C = FX[f.kind]; if (!C) return null;
        return h(C, { key: f.id, at: f.at, t, side: f.side });
      }),
      ...bubbles.map(b => h(Bubble, { key: b.id, at: b.at, text: b.text, kind: b.kind }))
    );
  }

  /* ---------- 5. AUTO-DIRECTOR (keyword inference) ---------- */
  // When a scene provides no beats, scan the narration for cues and
  // emit sensible defaults. Crude but useful baseline.
  const RULES = [
    { re: /\b(screams?|yells?|slams?|storms?|rage|furious|fuming)\b/i, beat: { who:"karen", emotion:"furious", at:0.3 }},
    { re: /\b(angry|mad|pissed)\b/i,                                     beat: { who:"karen", emotion:"angry", at:0.2 }},
    { re: /\b(laugh(s|ing|ed)?|chuckle|grins?|smirk)\b/i,                beat: { who:"dad", emotion:"smirk", at:0.4 }},
    { re: /\b(drunk|slurring|stumbl(e|ing)|blackout|day ?drink)\b/i,     beat: { who:"dad", emotion:"drunk", at:0.2 }},
    { re: /\b(sweat|panic|worried|nervous|cold sweat)\b/i,               beat: { who:"dad", emotion:"worried", at:0.3, fx:"sweatdrop" }},
    { re: /\b(shock(ed)?|stares?|gasps?|jaw drops?|wait[,.!]|what\?)\b/i,beat: { who:"dad", emotion:"shocked", at:0.3, fx:"exclaim" }},
    { re: /\b(cash|money|\$\d|stack|wad|payout|jackpot)\b/i,             beat: { who:"dad", emotion:"greedy", at:0.4 }},
    { re: /\b(kiss|love you|smiles? at you|wink)\b/i,                    beat: { who:"dad", emotion:"smitten", at:0.5 }},
    { re: /\b(hangover|tired|exhausted|yawn|sleep)\b/i,                  beat: { who:"dad", emotion:"tired", at:0.3 }},
    { re: /\b(guilty|lie|hide|sneak)\b/i,                                beat: { who:"dad", emotion:"guilty", at:0.3 }},
    { re: /\b(?:karen|wife).{0,30}(?:arms crossed|doorway|in the driveway|confront)/i, beat: { who:"karen", emotion:"angry", at:0.1 }},
    { re: /\b(proud|pride|nailed it|finally)\b/i,                        beat: { who:"dad", emotion:"joyful", at:0.5 }},
  ];
  function inferBeats(text = "") {
    const out = [];
    const seen = new Set();
    for (const r of RULES) {
      if (r.re.test(text)) {
        const key = r.beat.who + "-" + r.beat.emotion;
        if (!seen.has(key)) { seen.add(key); out.push(r.beat); }
      }
    }
    return out;
  }

  window.Cartoon = { Expr, Bubble, Beat, FX, EMOTIONS, EYES, BROWS, MOUTHS, inferBeats };
})();
