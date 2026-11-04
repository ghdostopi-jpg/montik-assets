import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch } from "../lib/anim";
import { C, FONT_DISPLAY } from "../lib/brand";

/** [word, startSec, endSec], the same shape Montik's transcripts use. */
export type TimedWord = [string, number, number];

const paginate = (words: TimedWord[], max = 3) => {
  const pages: TimedWord[][] = [];
  let cur: TimedWord[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= max || /[.,!?:]$/.test(w[0])) {
      pages.push(cur);
      cur = [];
    }
  });
  if (cur.length) pages.push(cur);
  return pages;
};

/**
 * Premium word-by-word captions for UGC. Pages of up to three words rise in
 * with a soft blur; the spoken word gets a brand-green plate that springs in
 * behind it and the type flips to black; spoken words stay white, upcoming
 * words wait at 45 %. Keywords are set larger in green. An optional hook
 * banner sits at the top, the two-layer text system the reference ads use.
 */
export const UGCCaptions: React.FC<{
  words: TimedWord[];
  keywords?: string[];
  hook?: string;
  y?: number;
  size?: number;
}> = ({ words, keywords = [], hook, y = 1080, size = 96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pages = paginate(words);
  const pageIdx = Math.max(
    0,
    pages.findIndex((p, i) => t < (pages[i + 1]?.[0][1] ?? Infinity)),
  );
  const page = pages[pageIdx];
  const pageStart = page[0][1] * fps;
  const clean = (s: string) => s.replace(/[.,!?:]/g, "").toLowerCase();

  return (
    <AbsoluteFill>
      {hook ? (
        <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 74,
                lineHeight: 1,
                textTransform: "uppercase",
                color: C.black,
                background: C.white,
                padding: "18px 30px 14px",
                translate: `0px ${ip(frame, [2, 16], [110, 0], E.outExpo)}%`,
              }}
            >
              {hook}
            </div>
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: "absolute",
          top: y,
          left: 70,
          right: 70,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px 18px",
        }}
      >
        {page.map(([text, s, e], i) => {
          const f0 = s * fps;
          const active = t >= s && t < (page[i + 1]?.[1] ?? e + 0.25);
          const spoken = t >= e;
          const isKey = keywords.includes(clean(text));
          const enter = frame - Math.min(f0, pageStart + i * 2) + 3;
          const plate = punch(frame, fps, f0, 420, 18);
          return (
            <div
              key={`${pageIdx}-${i}`}
              style={{
                position: "relative",
                opacity: ip(enter, [0, 5], [0, 1], E.linear),
                translate: `0px ${ip(enter, [0, 10], [36, 0])}px`,
                filter: `blur(${ip(enter, [0, 7], [10, 0], E.outQuart)}px)`,
              }}
            >
              {active ? (
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px -16px -2px",
                    backgroundColor: C.green,
                    borderRadius: 18,
                    rotate: `${(i % 2 ? 1 : -1) * 2}deg`,
                    scale: String(ip(plate, [0, 1], [0.55, 1], E.linear)),
                  }}
                />
              ) : null}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: isKey ? size * 1.22 : size,
                  lineHeight: 1.08,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  color: active ? C.black : isKey ? C.green : C.white,
                  opacity: active || spoken ? 1 : 0.45,
                  textShadow: active ? "none" : "0 4px 24px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)",
                  scale: String(active ? ip(plate, [0, 1], [0.92, 1.06], E.linear) : 1),
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
