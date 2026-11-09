import React from "react";
import { Composition } from "remotion";
import { BF02loc, PACKS } from "./BF02loc";
export const RootBF02loc: React.FC = () => (<>
  <Composition id="BF02-IT" component={BF02loc as any} fps={60} width={1080} height={1920} durationInFrames={Math.round(PACKS.it.t.end * 60)} defaultProps={{ lang: "it" }} />
  <Composition id="BF02-HR" component={BF02loc as any} fps={60} width={1080} height={1920} durationInFrames={Math.round(PACKS.hr.t.end * 60)} defaultProps={{ lang: "hr" }} />
</>);
