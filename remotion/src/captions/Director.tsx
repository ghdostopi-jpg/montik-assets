import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip } from "../lib/anim";
import { FONT_BODY } from "../lib/brand";
import { between, W } from "./core";
import { SABRINA_WORDS } from "./sabrina";
import { BoxCaption, CinematicTitle, DynamicCaption, EditorialCaption, MarkerCaption, SplitLineCaption, StompCaption, Tilt3DCaption } from "./styles";
import { CaptionTheme, CaptionThemeProvider, leadColor, Purpose, useCaptionTheme } from "./theme";
import { SABRINA_THEME } from "./themes/sabrina";

export type Treatment = "stomp" | "marker" | "editorial" | "cinematic" | "dynamic" | "box" | "split" | "tilt3d";

/** Default treatment for each story moment; beats override it to keep variety. */
export const TREATMENT_FOR: Record<Purpose, Treatment> = {
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
  treatment?: Treatment;
  title?: string; // cinematic product moments
  kicker?: string;
};

export const BeatCaptions: React.FC<{ beat: Beat; words: W[] }> = ({ beat, words }) => {
  const th = useCaptionTheme();
  const kind = beat.treatment ?? TREATMENT_FOR[beat.purpose];
  const p = { words: between(words, beat.from - 0.01, beat.to), clipStart: beat.from, keywords: beat.keywords, lead: leadColor(th, beat.purpose) };
  switch (kind) {
    case "stomp": return <StompCaption {...p} />;
    case "marker": return <MarkerCaption {...p} />;
    case "editorial": return <EditorialCaption {...p} />;
    case "dynamic": return <DynamicCaption {...p} />;
    case "box": return <BoxCaption {...p} />;
    case "split": return <SplitLineCaption {...p} />;
    case "tilt3d": return <Tilt3DCaption {...p} />;
    case "cinematic": return <CinematicTitle title={beat.title ?? ""} kicker={beat.kicker} />;
  }
};

/** Lays every beat on the clip timeline under one theme. clipOffset = clip second at frame 0. */
export const CaptionDirector: React.FC<{ beats: Beat[]; words: W[]; theme: CaptionTheme; clipOffset?: number }> = ({ beats, words, theme, clipOffset = 0 }) => {
  const { fps } = useVideoConfig();
  return (
    <CaptionThemeProvider theme={theme}>
      <AbsoluteFill>
        {beats.map((b, i) => (
          <Sequence key={i} from={Math.round((b.from - clipOffset) * fps)} durationInFrames={Math.max(1, Math.round((b.to - b.from) * fps))} layout="absolute-fill">
            <BeatCaptions beat={b} words={words} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </CaptionThemeProvider>
  );
};

/**
 * MICROINFUSION SABRINA VIDOVIC: one identity (Rose Atelier), treatment changes
 * every few seconds with the story. Clip seconds of the talking-head take.
 */
export const SABRINA_BEATS: Beat[] = [
  { purpose: "hook", from: 0.4, to: 5.85, keywords: ["30", "drugačen"] },
  { purpose: "problem", from: 6.1, to: 9.75, keywords: ["enako", "včasih"] },
  { purpose: "solution", from: 9.85, to: 11.25, treatment: "split", keywords: ["zanimiv"] },
  { purpose: "product", from: 11.25, to: 14.35, title: "MicroInfusion Set", kicker: "Biostile" },
  { purpose: "solution", from: 14.4, to: 17.6, keywords: ["microneedling", "domačo"] },
  { purpose: "benefits", from: 17.7, to: 23.05, keywords: ["hialuronsko", "peptidi"] },
  { purpose: "benefits", from: 23.1, to: 26.55, treatment: "tilt3d", keywords: ["naravnega"] },
  { purpose: "benefits", from: 26.7, to: 31.75, treatment: "box", keywords: ["tednov"] },
  { purpose: "benefits", from: 31.9, to: 37.2, treatment: "marker", keywords: ["mikroiglice", "kanalčke"] },
  { purpose: "benefits", from: 37.3, to: 43.25, keywords: ["globlje"] },
  { purpose: "ease", from: 43.5, to: 47.9, treatment: "split", keywords: ["enostavno"] },
  { purpose: "ease", from: 47.95, to: 51.8, treatment: "dynamic", keywords: ["čas", "denar"] },
  { purpose: "problem", from: 51.9, to: 56.6, treatment: "box", keywords: ["čudežev"] },
  { purpose: "cta", from: 56.7, to: 62.7, keywords: ["nadgradim", "obraz"] },
];

/* ---------- Options preview: each treatment on its real line over a still of that moment ---------- */
const OPTIONS: { label: string; still: string; beat: Beat }[] = [
  { label: "Stomp: hook", still: "sabrina/s02.jpg", beat: SABRINA_BEATS[0] },
  { label: "Hand-drawn highlight: problem", still: "sabrina/s08.jpg", beat: SABRINA_BEATS[1] },
  { label: "Split-line: turn to solution", still: "sabrina/s08.jpg", beat: SABRINA_BEATS[2] },
  { label: "Cinematic title: product", still: "sabrina/s12.jpg", beat: SABRINA_BEATS[3] },
  { label: "Luxury editorial: solution", still: "sabrina/s12.jpg", beat: SABRINA_BEATS[4] },
  { label: "Dynamic word-by-word: ingredients", still: "sabrina/s19.jpg", beat: SABRINA_BEATS[5] },
  { label: "Subtle 3D: 97 %", still: "sabrina/s19.jpg", beat: SABRINA_BEATS[6] },
  { label: "Text boxes: how long it lasts", still: "sabrina/s45.jpg", beat: SABRINA_BEATS[7] },
  { label: "Luxury editorial: close", still: "sabrina/s57.jpg", beat: SABRINA_BEATS[13] },
];
export const OPTION_LABELS = OPTIONS.map((o) => o.label);
export const OPTION_FRAMES = (fps: number) => OPTIONS.map((o) => Math.round((o.beat.to - o.beat.from) * fps));

const Still: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#121014" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(ip(frame, [0, durationInFrames], [1.0, 1.05], E.linear)) }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(18,16,20,0.35) 0%, rgba(18,16,20,0) 30%, rgba(18,16,20,0) 58%, rgba(18,16,20,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

export const CaptionOptions: React.FC = () => {
  const { fps } = useVideoConfig();
  let at = 0;
  return (
    <CaptionThemeProvider theme={SABRINA_THEME}>
      <AbsoluteFill style={{ backgroundColor: "#121014" }}>
        {OPTIONS.map((o, i) => {
          const d = Math.round((o.beat.to - o.beat.from) * fps);
          const from = at;
          at += d;
          return (
            <Sequence key={i} from={from} durationInFrames={d}>
              <Still src={o.still} />
              <BeatCaptions beat={o.beat} words={SABRINA_WORDS} />
              <div style={{ position: "absolute", left: 40, bottom: 60, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, letterSpacing: "0.06em", color: "#F6EFE4", background: "rgba(18,16,20,0.6)", padding: "8px 16px", borderRadius: 6 }}>{o.label}</div>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </CaptionThemeProvider>
  );
};
