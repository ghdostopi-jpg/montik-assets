import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, delayRender, continueRender } from "remotion";
import { WHITE, MINT, GREEN, GREEN2, RED, INK, FONT, fontsReady, ip, S, H, Slam, Pill, Wipe, Bow, Stk, Confetti, Broll } from "./BF02v2";

// BF Video 02 - UGC version, localised (IT, HR). Same picture as the SL UGC cut; copy + VO per language,
// scene times derived from each VO's word timings (Scribe). Text safe zone Y 420-1470, X 100-945.
// GROUP A (regular products: women using them) vs GROUP B (6 free gifts, only while the VO talks about gifts).
type Lang = "it" | "hr";
type Pack = {
  hook: [string, string]; pop: [string, string]; gift: string; q: [string, string, string, string]; ans: [string, string];
  shop: [string, string, string, string]; sel: [string, string]; k3a: [string, string]; tiers: [string, string][];
  v: [string, string]; kup: [string, string]; end: [string, string, string]; cta: string;
  t: { k1pop: number; k1b: number; k1q: number; k2a: number; k2b: number; k2c: number; k3: number; tier1: number; tier2: number; tier3: number; k4: number; kupon: number; k5: number; cta: number; end: number };
  vo: string; gap: number; // VO file; seconds of air inserted before K5 (voucher reading time)
};
export const PACKS: Record<Lang, Pack> = {
  it: {
    hook: ["IL BLACK FRIDAY", "È ARRIVATO!"], pop: ["SCONTI FINO AL", "-60%"], gift: "+ REGALI IN OMAGGIO",
    q: ["E SE I REGALI", "DEL BLACK FRIDAY", "POTESSI SCEGLIERLI TU?", "🎁"], ans: ["DA BIOSTILE", "PUOI!"],
    shop: ["Acquista i tuoi", "prodotti preferiti", "con sconti fino al", "-60%"], sel: ["e scegli anche", "i tuoi regali in omaggio."],
    k3a: ["NOI REGALIAMO,", "TU SCEGLI!"], tiers: [["Oltre 100 €", "1 REGALO"], ["Oltre 150 €", "2 REGALI"], ["Oltre 200 €", "3 REGALI"]],
    v: ["+ UN ULTERIORE", "−25%!"], kup: ["Buono per il", "prossimo acquisto."], end: ["BLACK FRIDAY", "SOLO FINO A", "FINE NOVEMBRE!"],
    cta: "CORRI A SCEGLIERE I TUOI REGALI!",
    t: { k1pop: 2.06, k1b: 4.34, k1q: 5.82, k2a: 8.85, k2b: 10.38, k2c: 14.2, k3: 16.26, tier1: 18.4, tier2: 20.32, tier3: 22.96, k4: 25.4, kupon: 28.54, k5: 31.15, cta: 33.64, end: 38.3 },
    vo: "BF02_VO_IT_Chiara_takeA.mp3", gap: 0.7,
  },
  hr: {
    hook: ["BLACK FRIDAY", "JE STIGAO!"], pop: ["POPUSTI DO ČAK", "-60%"], gift: "+ BESPLATNI POKLONI",
    q: ["ŠTO AKO BISTE", "BLACK FRIDAY POKLONE", "MOGLI ODABRATI SAMI?", "🎁"], ans: ["U BIOSTILEU", "MOŽETE!"],
    shop: ["Kupujte svoje", "omiljene proizvode", "uz popuste do", "-60%"], sel: ["i još odaberite svoje", "besplatne poklone."],
    k3a: ["MI POKLANJAMO,", "VI BIRATE!"], tiers: [["Iznad 100 €", "1 POKLON"], ["Iznad 150 €", "2 POKLONA"], ["Iznad 200 €", "3 POKLONA"]],
    v: ["+ JOŠ DODATNIH", "−25%!"], kup: ["Kupon za", "sljedeću kupnju."], end: ["BLACK FRIDAY", "SAMO DO KRAJA", "STUDENOGA!"],
    cta: "POŽURITE PO SVOJE POKLONE!",
    t: { k1pop: 1.78, k1b: 4.36, k1q: 5.9, k2a: 9.69, k2b: 11.56, k2c: 15.88, k3: 18.77, tier1: 20.93, tier2: 23.04, tier3: 25.73, k4: 28.37, kupon: 31.18, k5: 33.7, cta: 36.46, end: 41.2 },
    vo: "BF02_VO_HR_Lara_takeA.mp3", gap: 0.7,
  },
};
// full approved lines per language (copy check: the displayed pieces must join to exactly these)
export const LINES: Record<Lang, string[]> = {
  it: ["IL BLACK FRIDAY È ARRIVATO!", "SCONTI FINO AL -60%", "+ REGALI IN OMAGGIO", "E SE I REGALI DEL BLACK FRIDAY POTESSI SCEGLIERLI TU? 🎁", "DA BIOSTILE PUOI!",
    "Acquista i tuoi prodotti preferiti con sconti fino al -60% e scegli anche i tuoi regali in omaggio.", "NOI REGALIAMO, TU SCEGLI!",
    "Oltre 100 € → 1 REGALO", "Oltre 150 € → 2 REGALI", "Oltre 200 € → 3 REGALI", "+ UN ULTERIORE −25%!", "Buono per il prossimo acquisto.",
    "BLACK FRIDAY SOLO FINO A FINE NOVEMBRE!", "CORRI A SCEGLIERE I TUOI REGALI!"],
  hr: ["BLACK FRIDAY JE STIGAO!", "POPUSTI DO ČAK -60%", "+ BESPLATNI POKLONI", "ŠTO AKO BISTE BLACK FRIDAY POKLONE MOGLI ODABRATI SAMI? 🎁", "U BIOSTILEU MOŽETE!",
    "Kupujte svoje omiljene proizvode uz popuste do -60% i još odaberite svoje besplatne poklone.", "MI POKLANJAMO, VI BIRATE!",
    "Iznad 100 € → 1 POKLON", "Iznad 150 € → 2 POKLONA", "Iznad 200 € → 3 POKLONA", "+ JOŠ DODATNIH −25%!", "Kupon za sljedeću kupnju.",
    "BLACK FRIDAY SAMO DO KRAJA STUDENOGA!", "POŽURITE PO SVOJE POKLONE!"],
};
const Ctx = React.createContext<Pack>(PACKS.it);
const useP = () => React.useContext(Ctx);

type Clip = { src: string; off?: number; rate?: number; z?: [number, number] };
// regular-product UGC (GROUP A only): clips share the scene time equally, hard cuts
const Shots: React.FC<{ clips: Clip[]; dur: number; dim?: number }> = ({ clips, dur, dim = 0 }) => {
  const f = useCurrentFrame(); const seg = dur / clips.length;
  return (<AbsoluteFill style={{ background: INK }}>
    {clips.map((c, i) => {
      const a = S(i * seg), d = S((i + 1) * seg) - a; const z = c.z ?? [1.0, 1.05];
      return (<Sequence key={i} from={a} durationInFrames={d}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(`bf02v2/u/${c.src}.mp4`)} muted startFrom={S(c.off ?? 0)} playbackRate={c.rate ?? 1}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.07) brightness(1.02)", transform: `scale(${ip(f - a, [0, d], z, (x) => x)})` }} />
        </AbsoluteFill>
      </Sequence>);
    })}
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, rgba(255,244,230,0) 55%, rgba(20,26,22,0.35) 100%)", mixBlendMode: "multiply" }} />
    {dim ? <AbsoluteFill style={{ background: `rgba(10,30,20,${dim})` }} /> : null}
  </AbsoluteFill>);
};
// largest size (<= max) that keeps a one-line heading inside 845 px (Poppins 800 caps ~0.66 em per glyph)
const fit = (t: string, max: number) => Math.min(max, Math.floor(845 / (t.length * 0.66)));
const Kin: React.FC<{ text: string; at: number; size: number; top: number; color?: string; gap?: number }> = ({ text, at, size, top, color = WHITE, gap = 0.07 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (<div style={{ position: "absolute", left: 100, width: 845, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.24 }}>
    {text.split(" ").map((w, i) => {
      const s = spring({ frame: f - S(at + i * gap), fps, config: { damping: 18, stiffness: 160 } });
      return <span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, letterSpacing: -0.5,
        textShadow: "0 3px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)", opacity: Math.min(1, s * 1.3), transform: `translateY(${(1 - Math.min(1, s)) * 26}px)`, fontVariantNumeric: "lining-nums" }}>{w}</span>;
    })}
  </div>);
};

// ---- scenes (each gets its own duration; times inside are relative to scene start)
const U1: React.FC<{ dur: number }> = ({ dur }) => {
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const pop = spring({ frame: f - S(p.t.k1pop), fps, config: { damping: 11, stiffness: 170 } });
  const hookOut = ip(f, [S(p.t.k1pop) - 6, S(p.t.k1pop)], [1, 0]);
  return (<AbsoluteFill>
    <Shots dur={dur} clips={[{ src: "A_col_drink3", off: 1.3 }, { src: "A_slimis_eat", off: 3.5 }, { src: "A_ms_drink", off: 1.0 }, { src: "A_nutri_hold", off: 0.6 }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 920, background: "linear-gradient(180deg, rgba(10,30,20,0) 0%, rgba(10,30,20,0.5) 100%)" }} />
    <div style={{ opacity: hookOut }}>
      <Kin text={p.hook[0]} at={0.0} size={fit(p.hook[0], 108)} top={1180} />
      <Kin text={p.hook[1]} at={0.35} size={fit(p.hook[1], 108)} top={1180 + fit(p.hook[0], 108) * 1.12} />
    </div>
    {f >= S(p.t.k1pop) - 2 ? <>
      <Kin text={p.pop[0]} at={p.t.k1pop} size={66} top={1166} />
      <div style={{ position: "absolute", left: 100, width: 845, top: 1252, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${0.5 + 0.5 * pop}) rotate(-3deg)`, opacity: pop > 0.02 ? 1 : 0 }}>
          <Pill style={{ fontSize: 150, padding: "4px 40px 10px", letterSpacing: -4, lineHeight: 1 }}>{p.pop[1]}</Pill>
        </div>
      </div>
    </> : null}
  </AbsoluteFill>);
};
const G1: React.FC<{ dur: number }> = () => { // free gifts: Sunrise photo wrapped with a ribbon
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f, fps, config: { damping: 13, stiffness: 150 } });
  const rb = ip(f, [6, 26], [0, 1]); const bow = spring({ frame: f - 16, fps, config: { damping: 9, stiffness: 190 } });
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${GREEN} 0%, ${GREEN2} 100%)` }}>
    <Confetti seed={7} n={20} dark />
    <H size={62} color={WHITE} style={{ position: "absolute", left: 100, right: 135, top: 436, opacity: 0.92 }}>{p.pop[0] + " " + p.pop[1]}</H>
    <div style={{ position: "absolute", left: 100, right: 135, top: 522, display: "flex", justifyContent: "center", transform: `scale(${0.5 + 0.5 * sp})`, opacity: sp > 0.02 ? 1 : 0 }}>
      <Pill style={{ fontSize: 54, padding: "16px 32px", transform: "rotate(-2deg)", whiteSpace: "nowrap" }}>{p.gift}</Pill>
    </div>
    <div style={{ position: "absolute", left: 175, top: 680, width: 700, height: 700, transform: `translateY(${(1 - sp) * 500}px) rotate(${2 - (1 - sp) * 8}deg)`, background: WHITE, padding: 16, borderRadius: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 14 }}>
        <Img src={staticFile("bf02v2/img/B_sunrise_photo.jpg")} style={{ position: "absolute", height: "100%", left: "50%", transform: `translateX(-48%) scale(${1.02 + f / 2400})` }} />
        <div style={{ position: "absolute", left: 0, top: "50%", height: 38, width: `${rb * 100}%`, background: RED, transform: "translateY(-50%)", boxShadow: "0 0 0 4px rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", top: 0, left: "18%", width: 38, height: `${rb * 100}%`, background: RED, boxShadow: "0 0 0 4px rgba(255,255,255,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: "18%", top: "50%", transform: `translate(-50%,-62%) scale(${bow})`, opacity: bow > 0.02 ? 1 : 0 }}><Bow size={210} /></div>
    </div>
  </AbsoluteFill>);
};
const G2: React.FC<{ dur: number }> = ({ dur }) => { // the question over the Celuline gift B-roll
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 150 } });
  return (<AbsoluteFill>
    <Broll src="g_celuline_pump.mp4" rate={Math.min(1.25, 4.8 / dur * 0.98)} dur={dur} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1105, transform: `translateY(${(1 - sp) * 120}px)`, opacity: sp > 0.02 ? 1 : 0, background: WHITE, borderRadius: 34, padding: "30px 34px 34px", boxShadow: "0 24px 44px rgba(0,0,0,0.30)" }}>
      {p.q.slice(0, 3).map((l, i) => {
        const a = ip(f, [8 + i * 9, 20 + i * 9], [0, 1]);
        return <H key={i} size={i === 1 ? 60 : 52} color={i === 1 ? RED : INK} style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)`, marginTop: i ? 6 : 0 }}>{l}</H>;
      })}
      <div style={{ position: "absolute", right: 40, top: -70, fontSize: 90, transform: `rotate(12deg) scale(${spring({ frame: f - 40, fps, config: { damping: 8, stiffness: 200 } })})` }}>{p.q[3]}</div>
    </div>
  </AbsoluteFill>);
};
const U2a: React.FC<{ dur: number }> = ({ dur }) => {
  const p = useP();
  return (<AbsoluteFill>
    <Shots dur={dur} clips={[{ src: "A_col_drink2", off: 1.2, z: [1.04, 1.1] }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1060, height: 520, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.55) 100%)" }} />
    <Kin text={p.ans[0]} at={0.05} size={fit(p.ans[0], 104)} top={1190} />
    <Kin text={p.ans[1]} at={0.3} size={fit(p.ans[1], 104)} top={1190 + fit(p.ans[0], 104) * 1.12} />
  </AbsoluteFill>);
};
const U2b: React.FC<{ dur: number }> = ({ dur }) => {
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const card = spring({ frame: f - 3, fps, config: { damping: 16, stiffness: 160 } });
  const t3 = dur * 0.5, tDisc = dur * 0.68; // "... do -60%" lands in the second half of the line
  const disc = spring({ frame: f - S(tDisc), fps, config: { damping: 10, stiffness: 190 } });
  return (<AbsoluteFill>
    <Shots dur={dur} clips={[{ src: "A_q10_unbox", off: 0.6 }, { src: "A_ms_box", off: 2.0 }, { src: "A_mag_pour", off: 1.6 }, { src: "A_slimis_open", off: 2.0 }]} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1150, transform: `translateY(${(1 - card) * 30}px)`, opacity: Math.min(1, card * 1.3), background: "rgba(255,255,255,0.94)", borderRadius: 30, padding: "22px 26px 26px", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>
      <H size={56}>{p.shop[0]}</H>
      <H size={56} style={{ marginTop: 4 }}>{p.shop[1]}</H>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", columnGap: 24, marginTop: 10, opacity: ip(f, [S(t3), S(t3) + 10], [0, 1]) }}>
        <H size={50} color={GREEN}>{p.shop[2]}</H>
        <div style={{ transform: `scale(${0.4 + 0.6 * disc}) rotate(-3deg)`, opacity: disc > 0.02 ? 1 : 0 }}><Pill style={{ fontSize: 56, padding: "2px 22px 6px" }}>{p.shop[3]}</Pill></div>
      </div>
    </div>
  </AbsoluteFill>);
};
const G3: React.FC<{ dur: number }> = ({ dur }) => { // "...choose your free gifts" over the Hair.O gift B-roll
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - 3, fps, config: { damping: 13, stiffness: 160 } });
  return (<AbsoluteFill>
    <Broll src="g_hairo_leaves.mp4" rate={1} startFrom={S(1.4)} dur={dur} zoom={[1.0, 1.05]} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.6) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1250, transform: `translateY(${(1 - sp) * 24}px)`, opacity: sp > 0.02 ? 1 : 0, background: WHITE, borderRadius: 34, padding: "26px 30px 30px", boxShadow: "0 24px 44px rgba(0,0,0,0.30)" }}>
      <H size={56}>{p.sel[0]}</H>
      <H size={64} color={RED} style={{ marginTop: 6 }}>{p.sel[1]}</H>
      <Bow size={110} style={{ position: "absolute", right: 4, top: -56, transform: `rotate(14deg) scale(${spring({ frame: f - 24, fps, config: { damping: 8, stiffness: 200 } })})` }} />
    </div>
  </AbsoluteFill>);
};
const G4: React.FC<{ dur: number }> = () => { // tiers + the six gifts (n gifts chosen per tier)
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = p.t.k3;
  const tiers = [p.t.tier1, p.t.tier2, p.t.tier3].map((x) => x - t0);
  const n = tiers.filter((x) => f >= S(x)).length;
  const gifts: [string, number, number, [number, number], number][] = [
    ["B_sunrise", 250, 1215, [230, 170], -3], ["B_triple", 540, 1215, [110, 200], 2], ["B_hairo", 830, 1215, [70, 200], 4],
    ["B_gel", 250, 1462, [120, 190], -2], ["B_sunkissed", 540, 1462, [70, 190], 3], ["B_celuline", 830, 1462, [80, 190], -3]];
  const pick = [0, 4, 1];
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${MINT} 0%, ${WHITE} 45%, ${MINT} 100%)` }}>
    <Confetti seed={5} n={12} />
    <Slam text={p.k3a[0]} at={0.05} size={84} color={GREEN} top={430} gap={0.16} />
    <Slam text={p.k3a[1]} at={0.9} size={84} color={RED} top={524} gap={0.16} />
    {p.tiers.map(([lhs, rhs], i) => {
      const a = spring({ frame: f - S(0.35 + i * 0.12), fps, config: { damping: 14, stiffness: 170 } });
      const on = f >= S(tiers[i]); const hl = spring({ frame: f - S(tiers[i]), fps, config: { damping: 10, stiffness: 200 } });
      return (<div key={i} style={{ position: "absolute", left: 120, width: 805, top: 640 + i * 110, height: 96, borderRadius: 26, display: "flex", alignItems: "center",
        opacity: Math.min(1, a * 1.4), background: on ? WHITE : "rgba(255,255,255,0.85)", border: `5px solid ${on ? RED : "rgba(15,107,62,0.35)"}`, boxShadow: on ? "0 16px 30px rgba(227,25,44,0.22)" : "0 8px 16px rgba(30,39,35,0.10)",
        transform: `translateX(${(1 - a) * 60}px) scale(${1 + (on ? 0.04 * (1 - Math.abs(1 - hl)) + 0.02 : 0)})` }}>
        <div style={{ width: 380, height: "100%", borderRadius: "20px 0 0 20px", background: on ? GREEN : "rgba(15,107,62,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <H size={50} color={WHITE} style={{ whiteSpace: "nowrap" }}>{lhs}</H></div>
        <H size={54} color={GREEN} style={{ width: 80 }}>→</H>
        <H size={54} color={on ? RED : INK} style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>{rhs}</H>
      </div>);
    })}
    {gifts.map(([id, x, y, b, r], i) => {
      const k = pick.indexOf(i); const chosen = k >= 0 && k < n;
      const lift = chosen ? 30 * spring({ frame: f - S(tiers[k]), fps, config: { damping: 9, stiffness: 180 } }) : 0;
      return <Stk key={id} id={id} cx={x} by={y} box={b} at={0.9 + i * 0.12} rot={r} lift={lift} ring={chosen ? ip(f, [S(tiers[k]), S(tiers[k]) + 12], [0, 1]) : 0} />;
    })}
  </AbsoluteFill>);
};
const U4: React.FC<{ dur: number }> = ({ dur }) => { // voucher over regular-product UGC
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tk = spring({ frame: f - 6, fps, config: { damping: 13, stiffness: 120 } });
  const stamp = spring({ frame: f - S(1.15), fps, config: { damping: 9, stiffness: 210 } });
  const kup = spring({ frame: f - S(p.t.kupon - p.t.k4), fps, config: { damping: 15, stiffness: 160 } });
  const shine = ip(f, [S(1.8), S(2.6)], [-40, 140]);
  return (<AbsoluteFill>
    <Shots dur={dur} dim={0.32} clips={[{ src: "A_col_stir2", off: 0.2, rate: 0.9 }, { src: "A_q10_hold", off: 0, rate: 0.85 }]} />
    <Kin text={p.v[0]} at={0.1} size={84} top={452} />
    <div style={{ position: "absolute", left: 110, width: 825, top: 580, height: 430, transform: `translateX(${(1 - tk) * 60}px) rotate(-3deg)`, opacity: Math.min(1, tk * 1.4) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: WHITE, boxShadow: "0 30px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, background: `linear-gradient(180deg, ${GREEN}, ${GREEN2})` }} />
        <div style={{ position: "absolute", left: 140, top: 26, bottom: 26, borderLeft: `8px dotted ${MINT}` }} />
        <div style={{ position: "absolute", left: 43, top: 188, width: 54, height: 54, borderRadius: "50%", border: `8px solid ${WHITE}` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: 120, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))", transform: "skewX(-16deg)" }} />
      </div>
      <div style={{ position: "absolute", left: 160, right: 20, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * 8}deg)`, opacity: stamp > 0.02 ? 1 : 0 }}>
        <H size={176} color={RED} style={{ letterSpacing: -6, whiteSpace: "nowrap" }}>{p.v[1]}</H>
      </div>
    </div>
    <div style={{ position: "absolute", left: 100, width: 845, top: 1080, transform: `translateY(${(1 - kup) * 30}px)`, opacity: Math.min(1, kup * 1.3), background: WHITE, borderRadius: 30, padding: "26px 30px", boxShadow: "0 20px 40px rgba(0,0,0,0.30)", borderTop: `10px solid ${RED}` }}>
      <H size={62}>{p.kup[0]}</H>
      <H size={62} color={GREEN} style={{ marginTop: 6 }}>{p.kup[1]}</H>
    </div>
  </AbsoluteFill>);
};
const U5a: React.FC<{ dur: number }> = ({ dur }) => {
  const p = useP();
  return (<AbsoluteFill>
    <Shots dur={dur} clips={[{ src: "A_slimis_belly", off: 0.5 }, { src: "A_nutri_show", off: 1.6 }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 560, background: "linear-gradient(180deg, rgba(10,30,20,0.5) 0%, rgba(10,30,20,0) 100%)" }} />
    <Kin text={p.end[0]} at={0.05} size={104} top={446} />
    <Kin text={p.end[1]} at={0.35} size={72} top={566} />
    <Kin text={p.end[2]} at={0.6} size={72} top={648} />
  </AbsoluteFill>);
};
const G5: React.FC<{ dur: number }> = ({ dur }) => { // CTA about the gifts -> gift B-roll only, no brand end card
  const p = useP(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const cta = spring({ frame: f - 4, fps, config: { damping: 10, stiffness: 170 } });
  const pulse = f > 40 ? 1 + 0.03 * Math.sin((f - 40) / 8) : 1;
  return (<AbsoluteFill>
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <OffthreadVideo src={staticFile("bf02v2/v/g_celuline_hand.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${ip(f, [0, S(dur)], [1.0, 1.06], (x) => x)})` }} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1080, height: 600, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.6) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1250, display: "flex", justifyContent: "center", transform: `scale(${(0.4 + 0.6 * cta) * pulse})`, opacity: cta > 0.02 ? 1 : 0 }}>
      <Pill style={{ fontSize: 60, padding: "16px 40px 20px", textAlign: "center", lineHeight: 1.06, width: 780 }}>{p.cta}</Pill>
    </div>
  </AbsoluteFill>);
};

const QC_CSS = `html,body{background:#000!important} *{background:transparent!important;box-shadow:none!important;border-color:transparent!important;filter:none!important;-webkit-text-stroke:0!important;text-shadow:none!important} img,video,svg{visibility:hidden!important}`;
export const scenesFor = (p: Pack): [React.FC<{ dur: number }>, number, number][] => [
  [U1, 0, p.t.k1b], [G1, p.t.k1b, p.t.k1q], [G2, p.t.k1q, p.t.k2a], [U2a, p.t.k2a, p.t.k2b], [U2b, p.t.k2b, p.t.k2c], [G3, p.t.k2c, p.t.k3],
  [G4, p.t.k3, p.t.k4], [U4, p.t.k4, p.t.k5], [U5a, p.t.k5, p.t.cta], [G5, p.t.cta, p.t.end]];
export const BF02loc: React.FC<{ lang: Lang; qcText?: boolean }> = ({ lang, qcText }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const p = PACKS[lang];
  return (<Ctx.Provider value={p}><AbsoluteFill style={{ background: WHITE }}>
    {qcText ? <style>{QC_CSS}</style> : null}
    {scenesFor(p).map(([C, a, b], i) => <Sequence key={i} from={S(a)} durationInFrames={S(b) - S(a)}><C dur={b - a} /></Sequence>)}
    {[p.t.k1b, p.t.k2c, p.t.k3, p.t.cta].map((a, i) => <Wipe key={i} at={a} />)}
  </AbsoluteFill></Ctx.Provider>);
};
