import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { clean, isActive, isNumber, pageAt, pages, W } from "./core";
import { useCaptionTheme } from "./theme";

/**
 * Caption treatments. Pure technique: every colour, font and motion amount
 * comes from the project's CaptionTheme, and `lead` is the accent that leads
 * this moment. Times are clip seconds; frame 0 of the Sequence = clipStart.
 */
export type CaptionProps = {
  words: W[];
  clipStart: number;
  keywords?: string[];
  lead: string;
  y?: number;
  size?: number;
};

const useClock = (clipStart: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: clipStart + frame / fps, frame, fps };
};
const lf0 = (sec: number, clipStart: number, fps: number) => (sec - clipStart) * fps;
const gradText = (g: string): React.CSSProperties => ({ color: "transparent", backgroundImage: g, WebkitBackgroundClip: "text", backgroundClip: "text" });
const usePage = (words: W[], max: number, clipStart: number) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, max);
  const pi = pageAt(ps, t);
  const page = ps[pi];
  const visible = !!page && t >= page[0][1] - 0.06;
  return { t, frame, fps, pi, page, visible };
};

/* 1. STOMP: words slam in on their syllable with squash, smear and a ring. */
export const StompCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 318, size = 176 }) => {
  const th = useCaptionTheme();
  const { frame, fps, page, visible } = usePage(words, 2, clipStart);
  if (!visible) return null;
  const e = th.motion.energy;
  const from = 1.6 + e * 1.4;
  const fitted = Math.min(size, 980 / Math.max(page.map((p) => p[0]).join(" ").length * 0.58, 1));
  const D = th.fonts.display;
  return (
    <div style={{ position: "absolute", top: y, left: 40, right: 40, height: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }}>
      {page.map(([w, s], i) => {
        const lf = frame - lf0(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const key = keywords.includes(clean(w));
        const slam = ip(lf, [0, 4], [from, 1], E.inQuart);
        const sq = 0.08 + e * 0.1;
        const sx = lf < 4 ? 1 : ip(lf, [4, 6, 11], [1 + sq, 0.97, 1], E.outQuart);
        const sy = lf < 4 ? 1.1 : ip(lf, [4, 6, 11], [1 - sq * 1.3, 1.04, 1], E.outQuart);
        const base: React.CSSProperties = { fontFamily: D.family, fontWeight: D.weight, fontSize: fitted, textTransform: D.uppercase ? "uppercase" : "none", whiteSpace: "nowrap", letterSpacing: D.tracking, lineHeight: 0.9 };
        return (
          <div key={`${s}-${i}`} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span style={{ ...base, position: "absolute", color: "transparent", WebkitTextStroke: `3px ${key ? lead : th.colors.text}`, opacity: lf < 4 ? 0 : ip(lf, [4, 14], [0.8, 0], E.outQuart), scale: String(lf < 4 ? 1 : ip(lf, [4, 14], [1, 1.32], E.outExpo)) }}>{w}</span>
            <span style={{ ...base, color: key ? lead : th.colors.text, textShadow: th.colors.shadow, opacity: ip(lf, [0, 2], [0, 1], E.linear), transform: `scale(${slam * sx}, ${slam * sy})`, filter: lf < 4 && slam > 1.05 ? `blur(${(slam - 1) * 7}px)` : undefined }}>{w}</span>
          </div>
        );
      })}
    </div>
  );
};

/* 2. LUXURY EDITORIAL: tracked sans + serif italic keywords, masked rise and focus pull. */
export const EditorialCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 300, size = 58 }) => {
  const th = useCaptionTheme();
  const { frame, fps, pi, page, visible } = usePage(words, 4, clipStart);
  if (!visible) return null;
  const p0 = lf0(page[0][1], clipStart, fps);
  return (
    <div style={{ position: "absolute", top: y, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-50%)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "4px 18px" }}>
        {page.map(([w, s], i) => {
          const lf = frame - lf0(s, clipStart, fps) + 3;
          const key = keywords.includes(clean(w));
          return (
            <span key={`${pi}-${i}`} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: key ? th.fonts.serif.family : th.fonts.body.family,
                  fontStyle: key && th.fonts.serif.italic ? "italic" : "normal",
                  fontWeight: key ? th.fonts.serif.weight + 100 : th.fonts.body.weight - 100,
                  fontSize: key ? size * 1.7 : size,
                  letterSpacing: key ? "-0.01em" : "0.14em",
                  textTransform: key ? "none" : "uppercase",
                  lineHeight: 1.05,
                  ...(key ? gradText(th.gradient) : { color: th.colors.text, textShadow: th.colors.shadow }),
                  translate: `0px ${ip(lf, [0, 12], [100, 0], E.outExpo)}%`,
                  filter: `blur(${ip(lf, [0, 9], [6, 0], E.outQuart)}px)${key ? " drop-shadow(0 2px 10px rgba(0,0,0,0.5))" : ""}`,
                  opacity: lf < 0 ? 0 : 1,
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 14, height: 2, width: 260, background: th.gradient, scale: `${ip(frame - p0, [4, 20], [0, 1], E.inOutQuint)} 1` }} />
    </div>
  );
};

/* 3. TEXT BOXES: each word lands in its own tile growing from the baseline; spoken tile takes the lead colour. */
export const BoxCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 1330, size = 70 }) => {
  const th = useCaptionTheme();
  const { t, frame, fps, pi, page, visible } = usePage(words, 4, clipStart);
  if (!visible) return null;
  const D = th.fonts.display;
  const keyTile = Object.values(th.colors.accents).slice(-1)[0];
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", rotate: `${(pi % 2 ? 1 : -1.2) * th.motion.energy * 1.6}deg`, transform: "translateY(-50%)" }}>
      {page.map(([w, s], i) => {
        const lf = frame - lf0(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const act = isActive(page, i, t);
        const key = keywords.includes(clean(w));
        const grow = spring({ frame: lf, fps, config: { stiffness: 380, damping: 26 } });
        return (
          <span key={`${pi}-${i}`} style={{ display: "inline-block", background: act ? lead : key ? keyTile : th.colors.plate, padding: "12px 18px 8px", marginTop: -1, borderRadius: th.motion.radius / 2, transformOrigin: "50% 100%", scale: `1 ${grow}` }}>
            <span style={{ display: "inline-block", fontFamily: D.family, fontWeight: D.weight, fontSize: size, lineHeight: 1, textTransform: D.uppercase ? "uppercase" : "none", color: act || key ? th.colors.onAccent : th.colors.onPlate, translate: `0px ${ip(lf, [1, 9], [40, 0], E.outExpo)}%` }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/* 4. HAND-DRAWN HIGHLIGHT: marker swipes behind keywords, scribble under the last one. */
const swipe = "M4 26 C 60 14, 140 18, 236 10 L 238 46 C 150 52, 70 50, 2 56 Z";
const scribble = "M6 14 C 70 4, 150 22, 236 8 M18 22 C 90 16, 160 26, 226 18";
export const MarkerCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 1330, size = 80 }) => {
  const th = useCaptionTheme();
  const { frame, fps, pi, page, visible } = usePage(words, 3, clipStart);
  if (!visible) return null;
  const lastKey = [...page].reverse().find(([w]) => keywords.includes(clean(w)))?.[1];
  const tilt = 3 + th.motion.energy * 6;
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 20px", transform: "translateY(-50%)" }}>
      {page.map(([w, s], i) => {
        const lf = frame - lf0(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const key = keywords.includes(clean(w));
        const draw = ip(lf, [2, 10], [0, 1], E.inOutCubic);
        return (
          <span key={`${pi}-${i}`} style={{ position: "relative", display: "inline-block", rotate: `${ip(lf, [0, 10], [i % 2 ? tilt : -tilt, 0], E.outExpo)}deg`, translate: `0px ${ip(lf, [0, 10], [26, 0], E.outExpo)}px`, opacity: ip(lf, [0, 4], [0, 1], E.linear) }}>
            {key ? (
              <svg viewBox="0 0 240 60" preserveAspectRatio="none" style={{ position: "absolute", left: "-6%", top: "8%", width: "112%", height: "92%", overflow: "visible" }}>
                <path d={swipe} fill={lead} opacity={0.92} style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }} />
              </svg>
            ) : null}
            <span style={{ position: "relative", fontFamily: th.fonts.body.family, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: key ? th.colors.onAccent : th.colors.text, textShadow: key ? "none" : th.colors.shadow, whiteSpace: "nowrap" }}>{w}</span>
            {key && s === lastKey ? (
              <svg viewBox="0 0 240 30" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -26, width: "100%", height: 26, overflow: "visible" }}>
                <path d={scribble} fill="none" stroke={th.colors.text} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(lf, [10, 20], [1, 0], E.inOutCubic)} vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

/* 5. CINEMATIC PRODUCT TITLE: tracking collapse, per-glyph focus pull, gradient light sweep, hairlines. */
export const CinematicTitle: React.FC<{ title: string; kicker?: string; y?: number; size?: number }> = ({ title, kicker, y = 300, size = 96 }) => {
  const th = useCaptionTheme();
  const frame = useCurrentFrame();
  const chars = Array.from(title);
  const sweep = ip(frame, [10, 60], [-40, 140], E.inOutCubic);
  const line = { height: 2, width: 56, background: th.gradient, scale: `${ip(frame, [14, 34], [0, 1], E.inOutQuint)} 1` };
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-50%)" }}>
      {kicker ? <div style={{ fontFamily: th.fonts.body.family, fontWeight: 600, fontSize: 30, letterSpacing: `${ip(frame, [6, 40], [0.9, 0.5], E.outExpo)}em`, textTransform: "uppercase", color: th.colors.text, opacity: ip(frame, [6, 18], [0, 0.85], E.linear), marginBottom: 18, textShadow: th.colors.shadow }}>{kicker}</div> : null}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 34px 18px", background: "radial-gradient(ellipse at center, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0) 72%)" }}>
        <div style={{ ...line, transformOrigin: "100% 50%" }} />
        <div style={{ display: "flex", fontFamily: th.fonts.serif.family, fontWeight: th.fonts.serif.weight, fontSize: size, lineHeight: 1, letterSpacing: `${ip(frame, [0, 36], [0.5, -0.01], E.outExpo)}em`, whiteSpace: "nowrap" }}>
          {chars.map((c, i) => {
            const s = i * 1.3;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  ...gradText(`linear-gradient(100deg, rgba(255,255,255,0) ${sweep - 14}%, rgba(255,255,255,0.85) ${sweep}%, rgba(255,255,255,0) ${sweep + 14}%), ${th.gradient}`),
                  backgroundSize: `${chars.length * 100}% 100%`,
                  backgroundPosition: `${(i / Math.max(chars.length - 1, 1)) * 100}% 0`,
                  opacity: ip(frame, [s, s + 10], [0, 1], E.linear),
                  filter: `blur(${ip(frame, [s, s + 14], [10, 0], E.outQuart)}px) drop-shadow(0 3px 14px rgba(0,0,0,0.45))`,
                  translate: `0px ${ip(frame, [s, s + 16], [18, 0], E.outExpo)}px`,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        <div style={{ ...line, transformOrigin: "0% 50%" }} />
      </div>
    </div>
  );
};

/* 6. DYNAMIC WORD-BY-WORD: readable pages; spoken word grows in the lead colour, underline travels; numbers in gradient. */
export const DynamicCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 1330, size = 84 }) => {
  const th = useCaptionTheme();
  const { t, frame, fps, pi, page, visible } = usePage(words, 3, clipStart);
  if (!visible) return null;
  const D = th.fonts.display;
  return (
    <div style={{ position: "absolute", top: y, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "4px 20px", transform: "translateY(-50%)" }}>
      {page.map(([w, s, e], i) => {
        const lf = frame - lf0(s, clipStart, fps) + 2;
        const act = isActive(page, i, t);
        const num = isNumber(w);
        const key = num || keywords.includes(clean(w));
        const pop = spring({ frame: lf, fps, config: { stiffness: 320, damping: 18 } });
        const end = lf0(page[i + 1]?.[1] ?? e + 0.3, clipStart, fps);
        const inU = ip(lf, [0, 6], [0, 1], E.outExpo);
        const outU = ip(frame, [end - 1, end + 5], [0, 1], E.inQuart);
        return (
          <span key={`${pi}-${i}`} style={{ position: "relative", display: "inline-block", opacity: lf < 0 ? 0 : 1 }}>
            <span style={{ display: "inline-block", fontFamily: D.family, fontWeight: D.weight, fontSize: num ? size * 1.35 : size, lineHeight: 1.05, textTransform: D.uppercase ? "uppercase" : "none", whiteSpace: "nowrap", ...(num ? gradText(th.gradient) : { color: act ? lead : th.colors.text, textShadow: th.colors.shadow }), filter: num ? "drop-shadow(0 3px 12px rgba(0,0,0,0.5))" : undefined, scale: String(ip(pop, [0, 1], [0.6, 1], E.linear) * (act ? 1.08 : 1)) }}>{w}</span>
            {key || act ? <span style={{ position: "absolute", left: 0, right: 0, bottom: -6, height: 7, borderRadius: 4, background: lead, transformOrigin: outU > 0 ? "100% 50%" : "0% 50%", scale: `${act ? inU * (1 - outU) : 0} 1` }} /> : null}
          </span>
        );
      })}
    </div>
  );
};

/* 7. SPLIT-LINE: a page set as two lines that slide in from opposite sides and lock; the keyword line takes the lead colour. */
export const SplitLineCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 320, size = 104 }) => {
  const th = useCaptionTheme();
  const { frame, fps, pi, page, visible } = usePage(words, 4, clipStart);
  if (!visible) return null;
  const half = Math.ceil(page.length / 2);
  const rows = [page.slice(0, half), page.slice(half)];
  const D = th.fonts.display;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transform: "translateY(-50%)" }}>
      {rows.map((row, r) => {
        if (!row.length) return null;
        const lf = frame - lf0(row[0][1], clipStart, fps) + 3;
        const hasKey = row.some(([w]) => keywords.includes(clean(w)));
        const dist = 260 + th.motion.energy * 300;
        const text = row.map((w) => w[0]).join(" ");
        const fit = Math.min(size * (r === 1 ? 1.1 : 1), 960 / Math.max(text.length * 0.56, 1));
        return (
          <div key={`${pi}-${r}`} style={{ overflow: "hidden", padding: "0 20px" }}>
            <div style={{ fontFamily: D.family, fontWeight: D.weight, fontSize: fit, lineHeight: 1, letterSpacing: D.tracking, textTransform: D.uppercase ? "uppercase" : "none", whiteSpace: "nowrap", color: hasKey ? lead : th.colors.text, textShadow: th.colors.shadow, translate: `${(r ? 1 : -1) * ip(lf, [0, 14], [dist, 0], E.outExpo)}px 0px`, opacity: lf < 0 ? 0 : ip(lf, [0, 5], [0, 1], E.linear), filter: `blur(${ip(lf, [0, 8], [8, 0], E.outQuart)}px)` }}>
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* 8. SUBTLE 3D: words hinge up from the baseline in perspective with a soft extruded shadow; keywords and numbers in the lead colour. */
export const Tilt3DCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], lead, y = 1330, size = 92 }) => {
  const th = useCaptionTheme();
  const { frame, fps, pi, page, visible } = usePage(words, 3, clipStart);
  if (!visible) return null;
  const D = th.fonts.display;
  return (
    <div style={{ position: "absolute", top: y, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 22px", perspective: 900, transform: "translateY(-50%)" }}>
      {page.map(([w, s], i) => {
        const lf = frame - lf0(s, clipStart, fps) + 3;
        if (lf < 0) return null;
        const key = keywords.includes(clean(w)) || isNumber(w);
        const p = spring({ frame: lf, fps, config: { stiffness: 200, damping: 14 + (1 - th.motion.energy) * 8 } });
        const depth = Array.from({ length: 5 }, (_, k) => `0 ${k + 1}px 0 rgba(0,0,0,${(0.22 - k * 0.03).toFixed(2)})`).join(", ");
        return (
          <span key={`${pi}-${i}`} style={{ display: "inline-block", transformOrigin: "50% 100%", transform: `rotateX(${ip(p, [0, 1], [-85, 0], E.linear)}deg) rotateY(${(i - 1) * 6 * (1 - p)}deg)`, opacity: ip(lf, [0, 4], [0, 1], E.linear), fontFamily: D.family, fontWeight: D.weight, fontSize: size, lineHeight: 1.05, textTransform: D.uppercase ? "uppercase" : "none", whiteSpace: "nowrap", color: key ? lead : th.colors.text, textShadow: `${depth}, 0 10px 26px rgba(0,0,0,0.35)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};
