import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate, Easing } from "remotion";
import { AdShots, Shot } from "./AdShots";

// AD_03 "Golden Ritual" identity: espresso + cream + soft gold, Fraunces (display serif) + Manrope (sans).
const ESP = "#2B1E16", CREAM = "#F6EFE4", GOLD = "#C89B5E", GOLD_L = "#E8C99A";
const SERIF = "AD03 Fraunces", SANS = "AD03 Manrope";
const faces: [string, string, string, string][] = [
  [SERIF, "fraunces-latin-300-normal.woff2", "300", "normal"], [SERIF, "fraunces-latin-400-normal.woff2", "400", "normal"],
  [SERIF, "fraunces-latin-300-italic.woff2", "300", "italic"], [SERIF, "fraunces-latin-400-italic.woff2", "400", "italic"],
  [SANS, "manrope-latin-400-normal.woff2", "400", "normal"], [SANS, "manrope-latin-500-normal.woff2", "500", "normal"], [SANS, "manrope-latin-600-normal.woff2", "600", "normal"],
];
const fontsReady = Promise.all(faces.map(([fam, f, w, s]) => new FontFace(fam, `url(${staticFile("ad03/fonts/" + f)})`, { weight: w, style: s }).load().then((x) => (document.fonts as any).add(x))));

const eo = Easing.bezier(0.16, 1, 0.3, 1), eio = Easing.bezier(0.65, 0, 0.35, 1), ei = Easing.bezier(0.5, 0, 0.75, 0);
const ip = (f: number, i: number[], o: number[], e = eo) => interpolate(f, i, o, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const GRADE = "contrast(1.03) saturate(1.04) sepia(0.04)";
const shadow = "0 2px 18px rgba(30,18,10,0.45)";

export type Wd = [string, number, number];
export type Ad03Props = { words: Wd[]; shots: Shot[]; frames: number; captionStyle: "A" | "B" | "C" | "none"; captionsOn?: boolean };

// ---------- before/after scene building blocks (aligned pairs, uniform scale only) ----------
const Pic: React.FC<{ src: string; z?: number; style?: React.CSSProperties }> = ({ src, z = 1, style }) => (
  <Img src={staticFile("ad03/ba/" + src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})`, ...style }} />
);
const Tag: React.FC<{ text: string; x: number; y: number; a: number; align?: "l" | "r" }> = ({ text, x, y, a, align = "l" }) => (
  <div style={{ position: "absolute", top: y, ...(align === "l" ? { left: x } : { right: x }), opacity: a, transform: `translateY(${(1 - a) * 12}px)`, padding: "8px 18px 9px", borderRadius: 999, background: "rgba(43,30,22,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(232,201,154,0.55)", fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: "0.18em", color: CREAM }}>{text}</div>
);
const AreaLabel: React.FC<{ word: string; f: number; len: number }> = ({ word, f, len }) => {
  const a = ip(f, [4, 22], [0, 1]) * ip(f, [len - 10, len], [1, 0], ei);
  return (
    <div style={{ position: "absolute", top: 300, left: 70, opacity: a }}>
      <div style={{ height: 1.5, width: 90 * ip(f, [6, 30], [0, 1], eio), background: GOLD_L, marginBottom: 12 }} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 300, fontSize: 64, color: CREAM, textShadow: shadow, letterSpacing: "-0.01em", transform: `translateY(${(1 - a) * 18}px)` }}>{word}</div>
    </div>
  );
};

type Pair = { b: string; a: string };
// 1) slider: vertical divider sweeps right->left revealing AFTER, pauses at centre
const Slider: React.FC<{ len: number; p: Pair; word: string }> = ({ len, p, word }) => {
  const f = useCurrentFrame(); const W = 1080;
  const x = ip(f, [30, 90], [W, W / 2], eio) - ip(f, [len - 70, len - 20], [0, W / 2 - 60], eio);
  const z = interpolate(f, [0, len], [1.0, 1.05]);
  return (
    <AbsoluteFill style={{ background: ESP }}>
      <Pic src={p.b} z={z} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${x}px)` }}><Pic src={p.a} z={z} /></div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: x - 1, width: 2, background: GOLD_L, boxShadow: "0 0 18px rgba(232,201,154,0.9)" }} />
      <div style={{ position: "absolute", top: 940, left: x - 22, width: 44, height: 44, borderRadius: 22, background: CREAM, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", opacity: x < W - 4 ? 1 : 0 }} />
      <Tag text="PRIMA" x={50} y={440} a={ip(f, [8, 24], [0, 1])} />
      <Tag text="DOPO LA ROUTINE" x={50} y={440} a={ip(f, [70, 90], [0, 1])} align="r" />
      <AreaLabel word={word} f={f} len={len} />
    </AbsoluteFill>
  );
};
// 2) wipe top->bottom with a soft golden light edge
const WipeV: React.FC<{ len: number; p: Pair; word: string }> = ({ len, p, word }) => {
  const f = useCurrentFrame(); const H = 1920;
  const y = ip(f, [24, 66], [0, H], eio); const z = interpolate(f, [0, len], [1.04, 1.0]);
  return (
    <AbsoluteFill style={{ background: ESP }}>
      <Pic src={p.b} z={z} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${H - y}px 0)` }}><Pic src={p.a} z={z} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 60, height: 120, background: "linear-gradient(180deg, rgba(255,236,200,0) 0%, rgba(255,236,200,0.55) 50%, rgba(255,236,200,0) 100%)", opacity: y > 0 && y < H ? 1 : 0, mixBlendMode: "screen" }} />
      <Tag text={y < H / 2 ? "PRIMA" : "DOPO LA ROUTINE"} x={50} y={440} a={ip(f, [6, 20], [0, 1])} />
      <AreaLabel word={word} f={f} len={len} />
    </AbsoluteFill>
  );
};
// 3) stacked halves: same crop, before on top, after below (slides in)
const Stack: React.FC<{ len: number; p: Pair; word: string; oy?: number }> = ({ len, p, word, oy = 0 }) => {
  const f = useCurrentFrame(); const half = 955;
  const s2 = ip(f, [2, 26], [1, 0], eio);
  const crop = (src: string) => <Img src={staticFile("ad03/ba/" + src)} style={{ position: "absolute", width: 1080, height: 1935, top: -480 + oy, left: 0, objectFit: "cover", filter: GRADE }} />;
  return (
    <AbsoluteFill style={{ background: ESP }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 1080, height: half, overflow: "hidden" }}>{crop(p.b)}</div>
      <div style={{ position: "absolute", top: half + 10, left: 0, width: 1080, height: half, overflow: "hidden", transform: `translateX(${s2 * 1080}px)` }}>{crop(p.a)}</div>
      <div style={{ position: "absolute", top: half, left: 0, right: 0, height: 10, background: ESP }} />
      <Tag text="PRIMA" x={50} y={half - 70} a={ip(f, [6, 20], [0, 1])} />
      <Tag text="DOPO LA ROUTINE" x={50} y={half + 34} a={ip(f, [40, 56], [0, 1])} />
      <AreaLabel word={word} f={f} len={len} />
    </AbsoluteFill>
  );
};
// 4) soft dissolve with a light bloom (for the eye area, where hard lines would distract)
const Bloom: React.FC<{ len: number; p: Pair; word: string }> = ({ len, p, word }) => {
  const f = useCurrentFrame(); const t = ip(f, [26, 56], [0, 1], eio); const z = interpolate(f, [0, len], [1.0, 1.06]);
  const glow = Math.sin(Math.PI * t) * 0.35;
  return (
    <AbsoluteFill style={{ background: ESP }}>
      <Pic src={p.b} z={z} /><Pic src={p.a} z={z} style={{ opacity: t }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 60% 45%, rgba(255,232,190,0.9), rgba(255,232,190,0) 60%)", opacity: glow, mixBlendMode: "screen" }} />
      <Tag text={t < 0.5 ? "PRIMA" : "DOPO LA ROUTINE"} x={50} y={440} a={ip(f, [6, 20], [0, 1])} />
      <AreaLabel word={word} f={f} len={len} />
    </AbsoluteFill>
  );
};
// 5) single BEFORE still (problem section)
const Before: React.FC<{ len: number; src: string; word?: string; tag?: boolean }> = ({ len, src, word, tag = true }) => {
  const f = useCurrentFrame(); const z = interpolate(f, [0, len], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{ background: ESP }}>
      <Pic src={src} z={z} style={{ filter: GRADE + " saturate(0.92)" }} />
      {tag ? <Tag text="PRIMA" x={50} y={440} a={ip(f, [6, 20], [0, 1])} /> : null}
      {word ? <AreaLabel word={word} f={f} len={len} /> : null}
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<{ len: number }>> = {
  b_full: ({ len }) => <Before len={len} src="BA01_full_BEFORE.jpg" word="il prima" />,
  b_forehead: ({ len }) => <Before len={len} src="BA02_forehead_BEFORE.jpg" word="fronte" />,
  b_eye: ({ len }) => <Before len={len} src="BA03_eye_BEFORE.jpg" word="contorno occhi" />,
  b_cheek: ({ len }) => <Before len={len} src="BA04_cheek_BEFORE.jpg" word="guance" />,
  b_neck: ({ len }) => <Before len={len} src="BA06_neck_BEFORE.jpg" word="collo" />,
  b_mouth: ({ len }) => <Before len={len} src="BA05_mouth_BEFORE.jpg" word="zona bocca" />,
  p_full: ({ len }) => <Slider len={len} p={{ b: "BA01_full_BEFORE.jpg", a: "BA01_full_AFTER.jpg" }} word="viso" />,
  p_forehead: ({ len }) => <WipeV len={len} p={{ b: "BA02_forehead_BEFORE.jpg", a: "BA02_forehead_AFTER.jpg" }} word="fronte" />,
  p_eye: ({ len }) => <Bloom len={len} p={{ b: "BA03_eye_BEFORE.jpg", a: "BA03_eye_AFTER.jpg" }} word="contorno occhi" />,
  p_cheek: ({ len }) => <Stack len={len} p={{ b: "BA04_cheek_BEFORE.jpg", a: "BA04_cheek_AFTER.jpg" }} word="guance" oy={40} />,
  p_mouth: ({ len }) => <Slider len={len} p={{ b: "BA05_mouth_BEFORE.jpg", a: "BA05_mouth_AFTER.jpg" }} word="zona bocca" />,
  p_neck: ({ len }) => <WipeV len={len} p={{ b: "BA06_neck_BEFORE.jpg", a: "BA06_neck_AFTER.jpg" }} word="collo" />,
};

// ---------- overlays ----------
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const a = ip(f, [6, 30], [0, 1]); const out = ip(f, [190, 212], [1, 0], ei);
  const w1 = "prima", w2 = "& dopo";
  return (
    <div style={{ position: "absolute", top: 290, left: 70, right: 70, opacity: out }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: `${ip(f, [0, 60], [0.6, 0.32])}em`, color: CREAM, opacity: a, textShadow: shadow }}>LA ROUTINE MICROINFUSION</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 6 }}>
        {[w1, w2].map((w, i) => {
          const s = 14 + i * 26;
          return <div key={w} style={{ fontFamily: SERIF, fontStyle: i ? "italic" : "normal", fontWeight: 300, fontSize: 118, lineHeight: 1.05, letterSpacing: "-0.02em", color: i ? GOLD_L : CREAM, textShadow: shadow, opacity: ip(f, [s, s + 20], [0, 1]), filter: `blur(${ip(f, [s, s + 24], [10, 0])}px)`, transform: `translateY(${ip(f, [s, s + 30], [26, 0])}px)` }}>{w}</div>;
        })}
      </div>
    </div>
  );
};

// golden light sweep transition (diagonal band), placed over cuts
const Sweep: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame(); const x = ip(f, [0, len], [-900, 1900], eio);
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(115deg, rgba(255,226,180,0) ${x - 500}px, rgba(255,226,180,0.55) ${x}px, rgba(255,226,180,0) ${x + 500}px)` }} />;
};

// twinkling gold dust around product close-ups
const Dust: React.FC<{ len: number; n?: number; seed?: number }> = ({ len, n = 34, seed = 5 }) => {
  const f = useCurrentFrame();
  const r = (i: number, k: number) => { const v = Math.sin((i + 1) * 91.17 * (k + 1) + seed * 13.7) * 43758.5453; return v - Math.floor(v); };
  const fade = ip(f, [0, 16], [0, 1]) * ip(f, [len - 14, len], [1, 0], ei);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade, mixBlendMode: "screen" }}>
      {Array.from({ length: n }).map((_, i) => {
        const x = 120 + r(i, 1) * 840 + Math.sin(f / 40 + i) * 18; const y = 380 + r(i, 2) * 900 - f * (0.4 + r(i, 3) * 0.8);
        const tw = 0.35 + 0.65 * Math.max(0, Math.sin(f / (6 + r(i, 4) * 10) + i * 2)); const s = 3 + r(i, 5) * 6;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: "#FFE9C4", boxShadow: `0 0 ${8 + s * 2}px rgba(255,214,150,${0.8 * tw})`, opacity: tw }} />;
      })}
    </AbsoluteFill>
  );
};

// ingredient callout: thin gold line + serif italic name
const Ingredient: React.FC<{ len: number; name: string; note: string; x: number; y: number }> = ({ len, name, note, x, y }) => {
  const f = useCurrentFrame(); const a = ip(f, [0, 20], [0, 1]) * ip(f, [len - 10, len], [1, 0], ei);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: GOLD_L, boxShadow: "0 0 14px rgba(232,201,154,0.9)" }} />
        <div style={{ height: 1.5, width: 70 * ip(f, [4, 26], [0, 1], eio), background: GOLD_L }} />
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 58, color: CREAM, textShadow: shadow, marginTop: 8, transform: `translateX(${(1 - a) * -20}px)` }}>{name}</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.14em", color: CREAM, opacity: 0.85, textShadow: shadow }}>{note}</div>
    </div>
  );
};

const Gesture: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const steps = ["appoggia", "solleva", "sposta"]; const act = Math.min(2, Math.floor(((f / fps) % 2.1) / 0.7));
  const a = ip(f, [0, 16], [0, 1]) * ip(f, [len - 10, len], [1, 0], ei);
  return (
    <div style={{ position: "absolute", top: 300, left: 70, right: 70, opacity: a }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: "0.12em", color: i === act ? ESP : CREAM, background: i === act ? GOLD_L : "rgba(43,30,22,0.45)", borderRadius: 999, padding: "8px 18px", border: "1px solid rgba(232,201,154,0.5)" }}>{s.toUpperCase()}</div>
            {i < 2 ? <div style={{ width: 22, height: 1.5, background: GOLD_L }} /> : null}
          </React.Fragment>))}
      </div>
      <div style={{ marginTop: 16, fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: CREAM, textShadow: shadow, opacity: ip(f, [60, 80], [0, 1]) }}>senza trascinare</div>
    </div>
  );
};

// ---------- captions: three styles to choose from ----------
const KEY = ["microinfusion", "prima", "dopo", "acido", "ialuronico", "peptidi", "microaghi", "delicatamente", "trascinare", "routine", "rituale", "luminosa", "idratata", "collo", "guance"];
const norm = (s: string) => s.toLowerCase().replace(/[.,!?:;'"]/g, "");
const pagesOf = (words: Wd[], max: number) => {
  const out: Wd[][] = []; let cur: Wd[] = [];
  for (const w of words) { if (cur.length && w[1] - cur[cur.length - 1][2] > 0.35) { out.push(cur); cur = []; } cur.push(w); if (cur.length >= max || /[.,!?:;]$/.test(w[0])) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
};
const Captions: React.FC<{ words: Wd[]; style: "A" | "B" | "C" }> = ({ words, style }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const ps = pagesOf(words, style === "C" ? 5 : 4);
  let pi = -1; for (let k = 0; k < ps.length; k++) if (t >= ps[k][0][1] - 0.05) pi = k;
  if (pi < 0) return null;
  const page = ps[pi]; const next = ps[pi + 1];
  const endT = Math.min(next ? next[0][1] - 0.05 : 1e9, page[page.length - 1][2] + 0.45); if (t > endT) return null;
  const st = (page[0][1] - 0.05) * fps; const a = ip(frame, [st, st + 9], [0, 1]); const out = ip(frame, [endT * fps - 5, endT * fps], [1, 0], ei);
  const word = (w: string, s: number, i: number) => {
    const lf = frame - (s - 0.05) * fps; const on = ip(lf, [0, 7], [0, 1]); const key = KEY.some((k) => norm(w).startsWith(k));
    if (style === "A") return <span key={i} style={{ fontFamily: SERIF, fontStyle: key ? "italic" : "normal", fontWeight: key ? 400 : 300, fontSize: 60, color: key ? GOLD_L : CREAM, opacity: 0.25 + 0.75 * on, textShadow: "0 2px 16px rgba(30,18,10,0.65)" }}>{w}</span>;
    if (style === "B") return <span key={i} style={{ position: "relative", fontFamily: SANS, fontWeight: key ? 600 : 500, fontSize: 48, color: ESP, opacity: 0.3 + 0.7 * on }}>{w}{key ? <span style={{ position: "absolute", left: 0, bottom: 2, height: 4, borderRadius: 2, width: `${100 * ip(lf, [3, 15], [0, 1])}%`, background: GOLD }} /> : null}</span>;
    return <span key={i} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, letterSpacing: "0.01em", color: on > 0.5 && lf < 30 ? GOLD_L : CREAM, textShadow: "0 2px 12px rgba(0,0,0,0.6)", opacity: 0.35 + 0.65 * on }}>{w}</span>;
  };
  const box: React.CSSProperties = style === "B"
    ? { background: "rgba(246,239,228,0.86)", borderRadius: 26, padding: "14px 28px 18px", boxShadow: "0 8px 30px rgba(30,18,10,0.2)" }
    : style === "C" ? { borderTop: `2px solid ${GOLD_L}`, paddingTop: 14 } : {};
  return (
    <div style={{ position: "absolute", top: style === "C" ? 1160 : 1130, left: 70, right: 70, display: "flex", justifyContent: style === "C" ? "flex-start" : "center", opacity: out }}>
      <div style={{ ...box, display: "flex", flexWrap: "wrap", justifyContent: style === "C" ? "flex-start" : "center", gap: "0px 14px", lineHeight: 1.2, transform: `translateY(${(1 - a) * 14}px)`, opacity: a }}>
        {page.map(([w, s], i) => word(w, s, i))}
      </div>
    </div>
  );
};

export const Ad03: React.FC<Ad03Props> = ({ words, shots, captionStyle }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const { fps } = useVideoConfig();
  const S = (a: number, b: number, el: React.ReactNode) => <Sequence from={Math.round(a * fps)} durationInFrames={Math.round((b - a) * fps)} layout="none">{el}</Sequence>;
  const L = (a: number, b: number) => Math.round((b - a) * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: ESP }}>
      <AdShots shots={shots} dir="ad03" grade={GRADE} scenes={SCENES} />
      {S(0, 3.56, <Hook />)}
      {S(14.9, 17.8, <Dust len={L(14.9, 17.8)} />)}
      {S(17.8, 19.2, <Dust len={L(17.8, 19.2)} n={18} seed={9} />)}
      {S(15.3, 17.8, <Ingredient len={L(15.3, 17.8)} name="acido ialuronico" note="NEL SIERO" x={70} y={760} />)}
      {S(16.3, 17.8, <Ingredient len={L(16.3, 17.8)} name="peptidi" note="NEL SIERO" x={70} y={940} />)}
      {S(22.2, 26.5, <Gesture len={L(22.2, 26.5)} />)}
      {S(19.0, 19.45, <Sweep len={L(19.0, 19.45)} />)}
      {S(29.1, 29.6, <Sweep len={L(29.1, 29.6)} />)}
      {S(40.2, 40.65, <Sweep len={L(40.2, 40.65)} />)}
      {captionStyle !== "none" ? <Captions words={words} style={captionStyle} /> : null}
    </AbsoluteFill>
  );
};
