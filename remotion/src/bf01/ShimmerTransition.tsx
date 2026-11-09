// ShimmerTransition — APPROVED by the user 8 Nov 2026 ("shimmer sweep na transitionu, občasno").
// Technique studied from Onda's shimmer-sweep (MIT), re-written in-house.
// A soft specular band glides across the frame AT A CUT: it peaks exactly on the cut frame, so the
// light "wipes" one shot into the next. Use occasionally: max 1–2 per ad, on the most important cut
// (e.g. product reveal, BEFORE→AFTER section start). Never on every transition.
//
// Usage (overlay, above both shots):
//   <Sequence from={cutFrame - 12} durationInFrames={24}><ShimmerTransition frames={24} /></Sequence>   // at 60 fps: from={cut-24}, 48, frames={48}
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

export const ShimmerTransition: React.FC<{
  angle?: number;      // band angle in degrees (105 = slight diagonal, left→right)
  warmth?: string;     // band colour, rgb triplet
  strength?: number;   // 0..1 peak intensity
  flash?: number;      // 0..1 brief full-frame lift at the cut to hide the seam
  frames?: number;     // length of the sweep; the cut sits at frames/2 (24 @30fps, 48 @60fps)
}> = ({ angle = 105, warmth = "255,244,226", strength = 0.75, flash = 0.18, frames = 24 }) => {
  const f = useCurrentFrame();
  const d = frames;
  const p = interpolate(f, [0, d], [-35, 135], { easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lift = interpolate(f, [d / 2 - 4, d / 2, d / 2 + 6], [0, flash, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* wide soft sheen */}
      <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, rgba(${warmth},0) ${p - 16}%, rgba(${warmth},${0.55 * strength}) ${p}%, rgba(${warmth},0) ${p + 16}%)`, mixBlendMode: "soft-light" }} />
      {/* narrow bright core */}
      <AbsoluteFill style={{ background: `linear-gradient(${angle}deg, rgba(${warmth},0) ${p - 4}%, rgba(${warmth},${0.32 * strength}) ${p}%, rgba(${warmth},0) ${p + 4}%)`, mixBlendMode: "screen" }} />
      {/* tiny lift at the cut so the seam disappears inside the light */}
      <AbsoluteFill style={{ background: `rgba(${warmth},${lift})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
