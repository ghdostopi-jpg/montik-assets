import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { E, ip, shake } from "../lib/anim";
import { C, FONT_DISPLAY } from "../lib/brand";

export type StompWord = { text: string; accent?: boolean };

/**
 * STOMP: one huge word at a time slams into the frame. Each word accelerates in
 * from 3x scale, hits with a squash-and-stretch, kicks a decaying camera shake,
 * a white impact flash and two outline shockwaves. Accent words flip the palette.
 */
export const Stomp: React.FC<{
  words: StompWord[];
  framesPerWord?: number;
  maxWidth?: number;
}> = ({ words, framesPerWord = 11, maxWidth = 960 }) => {
  const frame = useCurrentFrame();
  const idx = Math.min(words.length - 1, Math.floor(frame / framesPerWord));
  const word = words[idx];
  const t = frame - idx * framesPerWord; // frames since this word started
  const isLast = idx === words.length - 1;
  const IMPACT = 4;

  // Fit the word to the frame width (condensed caps average ~0.5em per glyph).
  const size = Math.min(600, maxWidth / (Math.max(word.text.length, 2) * 0.64));

  const bg = word.accent ? C.green : idx % 2 === 0 ? C.black : C.ink;
  const fg = word.accent ? C.black : C.white;

  // Slam: accelerate from 3.2x to 1x, then squash and settle.
  const slam = ip(t, [0, IMPACT], [3.2, 1], E.inQuart);
  const sx = t < IMPACT ? 1 : ip(t, [IMPACT, IMPACT + 2, IMPACT + 7], [1.16, 0.96, 1], E.outQuart);
  const sy = t < IMPACT ? 1 + (3.2 - slam) * 0.05 : ip(t, [IMPACT, IMPACT + 2, IMPACT + 7], [0.8, 1.05, 1], E.outQuart);
  const drift = isLast ? ip(t, [IMPACT + 6, IMPACT + 60], [1, 1.07], E.outQuart) : 1;
  const sh = shake(frame, idx * framesPerWord + IMPACT, word.accent ? 34 : 22, `stomp${idx}`, 9);

  const wordStyle: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 0.9,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={220} samples={10}>
        <AbsoluteFill
          style={{
            backgroundColor: bg,
            justifyContent: "center",
            alignItems: "center",
            translate: `${sh.x}px ${sh.y}px`,
            rotate: `${sh.r}deg`,
            scale: "1.06",
          }}
        >
          {/* Ghost layer: the previous word, huge and faint, drifting behind. */}
          {idx > 0 ? (
            <div
              style={{
                ...wordStyle,
                position: "absolute",
                fontSize: size * 2.2,
                color: "transparent",
                WebkitTextStroke: `3px ${word.accent ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.10)"}`,
                translate: `${ip(t, [0, framesPerWord * 3], [80, -120], E.linear)}px 0px`,
              }}
            >
              {words[idx - 1].text}
            </div>
          ) : null}

          {/* Shockwaves: outline copies that burst out on impact. */}
          {[0, 1].map((k) => {
            const st = t - IMPACT - k * 2;
            return (
              <div
                key={k}
                style={{
                  ...wordStyle,
                  position: "absolute",
                  color: "transparent",
                  WebkitTextStroke: `${4 - k}px ${word.accent ? C.black : C.green}`,
                  opacity: st < 0 ? 0 : ip(st, [0, 10], [0.9, 0], E.outQuart),
                  scale: String(st < 0 ? 1 : ip(st, [0, 10], [1, 1.35 + k * 0.2], E.outExpo)),
                }}
              >
                {word.text}
              </div>
            );
          })}

          <div
            style={{
              ...wordStyle,
              position: "relative",
              color: fg,
              opacity: ip(t, [0, 2], [0, 1], E.linear),
              transform: `scale(${slam * sx * drift}, ${slam * sy * drift})`,
            }}
          >
            {word.text}
          </div>
        </AbsoluteFill>
      </CameraMotionBlur>

      {/* Impact flash. */}
      <AbsoluteFill
        style={{
          backgroundColor: word.accent ? C.white : C.green,
          mixBlendMode: "screen",
          opacity: t < IMPACT ? 0 : ip(t, [IMPACT, IMPACT + 4], [0.35, 0], E.outQuart),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
