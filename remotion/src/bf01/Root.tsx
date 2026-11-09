import React from "react";
import { Composition } from "remotion";
import { BF01, timesFor } from "./BF01";
import { Lang } from "./copy";
const meta = ({ props }: any) => ({ durationInFrames: Math.round(timesFor((props.lang ?? "sl") as Lang).total * 60) });
const C = (id: string, lang: Lang, qc = false) => (
  <Composition key={id} id={id} component={BF01 as any} width={1080} height={1920} fps={60} durationInFrames={Math.round(timesFor(lang).total * 60)} defaultProps={{ qc, lang }} calculateMetadata={meta} />
);
export const RemotionRoot: React.FC = () => (
  <>
    {C("BF01", "sl")}{C("BF01-QC", "sl", true)}
    {C("BF01-IT", "it")}{C("BF01-HR", "hr")}
    {C("BF01-SK", "sk")}{C("BF01-SK-QC", "sk", true)}
    {C("BF01-CZ", "cz")}{C("BF01-CZ-QC", "cz", true)}
    {C("BF01-HU", "hu")}{C("BF01-HU-QC", "hu", true)}
  </>
);
