import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch } from "../../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../../lib/brand";

const exitOf = (frame: number, dur: number, len = 8) => ip(frame, [dur - len, dur], [0, 1], E.inQuart);

const Check: React.FC<{ t: number; size?: number }> = ({ t, size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
    <circle cx={12} cy={12} r={10.5} fill="none" stroke={C.green} strokeWidth={2.2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(t, [0, 8], [1, 0], E.inOutCubic)} />
    <circle cx={12} cy={12} r={10.5} fill={C.green} opacity={ip(t, [6, 10], [0, 1], E.linear)} />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={C.black} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(t, [8, 14], [1, 0], E.inOutCubic)} />
  </svg>
);

const Cross: React.FC<{ t: number; size?: number }> = ({ t, size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: "none" }}>
    <path d="M6 6l12 12" stroke="rgba(255,255,255,0.75)" strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(t, [0, 6], [1, 0], E.inOutCubic)} />
    <path d="M18 6L6 18" stroke="rgba(255,255,255,0.75)" strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(t, [4, 10], [1, 0], E.inOutCubic)} />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Checklist: benefits with drawn checks.                              */
/* ------------------------------------------------------------------ */
/**
 * Title, then items that slide in from the left while their check circle draws,
 * fills and ticks. On a flat black panel so it reads over any footage.
 */
export const Checklist: React.FC<{ title: string; items: string[]; y?: number; stagger?: number }> = ({ title, items, y = 380, stagger = 9 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = exitOf(frame, durationInFrames);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, opacity: 1 - out, translate: `0px ${out * 40}px` }}>
      <div style={{ background: "rgba(0,0,0,0.86)", borderRadius: 26, padding: "40px 44px", clipPath: `inset(0 0 ${100 - ip(frame, [0, 12], [0, 100], E.inOutQuint)}% 0 round 26px)` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, textTransform: "uppercase", color: C.green, marginBottom: 26, translate: `0px ${ip(frame, [4, 16], [30, 0])}px`, opacity: ip(frame, [4, 10], [0, 1], E.linear) }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {items.map((it, i) => {
            const s = 12 + i * stagger;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, translate: `${ip(frame, [s, s + 14], [-60, 0])}px 0px`, opacity: ip(frame, [s, s + 6], [0, 1], E.linear) }}>
                <Check t={frame - s - 2} />
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 50, color: C.white, lineHeight: 1.15 }}>{it}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* CompareTable: us vs. the usual option, row by row.                  */
/* ------------------------------------------------------------------ */
/**
 * Two-column comparison. Headers drop in, then each row lands with a green
 * check for us (springs) and a drawn cross for them; our column is
 * highlighted by a green frame that draws around it last.
 */
export const CompareTable: React.FC<{ us: string; them: string; rows: string[]; y?: number }> = ({ us, them, rows, y = 360 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = exitOf(frame, durationInFrames);
  const frameDraw = ip(frame, [14 + rows.length * 8, 30 + rows.length * 8], [1, 0], E.inOutCubic);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, opacity: 1 - out }}>
      <div style={{ background: "rgba(0,0,0,0.88)", borderRadius: 26, padding: "34px 30px", position: "relative", clipPath: `inset(0 0 ${100 - ip(frame, [0, 12], [0, 100], E.inOutQuint)}% 0 round 26px)` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 190px 190px", alignItems: "center", rowGap: 22 }}>
          <span />
          {[us, them].map((h, i) => (
            <div key={h} style={{ textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: "0.02em", textTransform: "uppercase", color: i === 0 ? C.green : "rgba(255,255,255,0.7)", translate: `0px ${ip(frame, [6 + i * 3, 18 + i * 3], [-30, 0])}px`, opacity: ip(frame, [6 + i * 3, 12 + i * 3], [0, 1], E.linear) }}>
              {h}
            </div>
          ))}
          {rows.map((r, i) => {
            const s = 14 + i * 8;
            const sp = punch(frame, fps, s + 3, 320, 13);
            return (
              <React.Fragment key={r}>
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: C.white, opacity: ip(frame, [s, s + 6], [0, 1], E.linear), translate: `${ip(frame, [s, s + 12], [-40, 0])}px 0px` }}>{r}</span>
                <div style={{ display: "flex", justifyContent: "center", scale: String(Math.max(sp, 0)) }}>
                  <Check t={frame - s - 3} size={62} />
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Cross t={frame - s - 5} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 220, top: 18, bottom: 18, width: 190, pointerEvents: "none" }}>
          <svg width="100%" height="100%" style={{ overflow: "visible" }}>
            <rect x={2} y={2} width="98%" height="99%" rx={20} fill="none" stroke={C.green} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={frameDraw} />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* DayTimeline: results over time.                                     */
/* ------------------------------------------------------------------ */
/**
 * A horizontal track that draws left to right; each milestone dot pops when
 * the line reaches it and its label rises above. Keep the labels to what
 * customers actually report.
 */
export const DayTimeline: React.FC<{ steps: { day: string; label: string }[]; y?: number }> = ({ steps, y = 520 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = exitOf(frame, durationInFrames);
  const draw = ip(frame, [4, 4 + steps.length * 12], [0, 1], E.inOutCubic);
  const left = 190;
  const width = 700;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 420, opacity: 1 - out }}>
      <div style={{ position: "absolute", left, top: 250, width, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left, top: 250, width: width * draw, height: 10, borderRadius: 5, background: C.green }} />
      {steps.map((s, i) => {
        const at = steps.length === 1 ? 0 : i / (steps.length - 1);
        const reach = 4 + at * steps.length * 12;
        const sp = punch(frame, fps, reach, 340, 12);
        return (
          <div key={i} style={{ position: "absolute", left: left + at * width, top: 0, width: 0 }}>
            <div style={{ position: "absolute", left: -150, width: 300, top: 40, textAlign: "center", translate: `0px ${ip(frame, [reach, reach + 12], [30, 0])}px`, opacity: ip(frame, [reach, reach + 6], [0, 1], E.linear) }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: C.white, textTransform: "uppercase", lineHeight: 1 }}>{s.day}</div>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: C.white, marginTop: 8, lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{s.label}</div>
            </div>
            <div style={{ position: "absolute", left: -26, top: 229, width: 52, height: 52, borderRadius: "50%", background: C.green, border: `8px solid ${C.black}`, scale: String(Math.max(sp, 0)) }} />
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Countdown: live offer timer.                                        */
/* ------------------------------------------------------------------ */
/**
 * hh:mm:ss that really ticks down while on screen; each changed digit slides
 * down out of a mask. Label above, panel wipes in.
 */
export const Countdown: React.FC<{ label: string; seconds: number; y?: number }> = ({ label, seconds, y = 400 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const out = exitOf(frame, durationInFrames);
  const now = Math.max(0, seconds - frame / fps);
  const sub = (frame % fps) / fps; // progress inside the current second
  const fmt = (v: number) => {
    const s = Math.floor(v);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
  };
  const cur = fmt(now);
  const prev = fmt(now + 1);
  const slide = ip(sub, [0, 0.25], [0, 1], E.outExpo);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out }}>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, letterSpacing: "0.12em", textTransform: "uppercase", color: C.white, marginBottom: 14, opacity: ip(frame, [0, 8], [0, 1], E.linear), textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{label}</div>
      <div style={{ display: "flex", background: C.black, borderRadius: 22, padding: "18px 34px 10px", clipPath: `inset(0 ${100 - ip(frame, [2, 14], [0, 100], E.inOutQuint)}% 0 0 round 22px)` }}>
        {cur.split("").map((ch, i) => {
          const changed = ch !== prev[i] && frame > 0;
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", height: "1em", overflow: "hidden", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 1, color: ch === ":" ? C.green : C.white, fontVariantNumeric: "tabular-nums", width: ch === ":" ? "0.32em" : "0.56em", textAlign: "center" }}>
              {changed ? (
                <>
                  <span style={{ position: "absolute", left: 0, right: 0, translate: `0px ${slide * 100}%` }}>{prev[i]}</span>
                  <span style={{ position: "absolute", left: 0, right: 0, translate: `0px ${(slide - 1) * 100}%` }}>{ch}</span>
                </>
              ) : (
                <span style={{ position: "absolute", left: 0, right: 0 }}>{ch}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ProductCard: picture-in-picture product or facts card.              */
/* ------------------------------------------------------------------ */
/**
 * A tilted card with a product photo (or the supplement facts) that flips in
 * on a spring, a caption strip under it and an optional round badge that pops
 * on its corner. Good while the creator talks about the product.
 */
export const ProductCard: React.FC<{ src: string; caption: string; badge?: string; x?: number; y?: number; w?: number; h?: number }> = ({
  src,
  caption,
  badge,
  x = 560,
  y = 300,
  w = 440,
  h = 560,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = punch(frame, fps, 0, 170, 14);
  const b = punch(frame, fps, 12, 300, 11);
  const out = exitOf(frame, durationInFrames);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, perspective: 1200, opacity: 1 - out }}>
      <div style={{ transform: `rotateY(${ip(p, [0, 1], [70, -6], E.linear)}deg) rotateZ(${ip(p, [0, 1], [8, 3], E.linear)}deg) scale(${ip(p, [0, 1], [0.7, 1], E.linear) * (1 - out * 0.15)})`, transformOrigin: "100% 50%" }}>
        <div style={{ background: C.white, padding: 14, borderRadius: 22, boxShadow: "0 26px 60px rgba(0,0,0,0.35)" }}>
          <Img src={staticFile(src)} style={{ display: "block", width: "100%", height: h, objectFit: "cover", borderRadius: 12 }} />
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, textTransform: "uppercase", color: C.black, padding: "16px 6px 4px", lineHeight: 1, whiteSpace: "nowrap" }}>{caption}</div>
        </div>
        {badge ? (
          <div style={{ position: "absolute", left: -46, top: -40, width: 150, height: 150, borderRadius: "50%", background: C.green, color: C.black, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, lineHeight: 0.95, textTransform: "uppercase", scale: String(Math.max(b, 0)), rotate: `${ip(b, [0, 1], [-60, -12], E.linear)}deg`, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            {badge}
          </div>
        ) : null}
      </div>
    </div>
  );
};
