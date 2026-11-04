"""Subject cut-out frames for "text behind the person" depth shots.

Usage: python3 -I depth_matte.py SOURCE.mov START_SEC N_FRAMES OUT_DIR [FPS]
Writes OUT_DIR/0000.png ... (1080x1920 RGBA): the original pixels where the person is,
transparent elsewhere. Place them ABOVE the typography in the Remotion overlay.

Pipeline: ffmpeg frames -> two rembg models (u2net_human_seg for the person,
isnet-general-use for held objects such as a glass) -> union -> guided-filter edge
refinement on the full-res frame (keeps hair strands) -> light temporal smoothing
-> 1 px inward erode to avoid halos. BiRefNet is better but needs > 6 GB RAM.
"""
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

src, start, n, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
fps = float(sys.argv[5]) if len(sys.argv) > 5 else 30.0
os.makedirs(out, exist_ok=True)
raw = os.path.join(out, "_raw")
os.makedirs(raw, exist_ok=True)
subprocess.run(
    ["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{start:.4f}", "-i", src, "-frames:v", str(n),
     "-vf", f"fps={fps},scale=1080:1920:flags=lanczos", os.path.join(raw, "%04d.png")],
    check=True,
)
person = new_session("u2net_human_seg")
objects = new_session("isnet-general-use")
masks, frames = [], []
for i in range(n):
    p = os.path.join(raw, f"{i + 1:04d}.png")
    if not os.path.exists(p):
        break
    im = Image.open(p).convert("RGB")
    a = np.asarray(remove(im, session=person, only_mask=True), dtype=np.float32) / 255
    b = np.asarray(remove(im, session=objects, only_mask=True), dtype=np.float32) / 255
    # objects only where they touch the person (held glass), never background props
    near = cv2.dilate((a > 0.5).astype(np.uint8), np.ones((61, 61), np.uint8)).astype(np.float32)
    m = np.maximum(a, b * near)
    rgb = np.asarray(im, dtype=np.float32) / 255
    m = cv2.ximgproc.guidedFilter(rgb, m, 8, 1e-4)
    masks.append(np.clip(m, 0, 1))
    frames.append(np.asarray(im))
    print("frame", i, flush=True)
for i, (m, fr) in enumerate(zip(masks, frames)):
    prev = masks[i - 1] if i > 0 else m
    nxt = masks[i + 1] if i + 1 < len(masks) else m
    sm = 0.6 * m + 0.2 * prev + 0.2 * nxt
    # only smooth where the three frames agree (still regions): no ghosting on motion
    agree = (np.abs(prev - nxt) < 0.25).astype(np.float32)
    mm = agree * sm + (1 - agree) * m
    mm = cv2.erode(mm, np.ones((3, 3), np.uint8))
    rgba = np.dstack([fr, (np.clip(mm, 0, 1) * 255).astype(np.uint8)])
    Image.fromarray(rgba, "RGBA").save(os.path.join(out, f"{i:04d}.png"))
print("done", len(masks))
