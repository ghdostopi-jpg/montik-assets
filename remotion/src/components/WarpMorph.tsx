import { getBoundingBox, resetPath, warpPath } from "@remotion/paths";
import opentype from "opentype.js";
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { E, ip } from "../lib/anim";
import { C, FONT_BODY } from "../lib/brand";

let fontPromise: Promise<opentype.Font> | null = null;
const loadGlyphFont = () => {
  if (!fontPromise) {
    fontPromise = new Promise((resolve, reject) =>
      opentype.load(staticFile("fonts/ibm-plex-sans-condensed-latin-700-normal.woff"), (err, f) =>
        err || !f ? reject(err) : resolve(f),
      ),
    );
  }
  return fontPromise;
};

const useGlyphFont = () => {
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [handle] = useState(() => delayRender("glyph font"));
  useEffect(() => {
    loadGlyphFont().then((f) => {
      setFont(f);
      continueRender(handle);
    });
  }, [handle]);
  return font;
};

/**
 * Liquid type. Words are real glyph outlines (opentype.js) bent by an animated
 * sine field (@remotion/paths warpPath): the first word pours in as a strong
 * wave that settles flat. Each change of word is a gooey morph: both outlines
 * blur in opposite directions and an alpha-threshold filter fuses them into
 * one liquid shape, while the warp field surges and calms again.
 */
export const WarpMorph: React.FC<{
  words: string[];
  label?: string;
  sub?: string;
  holdFrames?: number;
  morphFrames?: number;
  size?: number;
}> = ({ words, label, sub, holdFrames = 26, morphFrames = 16, size = 330 }) => {
  const frame = useCurrentFrame();
  const font = useGlyphFont();

  const paths = useMemo(() => {
    if (!font) return [];
    return words.map((w) => resetPath(font.getPath(w.toUpperCase(), 0, 0, size).toPathData(2)));
  }, [font, words, size]);

  if (!font || paths.length === 0) return null;

  const intro = 18;
  const cycle = holdFrames + morphFrames;
  const local = frame - intro;
  const seg = Math.max(0, Math.floor(local / cycle));
  const i = Math.min(seg, words.length - 1);
  const inMorph = local >= 0 && i < words.length - 1 && local - seg * cycle >= holdFrames;
  const m = inMorph ? (local - seg * cycle - holdFrames) / morphFrames : 0;

  // Warp amplitude: large on entry, surging during each morph.
  const ampIntro = ip(frame, [0, intro + 6], [110, 0], E.outQuart);
  const ampMorph = inMorph ? Math.sin(m * Math.PI) * 55 : 0;
  const amp = ampIntro + ampMorph;
  const phase = frame * 0.22;

  const warp = (d: string) =>
    amp < 0.5
      ? d
      : warpPath(
          d,
          ({ x, y }) => ({
            x: x + Math.sin(y / 38 + phase) * amp * 0.35,
            y: y + Math.sin(x / 70 + phase * 1.3) * amp,
          }),
          { interpolationThreshold: 8 },
        );

  const boxes = paths.map((d) => getBoundingBox(d));
  const maxW = Math.max(...boxes.map((bx) => bx.x2 - bx.x1));
  const viewW = maxW * 1.22;
  const viewH = viewW * (900 / 1080);
  const center = (k: number) =>
    `translate(${-(boxes[k].x1 + boxes[k].x2) / 2} ${-(boxes[k].y1 + boxes[k].y2) / 2})`;
  const a = warp(paths[i]);
  const b = inMorph ? warp(paths[i + 1]) : null;
  const blurA = inMorph ? Math.min(8 / Math.max(1 - m, 0.001) - 8, 60) : 0;
  const blurB = inMorph ? Math.min(8 / Math.max(m, 0.001) - 8, 60) : 0;
  const intoView = ip(frame, [0, 10], [0, 1], E.linear);

  return (
    <AbsoluteFill style={{ backgroundColor: C.black, justifyContent: "center", alignItems: "center" }}>
      {label ? (
        <div
          style={{
            position: "absolute",
            top: 600,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: 52,
            letterSpacing: "0.3em",
            color: C.white,
            opacity: ip(frame, [4, 16], [0, 1]),
            translate: `0px ${ip(frame, [4, 20], [24, 0])}px`,
          }}
        >
          {label}
        </div>
      ) : null}
      <svg
        width={1080}
        height={900}
        viewBox={`${-viewW / 2} ${-viewH / 2} ${viewW} ${viewH}`}
        style={{ overflow: "visible", opacity: intoView }}
      >
        <defs>
          <filter id="goo" x="-20%" y="-50%" width="140%" height="200%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" />
          </filter>
          <filter id="ba" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation={blurA} />
          </filter>
          <filter id="bb" x="-30%" y="-80%" width="160%" height="260%">
            <feGaussianBlur stdDeviation={blurB} />
          </filter>
        </defs>
        <g filter={inMorph ? "url(#goo)" : undefined}>
          <path
            d={a}
            fill={C.green}
            filter={inMorph ? "url(#ba)" : undefined}
            opacity={inMorph ? Math.pow(1 - m, 0.4) : 1}
            transform={center(i)}
          />
          {b ? (
            <path
              d={b}
              fill={C.green}
              filter="url(#bb)"
              opacity={Math.pow(m, 0.4)}
              transform={center(i + 1)}
            />
          ) : null}
        </g>
      </svg>
      {sub ? (
        <div
          style={{
            position: "absolute",
            top: 1240,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 56,
            color: C.white,
            opacity: ip(frame, [28, 44], [0, 1]),
            translate: `0px ${ip(frame, [28, 48], [30, 0])}px`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
