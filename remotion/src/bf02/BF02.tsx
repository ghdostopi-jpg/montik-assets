import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender } from "remotion";

// BF Video 02 "MI PODARIMO, VI IZBERETE!" - "Boutique" identity: warm ivory/champagne/beige, dark chocolate type,
// subtle metallic champagne. Cormorant Garamond (display) + Jost (text). All marketing copy is LOCKED (see COPY).
export const COPY = {
  k1a: "BLACK FRIDAY JE TU!", k1b: "POPUSTI DO KAR -60%", k1c: "+ BREZPLAČNA DARILA",
  k1q: "KAJ, ČE BI SI BLACK FRIDAY DARILA LAHKO IZBRALI KAR SAMI? 🎁",
  k2a: "PRI BIOSTILE JIH LAHKO!", k2b: "Nakupujte svoje najljubše izdelke z popusti do -60% in še izberite svoja brezplačna darila.",
  k3a: "MI PODARIMO, VI IZBERETE!", k3t: ["Nad 100€ → 1 DARILO", "Nad 150€ → 2 DARILI", "Nad 200€ → 3 DARILA"],
  k4a: "+ ŠE DODATNIH −25%!", k4b: "Kupon za naslednji nakup ob naročilu nad 100€.",
  k5a: "BLACK FRIDAY SAMO DO KONCA NOVEMBRA!", k5b: "POHITITE PO SVOJA DARILA!",
};
// line breaks only: every displayed string is a slice of COPY (copy-lock)
const W = (t: string, a: number, b?: number) => t.split(" ").slice(a, b).join(" ");
const IVORY = "#FBF6EE", CREAM = "#F2E8D9", BEIGE = "#E6D5BD", CHOC = "#3A2318", CHOC2 = "#5A3826", CHAMP = "#C8A46A";
const METAL = "linear-gradient(100deg, #4E2F15 0%, #8A6236 30%, #A47A44 47%, #6E4A22 66%, #4E2F15 100%)"; // deep bronze: >= 4.5:1 on ivory
const DISPLAY = "BF02 Cormorant", TEXT = "BF02 Jost";
const faces: [string, string, string, string][] = [];
for (const sub of ["latin", "latin-ext"]) {
  faces.push([DISPLAY, `cormorant-garamond-${sub}-600-normal.woff2`, "600", "normal"], [DISPLAY, `cormorant-garamond-${sub}-700-normal.woff2`, "700", "normal"],
    [DISPLAY, `cormorant-garamond-${sub}-600-italic.woff2`, "600", "italic"],
    [TEXT, `jost-${sub}-500-normal.woff2`, "500", "normal"], [TEXT, `jost-${sub}-600-normal.woff2`, "600", "normal"], [TEXT, `jost-${sub}-700-normal.woff2`, "700", "normal"]);
}
const fontsReady = Promise.all(faces.map(([fam, f, w, s]) => new FontFace(fam, `url(${staticFile("bf02/fonts/" + f)})`, { weight: w, style: s }).load().then((x) => (document.fonts as any).add(x))));

const eo = Easing.bezier(0.16, 1, 0.3, 1), eio = Easing.bezier(0.65, 0, 0.35, 1);
const ip = (f: number, i: number[], o: number[], e = eo) => interpolate(f, i, o, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const S = (s: number) => Math.round(s * 60);

// products (authentic cutouts); w/h = aspect
const P: Record<string, { f: string; a: number }> = {
  celuline: { f: "celuline.png", a: 413 / 1100 }, hairo: { f: "hairo.png", a: 298 / 1100 }, gel: { f: "intimate_gel.png", a: 279 / 1100 },
  sun: { f: "sunkissed_wood.png", a: 375 / 1100 }, triple: { f: "triple_action.png", a: 491 / 1100 }, sunrise: { f: "sunrise.png", a: 1117 / 793 },
};
const Prod: React.FC<{ id: string; h: number; x: number; y: number; o?: number; rot?: number; shadow?: boolean }> = ({ id, h, x, y, o = 1, rot = 0, shadow = true }) => {
  const w = h * P[id].a;
  return (<div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, opacity: o, transform: `rotate(${rot}deg)`, transformOrigin: "50% 100%" }}>
    {shadow ? <div style={{ position: "absolute", left: "8%", right: "8%", bottom: -14, height: 28, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(58,35,24,0.38), rgba(58,35,24,0))" }} /> : null}
    <Img src={staticFile("bf02/cut/" + P[id].f)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 18px 22px rgba(58,35,24,0.22)) brightness(1.04) contrast(1.04)" }} />
  </div>);
};
// boutique backdrop: ivory room, soft window light, champagne arch line
const Backdrop: React.FC<{ tone?: number }> = ({ tone = 0 }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 140) * 40;
  return (<AbsoluteFill style={{ background: `radial-gradient(110% 70% at ${50 + drift / 20}% 32%, ${IVORY} 0%, ${CREAM} 55%, ${BEIGE} 100%)` }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,${0.35 + 0.1 * Math.sin(f / 90)}) 48%, rgba(255,255,255,0) 66%)`, transform: `translateX(${drift}px)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 520, background: `linear-gradient(180deg, rgba(200,164,106,0) 0%, rgba(158,118,72,${0.18 + tone}) 100%)` }} />
  </AbsoluteFill>);
};
const Arch: React.FC<{ a: number; top?: number; h?: number }> = ({ a, top = 230, h = 1420 }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top, height: h, borderRadius: "470px 470px 28px 28px", border: `3px solid rgba(200,164,106,${0.75 * a})`, boxShadow: `inset 0 0 0 10px rgba(255,255,255,${0.25 * a})` }} />
);
const Shelf: React.FC<{ y: number; a: number }> = ({ y, a }) => (
  <div style={{ position: "absolute", left: 120, right: 120, top: y, height: 26, borderRadius: 13, opacity: a, background: `linear-gradient(180deg, #F5E9D4 0%, #D9C19A 55%, #A88559 100%)`, boxShadow: "0 16px 30px rgba(58,35,24,0.25)" }} />
);
const Metal: React.FC<{ children: React.ReactNode; size: number; style?: React.CSSProperties }> = ({ children, size, style }) => (
  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.9, fontVariantNumeric: "lining-nums", backgroundImage: METAL, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 0 rgba(58,35,24,0.35))", ...style }}>{children}</span>
);
const Head: React.FC<{ t: string; size?: number; style?: React.CSSProperties }> = ({ t, size = 96, style }) => (
  <div style={{ fontVariantNumeric: "lining-nums", fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.0, letterSpacing: "0.01em", color: CHOC, textAlign: "center", ...style }}>{t}</div>
);
// line-by-line rise (editorial)
const Rise: React.FC<{ f: number; d: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, d, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}><div style={{ transform: `translateY(${ip(f, [d, d + 22], [100, 0])}%)`, opacity: ip(f, [d, d + 14], [0, 1]) }}>{children}</div></div>
);

// ---------------- KADER 1 ----------------
const K1: React.FC = () => {
  const f = useCurrentFrame();
  const q = S(5.6);
  const k = ip(f, [q - 6, q + 24], [0, 1], eio);          // offer block lifts and shrinks when the question comes
  const shelfA = ip(f, [10, 40], [0, 1]);
  const prods: [string, number, number][] = [["sun", 360, 210], ["celuline", 330, 345], ["hairo", 400, 470], ["gel", 360, 590], ["triple", 380, 735], ["sunrise", 250, 880]];
  return (<AbsoluteFill>
    <Backdrop />
    <Arch a={ip(f, [0, 30], [0, 1])} />
    <div style={{ position: "absolute", left: 90, right: 90, top: interpolate(k, [0, 1], [300, 262]), transform: `scale(${interpolate(k, [0, 1], [1, 0.74])})`, transformOrigin: "50% 0%", textAlign: "center" }}>
      <Rise f={f} d={4}><Head t={W(COPY.k1a, 0, 2)} size={112} /></Rise><Rise f={f} d={10}><Head t={W(COPY.k1a, 2)} size={112} /></Rise>
      <Rise f={f} d={18} style={{ marginTop: 18 }}>
        <div style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 50, letterSpacing: "0.12em", color: CHOC2 }}>{W(COPY.k1b, 0, 3)}</div>
      </Rise>
      <div style={{ marginTop: 6, transform: `scale(${ip(f, [28, 60], [0.86, 1])})`, opacity: ip(f, [28, 44], [0, 1]) }}><Metal size={250}>{W(COPY.k1b, 3)}</Metal></div>
      <Rise f={f} d={62} style={{ marginTop: 14 }}>
        <span style={{ display: "inline-block", padding: "12px 34px 14px", borderRadius: 999, background: CHOC, color: IVORY, fontFamily: TEXT, fontWeight: 600, fontSize: 48, letterSpacing: "0.08em" }}>{COPY.k1c}</span>
      </Rise>
    </div>
    {/* question card */}
    <div style={{ position: "absolute", left: 110, right: 110, top: 770, padding: "34px 40px 38px", borderRadius: 30, background: "rgba(255,252,246,0.92)", border: `2px solid ${CHAMP}`,
      boxShadow: "0 24px 60px rgba(58,35,24,0.18)", opacity: ip(f, [q + 6, q + 26], [0, 1]), transform: `translateY(${ip(f, [q + 6, q + 32], [40, 0])}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontStyle: "italic", fontWeight: 600, fontSize: 72, lineHeight: 1.08, color: CHOC, textAlign: "center" }}>{COPY.k1q}</div>
    </div>
    <Shelf y={1520} a={shelfA} />
    {prods.map(([id, h, x], i) => <Prod key={id} id={id} h={h * interpolate(k, [0, 1], [1, 0.92])} x={x} y={1522} o={ip(f, [16 + i * 5, 40 + i * 5], [0, 1])} rot={0} />)}
  </AbsoluteFill>);
};

// ---------------- KADER 2 ----------------
const CARD_W = 270, CARD_H = 330;
const grid: [string, number, number][] = [["sunrise", 0, 0], ["triple", 1, 0], ["hairo", 2, 0], ["gel", 0, 1], ["sun", 1, 1], ["celuline", 2, 1]];
const Card: React.FC<{ id: string; x: number; y: number; a: number; dy: number; sel: number }> = ({ id, x, y, a, dy, sel }) => {
  const isBox = id === "sunrise"; const h = isBox ? 175 : 275;
  return (<div style={{ position: "absolute", left: x, top: y + dy, width: CARD_W, height: CARD_H, borderRadius: 26, opacity: a, background: "linear-gradient(180deg, #FFFDF9 0%, #F4EADB 100%)",
    boxShadow: `0 20px 44px rgba(58,35,24,0.16), 0 0 0 ${2 + sel * 3}px rgba(200,164,106,${0.45 + 0.55 * sel})` }}>
    <Prod id={id} h={h} x={CARD_W / 2} y={isBox ? 255 : 302} shadow />
    <div style={{ position: "absolute", right: 16, top: 16, width: 40, height: 40, borderRadius: 20, background: CHAMP, opacity: sel, transform: `scale(${0.6 + 0.4 * sel})`,
      display: "flex", alignItems: "center", justifyContent: "center", color: IVORY, fontFamily: TEXT, fontWeight: 700, fontSize: 26 }}>✓</div>
  </div>);
};
const K2: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = (1080 - 3 * CARD_W - 2 * 30) / 2;
  const selT = [S(7.5), S(8.1), S(8.7)]; // "izberite svoja brezplačna darila"
  const selIdx = [1, 3, 5];
  return (<AbsoluteFill>
    <Backdrop tone={0.04} />
    <div style={{ position: "absolute", left: 90, right: 90, top: 270 }}><Rise f={f} d={4}><Head t={W(COPY.k2a, 0, 2)} size={100} /></Rise><Rise f={f} d={10}><Head t={W(COPY.k2a, 2)} size={100} /></Rise></div>
    <div style={{ position: "absolute", left: 100, right: 100, top: 492, textAlign: "center", fontFamily: TEXT, fontWeight: 500, fontSize: 48, lineHeight: 1.28, color: CHOC2, opacity: ip(f, [18, 36], [0, 1]), transform: `translateY(${ip(f, [18, 40], [24, 0])}px)` }}>{COPY.k2b}</div>
    {grid.map(([id, c, r], i) => {
      const d = 30 + i * 7; const si = selIdx.indexOf(i);
      return <Card key={id} id={id} x={x0 + c * (CARD_W + 30)} y={770 + r * (CARD_H + 34)} a={ip(f, [d, d + 18], [0, 1])} dy={ip(f, [d, d + 30], [90, 0])}
        sel={si >= 0 ? ip(f, [selT[si], selT[si] + 14], [0, 1]) : 0} />;
    })}
  </AbsoluteFill>);
};

// ---------------- KADER 3 ----------------
const Gift: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={44 * s} height={44 * s} viewBox="0 0 44 44"><rect x="5" y="16" width="34" height="24" rx="3" fill={CHAMP} /><rect x="3" y="11" width="38" height="8" rx="2" fill="#B08D55" />
    <rect x="20" y="11" width="4" height="29" fill={CHOC} /><path d="M22 11 C14 2, 6 8, 14 11 Z M22 11 C30 2, 38 8, 30 11 Z" fill={CHOC} /></svg>
);
const K3: React.FC = () => {
  const f = useCurrentFrame();
  const hi = [S(2.75), S(4.85), S(7.35)]; // VO reads each tier
  return (<AbsoluteFill>
    <Backdrop />
    <div style={{ position: "absolute", left: 90, right: 90, top: 262 }}><Rise f={f} d={4}><Head t={W(COPY.k3a, 0, 2)} size={104} /></Rise><Rise f={f} d={10}><Head t={W(COPY.k3a, 2)} size={104} /></Rise></div>
    <div style={{ position: "absolute", left: 300, right: 300, top: 488, height: 3, background: METAL, transform: `scaleX(${ip(f, [12, 40], [0, 1])})` }} />
    {COPY.k3t.map((t, i) => {
      const d = 40 + i * 8; const on = ip(f, [hi[i], hi[i] + 12], [0, 1]) * (i === 2 ? 1 : 1 - 0.55 * ip(f, [hi[i + 1] ?? 1e9, (hi[i + 1] ?? 1e9) + 12], [0, 1]));
      const [left, right] = t.split(" → ");
      return (<div key={i} style={{ position: "absolute", left: 110, right: 110, top: 560 + i * 170, height: 140, borderRadius: 24, opacity: ip(f, [d, d + 16], [0, 1]),
        transform: `translateX(${ip(f, [d, d + 26], [i % 2 ? 80 : -80, 0])}px) scale(${1 + 0.03 * on})`, background: `linear-gradient(90deg, ${IVORY} 0%, #F6ECDC 100%)`,
        boxShadow: `0 16px 36px rgba(58,35,24,0.14), 0 0 0 ${2 + 4 * on}px rgba(200,164,106,${0.4 + 0.6 * on})`, display: "flex", alignItems: "center", padding: "0 34px", gap: 18 }}>
        <span style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 56, color: CHOC, whiteSpace: "nowrap" }}>{left}</span>
        <span style={{ fontFamily: TEXT, fontWeight: 500, fontSize: 56, color: CHOC2 }}>→</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: CHOC, whiteSpace: "nowrap" }}>{right}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>{Array.from({ length: i + 1 }).map((_, j) => <Gift key={j} s={0.95} />)}</span>
      </div>);
    })}
    {/* the six gifts to choose from, shown apart from the tiers */}
    <Shelf y={1540} a={ip(f, [30, 60], [0, 1])} />
    {([["sun", 250, 225], ["celuline", 235, 335], ["hairo", 285, 430], ["gel", 255, 520], ["triple", 270, 625], ["sunrise", 175, 790]] as [string, number, number][]).map(([id, h, x], i) =>
      <Prod key={id} id={id} h={h} x={x} y={1542} o={ip(f, [44 + i * 4, 64 + i * 4], [0, 1])} />)}
  </AbsoluteFill>);
};

// ---------------- KADER 4 ----------------
const K4: React.FC = () => {
  const f = useCurrentFrame();
  const rise = ip(f, [8, 44], [0, 1]);
  const tilt = ip(f, [8, 50], [18, 0]);
  return (<AbsoluteFill>
    <Backdrop tone={0.06} />
    <Arch a={0.6} top={250} h={1380} />
    {/* voucher */}
    <div style={{ position: "absolute", left: 110, width: 860, top: interpolate(rise, [0, 1], [900, 470]), height: 520, perspective: 1600 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 30, transform: `rotateX(${tilt}deg)`, background: "linear-gradient(140deg, #FFF9EE 0%, #F1E2C6 55%, #E2C996 100%)",
        boxShadow: "0 40px 80px rgba(58,35,24,0.28)", border: `2px solid ${CHAMP}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 200, top: 30, bottom: 30, borderLeft: `4px dotted rgba(90,56,38,0.35)` }} />
        <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 150, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ip(f, [40, 70], [-30, 0])}deg) scale(${ip(f, [40, 70], [0.6, 1])})`, opacity: ip(f, [40, 60], [0, 1]) }}><Gift s={2.6} /></div>
        <div style={{ position: "absolute", left: 230, right: 30, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 50, letterSpacing: "0.08em", color: CHOC2, opacity: ip(f, [30, 48], [0, 1]) }}>{W(COPY.k4a, 0, 3)}</div>
          <div style={{ marginTop: 4, transform: `scale(${ip(f, [36, 64], [0.85, 1])})`, opacity: ip(f, [36, 52], [0, 1]) }}><span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 0.9, color: CHOC, textShadow: "0 3px 0 rgba(255,255,255,0.5)" }}>{W(COPY.k4a, 3)}</span></div>
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 120, right: 120, top: 1040, textAlign: "center", fontFamily: TEXT, fontWeight: 600, fontSize: 50, lineHeight: 1.25, color: CHOC, opacity: ip(f, [58, 78], [0, 1]), transform: `translateY(${ip(f, [58, 84], [26, 0])}px)` }}>{COPY.k4b}</div>
    <Shelf y={1545} a={0.9} />
    {([["gel", 230, 330], ["triple", 245, 460], ["sunrise", 165, 640], ["celuline", 215, 790]] as [string, number, number][]).map(([id, h, x], i) =>
      <Prod key={id} id={id} h={h} x={x} y={1547} o={ip(f, [70 + i * 4, 90 + i * 4], [0, 1])} />)}
  </AbsoluteFill>);
};

// ---------------- KADER 5 ----------------
const K5: React.FC = () => {
  const f = useCurrentFrame();
  const pod: [string, number, number, number][] = [ // back row on the upper step, front row on the lower step
    ["celuline", 330, 300, 1250], ["hairo", 390, 445, 1250], ["gel", 350, 615, 1250], ["sun", 345, 770, 1250],
    ["triple", 300, 360, 1545], ["sunrise", 225, 640, 1545]];
  return (<AbsoluteFill>
    <Backdrop tone={0.08} />
    <div style={{ position: "absolute", left: 90, right: 90, top: 262, textAlign: "center" }}>
      <Rise f={f} d={4}><Head t={W(COPY.k5a, 0, 2)} size={104} /></Rise>
      <Rise f={f} d={10}><Head t={W(COPY.k5a, 2, 5)} size={86} style={{ color: CHOC2 }} /></Rise>
      <Rise f={f} d={16}><Head t={W(COPY.k5a, 5)} size={124} /></Rise>
      <div style={{ margin: "18px auto 0", width: 420, height: 3, background: METAL, transform: `scaleX(${ip(f, [24, 50], [0, 1])})` }} />
      <div style={{ marginTop: 26, opacity: ip(f, [S(2.85), S(2.85) + 16], [0, 1]), transform: `translateY(${ip(f, [S(2.85), S(2.85) + 24], [20, 0])}px) scale(${1 + 0.02 * Math.sin(Math.max(0, f - S(3.4)) / 18)})` }}>
        <span style={{ display: "inline-block", padding: "16px 40px 20px", borderRadius: 999, background: CHOC, color: IVORY, fontFamily: TEXT, fontWeight: 700, fontSize: 52, letterSpacing: "0.06em", boxShadow: "0 16px 34px rgba(58,35,24,0.3)" }}>{COPY.k5b}</span>
      </div>
    </div>
    {/* boutique podium */}
    <div style={{ position: "absolute", left: 150, right: 150, top: 1250, height: 34, borderRadius: 14, background: "linear-gradient(180deg, #FAF1E2, #D8BE94)", boxShadow: "0 14px 26px rgba(58,35,24,0.22)", opacity: ip(f, [10, 30], [0, 1]) }} />
    <div style={{ position: "absolute", left: 110, right: 110, top: 1545, height: 40, borderRadius: 16, background: "linear-gradient(180deg, #FAF1E2, #CDB084)", boxShadow: "0 18px 30px rgba(58,35,24,0.25)", opacity: ip(f, [10, 30], [0, 1]) }} />
    <div style={{ position: "absolute", left: 260, right: 260, top: 900, height: 700, background: "radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0))", opacity: ip(f, [20, 60], [0, 1]) }} />
    {pod.map(([id, h, x, y], i) => <Prod key={id} id={id} h={h} x={x} y={y + 2} o={ip(f, [14 + i * 6, 36 + i * 6], [0, 1])} />)}
  </AbsoluteFill>);
};

// editorial arch-mask transition: the next scene opens inside a growing boutique arch
const ArchIn: React.FC<{ children: React.ReactNode; len?: number }> = ({ children, len = 26 }) => {
  const f = useCurrentFrame();
  const p = ip(f, [0, len], [0, 1], eio);
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const w = interpolate(p, [0, 1], [420, 1500]), h = interpolate(p, [0, 1], [640, 2700]);
  const t = Math.max(0, 1000 - h / 2), b = Math.max(0, 920 - h / 2), sd = Math.max(0, 540 - w / 2);
  const r = Math.min(w / 2, 540);
  return (<AbsoluteFill>
    <AbsoluteFill style={{ clipPath: `inset(${t}px ${sd}px ${b}px ${sd}px round ${r}px ${r}px 28px 28px)` }}>{children}</AbsoluteFill>
    {/* champagne arch frame that travels with the mask, so the reveal reads as a boutique window, not a blank card */}
    <div style={{ position: "absolute", left: sd, right: sd, top: t, bottom: b, borderRadius: `${r}px ${r}px 28px 28px`, border: `4px solid ${CHAMP}`,
      boxShadow: "0 0 0 10px rgba(255,255,255,0.35), 0 30px 60px rgba(58,35,24,0.25)", opacity: 1 - p }} />
  </AbsoluteFill>);
};

// outgoing scene dissolves while the next one opens in its arch (no two headlines on screen at once)
const FadeOut: React.FC<{ start: number; len: number; children: React.ReactNode }> = ({ start, len, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: ip(f, [start, start + len * 0.55], [1, 0], eio) }}>{children}</AbsoluteFill>;
};

export type BF02Props = { scenes: { id: string; from: number; to: number }[]; frames: number };
const SC: Record<string, React.FC> = { K1, K2, K3, K4, K5 };
export const BF02: React.FC<BF02Props> = ({ scenes }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const XF = 26;
  return (<AbsoluteFill style={{ background: IVORY, fontVariantNumeric: "lining-nums" }}>
    {scenes.map((s, i) => {
      const C = SC[s.id]; const from = S(s.from); const dur = S(s.to) - from + (i < scenes.length - 1 ? XF : 0);
      const own = S(s.to) - from;
      return (<Sequence key={s.id} from={from} durationInFrames={dur}><FadeOut start={own} len={XF}>{i === 0 ? <C /> : <ArchIn len={XF}><C /></ArchIn>}</FadeOut></Sequence>);
    })}
  </AbsoluteFill>);
};
