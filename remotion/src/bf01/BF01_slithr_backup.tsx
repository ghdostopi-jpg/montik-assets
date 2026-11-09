// BIOSTILE Black Friday 2026 — Video 01 "VEČ KUPITE, VEČ DARIL DOBITE!" — v2 (polish revision)
// v5 (final client script): "JE TUKAJ!", voucher without €100 condition ("Ob nakupu prejmete še kupon −25% ZA NASLEDNJI NAKUP!"),
//     final CTA held 0.5 s longer (29.0 s).
// v4: every text inside an inner text box X 140–905 / Y 260–1430 (40 px inside the client safe zone), sizes fitted
//     to measured font widths; voucher card text centred + gift shelf fills the lower half; new upbeat score.
// v3.1: Sun Kissed + Celuline pack shots replaced with the client's clean studio pack shots (11/9).
// v3 (brand + safe zone): BIOSTILE palette — white stage, Biostile green (brand/CTA), sale red (discounts/urgency).
//     Colours sampled from biostile.si/trgovina (button #387C46, headings #1C472D, AKCIJA badge #EA3323).
//     Safe zone per client reference: X 100–945, Y 220–1470. Copy, timing, animation, footage and audio unchanged.
// (v2) Identity "Noir Champagne": black stage, bright champagne-gold type, real product cut-outs and real B-roll.
// v2: product rim/back light, brighter gold, safe zones (top 250 / bottom 320 / sides 90), bigger tiers,
//     longer reading holds, carousel → still showcase, slower ending. ~27.5 s.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random } from "remotion";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/600.css";
import "@fontsource/oswald/700.css";
import "@fontsource/bodoni-moda/500-italic.css";
import { ShimmerTransition } from "./ShimmerTransition";
import { COPY, CopyCtx, useCopy, Lang } from "./copy";

const S = (f: string) => staticFile(`bf/${f}`);
const DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const SERIF = "'Bodoni Moda', Didot, serif";
// BIOSTILE brand palette (sampled from biostile.si)
const WHITE = "#FFFFFF";
const NEUTRAL = "#F6F7F5";
const CHARCOAL = "#171717";
const GREEN = "#387C46";       // Biostile green — brand, accents, CTA
const GREEN_DK = "#1C472D";    // Biostile dark green — headings
const RED = "#EA3323";         // sale red — discounts, percentages, urgency
const INK = WHITE;             // stage base (was black)
const IVORY = CHARCOAL;        // secondary copy colour on white (was ivory on black)
const TONES = {
  red: `linear-gradient(100deg, #D9241A 0%, ${RED} 45%, #F0473A 70%, #D9241A 100%)`,
  green: `linear-gradient(100deg, ${GREEN_DK} 0%, ${GREEN} 45%, #3F8A4F 70%, ${GREEN_DK} 100%)`,
} as const;
type Tone = keyof typeof TONES;
// client safe zone (reference image): top 220, bottom 450, left 35 + right UI 100 → conservative X 100–945, Y 220–1470
export const SAFE = { top: 220, bottom: 1470, left: 100, right: 945 };
const CX = (SAFE.left + SAFE.right) / 2; // 522.5 — horizontal centre of the safe zone
// inner text box: 40 px inside the safe zone on every side — no text ever comes near the platform UI
export const TXT = { left: SAFE.left + 40, right: SAFE.right - 40, top: SAFE.top + 40, bottom: SAFE.bottom - 40 };
const TW = TXT.right - TXT.left;          // 765 px
const BASE = SAFE.bottom - 20;            // product floor line (20 px above the bottom of the safe zone)
const B = 1920 - BASE;                    // = 470 → "bottom" value that puts a pack on the floor line
const E = { out: Easing.bezier(0.16, 1, 0.3, 1), inOut: Easing.bezier(0.65, 0, 0.35, 1), back: Easing.bezier(0.34, 1.4, 0.64, 1) };
const ip = (f: number, i: number[], o: number[], e: (t: number) => number = E.out) =>
  interpolate(f, i, o, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const useSec = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return { f, fps, t: f / fps }; };
const lerp = (a: number, b: number, m: number) => a + (b - a) * m;

// scene timing (seconds) — animate in → hold → out
export const T = { hook: [0, 4.5], tiers: [4.5, 11.0], choose: [11.0, 17.0], voucher: [17.0, 22.5], final: [22.5, 29.0] } as const;
export const DURATION = 29.0;

const ASPECT: Record<string, number> = { "sunrise.png": 1.404, "triple_action.png": 0.446, "intimate_gel.png": 0.254, "hairo.png": 0.2716, "sunkissed_wood.png": 0.3437, "celuline_clean.png": 0.3398, "sunkissed_clean.png": 0.2881 };

// exact emoji from the approved copy (🎁 ⏰), rendered with Noto Color Emoji and tinted to the brand palette
const EMOJI_TINT: Record<Tone, string> = {
  green: "grayscale(1) contrast(1.15) sepia(1) hue-rotate(62deg) saturate(2.6) brightness(0.72)",
  red: "grayscale(1) contrast(1.1) sepia(1) hue-rotate(-38deg) saturate(5.5) brightness(0.92)",
};
const Emo: React.FC<{ e: string; size: number; style?: React.CSSProperties; tone?: Tone }> = ({ e, size, style, tone = "green" }) => (
  <span style={{ fontFamily: "'Noto Color Emoji'", fontSize: size, lineHeight: 1, filter: EMOJI_TINT[tone], display: "inline-block", ...style }}>{e}</span>
);
const ARROW_FONT = "'Inter', 'DejaVu Sans', sans-serif";

/* ---------------- shared look ---------------- */
const Stage: React.FC<{ glowY?: number; k?: number }> = ({ glowY = 62, k = 1 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${WHITE} 0%, ${WHITE} 52%, ${NEUTRAL} 78%, #ECEFEA 100%)` }}>
    {/* clean white stage: faint Biostile-green halo behind the product area, soft neutral edges */}
    <AbsoluteFill style={{ background: `radial-gradient(70% 30% at 50% ${glowY}%, rgba(56,124,70,${0.09 * k}), rgba(56,124,70,${0.035 * k}) 50%, rgba(56,124,70,0) 78%)` }} />
    <AbsoluteFill style={{ background: "radial-gradient(130% 90% at 50% 45%, rgba(23,23,23,0) 62%, rgba(23,23,23,0.07) 100%)" }} />
  </AbsoluteFill>
);

const GoldDust: React.FC<{ n?: number; seed?: string; k?: number }> = ({ n = 60, seed = "d", k = 1 }) => {
  const { f } = useSec();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const sp = 0.25 + random(`${seed}s${i}`) * 0.8;
        const y = (((random(`${seed}y${i}`) * 2100) - f * sp) % 2100 + 2100) % 2100 - 90;
        const r = 1.2 + random(`${seed}r${i}`) * 3;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / (14 + random(`${seed}t${i}`) * 30) + i));
        const a = (0.2 + random(`${seed}a${i}`) * 0.5) * tw * k;
        const c = random(`${seed}c${i}`) < 0.72 ? GREEN : RED;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(f / 60 + i) * 14, top: y, width: r * 2, height: r * 2, borderRadius: "50%", background: c, opacity: a * 0.55 }} />;
      })}
    </AbsoluteFill>
  );
};

// (named Gold in v2) brand-tone gradient type with the same light sweep: red = discount/urgency, green = brand
const Gold: React.FC<{ children: React.ReactNode; size: number; weight?: number; family?: string; style?: React.CSSProperties; sweepAt?: number; tone?: Tone }> = ({ children, size, weight = 700, family = DISPLAY, style, sweepAt = 0, tone = "red" }) => {
  const { f, fps } = useSec();
  const pos = interpolate(f, [sweepAt * fps, sweepAt * fps + 1.2 * fps], [120, -40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = (f * 0.25) % 200;
  return (
    <span style={{ fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1, backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${pos - 8}%, rgba(255,255,255,0.55) ${pos}%, rgba(255,255,255,0) ${pos + 8}%), ${TONES[tone]}`, backgroundSize: `100% 100%, 200% 100%`, backgroundPosition: `0 0, ${drift}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 10px rgba(23,23,23,0.10))", ...style }}>
      {children}
    </span>
  );
};

const Line: React.FC<{ text: string; at: number; size: number; y: number; gold?: boolean; tone?: Tone; tracking?: string; weight?: number; out?: number; family?: string; italic?: boolean; color?: string }> = ({ text, at, size, y, gold, tone = "green", tracking = "0.02em", weight = 700, out = 999, family = DISPLAY, italic, color = CHARCOAL }) => {
  const { f, fps } = useSec();
  const s = at * fps;
  const a = ip(f, [s, s + 10], [0, 1]) * ip(f, [out * fps, out * fps + 12], [1, 0], E.inOut);
  const dy = ip(f, [s, s + 22], [size * 0.5, 0]);
  const bl = ip(f, [s, s + 14], [12, 0]);
  const st: React.CSSProperties = { display: "inline-block", letterSpacing: tracking, fontStyle: italic ? "italic" : undefined, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: y, textAlign: "center", opacity: a, transform: `translateY(${dy}px)`, filter: `blur(${bl}px)` }}>
      {gold ? <Gold size={size} weight={weight} family={family} sweepAt={at + 0.4} style={st} tone={tone}>{text}</Gold>
        : <span style={{ ...st, fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: 1, color }}>{text}</span>}
    </div>
  );
};

const Rise: React.FC<{ text: string; at: number; size: number; y: number; stagger?: number }> = ({ text, at, size, y, stagger = 2 }) => {
  const { f, fps } = useSec();
  return (
    <div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: y, textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", height: size * 1.12 }}>
      {Array.from(text).map((ch, i) => {
        const s = at * fps + i * stagger;
        const p = ip(f, [s, s + 18], [1, 0]);
        if (/\p{Extended_Pictographic}/u.test(ch)) return <span key={i} style={{ display: "inline-block", transform: `translateY(${p * size * 1.1}px)`, marginRight: size * 0.12 }}><Emo e={ch} size={size * 0.78} tone="red" /></span>;
        return <span key={i} style={{ display: "inline-block", transform: `translateY(${p * size * 1.1}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1, color: CHARCOAL }}>{ch === " " ? " " : ch}</span>;
      })}
    </div>
  );
};

// real product cut-out (pixels untouched): soft green halo + soft drop shadow + contact shadow + floor reflection
const Product: React.FC<{ file: string; h: number; x: number; bottom: number; at?: number; z?: number; dim?: number; float?: number; reflect?: boolean; blur?: number }> = ({ file, h, x, bottom, at = 0, z = 1, dim = 0, float = 4, reflect = true, blur = 0 }) => {
  const { f, fps } = useSec();
  const s = at * fps;
  const p = spring({ frame: f - s, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const a = ip(f, [s, s + 12], [0, 1]);
  const dy = (1 - p) * 200;
  const fl = Math.sin((f + x) / 40) * float;
  const w = h * (ASPECT[file] ?? 0.4);
  const top = 1920 - bottom - h;
  return (
    <div style={{ position: "absolute", left: x, top: top + dy + fl, width: w, height: h, transform: `translateX(-50%) scale(${z * (0.94 + 0.06 * p)})`, transformOrigin: "50% 100%", opacity: a, filter: blur ? `blur(${blur}px)` : undefined }}>
      {/* graphite / warm back light directly behind the pack */}
      <div style={{ position: "absolute", left: "50%", top: "48%", width: Math.max(w * 2.0, h * 0.9), height: h * 1.25, transform: "translate(-50%,-50%)", background: "radial-gradient(closest-side, rgba(56,124,70,0.10), rgba(56,124,70,0.04) 55%, rgba(56,124,70,0) 100%)" }} />
      {/* contact shadow */}
      <div style={{ position: "absolute", left: "50%", bottom: -h * 0.025, width: w * 1.25, height: Math.max(18, h * 0.05), transform: "translateX(-50%)", background: "radial-gradient(closest-side, rgba(23,23,23,0.38), rgba(23,23,23,0))" }} />
      <Img src={S(file)} style={{ position: "relative", height: h, width: w, display: "block", filter: `${dim ? `brightness(${1 - dim * 0.4}) ` : ""}drop-shadow(0 14px 18px rgba(23,23,23,0.16))` }} />
      {reflect ? <Img src={S(file)} style={{ position: "absolute", left: 0, top: h + 4, height: h, width: w, transform: "scaleY(-1)", opacity: 0.12, WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 20%)", maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 20%)" }} /> : null}
    </div>
  );
};

const Shelf: React.FC<{ y: number }> = ({ y }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: y, height: 90, background: "radial-gradient(60% 100% at 50% 0%, rgba(23,23,23,0.06), rgba(23,23,23,0) 80%)", borderTop: `2px solid rgba(56,124,70,0.45)` }} />
);
const Floor: React.FC<{ y: number }> = ({ y }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 1920 - y, background: "linear-gradient(to bottom, rgba(23,23,23,0.05), rgba(23,23,23,0) 35%)", borderTop: "1px solid rgba(23,23,23,0.10)" }} />
);

const LightSweep: React.FC<{ at: number; dur?: number; k?: number }> = ({ at, dur = 1.4, k = 1 }) => {
  const { f, fps } = useSec();
  if (f < at * fps || f > (at + dur) * fps) return null;
  const p = ip(f, [at * fps, (at + dur) * fps], [-30, 130], E.inOut);
  return <AbsoluteFill style={{ pointerEvents: "none", background: `linear-gradient(108deg, rgba(255,255,255,0) ${p - 10}%, rgba(255,255,255,${0.28 * k}) ${p}%, rgba(255,255,255,0) ${p + 10}%)` }} />;
};

// decorative Black Friday ribbon (may run outside the safe zone)
const Tape: React.FC<{ y: number; rot: number; gold?: boolean; speed?: number; at?: number }> = ({ y, rot, gold, speed = 2.2, at = 0 }) => {
  const { f, fps } = useSec();
  const grow = ip(f, [at * fps, at * fps + 22], [0, 1], E.inOut);
  const off = -(((f * speed) % 1400) + 1400) % 1400;
  const text = useCopy().tape;
  return (
    <div style={{ position: "absolute", left: -300, width: 1680, top: y, height: 70, transform: `rotate(${rot}deg)`, background: gold ? RED : GREEN, borderTop: "none", borderBottom: "none", boxShadow: "0 10px 24px rgba(23,23,23,0.18)", overflow: "hidden", clipPath: `inset(0 ${(1 - grow) * 100}% 0 0)` }}>
      <div style={{ position: "absolute", left: off, top: 11, whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, letterSpacing: "0.12em", color: WHITE }}>{text.repeat(6)}</div>
    </div>
  );
};

/* ---------------- 1) HOOK ---------------- */
const Hook: React.FC = () => {
  const { f, fps } = useSec();
  const slam = spring({ frame: f - 0.9 * fps, fps, config: { damping: 11, stiffness: 140, mass: 0.8 } });
  const a = ip(f, [0.9 * fps, 0.9 * fps + 6], [0, 1]);
  const push = ip(f, [0, 4.5 * fps], [1, 1.04], (x) => x);
  const c = useCopy();
  return (
    <AbsoluteFill>
      <Stage glowY={74} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 82%" }}>
        <Tape y={1290} rot={-7} gold at={0.5} />
        <Tape y={1365} rot={5} at={0.7} speed={-1.8} />
        <Floor y={BASE} />
        <Product file="celuline_clean.png" h={400} x={225} bottom={B} at={0.25} />
        <Product file="hairo.png" h={440} x={840} bottom={B} at={0.4} />
        <Product file="sunrise.png" h={272} x={CX} bottom={B} at={0.55} />
      </AbsoluteFill>
      <GoldDust n={50} seed="hook" />
      <Rise text="🎁 BLACK FRIDAY" at={0.05} size={100} y={262} />
      <Line text={c.je} at={0.4} size={92} y={384} gold tracking="0.08em" />
      <Line text={c.pop} at={0.85} size={54} y={500} tracking="0.24em" weight={500} color={IVORY} />
      <div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: 566, textAlign: "center", opacity: a, transform: `scale(${1.55 - 0.55 * slam})`, filter: `blur(${(1 - Math.min(1, slam)) * 10}px)` }}>
        <Gold size={300} sweepAt={1.4} style={{ letterSpacing: "-0.01em" }}>-60%</Gold>
      </div>
      <Line text={c.free} at={1.9} size={c.freeSize} y={880} gold tracking="0.03em" />
      <LightSweep at={2.8} />
    </AbsoluteFill>
  );
};

/* ---------------- 2) GIFT TIERS — big, all three held together ---------------- */
const Tier: React.FC<{ amount: string; qty: string; word: string; n: number; at: number; y: number; hl: [number, number] }> = ({ amount, qty, word, n, at, y, hl }) => {
  const { f, fps } = useSec();
  const a = ip(f, [at * fps, at * fps + 12], [0, 1]);
  const dx = ip(f, [at * fps, at * fps + 24], [-70, 0]);
  const glow = ip(f, [hl[0] * fps, hl[0] * fps + 8], [0, 1]) * ip(f, [hl[1] * fps, hl[1] * fps + 10], [1, 0]);
  const K = useCopy().tierK; // per-language fit for longer words
  return (
    <div style={{ position: "absolute", left: TXT.left, width: TW, top: y, height: 132, opacity: a, transform: `translateX(${dx}px) scale(${1 + 0.02 * glow})`, borderRadius: 22, background: WHITE, border: `${2 + 2 * glow}px solid rgba(56,124,70,${0.45 + 0.55 * glow})`, boxShadow: `0 10px 26px rgba(23,23,23,0.08), 0 0 ${28 * glow}px rgba(56,124,70,${0.28 * glow})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px", boxSizing: "border-box" }}>
      <Emo e="🎁" size={54 * K} style={{ marginRight: 14 * K }} tone="red" />
      <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 68 * K, color: CHARCOAL, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{amount}</span>
      <span style={{ fontFamily: ARROW_FONT, fontWeight: 600, fontSize: 58 * K, color: GREEN, margin: `0 ${14 * K}px`, lineHeight: 1 }}>{"\u2192"}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 14 * K }}>
        <Gold size={96 * K} sweepAt={at + 0.3} tone="red">{qty}</Gold>
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 58 * K, color: GREEN_DK, letterSpacing: "0.03em" }}>{word}</span>
      </span>
    </div>
  );
};
const Tiers: React.FC = () => {
  const { f, fps } = useSec();
  const t2 = ip(f, [1.4 * fps, 1.9 * fps], [0, 1], E.inOut);
  const t3 = ip(f, [2.2 * fps, 2.7 * fps], [0, 1], E.inOut);
  const x1 = CX - 170 * t2 - 80 * t3, x2 = CX + 170 * t2 - 90 * t3, x3 = CX + 340 * t3 - 90 * t3;
  const c = useCopy();
  return (
    <AbsoluteFill>
      <Stage glowY={78} />
      <GoldDust n={30} seed="tier" k={0.7} />
      <Line text={c.t1} at={0.05} size={c.tSize} y={262} />
      <Line text={c.t2} at={0.2} size={c.tSize} y={358} gold />
      {/* rows build fast, then all three stay together ~4 s; each is briefly highlighted */}
      <Tier amount={`${c.tierPrefix} 100€`} qty="1" word={c.tierWords[0]} n={1} at={0.6} y={478} hl={[2.9, 3.7]} />
      <Tier amount={`${c.tierPrefix} 150€`} qty="2" word={c.tierWords[1]} n={2} at={1.4} y={624} hl={[3.7, 4.5]} />
      <Tier amount={`${c.tierPrefix} 200€`} qty="3" word={c.tierWords[2]} n={3} at={2.2} y={770} hl={[4.5, 6.6]} />
      <Floor y={BASE} />
      <Product file="triple_action.png" h={420} x={x1} bottom={B} at={0.7} />
      <Sequence from={Math.round(1.5 * fps)}><Product file="intimate_gel.png" h={405} x={x2} bottom={B} /></Sequence>
      <Sequence from={Math.round(2.3 * fps)}><Product file="sunkissed_clean.png" h={412} x={x3} bottom={B} /></Sequence>
    </AbsoluteFill>
  );
};

/* ---------------- 3) CUSTOMER CHOOSES — box opens → carousel → still showcase (3 s hold) ---------------- */
// still showcase: two lit shelves, every pack upright and readable
const GRID: Record<string, { x: number; bottom: number; h: number }> = {
  "hairo.png": { x: 245, bottom: 920, h: 370 }, "sunkissed_clean.png": { x: 522, bottom: 920, h: 350 }, "celuline_clean.png": { x: 800, bottom: 920, h: 350 },
  "triple_action.png": { x: 235, bottom: B, h: 375 }, "intimate_gel.png": { x: 445, bottom: B, h: 385 }, "sunrise.png": { x: 735, bottom: B, h: 262 },
};
const ORDER = ["sunrise.png", "triple_action.png", "hairo.png", "intimate_gel.png", "sunkissed_clean.png", "celuline_clean.png"];
const CAROUSEL_H: Record<string, number> = { "sunrise.png": 270, "triple_action.png": 420, "hairo.png": 460, "intimate_gel.png": 400, "sunkissed_clean.png": 420, "celuline_clean.png": 430 };
const Choose: React.FC = () => {
  const { f, fps } = useSec();
  const c = useCopy();
  const rot = ip(f, [1.3 * fps, 2.9 * fps], [-80, 30], E.out);
  const m = ip(f, [2.2 * fps, 3.0 * fps], [0, 1], E.inOut); // carousel → showcase (still from 3.0 s → 3 s hold)
  const R = 300, cy = BASE;
  const items = ORDER.map((file, i) => {
    const ang = ((i * 60 + rot) * Math.PI) / 180;
    const depth = Math.cos(ang);
    const g = GRID[file];
    const sc = 0.66 + 0.34 * ((depth + 1) / 2);
    return {
      file, i, depth: lerp(depth, 1, m),
      x: lerp(CX + Math.sin(ang) * R, g.x, m),
      bottom: lerp(1920 - cy, g.bottom, m),
      h: lerp(CAROUSEL_H[file] * sc, g.h, m),
      dim: lerp(0.45 * (1 - (depth + 1) / 2), 0, m),
      blur: lerp(Math.max(0, -depth) * 3, 0, m),
    };
  }).sort((a, b) => a.depth - b.depth || b.bottom - a.bottom);
  const shelves = ip(f, [2.6 * fps, 3.1 * fps], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage glowY={66} k={1.1} />
      <AbsoluteFill style={{ opacity: ip(f, [1.3 * fps, 1.75 * fps], [1, 0], E.inOut) }}>
        {/* same gift-box clip, unaltered, shown in a clean framed window inside the safe zone */}
        <div style={{ position: "absolute", left: SAFE.left + 20, right: 1080 - SAFE.right + 20, top: 500, bottom: 1920 - BASE + 10, borderRadius: 32, overflow: "hidden", boxShadow: "0 24px 60px rgba(23,23,23,0.22)", border: `3px solid ${GREEN}` }}>
          <OffthreadVideo src={S("BF01_BG_GIFTBOX.mp4")} startFrom={Math.round(0.9 * fps)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 62%" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: ip(f, [1.25 * fps, 1.45 * fps, 1.75 * fps], [0, 0.5, 0]), background: "radial-gradient(40% 25% at 50% 55%, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
      {/* shelves for the still showcase */}
      <div style={{ opacity: shelves }}><Shelf y={1000} /></div>
      <Floor y={BASE} />
      {items.map((it) => (
        <Sequence key={it.i} from={Math.round((1.35 + it.i * 0.05) * fps)}>
          <Product file={it.file} h={it.h} x={it.x} bottom={it.bottom} z={1} dim={it.dim} blur={it.blur} float={2} reflect={m > 0.5 || it.depth > 0.2} />
        </Sequence>
      ))}
      <GoldDust n={45} seed="choose" k={0.8} />
      {/* one message at a time: question (≈3 s) → answer (≈3 s) */}
      <Line text={c.c1} at={0.05} size={90} y={262} out={2.75} />
      <Line text={c.c2} at={0.2} size={104} y={360} gold out={2.75} />
      <Line text={c.a1} at={2.95} size={88} y={262} family={SERIF} weight={500} italic tracking="0.01em" color={IVORY} />
      <Line text={c.a2} at={3.1} size={92} y={358} gold family={SERIF} weight={500} italic tracking="0.01em" />
      <Sequence from={Math.round(3.25 * fps)}><div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: 462, textAlign: "center", opacity: ip(f - Math.round(3.25 * fps), [0, 10], [0, 1]) }}><Emo e="🎁" size={62} tone="red" /></div></Sequence>
    </AbsoluteFill>
  );
};

const VLINE = [
  { file: "hairo.png", h: 330, x: 200, bottom: B + 28 }, { file: "celuline_clean.png", h: 300, x: 305, bottom: B + 28 },
  { file: "triple_action.png", h: 262, x: 428, bottom: B + 28 }, { file: "sunkissed_clean.png", h: 300, x: 735, bottom: B + 28 },
  { file: "intimate_gel.png", h: 300, x: 842, bottom: B + 28 }, { file: "sunrise.png", h: 150, x: 590, bottom: B },
];
/* ---------------- 4) VOUCHER (conditions held ≈3 s) ---------------- */
const Voucher: React.FC = () => {
  const { f, fps } = useSec();
  const c = useCopy();
  const pre = ip(f, [0, 0.2 * fps], [0, 1]);
  const up = ip(f, [0.7 * fps, 1.05 * fps], [0, 1], E.inOut);
  const flip = spring({ frame: f - 0.8 * fps, fps, config: { damping: 15, stiffness: 75 } });
  const ry = (1 - flip) * -95;
  const cardA = ip(f, [0.8 * fps, 1.0 * fps], [0, 1]);
  return (
    <AbsoluteFill>
      <Stage glowY={45} k={0.8} />
      {/* same silk clip, toned to a light pearl-grey texture (background only, no products in it) */}
      <OffthreadVideo src={S("BF01_BG_SILK.mp4")} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, filter: "grayscale(1) brightness(2.4) contrast(0.6)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(62% 40% at 50% 45%, rgba(255,255,255,0.9), rgba(255,255,255,0.45))" }} />
      <GoldDust n={35} seed="vouch" k={0.8} />
      <div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: 720 - 458 * up, textAlign: "center", opacity: pre, transform: `scale(${1.0 - 0.1 * up})`, transformOrigin: "50% 0%" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, color: GREEN_DK, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{c.vh}</span>
      </div>
      <div style={{ position: "absolute", left: TXT.left, top: 390, width: TW, height: 590, perspective: 1600, opacity: cardA }}>
        <div style={{ position: "relative", width: "100%", height: "100%", transform: `rotateY(${ry}deg) rotateX(${(1 - flip) * 12}deg)`, transformStyle: "preserve-3d", borderRadius: 28, background: WHITE, boxShadow: "0 30px 70px rgba(23,23,23,0.18), 0 0 0 1px rgba(23,23,23,0.04)" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 28, padding: 5, background: TONES.green, WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" } as React.CSSProperties} />
          <div style={{ position: "absolute", inset: 22, borderRadius: 18, border: "1.5px solid rgba(56,124,70,0.35)" }} />
          {/* coupon notches on the sides (no stub: all copy centred inside the inner frame) */}
          <div style={{ position: "absolute", left: -22, top: "50%", marginTop: -22, width: 44, height: 44, borderRadius: "50%", background: "#F2F4F1", boxShadow: "inset -2px 0 4px rgba(23,23,23,0.08)" }} />
          <div style={{ position: "absolute", right: -22, top: "50%", marginTop: -22, width: 44, height: 44, borderRadius: "50%", background: "#F2F4F1", boxShadow: "inset 2px 0 4px rgba(23,23,23,0.08)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 60, color: CHARCOAL, letterSpacing: "0.01em", lineHeight: 1.12, whiteSpace: "nowrap" }}>{c.v1}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 60, color: CHARCOAL, letterSpacing: "0.01em", lineHeight: 1.12, whiteSpace: "nowrap" }}>{c.v2}</div>
            <div style={{ marginTop: 6 }}><Gold size={220} sweepAt={2.4} tone="red">{"\u221225%"}</Gold></div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: c.v3Size, color: GREEN, letterSpacing: "0.02em", marginTop: 18, whiteSpace: "nowrap" }}>{c.v3}</div>
          </div>
        </div>
      </div>
            {/* lower half: the six gift options on a shelf (same cut-outs as the rest of the ad) */}
      <Floor y={BASE} />
      {VLINE.map((p, i) => <Product key={i} file={p.file} h={p.h} x={p.x} bottom={p.bottom} at={1.15 + i * 0.09} float={2} />)}
      <Sequence from={Math.round(2.0 * fps)} durationInFrames={Math.round(0.8 * fps)}><ShimmerTransition frames={Math.round(0.8 * fps)} strength={0.5} flash={0.04} warmth="255,255,255" /></Sequence>
    </AbsoluteFill>
  );
};

/* ---------------- 5) DEADLINE + CTA (final composition held ≥3 s) ---------------- */
const LINEUP = [
  { file: "hairo.png", h: 380, x: 165, bottom: B + 50 }, { file: "celuline_clean.png", h: 342, x: 292, bottom: B + 50 },
  { file: "triple_action.png", h: 297, x: 428, bottom: B + 50 }, { file: "sunkissed_clean.png", h: 347, x: 770, bottom: B + 50 },
  { file: "intimate_gel.png", h: 342, x: 888, bottom: B + 50 }, { file: "sunrise.png", h: 167, x: 600, bottom: B },
];
const Final: React.FC = () => {
  const { f, fps } = useSec();
  const c = useCopy();
  // CTA layout: 2 lines (SL/IT, approved positions) or 3 lines (HR, longer words)
  const ctaY = c.cta.length === 2 ? [694, 776] : [680, 754, 828];
  const ulY = c.cta.length === 2 ? 866 : 916;
  const slam = spring({ frame: f - 0.12 * fps, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  const cut = 1.9;
  const brollOut = ip(f, [cut * fps, (cut + 0.7) * fps], [1, 0], E.inOut); // restrained dissolve, no hard cut
  return (
    <AbsoluteFill>
      <Stage glowY={74} k={1.15} />
      <AbsoluteFill style={{ opacity: brollOut }}>
        <Sequence durationInFrames={Math.round(1.0 * fps)}><OffthreadVideo src={S("br_sunkissed.mp4")} startFrom={Math.round(1.9 * fps)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: "translateY(150px) scale(1.1)" }} /></Sequence>
        <Sequence from={Math.round(1.0 * fps)}><OffthreadVideo src={S("br_celuline_hands.mp4")} startFrom={Math.round(0.6 * fps)} muted style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: "translate(-80px, 150px) scale(1.12)" }} /></Sequence>
        <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 36%, rgba(255,255,255,0.15) 62%, rgba(255,255,255,0) 100%)" }} />
      </AbsoluteFill>
      <Sequence from={Math.round((cut + 0.3) * fps)}>
        <AbsoluteFill>
          <Tape y={1290} rot={-6} gold at={0.1} />
          <Tape y={1370} rot={4} at={0.25} speed={-1.8} />
          <Floor y={BASE - 50} />
          {LINEUP.map((p, i) => <Product key={i} file={p.file} h={p.h} x={p.x} bottom={p.bottom} at={0.1 + i * 0.08} float={2} />)}
          <GoldDust n={45} seed="fin" k={0.8} />
          {c.cta.map((l, i) => <Line key={i} text={l.t} at={0.35 + 0.15 * i} size={c.ctaSize} y={ctaY[i]} gold={l.gold} />)}
          <CTAUnderline at={0.8} y={ulY} />
        </AbsoluteFill>
      </Sequence>
      {/* deadline: prominent and on screen for the whole scene */}
      <Line text={c.le} at={0.0} size={76} y={262} tracking="0.2em" weight={500} color={IVORY} />
      <div style={{ position: "absolute", left: TXT.left, right: 1080 - TXT.right, top: 350, textAlign: "center", whiteSpace: "nowrap", transform: `scale(${1.45 - 0.45 * slam})`, opacity: ip(f, [0.12 * fps, 0.12 * fps + 5], [0, 1]) }}>
        <Gold size={212} sweepAt={0.8} tone="red">30.11.!</Gold><Emo e="⏰" size={118} tone="red" style={{ marginLeft: 16, verticalAlign: "18%" }} />
      </div>
      <Line text={c.rem} at={cut + 0.5} size={54} y={590} tracking="0.1em" weight={700} color={RED} />
    </AbsoluteFill>
  );
};
const CTAUnderline: React.FC<{ at: number; y: number }> = ({ at, y }) => {
  const { f, fps } = useSec();
  const p = ip(f, [at * fps, at * fps + 24], [0, 1], E.inOut);
  return <div style={{ position: "absolute", left: CX - 280 * p, width: 560 * p, top: y, height: 6, borderRadius: 3, background: GREEN }} />;
};

/* ---------------- QC overlay (never in the final render) ---------------- */
const SafeOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.top, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: SAFE.bottom, bottom: 0, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: 0, width: SAFE.left, top: 0, bottom: 0, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: SAFE.right, right: 0, top: 0, bottom: 0, background: "rgba(255,0,0,0.25)" }} />
    <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: SAFE.right - SAFE.left, height: SAFE.bottom - SAFE.top, border: "3px solid #0044FF" }} />
    <div style={{ position: "absolute", left: TXT.left, top: TXT.top, width: TXT.right - TXT.left, height: TXT.bottom - TXT.top, border: "2px dashed #00AA44" }} />
  </AbsoluteFill>
);

/* ---------------- master ---------------- */
const XF = 12;
const Scene: React.FC<{ children: React.ReactNode; first?: boolean }> = ({ children, first }) => {
  const f = useCurrentFrame();
  const a = first ? 1 : ip(f, [0, XF], [0, 1], E.inOut);
  const z = first ? 1 : ip(f, [0, XF + 8], [1.035, 1]);
  return <AbsoluteFill style={{ opacity: a, transform: `scale(${z})` }}>{children}</AbsoluteFill>;
};

export const BF01: React.FC<{ qc?: boolean; lang?: Lang }> = ({ qc = false, lang = "sl" }) => {
  const { fps } = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const cuts: [readonly [number, number], React.FC][] = [[T.hook, Hook], [T.tiers, Tiers], [T.choose, Choose], [T.voucher, Voucher], [T.final, Final]];
  return (
    <CopyCtx.Provider value={COPY[lang]}>
    <AbsoluteFill style={{ background: INK }}>
      {cuts.map(([[a, b], C], i) => (
        <Sequence key={i} from={F(a)} durationInFrames={F(b - a) + (i < cuts.length - 1 ? XF : 0)}>
          <Scene first={i === 0}><C /></Scene>
        </Sequence>
      ))}
      {/* approved shimmer sweep: max 2 per ad, on the key cuts */}
      <Sequence from={F(T.choose[0]) - F(0.4)} durationInFrames={F(0.8)}><ShimmerTransition frames={F(0.8)} flash={0.04} warmth="255,255,255" /></Sequence>
      <Sequence from={F(T.final[0] + 1.9) - F(0.1)} durationInFrames={F(0.8)}><ShimmerTransition frames={F(0.8)} flash={0.03} strength={0.6} warmth="255,255,255" /></Sequence>
      {qc ? <SafeOverlay /> : null}
    </AbsoluteFill>
    </CopyCtx.Provider>
  );
};
