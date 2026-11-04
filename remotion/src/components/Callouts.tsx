import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch } from "../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/brand";

/** A hand-drawn loop: an ellipse that overshoots its start, with a little wobble. */
const loopPath = (cx: number, cy: number, rx: number, ry: number) => {
  const pts: string[] = [];
  for (let a = -30; a <= 395; a += 6) {
    const r = (a * Math.PI) / 180;
    const wob = 1 + Math.sin(r * 3) * 0.025 + (a > 330 ? (a - 330) * 0.0009 : 0);
    pts.push(`${(cx + Math.cos(r) * rx * wob).toFixed(1)},${(cy + Math.sin(r) * ry * wob).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};

const starburst = (r1: number, r2: number, n = 18) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (i / (n * 2)) * Math.PI * 2;
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(" ");
};

export type CalloutSpec = {
  /** Ellipse around the thing (frame px). */
  circle: { cx: number; cy: number; rx: number; ry: number };
  /** Label block position. */
  label: { x: number; y: number; title: string; line: string };
  /** Arrow from (x1,y1) to (x2,y2), bent by `bend`. */
  arrow: { x1: number; y1: number; x2: number; y2: number; bend: number };
  sticker: { x: number; y: number; top: string; bottom: string };
};

/**
 * Annotation kit over footage, choreographed in one pass: the label slides out
 * of a mask, a hand-drawn arrow draws toward the product (head follows the
 * shaft), a loop circles the product name with an overshooting stroke, and a
 * starburst sticker spins in with a pop and burst lines. Everything lives in
 * the same container as the photo, so it tracks the slow camera push.
 */
export const Callouts: React.FC<{ src: string; spec: CalloutSpec }> = ({ src, spec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const push = ip(frame, [0, durationInFrames], [1.0, 1.06], E.outQuart);
  const { circle, label, arrow, sticker } = spec;
  const mx = (arrow.x1 + arrow.x2) / 2 + arrow.bend;
  const my = (arrow.y1 + arrow.y2) / 2 - Math.abs(arrow.bend) * 0.4;
  const arrowD = `M${arrow.x1},${arrow.y1} Q${mx},${my} ${arrow.x2},${arrow.y2}`;
  // Arrow head direction from the curve's end tangent.
  const ang = Math.atan2(arrow.y2 - my, arrow.x2 - mx);
  const head = (da: number) =>
    `M${arrow.x2},${arrow.y2} L${arrow.x2 - Math.cos(ang + da) * 54},${arrow.y2 - Math.sin(ang + da) * 54}`;

  const draw = (s: number, d: number) => ip(frame, [s, s + d], [1, 0], E.inOutCubic);
  const stk = punch(frame, fps, 44, 240, 11);
  const burstT = frame - 50;
  const stroke = { fill: "none", stroke: C.green, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dark = "drop-shadow(0 4px 14px rgba(0,0,0,0.45))";

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.black }}>
      <AbsoluteFill style={{ scale: String(push), transformOrigin: "50% 50%" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 32%)" }} />

        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", filter: dark }}>
          <path d={loopPath(circle.cx, circle.cy, circle.rx, circle.ry)} pathLength={1} strokeWidth={12} strokeDasharray="1 1" strokeDashoffset={draw(16, 18)} {...stroke} />
          <path d={arrowD} pathLength={1} strokeWidth={11} strokeDasharray="1 1" strokeDashoffset={draw(8, 14)} {...stroke} />
          <path d={head(0.55)} pathLength={1} strokeWidth={11} strokeDasharray="1 1" strokeDashoffset={draw(21, 5)} {...stroke} />
          <path d={head(-0.55)} pathLength={1} strokeWidth={11} strokeDasharray="1 1" strokeDashoffset={draw(23, 5)} {...stroke} />
        </svg>

        {/* Label */}
        <div style={{ position: "absolute", left: label.x, top: label.y, display: "flex", gap: 22 }}>
          <div
            style={{
              width: 12,
              backgroundColor: C.green,
              transformOrigin: "50% 0%",
              scale: `1 ${ip(frame, [0, 12], [0, 1], E.outExpo)}`,
            }}
          />
          <div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 132,
                  lineHeight: 0.95,
                  textTransform: "uppercase",
                  color: C.white,
                  translate: `0px ${ip(frame, [3, 17], [105, 0], E.outExpo)}%`,
                }}
              >
                {label.title}
              </div>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontWeight: 600,
                  fontSize: 44,
                  color: C.white,
                  marginTop: 8,
                  translate: `0px ${ip(frame, [8, 22], [110, 0], E.outExpo)}%`,
                }}
              >
                {label.line}
              </div>
            </div>
          </div>
        </div>

        {/* Sticker */}
        <div style={{ position: "absolute", left: sticker.x, top: sticker.y }}>
          <svg width={0} height={0} style={{ overflow: "visible", position: "absolute" }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r0 = ip(burstT, [0, 10], [150, 205], E.outExpo);
              const r1 = ip(burstT, [0, 10], [160, 250], E.outExpo);
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * r0}
                  y1={Math.sin(a) * r0}
                  x2={Math.cos(a) * r1}
                  y2={Math.sin(a) * r1}
                  stroke={C.white}
                  strokeWidth={8}
                  strokeLinecap="round"
                  opacity={burstT < 0 ? 0 : ip(burstT, [3, 12], [1, 0], E.linear)}
                />
              );
            })}
          </svg>
          <div
            style={{
              position: "absolute",
              left: -150,
              top: -150,
              width: 300,
              height: 300,
              scale: String(stk),
              rotate: `${ip(stk, [0, 1], [-160, -12], E.linear) + ip(frame, [56, durationInFrames], [0, 14], E.linear)}deg`,
              filter: dark,
            }}
          >
            <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: "absolute" }}>
              <polygon points={starburst(148, 126)} fill={C.green} />
              <circle r={104} fill="none" stroke={C.black} strokeWidth={3} strokeDasharray="6 8" />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                color: C.black,
                textTransform: "uppercase",
                lineHeight: 0.9,
              }}
            >
              <div style={{ fontSize: 118 }}>{sticker.top}</div>
              <div style={{ fontSize: 46, letterSpacing: "0.06em" }}>{sticker.bottom}</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
