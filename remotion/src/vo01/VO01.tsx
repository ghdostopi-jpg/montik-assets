import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, delayRender, continueRender } from "remotion";

// VO_01 NATIVE / ORGANIC | HOOK A - Collagen + Q10 (Serbian). 10 Nov 2026.
// Caption identity "Sunlit Routine": Manrope ExtraBold sentence-case subtitles (TikTok-native), Fraunces italic accents,
// apricot (collagen drink) + Biostile deep green, cream text. Calm motion: soft rise/fade, no bounce.
// TEXT SAFE ZONE: Y 420-1500 (Rene's centre-square rule), X 100-945. Subtitles never sit on packaging labels.

export const FPS = 30;
export const DUR = 47.4;
const S = (t: number) => Math.round(t * FPS);
const ip = (f: number, i: number[], o: number[], e?: (x: number) => number) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const eo = Easing.bezier(0.16, 1, 0.3, 1);

export const SANS = "VO01Sans", SERIF = "VO01Serif";
const CREAM = "#FFF8EE", APRICOT = "#F59A3C", GREEN = "#1D5C43", INK = "#16130F";
const R_LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const R_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
export const fontsReady = (() => {
  if (typeof document === "undefined") return Promise.resolve();
  const p: Promise<any>[] = [];
  for (const [sub, rng] of [["latin", R_LATIN], ["latin-ext", R_EXT]] as const) {
    for (const w of ["600", "700", "800"]) p.push(new FontFace(SANS, `url(${staticFile(`vo01/fonts/manrope-${sub}-${w}-normal.woff2`)})`, { weight: w, unicodeRange: rng }).load().then((x) => (document.fonts as any).add(x)));
    for (const w of ["500", "600"]) p.push(new FontFace(SERIF, `url(${staticFile(`vo01/fonts/fraunces-${sub}-${w}-italic.woff2`)})`, { weight: w, style: "italic", unicodeRange: rng }).load().then((x) => (document.fonts as any).add(x)));
  }
  return Promise.all(p);
})();

// ---------------- EDIT (timeline = VO take B, Mina, 46.72 s) ----------------
type Shot = { src: string; off: number; from: number; to: number; rate?: number; z?: [number, number]; oy?: number };
export const SHOTS: Shot[] = [
  { src: "L5", off: 0.3, from: 0, to: 3.62, z: [1.06, 1.0] },           // hook: wall calendar, back view
  { src: "L6", off: 2.1, from: 3.62, to: 6.38 },                          // same woman, side view
  { src: "L3", off: 0.4, from: 6.38, to: 8.0 },                          // "nova flašica za vodu" - the water bottle (Rene's pick)                          // "nova flašica za vodu" - pouring from a glass bottle
  { src: "L1", off: 0.0, from: 8.0, to: 9.02 },                          // "novi planer" - writing in a planner
  { src: "L4", off: 4.0, from: 9.02, to: 12.55 },                        // "novi ritual / prvih pet dana"
  { src: "L1", off: 8.6, from: 12.55, to: 14.78 },                       // "običan utorak" - busy desk, papers, phone
  { src: "L2", off: 0.5, from: 14.78, to: 17.25 },                       // "posao, obaveze" - typing
  { src: "L1", off: 3.9, from: 17.25, to: 19.66 },                       // "pola tih navika nestane"
  { src: "L4", off: 8.5, from: 19.66, to: 23.0, z: [1.0, 1.04] },        // realisation - calmer
  { src: "M4", off: 0.6, from: 23.0, to: 26.7, z: [1.0, 1.05] },         // "nešto jednostavno" - drink in the window light
  { src: "M5", off: 0.4, from: 26.7, to: 29.1 },                         // beauty routine at the desk
  { src: "Q9", off: 0.6, from: 29.1, to: 31.0 },                         // hands, jar, NOVO box
  { src: "M3", off: 0.0, from: 31.0, to: 33.0 },                         // "Collagen napitak" - box + sachets
  { src: "P22", off: 1.0, from: 33.0, to: 35.2 },                        // pouring a sachet - 6 vrsta kolagena
  { src: "M7", off: 1.0, from: 35.2, to: 37.1 },                         // frothing - HA + vitamin C
  { src: "P8", off: 0.15, from: 37.1, to: 39.8, rate: 0.5, z: [1.16, 1.19], oy: 360 }, // TWO Collagen boxes (face cropped out)
  { src: "Q2", off: 0.5, from: 39.8, to: 42.62, z: [1.08, 1.1], oy: 150 },                        // Q10 + Selenium jar
  { src: "M2", off: 2.8, from: 42.62, to: 44.95 },                       // sachets in the sun
  { src: "Q4", off: 0.2, from: 44.95, to: DUR },                         // Q10 box on the table - close
];

// ---------------- SUBTITLES (exact script, Serbian Latin) ----------------
type Sub = { t: string; a: number; b: number; y: number };
const TOP = 520, LOW = 1370, OFF = 10625; // OFF: top edge at 640, just under the offer panel (top-anchored = 10000 + y)
export const SUBS: Sub[] = [
  { t: "Ja sam odlična u počinjanju", a: 3.76, b: 5.32, y: LOW },
  { t: "novih rutina.", a: 5.32, b: 6.38, y: LOW },
  { t: "Nova flašica za vodu.", a: 6.38, b: 8.0, y: TOP },
  { t: "Novi planer.", a: 8.0, b: 9.02, y: LOW },
  { t: "Novi ritual.", a: 9.02, b: 10.06, y: TOP },
  { t: "Prvih pet dana —", a: 10.06, b: 11.3, y: TOP },
  { t: "sve savršeno.", a: 11.3, b: 12.55, y: TOP },
  { t: "A onda dođe običan utorak.", a: 12.55, b: 14.78, y: LOW },
  { t: "Posao, obaveze, umor…", a: 14.78, b: 17.25, y: LOW },
  { t: "i pola tih navika nekako nestane.", a: 17.25, b: 19.66, y: LOW },
  { t: "I onda sam shvatila", a: 19.66, b: 20.9, y: TOP },
  { t: "da mi ne treba još komplikovanih koraka.", a: 20.9, b: 23.0, y: TOP },
  { t: "Treba mi nešto jednostavno,", a: 23.0, b: 24.46, y: TOP },
  { t: "što mogu da uklopim u svakodnevni život.", a: 24.46, b: 26.7, y: TOP },
  { t: "Na primer,", a: 26.7, b: 27.42, y: TOP },
  { t: "kada razmišljam o beauty rutini,", a: 27.42, b: 29.1, y: TOP },
  { t: "više volim jednostavne stvari.", a: 29.1, b: 31.0, y: TOP },
  { t: "Tu se uklapa i Collagen napitak,", a: 31.0, b: 33.0, y: 1430 },
  { t: "sa šest vrsta kolagena,", a: 33.0, b: 34.52, y: 1430 },
  { t: "hijaluronskom kiselinom", a: 34.52, b: 35.88, y: 1430 },
  { t: "i vitaminom C.", a: 35.88, b: 37.1, y: 1430 },
  { t: "A trenutno postoji i paket", a: 37.1, b: 38.68, y: OFF },
  { t: "uz koji dobijaš dva Collagena", a: 38.68, b: 40.44, y: OFF },
  { t: "i koenzim Q10 na poklon.", a: 40.44, b: 42.62, y: OFF },
  { t: "Poenta je jednostavna:", a: 42.62, b: 44.06, y: OFF },
  { t: "biraj rutinu koju stvarno možeš da pratiš.", a: 44.06, b: DUR, y: OFF },
];

const Shots: React.FC = () => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ background: INK }}>
    {SHOTS.map((c, i) => {
      const a = S(c.from), d = S(c.to) - a; const z = c.z ?? [1.0, 1.03];
      return (<Sequence key={i} from={a} durationInFrames={d}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(`vo01/${c.src}.mp4`)} muted startFrom={S(c.off)} playbackRate={c.rate ?? 1}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.04) contrast(1.03)",
              transformOrigin: "50% 100%", transform: `translateY(${c.oy ?? 0}px) scale(${ip(f - a, [0, d], z)})` }} />
        </AbsoluteFill>
      </Sequence>);
    })}
    {/* warm daylight wash, very light */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,214,160,0.06), rgba(255,214,160,0) 40%, rgba(20,14,8,0.10) 100%)" }} />
  </AbsoluteFill>);
};

// Native TikTok-style label boxes: every line sits in its own rounded cream tile (high contrast on any footage).
const boxStyle = (bg: string, color: string, size: number, font = SANS, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg, color, fontFamily: font, fontSize: size, fontWeight: font === SANS ? 800 : 600, fontStyle: font === SERIF ? "italic" : "normal",
  padding: `${size * 0.1}px ${size * 0.34}px ${size * 0.14}px`, borderRadius: size * 0.26, lineHeight: 1.62, letterSpacing: font === SANS ? -0.3 : 0,
  WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", boxShadow: "0 6px 18px rgba(0,0,0,0.16)", ...extra,
} as any);
const Subtitle: React.FC<{ s: Sub }> = ({ s }) => {
  const f = useCurrentFrame();
  const a = S(s.a), b = S(s.b);
  if (f < a || f >= b) return null;
  const k = ip(f, [a, a + 4], [0, 1], eo);
  const pos: React.CSSProperties = s.y >= 10000 ? { top: s.y - 10000, transform: `translateY(${(1 - k) * 8}px)` } : s.y >= 0 ? { top: s.y, transform: `translateY(calc(-50% + ${(1 - k) * 8}px))` } : { bottom: 1920 + s.y, transform: `translateY(${(1 - k) * 8}px)` };
  return (<div style={{ position: "absolute", left: 110, width: 860, textAlign: "center", opacity: k, ...pos }}>
    <span style={boxStyle("rgba(255,248,238,0.95)", INK, 50)}>{s.t}</span>
  </div>);
};

// HOOK - the spoken words build as stacked tiles on the wall: "Prva nedelja / nove rutine?" / "Savršena." / "A druga?"
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const out = ip(f, [S(3.6), S(3.76)], [1, 0]);
  const tile = (t: number) => { const k = spring({ frame: f - S(t), fps, config: { damping: 20, stiffness: 170 } }); return { opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - Math.min(1, k)) * 18}px)`, display: "inline-block" } as React.CSSProperties; };
  return (<div style={{ position: "absolute", left: 100, width: 880, top: 470, textAlign: "center", opacity: out }}>
    <div style={tile(0.12)}><span style={boxStyle("rgba(255,248,238,0.96)", INK, 74)}>Prva nedelja</span></div><br />
    <div style={{ ...tile(0.66), marginTop: 6 }}><span style={boxStyle("rgba(255,248,238,0.96)", INK, 74)}>nove rutine?</span></div><br />
    <div style={{ ...tile(1.82), marginTop: 14 }}><span style={boxStyle(APRICOT, INK, 78, SERIF)}>Savršena.</span></div><br />
    <div style={{ ...tile(2.94), marginTop: 14 }}><span style={boxStyle(INK, CREAM, 96)}>A druga?</span></div>
  </div>);
};

// MIDDLE EMPHASIS - JEDNOSTAVNIJE = ODRŽIVIJE (green tiles, apricot "=")
const Emphasis: React.FC<{ a: number; b: number; y: number }> = ({ a, b, y }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < S(a) || f >= S(b)) return null;
  const out = ip(f, [S(b) - 6, S(b)], [1, 0]);
  const tile = (t: number) => { const k = spring({ frame: f - S(t), fps, config: { damping: 22, stiffness: 160 } }); return { opacity: Math.min(1, k * 1.6), transform: `translateY(${(1 - Math.min(1, k)) * 16}px) scale(${0.96 + 0.04 * Math.min(1, k)})`, display: "inline-block" } as React.CSSProperties; };
  return (<div style={{ position: "absolute", left: 100, width: 880, top: y, textAlign: "center", opacity: out }}>
    <div style={tile(a)}><span style={boxStyle(GREEN, CREAM, 78, SANS, { letterSpacing: 1.5 })}>JEDNOSTAVNIJE</span></div><br />
    <div style={{ ...tile(a + 0.25), margin: "8px 0" }}><span style={boxStyle(APRICOT, INK, 70, SERIF, { padding: "0 34px 8px" })}>=</span></div><br />
    <div style={tile(a + 0.45)}><span style={boxStyle(GREEN, CREAM, 78, SANS, { letterSpacing: 1.5 })}>ODRŽIVIJE</span></div>
  </div>);
};

// PRODUCT FACT - apricot serif tile
const Fact: React.FC<{ a: number; b: number; y: number; text: string; size?: number }> = ({ a, b, y, text, size = 58 }) => {
  const f = useCurrentFrame();
  if (f < S(a) || f >= S(b)) return null;
  const k = ip(f, [S(a), S(a) + 7], [0, 1], eo), out = ip(f, [S(b) - 5, S(b)], [1, 0]);
  return (<div style={{ position: "absolute", left: 100, width: 880, top: y, textAlign: "center", opacity: out * k, transform: `translateY(calc(-50% + ${(1 - k) * 12}px))` }}>
    <span style={boxStyle(APRICOT, INK, size, SERIF)}>{text}</span>
  </div>);
};

// OFFER - deep-green panel, cream type, apricot GRATIS. Two lines: main + supporting.
const Offer: React.FC<{ a: number; b: number; y: number; main: React.ReactNode; sub?: string; size?: number }> = ({ a, b, y, main, sub, size = 64 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < S(a) || f >= S(b)) return null;
  const k = spring({ frame: f - S(a), fps, config: { damping: 22, stiffness: 150 } });
  return (<div style={{ position: "absolute", left: 0, width: 1080, top: y, display: "flex", justifyContent: "center" }}>
    <div style={{ background: GREEN, borderRadius: 28, padding: "22px 40px 24px", textAlign: "center", boxShadow: "0 14px 40px rgba(0,0,0,0.32)",
      opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 22}px) scale(${0.96 + 0.04 * k})`, maxWidth: 845 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: -0.5, color: CREAM, whiteSpace: "nowrap" }}>{main}</div>
      {sub ? <div style={{ marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 44, color: "#F7E3C6" }}>{sub}</div> : null}
    </div>
  </div>);
};
const G = (t: string) => <span style={{ color: APRICOT }}>{t}</span>;

// ---------------- HOOK VARIANTS (hook test, 10 Nov 2026) ----------------
// Only the opening changes: new hook VO, new opening B-roll (Canva Elements free stock) and opening captions.
// From the master time `from` on, everything is the untouched Hook A master, shifted by (cut - from).
type HookSpec = { cut: number; from: number; shots: Shot[]; subs: Sub[]; tiles: { t: string; at: number; kind: "cream" | "apricot" | "ink" | "serif"; rot: number; size: number }[] };
export const HOOKS: Record<"B" | "C", HookSpec> = {
  B: { cut: 4.43, from: 3.70,
    shots: [{ src: "CB1", off: 0.0, from: 0, to: 2.62, z: [1.0, 1.07] }, { src: "CB2", off: 0.1, from: 2.62, to: 4.43, z: [1.06, 1.0] }],
    subs: [{ t: "Zašto nam je lakše da kupimo novu rutinu", a: 0.2, b: 2.62, y: LOW }, { t: "nego da je stvarno pratimo?", a: 2.62, b: 4.43, y: LOW }],
    tiles: [{ t: "KUPIMO RUTINU…", at: 1.38, kind: "apricot", rot: -2.5, size: 80 }, { t: "ALI DA LI JE PRATIMO?", at: 2.62, kind: "ink", rot: 1.5, size: 74 }] },
  C: { cut: 4.47, from: 6.36,
    shots: [{ src: "CC1", off: 0.2, from: 0, to: 2.3, z: [1.0, 1.04] }, { src: "CC2", off: 0.5, from: 2.3, to: 4.47, z: [1.0, 1.04] }],
    subs: [{ t: "Ja sam odlična u počinjanju.", a: 0.1, b: 2.3, y: LOW }, { t: "Malo slabija u nastavljanju.", a: 2.3, b: 4.47, y: LOW }],
    tiles: [{ t: "ODLIČNA U POČINJANJU…", at: 0.55, kind: "cream", rot: 0, size: 58 }, { t: "SLABIJA U NASTAVLJANJU 😅", at: 2.5, kind: "serif", rot: 0, size: 54 }] },
};
export const durFor = (v?: string) => v === "B" || v === "C" ? DUR + HOOKS[v].cut - HOOKS[v].from : DUR;

const HookOpen: React.FC<{ h: HookSpec; playful: boolean }> = ({ h, playful }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f >= S(h.cut)) return null;
  return (<AbsoluteFill>
    <AbsoluteFill style={{ background: INK }}>
      {h.shots.map((c, i) => { const a = S(c.from), d = S(c.to) - a; const z = c.z ?? [1.0, 1.03];
        return (<Sequence key={i} from={a} durationInFrames={d}><AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(`vo01/${c.src}.mp4`)} muted startFrom={S(c.off)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.04) contrast(1.03)",
            transform: `scale(${ip(f - a, [0, d], z)})` }} />
        </AbsoluteFill></Sequence>); })}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,214,160,0.06), rgba(255,214,160,0) 40%, rgba(20,14,8,0.10) 100%)" }} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 100, width: 880, top: 470, textAlign: "center" }}>
      {h.tiles.map((t, i) => { const k = spring({ frame: f - S(t.at), fps, config: playful ? { damping: 11, stiffness: 190 } : { damping: 20, stiffness: 150 } });
        const bg = t.kind === "apricot" ? APRICOT : t.kind === "ink" ? INK : t.kind === "serif" ? APRICOT : "rgba(255,248,238,0.96)";
        const col = t.kind === "ink" ? CREAM : INK;
        return (<React.Fragment key={i}><div style={{ display: "inline-block", marginTop: i ? 16 : 0, opacity: Math.min(1, k * 1.6),
          transform: `translateY(${(1 - Math.min(1, k)) * 18}px) rotate(${t.rot}deg) scale(${playful ? 0.85 + 0.15 * k : 1})` }}>
          <span style={boxStyle(bg, col, t.size, t.kind === "serif" ? SERIF : SANS)}>{t.t}</span></div><br /></React.Fragment>); })}
    </div>
    {h.subs.map((x, i) => <Subtitle key={i} s={x} />)}
  </AbsoluteFill>);
};

export const VO01: React.FC<{ audio?: string; qcText?: boolean; variant?: "A" | "B" | "C" }> = ({ audio, qcText, variant = "A" }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const hk = variant === "B" || variant === "C" ? HOOKS[variant] : null;
  const from = hk ? hk.from : 0, shift = hk ? hk.cut - hk.from : 0;
  return (<AbsoluteFill style={{ background: qcText ? "#000" : INK }}>
    {audio ? <Audio src={staticFile(audio)} /> : null}
    <Sequence from={S(shift)} durationInFrames={S(DUR)}>
      <AbsoluteFill>
        {qcText ? null : <Shots />}
        {hk ? null : <Sequence from={0} durationInFrames={S(3.8)}><Hook /></Sequence>}
        {SUBS.filter((x) => x.b > from + 0.05).map((x, i) => <Subtitle key={i} s={x} />)}
        <Emphasis a={21.0} b={26.6} y={690} />
        <Fact a={33.0} b={34.52} y={1250} text="6 vrsta kolagena" />
        <Fact a={34.52} b={37.1} y={1250} text="Hijaluronska kiselina + vitamin C" size={50} />
        <Offer a={38.68} b={42.62} y={445} main={<>UZ 2 COLLAGENA — {G("Q10 GRATIS")}</>} sub="Koenzim Q10 na poklon" size={50} />
        <Offer a={42.62} b={DUR} y={445} main={<>2× COLLAGEN + {G("Q10 GRATIS")}</>} sub="Koenzim Q10 na poklon" size={54} />
      </AbsoluteFill>
    </Sequence>
    {hk && !qcText ? <HookOpen h={hk} playful={variant === "B"} /> : null}
    {hk && qcText ? <AbsoluteFill style={{ background: "#000" }}>{/* text-only QC */}</AbsoluteFill> : null}
  </AbsoluteFill>);
};
