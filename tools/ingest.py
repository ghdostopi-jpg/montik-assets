#!/usr/bin/env python3
"""Ingest one asset into a project's asset folders, safely.

usage: python3 ingest.py FILE --project "NAME" --category broll \
         --source "where it came from (URL, account, person)" \
         --license "licence / permission status" [--notes "..."] [--no-work-copy]

What it does:
  1. Checks the file exists and ffprobe can read it.
  2. Copies the ORIGINAL into assets/<category>/ (never overwrites: adds -2, -3 ...),
     makes the copy read-only and records its SHA-256.
  3. Probes resolution, duration, frame rate, codecs and audio.
  4. If the file isn't Montik/Remotion friendly (not H.264/AAC MP4, variable or odd
     frame rate, or no 8-bit 4:2:0), writes a working copy to assets/processed/
     (H.264 CRF 18, AAC 192k, yuv420p, constant frame rate). The original is untouched.
  5. Appends a row to assets/manifest.csv.
Categories: source-footage, broll, product, licensed-stock, motion-graphics, audio, references
"""
import argparse, csv, datetime, hashlib, json, os, shutil, stat, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATS = ["source-footage", "broll", "product", "licensed-stock", "motion-graphics", "audio", "references"]
FIELDS = ["added", "file", "category", "source", "license", "sha256", "width", "height", "fps", "duration_s",
          "vcodec", "pix_fmt", "acodec", "audio", "working_copy", "notes"]

def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", path],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"Not readable by ffprobe: {path}\n{r.stderr.strip()}")
    return json.loads(r.stdout)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file"); ap.add_argument("--project", required=True)
    ap.add_argument("--category", required=True, choices=CATS)
    ap.add_argument("--source", required=True); ap.add_argument("--license", required=True)
    ap.add_argument("--notes", default=""); ap.add_argument("--no-work-copy", action="store_true")
    a = ap.parse_args()
    if not os.path.isfile(a.file):
        sys.exit(f"File not found: {a.file}")
    info = probe(a.file)
    assets = os.path.join(ROOT, "projects", a.project, "assets")
    dest_dir = os.path.join(assets, a.category); os.makedirs(dest_dir, exist_ok=True)
    os.makedirs(os.path.join(assets, "processed"), exist_ok=True)
    base, ext = os.path.splitext(os.path.basename(a.file)); dest = os.path.join(dest_dir, base + ext); n = 2
    while os.path.exists(dest):
        dest = os.path.join(dest_dir, f"{base}-{n}{ext}"); n += 1
    shutil.copy2(a.file, dest)
    os.chmod(dest, stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)  # read-only original
    h = hashlib.sha256()
    with open(dest, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    v = next((s for s in info["streams"] if s["codec_type"] == "video" and s.get("disposition", {}).get("attached_pic", 0) == 0), None)
    au = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"].get("duration", 0) or 0)
    fps = ""
    if v:
        num, den = (v.get("avg_frame_rate") or "0/1").split("/")
        fps = round(float(num) / float(den), 3) if float(den) else ""
    work = ""
    if v and not a.no_work_copy:
        rfr, afr = v.get("r_frame_rate"), v.get("avg_frame_rate")
        friendly = (v.get("codec_name") == "h264" and v.get("pix_fmt") == "yuv420p" and ext.lower() == ".mp4"
                    and (au is None or au.get("codec_name") == "aac") and rfr == afr)
        if not friendly:
            work = os.path.join(assets, "processed", f"{os.path.splitext(os.path.basename(dest))[0]}_work.mp4")
            target_fps = fps if fps in (24, 25, 30, 50, 60) else 30
            cmd = ["ffmpeg", "-v", "error", "-y", "-i", dest, "-map", "0:v:0", "-map", "0:a:0?",
                   "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                   "-r", str(target_fps), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", work]
            if subprocess.run(cmd).returncode != 0:
                sys.exit("Working-copy conversion failed; the original is kept.")
            probe(work)  # verify it is readable
    row = {"added": datetime.date.today().isoformat(), "file": os.path.relpath(dest, assets), "category": a.category,
           "source": a.source, "license": a.license, "sha256": h.hexdigest()[:16],
           "width": v.get("width", "") if v else "", "height": v.get("height", "") if v else "", "fps": fps,
           "duration_s": round(dur, 2), "vcodec": v.get("codec_name", "") if v else "", "pix_fmt": v.get("pix_fmt", "") if v else "",
           "acodec": au.get("codec_name", "") if au else "", "audio": "yes" if au else "no",
           "working_copy": os.path.relpath(work, assets) if work else "", "notes": a.notes}
    man = os.path.join(assets, "manifest.csv"); new = not os.path.exists(man)
    with open(man, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        if new: w.writeheader()
        w.writerow(row)
    print(json.dumps(row, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
