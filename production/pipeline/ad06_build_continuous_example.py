"""AD_06 v5 timeline: the voice runs continuously (gap G between phrases), the picture follows the words.
Every VO cut sits inside a measured silence. Reveal lines (one per before/after pair) come from AD06_VO_reveal_v2.mp3."""
import json, subprocess, os
W = json.load(open("audio/words_raw.json"))
os.makedirs("audio/seg5", exist_ok=True)
G = 0.28
VO, RV = "audio/AD06_VO_takeA.mp3", "audio/AD06_VO_reveal_v2.mp3"
# (name, file, speech_start, speech_end, words-key)  - speech bounds measured (< -50 dB silences)
SEG = [("A", VO, 0.07, 5.00, "vo"), ("B", VO, 5.95, 13.20, "vo"), ("C1", VO, 13.72, 16.02, "vo"),
       ("C2a", VO, 16.41, 19.62, "vo"), ("C2b", VO, 19.93, 22.20, "vo"), ("C3", VO, 22.65, 24.14, "vo"),
       ("R1", RV, 0.19, 3.41, "rev"), ("R2", RV, 3.98, 7.52, "rev"), ("R3", RV, 8.04, 10.80, "rev"),
       ("R4", RV, 11.25, 14.56, "rev"), ("R5", RV, 15.02, 17.54, "rev"), ("R6", RV, 17.94, 21.27, "rev")]
PRE, POST = 0.05, 0.10  # keep a little air (still inside the silence)
voice = [{"file": "audio/AD06_V1_hook_takeB.mp3", "at": 0.0}]
words = [[w, s, e] for w, s, e in W["v1"]]
t = 3.63 + G  # V1 speech ends 3.63
place = {}
for i, (n, f, a, b, key) in enumerate(SEG):
    out = f"audio/seg5/{n}.wav"; ca, cb = a - PRE, b + POST
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-af", f"atrim={ca}:{cb},asetpts=N/SR/TB,afade=t=in:d=0.03,afade=t=out:st={cb-ca-0.05}:d=0.05", "-ar", "48000", out], check=True)
    at = t - PRE; voice.append({"file": out, "at": round(at, 3)})
    nxt = SEG[i + 1][2] if i + 1 < len(SEG) and SEG[i + 1][1] == f else 1e9
    for w, s, e in W[key]:
        if a - 0.15 <= s < min(nxt - 0.1, b):
            words.append([w, round(s - a + t, 3), round(min(e, b + 0.05) - a + t, 3)])
    place[n] = (round(t, 3), round(t + b - a, 3)); t += (b - a) + G
V3AT = t - 0.0  # V3 speech starts right at its file start
voice.append({"file": "audio/AD06_V3_close_takeA.mp3", "at": round(V3AT, 3)})
words += [[w, round(s + V3AT, 3), round(e + V3AT, 3)] for w, s, e in W["v3"]]
DUR = round(V3AT + 2.72 + 0.45, 2)
words.sort(key=lambda x: x[1])
def wt(word, after=0.0):  # time of the first word (start) at/after a time
    return next(s for w, s, e in words if w.startswith(word) and s >= after)
P = place; S = lambda n: P[n][0]; E = lambda n: P[n][1]
cut = lambda a, b: round((a + b) / 2, 2)  # cut in the middle of a gap
A_end_cut = cut(E("A"), S("B"))
shots = [
    {"kind": "video", "src": "v/V1.mp4", "from": 0.0, "to": round(S("A") - 0.05, 2), "z0": 1.0, "z1": 1.03},
    {"kind": "scene", "id": "macro_forehead", "from": round(S("A") - 0.05, 2), "to": round(wt("opaca", S("A")) - 0.1, 2)},
    {"kind": "scene", "id": "macro_eyes", "from": round(wt("opaca", S("A")) - 0.1, 2), "to": round(wt("senza", S("A")) - 0.1, 2)},
    {"kind": "scene", "id": "macro_cheek", "from": round(wt("senza", S("A")) - 0.1, 2), "to": A_end_cut},
    {"kind": "scene", "id": "before_full", "from": A_end_cut, "to": round(wt("il", S("B")) - 0.05, 2)},
    {"kind": "video", "src": "b/b_vial_label.mp4", "from": round(wt("il", S("B")) - 0.05, 2), "to": round(wt("un", S("B") + 1.5) - 0.05, 2)},
    {"kind": "video", "src": "b/b_tray.mp4", "from": round(wt("un", S("B") + 1.5) - 0.05, 2), "to": round(wt("e", wt("peptidi", S("B"))) - 0.05, 2), "packaging": True},
    {"kind": "video", "src": "b/b_vial_held.mp4", "from": round(wt("e", wt("peptidi", S("B"))) - 0.05, 2), "to": cut(E("B"), S("C1"))},
    {"kind": "video", "src": "b/b_pour.mp4", "from": cut(E("B"), S("C1")), "to": cut(E("C1"), S("C2a"))},
    {"kind": "video", "src": "v/V2a.mp4", "from": cut(E("C1"), S("C2a")), "to": cut(E("C2a"), S("C2b"))},
    {"kind": "video", "src": "v/V2b.mp4", "from": cut(E("C2a"), S("C2b")), "to": cut(E("C2b"), S("C3")), "offset": 1.3, "z0": 1.02, "z1": 1.05},
    {"kind": "video", "src": "b/b_lineup.mp4", "from": cut(E("C2b"), S("C3")), "to": cut(E("C3"), S("R1")), "packaging": True},
    {"kind": "scene", "id": "p_full", "from": cut(E("C3"), S("R1")), "to": cut(E("R1"), S("R2"))},
    {"kind": "scene", "id": "p_forehead", "from": cut(E("R1"), S("R2")), "to": cut(E("R2"), S("R3"))},
    {"kind": "scene", "id": "p_eyes", "from": cut(E("R2"), S("R3")), "to": cut(E("R3"), S("R4"))},
    {"kind": "scene", "id": "p_cheek", "from": cut(E("R3"), S("R4")), "to": cut(E("R4"), S("R5"))},
    {"kind": "scene", "id": "p_mouth", "from": cut(E("R4"), S("R5")), "to": cut(E("R5"), S("R6"))},
    {"kind": "scene", "id": "p_neck", "from": cut(E("R5"), S("R6")), "to": round(V3AT - 0.12, 2)},
    {"kind": "video", "src": "v/V3.mp4", "from": round(V3AT - 0.12, 2), "to": DUR, "z0": 1.0, "z1": 1.03},
]
for s in shots:
    s.setdefault("z0", 1.0); s.setdefault("z1", 1.04)
# caption position per shot (top px at 1080x1920): never over eyes or product; below the middle when that is free
TOP1 = {  # 1-line caption top; 2-line captions use TOP2 when given
    "v/V1.mp4": 300, "macro_forehead": 880, "macro_eyes": 1150, "macro_cheek": 1050, "before_full": 300,
    "b/b_vial_label.mp4": 330, "b/b_tray.mp4": 300, "b/b_vial_held.mp4": 300, "b/b_pour.mp4": 300,
    "v/V2a.mp4": 300, "v/V2b.mp4": 300, "b/b_lineup.mp4": 300, "p_full": 1050, "v/V3.mp4": 300}
TOP2 = {"macro_eyes": 1083, "p_full": 1016, "macro_cheek": 1016}
BREAK_AFTER = {"provato"}
def groups(ws, maxc=24):
    out, cur = [], []
    def flush():
        if cur: out.append(cur.copy()); cur.clear()
    for w in ws:
        txt = " ".join(x[0] for x in cur + [w])
        if cur and (len(txt) > 2 * maxc or (w[1] - cur[-1][2]) > 0.45): flush()
        cur.append(w)
        if w[0][-1] in ".?!:»" or w[0] in BREAK_AFTER or (w[0].endswith(",") and len(" ".join(x[0] for x in cur)) > 14): flush()
    flush()
    return [{"from": g[0][1], "to": g[-1][2], "words": g} for g in out]
caps = groups(words)
for i, c in enumerate(caps):
    nxt = caps[i + 1]["from"] if i + 1 < len(caps) else DUR
    c["to"] = round(min(nxt - 0.02, c["to"] + 0.6), 3)
    # shot under most of the caption
    best = max(shots, key=lambda s: max(0, min(s["to"], c["to"]) - max(s["from"], c["from"])))
    key = best.get("src") or best.get("id")
    two = len(" ".join(w[0] for w in c["words"])) > 24
    if key in TOP1 and not c["words"][0][0].startswith("«"):
        c["top"] = TOP2.get(key, TOP1[key] if TOP1[key] < 600 else TOP1[key] - 34) if two else TOP1[key]
fps = 60
props = {"frames": int(round(DUR * fps)), "shots": [{k: v for k, v in s.items() if k != "packaging"} for s in shots], "captions": caps, "words": words}
json.dump(props, open("AD06_props.json", "w"), ensure_ascii=False)
tl = {"meta": {"id": "AD_06", "fps": fps, "width": 1080, "height": 1920, "duration": DUR}, "cta": False,
      "talk": [[0.0, shots[0]["to"]], [V3AT, DUR]], "shots": shots,
      "audio": {"duration": DUR, "voice": voice, "music": {"file": "audio/AD06_music_lamplight.wav", "gain_db": -11, "fade_out": 2.2}, "sfx": [], "target_lufs": -14, "true_peak": -1.0}}
json.dump(tl, open("AD06_timeline.json", "w"), ensure_ascii=False, indent=1)
open("AD06_captions.txt", "w").write(" ".join(w[0] for w in words))
print("DUR", DUR, "reveal", S("R1"))
for s in shots: print(f'{s["from"]:6.2f}-{s["to"]:6.2f} {s["to"]-s["from"]:4.2f}  {s.get("src") or s.get("id")}')
for c in caps: print(f'{c["from"]:6.2f}-{c["to"]:6.2f} top={c.get("top","-")}  {" ".join(w[0] for w in c["words"])}')
