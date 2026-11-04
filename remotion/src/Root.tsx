import React from "react";
import { Composition, Folder } from "remotion";
import "./lib/brand";
import "./captions/beauty";
import { CaptionOptions, OPTION_FRAMES } from "./captions/Director";
import { OVERLAYS } from "./OverlayTests";
import { Scene, SCENES, Showcase, SHOWCASE_FRAMES } from "./Showcase";

const base = { fps: 30, width: 1080, height: 1920 } as const;

export const RemotionRoot: React.FC = () => (
  <>
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
