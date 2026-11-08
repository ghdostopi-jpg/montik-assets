import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate, Easing } from "remotion";
import { AdShots, Shot } from "./AdShots";

// AD_06 "Lamplight" identity: warm ink + lamp amber + ivory; Instrument Sans (captions) + Instrument Serif italic (labels).
// New for AD_06: picture-in-picture full-face reveal, stacked cards with an iris reveal, hook line set as a title.
const INK = "#1C1714", AMBER = "#F2B45A", IVORY = "#FFF4E4";
const SANS = "AD06 Instrument Sans", SERIF = "AD06 Instrument Serif";
const faces: [string, string, string, string][] = [
  [SANS, "instrument-sans-latin-500-normal.woff2", "500", "normal"], [SANS, "instrument-sans-latin-600-normal.woff2", "600", "normal"],
  [SANS, "instrument-sans-latin-700-normal.woff2", "700", "normal"],
  [SERIF, "instrument-serif-latin-400-normal.woff2", "400", "normal"], [SERIF, "instrument-serif-latin-400-italic.woff2", "400", "italic"],
];
const fontsReady = Promise.all(faces.map(([fam, f, w, s]) => new FontFace(fam, `url(${staticFile("ad06/fonts/" + f)})`, { weight: w, style: s }).load().then((x) => (document.fonts as any).add(x))));

const eo = Easing.bezier(0.16, 1, 0.3, 1), eio = Easing.bezier(0.65, 0, 0.35, 1);
const ip = (f: number, i: number[], o: number[], e = eo) => interpolate(f, i, o, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const GRADE = "contrast(1.02) saturate(1.03)";
export type Wd = [string, number, number];
type Cap = { from: number; to: number; words: Wd[] };
export type Ad06Props = { shots: Shot[]; captions: Cap[]; frames: number; captionsOn?: boolean; captionStyle?: "A" | "B" | "C" };

const Pic: React.FC<{ src: string; z?: number; style?: React.CSSProperties }> = ({ src, z = 1, style }) => (
  <Img src={staticFile("ad06/ba/" + src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${z})`, ...style }} />
);
// label: serif italic word with a small lamp dot
const Label: React.FC<{ text: string; a: number; style: React.CSSProperties }> = ({ text, a, style }) => (
  <div style={{ position: "absolute", display: "flex", alignItems: "center", gap: 14, padding: "6px 22px 10px 16px", borderRadius: 16, background: "rgba(28,23,20,0.62)", opacity: a, transform: `translateY(${(1 - a) * 10}px)`, ...style }}>
    <div style={{ width: 12, height: 12, borderRadius: 6, background: AMBER, boxShadow: `0 0 12px ${AMBER}` }} />
    <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, lineHeight: 1, color: IVORY }}>{text}</div>
  </div>
);
const Note: React.FC<{ a: number; top?: number }> = ({ a, top = 1196 }) => (
  <div style={{ position: "absolute", left: 40, top, opacity: 0.7 * a, fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: "0.04em", color: IVORY, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>immagini illustrative</div>
);

// ---------- concern: full-bleed BEFORE macros ----------
const Macro: (src: string) => React.FC<{ len: number }> = (src) => ({ len }) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ background: INK }}>
    <Pic src={src} z={interpolate(f, [0, len], [1.0, 1.05])} />
    <Label text="prima" a={ip(f, [6, 22], [0, 1])} style={{ left: 48, top: 300 }} />
  </AbsoluteFill>);
};
// ---------- reveal 1: full face, BEFORE folds into a picture-in-picture card ----------
const PFull: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const k = ip(f, [54, 96], [0, 1], eio);              // 0 = BEFORE full frame, 1 = card
  const s = 1 - k * (1 - 0.34);                         // uniform scale only
  const cx = 1080 - 40 - (1080 * 0.34) / 2, cy = 300 + (1920 * 0.34) / 2;
  const tx = k * (cx - 540), ty = k * (cy - 960);
  const z = interpolate(f, [0, len], [1.0, 1.035]);
  return (<AbsoluteFill style={{ background: INK }}>
    <Pic src="F_full_AFTER.jpg" z={z} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "50% 50%",
      borderRadius: (k * 24) / s, overflow: "hidden", boxShadow: k > 0 ? `0 ${30 * k / s}px ${80 * k / s}px rgba(0,0,0,${0.45 * k})` : "none", outline: `${(k * 6) / s}px solid rgba(255,244,228,${0.95 * k})` }}>
      <Pic src="F_full_BEFORE.jpg" />
    </div>
    <Label text="prima" a={ip(f, [6, 20], [0, 1]) * (1 - ip(f, [50, 60], [0, 1]))} style={{ left: 48, top: 300 }} />
    <Label text="prima" a={ip(f, [96, 110], [0, 1])} style={{ left: cx - 100, top: 300 + 1920 * 0.34 + 18 }} />
    <Label text="dopo" a={ip(f, [100, 116], [0, 1])} style={{ left: 48, top: 300 }} />
    <Note a={ip(f, [100, 120], [0, 1])} />
  </AbsoluteFill>);
};
// ---------- reveal 2-6: stacked cards, AFTER opens with an iris from its centre ----------
const CW = 1008, CH = 821, TOP = 40, GAP = 198;
const Cards: (area: string, word?: string) => React.FC<{ len: number }> = (area, word) => ({ len }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, len], [1.0, 1.035]);
  const r = ip(f, [12, 44], [0, 700], eio);
  const card = (top: number, src: string, clip?: string, a = 1) => (
    <div style={{ position: "absolute", left: 36, top, width: CW, height: CH, borderRadius: 28, overflow: "hidden", opacity: a, clipPath: clip, boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
      <Pic src={src} z={z} />
    </div>);
  const y2 = TOP + CH + GAP;
  return (<AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 50%, #2A221D 0%, ${INK} 70%)` }}>
    {card(TOP, `P_${area}_BEFORE.jpg`)}
    {card(y2, `P_${area}_AFTER.jpg`, `circle(${r}px at 50% 50%)`)}
    <div style={{ position: "absolute", left: 36, top: y2, width: CW, height: CH, borderRadius: 28, pointerEvents: "none", boxShadow: `inset 0 0 0 ${r > 0 && r < 690 ? 3 : 0}px ${AMBER}`, clipPath: `circle(${r + 2}px at 50% 50%)`, opacity: 0.0 }} />
    <Label text="prima" a={ip(f, [4, 18], [0, 1])} style={{ left: 60, top: TOP + CH - 92 }} />
    <Label text="dopo" a={ip(f, [30, 46], [0, 1])} style={{ left: 60, top: y2 + 24 }} />
    <div style={{ position: "absolute", left: 36, width: CW, top: TOP + CH + GAP / 2 - 1, height: 2, background: `linear-gradient(90deg, rgba(242,180,90,0) 0%, ${AMBER} 50%, rgba(242,180,90,0) 100%)`, opacity: 0.55 * ip(f, [0, 20], [0, 1]), transform: `scaleX(${ip(f, [0, 30], [0.2, 1])})` }} />
    {word ? <div style={{ position: "absolute", left: 0, right: 0, top: TOP + CH + 52, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: IVORY, opacity: ip(f, [10, 26], [0, 1]) }}>{word}</div> : null}
    <Note a={ip(f, [10, 30], [0, 1])} top={TOP + CH + GAP - 34} />
  </AbsoluteFill>);
};
const SCENES: Record<string, React.FC<{ len: number }>> = {
  macro_forehead: Macro("V_forehead_BEFORE.jpg"), macro_eyes: Macro("V_eyes_BEFORE.jpg"), macro_cheek: Macro("V_cheek_BEFORE.jpg"),
  before_full: Macro("F_full_BEFORE.jpg"), p_full: PFull,
  p_forehead: Cards("forehead"), p_eyes: Cards("eyes"), p_cheek: Cards("cheek"), p_mouth: Cards("mouth"), p_neck: Cards("neck", "e il collo"),
};

// ---------- captions ----------
const split = (ws: Wd[]): Wd[][] => {
  const t = ws.map((w) => w[0]).join(" ");
  if (t.length <= 24 || ws.length < 2) return [ws];
  let best = 1, bd = 1e9;
  for (let i = 1; i < ws.length; i++) {
    const a = ws.slice(0, i).map((w) => w[0]).join(" ").length, b = ws.slice(i).map((w) => w[0]).join(" ").length;
    const d = Math.abs(a - b) + (a > 26 || b > 26 ? 100 : 0); if (d < bd) { bd = d; best = i; }
  }
  return [ws.slice(0, best), ws.slice(best)];
};
const isHook = (c: Cap) => c.words.length && c.words[0][0].startsWith("«");
const Captions: React.FC<{ caps: Cap[]; shots: Shot[]; st: "A" | "B" | "C" }> = ({ caps, shots, st }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const c = caps.find((x) => t >= x.from - 0.04 && t < x.to);
  if (!c) return null;
  const sh = shots.find((s) => t >= s.from && t < s.to);
  const stacked = sh && sh.kind === "scene" && sh.id.startsWith("p_") && sh.id !== "p_full";
  const lf = (t - (c.from - 0.04)) * fps; const a = ip(lf, [0, 7], [0, 1]);
  if (isHook(c)) {
    return (<div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ padding: "10px 44px 22px", borderRadius: 28, background: "rgba(28,23,20,0.70)", fontFamily: SERIF, fontStyle: "italic", fontSize: 128, lineHeight: 1.05, color: IVORY, transform: `scale(${ip(lf, [0, 12], [0.94, 1])})` }}>
        {c.words.map((w) => w[0]).join(" ")}
      </div></div>);
  }
  const lines = split(c.words);
  // product / hands sit in the lower band on B-roll and application shots: captions move to the top band there
  const high = sh && sh.kind === "video" && !/V1|V3/.test(sh.src);
  const top = stacked ? TOP + CH + GAP / 2 - (lines.length === 2 ? 74 : 40) : high ? 300 : 1160 - (lines.length === 2 ? 74 : 40);
  const on = (w: Wd) => t >= w[1] - 0.02 && t < w[2] + 0.12;
  const box: React.CSSProperties = st === "A" ? { padding: "12px 30px 16px", borderRadius: 22, background: "rgba(24,19,16,0.84)" }
    : st === "C" ? { padding: "10px 26px 14px", borderRadius: 14, background: "rgba(242,180,90,0.94)" } : { padding: "0 10px" };
  const txt: React.CSSProperties = st === "A" ? { fontFamily: SANS, fontWeight: 600, fontSize: 64, color: IVORY }
    : st === "C" ? { fontFamily: SANS, fontWeight: 700, fontSize: 58, color: INK, textTransform: "uppercase", letterSpacing: "0.01em" }
    : { fontFamily: SERIF, fontStyle: "italic", fontSize: 80, color: IVORY, WebkitTextStroke: "7px rgba(20,15,12,0.92)", paintOrder: "stroke fill", textShadow: "0 3px 14px rgba(0,0,0,0.55)" } as any;
  const hi = st === "A" ? AMBER : st === "C" ? "#5A2E12" : AMBER;
  return (<div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 8}px)` }}>
    <div style={{ ...box, textAlign: "center", maxWidth: 1000 }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ ...txt, lineHeight: 1.12, whiteSpace: "nowrap" }}>
          {ln.map((w, j) => <span key={j} style={{ color: on(w) ? hi : (txt.color as string) }}>{w[0]}{j < ln.length - 1 ? " " : ""}</span>)}
        </div>))}
    </div></div>);
};

export const Ad06: React.FC<Ad06Props> = ({ shots, captions, captionsOn = true, captionStyle = "A" }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AdShots shots={shots} dir="ad06" grade={GRADE} scenes={SCENES} />
      {captionsOn ? <Captions caps={captions} shots={shots} st={captionStyle} /> : null}
    </AbsoluteFill>
  );
};
