import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "./anim";
import { C, FONT_BODY } from "./brand";

/** Photo background with a slow Ken Burns push and optional darkening. */
export const PhotoBg: React.FC<{
  src: string;
  from?: number;
  to?: number;
  dim?: number;
  originY?: string;
  style?: React.CSSProperties;
}> = ({ src, from = 1.12, to = 1.0, dim = 0, originY = "45%", style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.black, ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: `50% ${originY}`,
          scale: String(ip(frame, [0, durationInFrames], [from, to], E.outQuart)),
        }}
      />
      {dim > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

/** Animated film grain: a fresh noise seed every frame keeps flat colour from looking digital. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${frame % 8}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame % 8})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Soft edge darkening for photo scenes. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Small corner tag naming the effect, for the review showcase only. */
export const SectionTag: React.FC<{ n: string; label: string; dark?: boolean }> = ({ n, label, dark }) => {
  const frame = useCurrentFrame();
  const col = dark ? C.black : C.white;
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 56,
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: 26,
        letterSpacing: "0.08em",
        color: col,
        opacity: ip(frame, [4, 14], [0, 0.85]),
        translate: `${ip(frame, [4, 18], [-16, 0])}px 0px`,
      }}
    >
      <span style={{ padding: "4px 10px", border: `2px solid ${col}`, borderRadius: 4 }}>{n}</span>
      <span>{label}</span>
    </div>
  );
};
