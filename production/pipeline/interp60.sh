#!/usr/bin/env bash
# interp60.sh IN OUT [START] [DURATION]
# True 60 fps: motion-compensated interpolation (new in-between frames), scaled/cropped to 1080x1920.
# ~35-60 s of CPU per second of 1080p footage on 2 cores. Native 60 fps sources: use --native (fps filter only).
set -euo pipefail
IN=$1; OUT=$2; SS=${3:-0}; T=${4:-}
MODE=${MODE:-mci}   # MODE=native for 59.94/60 fps sources
VF="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
if [ "$MODE" = native ]; then VF="$VF,fps=60"; else VF="$VF,minterpolate=fps=60:mi_mode=mci:mc_mode=obmc:me_mode=bidir"; fi
ffmpeg -v error -y -ss "$SS" ${T:+-t "$T"} -i "$IN" -an -vf "$VF,format=yuv420p" -c:v libx264 -preset veryfast -crf 15 "$OUT"
echo "ok $OUT"
