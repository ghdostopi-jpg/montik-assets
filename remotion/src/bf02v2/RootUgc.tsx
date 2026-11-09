import React from "react";
import { Composition } from "remotion";
import { BF02ugc, TU } from "./BF02ugc";
export const RootBF02ugc: React.FC = () => (
  <Composition id="BF02ugc" component={BF02ugc as any} fps={60} width={1080} height={1920} durationInFrames={Math.round(TU.end * 60)} defaultProps={{}} />
);
