import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { E, ip } from "../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/brand";

const chars = (s: string) => Array.from(s);

/**
 * Three text techniques choreographed as one title:
 * 1. Character cascade: each glyph flips up from below on its own hinge
 *    (rotateX in perspective), with blur and a 1.4-frame stagger.
 * 2. Split lock: the second line is cut horizontally; the top half slides in
 *    from the left, the bottom half from the right, and they lock on a seam
 *    that flashes.
 * 3. Tracking collapse: the small line enters with wide letter-spacing that
 *    tightens while it fades in.
 */
export const CharCascade: React.FC<{
  line1: string;
  line2: string;
  line3?: string;
  size?: number;
}> = ({ line1, line2, line3, size = 210 }) => {
  const frame = useCurrentFrame();
  const big: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 0.92,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  const splitStart = 14;
  const split = ip(frame, [splitStart, splitStart + 16], [1, 0], E.inOutQuint);
  const seam = ip(frame, [splitStart + 14, splitStart + 17, splitStart + 30], [0, 1, 0], E.outQuart);
  const l3 = ip(frame, [32, 56], [0, 1], E.outExpo);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <CameraMotionBlur shutterAngle={200} samples={8}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10, backgroundColor: C.green }}>
          {/* 1. Cascade */}
          <div style={{ ...big, color: C.black, display: "flex", perspective: 900 }}>
            {chars(line1).map((ch, i) => {
              const s = i * 1.4;
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    transformOrigin: "50% 100%",
                    whiteSpace: "pre",
                    transform: `translateY(${ip(frame, [s, s + 16], [70, 0], E.outExpo)}%) rotateX(${ip(frame, [s, s + 16], [-100, 0], E.outExpo)}deg)`,
                    opacity: ip(frame, [s, s + 6], [0, 1], E.linear),
                    filter: `blur(${ip(frame, [s, s + 10], [14, 0], E.outQuart)}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>

          {/* 2. Split lock */}
          <div style={{ position: "relative" }}>
            <div style={{ ...big, color: "transparent" }}>{line2}</div>
            {[0, 1].map((half) => (
              <div
                key={half}
                style={{
                  ...big,
                  position: "absolute",
                  inset: 0,
                  color: C.white,
                  clipPath: half === 0 ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)",
                  translate: `${(half === 0 ? -1 : 1) * split * 115}% 0px`,
                }}
              >
                {line2}
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                left: "-6%",
                right: "-6%",
                top: "50%",
                height: 6,
                marginTop: -3,
                backgroundColor: C.white,
                opacity: seam,
                scale: `${ip(frame, [splitStart + 14, splitStart + 22], [0.2, 1.1], E.outExpo)} 1`,
              }}
            />
          </div>
        </AbsoluteFill>
      </CameraMotionBlur>

      {/* 3. Tracking collapse */}
      {line3 ? (
        <div
          style={{
            position: "absolute",
            top: "64%",
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 54,
            color: C.black,
            letterSpacing: `${ip(frame, [32, 60], [0.7, 0.06], E.outExpo)}em`,
            opacity: l3,
            whiteSpace: "nowrap",
          }}
        >
          {line3}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
