import React from "react";
import { Composition, Folder } from "remotion";
import { VO01, DUR as VO01_DUR, FPS as VO01_FPS, durFor as VO01_durFor } from "./vo01/VO01";
import "./lib/brand";
import "./captions/beauty";
import { CaptionOptions, OPTION_FRAMES } from "./captions/Director";
import { OVERLAYS } from "./OverlayTests";
import { Scene, SCENES, Showcase, SHOWCASE_FRAMES } from "./Showcase";
import { ItAd } from "./biostile/ItAd";

const base = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="VO01" component={VO01 as any} fps={VO01_FPS} width={1080} height={1920} durationInFrames={Math.round(VO01_DUR * VO01_FPS)} defaultProps={{ audio: "vo01/VO01_MIX_v1.wav" } as any} />
    <Composition id="COLLAGEN-VO01-HOOK-B" component={VO01 as any} fps={VO01_FPS} width={1080} height={1920} durationInFrames={Math.round(VO01_durFor("B") * VO01_FPS)} defaultProps={{ audio: "vo01/COLLAGEN_VO01_HOOK_B_MIX.wav", variant: "B" } as any} />
    <Composition id="COLLAGEN-VO01-HOOK-C" component={VO01 as any} fps={VO01_FPS} width={1080} height={1920} durationInFrames={Math.round(VO01_durFor("C") * VO01_FPS)} defaultProps={{ audio: "vo01/COLLAGEN_VO01_HOOK_C_MIX.wav", variant: "C" } as any} />
    <Composition id="VO01-QC" component={VO01 as any} fps={VO01_FPS} width={1080} height={1920} durationInFrames={Math.round(VO01_DUR * VO01_FPS)} defaultProps={{ qcText: true } as any} />
    <Composition id="ItAd" component={ItAd as any} fps={60} width={1080} height={1920} durationInFrames={60} defaultProps={{ video: "", words: [], keywords: [], yMap: [], hide: [], callouts: [], frames: 60 } as any} calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
    <Composition id="Showcase" component={Showcase} durationInFrames={SHOWCASE_FRAMES} {...base} />
    <Folder name="Components">
      <Composition id="EditorialHook" component={Scene.Hook} durationInFrames={SCENES.hook} {...base} />
      <Composition id="Stomp" component={Scene.Stomp} durationInFrames={SCENES.stomp} {...base} />
      <Composition id="MaskReveal" component={Scene.Mask} durationInFrames={SCENES.mask} {...base} />
      <Composition id="CharCascade" component={Scene.Cascade} durationInFrames={SCENES.cascade} {...base} />
      <Composition id="WarpMorph" component={Scene.Warp} durationInFrames={SCENES.warp} {...base} />
      <Composition id="Extrude3D" component={Scene.Extrude} durationInFrames={SCENES.extrude} {...base} />
      <Composition id="UGCCaptions" component={Scene.Captions} durationInFrames={SCENES.captions} {...base} />
      <Composition id="Callouts" component={Scene.Callouts} durationInFrames={SCENES.callouts} {...base} />
      <Composition id="CTA" component={Scene.CTA} durationInFrames={SCENES.cta} {...base} />
    </Folder>
    <Composition id="CaptionOptions" component={CaptionOptions} durationInFrames={OPTION_FRAMES(30).reduce((a, b) => a + b, 0)} {...base} />
    <Folder name="Overlays">
      {Object.entries(OVERLAYS).map(([id, o]) => (
        <Composition key={id} id={id} component={o.C} durationInFrames={o.d} {...base} />
      ))}
    </Folder>
  </>
);
