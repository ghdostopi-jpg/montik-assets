import React from "react";
import { Composition } from "remotion";
import { Ad06 } from "./Ad06";
export const Root06: React.FC = () => (
  <Composition id="Ad06" component={Ad06 as any} fps={60} width={1080} height={1920} durationInFrames={60}
    defaultProps={{ shots: [], captions: [], frames: 60 } as any} calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
);
