"""Safe-zone scan: on a text-only render (QC mode), every lit pixel is a glyph. Reports any glyph outside
Y 420-1500 / X 100-945 (1080x1920 coords). usage: python3 safezone_scan.py text.mp4 [fps_of_file]"""
import cv2, sys, numpy as np, json
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(5); W = cap.get(3); k = 1080 / W
X0, X1, Y0, Y1 = 100, 945, 420, 1500
bad, i, worst = [], 0, [1920, 0, 1080, 0]
while True:
    ok, fr = cap.read()
    if not ok: break
    m = fr.max(2) > 40
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    ys, xs = m.nonzero()
    if len(ys):
        y0, y1, x0, x1 = ys.min() * k, ys.max() * k, xs.min() * k, xs.max() * k
        worst = [min(worst[0], y0), max(worst[1], y1), min(worst[2], x0), max(worst[3], x1)]
        if y0 < Y0 - 4 or y1 > Y1 + 4 or x0 < X0 - 4 or x1 > X1 + 4:
            bad.append((round(i / fps, 2), int(y0), int(y1), int(x0), int(x1)))
    i += 1
print("frames", i, "text extent y %d-%d x %d-%d" % tuple(int(v) for v in worst))
print("outside:", len(bad)); [print(b) for b in bad[:40]]
json.dump({"extent": worst, "outside": bad}, open(sys.argv[1] + ".scan.json", "w"))
