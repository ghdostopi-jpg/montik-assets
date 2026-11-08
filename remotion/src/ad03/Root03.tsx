import React from "react";
import { Composition } from "remotion";
import { Ad03 } from "./Ad03";
export const Root03: React.FC = () => (
  <Composition id="Ad03" component={Ad03 as any} fps={60} width={1080} height={1920} durationInFrames={60}
    defaultProps={{ words: [], shots: [], frames: 60, captionStyle: "A" } as any} calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
);
