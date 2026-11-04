import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/brand";

/** One rolling digit column, odometer style. */
const Digit: React.FC<{ from: number; to: number; start: number; dur: number }> = ({ from, to, start, dur }) => {
  const frame = useCurrentFrame();
  const steps = (to - from + 10) % 10 || 10;
  const strip = Array.from({ length: steps + 1 }, (_, i) => (from + i) % 10);
  const y = ip(frame, [start, start + dur], [0, steps], E.inOutQuint);
  return (
    <span style={{ display: "inline-block", height: "1em", overflow: "hidden", verticalAlign: "top" }}>
      <span style={{ display: "flex", flexDirection: "column", translate: `0px ${-y}em` }}>
        {strip.map((d, i) => (
          <span key={i} style={{ height: "1em", lineHeight: 1 }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
};

/**
 * Magazine-cover hook. Hairline rules draw across, a duotone photo window
 * opens from a single line, an odometer clock rolls from the "before" time to
 * the "after" time over the photo's edge, then the headline rises out of its
 * masks and a marker stroke lands on the key phrase. Built on a strict grid
 * with an 80 px margin.
 */
export const EditorialHook: React.FC<{
  src: string;
  from: string; // "23:37"
  to: string; // "01:00"
  line1: string;
  line2: string;
  body: string;
  brand: string;
  page?: string;
}> = ({ src, from, to, line1, line2, body, brand, page = "01 / 05" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const open = ip(frame, [4, 24], [0, 1], E.inOutQuint);
  const rule = (s: number) => ip(frame, [s, s + 16], [0, 1], E.inOutQuint);
  const headline: React.CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 176,
    lineHeight: 0.95,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    color: C.black,
    whiteSpace: "nowrap",
  };
  const fd = from.replace(":", "").split("").map(Number);
  const td = to.replace(":", "").split("").map(Number);

  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {/* Top meta + rule */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: C.black,
          opacity: ip(frame, [8, 20], [0, 1]),
        }}
      >
        <span>{brand}</span>
        <span>{page}</span>
      </div>
      <div style={{ position: "absolute", top: 150, left: 80, right: 80, height: 3, backgroundColor: C.black, transformOrigin: "0 50%", scale: `${rule(0)} 1` }} />

      {/* Photo window */}
      <div
        style={{
          position: "absolute",
          top: 196,
          left: 80,
          width: 920,
          height: 900,
          overflow: "hidden",
          clipPath: `inset(${(1 - open) * 50}% 0 ${(1 - open) * 50}% 0)`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: "130%",
            objectFit: "cover",
            objectPosition: "50% 30%",
            filter: "grayscale(1) contrast(1.15) brightness(1.02)",
            translate: `0px ${ip(frame, [0, durationInFrames], [-40, -120], E.linear)}px`,
            scale: String(ip(frame, [4, 40], [1.25, 1.05], E.outExpo)),
          }}
        />
        <AbsoluteFill style={{ backgroundColor: C.green, mixBlendMode: "multiply", opacity: 0.55 }} />
      </div>

      {/* Odometer clock on the photo edge */}
      <div
        style={{
          position: "absolute",
          top: 960,
          right: 80,
          background: C.black,
          color: C.white,
          padding: "18px 34px 10px",
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          clipPath: `inset(0 0 0 ${ip(frame, [14, 28], [100, 0], E.inOutQuint)}%)`,
        }}
      >
        <Digit from={fd[0]} to={td[0]} start={20} dur={26} />
        <Digit from={fd[1]} to={td[1]} start={22} dur={26} />
        <span style={{ color: C.green }}>:</span>
        <Digit from={fd[2]} to={td[2]} start={24} dur={26} />
        <Digit from={fd[3]} to={td[3]} start={26} dur={26} />
      </div>

      {/* Headline */}
      <div style={{ position: "absolute", top: 1250, left: 80 }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ ...headline, translate: `0px ${ip(frame, [26, 42], [105, 0], E.outExpo)}%` }}>{line1}</div>
        </div>
        <div style={{ position: "relative", overflow: "hidden", alignSelf: "flex-start", display: "inline-block" }}>
          <div
            style={{
              position: "absolute",
              left: -10,
              right: -14,
              top: "14%",
              bottom: "2%",
              backgroundColor: C.green,
              transformOrigin: "0 50%",
              scale: `${ip(frame, [42, 56], [0, 1], E.inOutQuint)} 1`,
            }}
          />
          <div style={{ ...headline, position: "relative", translate: `0px ${ip(frame, [30, 46], [105, 0], E.outExpo)}%` }}>{line2}</div>
        </div>
      </div>

      {/* Body + bottom rule */}
      <div
        style={{
          position: "absolute",
          top: 1690,
          left: 80,
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 42,
          color: C.black,
          opacity: ip(frame, [48, 60], [0, 1]),
          translate: `0px ${ip(frame, [48, 64], [20, 0])}px`,
        }}
      >
        {body}
      </div>
      <div style={{ position: "absolute", top: 1790, left: 80, right: 80, height: 3, backgroundColor: C.black, transformOrigin: "100% 50%", scale: `${rule(6)} 1` }} />
    </AbsoluteFill>
  );
};
