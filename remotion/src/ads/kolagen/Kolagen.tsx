import React from "react";
import { LightLeak } from "@remotion/light-leaks";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../../lib/anim";
import { DirBlur } from "../../lib/DirBlur";
import { BODY, HERO, K, RENATA_THEME } from "../../captions/themes/renata";
import "../../captions/themes/renata";
import { HOOK_CUT, PHRASES, STILLS, type CW, type Phrase } from "./data";

/**
 * "Coral Luminance": overlay for the Renata KOLAGEN edit.
 * Rules: every text element = smooth entrance (0.3-0.5 s) -> readable hold -> smooth exit.
 * All text inside the 1:1 square (y 420-1500). Glow sits behind sharp letters; letters never blur at rest.
 */

const IVORY_SHADOW = "0 2px 18px rgba(56,39,48,0.6), 0 1px 3px rgba(56,39,48,0.65)";
const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { f, t: f / fps, fps };
};

/** Entrance/exit envelope. pin, pout: 0..1. vis false outside [a, b]. */
const env = (t: number, a: number, b: number, inD = 0.4, outD = 0.3) => ({
  vis: t >= a && t <= b,
  pin: ip(t, [a, a + inD], [0, 1], E.outQuart),
  pout: ip(t, [b - outD, b], [0, 1], E.inOutCubic),
});

/* ---------- luminous hero word ---------- */

const GlowWord: React.FC<{
  text: string;
  size: number;
  bloom?: number; // 0..1.4 glow intensity
  weight?: number;
  tracking?: string;
  sweep?: number; // -1..2 position of a light sweep across the letters (optional)
  style?: React.CSSProperties;
}> = ({ text, size, bloom = 1, weight = 900, tracking = "-0.035em", sweep, style }) => {
  const base: React.CSSProperties = {
    fontFamily: HERO,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: tracking,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  const layer: React.CSSProperties = { ...base, position: "absolute", left: 0, top: 0 };
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {/* depth shadow so the word holds on bright footage */}
      <div style={{ ...layer, color: K.plum, filter: "blur(16px)", opacity: 0.55, transform: "translateY(8px)" }}>{text}</div>
      {/* wide ambient bloom + tight glow */}
      <div style={{ ...layer, color: K.coral, filter: `blur(${size * 0.2}px)`, opacity: 0.62 * bloom }}>{text}</div>
      <div style={{ ...layer, color: "#FF9C84", filter: `blur(${size * 0.05}px)`, opacity: 0.7 * bloom }}>{text}</div>
      {/* sharp luminous letters */}
      <div
        style={{
          ...base,
          position: "relative",
          backgroundImage: RENATA_THEME.gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {text}
      </div>
      {sweep !== undefined && sweep > -0.5 && sweep < 1.5 ? (
        <div
          style={{
            ...layer,
            backgroundImage: `linear-gradient(105deg, transparent ${(sweep - 0.18) * 100}%, rgba(255,250,244,0.85) ${sweep * 100}%, transparent ${(sweep + 0.18) * 100}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};

/** Masked rise: content rises from behind a baseline mask, with vertical motion blur; the mask opens after. */
const MaskRise: React.FC<{ t: number; at: number; dur?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  t,
  at,
  dur = 0.45,
  dist = 1,
  children,
  style,
}) => {
  const y = (tt: number) => ip(tt, [at, at + dur], [100 * dist, 0], E.outExpo);
  const scale = ip(t, [at, at + dur], [1.06, 1], E.outExpo);
  const clipB = ip(t, [at, at + dur * 0.9], [0, -160], E.inOutCubic);
  const vy = (y(t) - y(t - 1 / 30)) * 1.0;
  return (
    <div style={{ ...style, clipPath: `inset(-200px -200px ${clipB}px -200px)` }}>
      <DirBlur vy={vy} strength={0.45}>
        <div style={{ transform: `translateY(${y(t)}%) scale(${scale})`, transformOrigin: "50% 100%", opacity: ip(t, [at, at + 0.12], [0, 1]) }}>{children}</div>
      </DirBlur>
    </div>
  );
};

/** Smooth exit wrapper: fade + slight lift + soft blur. */
const Exit: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ ...style, opacity: 1 - p, transform: `translateY(${-18 * p}px) scale(${1 - 0.02 * p})`, filter: p > 0.01 ? `blur(${8 * p}px)` : undefined }}>
    {children}
  </div>
);

const ivory = (size: number, weight = 800, family = HERO, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: family,
  fontWeight: weight,
  fontSize: size,
  color: K.ivory,
  textShadow: IVORY_SHADOW,
  lineHeight: 1.05,
  whiteSpace: "nowrap",
  ...extra,
});

const FadeRise: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, dur = 0.4, children, style }) => {
  const p = ip(t, [at, at + dur], [0, 1], E.outQuart);
  return <div style={{ ...style, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: p < 0.99 ? `blur(${(1 - p) * 6}px)` : undefined }}>{children}</div>;
};

/* ---------- glowing tracked ring (depth only: passes behind Renata) ---------- */

const HaloRing: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  if (t < a || t > b) return null;
  const draw = ip(t, [a, a + 0.9], [0, 1], E.inOutCubic);
  const out = ip(t, [b - 0.25, b], [0, 1]);
  const rot = -14 + (t - a) * 4;
  const C = 2 * Math.PI * Math.sqrt((235 ** 2 + 120 ** 2) / 2);
  const ring = (w: number, blur: number, color: string, op: number) => (
    <ellipse
      cx={0}
      cy={0}
      rx={235}
      ry={120}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeDasharray={C}
      strokeDashoffset={C * (1 - draw)}
      style={{ filter: blur ? `blur(${blur}px)` : undefined }}
      opacity={op}
      strokeLinecap="round"
    />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - out }}>
      <g transform={`translate(868 588) rotate(${rot})`}>
        {ring(14, 12, K.coral, 0.55)}
        {ring(5, 3, "#FFB49C", 0.7)}
        {ring(2.2, 0, K.gold, 1)}
      </g>
    </svg>
  );
};

/* ---------- scenes ---------- */

const Hook: React.FC<{ t: number; depth: boolean }> = ({ t, depth }) => {
  const a = 0;
  const b = HOOK_CUT / 30 - 0.01;
  if (t > b) return null;
  const pout = ip(t, [b - 0.22, b], [0, 1], E.inOutCubic);
  const bloom = ip(t, [1.45, 1.6, 2.0], [0.8, 1.35, 0.95], E.inOutCubic);
  const size = depth ? 182 : 150;
  return (
    <Exit p={pout} style={{ position: "absolute", inset: 0 }}>
      <FadeRise t={t} at={a + 0.12} style={{ position: "absolute", left: 66, top: 438 }}>
        <div style={ivory(66, 800, HERO, { letterSpacing: "-0.02em" })}>moj poletni</div>
      </FadeRise>
      <MaskRise t={t} at={0.55} dur={0.5} style={{ position: "absolute", left: 56, top: 508 }}>
        <GlowWord text="FAVORIT" size={size} bloom={bloom} />
      </MaskRise>
    </Exit>
  );
};

const ProductTitle: React.FC<{ t: number }> = ({ t }) => {
  const a = 6.08;
  const b = 8.88;
  if (t < a || t > b) return null;
  const { pout } = env(t, a, b, 0.4, 0.3);
  const line = ip(t, [6.55, 7.05], [0, 1], E.inOutCubic);
  const bloom = ip(t, [6.25, 6.45, 7.0], [0.7, 1.3, 0.95], E.inOutCubic);
  const sweep = ip(t, [6.85, 7.6], [-0.4, 1.4], E.inOutCubic);
  return (
    <Exit p={pout} style={{ position: "absolute", left: 0, right: 0, top: 952, textAlign: "center" }}>
      <MaskRise t={t} at={a + 0.06} dur={0.45} style={{ display: "inline-block" }}>
        <GlowWord text="KOLAGEN" size={172} bloom={bloom} sweep={sweep} />
      </MaskRise>
      <div style={{ height: 2, width: 560 * line, margin: "16px auto 0", background: `linear-gradient(90deg, transparent, ${K.gold}, transparent)` }} />
      <FadeRise t={t} at={6.62}>
        <div style={ivory(38, 600, BODY, { marginTop: 14, letterSpacing: "0.01em" })}>
          Collagen Powder{" "}
          <span
            style={{
              color: K.peachLight,
              backgroundImage: `linear-gradient(90deg, ${K.coral}, ${K.gold})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 100%",
              backgroundSize: `${ip(t, [7.0, 7.45], [0, 100], E.inOutCubic)}% 3px`,
              paddingBottom: 4,
            }}
          >
            + Hyaluronic Acid
          </span>
        </div>
      </FadeRise>
      <FadeRise t={t} at={7.05}>
        <div style={ivory(32, 600, BODY, { marginTop: 10, color: K.rose, letterSpacing: "0.02em" })}>6 vrst kolagena · več kot 8600 mg</div>
      </FadeRise>
    </Exit>
  );
};

/** Gold ring locked on the "6 vrst kolagena" crest of the box (static tripod shot 6.1-8.9 s) + arrow from the label. */
const CrestCallout: React.FC<{ t: number }> = ({ t }) => {
  const a = 7.1;
  const b = 8.88;
  if (t < a || t > b) return null;
  const out = ip(t, [b - 0.3, b], [0, 1], E.inOutCubic);
  const ring = ip(t, [a + 0.05, a + 0.6], [0, 1], E.inOutCubic);
  const arrow = ip(t, [a, a + 0.5], [0, 1], E.inOutCubic);
  const head = ip(t, [a + 0.42, a + 0.6], [0, 1], E.outQuart);
  const R = 82;
  const C = 2 * Math.PI * R;
  const path = "M 262 1238 C 40 1215, 40 770, 318 652";
  const L = 720;
  const glow = (w: number, blur: number, color: string, op: number, kind: "ring" | "arrow") =>
    kind === "ring" ? (
      <circle cx={380} cy={590} r={R} fill="none" stroke={color} strokeWidth={w} opacity={op} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform="rotate(-100 380 590)" strokeLinecap="round" style={{ filter: blur ? `blur(${blur}px)` : undefined }} />
    ) : (
      <path d={path} fill="none" stroke={color} strokeWidth={w} opacity={op} strokeDasharray={L} strokeDashoffset={L * (1 - arrow)} strokeLinecap="round" style={{ filter: blur ? `blur(${blur}px)` : undefined }} />
    );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - out }}>
      {glow(22, 14, K.coral, 0.75, "ring")}
      {glow(7, 3, "#FFB49C", 0.9, "ring")}
      {glow(3.5, 0, K.ivory, 1, "ring")}
      {glow(16, 10, K.coral, 0.6, "arrow")}
      {glow(4, 0, K.ivory, 1, "arrow")}
      <g transform="translate(318 652) rotate(-62)" opacity={head}>
        <path d="M -20 16 L 0 0 L 20 16" fill="none" stroke={K.coral} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "blur(6px)" }} opacity={0.6} />
        <path d="M -20 16 L 0 0 L 20 16" fill="none" stroke={K.ivory} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const FromWithin: React.FC<{ t: number }> = ({ t }) => {
  const a = 9.64;
  const b = 10.85;
  if (t < a || t > b) return null;
  const { pout } = env(t, a, b, 0.4, 0.28);
  const bloom = ip(t, [9.95, 10.1, 10.5], [0.75, 1.3, 1], E.inOutCubic);
  return (
    <Exit p={pout} style={{ position: "absolute", left: 0, right: 0, top: 1052, textAlign: "center" }}>
      <FadeRise t={t} at={a}>
        <div style={ivory(64, 800, HERO, { letterSpacing: "-0.02em" })}>tudi</div>
      </FadeRise>
      <MaskRise t={t} at={9.82} dur={0.42} style={{ display: "inline-block", marginTop: 6 }}>
        <GlowWord text="OD ZNOTRAJ." size={130} bloom={bloom} />
      </MaskRise>
    </Exit>
  );
};

const VitaminC: React.FC<{ t: number }> = ({ t }) => {
  const a = 11.12;
  const b = 14.08;
  if (t < a || t > b) return null;
  const { pin, pout } = env(t, a, b, 0.5, 0.3);
  const ringDraw = ip(t, [a + 0.15, a + 0.85], [0, 1], E.inOutCubic);
  const C = 2 * Math.PI * 38;
  return (
    <Exit p={pout} style={{ position: "absolute", left: 66, right: 66, top: 1062 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "30px 36px",
          borderRadius: 30,
          background: "linear-gradient(135deg, rgba(56,39,48,0.86), rgba(56,39,48,0.74))",
          boxShadow: "0 20px 60px rgba(56,39,48,0.35), inset 0 0 0 1.5px rgba(215,168,117,0.55)",
          clipPath: `inset(0 ${(1 - pin) * 100}% 0 0 round 30px)`,
          transform: `scale(${0.97 + 0.03 * pin})`,
        }}
      >
        <svg width={96} height={96} viewBox="-48 -48 96 96" style={{ flex: "none" }}>
          <circle r={38} fill="none" stroke={K.coral} strokeWidth={8} opacity={0.35} style={{ filter: "blur(6px)" }} strokeDasharray={C} strokeDashoffset={C * (1 - ringDraw)} />
          <circle r={38} fill="none" stroke={K.gold} strokeWidth={2.4} strokeDasharray={C} strokeDashoffset={C * (1 - ringDraw)} transform="rotate(-90)" />
          <text x={0} y={17} textAnchor="middle" fontFamily={HERO} fontWeight={900} fontSize={50} fill={K.coral}>
            C
          </text>
        </svg>
        <div>
          <FadeRise t={t} at={a + 0.25}>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: K.ivory }}>
              <span style={{ color: K.coral }}>Vitamin C</span> prispeva k normalnemu nastajanju kolagena za normalno delovanje kože, kosti in hrustanca.
            </div>
          </FadeRise>
          <FadeRise t={t} at={a + 0.55}>
            <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 24, marginTop: 10, color: K.rose, letterSpacing: "0.02em" }}>vitamin C iz izvlečka šipka</div>
          </FadeRise>
        </div>
      </div>
    </Exit>
  );
};

/** Original vector sticker of one sachet (not the real packaging: a neutral icon). */
const Sachet: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const sway = Math.sin((t - at) * 2.4) * 3;
  const pop = ip(t, [at, at + 0.45], [0.85, 1], E.backOut);
  return (
    <svg width={96} height={150} viewBox="0 0 96 150" style={{ transform: `rotate(${10 + sway}deg) scale(${pop})`, filter: "drop-shadow(0 8px 18px rgba(56,39,48,0.45)) drop-shadow(0 0 14px rgba(255,134,109,0.35))" }}>
      <rect x={10} y={8} width={76} height={134} rx={10} fill={K.ivory} />
      <path d="M10 22 h76" stroke={K.gold} strokeWidth={2} strokeDasharray="4 4" />
      <rect x={10} y={70} width={76} height={34} fill={K.coral} />
      <text x={48} y={94} textAnchor="middle" fontFamily={HERO} fontWeight={900} fontSize={22} fill={K.ivory}>1×</text>
      <circle cx={48} cy={48} r={11} fill="none" stroke={K.gold} strokeWidth={2.5} />
    </svg>
  );
};

const OneSachet: React.FC<{ t: number }> = ({ t }) => {
  const a = 17.95;
  const b = 19.86;
  if (t < a || t > b) return null;
  const { pout } = env(t, a, b, 0.4, 0.26);
  const bloom = ip(t, [a + 0.2, a + 0.4, a + 0.9], [0.7, 1.25, 0.95], E.inOutCubic);
  return (
    <Exit p={pout} style={{ position: "absolute", left: 70, top: 446 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <MaskRise t={t} at={a} dur={0.45}>
          <GlowWord text="1" size={230} bloom={bloom} tracking="0" />
        </MaskRise>
        <div>
          <FadeRise t={t} at={a + 0.15}>
            <div style={ivory(70, 800, HERO, { letterSpacing: "-0.02em" })}>vrečka</div>
          </FadeRise>
          <FadeRise t={t} at={a + 0.27}>
            <div style={ivory(70, 800, HERO, { letterSpacing: "-0.02em", color: K.rose })}>na dan</div>
          </FadeRise>
        </div>
        <FadeRise t={t} at={a + 0.38} style={{ marginLeft: 6 }}>
          <Sachet t={t} at={a + 0.38} />
        </FadeRise>
      </div>
      <FadeRise t={t} at={a + 0.42}>
        <div style={ivory(32, 600, BODY, { marginTop: 8, letterSpacing: "0.01em" })}>v vodo ali najljubšo pijačo</div>
      </FadeRise>
    </Exit>
  );
};

const Persist: React.FC<{ t: number }> = ({ t }) => {
  const a = 24.42;
  const b = 25.98;
  if (t < a || t > b) return null;
  const { pout } = env(t, a, b, 0.4, 0.3);
  const bloom = ip(t, [24.85, 25.05, 25.5], [0.75, 1.35, 1.05], E.inOutCubic);
  return (
    <Exit p={pout} style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center" }}>
      <FadeRise t={t} at={a}>
        <div style={ivory(66, 800, HERO, { letterSpacing: "-0.02em" })}>res</div>
      </FadeRise>
      <MaskRise t={t} at={24.74} dur={0.45} style={{ display: "inline-block", marginTop: 4 }}>
        <GlowWord text="VZTRAJAM." size={150} bloom={bloom} />
      </MaskRise>
      <svg width={760} height={60} viewBox="0 0 760 60" style={{ display: "block", margin: "-4px auto 0" }}>
        {[
          [12, 9, K.coral, 0.5],
          [4, 0, K.gold, 1],
        ].map(([w, bl, c, o], i) => (
          <path
            key={i}
            d="M 30 34 C 200 14, 420 12, 730 26"
            fill="none"
            stroke={c as string}
            strokeWidth={w as number}
            opacity={o as number}
            strokeLinecap="round"
            strokeDasharray={760}
            strokeDashoffset={760 * (1 - ip(t, [25.05, 25.5], [0, 1], E.inOutCubic))}
            style={{ filter: bl ? `blur(${bl}px)` : undefined }}
          />
        ))}
      </svg>
    </Exit>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = 25.8;
  if (t < a) return null;
  const shade = ip(t, [a, a + 0.5], [0, 1], E.inOutCubic);
  const bloom = ip(t, [26.3, 26.5, 27.1], [0.7, 1.3, 1], E.inOutCubic);
  const sweep = ip(t, [27.2, 28.0], [-0.4, 1.4], E.inOutCubic);
  return (
    <>
      <AbsoluteFill style={{ opacity: shade, background: "linear-gradient(180deg, rgba(56,39,48,0.62) 0%, rgba(56,39,48,0.5) 28%, rgba(56,39,48,0) 46%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 432, textAlign: "center" }}>
        <FadeRise t={t} at={26.0}>
          <div style={ivory(42, 600, BODY, { letterSpacing: "0.01em" })}>Odkrij več na</div>
        </FadeRise>
        <MaskRise t={t} at={26.15} dur={0.45} style={{ display: "inline-block", marginTop: 8 }}>
          <GlowWord text="biostile.si" size={124} bloom={bloom} sweep={sweep} tracking="-0.03em" />
        </MaskRise>
      </div>
    </>
  );
};

/* ---------- phrase captions with progressive highlight ---------- */

const Word: React.FC<{ w: CW; next?: CW; t: number }> = ({ w, next, t }) => {
  const [text, s, e, flag] = w;
  const end = e ?? next?.[1] ?? s + 0.3;
  const active = t >= s && t < Math.max(end, next ? next[1] : end);
  const spoken = t >= s;
  const k = ip(t, [s - 0.02, s + 0.12], [0, 1], E.outQuart);
  const isKey = flag === "k" || flag === "n";
  const coral = isKey ? k : active ? k : 0;
  const color = coral > 0.5 ? K.coral : K.ivory;
  const glow = coral * (isKey ? 1 : 0.6);
  const size = flag === "n" ? 1.55 : 1;
  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 0.13em",
        color,
        opacity: spoken ? 1 : 0.8,
        fontSize: `${size}em`,
        fontFamily: flag === "n" ? HERO : undefined,
        fontWeight: flag === "n" ? 900 : undefined,
        lineHeight: flag === "n" ? 0.9 : undefined,
        transform: `translateY(${flag === "n" ? 0.06 : 0}em) scale(${1 + 0.04 * (active ? k : 0)})`,
        textShadow:
          glow > 0.02
            ? `0 0 ${18 * glow}px rgba(255,134,109,${0.75 * glow}), 0 0 ${42 * glow}px rgba(255,134,109,${0.45 * glow}), ${IVORY_SHADOW}`
            : IVORY_SHADOW,
      }}
    >
      {text}
    </span>
  );
};

const Captions: React.FC<{ t: number }> = ({ t }) => {
  const ph: Phrase | undefined = PHRASES.find((p) => t >= p.a && t < p.b);
  if (!ph) return null;
  const pin = ip(t, [ph.a, ph.a + 0.3], [0, 1], E.outQuart);
  const pout = ip(t, [ph.b - 0.2, ph.b], [0, 1], E.inOutCubic);
  // phrases that follow each other directly swap without an exit, so the line never blinks
  const nextStartsNow = PHRASES.some((p) => Math.abs(p.a - ph.b) < 0.01);
  const out = nextStartsNow ? 0 : pout;
  const prevEndsNow = PHRASES.some((p) => Math.abs(p.b - ph.a) < 0.01);
  const rise = prevEndsNow ? ip(t, [ph.a, ph.a + 0.22], [0, 1], E.outQuart) : pin;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1350,
        textAlign: "center",
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 60,
        lineHeight: 1.18,
        letterSpacing: "-0.005em",
        opacity: Math.min(rise, 1 - out),
        transform: `translateY(${(1 - rise) * 22 - out * 10}px)`,
        filter: rise < 0.99 || out > 0.01 ? `blur(${(1 - rise) * 5 + out * 6}px)` : undefined,
      }}
    >
      {ph.words.map((w, i) => (
        <Word key={i} w={w} next={ph.words[i + 1]} t={t} />
      ))}
    </div>
  );
};

/* ---------- depth: Renata cut-out above the hook type ---------- */

const DepthCutout: React.FC<{ f: number }> = ({ f }) => {
  if (f >= HOOK_CUT) return null;
  return <Img src={staticFile(`kolagen-depth/${String(f).padStart(4, "0")}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />;
};

/* ---------- composition ---------- */

export type KolagenProps = { preview?: boolean; depth?: boolean; safe?: boolean };

export const Kolagen: React.FC<KolagenProps> = ({ preview = false, depth = false, safe = false }) => {
  const { f, t } = useT();
  const still = preview ? [...STILLS].reverse().find(([s]) => t >= s)?.[1] : undefined;
  return (
    <AbsoluteFill>
      {still ? <Img src={staticFile(`kolagen-preview/${still}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, objectFit: "cover" }} /> : null}
      {depth ? <HaloRing t={t} a={0.35} b={HOOK_CUT / 30 - 0.01} /> : null}
      {f < 50 ? (
        <AbsoluteFill style={{ opacity: ip(t, [0, 0.3, 1.2, 1.66], [0, 0.42, 0.3, 0]), mixBlendMode: "screen" }}>
          <LightLeak durationInFrames={50} seed={7} hueShift={342} />
        </AbsoluteFill>
      ) : null}
      <Hook t={t} depth={depth} />
      {depth ? <DepthCutout f={f} /> : null}
      <ProductTitle t={t} />
      <CrestCallout t={t} />
      <FromWithin t={t} />
      <VitaminC t={t} />
      <OneSachet t={t} />
      <Persist t={t} />
      <EndCard t={t} />
      <Captions t={t} />
      {safe ? <div style={{ position: "absolute", left: 0, right: 0, top: 420, height: 1080, outline: "3px dashed rgba(0,255,255,0.8)" }} /> : null}
    </AbsoluteFill>
  );
};
