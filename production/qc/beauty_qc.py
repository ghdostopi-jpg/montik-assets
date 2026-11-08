#!/usr/bin/env python3
"""beauty_qc.py - automated QC for vertical beauty / UGC ads (RENE AI production system).

Measures what a reviewer would otherwise have to spot by eye, and writes evidence sheets
for the things a number can't decide. It does NOT replace looking at the sheets.

Usage:
  python3 beauty_qc.py final.mp4 --out qc/ [--plan timeline.json] [--script script.txt]
         [--talk 0-2.9,23.3-25.7] [--fps 60] [--max-cuts-per-10s 5] [--lufs -14]

Checks (PASS / WARN / FAIL):
  format        resolution, fps, duration vs plan
  true60        share of duplicated frames (fake 60 fps = every 2nd frame repeated)
  flashes       blank / near-uniform frames (e.g. a dip to white between shots)
  cuts          detected cuts, cut density, sub-0.15 s micro-cuts
  face          per-shot facial geometry (YuNet 5 landmarks): ratio drift = distortion/morph;
                identity drift across shots; face crops sheet
  lipsync       mouth-motion vs voice-envelope cross-correlation in talking ranges: best lag (ms)
  interp        motion-interpolation artifacts: frame vs mean of its neighbours (warp/ghost spikes)
  audio         integrated LUFS, true peak, short loud transients outside speech (whoosh/swish)
  subtitles     OCR (tesseract ita) of the caption band, compared word-by-word with --script
  safezones     text found in the top 14 % / bottom 35 % of a 9:16 frame
  cta           CTA words in OCR text, script or plan (Italian / English / Slovenian)
  product       OCR tokens that look like a misspelled brand word (garbled AI label)

Exit code 1 if any FAIL. Needs ffmpeg, numpy, opencv (with FaceDetectorYN), pytesseract.
"""
import argparse, json, math, os, re, subprocess, sys, tempfile
from difflib import SequenceMatcher
from pathlib import Path
import numpy as np
import cv2

HERE = Path(__file__).resolve().parent
YUNET = HERE.parent / "models" / "face_detection_yunet_2023mar.onnx"
CTA_WORDS = [r"acquista", r"compra", r"ordina", r"clicca", r"link in bio", r"scopri di pi", r"sconto", r"offerta",
             r"codice", r"shop now", r"buy now", r"order now", r"swipe up", r"link", r"kupi", r"naro[cč]i", r"popust",
             r"klikni", r"\bcta\b", r"approfitta", r"spedizione gratuita"]
BRAND = ["biostile", "microinfusion", "system", "serum", "anti-age", "set"]


def sh(cmd, binary=False):
    r = subprocess.run(cmd, capture_output=True)
    return r.stdout if binary else (r.stdout + r.stderr).decode("utf8", "replace")


def probe(path):
    j = json.loads(sh(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path]))
    v = next(s for s in j["streams"] if s["codec_type"] == "video")
    num, den = map(int, v["avg_frame_rate"].split("/"))
    return dict(w=int(v["width"]), h=int(v["height"]), fps=num / den if den else 0,
                dur=float(j["format"]["duration"]), audio=any(s["codec_type"] == "audio" for s in j["streams"]))


def frames(path, w, h, fps=None):
    """Yield grayscale frames at (w,h); fps=None = every frame."""
    vf = (f"fps={fps}," if fps else "") + f"scale={w}:{h},format=gray"
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    n = w * h
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w)


def grab(path, t, width=None):
    vf = ["-vf", f"scale={width}:-1"] if width else []
    b = sh(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path, "-frames:v", "1", *vf, "-f", "image2pipe", "-vcodec", "png", "-"], True)
    return cv2.imdecode(np.frombuffer(b, np.uint8), cv2.IMREAD_COLOR) if b else None


def sheet(imgs, labels, dest, cols=6, w=220):
    if not imgs: return None
    tiles = []
    for im, lb in zip(imgs, labels):
        if im is None: continue
        h = int(im.shape[0] * w / im.shape[1]); t = cv2.resize(im, (w, h))
        cv2.rectangle(t, (0, 0), (w, 22), (0, 0, 0), -1); cv2.putText(t, lb, (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        tiles.append(t)
    H = max(t.shape[0] for t in tiles); tiles = [cv2.copyMakeBorder(t, 0, H - t.shape[0], 0, 2, cv2.BORDER_CONSTANT, value=(255, 255, 255)) for t in tiles]
    rows = [np.hstack(tiles[i:i + cols] + [np.full_like(tiles[0], 255)] * (cols - len(tiles[i:i + cols]))) for i in range(0, len(tiles), cols)]
    cv2.imwrite(str(dest), np.vstack(rows)); return str(dest)


def ranges(s):
    out = []
    for part in (s or "").split(","):
        if "-" in part: a, b = part.split("-"); out.append((float(a), float(b)))
    return out


class R:
    def __init__(self): self.rows = []
    def add(self, level, check, detail, **data): self.rows.append(dict(level=level, check=check, detail=detail, **data))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video"); ap.add_argument("--out", default="qc")
    ap.add_argument("--plan", help="timeline.json (meta.fps/width/height/duration, talk[], captions[], cta)")
    ap.add_argument("--script", help="plain text of every on-screen caption / spoken line")
    ap.add_argument("--talk", help="talking ranges, e.g. 0-2.9,23.3-25.7 (else from plan)")
    ap.add_argument("--fps", type=float, default=60); ap.add_argument("--lufs", type=float, default=-14)
    ap.add_argument("--max-cuts-per-10s", type=float, default=5)
    ap.add_argument("--caption-band", default="0.50-0.72", help="caption band as fraction of height")
    ap.add_argument("--skip-ocr", action="store_true")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    plan = json.load(open(a.plan)) if a.plan else {}
    meta = plan.get("meta", {})
    info = probe(a.video); r = R()
    print(f"[qc] {a.video}: {info['w']}x{info['h']} @ {info['fps']:.3f} fps, {info['dur']:.2f} s")

    # ---- format
    want_fps = meta.get("fps", a.fps)
    ok = abs(info["fps"] - want_fps) < 0.05 and (info["w"], info["h"]) == (meta.get("width", 1080), meta.get("height", 1920))
    r.add("PASS" if ok else "FAIL", "format", f"{info['w']}x{info['h']} @ {info['fps']:.2f} fps, {info['dur']:.2f} s (want {meta.get('width',1080)}x{meta.get('height',1920)} @ {want_fps})")
    if meta.get("duration") and abs(meta["duration"] - info["dur"]) > 0.2:
        r.add("WARN", "duration", f"{info['dur']:.2f} s vs planned {meta['duration']} s")

    # ---- per-frame pass: duplicates, flats, cuts, interpolation artefacts
    sw, shh = 216, 384
    prev = prev2 = None; dup = []; flat = []; diffs = []; interp = []
    for i, g in enumerate(frames(a.video, sw, shh)):
        g = g.astype(np.float32)
        if g.std() < 6: flat.append(i)
        if prev is not None:
            d = np.abs(g - prev).mean(); diffs.append(d); dup.append(d < 0.12)
            if prev2 is not None:
                # middle frame (prev) vs mean of its neighbours: warping/ghosting shows as a local spike
                e = np.abs(prev - (prev2 + g) / 2)
                blk = cv2.resize(e, (sw // 12, shh // 12), interpolation=cv2.INTER_AREA)
                interp.append((i - 1, float(np.percentile(blk, 99.5)), float(np.abs(prev2 - g).mean())))
        prev2, prev = prev, g
    fps = info["fps"] or a.fps; N = len(diffs) + 1
    dup_ratio = float(np.mean(dup)) if dup else 0
    lvl = "PASS" if dup_ratio < 0.25 else ("WARN" if dup_ratio < 0.45 else "FAIL")
    r.add(lvl, "true60", f"{dup_ratio*100:.1f}% of frames repeat the previous one (fake 60 fps from 30 fps ~50%)", dup_ratio=dup_ratio)
    if flat:
        spans = []; s = flat[0]; p = flat[0]
        for f in flat[1:] + [None]:
            if f is None or f != p + 1: spans.append((s / fps, (p + 1) / fps)); s = f
            p = f if f is not None else p
        r.add("FAIL" if any(b - a_ < 0.5 for a_, b in spans) else "WARN", "flashes", f"near-uniform frames at {[(round(x,2), round(y,2)) for x,y in spans]} (dip to white/black between shots?)")
    else: r.add("PASS", "flashes", "no blank frames")
    D = np.array(diffs); thr = max(18.0, float(np.median(D) * 6)) if len(D) else 99
    cuts_f = [i + 1 for i, d in enumerate(D) if d > thr]
    cuts = []
    for f in cuts_f:
        if not cuts or f - cuts[-1][-1] > 3: cuts.append([f])
        else: cuts[-1].append(f)
    cut_t = [round(c[0] / fps, 2) for c in cuts]
    per10 = len(cut_t) / max(info["dur"], 1) * 10
    micro = [round(t2 - t1, 2) for t1, t2 in zip(cut_t, cut_t[1:]) if t2 - t1 < 0.15]
    r.add("PASS" if per10 <= a.max_cuts_per_10s and not micro else "WARN", "cuts", f"{len(cut_t)} cuts ({per10:.1f}/10 s): {cut_t}" + (f"; micro-shots {micro}" if micro else ""), cuts=cut_t)
    # interpolation spikes: high local error while global motion is moderate, away from cuts
    cutset = set(f for c in cuts for f in range(c[0] - 2, c[-1] + 3))
    vals = [v for (f, v, m) in interp if f not in cutset]
    base = float(np.median(vals)) if vals else 0
    spikes = [(f, v) for (f, v, m) in interp if f not in cutset and v > max(30, base * 5) and m < 25]
    spikes.sort(key=lambda x: -x[1])
    if spikes:
        sel = spikes[:12]
        sheet([grab(a.video, f / fps, 360) for f, _ in sel], [f"{f/fps:.2f}s e{v:.0f}" for f, v in sel], out / "interp_sheet.jpg")
    r.add("PASS" if len(spikes) < 3 else "WARN", "interp", f"{len(spikes)} frames with local warp/ghost spikes (baseline {base:.1f}); see interp_sheet.jpg" if spikes else "no interpolation spikes", spikes=[round(f / fps, 3) for f, _ in spikes[:30]])

    # ---- shots for face analysis
    bounds = [0.0] + [c[0] / fps for c in cuts] + [info["dur"]]
    shots = [(bounds[i], bounds[i + 1]) for i in range(len(bounds) - 1) if bounds[i + 1] - bounds[i] > 0.3]

    # ---- face geometry (YuNet) at 10 fps
    det = cv2.FaceDetectorYN.create(str(YUNET), "", (320, 320), 0.7) if YUNET.exists() else None
    face_rows = []; crops = []; mouth = {}
    if det is None:
        r.add("WARN", "face", f"YuNet model missing at {YUNET}")
    else:
        FW = 540; FH = int(FW * info["h"] / info["w"]); det.setInputSize((FW, FH)); step = 1 / 10
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", a.video, "-vf", f"fps=10,scale={FW}:{FH}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
        k = 0; n = FW * FH * 3
        while True:
            b = p.stdout.read(n)
            if len(b) < n: break
            im = np.frombuffer(b, np.uint8).reshape(FH, FW, 3); t = k * step; k += 1
            _, f = det.detect(im)
            if f is None: continue
            f = max(f, key=lambda x: x[2] * x[3])
            if f[2] < FW * 0.12: continue
            x, y, w, h = f[:4]; le, re_, no, ml, mr = f[4:6], f[6:8], f[8:10], f[10:12], f[12:14]
            eye = np.linalg.norm(re_ - le) + 1e-6; eyec = (le + re_) / 2; mc = (ml + mr) / 2
            yaw = float((no[0] - eyec[0]) / eye)
            row = dict(t=round(t, 2), w=float(w), aspect=float(h / w), yaw=yaw, mouth_w=float(np.linalg.norm(mr - ml) / eye),
                       nose_drop=float(np.linalg.norm(no - eyec) / eye), mouth_drop=float(np.linalg.norm(mc - eyec) / eye))
            face_rows.append(row)
            if k % 10 == 1:
                x0, y0 = int(max(0, x - w * 0.15)), int(max(0, y - h * 0.15))
                crops.append((t, im[y0:int(y + h * 1.15), x0:int(x + w * 1.15)].copy()))
            # mouth ROI brightness profile for lip-sync (dark mouth opening)
            mw = np.linalg.norm(mr - ml); cx, cy = mc
            roi = cv2.cvtColor(im[int(cy - mw * 0.45):int(cy + mw * 0.55), int(cx - mw * 0.6):int(cx + mw * 0.6)], cv2.COLOR_BGR2GRAY) if mw > 8 else None
            if roi is not None and roi.size: mouth[round(t, 2)] = float((roi < np.percentile(roi, 20) + 8).mean())
        issues = []; per_shot = []
        for s0, s1 in shots:
            rows = [q for q in face_rows if s0 + 0.15 <= q["t"] < s1 - 0.15]
            if len(rows) < 4: continue
            frontal = [q for q in rows if abs(q["yaw"]) < 0.12]
            m = {k2: float(np.median([q[k2] for q in rows])) for k2 in ("nose_drop", "mouth_drop", "aspect")}
            if len(frontal) >= 3:
                mf = {k2: float(np.median([q[k2] for q in frontal])) for k2 in ("nose_drop", "mouth_drop")}
                per_shot.append(dict(shot=(round(s0, 2), round(s1, 2)), n=len(frontal), **{k2: round(v, 3) for k2, v in mf.items()}))
            for q in rows:
                dev = max(abs(q["nose_drop"] / m["nose_drop"] - 1), abs(q["mouth_drop"] / m["mouth_drop"] - 1))
                if dev > 0.18 and q["w"] > FW * 0.2: issues.append((q["t"], round(dev, 2)))
        if per_shot:
            nd = [s["nose_drop"] for s in per_shot]; md = [s["mouth_drop"] for s in per_shot]
            spread = max((max(nd) - min(nd)) / np.median(nd), (max(md) - min(md)) / np.median(md))
            r.add("PASS" if spread < 0.22 else "WARN", "identity", f"frontal facial proportion spread across {len(per_shot)} shots: {spread*100:.0f}% (pose changes raise it; check faces_sheet.jpg)", shots=per_shot)
        r.add("PASS" if not issues else ("WARN" if len(issues) < 4 else "FAIL"), "face", f"{len(issues)} samples with >18% geometry jump inside a shot (distortion/morph): {issues[:12]}" if issues else f"stable facial geometry in {len(face_rows)} samples")
        sheet([c for _, c in crops], [f"{t:.1f}s" for t, _ in crops], out / "faces_sheet.jpg", cols=8, w=150)

    # ---- audio: loudness, transients outside speech, lip-sync
    talk = ranges(a.talk) or [tuple(x) for x in plan.get("talk", [])]
    if info["audio"]:
        e = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", a.video, "-af", "ebur128=peak=true", "-f", "null", "-"])
        I = re.findall(r"I:\s+(-?[\d.]+) LUFS", e); P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
        lufs = float(I[-1]) if I else None; tp = float(P[-1]) if P else None
        ok = lufs is not None and abs(lufs - a.lufs) <= 1.0 and tp is not None and tp <= -0.9
        r.add("PASS" if ok else "WARN", "loudness", f"{lufs} LUFS (target {a.lufs}), true peak {tp} dBTP")
        pcm = np.frombuffer(sh(["ffmpeg", "-v", "error", "-i", a.video, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], True), np.int16).astype(np.float32) / 32768
        hop = 160; env = np.sqrt(np.convolve(pcm ** 2, np.ones(800) / 800, "same")[::hop] + 1e-10); db = 20 * np.log10(env)
        # speech-like = sustained level; transient = short spike above its own 1.5 s surroundings
        loc = np.array([np.median(db[max(0, i - 75):i + 75]) for i in range(0, len(db))])
        spikes = [(round(i * hop / 16000, 2), round(float(db[i] - loc[i]), 1)) for i in range(len(db)) if db[i] - loc[i] > 12 and db[i] > -30]
        import librosa
        flat_ = librosa.feature.spectral_flatness(y=pcm, n_fft=1024, hop_length=hop)[0]
        spikes = [(t, v) for t, v in spikes if flat_[min(len(flat_) - 1, int(t * 16000 / hop))] > 0.12]
        merged = []
        for t, v in spikes:
            if not merged or t - merged[-1][0] > 0.3: merged.append([t, v])
            else: merged[-1][1] = max(merged[-1][1], v)
        r.add("PASS" if not merged else "WARN", "sfx", f"{len(merged)} short loud transients (>12 dB over surroundings): {merged[:10]} - noise-like (whoosh/swish/click)" if merged else "no loud noise-like transients (whoosh/swish) over the bed")
        if talk and mouth:
            res = []
            for t0, t1 in talk:
                ts = sorted(t for t in mouth if t0 <= t <= t1)
                if len(ts) < 12: res.append((t0, t1, None, None)); continue
                mv = np.array([mouth[t] for t in ts]); av = np.interp(ts, np.arange(len(env)) * hop / 16000, env)
                mv = (mv - mv.mean()) / (mv.std() + 1e-6); av = (av - av.mean()) / (av.std() + 1e-6)
                best = max(((lag, float(np.mean(mv[max(0, lag):len(mv) + min(0, lag)] * av[max(0, -lag):len(av) - max(0, lag)]))) for lag in range(-4, 5)), key=lambda x: x[1])
                res.append((t0, t1, best[0] * 100, round(best[1], 2)))
            bad = [x for x in res if x[2] is not None and (abs(x[2]) > 100 or x[3] < 0.2)]
            r.add("PASS" if not bad else "WARN", "lipsync", "; ".join(f"{a_}-{b_}s: " + (f"lag {l:+.0f} ms, corr {c}" if l is not None else "face not found") for a_, b_, l, c in res) + " (mouth opening vs voice envelope at 10 fps; |lag|>100 ms or corr<0.2 = check)")
    else: r.add("FAIL", "audio", "no audio stream")

    # ---- OCR: subtitles, safe zones, CTA, garbled brand words
    ocr_lines = []
    if not a.skip_ocr:
        try:
            import pytesseract
            for t in np.arange(0.25, info["dur"], 0.5):
                im = grab(a.video, float(t), 1080)
                if im is None: continue
                g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
                d = pytesseract.image_to_data(g, lang="ita+eng", config="--psm 11", output_type=pytesseract.Output.DICT)
                for i, w in enumerate(d["text"]):
                    w = w.strip()
                    if len(w) < 2 or float(d["conf"][i]) < 70: continue
                    ocr_lines.append(dict(t=round(float(t), 2), word=w, y=(d["top"][i] + d["height"][i] / 2) / g.shape[0], x=d["left"][i] / g.shape[1]))
        except Exception as ex:
            r.add("WARN", "ocr", f"OCR unavailable: {ex}")
    if ocr_lines:
        unsafe = sorted({(o["t"], o["word"]) for o in ocr_lines if (o["y"] < 0.14 or o["y"] > 0.65) and len(o["word"]) >= 4 and o["word"].isalpha()})
        r.add("PASS" if not unsafe else "WARN", "safezones", f"{len(unsafe)} text hits outside the 9:16 safe area (top 14% / bottom 35%): {unsafe[:10]}" + (" (product labels in footage also count)" if unsafe else ""))
        if a.script:
            want = re.findall(r"[\wàèéìòù']+", open(a.script).read().lower())
            lo, hi = map(float, a.caption_band.split("-"))
            got = [o["word"].lower() for o in ocr_lines if lo <= o["y"] <= hi]
            got = [re.sub(r"[^\wàèéìòù']", "", g) for g in got]; got = [g for g in got if g]
            vocab = set(want)
            odd = sorted({g for g in got if g not in vocab and len(g) > 3 and max((SequenceMatcher(None, g, v).ratio() for v in vocab), default=0) > 0.75})
            missing = sorted({w for w in vocab if len(w) > 3 and w not in set(got)})
            r.add("PASS" if not odd else "WARN", "subtitles", f"OCR caption words not in script (possible typos): {odd[:15]}; script words never seen on screen: {missing[:15]}")
    texts = " ".join(o["word"] for o in ocr_lines).lower() + " " + (open(a.script).read().lower() if a.script else "") + " " + json.dumps(plan).lower()
    hits = sorted({m.group(0) for p_ in CTA_WORDS for m in re.finditer(p_, texts)})
    allow_cta = bool(plan.get("cta"))
    r.add("PASS" if not hits or allow_cta else "FAIL", "cta", f"CTA words found: {hits}" if hits else "no CTA words in OCR text, script or plan")
    def nrm(w): return re.sub(r"[^a-z-]", "", w.lower().replace("1", "i").replace("|", "i")).replace("l", "i")
    bn = [nrm(b) for b in BRAND]
    def odd(w):
        n = nrm(w)
        if len(n) < 4 or n in bn or any(n in b for b in bn): return False   # exact, or cut-off at frame edge / OCR l-I confusion
        return any(0.72 < SequenceMatcher(None, n, b).ratio() < 1 for b in bn)
    garbled = sorted({o["word"] for o in ocr_lines if odd(o["word"])})
    r.add("PASS" if not garbled else "WARN", "product", f"tokens close to brand words but misspelled (garbled AI label?): {garbled[:12]}" if garbled else "no misspelled brand tokens found by OCR (still check product_sheet)")

    # ---- evidence: 1 fps sheet
    sheet([grab(a.video, t, 360) for t in np.arange(0.5, info["dur"], 1.0)], [f"{t:.1f}s" for t in np.arange(0.5, info["dur"], 1.0)], out / "contact_1fps.jpg", cols=7, w=180)

    # ---- report
    order = {"FAIL": 0, "WARN": 1, "PASS": 2, "INFO": 3}
    md = [f"# Beauty QC: {Path(a.video).name}", "", f"{info['w']}x{info['h']} @ {info['fps']:.2f} fps, {info['dur']:.2f} s", "", "| level | check | detail |", "|---|---|---|"]
    md += [f"| {x['level']} | {x['check']} | {x['detail']} |" for x in sorted(r.rows, key=lambda x: order[x['level']])]
    md += ["", "Evidence: contact_1fps.jpg, faces_sheet.jpg, interp_sheet.jpg (if any). Numbers catch broken, not bad: look at the sheets."]
    (out / "report.md").write_text("\n".join(md)); (out / "report.json").write_text(json.dumps(r.rows, indent=1, default=str))
    print("\n".join(md))
    sys.exit(1 if any(x["level"] == "FAIL" for x in r.rows) else 0)


if __name__ == "__main__":
    main()
