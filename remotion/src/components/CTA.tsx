import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch, shake } from "../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../lib/brand";

const Gift: React.FC<{ lid: number; land: number }> = ({ lid, land }) => {
  const ribbon = C.white;
  return (
    <div style={{ position: "relative", width: 400, height: 340 }}>
      {/* body */}
      <div style={{ position: "absolute", left: 20, top: 110, width: 360, height: 230, backgroundColor: C.green, borderRadius: 10, transformOrigin: "50% 100%", scale: `${1 + land * 0.08} ${1 - land * 0.1}` }}>
        <div style={{ position: "absolute", left: 155, top: 0, width: 50, height: "100%", backgroundColor: ribbon }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "rgba(0,0,0,0.18)" }} />
      </div>
      {/* lid */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 40,
          width: 400,
          height: 84,
          transformOrigin: "15% 100%",
          translate: `${lid * 40}px ${-lid * 230}px`,
          rotate: `${-lid * 24}deg`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundColor: C.green, borderRadius: 10, filter: "brightness(1.08)" }} />
        <div style={{ position: "absolute", left: 175, top: 0, width: 50, height: "100%", backgroundColor: ribbon }} />
        {[-1, 1].map((s) => (
          <div
            key={s}
            style={{
              position: "absolute",
              left: 200 - 55 + s * 48,
              top: -62,
              width: 110,
              height: 70,
              border: `18px solid ${ribbon}`,
              borderRadius: "50%",
              rotate: `${s * 28}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Offer close. A gift drops in and lands with a squash; its lid springs off
 * with light rays and confetti while "+1 GRATIS" rises out of it. A ring draws
 * around a discount that counts up, the old count is struck through and
 * replaced, then the button scales in, catches a light sweep and gets tapped
 * (press, ripple, release). Confetti is physical: launch velocity, gravity,
 * spin and drag.
 */
export const CTA: React.FC<{
  topLine: string;
  giftLabel: string;
  percent: number;
  payOld: string;
  payNew: string;
  payTail: string;
  button: string;
  note?: string;
}> = ({ topLine, giftLabel, percent, payOld, payNew, payTail, button, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = punch(frame, fps, 0, 210, 14);
  const landT = frame - 9;
  const land = landT < 0 ? 0 : ip(landT, [0, 3, 9], [0, 1, 0], E.outQuart);
  const LID = 24;
  const lid = punch(frame, fps, LID, 180, 12);
  const sh = shake(frame, LID, 14, "cta", 8);
  const rays = ip(frame, [LID, LID + 10], [0, 1], E.outExpo);
  const gratis = punch(frame, fps, LID + 4, 200, 13);

  const ringStart = 44;
  const ring = ip(frame, [ringStart, ringStart + 30], [0, 1], E.inOutCubic);
  const count = Math.round(ip(frame, [ringStart, ringStart + 30], [0, percent], E.outQuart));
  const strike = ip(frame, [78, 88], [0, 1], E.inOutCubic);
  const newPop = punch(frame, fps, 86, 300, 13);
  const btn = punch(frame, fps, 96, 220, 14);
  const shine = ip(frame, [110, 128], [-40, 140], E.inOutCubic);
  const TAP = 136;
  const press = frame < TAP ? 1 : ip(frame, [TAP, TAP + 3, TAP + 10], [1, 0.92, 1], E.outQuart);
  const ripple = frame - TAP;

  const R = 190;
  const circ = 2 * Math.PI * R;

  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      {/* Light rays */}
      <div
        style={{
          position: "absolute",
          left: 540 - 700,
          top: 560 - 700,
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `repeating-conic-gradient(from ${frame * 0.6}deg, rgba(165,204,60,0.16) 0deg 7deg, rgba(165,204,60,0) 7deg 22deg)`,
          maskImage: "radial-gradient(circle, black 0%, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 62%)",
          opacity: rays,
          scale: String(ip(frame, [LID, LID + 20], [0.4, 1], E.outExpo)),
        }}
      />

      {/* Top line */}
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", overflow: "hidden" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: "0.04em", textTransform: "uppercase", color: C.white, translate: `0px ${ip(frame, [0, 14], [105, 0])}%` }}>
          {topLine}
        </div>
      </div>

      <AbsoluteFill style={{ translate: `${sh.x}px ${sh.y}px` }}>
        {/* Gift */}
        <div style={{ position: "absolute", left: 340, top: 380, translate: `0px ${ip(drop, [0, 1], [-900, 0], E.linear)}px` }}>
          <Gift lid={lid} land={land} />
        </div>
        {/* +1 GRATIS rising out of the box */}
        <div
          style={{
            position: "absolute",
            top: 330,
            width: "100%",
            textAlign: "center",
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 150,
            color: C.white,
            textTransform: "uppercase",
            opacity: ip(frame, [LID + 4, LID + 8], [0, 1], E.linear),
            translate: `0px ${ip(gratis, [0, 1], [180, -40], E.linear)}px`,
            scale: String(ip(gratis, [0, 1], [0.4, 1], E.linear)),
          }}
        >
          {giftLabel}
        </div>
        {/* Confetti */}
        {Array.from({ length: 26 }).map((_, i) => {
          const t = (frame - LID) / fps;
          if (t < 0) return null;
          const a = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * 2.2;
          const v = 900 + random(`cv${i}`) * 900;
          const drag = 1 - Math.min(t * 0.5, 0.6);
          const x = 540 + Math.cos(a) * v * t * drag;
          const y = 560 + Math.sin(a) * v * t * drag + 1600 * t * t;
          const col = [C.green, C.white, C.green][i % 3];
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 18 + random(`cw${i}`) * 14,
                height: 10 + random(`ch${i}`) * 8,
                backgroundColor: col,
                rotate: `${t * 720 * (random(`cr${i}`) - 0.5) * 2}deg`,
                opacity: ip(t, [1.2, 1.8], [1, 0], E.linear),
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Discount ring + counter */}
      <div style={{ position: "absolute", left: 540 - R - 30, top: 870, width: (R + 30) * 2, height: (R + 30) * 2 }}>
        <CameraMotionBlur shutterAngle={180} samples={5}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", backgroundColor: C.black, borderRadius: "50%" }}>
        <svg width={(R + 30) * 2} height={(R + 30) * 2} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
          <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={14} />
          <circle cx={R + 30} cy={R + 30} r={R} fill="none" stroke={C.green} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${circ * ring} ${circ}`} />
        </svg>

            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 200,
                color: C.green,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.03em",
                opacity: ip(frame, [ringStart, ringStart + 6], [0, 1], E.linear),
                scale: String(ip(frame, [ringStart, ringStart + 12], [1.4, 1], E.outExpo)),
              }}
            >
              −{count}<span style={{ fontSize: 120 }}> %</span>
            </div>
          </AbsoluteFill>
        </CameraMotionBlur>
      </div>

      {/* Pay line with strike */}
      <div style={{ position: "absolute", top: 1360, width: "100%", display: "flex", justifyContent: "center", alignItems: "baseline", gap: 20, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 64, color: C.white, opacity: ip(frame, [66, 76], [0, 1], E.linear) }}>
        <span>Plačaš</span>
        <span style={{ position: "relative", color: "rgba(255,255,255,0.55)" }}>
          {payOld}
          <span style={{ position: "absolute", left: -8, right: -8, top: "52%", height: 8, backgroundColor: C.green, rotate: "-8deg", transformOrigin: "0 50%", scale: `${strike} 1` }} />
        </span>
        <span style={{ display: "inline-block", color: C.green, fontWeight: 700, scale: String(newPop), minWidth: 40 }}>{payNew}</span>
        <span>{payTail}</span>
      </div>

      {/* Button */}
      <div style={{ position: "absolute", top: 1500, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", scale: String(btn * press) }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "34px 74px 30px",
              borderRadius: 999,
              backgroundColor: C.green,
              color: C.black,
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 76,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: 22,
              boxShadow: "0 18px 50px rgba(165,204,60,0.35)",
            }}
          >
            {button}
            <svg width={56} height={56} viewBox="0 0 24 24" style={{ translate: `${ip(frame, [104, 114], [-16, 0])}px 0px` }}>
              <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke={C.black} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ position: "absolute", top: -20, bottom: -20, width: 90, left: `${shine}%`, background: "rgba(255,255,255,0.55)", rotate: "20deg", filter: "blur(6px)" }} />
          </div>
          {ripple >= 0 ? (
            <div
              style={{
                position: "absolute",
                left: "72%",
                top: "50%",
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                borderRadius: "50%",
                border: `6px solid ${C.white}`,
                scale: String(ip(ripple, [0, 14], [0.3, 6], E.outExpo)),
                opacity: ip(ripple, [0, 14], [0.9, 0], E.outQuart),
              }}
            />
          ) : null}
        </div>
      </div>
      {note ? (
        <div style={{ position: "absolute", top: 1720, width: "100%", textAlign: "center", fontFamily: FONT_BODY, fontWeight: 500, fontSize: 38, color: "rgba(255,255,255,0.8)", opacity: ip(frame, [110, 122], [0, 1]) }}>
          {note}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
