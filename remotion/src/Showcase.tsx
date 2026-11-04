import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill } from "remotion";
import { Callouts } from "./components/Callouts";
import { CharCascade } from "./components/CharCascade";
import { CTA } from "./components/CTA";
import { EditorialHook } from "./components/EditorialHook";
import { Extrude3D } from "./components/Extrude3D";
import { MaskReveal } from "./components/MaskReveal";
import { Stomp } from "./components/Stomp";
import { glitch, shapeWipe, whipPan, zoomPunch } from "./components/Transitions";
import { TimedWord, UGCCaptions } from "./components/UGCCaptions";
import { WarpMorph } from "./components/WarpMorph";
import { C } from "./lib/brand";
import { Grain, PhotoBg, SectionTag, Vignette } from "./lib/Layers";

// Real word timings from the "1104.mp4" transcript in Montik (first 5 s).
const SPOKEN: TimedWord[] = (
  [
    ["Več", 0.21, 0.39], ["ur", 0.51, 0.57], ["ležanja", 0.69, 0.99], ["in", 1.05, 1.11], ["gledanja", 1.17, 1.47],
    ["v", 1.59, 1.65], ["strop,", 1.71, 1.89], ["joj,", 2.19, 2.31], ["samo", 2.49, 2.55], ["da", 2.61, 2.67],
    ["bi", 2.73, 2.79], ["lahko", 2.79, 2.85], ["zaspala.", 3.09, 3.51], ["Po", 3.75, 3.81], ["2", 3.87, 3.93],
    ["tednih", 4.11, 4.29], ["sem", 4.41, 4.47], ["rešila", 4.59, 4.83], ["problem.", 4.95, 5.25],
  ] as TimedWord[]
).map(([w, s, e]) => [w, s + 0.15, e + 0.15]);

const T = 14; // transition length in frames
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tr = (p: TransitionPresentation<any>) => (
  <TransitionSeries.Transition timing={linearTiming({ durationInFrames: T })} presentation={p} />
);

export const SCENES = {
  hook: 120,
  stomp: 105,
  mask: 105,
  cascade: 105,
  warp: 105,
  extrude: 110,
  captions: 165,
  callouts: 120,
  cta: 165,
};
export const SHOWCASE_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0) - 8 * T;

export const Scene = {
  Hook: () => (
    <AbsoluteFill>
      <EditorialHook src="bg/talk.jpg" from="23:37" to="01:00" line1="Spet budna" line2="ob enih?" body="Več ur ležanja in gledanja v strop." brand="Biostile" />
      <SectionTag n="01" label="Editorial hook" dark />
    </AbsoluteFill>
  ),
  Stomp: () => (
    <AbsoluteFill>
      <Stomp
        words={[
          { text: "Ena" },
          { text: "vrečka" },
          { text: "zvečer", accent: true },
          { text: "in" },
          { text: "to" },
          { text: "je" },
          { text: "to.", accent: true },
        ]}
      />
      <Grain opacity={0.08} />
      <SectionTag n="02" label="Stomp typography" />
    </AbsoluteFill>
  ),
  Mask: () => (
    <AbsoluteFill>
      <PhotoBg src="bg/pour.jpg" dim={0.5} />
      <Vignette />
      <MaskReveal lines={["Razlika med", "enim in drugim", "je ogromna."]} accentLine={2} />
      <Grain />
      <SectionTag n="03" label="Masked block reveal" />
    </AbsoluteFill>
  ),
  Cascade: () => (
    <AbsoluteFill style={{ backgroundColor: C.green }}>
      <CharCascade line1="Pet oblik" line2="magnezija" line3="za jutro, dan in noč" />
      <Grain opacity={0.06} />
      <SectionTag n="04" label="Character cascade and split" dark />
    </AbsoluteFill>
  ),
  Warp: () => (
    <AbsoluteFill>
      <WarpMorph words={["Jabolko", "Meta"]} label="OKUS" sub="Ni grenek in ni presladek." />
      <Grain />
      <SectionTag n="05" label="Liquid warp and morph" />
    </AbsoluteFill>
  ),
  Extrude: () => (
    <AbsoluteFill>
      <Extrude3D text="4,8" sub="Več kot 100.000 zadovoljnih uporabnikov" />
      <Grain />
      <SectionTag n="06" label="3D extruded type" />
    </AbsoluteFill>
  ),
  Captions: () => (
    <AbsoluteFill>
      <PhotoBg src="bg/talk.jpg" from={1.1} to={1.0} originY="35%" />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.2) 100%)" }} />
      <UGCCaptions words={SPOKEN} keywords={["zaspala", "problem", "strop"]} hook="Kako sem končno zaspala" />
      <SectionTag n="07" label="UGC captions" />
    </AbsoluteFill>
  ),
  Callouts: () => (
    <AbsoluteFill>
      <Callouts
        src="bg/box-open.jpg"
        spec={{
          circle: { cx: 567, cy: 912, rx: 300, ry: 100 },
          label: { x: 80, y: 220, title: "5 oblik", line: "magnezija v eni vrečki" },
          arrow: { x1: 450, y1: 520, x2: 560, y2: 786, bend: 170 },
          sticker: { x: 850, y: 1480, top: "30", bottom: "vrečk" },
        }}
      />
      <Grain opacity={0.05} />
      <SectionTag n="08" label="Callouts and stickers" />
    </AbsoluteFill>
  ),
  CTA: () => (
    <AbsoluteFill>
      <CTA
        topLine="Akcija ne traja dolgo"
        giftLabel="+1 gratis"
        percent={33}
        payOld="3"
        payNew="2"
        payTail="škatli, dobiš 3"
        button="Preveri ponudbo"
        note="3 škatle so 90 dni zaloge"
      />
      <Grain opacity={0.06} />
      <SectionTag n="09" label="CTA and discount reveal" />
    </AbsoluteFill>
  ),
};

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.black }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES.hook}><Scene.Hook /></TransitionSeries.Sequence>
      {tr(whipPan("left"))}
      <TransitionSeries.Sequence durationInFrames={SCENES.stomp}><Scene.Stomp /></TransitionSeries.Sequence>
      {tr(zoomPunch())}
      <TransitionSeries.Sequence durationInFrames={SCENES.mask}><Scene.Mask /></TransitionSeries.Sequence>
      {tr(glitch())}
      <TransitionSeries.Sequence durationInFrames={SCENES.cascade}><Scene.Cascade /></TransitionSeries.Sequence>
      {tr(shapeWipe("circle"))}
      <TransitionSeries.Sequence durationInFrames={SCENES.warp}><Scene.Warp /></TransitionSeries.Sequence>
      {tr(shapeWipe("bars"))}
      <TransitionSeries.Sequence durationInFrames={SCENES.extrude}><Scene.Extrude /></TransitionSeries.Sequence>
      {tr(whipPan("up"))}
      <TransitionSeries.Sequence durationInFrames={SCENES.captions}><Scene.Captions /></TransitionSeries.Sequence>
      {tr(zoomPunch())}
      <TransitionSeries.Sequence durationInFrames={SCENES.callouts}><Scene.Callouts /></TransitionSeries.Sequence>
      {tr(glitch())}
      <TransitionSeries.Sequence durationInFrames={SCENES.cta}><Scene.CTA /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
