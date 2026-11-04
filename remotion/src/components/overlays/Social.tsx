import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E, ip, punch } from "../../lib/anim";
import { C, FONT_BODY, FONT_DISPLAY } from "../../lib/brand";

const exitOf = (frame: number, dur: number, len = 8) => ip(frame, [dur - len, dur], [0, 1], E.inQuart);

/* ------------------------------------------------------------------ */
/* HookBanner: the persistent top banner of the two-layer text system. */
/* ------------------------------------------------------------------ */
export type BannerLine = { text: string; tone?: "white" | "black" | "green" };
/**
 * Stacked boxed lines for the first 2-10 s of an ad. Each box wipes open from
 * the left with a slight tilt while its text slides in a beat later; boxes
 * overlap by a few px like cut paper. Use it to state the problem or promise
 * while the footage plays underneath.
 */
export const HookBanner: React.FC<{ lines: BannerLine[]; y?: number; size?: number }> = ({ lines, y = 290, size = 78 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = exitOf(frame, durationInFrames);
  return (
    <div style={{ position: "absolute", top: y, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0, opacity: 1 - out, translate: `0px ${-out * 30}px` }}>
      {lines.map((l, i) => {
        const s = i * 4;
        const tone = l.tone ?? (i === 0 ? "white" : "black");
        const bg = tone === "white" ? C.white : tone === "green" ? C.green : C.black;
        const fg = tone === "black" ? C.white : C.black;
        return (
          <div key={i} style={{ rotate: `${i % 2 ? 1.2 : -1.6}deg`, marginTop: i ? -6 : 0, clipPath: `inset(0 ${100 - ip(frame, [s, s + 10], [0, 100], E.inOutQuint)}% 0 0)` }}>
            <div
              style={{
                background: bg,
                color: fg,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: size,
                lineHeight: 1,
                textTransform: "uppercase",
                padding: "16px 28px 12px",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ display: "inline-block", translate: `${ip(frame, [s + 3, s + 15], [-40, 0])}px 0px`, opacity: ip(frame, [s + 3, s + 8], [0, 1], E.linear) }}>{l.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* CommentReply: TikTok-native "reply to comment" bubble.              */
/* ------------------------------------------------------------------ */
/**
 * The native reply sticker: small grey "reply to" line, the comment in bold,
 * an avatar with the initial and a tail. Springs in from 60 % with a slight
 * rotation, settles at -2 deg. Use only with real comments.
 */
export const CommentReply: React.FC<{ user: string; text: string; x?: number; y?: number; replyLabel?: string }> = ({
  user,
  text,
  x = 80,
  y = 330,
  replyLabel = "Odgovor na komentar uporabnika",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = punch(frame, fps, 0, 260, 15);
  const out = exitOf(frame, durationInFrames);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        maxWidth: 760,
        transformOrigin: "10% 100%",
        scale: String(ip(p, [0, 1], [0.6, 1], E.linear) * (1 - out * 0.2)),
        rotate: `${ip(p, [0, 1], [-8, -2], E.linear)}deg`,
        opacity: ip(frame, [0, 4], [0, 1], E.linear) * (1 - out),
      }}
    >
      <div style={{ position: "relative", background: C.white, borderRadius: 26, padding: "22px 30px 24px", boxShadow: "0 14px 40px rgba(0,0,0,0.28)", display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div style={{ flex: "none", width: 64, height: 64, borderRadius: "50%", background: C.green, color: C.black, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36 }}>
          {user.replace("@", "").charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 28, color: "#6B6B6B", marginBottom: 6 }}>
            {replyLabel} {user}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 44, lineHeight: 1.2, color: C.black }}>{text}</div>
        </div>
        <svg width={40} height={30} viewBox="0 0 40 30" style={{ position: "absolute", left: 46, bottom: -26 }}>
          <path d="M0 0 H40 L8 30 Z" fill={C.white} />
        </svg>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* NotificationPop: a phone notification dropping in.                  */
/* ------------------------------------------------------------------ */
/**
 * Lock-screen style notification that drops from above on a spring, with app
 * icon, app name, time, title and body. Optional `count` stacks extra ghost
 * cards behind it for an "orders keep coming" feel.
 */
export const NotificationPop: React.FC<{ app: string; time?: string; title: string; body: string; y?: number; count?: number }> = ({
  app,
  time = "zdaj",
  title,
  body,
  y = 230,
  count = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = punch(frame, fps, 0, 200, 16);
  const out = exitOf(frame, durationInFrames, 10);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, translate: `0px ${ip(p, [0, 1], [-320, 0], E.linear) - out * 300}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 24 + i * 20,
            right: 24 + i * 20,
            top: 26 + i * 18,
            height: 170,
            borderRadius: 34,
            background: "rgba(245,245,240,0.72)",
            opacity: ip(frame, [8 + i * 4, 14 + i * 4], [0, 1], E.linear),
            zIndex: -1 - i,
          }}
        />
      ))}
      <div style={{ position: "relative", borderRadius: 34, background: "rgba(250,250,246,0.96)", padding: "26px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.30)", display: "flex", gap: 22, alignItems: "center" }}>
        <div style={{ flex: "none", width: 84, height: 84, borderRadius: 20, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: C.black }}>
          {app.charAt(0)}
        </div>
        <div style={{ minWidth: 0, flex: 1, fontFamily: FONT_BODY, color: C.black }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 500, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            <span>{app}</span>
            <span style={{ textTransform: "none" }}>{time}</span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, marginTop: 4 }}>{title}</div>
          <div style={{ fontSize: 34, fontWeight: 400, marginTop: 2 }}>{body}</div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* ReviewCard: social proof with filling stars and a masked quote.     */
/* ------------------------------------------------------------------ */
/**
 * Review card that rises in, fills its stars one by one with a pop, reveals
 * the quote line by line out of masks and ends on the name with a verified
 * tick. Only use real customer reviews.
 */
export const ReviewCard: React.FC<{ quote: string[]; name: string; stars?: number; verified?: string; y?: number }> = ({
  quote,
  name,
  stars = 5,
  verified = "Preverjen nakup",
  y = 360,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const rise = ip(frame, [0, 14], [80, 0]);
  const out = exitOf(frame, durationInFrames);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, translate: `0px ${rise + out * 60}px`, opacity: ip(frame, [0, 6], [0, 1], E.linear) * (1 - out) }}>
      <div style={{ background: C.white, borderRadius: 28, padding: "36px 40px", boxShadow: "0 24px 60px rgba(0,0,0,0.30)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: stars }).map((_, i) => {
            const sp = punch(frame, fps, 8 + i * 3, 300, 12);
            return (
              <svg key={i} width={58} height={58} viewBox="0 0 24 24" style={{ scale: String(Math.max(sp, 0)) }}>
                <path d="M12 2.2l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17l-6.1 3.4 1.5-6.7L2.3 9.1l6.8-.7z" fill={C.green} />
              </svg>
            );
          })}
        </div>
        <div style={{ marginTop: 18 }}>
          {quote.map((line, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 50, lineHeight: 1.25, color: C.black, translate: `0px ${ip(frame, [18 + i * 4, 32 + i * 4], [110, 0])}%` }}>{line}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT_BODY, fontSize: 32, color: "#444", opacity: ip(frame, [30, 40], [0, 1], E.linear) }}>
          <span style={{ fontWeight: 700, color: C.black }}>{name}</span>
          <svg width={34} height={34} viewBox="0 0 24 24">
            <circle cx={12} cy={12} r={11} fill={C.green} />
            <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={C.black} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={ip(frame, [34, 44], [1, 0], E.inOutCubic)} />
          </svg>
          <span>{verified}</span>
        </div>
      </div>
    </div>
  );
};
