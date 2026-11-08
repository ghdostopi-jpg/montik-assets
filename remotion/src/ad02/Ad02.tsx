import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, delayRender, continueRender, interpolate } from "remotion";
import { E, ip } from "../lib/anim";

// AD_02 "Daylight Lab" identity: ivory frosted glass, charcoal type, serum-amber accent. Inter Display.
const INK = "#1E1B18";
const AMBER = "#C9863A";
const IVORY = "#FBF8F2";
const F = "AD02 Inter";
const fontFaces: [string, string, string][] = [
  ["InterDisplay-Light.otf", "300", "normal"], ["InterDisplay-Regular.otf", "400", "normal"],
  ["InterDisplay-Medium.otf", "500", "normal"], ["InterDisplay-SemiBold.otf", "600", "normal"], ["InterDisplay-LightItalic.otf", "300", "italic"],
];
const fontsReady = Promise.all(fontFaces.map(([f, w, s]) => {
  const ff = new FontFace(F, `url(${staticFile("ad02/fonts/" + f)})`, { weight: w, style: s });
  return ff.load().then((x) => { (document.fonts as any).add(x); });
}));

export type Wd = [string, number, number];
type Clip = { kind: "video" | "still"; src: string; from: number; to: number; offset?: number; z0?: number; z1?: number; ox?: number; oy?: number };
export type Ad02Props = { words: Wd[]; clips: Clip[]; frames: number };

const GRADE = "contrast(1.04) saturate(1.03) brightness(1.015)";
const glass: React.CSSProperties = { background: "rgba(251,248,242,0.74)", backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 10px 34px rgba(30,24,16,0.16)" };
const KEY = ["microinfusion", "prima", "dopo", "acido", "ialuronico", "peptidi", "microaghi", "delicatamente", "trascinare", "routine", "rituale"];
const norm = (s: string) => s.toLowerCase().replace(/[.,!?:;…"']/g, "");

const ClipLayer: React.FC<{ c: Clip }> = ({ c }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const len = (c.to - c.from) * fps;
  const z = interpolate(frame, [0, len], [c.z0 ?? 1, c.z1 ?? 1.04]);
  const inF = ip(frame, [0, 6], [0, 1], E.inOutCubic);
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `translate(${c.ox ?? 0}px, ${c.oy ?? 0}px) scale(${z})` };
  return (
    <AbsoluteFill style={{ opacity: c.from === 0 ? 1 : inF }}>
      {c.kind === "video" ? <OffthreadVideo src={staticFile("ad02/" + c.src)} muted startFrom={Math.round((c.offset ?? 0) * fps)} style={style} /> : <Img src={staticFile("ad02/" + c.src)} style={style} />}
    </AbsoluteFill>
  );
};

// Hook: "prima" rolls to "dopo" like a lab counter
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const roll = ip(f, [62, 84], [0, 1], E.inOutQuint);
  const out = ip(f, [160, 172], [1, 0], E.inQuart);
  const line = ip(f, [8, 40], [0, 1], E.outExpo);
  return (
    <div style={{ position: "absolute", top: 300, left: 70, opacity: out * ip(f, [0, 10], [0, 1], E.linear) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F, fontWeight: 500, fontSize: 24, letterSpacing: "0.28em", color: IVORY, textShadow: "0 1px 10px rgba(0,0,0,0.35)" }}>
        <span>ROUTINE</span><div style={{ height: 1.5, width: 120 * line, background: IVORY }} /><span style={{ opacity: line }}>MICROINFUSION</span>
      </div>
      <div style={{ height: 150, overflow: "hidden", marginTop: 0 }}>
        <div style={{ transform: `translateY(${-150 * roll}px)` }}>
          {["prima", "dopo"].map((w, i) => (
            <div key={w} style={{ height: 150, fontFamily: F, fontWeight: 300, fontSize: 112, lineHeight: "150px", letterSpacing: "-0.03em", color: IVORY, textShadow: "0 2px 22px rgba(0,0,0,0.3)" }}>
              {w}<span style={{ color: i ? "#F2C48A" : IVORY }}>{i ? "." : "?"}</span>
            </div>))}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ n: string; label: string; len: number }> = ({ n, label, len }) => {
  const f = useCurrentFrame();
  const a = ip(f, [0, 18], [0, 1], E.outExpo); const out = ip(f, [len - 10, len], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", top: 292, left: 70, display: "flex", alignItems: "center", gap: 16, opacity: out, ...glass, borderRadius: 40, padding: "12px 26px 12px 14px", transform: `translateX(${(1 - a) * -40}px)` }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: INK, color: IVORY, fontFamily: F, fontWeight: 500, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div style={{ fontFamily: F, fontWeight: 500, fontSize: 30, letterSpacing: "0.01em", color: INK }}>{label}</div>
    </div>
  );
};

const Chip: React.FC<{ text: string; x: number; y: number; len: number; dot?: boolean }> = ({ text, x, y, len, dot = true }) => {
  const f = useCurrentFrame();
  const a = ip(f, [0, 16], [0, 1], E.outExpo); const out = ip(f, [len - 8, len], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a * out, transform: `translateY(${(1 - a) * 24}px) scale(${0.94 + 0.06 * a})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", gap: 14, ...glass, borderRadius: 36, padding: "14px 28px 14px 20px" }}>
      {dot ? <div style={{ width: 16, height: 16, borderRadius: 8, background: AMBER, boxShadow: `0 0 0 ${6 * a}px rgba(201,134,58,0.18)` }} /> : null}
      <div style={{ fontFamily: F, fontWeight: 500, fontSize: 38, color: INK, letterSpacing: "-0.005em" }}>{text}</div>
    </div>
  );
};

// Loupe over the "before" still: magnifies the same pixels, adds nothing.
const Loupe: React.FC<{ src: string; len: number; z0: number; z1: number }> = ({ src, len, z0, z1 }) => {
  const f = useCurrentFrame();
  const a = ip(f, [8, 30], [0, 1], E.outExpo); const out = ip(f, [len - 10, len], [1, 0], E.inQuart);
  const cx = interpolate(f, [0, len], [500, 600]); const cy = interpolate(f, [0, len], [500, 470]);
  const z = interpolate(f, [0, len], [z0, z1]);
  const R = 160 * a; const M = 1.8 * z;
  const ix = (cx - 540) / z + 540, iy = (cy - 960) / z + 960;
  return (
    <div style={{ position: "absolute", left: cx - R, top: cy - R, width: R * 2, height: R * 2, borderRadius: "50%", overflow: "hidden", opacity: out, boxShadow: "0 18px 50px rgba(20,14,8,0.35), inset 0 0 0 3px rgba(255,255,255,0.85)" }}>
      <Img src={staticFile("ad02/" + src)} style={{ position: "absolute", width: 1080 * M, height: 1920 * M, left: R - ix * M, top: R - iy * M, filter: GRADE, maxWidth: "none" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.35), rgba(255,255,255,0) 45%)" }} />
    </div>
  );
};

const Steps: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const items = ["premi", "solleva", "ripeti"];
  const out = ip(f, [len - 10, len], [1, 0], E.inQuart);
  const cyc = (f / fps) % 1.5; const active = Math.min(2, Math.floor(cyc / 0.5));
  return (
    <div style={{ position: "absolute", top: 292, left: 70, right: 70, display: "flex", gap: 12, opacity: out * ip(f, [0, 12], [0, 1], E.linear) }}>
      {items.map((t, i) => {
        const on = i === active ? 1 : 0;
        return (
          <div key={t} style={{ ...glass, borderRadius: 30, padding: "10px 24px", fontFamily: F, fontWeight: 500, fontSize: 30, color: on ? IVORY : INK, background: on ? "rgba(30,27,24,0.86)" : (glass.background as string), transition: "none", transform: `translateY(${ip(f, [i * 5, i * 5 + 16], [20, 0], E.outExpo)}px)` }}>{t}</div>);
      })}
    </div>
  );
};

const NoDrag: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const a = ip(f, [0, 16], [0, 1], E.outExpo); const strike = ip(f, [16, 34], [0, 1], E.inOutQuint); const out = ip(f, [len - 8, len], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", top: 300, left: 70, opacity: a * out, display: "flex", alignItems: "center", gap: 16, ...glass, borderRadius: 30, padding: "10px 24px" }}>
      <svg width="64" height="28" viewBox="0 0 64 28"><path d="M4 14 H54 M44 5 L56 14 L44 23" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="25" x2={8 + 48 * strike} y2={25 - 22 * strike} stroke={AMBER} strokeWidth="4" strokeLinecap="round" /></svg>
      <div style={{ fontFamily: F, fontWeight: 500, fontSize: 30, color: INK }}>senza trascinare</div>
    </div>
  );
};

// Split: same framing side by side, "dopo" panel wipes in behind an amber hairline.
const Split: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const pw = 538, ph = 810, y0 = 300;
  const wipe = ip(f, [10, 40], [0, 1], E.inOutQuint);
  const bgZ = interpolate(f, [0, len], [1.08, 1.14]);
  const lab = (t: string, x: number, d: number) => {
    const a = ip(f, [d, d + 16], [0, 1], E.outExpo);
    return <div style={{ position: "absolute", top: y0 + ph - 96, left: x, width: pw, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ ...glass, borderRadius: 30, padding: "10px 24px", fontFamily: F, fontWeight: 500, fontSize: 30, color: INK, transform: `translateY(${(1 - a) * 16}px)` }}>{t}</div></div>;
  };
  return (
    <AbsoluteFill style={{ background: "#EDE6DA" }}>
      <Img src={staticFile("ad02/ba_full.png")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(38px) brightness(0.9)", transform: `scale(${bgZ})` }} />
      <AbsoluteFill style={{ background: "rgba(251,248,242,0.25)" }} />
      <div style={{ position: "absolute", left: 0, top: y0, width: pw, height: ph, overflow: "hidden" }}>
        <Img src={staticFile("ad02/prima.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${interpolate(f, [0, len], [1, 1.04])})` }} />
      </div>
      <div style={{ position: "absolute", left: pw + 4, top: y0, width: pw, height: ph, overflow: "hidden", clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}>
        <Img src={staticFile("ad02/dopo.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: GRADE, transform: `scale(${interpolate(f, [0, len], [1, 1.04])})` }} />
      </div>
      <div style={{ position: "absolute", left: pw, top: y0, width: 4, height: ph * ip(f, [0, 24], [0, 1], E.outExpo), background: AMBER }} />
      {lab("prima", 0, 18)}
      {lab("dopo la routine", pw + 4, 40)}
    </AbsoluteFill>
  );
};

// Serum particles: sparse amber droplets with soft bokeh, slow rise, deterministic.
const Particles: React.FC<{ len: number; n?: number; seed?: number }> = ({ len, n = 26, seed = 3 }) => {
  const f = useCurrentFrame();
  const r = (i: number, k: number) => { const x = Math.sin((i + 1) * 12.9898 * (k + 1) + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
  const fade = ip(f, [0, 14], [0, 1], E.linear) * ip(f, [len - 12, len], [1, 0], E.linear);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade, mixBlendMode: "screen" }}>
      {Array.from({ length: n }).map((_, i) => {
        const size = 6 + r(i, 1) * 22; const sp = 0.6 + r(i, 2) * 1.6;
        const x = 80 + r(i, 3) * 920 + Math.sin(f / 30 + i) * 14; const y = 1500 - ((r(i, 4) * 1300 + f * sp * 2.2) % 1300);
        const blur = r(i, 5) > 0.6 ? 6 : 1; const a = 0.25 + r(i, 6) * 0.55;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, rgba(255,236,200,${a}), rgba(214,150,70,${a * 0.8}) 55%, rgba(214,150,70,0) 72%)`, filter: `blur(${blur}px)` }} />;
      })}
    </AbsoluteFill>
  );
};

// Liquid morph wipe: an amber serum surface with a living, wobbling edge sweeps up and drains away.
const LiquidWipe: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const half = len / 2;
  const up = ip(f, [0, half], [0, 1], E.inOutCubic); const down = ip(f, [half, len], [0, 1], E.inOutCubic);
  const W = 1080, H = 1920;
  const edge = (lvl: number, ph: number) => {
    let d = `M0 ${H} `;
    for (let x = 0; x <= W; x += 30) { const y = lvl + Math.sin(x / 120 + ph) * 38 + Math.sin(x / 47 - ph * 1.7) * 14; d += `L${x} ${y} `; }
    return d + `L${W} ${H} Z`;
  };
  const topEdge = (lvl: number, ph: number) => {
    let d = `M0 0 `;
    for (let x = 0; x <= W; x += 30) { const y = lvl + Math.sin(x / 110 + ph) * 34 + Math.sin(x / 53 + ph) * 12; d += `L${x} ${y} `; }
    return d + `L${W} 0 Z`;
  };
  const ph = f / 4;
  const lvl = H + 120 - up * (H + 240);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="serum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F6D9A6" /><stop offset="0.35" stopColor="#D99A4E" /><stop offset="1" stopColor="#9C5E24" /></linearGradient>
          <mask id="drain"><rect width={W} height={H} fill="white" /><path d={topEdge(-120 + down * (H + 240), ph)} fill="black" /></mask>
        </defs>
        <g mask="url(#drain)">
          <path d={edge(lvl, ph)} fill="url(#serum)" opacity={0.96} />
          <path d={edge(lvl + 26, ph + 1.3)} fill="#FBE7C4" opacity={0.35} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Blueprint card: line schematic of the applicator, perpendicular press. "schema illustrativo", no needle numbers.
const Blueprint: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const a = ip(f, [0, 16], [0, 1], E.outExpo); const out = ip(f, [len - 10, len], [1, 0], E.inQuart);
  const draw = ip(f, [6, 46], [1, 0], E.inOutCubic);
  const press = Math.max(0, Math.sin(Math.max(0, f - 40) / 9)) * 14;
  const BL = "#BFE3FF";
  const st = { stroke: BL, strokeWidth: 2.5, fill: "none", strokeDasharray: 900, strokeDashoffset: 900 * draw } as const;
  return (
    <div style={{ position: "absolute", left: 590, top: 590, width: 420, height: 530, borderRadius: 26, overflow: "hidden", opacity: a * out, transform: `translateY(${(1 - a) * 30}px)`,
      background: "rgba(22,44,72,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(191,227,255,0.45)", boxShadow: "0 14px 40px rgba(8,18,32,0.35)" }}>
      <svg width="420" height="560" viewBox="0 0 420 560" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }).map((_, i) => <line key={"h" + i} x1="0" x2="420" y1={i * 40} y2={i * 40} stroke="rgba(191,227,255,0.10)" />)}
        {Array.from({ length: 11 }).map((_, i) => <line key={"v" + i} y1="0" y2="560" x1={i * 40} x2={i * 40} stroke="rgba(191,227,255,0.10)" />)}
        <g transform={`translate(0 ${-press})`}>
          <rect x="160" y="70" width="100" height="190" rx="14" {...st} />
          <line x1="160" x2="260" y1="120" y2="120" {...st} />
          <rect x="172" y="150" width="76" height="98" rx="8" fill={`rgba(217,154,78,${0.55 * (1 - draw)})`} stroke="none" />
          <path d="M168 260 L168 300 Q168 312 180 312 L240 312 Q252 312 252 300 L252 260" {...st} />
          {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={176 + i * 8.5} x2={176 + i * 8.5} y1="312" y2="322" stroke={BL} strokeWidth="2" opacity={1 - draw} />)}
        </g>
        <path d="M60 352 Q210 330 360 352" stroke="rgba(255,214,170,0.9)" strokeWidth="3" fill="none" opacity={1 - draw} />
        <path d="M120 70 L120 230 M108 214 L120 232 L132 214" stroke={BL} strokeWidth="2.5" fill="none" opacity={1 - draw} />
        <path d="M268 330 L300 330 L300 300" stroke={BL} strokeWidth="2" fill="none" opacity={1 - draw} />
      </svg>
      <div style={{ position: "absolute", left: 26, top: 22, fontFamily: F, fontWeight: 600, fontSize: 20, letterSpacing: "0.24em", color: BL }}>MICROINFUSION</div>
      <div style={{ position: "absolute", left: 26, top: 384, right: 20, fontFamily: F, fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: "#EAF6FF", opacity: ip(f, [30, 44], [0, 1], E.linear) }}>premi in verticale<br />solleva · sposta</div>
      <div style={{ position: "absolute", left: 26, bottom: 22, fontFamily: F, fontWeight: 400, fontSize: 19, letterSpacing: "0.04em", color: "rgba(191,227,255,0.8)" }}>schema illustrativo</div>
      <div style={{ position: "absolute", left: 306, top: 290, fontFamily: F, fontWeight: 500, fontSize: 22, color: BL, opacity: 1 - draw }}>90°</div>
    </div>
  );
};

const EndCard: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const a = ip(f, [0, 22], [0, 1], E.outQuart); const t = ip(f, [10, 40], [0, 1], E.outExpo);
  return (
    <AbsoluteFill style={{ background: `rgba(251,248,242,${a})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: F, fontWeight: 300, fontSize: 92, letterSpacing: `${-0.02 + 0.06 * (1 - t)}em`, color: INK, opacity: t }}>Biostile</div>
      <div style={{ height: 2, width: 220 * t, background: AMBER, margin: "22px 0" }} />
      <div style={{ fontFamily: F, fontWeight: 500, fontSize: 30, letterSpacing: "0.3em", color: INK, opacity: ip(f, [22, 40], [0, 1], E.linear) }}>MICROINFUSION SYSTEM</div>
    </AbsoluteFill>
  );
};

const pagesOf = (words: Wd[], max = 4) => {
  const out: Wd[][] = []; let cur: Wd[] = [];
  for (const w of words) {
    if (cur.length && w[1] - cur[cur.length - 1][2] > 0.35) { out.push(cur); cur = []; }
    cur.push(w);
    if (cur.length >= max || /[.,!?:;]$/.test(w[0])) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Captions: React.FC<{ words: Wd[]; hide: [number, number][] }> = ({ words, hide }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const ps = pagesOf(words, 4);
  let pi = -1; for (let k = 0; k < ps.length; k++) if (t >= ps[k][0][1] - 0.05) pi = k;
  if (pi < 0) return null;
  const page = ps[pi]; const next = ps[pi + 1];
  const endT = Math.min(next ? next[0][1] - 0.05 : 1e9, page[page.length - 1][2] + 0.45);
  if (t > endT) return null;
  const st = (page[0][1] - 0.05) * fps;
  const a = ip(frame, [st, st + 9], [0, 1], E.outExpo); const out = ip(frame, [endT * fps - 5, endT * fps], [1, 0], E.inQuart);
  return (
    <div style={{ position: "absolute", top: 1150, left: 60, right: 60, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ ...glass, borderRadius: 28, padding: "14px 30px 18px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2px 14px", transform: `translateY(${(1 - a) * 18}px)`, opacity: a }}>
        {page.map(([w, s], i) => {
          const lf = frame - (s - 0.05) * fps; const key = KEY.some((k) => norm(w).startsWith(k));
          const on = ip(lf, [0, 7], [0, 1], E.outQuart);
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", fontFamily: F, fontWeight: key ? 600 : 500, fontSize: 54, lineHeight: 1.2, letterSpacing: "-0.01em", color: INK, opacity: 0.28 + 0.72 * on }}>
              {w}
              {key ? <span style={{ position: "absolute", left: 0, bottom: 4, height: 5, borderRadius: 3, width: `${100 * ip(lf, [3, 16], [0, 1], E.outExpo)}%`, background: AMBER, opacity: 0.85 }} /> : null}
            </span>);
        })}
      </div>
    </div>
  );
};

export const Ad02: React.FC<Ad02Props> = ({ words, clips }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const { fps } = useVideoConfig();
  const S = (a: number, b: number, el: React.ReactNode) => <Sequence from={Math.round(a * fps)} durationInFrames={Math.round((b - a) * fps)} layout="none">{el}</Sequence>;
  const L = (a: number, b: number) => Math.round((b - a) * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: IVORY }}>
      {clips.map((c, i) => <Sequence key={i} from={Math.round(c.from * fps)} durationInFrames={Math.round((c.to - c.from) * fps) + (i < clips.length - 1 ? 6 : 0)}><ClipLayer c={c} /></Sequence>)}
      {S(19.40, 23.30, <Split len={L(19.40, 23.30)} />)}
      {S(0, 2.92, <Hook />)}
      {S(9.35, 10.80, <><Chip text="acido ialuronico" x={70} y={820} len={L(9.35, 10.80)} /></>)}
      {S(9.75, 10.80, <Chip text="peptidi" x={70} y={920} len={L(9.75, 10.80)} />)}
      {S(10.80, 12.40, <Blueprint len={L(10.80, 12.40)} />)}
      {S(9.35, 10.80, <Particles len={L(9.35, 10.80)} />)}
      {S(12.40, 14.20, <Particles len={L(12.40, 14.20)} n={14} seed={9} />)}
      {S(13.95, 14.45, <LiquidWipe len={L(13.95, 14.45)} />)}
      {S(16.20, 19.40, <NoDrag len={L(16.20, 19.40)} />)}
      <Captions words={words} hide={[[19.40, 19.42]]} />
    </AbsoluteFill>
  );
};
