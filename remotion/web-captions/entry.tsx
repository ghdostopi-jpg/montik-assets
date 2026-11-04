import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "../src/lib/brand";
import "../src/captions/beauty";
import { CaptionOptions, OPTION_FRAMES } from "../src/captions/Director";

const names = ["Stomp: hook", "Hand-drawn highlight: problem", "Cinematic product: reveal", "Luxury editorial: solution", "Dynamic word-by-word: benefits", "Black text boxes: ease of use", "Luxury editorial: close"];
const lens = OPTION_FRAMES(30);
const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
const total = lens.reduce((a, b) => a + b, 0);

const App = () => {
  const ref = useRef<PlayerRef>(null);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const on = (e: { detail: { frame: number } }) => setCur(e.detail.frame);
    p.addEventListener("frameupdate", on);
    return () => p.removeEventListener("frameupdate", on);
  }, []);
  const active = starts.reduce((a, s, i) => (cur >= s ? i : a), 0);
  return (
    <div className="wrap">
      <div className="stage">
        <Player ref={ref} component={CaptionOptions} durationInFrames={total} fps={30} compositionWidth={1080} compositionHeight={1920} style={{ width: "100%", height: "100%" }} controls autoPlay loop clickToPlay initiallyMuted />
      </div>
      <nav className="scenes">
        {names.map((n, i) => (
          <button key={n} id={`style-${i}`} className={i === active ? "on" : ""} onClick={() => { ref.current?.seekTo(starts[i]); ref.current?.play(); }}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>{n}
          </button>
        ))}
      </nav>
    </div>
  );
};
createRoot(document.getElementById("root")!).render(<App />);
