// AdShots: the shot layer every RENE AI ad sits on. Creative layers (type, graphics, captions) are written new per ad;
// this file is infrastructure only. Copy it into remotion/src/<adId>/ and render your own overlays above it.
//
// Fixes learned on AD_02:
//  - every shot (video, still or custom scene) overlaps the next by XF frames and the NEXT shot fades in over it,
//    so there is never a dip to the background colour between shots (beauty_qc "flashes" FAIL on AD_02 at 23.3 s);
//  - stills get a slow push (z0 -> z1) so a still never reads as a frozen frame; zoom is uniform scale only (no warping);
//  - one grade for every shot so B-roll and AI footage sit together.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

export type Shot =
  | { kind: "video"; src: string; from: number; to: number; offset?: number; z0?: number; z1?: number; ox?: number; oy?: number }
  | { kind: "still"; src: string; from: number; to: number; z0?: number; z1?: number; ox?: number; oy?: number }
  | { kind: "scene"; id: string; from: number; to: number };

export const XF = 6; // crossfade frames at 60 fps (0.1 s)
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const ShotLayer: React.FC<{ s: Shot; first: boolean; grade: string; dir: string; scenes: Record<string, React.FC<{ len: number }>> }> = ({ s, first, grade, dir, scenes }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const len = Math.round((s.to - s.from) * fps);
  const op = first ? 1 : interpolate(f, [0, XF], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (s.kind === "scene") { const C = scenes[s.id]; return <AbsoluteFill style={{ opacity: op }}>{C ? <C len={len} /> : null}</AbsoluteFill>; }
  const z = interpolate(f, [0, len], [s.z0 ?? 1, s.z1 ?? (s.kind === "still" ? 1.05 : 1.02)], { extrapolateRight: "clamp" });
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", filter: grade, transform: `translate(${s.ox ?? 0}px, ${s.oy ?? 0}px) scale(${z})` };
  return (
    <AbsoluteFill style={{ opacity: op }}>
      {s.kind === "video"
        ? <OffthreadVideo src={staticFile(`${dir}/${s.src}`)} muted startFrom={Math.round((s.offset ?? 0) * fps)} style={style} />
        : <Img src={staticFile(`${dir}/${s.src}`)} style={style} />}
    </AbsoluteFill>
  );
};

export const AdShots: React.FC<{ shots: Shot[]; dir: string; grade?: string; scenes?: Record<string, React.FC<{ len: number }>> }> = ({ shots, dir, grade = "none", scenes = {} }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {shots.map((s, i) => (
        <Sequence key={i} from={Math.round(s.from * fps)} durationInFrames={Math.round((s.to - s.from) * fps) + (i < shots.length - 1 ? XF : 0)}>
          <ShotLayer s={s} first={i === 0} grade={grade} dir={dir} scenes={scenes} />
        </Sequence>
      ))}
    </>
  );
};
