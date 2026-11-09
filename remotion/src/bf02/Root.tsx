import React from "react";
import { Composition } from "remotion";
import { BF02 } from "./BF02";
export const RootBF02: React.FC = () => (
  <Composition id="BF02" component={BF02 as any} fps={60} width={1080} height={1920} durationInFrames={60}
    defaultProps={{ scenes: [], frames: 60 } as any} calculateMetadata={({ props }: any) => ({ durationInFrames: props.frames })} />
);
