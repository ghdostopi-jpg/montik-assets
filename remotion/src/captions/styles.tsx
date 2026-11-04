import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { FONT_BODY, FONT_DISPLAY } from "../lib/brand";
import { B, SERIF } from "./beauty";
import { clean, isActive, isNumber, pageAt, pages, W } from "./core";

export type CaptionProps = {
  /** Spoken words with times in clip seconds. */
  words: W[];
  /** Clip second that frame 0 of this Sequence shows. */
  clipStart: number;
  /** Words to emphasise (lower case, no punctuation). */
  keywords?: string[];
  /** Vertical centre of the caption, px from the top of a 1080x1920 frame. */
  y?: number;
  size?: number;
};

const useClock = (clipStart: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { t: clipStart + frame / fps, frame, fps };
};
const f = (sec: number, clipStart: number, fps: number) => (sec - clipStart) * fps; // clip sec -> local frame
const shadow = "0 2px 18px rgba(18,16,20,0.55), 0 1px 3px rgba(18,16,20,0.5)";

/* 1 ─────────────────────────────────────────────────────────────────────────
 * STOMP: every word slams in on its own syllable: accelerating 2.6x -> 1x
 * scale, squash on impact, vertical smear while moving, a soft shockwave
 * ring. Pages of 1-2 words, huge condensed caps; keywords in coral.
 */
export const StompCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 318, size = 176 }) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, 2);
  const page = ps[pageAt(ps, t)];
  if (t < page[0][1] - 0.06) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 40, right: 40, height: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 28 }}>
      {page.map(([w, s], i) => {
        const lf = frame - f(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const key = keywords.includes(clean(w));
        const slam = ip(lf, [0, 4], [2.6, 1], E.inQuart);
        const sx = lf < 4 ? 1 : ip(lf, [4, 6, 11], [1.14, 0.97, 1], E.outQuart);
        const sy = lf < 4 ? 1.12 : ip(lf, [4, 6, 11], [0.84, 1.04, 1], E.outQuart);
        const blur = lf < 4 ? (slam - 1) * 7 : 0;
        const fitted = Math.min(size, 980 / Math.max(page.map((p) => p[0]).join(" ").length * 0.58, 1));
        return (
          <div key={`${s}-${i}`} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <span
              style={{
                position: "absolute",
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: fitted,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: "transparent",
                WebkitTextStroke: `3px ${key ? B.coral : B.cream}`,
                opacity: lf < 4 ? 0 : ip(lf, [4, 14], [0.8, 0], E.outQuart),
                scale: String(lf < 4 ? 1 : ip(lf, [4, 14], [1, 1.32], E.outExpo)),
              }}
            >
              {w}
            </span>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: fitted,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: key ? B.coral : B.cream,
                textShadow: shadow,
                opacity: ip(lf, [0, 2], [0, 1], E.linear),
                transform: `scale(${slam * sx}, ${slam * sy})`,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              {w}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/* 2 ─────────────────────────────────────────────────────────────────────────
 * LUXURY EDITORIAL: magazine pairing of a tracked sans and a light serif
 * italic. Words rise out of individual masks with a soft focus pull; keywords
 * switch to large serif italic with a rose-gold fill; a hairline rule draws
 * beneath each line. Calm, confident, plenty of air.
 */
export const EditorialCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 300, size = 58 }) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, 4);
  const pi = pageAt(ps, t);
  const page = ps[pi];
  if (t < page[0][1] - 0.06) return null;
  const p0 = f(page[0][1], clipStart, fps);
  return (
    <div style={{ position: "absolute", top: y, left: 70, right: 70, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-50%)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "4px 18px" }}>
        {page.map(([w, s], i) => {
          const lf = frame - f(s, clipStart, fps) + 3;
          const key = keywords.includes(clean(w));
          return (
            <span key={`${pi}-${i}`} style={{ display: "inline-block", overflow: "hidden", paddingBottom: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: key ? SERIF : FONT_BODY,
                  fontStyle: key ? "italic" : "normal",
                  fontWeight: key ? 400 : 500,
                  fontSize: key ? size * 1.7 : size,
                  letterSpacing: key ? "-0.01em" : "0.14em",
                  textTransform: key ? "none" : "uppercase",
                  lineHeight: 1.05,
                  color: key ? "transparent" : B.cream,
                  backgroundImage: key ? B.roseGold : undefined,
                  WebkitBackgroundClip: key ? "text" : undefined,
                  backgroundClip: key ? "text" : undefined,
                  textShadow: key ? undefined : shadow,
                  translate: `0px ${ip(lf, [0, 12], [100, 0], E.outExpo)}%`,
                  filter: `blur(${ip(lf, [0, 9], [6, 0], E.outQuart)}px)${key ? " drop-shadow(0 2px 10px rgba(18,16,20,0.55))" : ""}`,
                  opacity: lf < 0 ? 0 : 1,
                }}
              >
                {w}
              </span>
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 14, height: 2, width: 260, background: B.roseGold, transformOrigin: "50% 50%", scale: `${ip(frame - p0, [4, 20], [0, 1], E.inOutQuint)} 1` }} />
    </div>
  );
};

/* 3 ─────────────────────────────────────────────────────────────────────────
 * BLACK TEXT BOXES: each word lands in its own ink tile that grows up from
 * the baseline; tiles butt together into a ragged editorial strip with a
 * slight tilt. The spoken word's tile turns peach. Strong over busy footage.
 */
export const BoxCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 1330, size = 70 }) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, 4);
  const pi = pageAt(ps, t);
  const page = ps[pi];
  if (t < page[0][1] - 0.06) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", rotate: `${pi % 2 ? 1 : -1.2}deg`, transform: "translateY(-50%)" }}>
      {page.map(([w, s], i) => {
        const lf = frame - f(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const act = isActive(page, i, t);
        const key = keywords.includes(clean(w));
        const grow = spring({ frame: lf, fps, config: { stiffness: 380, damping: 26 } });
        return (
          <span
            key={`${pi}-${i}`}
            style={{
              display: "inline-block",
              background: act ? B.peach : key ? B.rose : "rgba(18,16,20,0.92)",
              padding: "12px 18px 8px",
              marginTop: -1,
              transformOrigin: "50% 100%",
              scale: `1 ${grow}`,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: size,
                lineHeight: 1,
                textTransform: "uppercase",
                color: act ? B.ink : B.cream,
                translate: `0px ${ip(lf, [1, 9], [40, 0], E.outExpo)}%`,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* 4 ─────────────────────────────────────────────────────────────────────────
 * HAND-DRAWN HIGHLIGHT: friendly sentence-case captions. Keywords get a
 * marker swipe drawn behind them (rough edges, slight angle), the last
 * keyword of a page also gets a hand-drawn underline. Words tip in from a
 * small rotation.
 */
const swipe = "M4 26 C 60 14, 140 18, 236 10 L 238 46 C 150 52, 70 50, 2 56 Z";
const scribble = "M6 14 C 70 4, 150 22, 236 8 M18 22 C 90 16, 160 26, 226 18";
export const MarkerCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 1330, size = 80 }) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, 3);
  const pi = pageAt(ps, t);
  const page = ps[pi];
  if (t < page[0][1] - 0.06) return null;
  const lastKey = [...page].reverse().find(([w]) => keywords.includes(clean(w)))?.[1];
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 20px", transform: "translateY(-50%)" }}>
      {page.map(([w, s], i) => {
        const lf = frame - f(s, clipStart, fps) + 2;
        if (lf < 0) return null;
        const key = keywords.includes(clean(w));
        const draw = ip(lf, [2, 10], [0, 1], E.inOutCubic);
        return (
          <span key={`${pi}-${i}`} style={{ position: "relative", display: "inline-block", rotate: `${ip(lf, [0, 10], [i % 2 ? 6 : -6, 0], E.outExpo)}deg`, translate: `0px ${ip(lf, [0, 10], [26, 0], E.outExpo)}px`, opacity: ip(lf, [0, 4], [0, 1], E.linear) }}>
            {key ? (
              <svg viewBox="0 0 240 60" preserveAspectRatio="none" style={{ position: "absolute", left: "-6%", top: "8%", width: "112%", height: "92%", overflow: "visible" }}>
                <path d={swipe} fill={B.coral} opacity={0.9} style={{ clipPath: `inset(0 ${(1 - draw) * 100}% 0 0)` }} />
              </svg>
            ) : null}
            <span style={{ position: "relative", fontFamily: FONT_BODY, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: B.cream, textShadow: key ? "none" : shadow, whiteSpace: "nowrap" }}>{w}</span>
            {key && s === lastKey ? (
              <svg viewBox="0 0 240 30" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -26, width: "100%", height: 26, overflow: "visible" }}>
                <path d={scribble} fill="none" stroke={B.cream} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(lf, [10, 20], [1, 0], E.inOutCubic)} vectorEffect="non-scaling-stroke" />
              </svg>
            ) : null}
          </span>
        );
      })}
    </div>
  );
};

/* 5 ─────────────────────────────────────────────────────────────────────────
 * CINEMATIC PRODUCT: the product name as a title card on the footage.
 * Letters arrive spaced wide and soft, tracking collapses to tight while each
 * glyph pulls focus; a rose-gold fill carries a slow light sweep; hairlines
 * extend from both sides and a small tracked line names the brand.
 */
export const CinematicTitle: React.FC<{ title: string; kicker?: string; y?: number; size?: number; at?: number }> = ({ title, kicker, y = 300, size = 96, at = 0 }) => {
  const frame = useCurrentFrame() - at;
  const chars = Array.from(title);
  const sweep = ip(frame, [10, 60], [-40, 140], E.inOutCubic);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateY(-50%)" }}>
      {kicker ? (
        <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, letterSpacing: `${ip(frame, [6, 40], [0.9, 0.5], E.outExpo)}em`, textTransform: "uppercase", color: B.champagne, opacity: ip(frame, [6, 18], [0, 1], E.linear), marginBottom: 18, textShadow: shadow }}>{kicker}</div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 34px 18px", background: "radial-gradient(ellipse at center, rgba(18,16,20,0.42) 0%, rgba(18,16,20,0) 72%)" }}>
        <div style={{ height: 2, width: 56, background: B.roseGold, transformOrigin: "100% 50%", scale: `${ip(frame, [14, 34], [0, 1], E.inOutQuint)} 1` }} />
        <div
          style={{
            display: "flex",
            fontFamily: SERIF,
            fontWeight: 300,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: `${ip(frame, [0, 36], [0.5, -0.01], E.outExpo)}em`,
            whiteSpace: "nowrap",
          }}
        >
          {chars.map((c, i) => {
            const s = i * 1.3;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  color: "transparent",
                  backgroundImage: `linear-gradient(100deg, #F6D2B8 ${sweep - 40}%, #FFF4EA ${sweep - 6}%, #D9987A ${sweep + 12}%, #B9735C ${sweep + 40}%)`,
                  backgroundSize: `${chars.length * 100}% 100%`,
                  backgroundPosition: `${(i / Math.max(chars.length - 1, 1)) * 100}% 0`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  opacity: ip(frame, [s, s + 10], [0, 1], E.linear),
                  filter: `blur(${ip(frame, [s, s + 14], [10, 0], E.outQuart)}px) drop-shadow(0 3px 14px rgba(18,16,20,0.45))`,
                  translate: `0px ${ip(frame, [s, s + 16], [18, 0], E.outExpo)}px`,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        <div style={{ height: 2, width: 56, background: B.roseGold, transformOrigin: "0% 50%", scale: `${ip(frame, [14, 34], [0, 1], E.inOutQuint)} 1` }} />
      </div>
    </div>
  );
};

/* 6 ─────────────────────────────────────────────────────────────────────────
 * DYNAMIC WORD-BY-WORD: readable 3-word pages for longer explanations.
 * Words pop in on their timestamps; the spoken word grows and turns peach
 * while an underline grows in from its left and leaves to the right, so the
 * emphasis seems to travel along the line. Numbers are set larger in
 * rose gold so facts read at a glance.
 */
export const DynamicCaption: React.FC<CaptionProps> = ({ words, clipStart, keywords = [], y = 1330, size = 84 }) => {
  const { t, frame, fps } = useClock(clipStart);
  const ps = pages(words, 3);
  const pi = pageAt(ps, t);
  const page = ps[pi];
  if (t < page[0][1] - 0.06) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "4px 20px", transform: "translateY(-50%)" }}>
      {page.map(([w, s, e], i) => {
        const lf = frame - f(s, clipStart, fps) + 2;
        const act = isActive(page, i, t);
        const num = isNumber(w);
        const key = num || keywords.includes(clean(w));
        const pop = spring({ frame: lf, fps, config: { stiffness: 320, damping: 18 } });
        const end = f(page[i + 1]?.[1] ?? e + 0.3, clipStart, fps);
        const inU = ip(lf, [0, 6], [0, 1], E.outExpo);
        const outU = ip(frame, [end - 1, end + 5], [0, 1], E.inQuart);
        return (
          <span key={`${pi}-${i}`} style={{ position: "relative", display: "inline-block", opacity: lf < 0 ? 0.0 : 1 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: num ? size * 1.35 : size,
                lineHeight: 1.05,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                color: num ? "transparent" : act ? B.peach : B.cream,
                backgroundImage: num ? B.roseGold : undefined,
                WebkitBackgroundClip: num ? "text" : undefined,
                backgroundClip: num ? "text" : undefined,
                textShadow: num ? undefined : shadow,
                filter: num ? "drop-shadow(0 3px 12px rgba(18,16,20,0.5))" : undefined,
                scale: String(ip(pop, [0, 1], [0.6, 1], E.linear) * (act ? 1.08 : 1)),
              }}
            >
              {w}
            </span>
            {key || act ? (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -6,
                  height: 7,
                  borderRadius: 4,
                  background: B.peach,
                  transformOrigin: outU > 0 ? "100% 50%" : "0% 50%",
                  scale: `${act ? inU * (1 - outU) : 0} 1`,
                }}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
