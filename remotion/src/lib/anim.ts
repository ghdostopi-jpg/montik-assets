import { Easing, interpolate, random, spring } from "remotion";

/** Motion-design easing presets (cubic-bezier). */
export const E = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  inQuart: Easing.bezier(0.5, 0, 0.75, 0),
  inOutQuint: Easing.bezier(0.83, 0, 0.17, 1),
  inOutCubic: Easing.bezier(0.65, 0, 0.35, 1),
  backOut: Easing.bezier(0.34, 1.56, 0.64, 1),
  linear: Easing.linear,
};

/** Clamped interpolate, the default for every keyframe in this library. */
export const ip = (
  f: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = E.outExpo,
) =>
  interpolate(f, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** A punchy spring used for impacts. */
export const punch = (frame: number, fps: number, delay = 0, stiffness = 320, damping = 13) =>
  spring({ frame: frame - delay, fps, config: { stiffness, damping, mass: 0.7 } });

/** Deterministic, decaying camera shake after an impact frame. */
export const shake = (frame: number, at: number, amp: number, seed: string, length = 10) => {
  const t = frame - at;
  if (t < 0 || t > length) return { x: 0, y: 0, r: 0 };
  const decay = Math.pow(1 - t / length, 2);
  return {
    x: (random(`${seed}-x-${frame}`) * 2 - 1) * amp * decay,
    y: (random(`${seed}-y-${frame}`) * 2 - 1) * amp * decay,
    r: (random(`${seed}-r-${frame}`) * 2 - 1) * amp * 0.04 * decay,
  };
};

/** Velocity of a 1D motion function, in px per frame. Drives directional blur. */
export const velocity = (fn: (f: number) => number, frame: number) => fn(frame) - fn(frame - 1);
