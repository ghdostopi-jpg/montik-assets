import React from "react";
import { Composition } from "remotion";
import { Ad02 } from "./Ad02";
export const Root02: React.FC = () => (
  <Composition id="Ad02" component={Ad02 as any} fps={60} width={1080} height={1920} durationInFrames={60}
    defaultProps={{ words: [], clips: [], frames: 60 } as any} calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
);
