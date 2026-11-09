import React from "react";
import { Composition } from "remotion";
import { BF02v2, T } from "./BF02v2";
export const RootBF02v2: React.FC = () => (
  <Composition id="BF02v2" component={BF02v2 as any} fps={60} width={1080} height={1920} durationInFrames={Math.round(T.end * 60)} defaultProps={{}} />
);
