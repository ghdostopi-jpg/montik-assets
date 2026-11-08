import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender } from "remotion";
import { E, ip } from "../lib/anim";
import { fontsReady } from "../lib/brand";
import { serifReady, SERIF } from "../captions/beauty";

export type Wd = [string, number, number];
export type Callout = { kind: "title"; from: number; to: number; title: string; kicker?: string; y?: number }
  | { kind: "label"; from: number; to: number; lines: string[]; kicker?: string; x?: number; y?: number; align?: "left" | "right" }
  | { kind: "steps"; from: number; to: number; n: string; text: string; y?: number }
  | { kind: "week"; from: number; to: number; y?: number; lit: number[]; label: string };
export type AdProps = { video: string; words: Wd[]; keywords: string[]; yMap: any[]; hide: [number, number][]; callouts: Callout[] };

const IVORY = "#F7F1E6";
const GOLD = "linear-gradient(100deg, #F6E7C8 0%, #DDBE84 38%, #B98F4E 64%, #F2DFB8 100%)";
const SHADOW = "0 2px 18px rgba(20,14,8,0.7), 0 0 3px rgba(20,14,8,0.55)";
const SANS = "Plex Sans";
const gradText: React.CSSProperties = { color: "transparent", backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text" };
const norm = (s: string) => s.toLowerCase().replace(/[.,!?:;…"]/g, "").replace(/\.\.\./g, "");

const pagesOf = (words: Wd[], max = 4) => {
  const out: Wd[][] = []; let cur: Wd[] = [];
  for (const w of words) {
    if (cur.length && w[1] - cur[cur.length - 1][2] > 0.45) { out.push(cur); cur = []; }
    cur.push(w);
    if (cur.length >= max || /[.,!?:;…]$/.test(w[0])) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

const CHAMP = "#E8CC94";
const Captions: React.FC<{ words: Wd[]; keywords: string[]; yMap: any[]; hide: [number, number][] }> = ({ words, keywords, yMap, hide }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const ps = pagesOf(words, 4);
  let pi = -1;
  for (let k = 0; k < ps.length; k++) if (t >= ps[k][0][1] - 0.04) pi = k;
  if (pi < 0) return null;
  const page = ps[pi]; const next = ps[pi + 1];
  const endT = Math.min(next ? next[0][1] - 0.04 : 1e9, page[page.length - 1][2] + 0.5);
  if (t > endT) return null;
  const m = yMap.find(([a, b]) => t >= a && t < b) ?? [0, 0, 1480, "C"];
  const y = m[2]; const al = m[3] ?? "C";
  const pageStart = (page[0][1] - 0.04) * fps;
  const inP = ip(frame, [pageStart, pageStart + 8], [0, 1], E.outQuart);
  const out = ip(frame, [endT * fps - 5, endT * fps], [1, 0], E.inQuart);
  const box: React.CSSProperties = al === "L" ? { left: 60, right: 420, justifyContent: "flex-start" } : al === "R" ? { left: 420, right: 60, justifyContent: "flex-end" } : { left: 80, right: 80, justifyContent: "center" };
  return (
    <div style={{ position: "absolute", top: y, display: "flex", ...box, transform: "translateY(-50%)", opacity: out }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: al === "L" ? "flex-start" : al === "R" ? "flex-end" : "center", alignItems: "baseline", gap: "0px 14px", padding: "12px 26px 16px", borderRadius: 18, background: `rgba(18,13,9,${0.46 * inP})`, boxShadow: `0 6px 28px rgba(18,13,9,${0.22 * inP})`, maxWidth: "100%", scale: String(ip(frame, [pageStart, pageStart + 10], [0.97, 1], E.outExpo)) }}>
        {page.map(([w, s], i) => {
          const lf = frame - (s - 0.04) * fps;
          const key = keywords.some((k) => norm(w).startsWith(k));
          const vis = lf >= 0;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: key ? SERIF : SANS, fontStyle: key ? "italic" : "normal", fontWeight: key ? 500 : 600, fontSize: key ? 66 : 58, lineHeight: 1.18, letterSpacing: key ? "0em" : "0.005em",
              color: key ? CHAMP : IVORY, textShadow: "0 1px 6px rgba(18,13,9,0.55)",
              opacity: 1 }}>{w.replace(/\.\.\.$/, "…")}</span>
          );
        })}
      </div>
    </div>
  );
};

const Title: React.FC<{ c: Extract<Callout, { kind: "title" }> }> = ({ c }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const f = frame - c.from * fps; const end = (c.to - c.from) * fps;
  const chars = Array.from(c.title);

  const out = ip(f, [end - 10, end], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", top: c.y ?? 330, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-50%)", opacity: out }}>
      {c.kicker ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: `${ip(f, [6, 50], [0.9, 0.55], E.outExpo)}em`, textTransform: "uppercase", color: IVORY, opacity: ip(f, [6, 22], [0, 0.9], E.linear), marginBottom: 14, textShadow: SHADOW }}>{c.kicker}</div> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 30px 20px", borderRadius: 22, background: `rgba(18,13,9,${0.42*ip(f,[0,12],[0,1],E.linear)})` }}>
        <div style={{ height: 2, width: 52, background: GOLD, scale: `${ip(f, [16, 40], [0, 1], E.inOutQuint)} 1`, transformOrigin: "100% 50%" }} />
        <div style={{ display: "flex", fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", fontSize: 92, lineHeight: 1, letterSpacing: `${ip(f, [0, 44], [0.35, -0.01], E.outExpo)}em`, whiteSpace: "nowrap" }}>
          {chars.map((ch, i) => { const s = i * 1.6; return (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color: CHAMP, textShadow: "0 2px 14px rgba(18,13,9,0.75), 0 0 2px rgba(18,13,9,0.6)", opacity: ip(f, [s, s + 12], [0, 1], E.linear), filter: `blur(${ip(f, [s, s + 16], [8, 0], E.outQuart)}px)`, translate: `0px ${ip(f, [s, s + 18], [18, 0], E.outExpo)}px` }}>{ch}</span>); })}
        </div>
        <div style={{ height: 2, width: 52, background: GOLD, scale: `${ip(f, [16, 40], [0, 1], E.inOutQuint)} 1`, transformOrigin: "0% 50%" }} />
      </div>
    </div>
  );
};

const Label: React.FC<{ c: Extract<Callout, { kind: "label" }> }> = ({ c }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const f = frame - c.from * fps; const end = (c.to - c.from) * fps;
  const out = ip(f, [end - 10, end], [1, 0], E.inQuart);
  const right = c.align === "right";
  return (
    <div style={{ position: "absolute", top: c.y ?? 1100, ...(right ? { right: c.x ?? 70 } : { left: c.x ?? 70 }), display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", opacity: out }}>
      {c.kicker ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: "0.32em", textTransform: "uppercase", color: IVORY, textShadow: SHADOW, opacity: ip(f, [0, 12], [0, 0.9], E.linear), marginBottom: 10 }}>{c.kicker}</div> : null}
      <div style={{ height: 2, background: GOLD, width: 180, scale: `${ip(f, [2, 22], [0, 1], E.inOutQuint)} 1`, transformOrigin: right ? "100% 50%" : "0% 50%", marginBottom: 12 }} />
      {c.lines.map((l, i) => (
        <div key={i} style={{ overflow: "hidden", paddingBottom: 6 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 54, lineHeight: 1.08, ...gradText, filter: "drop-shadow(0 2px 10px rgba(20,14,8,0.6))", translate: `0px ${ip(f, [6 + i * 5, 24 + i * 5], [100, 0], E.outExpo)}%` }}>{l}</div>
        </div>
      ))}
    </div>
  );
};

const Step: React.FC<{ c: Extract<Callout, { kind: "steps" }> }> = ({ c }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const f = frame - c.from * fps; const end = (c.to - c.from) * fps;
  const out = ip(f, [end - 8, end], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", top: c.y ?? 330, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, transform: "translateY(-50%)", opacity: out }}>
      <div style={{ width: 92, height: 92, borderRadius: 46, border: "2px solid #DDBE84", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(20,14,8,0.28)", scale: String(ip(f, [0, 16], [0.6, 1], E.backOut)), opacity: ip(f, [0, 8], [0, 1], E.linear) }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 58, ...gradText, lineHeight: 1 }}>{c.n}</span>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 48, color: IVORY, textShadow: SHADOW, letterSpacing: "0.02em", translate: `${ip(f, [6, 24], [-40, 0], E.outExpo)}px 0px`, opacity: ip(f, [6, 14], [0, 1], E.linear) }}>{c.text}</div>
      </div>
    </div>
  );
};

const Week: React.FC<{ c: Extract<Callout, { kind: "week" }> }> = ({ c }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const f = frame - c.from * fps; const end = (c.to - c.from) * fps;
  const out = ip(f, [end - 10, end], [1, 0], E.inQuart);
  const days = ["L", "M", "M", "G", "V", "S", "D"];
  return (
    <div style={{ position: "absolute", top: c.y ?? 1080, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: out }}>
      <div style={{ display: "flex", gap: 18 }}>
        {days.map((d, i) => { const s = 4 + i * 3; const lit = c.lit.includes(i); const on = ip(f, [s + 12, s + 22], [0, 1], E.outExpo);
          return (
            <div key={i} style={{ width: 84, height: 84, borderRadius: 42, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${lit ? "#DDBE84" : "rgba(247,241,230,0.55)"}`, background: lit ? `rgba(221,190,132,${0.9 * on})` : "rgba(20,14,8,0.25)", opacity: ip(f, [s, s + 8], [0, 1], E.linear), scale: String(ip(f, [s, s + 14], [0.7, 1], E.backOut) * (lit ? 1 + 0.08 * on : 1)) }}>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: lit && on > 0.5 ? "#2A1E10" : IVORY }}>{d}</span>
            </div>); })}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 52, ...gradText, filter: "drop-shadow(0 2px 10px rgba(20,14,8,0.6))", opacity: ip(f, [26, 38], [0, 1], E.linear) }}>{c.label}</div>
    </div>
  );
};

export const ItAd: React.FC<AdProps> = ({ video, words, keywords, yMap, hide, callouts }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { Promise.all([fontsReady, serifReady]).then(() => continueRender(h)); }, [h]);
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile(video)} muted />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,14,8,0.34) 0%, rgba(20,14,8,0.16) 22%, rgba(20,14,8,0) 34%, rgba(20,14,8,0) 100%)" }} />
      <Captions words={words} keywords={keywords} yMap={yMap} hide={hide} />
      {callouts.filter((c) => t >= c.from && t < c.to).map((c, i) =>
        c.kind === "title" ? <Title key={i} c={c} /> : c.kind === "label" ? <Label key={i} c={c} /> : c.kind === "steps" ? <Step key={i} c={c} /> : <Week key={i} c={c} />)}
    </AbsoluteFill>
  );
};
