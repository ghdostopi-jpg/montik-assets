import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, delayRender, continueRender } from "remotion";
import { COPY, W, WHITE, MINT, GREEN, GREEN2, RED, INK, FONT, fontsReady, ip, S, T, H, Slam, Pill, Wipe, K1b, K1q, K2c, K3 } from "./BF02v2";

// BF Video 02 - UGC version (client correction, 9 Nov 2026): women really using the six REGULAR products are the main story;
// the six FREE GIFTS appear only while the VO talks about gifts (K1b, K1q, K2c, K3, CTA). Graphics only carry the offer.
// Voucher line re-recorded without "ob naročilu nad 100€" (client decision) - on screen: "Kupon za naslednji nakup."
// TEXT SAFE ZONE: Y 420-1470 (Rene's 420-1500 rule ∩ brief 220-1470), X 100-945.
export const COPY_UGC = { ...COPY, k4b: "Kupon za naslednji nakup." };
export const TU = { ...T, k4: 29.2, kupon: 32.72, k5: 35.4, cta: 38.12, end: 42.8 };

type Clip = { src: string; from: number; to: number; off?: number; rate?: number; z?: [number, number] };
// regular-product UGC (GROUP A only); src in public/bf02v2/u
const Shots: React.FC<{ clips: Clip[]; t0: number; dim?: number }> = ({ clips, t0, dim = 0 }) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{ background: INK }}>
    {clips.map((c, i) => {
      const a = S(c.from - t0), d = S(c.to - t0) - a; const z = c.z ?? [1.0, 1.05];
      return (<Sequence key={i} from={a} durationInFrames={d}>
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <OffthreadVideo src={staticFile(`bf02v2/u/${c.src}.mp4`)} muted startFrom={S(c.off ?? 0)} playbackRate={c.rate ?? 1}
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(1.07) brightness(1.02)",
              transform: `scale(${ip(f - a, [0, d], z, (x) => x)})` }} />
        </AbsoluteFill>
      </Sequence>);
    })}
    {/* premium grade: soft warm wash + vignette */}
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 45%, rgba(255,244,230,0) 55%, rgba(20,26,22,0.35) 100%)", mixBlendMode: "multiply" }} />
    {dim ? <AbsoluteFill style={{ background: `rgba(10,30,20,${dim})` }} /> : null}
  </AbsoluteFill>);
};

// subtle kinetic line (white, soft shadow) - for UGC footage
const Kin: React.FC<{ text: string; at: number; size: number; top: number; color?: string; gap?: number }> = ({ text, at, size, top, color = WHITE, gap = 0.07 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return (<div style={{ position: "absolute", left: 100, width: 845, top, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.24 }}>
    {text.split(" ").map((w, i) => {
      const s = spring({ frame: f - S(at + i * gap), fps, config: { damping: 18, stiffness: 160 } });
      return <span key={i} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, letterSpacing: -0.5,
        textShadow: "0 3px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)", opacity: Math.min(1, s * 1.3), transform: `translateY(${(1 - Math.min(1, s)) * 26}px)`, fontVariantNumeric: "lining-nums" }}>{w}</span>;
    })}
  </div>);
};

// ---- K1a: hook - women + regular products, -60%
const U1: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const pop = spring({ frame: f - S(TU.k1pop), fps, config: { damping: 11, stiffness: 170 } });
  const hookOut = ip(f, [S(TU.k1pop) - 6, S(TU.k1pop)], [1, 0]);
  return (<AbsoluteFill>
    <Shots t0={0} clips={[{ src: "A_col_drink3", from: 0, to: 1.15, off: 1.3 }, { src: "A_slimis_eat", from: 1.15, to: 2.25, off: 3.5 },
      { src: "A_ms_drink", from: 2.25, to: 3.25, off: 1.0 }, { src: "A_nutri_hold", from: 3.25, to: 4.2, off: 0.6 }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1000, height: 920, background: "linear-gradient(180deg, rgba(10,30,20,0) 0%, rgba(10,30,20,0.5) 100%)" }} />
    <div style={{ opacity: hookOut }}>
      <Kin text={W(COPY.k1a, 0, 2)} at={0.0} size={112} top={1180} />
      <Kin text={W(COPY.k1a, 2)} at={0.35} size={112} top={1302} color={WHITE} />
    </div>
    {f >= S(TU.k1pop) - 2 ? <>
      <Kin text={W(COPY.k1b, 0, 3)} at={TU.k1pop} size={66} top={1166} />
      <div style={{ position: "absolute", left: 100, width: 845, top: 1252, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `scale(${0.5 + 0.5 * pop}) rotate(-3deg)`, opacity: pop > 0.02 ? 1 : 0 }}>
          <Pill style={{ fontSize: 150, padding: "4px 40px 10px", letterSpacing: -4, lineHeight: 1 }}>{W(COPY.k1b, 3)}</Pill>
        </div>
      </div>
    </> : null}
  </AbsoluteFill>);
};

// ---- K2a: "PRI BIOSTILE JIH LAHKO!" over a woman drinking Collagen
const U2a: React.FC = () => {
  const t0 = TU.k2a;
  return (<AbsoluteFill>
    <Shots t0={t0} clips={[{ src: "A_col_drink2", from: t0, to: TU.k2b, off: 1.2, z: [1.04, 1.1] }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1060, height: 520, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.55) 100%)" }} />
    <Kin text={W(COPY.k2a, 0, 2)} at={0.05} size={104} top={1190} />
    <Kin text={W(COPY.k2a, 2)} at={0.35} size={104} top={1304} />
  </AbsoluteFill>);
};

// ---- K2b: "Nakupujte ... do -60%" - UGC montage of regular products
const U2b: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = TU.k2b;
  const tx = W(COPY.k2b, 0, 8);
  const card = spring({ frame: f - 3, fps, config: { damping: 16, stiffness: 160 } });
  const disc = spring({ frame: f - S(14.95 - t0), fps, config: { damping: 10, stiffness: 190 } });
  return (<AbsoluteFill>
    <Shots t0={t0} clips={[{ src: "A_q10_unbox", from: t0, to: 13.1, off: 0.6 }, { src: "A_ms_box", from: 13.1, to: 14.2, off: 2.0 },
      { src: "A_mag_pour", from: 14.2, to: 15.3, off: 1.6 }, { src: "A_slimis_open", from: 15.3, to: TU.k2c, off: 2.0 }]} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1150, transform: `translateY(${(1 - card) * 30}px)`, opacity: Math.min(1, card * 1.3),
      background: "rgba(255,255,255,0.94)", borderRadius: 30, padding: "22px 26px 26px", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>
      <H size={58}>{W(tx, 0, 2)}</H>
      <H size={58} style={{ marginTop: 4 }}>{W(tx, 2, 4)}</H>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 30, marginTop: 10, opacity: ip(f, [S(14.2 - t0), S(14.2 - t0) + 10], [0, 1]) }}>
        <H size={54} color={GREEN}>{W(tx, 4, 7)}</H>
        <div style={{ transform: `scale(${0.4 + 0.6 * disc}) rotate(-3deg)`, opacity: disc > 0.02 ? 1 : 0 }}><Pill style={{ fontSize: 58, padding: "2px 22px 6px" }}>{W(tx, 7)}</Pill></div>
      </div>
    </div>
  </AbsoluteFill>);
};

// ---- K4: voucher (purchase -> -25% coupon for the NEXT purchase, no minimum) over regular-product UGC
const U4: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t0 = TU.k4;
  const tk = spring({ frame: f - 6, fps, config: { damping: 13, stiffness: 120 } });
  const stamp = spring({ frame: f - S(1.15), fps, config: { damping: 9, stiffness: 210 } });
  const kup = spring({ frame: f - S(TU.kupon - t0), fps, config: { damping: 15, stiffness: 160 } });
  const shine = ip(f, [S(1.8), S(2.6)], [-40, 140]);
  return (<AbsoluteFill>
    <Shots t0={t0} dim={0.32} clips={[{ src: "A_col_stir2", from: t0, to: 32.0, off: 0.2, rate: 0.9 }, { src: "A_q10_hold", from: 32.0, to: TU.k5, off: 0, rate: 0.85 }]} />
    <Kin text={W(COPY.k4a, 0, 3)} at={0.1} size={84} top={452} />
    <div style={{ position: "absolute", left: 110, width: 825, top: 580, height: 430, transform: `translateX(${(1 - tk) * 60}px) rotate(-3deg)`, opacity: Math.min(1, tk * 1.4) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: WHITE, boxShadow: "0 30px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 140, background: `linear-gradient(180deg, ${GREEN}, ${GREEN2})` }} />
        <div style={{ position: "absolute", left: 140, top: 26, bottom: 26, borderLeft: `8px dotted ${MINT}` }} />
        <div style={{ position: "absolute", left: 43, top: 188, width: 54, height: 54, borderRadius: "50%", border: `8px solid ${WHITE}` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${shine}%`, width: 120, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))", transform: "skewX(-16deg)" }} />
      </div>
      <div style={{ position: "absolute", left: 160, right: 20, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.5 + 0.5 * stamp}) rotate(${(1 - stamp) * 8}deg)`, opacity: stamp > 0.02 ? 1 : 0 }}>
        <H size={176} color={RED} style={{ letterSpacing: -6, whiteSpace: "nowrap" }}>{W(COPY.k4a, 3)}</H>
      </div>
    </div>
    <div style={{ position: "absolute", left: 100, width: 845, top: 1080, transform: `translateY(${(1 - kup) * 30}px)`, opacity: Math.min(1, kup * 1.3),
      background: WHITE, borderRadius: 30, padding: "26px 30px", boxShadow: "0 20px 40px rgba(0,0,0,0.30)", borderTop: `10px solid ${RED}` }}>
      <H size={64}>{W(COPY_UGC.k4b, 0, 2)}</H>
      <H size={64} color={GREEN} style={{ marginTop: 6 }}>{W(COPY_UGC.k4b, 2)}</H>
    </div>
  </AbsoluteFill>);
};

// ---- K5a: "BLACK FRIDAY SAMO DO KONCA NOVEMBRA!" over regular-product UGC
const U5a: React.FC = () => {
  const t0 = TU.k5;
  return (<AbsoluteFill>
    <Shots t0={t0} clips={[{ src: "A_slimis_belly", from: t0, to: 36.75, off: 0.5 }, { src: "A_nutri_show", from: 36.75, to: TU.cta, off: 1.6 }]} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, height: 560, background: "linear-gradient(180deg, rgba(10,30,20,0.5) 0%, rgba(10,30,20,0) 100%)" }} />
    <Kin text={W(COPY.k5a, 0, 2)} at={0.05} size={104} top={446} color={WHITE} />
    <Kin text={W(COPY.k5a, 2, 5)} at={0.35} size={72} top={566} />
    <Kin text={W(COPY.k5a, 5)} at={0.6} size={72} top={648} />
  </AbsoluteFill>);
};

// ---- CTA: "POHITITE PO SVOJA DARILA!" - about the gifts -> gift B-roll only (no brand end card)
const U5b: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const dur = TU.end - TU.cta;
  const cta = spring({ frame: f - 4, fps, config: { damping: 10, stiffness: 170 } });
  const pulse = f > 40 ? 1 + 0.03 * Math.sin((f - 40) / 8) : 1;
  return (<AbsoluteFill>
    <AbsoluteFill style={{ overflow: "hidden", background: INK }}>
      <OffthreadVideo src={staticFile("bf02v2/v/g_celuline_hand.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${ip(f, [0, S(dur)], [1.0, 1.06], (x) => x)})` }} />
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1080, height: 600, background: "linear-gradient(180deg, rgba(10,79,45,0) 0%, rgba(10,79,45,0.6) 100%)" }} />
    <div style={{ position: "absolute", left: 100, width: 845, top: 1250, display: "flex", justifyContent: "center", transform: `scale(${(0.4 + 0.6 * cta) * pulse})`, opacity: cta > 0.02 ? 1 : 0 }}>
      <Pill style={{ fontSize: 64, padding: "16px 40px 20px", textAlign: "center", lineHeight: 1.06, width: 780 }}>{COPY.k5b}</Pill>
    </div>
  </AbsoluteFill>);
};

const SC: [React.FC, number, number][] = [
  [U1, 0, TU.k1b], [K1b, TU.k1b, TU.k1q], [K1q, TU.k1q, TU.k2a], [U2a, TU.k2a, TU.k2b], [U2b, TU.k2b, TU.k2c], [K2c, TU.k2c, TU.k3],
  [K3, TU.k3, TU.k4], [U4, TU.k4, TU.k5], [U5a, TU.k5, TU.cta], [U5b, TU.cta, TU.end]];
// which group each scene shows (QC): A = regular products, B = gifts
export const SCENE_GROUPS = ["A", "B", "B", "A", "A", "B", "B", "A", "A", "B"];

const QC_CSS = `html,body{background:#000!important} *{background:transparent!important;box-shadow:none!important;border-color:transparent!important;filter:none!important;-webkit-text-stroke:0!important;text-shadow:none!important} img,video,svg{visibility:hidden!important}`;
export const BF02ugc: React.FC<{ qcText?: boolean }> = ({ qcText }) => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => { fontsReady.then(() => continueRender(h)); }, [h]);
  return (<AbsoluteFill style={{ background: WHITE }}>
    {qcText ? <style>{QC_CSS}</style> : null}
    {SC.map(([C, a, b], i) => <Sequence key={i} from={S(a)} durationInFrames={S(b) - S(a)}><C /></Sequence>)}
    {[TU.k1b, TU.k2c, TU.k3, TU.cta].map((a, i) => <Wipe key={i} at={a} />)}
  </AbsoluteFill>);
};
