import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, spring, delayRender, continueRender } from "remotion";

// TEXT SAFE ZONE (Rene, 9 Nov 2026, all videos): every text sits inside the centre 1080x1080 square, Y 420-1500 (X 100-945 here).
// BF Video 02 v2 - "UGC sticker" direction (Rene, 9 Nov 2026): white + Biostile green + sale red, charcoal for contrast only.
// GROUP A (regular, discounted) = lifestyle photo cards + plain white die-cut stickers, green plinth.
// GROUP B (the six free gifts)   = gift B-rolls + die-cut stickers that always carry a red ribbon bow.
// The two groups never share a frame except in the final CTA, where they sit in two separate showcases.
// All marketing copy is LOCKED (see COPY); every displayed string is a slice of COPY (copy-lock).
export const COPY = {
  k1a: "BLACK FRIDAY JE TU!", k1b: "POPUSTI DO KAR -60%", k1c: "+ BREZPLAČNA DARILA",
  k1q: "KAJ, ČE BI SI BLACK FRIDAY DARILA LAHKO IZBRALI KAR SAMI? 🎁",
  k2a: "PRI BIOSTILE JIH LAHKO!", k2b: "Nakupujte svoje najljubše izdelke z popusti do -60% in še izberite svoja brezplačna darila.",
  k3a: "MI PODARIMO, VI IZBERETE!", k3t: ["Nad 100€ → 1 DARILO", "Nad 150€ → 2 DARILI", "Nad 200€ → 3 DARILA"],
  k4a: "+ ŠE DODATNIH −25%!", k4b: "Kupon za naslednji nakup ob naročilu nad 100€.",
  k5a: "BLACK FRIDAY SAMO DO KONCA NOVEMBRA!", k5b: "POHITITE PO SVOJA DARILA!",
};
const W = (t: string, a: number, b?: number) => t.split(" ").slice(a, b).join(" ");

const WHITE = "#FFFFFF", MINT = "#EAF4EE", GREEN = "#0F6B3E", GREEN2 = "#0A4F2D", LEAF = "#2E9B5E", RED = "#E3192C", RED2 = "#B5101F", INK = "#1E2723";
const FONT = "BF02v2 Poppins";
const fontsReady = (() => {
  if (typeof document === "undefined") return Promise.resolve();
  const faces: Promise<any>[] = [];
  for (const sub of ["latin", "latin-ext"]) for (const w of ["500", "600", "700", "800", "900"])
    faces.push(new FontFace(FONT, `url(${staticFile(`bf02v2/fonts/poppins-${sub}-${w}-normal.woff2`)})`, { weight: w }).load().then((x) => (document.fonts as any).add(x)));
  return Promise.all(faces);
})();

const eo = Easing.bezier(0.16, 1, 0.3, 1), eio = Easing.bezier(0.65, 0, 0.35, 1);
const ip = (f: number, i: number[], o: number[], e = eo) => interpolate(f, i, o, { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const FPS = 60;
const S = (s: number) => Math.round(s * FPS);

// ---------- timeline (seconds; VO takeA placed at 0, cuts sit on measured VO silences) ----------
export const T = {
  k1a: 0, k1pop: 1.70, k1b: 4.20, k1q: 6.12, k2a: 9.93, k2b: 12.04, k2c: 16.40, k3: 19.65,
  tier1: 22.10, tier2: 24.00, tier3: 26.60, k4: 29.28, kupon: 32.40, k5: 36.02, cta: 38.66, end: 43.50,
};

// ---------- sticker library ----------
const AR: Record<string, number> = { A_collagen: 1.1118, A_magnesium: 1.5225, A_microshapper: 1.2636, A_nutrilegs: 0.318, A_q10: 0.5533, A_slimis: 1.003,
  B_celuline: 0.3743, B_gel: 0.5503, B_hairo: 0.3107, B_sunkissed: 0.3299, B_sunrise: 1.3796, B_triple: 0.4763 };
export const GROUP_A = ["A_q10", "A_slimis", "A_collagen", "A_microshapper", "A_magnesium", "A_nutrilegs"];
export const GROUP_B = ["B_sunrise", "B_triple", "B_hairo", "B_gel", "B_sunkissed", "B_celuline"];

const Bow: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 100 78" style={style}>
    <path d="M50 34 C 32 6, 4 4, 6 26 C 8 44, 34 44, 50 36 Z" fill={RED} stroke={WHITE} strokeWidth={4} strokeLinejoin="round" />
    <path d="M50 34 C 68 6, 96 4, 94 26 C 92 44, 66 44, 50 36 Z" fill={RED} stroke={WHITE} strokeWidth={4} strokeLinejoin="round" />
    <path d="M46 38 L 30 74 L 42 68 L 48 76 L 52 40 Z" fill={RED2} stroke={WHITE} strokeWidth={4} strokeLinejoin="round" />
    <path d="M54 38 L 70 74 L 58 68 L 52 76 L 48 40 Z" fill={RED2} stroke={WHITE} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={50} cy={35} r={10} fill={RED2} stroke={WHITE} strokeWidth={4} />
  </svg>
);

// die-cut sticker: pops in (spring), then floats; gifts always wear the bow
const Stk: React.FC<{ id: string; cx: number; by: number; box: [number, number]; at: number; rot?: number; lift?: number; ring?: number; float?: number }> = ({ id, cx, by, box, at, rot = 0, lift = 0, ring = 0, float = 1 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ar = AR[id]; let h = box[1], w = h * ar; if (w > box[0]) { w = box[0]; h = w / ar; }
  const sp = spring({ frame: f - S(at), fps, config: { damping: 11, stiffness: 170, mass: 0.8 } });
  const bob = float * Math.sin((f + cx) / 34) * 6, sway = float * Math.sin((f + cx * 2) / 47) * 1.6;
  const gift = id.startsWith("B_");
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: by - h + bob - lift, width: w, height: h, opacity: sp > 0.02 ? 1 : 0,
      transform: `scale(${0.2 + 0.8 * sp}) rotate(${rot + sway + (1 - sp) * -18}deg)`, transformOrigin: "50% 100%" }}>
      {ring > 0 ? <div style={{ position: "absolute", inset: -22, borderRadius: 34, border: `7px solid ${RED}`, opacity: ring, transform: `scale(${0.9 + 0.1 * ring})`, background: "rgba(227,25,44,0.06)" }} /> : null}
      <Img src={staticFile(`bf02v2/stk/${id}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 14px 18px rgba(30,39,35,0.28))" }} />
      {gift ? <Bow size={Math.max(70, Math.min(110, w * 0.62))} style={{ position: "absolute", right: -Math.min(46, w * 0.3), top: -30, transform: "rotate(14deg)", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.25))" }} /> : null}
    </div>
  );
};

// lifestyle photo card (GROUP A only): white frame, drops onto a pile
const Card: React.FC<{ src: string; cx: number; cy: number; size: number; at: number; rot: number; out?: number }> = ({ src, cx, cy, size, at, rot, out = 1e9 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f - S(at), fps, config: { damping: 14, stiffness: 140 } });
  const o = ip(f, [S(out), S(out) + 10], [1, 0]);
  return (
    <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: (sp > 0.01 ? 1 : 0) * o,
      transform: `translateY(${(1 - sp) * -900}px) rotate(${rot + (1 - sp) * rot * 3}deg) scale(${1 + (1 - sp) * 0.25})`,
      background: WHITE, padding: 16, borderRadius: 26, boxShadow: "0 28px 50px rgba(30,39,35,0.30)" }}>
      <Img src={staticFile(`bf02v2/img/${src}`)} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} />
    </div>
  );
};

const H: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = INK, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: -1, color, textAlign: "center", fontVariantNumeric: "lining-nums", ...style }}>{children}</div>
);
// word-by-word slam for headlines
const Slam: React.FC<{ text: string; at: number; size: number; color?: string; top: number; gap?: number; style?: React.CSSProperties }> = ({ text, at, size, color = INK, top, gap = 0.09, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 100, right: 135, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.26, ...style }}>
      {text.split(" ").map((w, i) => {
        const sp = spring({ frame: f - S(at + i * gap), fps, config: { damping: 12, stiffness: 210 } });
        return <span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color, letterSpacing: -1,
          opacity: sp > 0.02 ? 1 : 0, transform: `translateY(${(1 - sp) * 60}px) scale(${0.6 + 0.4 * sp})`, fontVariantNumeric: "lining-nums" }}>{w}</span>;
      })}
    </div>
  );
};

// confetti strips (green/red), drifting - background energy
const Confetti: React.FC<{ seed?: number; n?: number; dark?: boolean }> = ({ seed = 1, n = 22, dark = false }) => {
  const f = useCurrentFrame();
  const r = (i: number) => { const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
  return (<AbsoluteFill>
    {Array.from({ length: n }).map((_, i) => {
      const x = r(i) * 1080, y0 = r(i + 50) * 1920, sp = 0.6 + r(i + 9) * 1.2, y = (y0 + f * sp * 1.6) % 2000 - 40;
      const c = dark ? [WHITE, "#7FD3A0", RED][i % 3] : [GREEN, RED, LEAF][i % 3];
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14 + r(i + 3) * 10, height: 30 + r(i + 4) * 16, borderRadius: 6, background: c, opacity: 0.55,
        transform: `rotate(${f * (r(i + 7) - 0.5) * 6 + r(i) * 180}deg)` }} />;
    })}
  </AbsoluteFill>);
};

// scene wipe: green + red diagonal bars sweep through (0.4 s), centred on the cut
const Wipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame(); const p = ip(f, [S(at) - 12, S(at) + 12], [0, 1], eio);
  if (p <= 0 || p >= 1) return null;
  return (<AbsoluteFill style={{ pointerEvents: "none" }}>
    {[GREEN, RED, WHITE].map((c, i) => (
      <div key={i} style={{ position: "absolute", top: -400, bottom: -400, width: 520 - i * 140, left: -900 + (p * 3000) - i * 120, background: c, transform: "skewX(-18deg)" }} />
    ))}
  </AbsoluteFill>);
};

const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties }> = ({ children, bg = RED, color = WHITE, style }) => (
  <div style={{ display: "inline-block", background: bg, color, fontFamily: FONT, fontWeight: 900, borderRadius: 999, padding: "14px 36px", boxShadow: "0 14px 28px rgba(30,39,35,0.25)", ...style }}>{children}</div>
);

// ================= SCENES =================
// K1a: Black Friday + -60%  -> GROUP A women/lifestyle pile + regular-product stickers
const K1a: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = T.k1a;
  const pop = spring({ frame: f - S(T.k1pop - t0), fps, config: { damping: 9, stiffness: 160 } });
  const hookOut = ip(f, [S(T.k1pop - t0) - 8, S(T.k1pop - t0)], [1, 0]);
  const cards: [string, number, number, number, number][] = [
    ["A_life_magnesium3.jpg", 540, 1190, -5, 0.00], ["A_life_collagen.jpg", 520, 1180, 6, 0.45], ["A_life_microshapper3.jpg", 560, 1200, -3, 0.95],
    ["A_life_q10.jpg", 530, 1185, 4, 1.55], ["A_life_slimis.jpg", 545, 1195, -6, 2.25], ["A_life_magnesium5.jpg", 535, 1190, 3, 3.00]];
  return (<AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 55%, ${WHITE} 0%, ${MINT} 100%)` }}>
    <Confetti seed={3} n={18} />
    {cards.map(([s, x, y, r, a], i) => <Card key={i} src={s} cx={x} cy={y} size={520} at={a} rot={r} />)}
    {/* hook headline */}
    <div style={{ opacity: hookOut }}>
      <Slam text={W(COPY.k1a, 0, 1)} at={0.0} size={140} top={432} />
      <Slam text={W(COPY.k1a, 1, 2)} at={0.14} size={140} top={572} />
      <Slam text={W(COPY.k1a, 2)} at={0.42} size={140} color={RED} top={712} />
    </div>
    {/* -60% */}
    {f >= S(T.k1pop - t0) - 2 ? <>
      <Slam text={W(COPY.k1b, 0, 3)} at={T.k1pop - t0} size={74} color={GREEN} top={436} gap={0.07} />
      <div style={{ position: "absolute", left: 100, right: 135, top: 520, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${0.3 + 0.7 * pop}) rotate(${-5 + (1 - pop) * 20}deg)`, opacity: pop > 0.02 ? 1 : 0 }}>
          <H size={230} color={RED} style={{ WebkitTextStroke: `10px ${WHITE}`, paintOrder: "stroke fill", filter: "drop-shadow(0 16px 20px rgba(181,16,31,0.35))", letterSpacing: -6 }}>{W(COPY.k1b, 3)}</H>
        </div>
      </div>
    </> : null}
    {/* regular products pop around the pile */}
    <Stk id="A_q10" cx={215} by={1470} box={[170, 280]} at={2.55} rot={-8} />
    <Stk id="A_collagen" cx={840} by={1470} box={[200, 200]} at={2.85} rot={7} />
    <Stk id="A_nutrilegs" cx={850} by={1150} box={[110, 330]} at={3.25} rot={9} />
  </AbsoluteFill>);
};

// K1b: "+ BREZPLAČNA DARILA" -> GROUP B (authentic Sunrise gift photo, wrapped with a ribbon)
const K1b: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const sp = spring({ frame: f, fps, config: { damping: 13, stiffness: 150 } });
  const rb = ip(f, [6, 26], [0, 1]);
  const bow = spring({ frame: f - 16, fps, config: { damping: 9, stiffness: 190 } });
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${GREEN} 0%, ${GREEN2} 100%)` }}>
    <Confetti seed={7} n={20} dark />
    <H size={62} color={WHITE} style={{ position: "absolute", left: 100, right: 135, top: 436, opacity: 0.92 }}>{COPY.k1b}</H>
    <div style={{ position: "absolute", left: 100, right: 135, top: 522, display: "flex", justifyContent: "center", transform: `scale(${0.5 + 0.5 * sp})`, opacity: sp > 0.02 ? 1 : 0 }}>
      <Pill style={{ fontSize: 56, padding: "16px 34px", transform: "rotate(-2deg)", whiteSpace: "nowrap" }}>{COPY.k1c}</Pill>
    </div>
    {/* gift photo, wrapped */}
    <div style={{ position: "absolute", left: 175, top: 680, width: 700, height: 700, transform: `translateY(${(1 - sp) * 500}px) rotate(${2 - (1 - sp) * 8}deg)`,
      background: WHITE, padding: 16, borderRadius: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 14 }}>
        <Img src={staticFile("bf02v2/img/B_sunrise_photo.jpg")} style={{ position: "absolute", height: "100%", left: "50%", transform: `translateX(-48%) scale(${1.02 + f / 2400})` }} />
        <div style={{ position: "absolute", left: 0, top: "50%", height: 38, width: `${rb * 100}%`, background: RED, transform: "translateY(-50%)", boxShadow: "0 0 0 4px rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", top: 0, left: "18%", width: 38, height: `${rb * 100}%`, background: RED, boxShadow: "0 0 0 4px rgba(255,255,255,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: "18%", top: "50%", transform: `translate(-50%,-62%) scale(${bow})`, opacity: bow > 0.02 ? 1 : 0 }}><Bow size={210} /></div>
    </div>
  </AbsoluteFill>);
};

// full-bleed B-roll (GROUP B gift footage only)
const Broll: React.FC<{ src: string; rate?: number; startFrom?: number; zoom?: [number, number]; dur: number }> = ({ src, rate = 1, startFrom = 0, zoom = [1.0, 1.06], dur }) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ overflow: "hidden", background: INK }}>
    <OffthreadVideo src={staticFile(`bf02v2/v/${src}`)} muted playbackRate={rate} startFrom={startFrom}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${ip(f, [0, S(dur)], zoom, (x) => x)})` }} />
  </AbsoluteFill>);
};

// K1q: the question over a gift B-roll (Celuline pumped into a palm)
const K1q: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const dur = T.k2a - T.k1q;
  const sp = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 150 } });
  const lines = [W(COPY.k1q, 0, 4), W(COPY.k1q, 4, 7), W(COPY.k1q, 7, 11)];
  return (<AbsoluteFill>
    <Broll src="g_celuline_pump.mp4" rate={4.8 / dur * 0.98} dur={dur} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1105, transform: `translateY(${(1 - sp) * 120}px)`, opacity: sp > 0.02 ? 1 : 0,
      background: WHITE, borderRadius: 34, padding: "30px 34px 34px", boxShadow: "0 24px 44px rgba(0,0,0,0.30)" }}>
      {lines.map((l, i) => {
        const a = ip(f, [8 + i * 9, 20 + i * 9], [0, 1]);
        return <H key={i} size={i === 1 ? 66 : 54} color={i === 1 ? RED : INK} style={{ opacity: a, transform: `translateY(${(1 - a) * 18}px)`, marginTop: i ? 6 : 0 }}>{l}</H>;
      })}
      <div style={{ position: "absolute", right: 40, top: -70, fontSize: 90, transform: `rotate(12deg) scale(${spring({ frame: f - 40, fps, config: { damping: 8, stiffness: 200 } })})` }}>{W(COPY.k1q, 11)}</div>
    </div>
  </AbsoluteFill>);
};

// K2a: brand answer - typographic, no products (nothing to confuse)
const K2a: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const burst = spring({ frame: f - 30, fps, config: { damping: 10, stiffness: 120 } });
  return (<AbsoluteFill style={{ background: `radial-gradient(80% 55% at 50% 45%, ${LEAF} 0%, ${GREEN} 55%, ${GREEN2} 100%)` }}>
    <Confetti seed={11} n={26} dark />
    <div style={{ position: "absolute", left: 540 - 430, top: 860 - 430, width: 860, height: 860, borderRadius: "50%", border: `6px solid rgba(255,255,255,${0.35 * (1 - burst)})`, transform: `scale(${0.4 + burst})` }} />
    <Slam text={W(COPY.k2a, 0, 2)} at={0.05} size={128} color={WHITE} top={640} gap={0.14} />
    <Slam text={W(COPY.k2a, 2)} at={0.55} size={128} color={WHITE} top={790} gap={0.14} />
    <div style={{ position: "absolute", left: 100, right: 135, top: 960, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 300 * ip(f, [50, 80], [0, 1]), height: 14, borderRadius: 7, background: RED }} />
    </div>
  </AbsoluteFill>);
};

// K2b: "Nakupujte ... do -60%" -> GROUP A product stickers on green plinths
const K2b: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tx = W(COPY.k2b, 0, 8); // Nakupujte svoje najljubše izdelke z popusti do -60%
  const pl = (cx: number, y: number, d: number) => {
    const s = spring({ frame: f - S(d), fps, config: { damping: 14, stiffness: 160 } });
    return <div style={{ position: "absolute", left: cx - 125, top: y - 22, width: 250, height: 44, borderRadius: "50%", background: `radial-gradient(closest-side, ${LEAF}, ${GREEN})`, transform: `scaleX(${s})`, opacity: 0.95 }} />;
  };
  const grid: [string, number, number, [number, number], number, number][] = [
    ["A_q10", 250, 1075, [190, 290], 0.15, -3], ["A_slimis", 540, 1075, [250, 260], 0.40, 2], ["A_collagen", 830, 1075, [240, 250], 0.65, 3],
    ["A_microshapper", 250, 1450, [240, 240], 0.95, -2], ["A_magnesium", 540, 1450, [260, 220], 1.25, 2], ["A_nutrilegs", 830, 1450, [100, 290], 1.55, 4]];
  const disc = spring({ frame: f - S(14.95 - T.k2b), fps, config: { damping: 9, stiffness: 180 } });
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${WHITE} 0%, ${MINT} 100%)` }}>
    <H size={66} style={{ position: "absolute", left: 100, right: 135, top: 432, opacity: ip(f, [0, 12], [0, 1]) }}>{W(tx, 0, 2)}</H>
    <H size={66} style={{ position: "absolute", left: 100, right: 135, top: 504, opacity: ip(f, [10, 22], [0, 1]) }}>{W(tx, 2, 4)}</H>
    <div style={{ position: "absolute", left: 100, right: 135, top: 584, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: ip(f, [S(2.1), S(2.1) + 12], [0, 1]) }}>
      <H size={64} color={GREEN}>{W(tx, 4, 7)}</H>
      <div style={{ transform: `scale(${0.3 + 0.7 * disc}) rotate(-4deg)`, opacity: disc > 0.02 ? 1 : 0 }}><Pill style={{ fontSize: 84, padding: "6px 30px" }}>{W(tx, 7)}</Pill></div>
    </div>
    {grid.map(([id, x, y, b, d, r]) => <React.Fragment key={id}>{pl(x, y, d)}<Stk id={id} cx={x} by={y} box={b} at={d} rot={r} /></React.Fragment>)}
  </AbsoluteFill>);
};

// K2c: "in še izberite svoja brezplačna darila." -> GROUP B gift B-roll (Hair.O)
const K2c: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const dur = T.k3 - T.k2c;
  const sp = spring({ frame: f - 3, fps, config: { damping: 13, stiffness: 160 } });
  const tx = W(COPY.k2b, 8);
  return (<AbsoluteFill>
    <Broll src="g_hairo_leaves.mp4" rate={1} startFrom={S(1.4)} dur={dur} zoom={[1.0, 1.05]} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.6) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1250, transform: `translateY(${(1 - sp) * 24}px)`, opacity: sp > 0.02 ? 1 : 0,
      background: WHITE, borderRadius: 34, padding: "26px 30px 30px", boxShadow: "0 24px 44px rgba(0,0,0,0.30)" }}>
      <H size={60}>{W(tx, 0, 4)}</H>
      <H size={72} color={RED} style={{ marginTop: 6 }}>{W(tx, 4)}</H>
      <Bow size={110} style={{ position: "absolute", right: 4, top: -56, transform: `rotate(14deg) scale(${spring({ frame: f - 24, fps, config: { damping: 8, stiffness: 200 } })})` }} />
    </div>
  </AbsoluteFill>);
};

// K3: "MI PODARIMO, VI IZBERETE!" + tiers -> GROUP B gift stickers, n gifts chosen per tier
const K3: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = T.k3;
  const tiers = [T.tier1, T.tier2, T.tier3].map((x) => x - t0);
  const n = tiers.filter((x) => f >= S(x)).length; // gifts chosen so far
  const gifts: [string, number, number, [number, number], number][] = [
    ["B_sunrise", 250, 1215, [230, 170], -3], ["B_triple", 540, 1215, [110, 200], 2], ["B_hairo", 830, 1215, [70, 200], 4],
    ["B_gel", 250, 1475, [120, 200], -2], ["B_sunkissed", 540, 1475, [70, 200], 3], ["B_celuline", 830, 1475, [80, 200], -3]];
  const pick = [0, 4, 1]; // the order in which gifts get chosen (1, then 2, then 3)
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${MINT} 0%, ${WHITE} 45%, ${MINT} 100%)` }}>
    <Confetti seed={5} n={12} />
    <Slam text={W(COPY.k3a, 0, 2)} at={0.05} size={88} color={GREEN} top={430} gap={0.16} />
    <Slam text={W(COPY.k3a, 2)} at={1.15} size={88} color={RED} top={524} gap={0.16} />
    {COPY.k3t.map((t, i) => {
      const a = spring({ frame: f - S(0.35 + i * 0.12), fps, config: { damping: 14, stiffness: 170 } });
      const on = f >= S(tiers[i]); const hl = spring({ frame: f - S(tiers[i]), fps, config: { damping: 10, stiffness: 200 } });
      const [lhs, rhs] = t.split(" → ");
      return (<div key={i} style={{ position: "absolute", left: 120, width: 805, top: 640 + i * 110, height: 96, borderRadius: 26, display: "flex", alignItems: "center",
        opacity: Math.min(1, a * 1.4), background: on ? WHITE : "rgba(255,255,255,0.85)", border: `5px solid ${on ? RED : "rgba(15,107,62,0.35)"}`, boxShadow: on ? "0 16px 30px rgba(227,25,44,0.22)" : "0 8px 16px rgba(30,39,35,0.10)",
        transform: `translateX(${(1 - a) * 60}px) scale(${1 + (on ? 0.04 * (1 - Math.abs(1 - hl)) + 0.02 : 0)})` }}>
        <div style={{ width: 330, height: "100%", borderRadius: "20px 0 0 20px", background: on ? GREEN : "rgba(15,107,62,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <H size={56} color={WHITE}>{lhs}</H></div>
        <H size={58} color={GREEN} style={{ width: 90 }}>→</H>
        <H size={60} color={on ? RED : INK} style={{ flex: 1, textAlign: "left" }}>{rhs}</H>
      </div>);
    })}
    {gifts.map(([id, x, y, b, r], i) => {
      const k = pick.indexOf(i); const chosen = k >= 0 && k < n;
      const lift = chosen ? 30 * spring({ frame: f - S(tiers[k]), fps, config: { damping: 9, stiffness: 180 } }) : 0;
      return <Stk key={id} id={id} cx={x} by={y} box={b} at={0.9 + i * 0.12} rot={r} lift={lift} ring={chosen ? ip(f, [S(tiers[k]), S(tiers[k]) + 12], [0, 1]) : 0} />;
    })}
  </AbsoluteFill>);
};

// K4: voucher (-25% on the next purchase) over an authentic Biostile photo (regular product, blurred)
const K4: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = T.k4;
  const tk = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 120 } });
  const stamp = spring({ frame: f - S(1.15), fps, config: { damping: 8, stiffness: 220 } });
  const kup = spring({ frame: f - S(T.kupon - t0), fps, config: { damping: 14, stiffness: 160 } });
  const shine = ip(f, [S(1.8), S(2.6)], [-40, 140], eio);
  return (<AbsoluteFill>
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img src={staticFile("bf02v2/img/A_q10_marble.jpg")} style={{ position: "absolute", height: "100%", left: "50%", transform: `translateX(-50%) scale(${1.08 + f / 3000})`, filter: "blur(3px) saturate(0.95)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(234,244,238,0.35) 45%, rgba(15,107,62,0.55) 100%)" }} />
    </AbsoluteFill>
    <Slam text={W(COPY.k4a, 0, 3)} at={0.1} size={88} color={GREEN} top={446} gap={0.12} />
    {/* coupon ticket */}
    <div style={{ position: "absolute", left: 110, width: 825, top: 560, height: 460, transform: `translateX(${(1 - tk) * 1100}px) rotate(${-3 + (1 - tk) * 14}deg)`, opacity: tk > 0.02 ? 1 : 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: WHITE, boxShadow: "0 34px 60px rgba(10,79,45,0.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 150, background: `linear-gradient(180deg, ${GREEN}, ${GREEN2})` }} />
        <div style={{ position: "absolute", left: 150, top: 26, bottom: 26, borderLeft: `8px dotted ${MINT}` }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", border: `8px solid ${WHITE}` }} /></div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: 120, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))", transform: "skewX(-16deg)" }} />
      </div>
      {[-1, 1].map((s) => <div key={s} style={{ position: "absolute", left: 128, top: s < 0 ? -22 : 438, width: 44, height: 44, borderRadius: "50%", background: "rgba(220,235,226,1)" }} />)}
      <div style={{ position: "absolute", left: 170, right: 20, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.4 + 0.6 * stamp}) rotate(${-4 + (1 - stamp) * 10}deg)`, opacity: stamp > 0.02 ? 1 : 0 }}>
        <H size={182} color={RED} style={{ letterSpacing: -6, whiteSpace: "nowrap" }}>{W(COPY.k4a, 3)}</H>
      </div>
    </div>
    <div style={{ position: "absolute", left: 100, width: 845, top: 1080, transform: `translateY(${(1 - kup) * 160}px)`, opacity: kup > 0.02 ? 1 : 0,
      background: WHITE, borderRadius: 30, padding: "26px 30px", boxShadow: "0 20px 40px rgba(10,79,45,0.30)", borderTop: `10px solid ${RED}` }}>
      <H size={54} style={{ whiteSpace: "nowrap" }}>{W(COPY.k4b, 0, 4)}</H>
      <H size={54} color={GREEN} style={{ marginTop: 6, whiteSpace: "nowrap" }}>{W(COPY.k4b, 4)}</H>
    </div>
  </AbsoluteFill>);
};

// K5: final CTA - two separate showcases: GROUP A on a green plinth, GROUP B as wrapped gifts with bows
const K5: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = T.k5;
  const cta = spring({ frame: f - S(T.cta - t0), fps, config: { damping: 9, stiffness: 170 } });
  const pulse = f > S(T.cta - t0) + 30 ? 1 + 0.035 * Math.sin((f - S(T.cta - t0)) / 7) : 1;
  const shA = spring({ frame: f - S(0.5), fps, config: { damping: 14, stiffness: 140 } });
  const shB = spring({ frame: f - S(1.3), fps, config: { damping: 14, stiffness: 140 } });
  const A: [string, number, [number, number]][] = [["A_q10", 175, [95, 180]], ["A_slimis", 300, [130, 160]], ["A_collagen", 440, [135, 140]], ["A_microshapper", 590, [145, 140]], ["A_magnesium", 750, [165, 120]], ["A_nutrilegs", 880, [55, 185]]];
  const B: [string, number, [number, number]][] = [["B_sunrise", 190, [165, 120]], ["B_triple", 340, [75, 175]], ["B_hairo", 470, [55, 180]], ["B_gel", 600, [95, 175]], ["B_sunkissed", 730, [58, 180]], ["B_celuline", 860, [65, 180]]];
  return (<AbsoluteFill style={{ background: `linear-gradient(180deg, ${WHITE} 0%, ${MINT} 60%, ${WHITE} 100%)` }}>
    <Confetti seed={9} n={16} />
    <Slam text={W(COPY.k5a, 0, 2)} at={0.05} size={96} color={RED} top={428} gap={0.12} />
    <Slam text={W(COPY.k5a, 2, 5)} at={0.4} size={62} color={INK} top={532} gap={0.1} />
    <Slam text={W(COPY.k5a, 5)} at={0.75} size={62} color={GREEN} top={598} gap={0.1} />
    {/* showcase A */}
    <div style={{ position: "absolute", left: 100, width: 845, top: 690, height: 260, borderRadius: 34, background: `linear-gradient(180deg, ${GREEN} 0%, ${GREEN2} 100%)`, transform: `scale(${0.85 + 0.15 * shA})`, opacity: shA > 0.02 ? 1 : 0, boxShadow: "0 22px 40px rgba(10,79,45,0.30)" }}>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, height: 16, borderRadius: 9, background: "rgba(255,255,255,0.22)" }} />
    </div>
    {A.map(([id, x, b], i) => <Stk key={id} id={id} cx={x} by={922} box={b} at={0.7 + i * 0.08} float={0.5} />)}
    {/* showcase B: gifts */}
    <div style={{ position: "absolute", left: 100, width: 845, top: 970, height: 270, borderRadius: 34, background: WHITE, border: `6px solid ${RED}`, transform: `scale(${0.85 + 0.15 * shB})`, opacity: shB > 0.02 ? 1 : 0, boxShadow: "0 22px 40px rgba(227,25,44,0.18)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 22, background: "rgba(227,25,44,0.12)" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 22, background: "rgba(227,25,44,0.12)" }} />
    </div>
    {B.map(([id, x, b], i) => <Stk key={id} id={id} cx={x} by={1218} box={b} at={1.5 + i * 0.08} float={0.5} />)}
    {/* CTA */}
    <div style={{ position: "absolute", left: 100, width: 845, top: 1272, display: "flex", justifyContent: "center", transform: `scale(${(0.3 + 0.7 * cta) * pulse})`, opacity: cta > 0.02 ? 1 : 0 }}>
      <Pill style={{ fontSize: 58, padding: "14px 40px", textAlign: "center", lineHeight: 1.05, width: 800 }}>{COPY.k5b}</Pill>
    </div>
  </AbsoluteFill>);
};

const SCENES: [React.FC, number, number][] = [
  [K1a, T.k1a, T.k1b], [K1b, T.k1b, T.k1q], [K1q, T.k1q, T.k2a], [K2a, T.k2a, T.k2b], [K2b, T.k2b, T.k2c], [K2c, T.k2c, T.k3],
  [K3, T.k3, T.k4], [K4, T.k4, T.k5], [K5, T.k5, T.end]];

// QC text-only mode: hides images, video, svg, backgrounds, borders and shadows so only glyphs remain (safe-zone scan)
const QC_CSS = `html,body{background:#000!important} *{background:transparent!important;box-shadow:none!important;border-color:transparent!important;filter:none!important;-webkit-text-stroke:0!important} img,video,svg{visibility:hidden!important}`;
export const BF02v2: React.FC<{ qcText?: boolean }> = ({ qcText }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const fadeOut = ip(f, [S(T.end) - 20, S(T.end)], [0, 1], (x) => x);
  return (<AbsoluteFill style={{ background: WHITE }}>
    {qcText ? <style>{QC_CSS}</style> : null}
    {SCENES.map(([C, a, b], i) => <Sequence key={i} from={S(a)} durationInFrames={S(b) - S(a)}><C /></Sequence>)}
    {SCENES.slice(1).map(([, a], i) => <Wipe key={i} at={a} />)}
    <AbsoluteFill style={{ background: WHITE, opacity: fadeOut * 0 }} />
  </AbsoluteFill>);
};
