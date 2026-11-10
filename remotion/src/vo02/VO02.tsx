import React from "react";
import { AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, delayRender, continueRender } from "remotion";

// KOLAGEN 2 VIDEO — VO 02 PRODUCT / OFFER — Hook A (Serbian). 10 Nov 2026.
// Caption identity "Botanical Gold": Plus Jakarta Sans ExtraBold + Cormorant Garamond italic, Biostile deep green studio,
// packaging gold, ivory; white captions with soft shadow, gold highlights. Clean premium motion (no bounce, no glitch).
// Real footage = Drive (RENE BROLS/KOLAGEN). Packshots = Rene's product images (Collagen Powder + HA, Q10 + Selenium).
// TEXT SAFE ZONE: Y 420-1500 (Rene's centre-square rule).

export const FPS = 30;
export const DUR = 33.5;
const S = (t: number) => Math.round(t * FPS);
const ip = (f: number, i: number[], o: number[], e?: (x: number) => number) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const eo = Easing.bezier(0.16, 1, 0.3, 1);

const SANS = "VO02Sans", SERIF = "VO02Serif";
const WHITE = "#FFFFFF", IVORY = "#FBF6EE", GREEN = "#1B4A37", GREEN2 = "#2A6A50", GOLD = "#E2BE6A", INK = "#14231B";
const R_LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const R_EXT = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const fontsReady = (() => {
  if (typeof document === "undefined") return Promise.resolve();
  const p: Promise<any>[] = [];
  for (const [sub, rng] of [["latin", R_LATIN], ["latin-ext", R_EXT]] as const) {
    for (const w of ["600", "700", "800"]) p.push(new FontFace(SANS, `url(${staticFile(`vo02/fonts/plus-jakarta-sans-${sub}-${w}-normal.woff2`)})`, { weight: w, unicodeRange: rng }).load().then((x) => (document.fonts as any).add(x)));
    for (const w of ["500", "600"]) p.push(new FontFace(SERIF, `url(${staticFile(`vo02/fonts/cormorant-garamond-${sub}-${w}-italic.woff2`)})`, { weight: w, style: "italic", unicodeRange: rng }).load().then((x) => (document.fonts as any).add(x)));
  }
  return Promise.all(p);
})();

// ---------------- EDIT (VO take B, Mina; segments placed with small breaths between scenes) ----------------
type Shot = { src: string; off: number; from: number; to: number; rate?: number; z?: [number, number]; oy?: number };
const SHOTS: Shot[] = [
  { src: "P8", off: 0.15, from: 0, to: 3.4, rate: 0.5, z: [1.16, 1.27], oy: 360 },  // S1 two real Collagen boxes
  { src: "P21", off: 1.6, from: 3.4, to: 5.4, z: [1.0, 1.05] },                     // S2 box opened, sachets inside
  { src: "M8", off: 2.2, from: 5.4, to: 7.0 },                                      //    sachets
  { src: "M2", off: 2.8, from: 7.0, to: 8.6, z: [1.04, 1.0] },                      //    sachet close-up in the sun
  { src: "P38", off: 3.0, from: 8.6, to: 10.3, z: [1.0, 1.06] },                    // S3 NOVO box front
  { src: "P22", off: 0.8, from: 14.4, to: 16.0 },                                   //    sachet poured
  { src: "M6", off: 1.2, from: 16.0, to: 18.0, z: [1.0, 1.04] },                    //    stirred, box behind
  { src: "P20", off: 0.4, from: 18.0, to: 19.4, z: [1.04, 1.0] },                   // S4 frothing
  { src: "P8", off: 0.5, from: 24.5, to: 26.9, rate: 0.5, z: [1.2, 1.28], oy: 380 }, // S5 two real boxes again
];
const COMP_ING: [number, number] = [10.3, 14.4], COMP_GIFT: [number, number] = [19.4, 24.5], END: number = 26.9;

// ---------------- SUBTITLES (*word* = gold highlight) ----------------
type Sub = { t: string; a: number; b: number };
const SUBS: Sub[] = [
  { t: "Uz *dva Collagena*", a: 0.12, b: 1.10 },
  { t: "dobijaš i *Q10 na poklon*.", a: 1.10, b: 3.45 },
  { t: "Ako planiraš da uključiš Collagen", a: 3.66, b: 5.40 },
  { t: "u svoju svakodnevnu rutinu,", a: 5.40, b: 6.98 },
  { t: "pogledaj ovu ponudu.", a: 6.98, b: 8.55 },
  { t: "Biostile Collagen kombinuje", a: 8.76, b: 10.50 },
  { t: "*šest vrsta kolagena*,", a: 10.50, b: 11.90 },
  { t: "*hijaluronsku kiselinu*", a: 11.90, b: 13.22 },
  { t: "i *vitamin C*.", a: 13.22, b: 14.40 },
  { t: "Praktične kesice", a: 14.40, b: 15.58 },
  { t: "jednostavno se pripremaju kao napitak.", a: 15.58, b: 17.95 },
  { t: "A tokom ove akcije,", a: 18.18, b: 19.48 },
  { t: "kada poručiš *dva Collagena*,", a: 19.48, b: 21.27 },
  { t: "Koenzim Q10 sa selenom", a: 21.27, b: 23.18 },
  { t: "dobijaš *na poklon*.", a: 23.18, b: 24.45 },
  { t: "*Dva Collagena*", a: 24.66, b: 25.68 },
  { t: "i jedan dodatni proizvod *gratis*.", a: 25.68, b: 27.95 },
  { t: "Pogledaj paket na Biostile sajtu.", a: 27.95, b: 30.6 },
];
const SUB_Y = 1400;

const rich = (t: string) => t.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith("*") ? <span key={i} style={{ color: GOLD }}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>);
const shadow = "0 2px 3px rgba(0,0,0,0.55), 0 6px 20px rgba(0,0,0,0.45)";

const Subtitle: React.FC<{ s: Sub }> = ({ s }) => {
  const f = useCurrentFrame();
  const a = S(s.a), b = S(s.b);
  if (f < a || f >= b) return null;
  const k = ip(f, [a, a + 5], [0, 1], eo);
  return (<div style={{ position: "absolute", left: 110, width: 860, top: SUB_Y, transform: `translateY(calc(-50% + ${(1 - k) * 10}px))`, opacity: k,
    textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 54, lineHeight: 1.18, color: WHITE, letterSpacing: -0.4, textShadow: shadow,
    WebkitTextStroke: "0.8px rgba(10,20,15,0.45)" } as any}>{rich(s.t)}</div>);
};

// ---------------- FOOTAGE ----------------
const Footage: React.FC = () => {
  const f = useCurrentFrame();
  return (<>{SHOTS.map((c, i) => {
    const a = S(c.from), d = S(c.to) - a; const z = c.z ?? [1.0, 1.03];
    // soft blur-in for the first 4 frames of each shot (smooth premium cut)
    const bl = ip(f - a, [0, 4], [6, 0]);
    return (<Sequence key={i} from={a} durationInFrames={d}>
      <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
        <OffthreadVideo src={staticFile(`vo01/${c.src}.mp4`)} muted startFrom={S(c.off)} playbackRate={c.rate ?? 1}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: `saturate(1.03) contrast(1.04) brightness(1.02) blur(${bl}px)`,
            transformOrigin: "50% 100%", transform: `translateY(${c.oy ?? 0}px) scale(${ip(f - a, [0, d], z)})` }} />
        {/* warm-neutral grade + bottom caption band */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,236,210,0.05), rgba(255,236,210,0) 45%, rgba(10,18,14,0.0) 60%, rgba(10,18,14,0.34) 100%)" }} />
      </AbsoluteFill>
    </Sequence>);
  })}</>);
};

// ---------------- STUDIO (deep green, soft spotlight, few drifting sparkles) ----------------
const Studio: React.FC<{ glowAt?: number }> = ({ glowAt }) => {
  const f = useCurrentFrame();
  const g = glowAt === undefined ? 0 : ip(f, [S(glowAt), S(glowAt) + 12], [0, 1], eo);
  const dots = [[180, 520], [880, 600], [260, 1180], [820, 1240], [540, 470], [150, 900], [930, 980]];
  return (<AbsoluteFill style={{ background: `radial-gradient(70% 45% at 50% 52%, ${GREEN2} 0%, ${GREEN} 62%, #12352A 100%)` }}>
    <AbsoluteFill style={{ background: `radial-gradient(34% 22% at 50% 62%, rgba(226,190,106,${0.28 * g}) 0%, rgba(226,190,106,0) 70%)` }} />
    {dots.map(([x, y], i) => { const tw = 0.25 + 0.25 * Math.sin((f + i * 17) / 14); return <div key={i} style={{ position: "absolute", left: x, top: y + Math.sin((f + i * 30) / 40) * 10, width: 6, height: 6, borderRadius: 3, background: GOLD, opacity: tw, boxShadow: `0 0 12px ${GOLD}` }} />; })}
  </AbsoluteFill>);
};

const Pack: React.FC<{ src: string; x: number; y: number; w: number; o?: number; s?: number; r?: number; shadowY?: number }> = ({ src, x, y, w, o = 1, s = 1, r = 0, shadowY = 26 }) => (
  <Img src={staticFile(`vo02/${src}`)} style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `scale(${s}) rotate(${r}deg)`, transformOrigin: "50% 80%",
    filter: `drop-shadow(0 ${shadowY}px 34px rgba(0,0,0,0.38))` }} />
);

const GiftIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" /><path d="M12 8v13" />
    <path d="M12 8c-1.5-3-5-3.5-5-1.2C7 8 9 8 12 8z" /><path d="M12 8c1.5-3 5-3.5 5-1.2C17 8 15 8 12 8z" />
  </svg>
);

const rise = (f: number, at: number, dist = 22) => { const k = ip(f, [S(at), S(at) + 9], [0, 1], eo); return { opacity: k, transform: `translateY(${(1 - k) * dist}px)` }; };

// S1 hook typography over the two real boxes
const HookText: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = spring({ frame: f - S(0.42), fps, config: { damping: 18, stiffness: 160 } });
  const b = spring({ frame: f - S(1.80), fps, config: { damping: 16, stiffness: 150 } });
  const out = ip(f, [S(3.25), S(3.4)], [1, 0]);
  return (<div style={{ position: "absolute", left: 0, width: 1080, top: 460, textAlign: "center", opacity: out }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 128, lineHeight: 1, letterSpacing: -3, color: WHITE, textShadow: shadow,
      opacity: Math.min(1, a * 1.5), transform: `scale(${0.82 + 0.18 * Math.min(1, a)})` }}><span style={{ color: GOLD }}>2×</span> COLLAGEN</div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 16, marginTop: 22, padding: "14px 34px 16px", borderRadius: 60, background: GOLD, color: GREEN,
      fontFamily: SANS, fontWeight: 800, fontSize: 60, letterSpacing: -0.5, boxShadow: "0 12px 34px rgba(0,0,0,0.3)",
      opacity: Math.min(1, b * 1.5), transform: `translateY(${(1 - Math.min(1, b)) * 24}px) scale(${0.9 + 0.1 * Math.min(1, b)})` }}>
      <GiftIcon size={52} color={GREEN} /> + Q10 POKLON</div>
  </div>);
};

// S3 ingredient highlights on the studio
const Ingredients: React.FC = () => {
  const f = useCurrentFrame(); const a = S(COMP_ING[0]);
  const ent = ip(f, [a, a + 12], [0, 1], eo);
  const rows: [number, React.ReactNode, string][] = [
    [10.52, <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 52 }}>6</span>, "VRSTA KOLAGENA"],
    [11.92, <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={2}><path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" /></svg>, "HIJALURONSKA KISELINA"],
    [13.36, <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>C</span>, "VITAMIN C"],
  ];
  return (<AbsoluteFill>
    <Studio />
    <Pack src="collagen_pack.png" x={240} y={430 + (1 - ent) * 40} w={600} o={ent} s={1 + 0.03 * ip(f, [a, S(COMP_ING[1])], [0, 1])} />
    {rows.map(([t, icon, label], i) => { const st = rise(f, t, 0); const k = ip(f, [S(t), S(t) + 9], [0, 1], eo);
      return (<div key={i} style={{ position: "absolute", left: 150, top: 960 + i * 104, display: "flex", alignItems: "center", gap: 26, opacity: st.opacity, transform: `translateX(${(1 - k) * -60}px)` }}>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: GOLD, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}>{icon}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: 0.5, color: WHITE }}>{label}</div>
      </div>); })}
  </AbsoluteFill>);
};

// S4 gift reveal: two Collagens, then Q10 enters in front with glow + POKLON tag
const GiftReveal: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const a = S(COMP_GIFT[0]);
  const l = ip(f, [a, a + 14], [0, 1], eo), r = ip(f, [a + 3, a + 17], [0, 1], eo);
  const q = spring({ frame: f - S(21.29), fps, config: { damping: 17, stiffness: 120 } });
  const tag = spring({ frame: f - S(23.18), fps, config: { damping: 14, stiffness: 170 } });
  return (<AbsoluteFill>
    <Studio glowAt={21.29} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 440, textAlign: "center" }}>
      <div style={{ ...rise(f, 19.5), fontFamily: SANS, fontWeight: 800, fontSize: 68, color: WHITE, letterSpacing: -1 }}><span style={{ color: GOLD }}>2×</span> COLLAGEN</div>
      <div style={{ ...rise(f, 21.29), marginTop: 6, fontFamily: SANS, fontWeight: 700, fontSize: 48, color: GOLD, letterSpacing: 2 }}>+ KOENZIM Q10 + SELEN</div>
    </div>
    <Pack src="collagen_pack.png" x={40 - (1 - l) * 200} y={640} w={520} o={l} r={-3} />
    <Pack src="collagen_pack.png" x={520 + (1 - r) * 200} y={640} w={520} o={r} r={3} />
    <Pack src="q10_pack.png" x={398} y={780 + (1 - Math.min(1, q)) * 120} w={284} o={Math.min(1, q * 1.4)} s={0.85 + 0.15 * Math.min(1, q)} shadowY={30} />
    <div style={{ position: "absolute", left: 660, top: 820, display: "flex", alignItems: "center", gap: 10, padding: "10px 24px 12px", borderRadius: 40, background: GOLD, color: GREEN,
      fontFamily: SANS, fontWeight: 800, fontSize: 44, boxShadow: "0 10px 26px rgba(0,0,0,0.3)", opacity: Math.min(1, tag * 1.5), transform: `rotate(-6deg) scale(${0.7 + 0.3 * Math.min(1, tag)})` }}>
      <GiftIcon size={40} color={GREEN} /> POKLON</div>
  </AbsoluteFill>);
};

// S5a overlay on the real two boxes
const OfferOverlay: React.FC = () => {
  const f = useCurrentFrame();
  return (<div style={{ position: "absolute", left: 0, width: 1080, top: 450, textAlign: "center" }}>
    <div style={{ ...rise(f, 24.66), fontFamily: SANS, fontWeight: 800, fontSize: 96, color: WHITE, letterSpacing: -2, textShadow: shadow }}><span style={{ color: GOLD }}>2×</span> COLLAGEN</div>
    <div style={{ ...rise(f, 25.9), display: "inline-flex", alignItems: "center", gap: 14, marginTop: 14, padding: "8px 28px 8px 12px", borderRadius: 60, background: "rgba(27,74,55,0.92)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
      <div style={{ width: 86, height: 86, borderRadius: 43, background: IVORY, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("vo02/q10_pack.png")} style={{ height: 76 }} /></div>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 54, color: WHITE }}>+ Q10 <span style={{ color: GOLD }}>GRATIS</span></span>
    </div>
  </div>);
};

// S5b end card
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const a = S(END);
  const p = ip(f, [a, a + 16], [0, 1], eo);
  const cta = spring({ frame: f - S(28.0), fps, config: { damping: 16, stiffness: 150 } });
  const pulse = 1 + 0.025 * Math.max(0, Math.sin((f - S(28.6)) / 9)) * (f > S(28.6) ? 1 : 0);
  return (<AbsoluteFill>
    <Studio glowAt={END} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 440, textAlign: "center" }}>
      <div style={{ ...rise(f, END + 0.05), fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.02, letterSpacing: -2, color: WHITE }}><span style={{ color: GOLD }}>2×</span> COLLAGEN</div>
      <div style={{ ...rise(f, END + 0.3), fontFamily: SANS, fontWeight: 800, fontSize: 92, lineHeight: 1.02, letterSpacing: -2, color: GOLD }}>+ Q10 GRATIS</div>
    </div>
    <Pack src="collagen_pack.png" x={70} y={680 + (1 - p) * 40} w={450} o={p} r={-3} />
    <Pack src="collagen_pack.png" x={560} y={680 + (1 - p) * 40} w={450} o={p} r={3} />
    <Pack src="q10_pack.png" x={430} y={730 + (1 - p) * 60} w={220} o={p} shadowY={28} />
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1176, textAlign: "center", ...rise(f, END + 0.6, 14) }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: IVORY }}>KOENZIM Q10 SA SELENOM <span style={{ color: GOLD }}>NA POKLON</span></span>
    </div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1236, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 44px 18px", borderRadius: 60, background: GOLD, color: GREEN, fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: 1,
        boxShadow: "0 12px 30px rgba(0,0,0,0.3)", opacity: Math.min(1, cta * 1.5), transform: `translateY(${(1 - Math.min(1, cta)) * 20}px) scale(${pulse})` }}>
        POGLEDAJ PAKET <span style={{ fontSize: 44 }}>→</span></div>
    </div>
  </AbsoluteFill>);
};

export const VO02: React.FC<{ audio?: string; qcText?: boolean; layer?: "full" | "scenes" | "overlay" }> = ({ audio, qcText, layer = "full" }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const inComp = (r: [number, number]) => f >= S(r[0]) && f < S(r[1]);
  if (layer === "overlay") return (<AbsoluteFill style={{ background: "transparent" }}>{f < S(3.4) ? <HookText /> : null}{f >= S(24.5) && f < S(END) ? <OfferOverlay /> : null}</AbsoluteFill>);
  if (layer === "scenes") return (<AbsoluteFill style={{ background: GREEN }}>{inComp(COMP_ING) ? <Ingredients /> : null}{inComp(COMP_GIFT) ? <GiftReveal /> : null}{f >= S(END) ? <EndCard /> : null}</AbsoluteFill>);
  return (<AbsoluteFill style={{ background: qcText ? "#000" : GREEN }}>
    {qcText ? null : <Footage />}
    {qcText ? null : inComp(COMP_ING) ? <Ingredients /> : null}
    {qcText ? null : inComp(COMP_GIFT) ? <GiftReveal /> : null}
    {qcText ? null : f >= S(END) ? <EndCard /> : null}
    {audio ? <Audio src={staticFile(audio)} /> : null}
    {f < S(3.4) ? <HookText /> : null}
    {f >= S(24.5) && f < S(END) ? <OfferOverlay /> : null}
    {SUBS.map((s, i) => <Subtitle key={i} s={s} />)}
  </AbsoluteFill>);
};
