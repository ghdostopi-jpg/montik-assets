"""Tile PNG frames into one labelled contact sheet per composition.
usage: python3 scripts/sheet.py frames_dir out_dir"""
import glob, os, sys
from collections import defaultdict
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22) if os.path.exists("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf") else ImageFont.load_default()
groups = defaultdict(list)
for f in sorted(glob.glob(os.path.join(src, "*.png"))):
    comp, fr = os.path.basename(f)[:-4].rsplit("-", 1)
    groups[comp].append((int(fr), f))
for comp, items in groups.items():
    tiles = []
    for fr, f in items:
        im = Image.open(f).convert("RGB")
        im.thumbnail((270, 480))
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 70, 28], fill=(0, 0, 0))
        d.text((5, 3), f"f{fr}", fill=(165, 204, 60), font=font)
        tiles.append(im)
    cols = min(6, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    W, H = tiles[0].size
    sheet = Image.new("RGB", (cols * (W + 4), rows * (H + 4)), (60, 60, 60))
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % cols) * (W + 4), (i // cols) * (H + 4)))
    sheet.save(os.path.join(out, f"{comp}.jpg"), quality=85)
    print(comp, len(tiles))
