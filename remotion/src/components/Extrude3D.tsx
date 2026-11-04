import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch } from "../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/brand";

/**
 * Real 3D type built from stacked layers in CSS perspective: every glyph is
 * a stack of `depth` slices fading from brand green into near-black, with a
 * white front face. Glyphs fly in from deep Z on staggered springs while the
 * whole object swings from a steep angle to a hero angle, then keeps a slow
 * orbit. A light sweep crosses the front face and a soft contact shadow
 * grounds it. A supporting line and star row build in underneath.
 */
export const Extrude3D: React.FC<{
  text: string;
  sub?: string;
  stars?: number;
  size?: number;
  depth?: number;
}> = ({ text, sub, stars = 5, size = 470, depth = 22 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const swing = punch(frame, fps, 2, 90, 16);
  const ry = ip(swing, [0, 1], [-62, -16], E.linear) + ip(frame, [20, durationInFrames], [0, 10], E.linear);
  const rx = ip(swing, [0, 1], [28, 9], E.linear);
  const sweep = ip(frame, [22, 46], [-60, 160], E.inOutCubic);
  const glyphs = Array.from(text);

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <CameraMotionBlur shutterAngle={180} samples={7}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 1700, background: `radial-gradient(ellipse 70% 55% at 50% 44%, #1B2408 0%, ${C.black} 70%)` }}>
      {/* Contact shadow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 1130,
              width: 760,
              height: 90,
              marginLeft: -380,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(165,204,60,0.30) 0%, rgba(0,0,0,0) 70%)",
              opacity: ip(frame, [6, 26], [0, 1]),
              scale: `${ip(swing, [0, 1], [0.4, 1], E.linear)} 1`,
            }}
          />

          <div
            style={{
              display: "flex",
              transformStyle: "preserve-3d",
              transform: `translateY(-150px) rotateX(${rx}deg) rotateY(${ry}deg)`,
            }}
          >
            {glyphs.map((g, gi) => {
              const p = punch(frame, fps, gi * 4, 170, 15);
              const z = ip(p, [0, 1], [-2200, 0], E.linear);
              const rot = ip(p, [0, 1], [-90, 0], E.linear);
              return (
                <div
                  key={gi}
                  style={{
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${z}px) rotateX(${rot}deg)`,
                    opacity: ip(frame, [gi * 4, gi * 4 + 4], [0, 1], E.linear),
                  }}
                >
                  {Array.from({ length: depth }).map((_, k) => {
                    const layer = depth - 1 - k; // back to front
                    const isFront = layer === 0;
                    const shade = interpolateColors(layer, [1, depth * 0.35, depth - 1], [C.green, C.greenDeep, "#0E1404"]);
                    return (
                      <div
                        key={k}
                        style={{
                          position: k === depth - 1 ? "relative" : "absolute",
                          left: 0,
                          top: 0,
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          fontSize: size,
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                          whiteSpace: "pre",
                          transform: `translateZ(${-layer * 5}px)`,
                          color: isFront ? "transparent" : shade,
                          backgroundImage: isFront
                            ? `linear-gradient(105deg, ${C.white} ${sweep - 30}%, #F3FADF ${sweep - 8}%, ${C.white} ${sweep}%, #E9F3CF ${sweep + 6}%, ${C.white} ${sweep + 30}%)`
                            : undefined,
                          WebkitBackgroundClip: isFront ? "text" : undefined,
                          backgroundClip: isFront ? "text" : undefined,
                        }}
                      >
                        {g}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </CameraMotionBlur>

      {/* Stars */}
      <div style={{ position: "absolute", top: 1210, width: "100%", display: "flex", justifyContent: "center", gap: 22 }}>
        {Array.from({ length: stars }).map((_, i) => {
          const sp = punch(frame, fps, 26 + i * 3, 260, 12);
          return (
            <svg key={i} width={84} height={84} viewBox="0 0 24 24" style={{ scale: String(sp), rotate: `${ip(sp, [0, 1], [-90, 0], E.linear)}deg` }}>
              <path d="M12 2.2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17l-6.1 3.4 1.5-6.7L2.3 9.1l6.8-.7z" fill={C.green} />
            </svg>
          );
        })}
      </div>
      {sub ? (
        <div style={{ position: "absolute", top: 1340, width: "100%", textAlign: "center", overflow: "hidden" }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 58,
              color: C.white,
              letterSpacing: "0.01em",
              translate: `0px ${ip(frame, [40, 58], [110, 0], E.outExpo)}%`,
            }}
          >
            {sub}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
