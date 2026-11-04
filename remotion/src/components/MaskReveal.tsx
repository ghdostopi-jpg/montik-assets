import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { C, FONT_DISPLAY } from "../lib/brand";

/**
 * After-Effects style block reveal. Per line: a solid block wipes across from the
 * left, holds for a beat, retracts to the right, and the type rises into view
 * inside its own mask while the block is still leaving. The accent line gets a
 * second, inverted block and an underline that sweeps in last. Lines exit by
 * dropping back into their masks.
 */
export const MaskReveal: React.FC<{
  lines: string[];
  accentLine?: number;
  size?: number;
  stagger?: number;
  top?: number;
}> = ({ lines, accentLine = -1, size = 132, stagger = 6, top = 860 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exitAt = durationInFrames - 16;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 86, top, display: "flex", flexDirection: "column", gap: 18 }}>
        {lines.map((line, i) => {
          const s = i * stagger;
          const isAccent = i === accentLine;
          const wipeIn = ip(frame, [s, s + 9], [0, 1], E.inOutQuint);
          const wipeOut = ip(frame, [s + 11, s + 21], [0, 1], E.inOutQuint);
          const covering = frame < s + 11;
          const textRise = ip(frame, [s + 10, s + 24], [105, 0], E.outExpo);
          const exit = ip(frame, [exitAt + i * 3, exitAt + i * 3 + 10], [0, -110], E.inExpo);
          const under = ip(frame, [s + 22, s + 34], [0, 1], E.outExpo);

          return (
            <div key={i} style={{ position: "relative", alignSelf: "flex-start" }}>
              {/* Text inside its mask. */}
              <div style={{ overflow: "hidden", paddingBottom: 6 }}>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: size,
                    lineHeight: 1,
                    letterSpacing: "-0.015em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: isAccent ? C.black : C.white,
                    background: isAccent ? C.green : "transparent",
                    padding: isAccent ? "4px 22px 0" : "0",
                    translate: `0px ${frame < s + 10 ? 105 : textRise + exit}%`,
                  }}
                >
                  {line}
                </div>
              </div>
              {/* Wipe block: grows from the left, retracts to the right. */}
              <div
                style={{
                  position: "absolute",
                  inset: "-4px -14px",
                  backgroundColor: isAccent ? C.white : C.green,
                  transformOrigin: covering ? "0% 50%" : "100% 50%",
                  scale: `${covering ? wipeIn : 1 - wipeOut} 1`,
                }}
              />
              {isAccent ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -22,
                    height: 10,
                    backgroundColor: C.white,
                    transformOrigin: "0% 50%",
                    scale: `${under * (frame > exitAt ? ip(frame, [exitAt, exitAt + 10], [1, 0], E.inExpo) : 1)} 1`,
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
