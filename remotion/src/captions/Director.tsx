import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { FONT_BODY } from "../lib/brand";
import { B } from "./beauty";
import { between, W } from "./core";
import { SABRINA_WORDS } from "./sabrina";
import { BoxCaption, CinematicTitle, DynamicCaption, EditorialCaption, MarkerCaption, StompCaption } from "./styles";

/** The emotional job of a moment decides its caption treatment. */
export type Purpose = "hook" | "problem" | "solution" | "product" | "benefits" | "ease" | "cta";

/** Default pairing of purpose to style; a beat can override it. */
export const STYLE_FOR: Record<Purpose, "stomp" | "marker" | "editorial" | "cinematic" | "dynamic" | "box"> = {
  hook: "stomp",
  problem: "marker",
  solution: "editorial",
  product: "cinematic",
  benefits: "dynamic",
  ease: "box",
  cta: "editorial",
};

export type Beat = {
  purpose: Purpose;
  from: number; // clip seconds
  to: number;
  keywords?: string[];
  style?: (typeof STYLE_FOR)[Purpose];
  title?: string; // for cinematic product moments
  kicker?: string;
};

/** Renders one beat's captions with the chosen style; frame 0 = beat.from. */
export const BeatCaptions: React.FC<{ beat: Beat; words: W[] }> = ({ beat, words }) => {
  const style = beat.style ?? STYLE_FOR[beat.purpose];
  const ws = between(words, beat.from - 0.01, beat.to);
  const p = { words: ws, clipStart: beat.from, keywords: beat.keywords };
  switch (style) {
    case "stomp":
      return <StompCaption {...p} />;
    case "marker":
      return <MarkerCaption {...p} />;
    case "editorial":
      return <EditorialCaption {...p} />;
    case "dynamic":
      return <DynamicCaption {...p} />;
    case "box":
      return <BoxCaption {...p} />;
    case "cinematic":
      return (
        <>
          <CinematicTitle title={beat.title ?? ""} kicker={beat.kicker} />
        </>
      );
  }
};

/**
 * Caption director: lays every beat on the clip's own timeline, so it can sit
 * on top of the talking-head video (or be rendered as a transparent overlay).
 */
export const CaptionDirector: React.FC<{ beats: Beat[]; words: W[]; clipOffset?: number }> = ({ beats, words, clipOffset = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {beats.map((b, i) => (
        <Sequence key={i} from={Math.round((b.from - clipOffset) * fps)} durationInFrames={Math.max(1, Math.round((b.to - b.from) * fps))} layout="absolute-fill">
          <BeatCaptions beat={b} words={words} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/** Recommended plan for MICROINFUSION SABRINA VIDOVIC (clip seconds of m_w54ujm6y7). */
export const SABRINA_BEATS: Beat[] = [
  { purpose: "hook", from: 0.4, to: 5.85, keywords: ["30", "drugačen"] },
  { purpose: "problem", from: 6.1, to: 9.75, keywords: ["enako", "včasih"] },
  { purpose: "solution", from: 9.85, to: 11.25, keywords: ["zanimiv"] },
  { purpose: "product", from: 11.25, to: 14.35, title: "MicroInfusion Set", kicker: "Biostile" },
  { purpose: "solution", from: 14.4, to: 17.6, keywords: ["microneedling", "domačo"] },
  { purpose: "benefits", from: 17.7, to: 26.55, keywords: ["hialuronsko", "naravnega"] },
  { purpose: "benefits", from: 26.7, to: 31.75 },
  { purpose: "benefits", from: 31.9, to: 43.25, style: "marker", keywords: ["mikroiglice", "globlje"] },
  { purpose: "ease", from: 43.5, to: 51.8, keywords: ["enostavno", "doma"] },
  { purpose: "cta", from: 51.9, to: 56.6, style: "box", keywords: ["čudežev"] },
  { purpose: "cta", from: 56.7, to: 62.7, keywords: ["nadgradim", "obraz"] },
];

/* ---------- Style options preview: each style on its real line, over a still of that moment ---------- */
const OPTIONS: { label: string; still: string; beat: Beat }[] = [
  { label: "1  Stomp  (hook)", still: "sabrina/s02.jpg", beat: SABRINA_BEATS[0] },
  { label: "4  Hand-drawn highlight  (problem)", still: "sabrina/s08.jpg", beat: SABRINA_BEATS[1] },
  { label: "5  Cinematic product  (product)", still: "sabrina/s12.jpg", beat: SABRINA_BEATS[3] },
  { label: "2  Luxury editorial  (solution)", still: "sabrina/s12.jpg", beat: SABRINA_BEATS[4] },
  { label: "6  Dynamic word-by-word  (benefits)", still: "sabrina/s19.jpg", beat: SABRINA_BEATS[5] },
  { label: "3  Black text boxes  (ease)", still: "sabrina/s45.jpg", beat: { ...SABRINA_BEATS[8], from: 43.5, to: 47.9 } },
  { label: "2  Luxury editorial  (close)", still: "sabrina/s57.jpg", beat: SABRINA_BEATS[10] },
];
export const OPTION_FRAMES = (fps: number) => OPTIONS.map((o) => Math.round((o.beat.to - o.beat.from) * fps));

const Still: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: B.ink }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(ip(frame, [0, durationInFrames], [1.0, 1.05], E.linear)) }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(18,16,20,0.35) 0%, rgba(18,16,20,0) 30%, rgba(18,16,20,0) 58%, rgba(18,16,20,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

export const CaptionOptions: React.FC = () => {
  const { fps } = useVideoConfig();
  let at = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: B.ink }}>
      {OPTIONS.map((o, i) => {
        const d = Math.round((o.beat.to - o.beat.from) * fps);
        const from = at;
        at += d;
        return (
          <Sequence key={i} from={from} durationInFrames={d}>
            <Still src={o.still} />
            <BeatCaptions beat={o.beat} words={SABRINA_WORDS} />
            <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: "0.06em", color: B.cream, background: "rgba(18,16,20,0.6)", padding: "8px 16px", borderRadius: 6 }}>{o.label}</div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
