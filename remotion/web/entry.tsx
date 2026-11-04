import { Player, PlayerRef } from "@remotion/player";
import { useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Showcase, SCENES, SHOWCASE_FRAMES } from "../src/Showcase";

const T = 14;
const names: Record<string, string> = {
  hook: "Editorial hook", stomp: "Stomp", mask: "Block reveal", cascade: "Char cascade",
  warp: "Liquid morph", extrude: "3D type", captions: "UGC captions", callouts: "Callouts", cta: "CTA",
};
const starts = (() => { let f = 0; return Object.entries(SCENES).map(([k, d], i) => { const s = f; f += d - T; return { k, s: i === 0 ? 0 : s + 2 }; }); })();

const App = () => {
  const ref = useRef<PlayerRef>(null);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const p = ref.current; if (!p) return;
    const on = (e: { detail: { frame: number } }) => setCur(e.detail.frame);
    p.addEventListener("frameupdate", on);
    return () => p.removeEventListener("frameupdate", on);
  }, []);
  const active = starts.reduce((a, s, i) => (cur >= s.s ? i : a), 0);
  return (
    <div className="wrap">
      <div className="stage">
        <Player ref={ref} component={Showcase} durationInFrames={SHOWCASE_FRAMES} fps={30} compositionWidth={1080} compositionHeight={1920}
          style={{ width: "100%", height: "100%" }} controls autoPlay loop clickToPlay initiallyMuted />
      </div>
      <nav className="scenes">
        {starts.map((s, i) => (
          <button key={s.k} id={`scene-${s.k}`} className={i === active ? "on" : ""} onClick={() => { ref.current?.seekTo(s.s); ref.current?.play(); }}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>{names[s.k]}
          </button>
        ))}
      </nav>
    </div>
  );
};
createRoot(document.getElementById("root")!).render(<App />);
