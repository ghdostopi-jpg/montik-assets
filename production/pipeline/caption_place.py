"""Caption placement rule (Rene, 8 Nov 2026): captions sit just below the middle of the frame (centre y ~1090).
If that band would cover a face, move the caption above the face; always inside the 9:16 safe area
(top >= 14 % = 269 px, bottom <= 65 % = 1248 px). Faces are detected (YuNet) on a captions-off render.
Usage: python3 caption_place.py nocap.mp4 props.json  (writes "top" per caption into props.json)"""
import cv2, json, sys
import numpy as np
VID, PROPS = sys.argv[1], sys.argv[2]
p = json.load(open(PROPS))
cap = cv2.VideoCapture(VID); W = int(cap.get(3)); k = 1080 / W
det = cv2.FaceDetectorYN.create("/home/claude/montik-assets/production/models/face_detection_yunet_2023mar.onnx", "", (W, int(cap.get(4))), 0.6)
SAFE_TOP, SAFE_BOT, MID = 290, 1248, 1090

def faces_at(t):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
    if not ok: return []
    _, f = det.detect(fr)
    out = []
    for b in ([] if f is None else f):
        if b[2] * k < 120: continue
        ey = (b[5] + b[7]) / 2 * k; my = (b[11] + b[13]) / 2 * k; d = my - ey  # eyes -> mouth
        out.append((ey - 1.1 * d, my + 0.75 * d))  # forehead line .. chin
    return out

def stacked(t):
    s = next((s for s in p["shots"] if s["from"] <= t < s["to"]), None)
    return s and s["kind"] == "scene" and s["id"].startswith("p_") and s["id"] != "p_full"

log = []
for c in p["captions"]:
    c.pop("top", None)
    if c["words"] and c["words"][0][0].startswith("«"): continue  # hook title has its own place
    mid = (c["from"] + c["to"]) / 2
    if stacked(mid): continue
    txt = " ".join(w[0] for w in c["words"]); two = len(txt) > 24
    h = 165 if two else 92
    top = MID - (74 if two else 40)
    per = [faces_at(t) for t in np.linspace(c["from"] + 0.05, c["to"] - 0.05, 5)]
    if sum(1 for x in per if x) < 3: per = []  # a face in fewer than 3 of 5 samples = another shot under most of the caption
    fs = [b for x in per for b in x]
    hit = [b for b in fs if not (top + h < b[0] or top > b[1])]
    if hit:
        ftop = min(b[0] for b in hit)
        up = ftop - h - 24
        if up >= SAFE_TOP: top = up
        else:
            fbot = max(b[1] for b in hit)
            down = fbot + 24
            if down + h <= SAFE_BOT: top = down
            else:
                fbot2 = max(b[1] for b in hit)
                # no clean space: top safe line if the caption then ends above the eyes (forehead/hair only); else keep default
                top = SAFE_TOP if SAFE_TOP + h < ftop + 0.38 * (fbot2 - ftop) else top
        c["top"] = int(round(top))
    log.append((round(c["from"], 2), txt, c.get("top", "default"), [tuple(int(v) for v in b[:2]) for b in hit][:1]))
json.dump(p, open(PROPS, "w"), ensure_ascii=False)
for l in log: print(l)
