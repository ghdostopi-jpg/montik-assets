import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import React, { useId } from "react";
import { AbsoluteFill, random } from "remotion";
import { E } from "../lib/anim";
import { C } from "../lib/brand";
import { DirBlur } from "../lib/DirBlur";

type P = Record<string, unknown>;

/* ---------- Whip pan: both shots travel together with directional blur ---------- */
type WhipProps = { direction: "left" | "up" };
const Whip: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const e = E.inOutQuint(presentationProgress);
  const pos = presentationDirection === "exiting" ? -e * 100 : (1 - e) * 100;
  const speed = Math.pow(Math.sin(Math.PI * presentationProgress), 1.4); // 0..1
  const blur = speed * 170;
  const up = passedProps.direction === "up";
  return (
    <AbsoluteFill style={{ translate: up ? `0px ${pos}%` : `${pos}% 0px`, scale: String(1 + speed * 0.06) }}>
      <DirBlur vx={up ? 0 : blur} vy={up ? blur : 0} strength={1} style={{ position: "absolute", inset: 0 }}>
        {children}
      </DirBlur>
    </AbsoluteFill>
  );
};
export const whipPan = (direction: WhipProps["direction"] = "left"): TransitionPresentation<WhipProps> => ({ component: Whip, props: { direction } });

/* ---------- Zoom punch: push through the cut with a flash ---------- */
const Zoom: React.FC<TransitionPresentationComponentProps<P>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const exiting = presentationDirection === "exiting";
  const scale = exiting ? 1 + E.inExpo(Math.min(p / 0.5, 1)) * 1.8 : 0.55 + E.outExpo(Math.max((p - 0.5) / 0.5, 0)) * 0.45;
  const blur = Math.pow(Math.sin(Math.PI * p), 2) * 22;
  const visible = exiting ? p < 0.5 : p >= 0.5;
  return (
    <AbsoluteFill style={{ opacity: visible ? 1 : 0 }}>
      <AbsoluteFill style={{ scale: String(scale), filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>
      {!exiting ? (
        <AbsoluteFill style={{ backgroundColor: C.white, opacity: Math.max(0, 1 - Math.abs(p - 0.5) * 6) * 0.85, pointerEvents: "none" }} />
      ) : null}
    </AbsoluteFill>
  );
};
export const zoomPunch = (): TransitionPresentation<P> => ({ component: Zoom, props: {} });

/* ---------- Glitch: RGB split and horizontal tearing around the cut ---------- */
const Glitch: React.FC<TransitionPresentationComponentProps<P>> = ({ children, presentationDirection, presentationProgress: p, presentationDurationInFrames }) => {
  const id = `gl${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const exiting = presentationDirection === "exiting";
  const visible = exiting ? p < 0.5 : p >= 0.5;
  const f = Math.round(p * presentationDurationInFrames);
  const k = Math.pow(Math.sin(Math.PI * p), 0.7); // intensity
  const r = (s: string) => random(`${id}${s}${f}`);
  const split = k * (18 + r("s") * 26);
  const tear = k * (60 + r("t") * 140);
  return (
    <AbsoluteFill style={{ opacity: visible ? 1 : 0 }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={`0.0001 ${0.02 + r("f") * 0.05}`} numOctaves={1} seed={f} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={tear} xChannelSelector="R" yChannelSelector="A" result="torn" />
          <feColorMatrix in="torn" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx={split} dy={0} result="redO" />
          <feColorMatrix in="torn" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feColorMatrix in="torn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feOffset in="blue" dx={-split} dy={r("y") * 6} result="blueO" />
          <feBlend in="redO" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blueO" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: k > 0.05 ? `url(#${id})` : undefined, translate: `${(r("x") - 0.5) * 30 * k}px 0px` }}>{children}</AbsoluteFill>
      {/* Brand-green data bars */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${r(`b${i}`) * 100}%`,
            height: 6 + r(`h${i}`) * 40,
            backgroundColor: i % 2 ? C.green : C.white,
            mixBlendMode: "difference",
            opacity: k > 0.35 && r(`o${i}`) > 0.35 ? 0.9 : 0,
            translate: `${(r(`d${i}`) - 0.5) * 200}px 0px`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
export const glitch = (): TransitionPresentation<P> => ({ component: Glitch, props: {} });

/* ---------- Shape wipes: an expanding circle with a green ring, or falling bars ---------- */
type ShapeProps = { shape: "circle" | "bars" };
const Shape: React.FC<TransitionPresentationComponentProps<ShapeProps>> = ({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  if (passedProps.shape === "circle") {
    const r = E.inOutQuint(p) * 125; // % of the frame
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `circle(${r}% at 50% 55%)` }}>{children}</AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            width: `${r * 2 * 15.58}px`,
            height: `${r * 2 * 15.58}px`,
            marginLeft: `${-r * 15.58}px`,
            marginTop: `${-r * 15.58}px`,
            borderRadius: "50%",
            border: `${36 * (1 - p) + 6}px solid ${C.green}`,
            opacity: p < 0.98 ? 1 : 0,
          }}
        />
      </AbsoluteFill>
    );
  }
  // bars: six columns fall in to cover, then keep falling to reveal
  const n = 6;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p >= 0.5 ? 1 : 0 }}>{children}</AbsoluteFill>
      {Array.from({ length: n }).map((_, i) => {
        const st = 0.04;
        const span = 0.5 - st * (n - 1);
        const q1 = Math.min(1, Math.max(0, (p - i * st) / span));
        const q2 = Math.min(1, Math.max(0, (p - 0.5 - i * st) / span));
        const y = p < 0.5 ? -100 + 100 * E.outQuart(q1) : 100 * E.inQuart(q2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(i / n) * 100}%`,
              width: `${100 / n + 0.3}%`,
              backgroundColor: i % 2 ? C.green : C.black,
              translate: `0px ${y}%`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
export const shapeWipe = (shape: ShapeProps["shape"]): TransitionPresentation<ShapeProps> => ({ component: Shape, props: { shape } });
