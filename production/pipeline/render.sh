#!/usr/bin/env bash
# render.sh preview|final ENTRY COMPOSITION PROPS OUT.mp4 MIX.wav
#   preview: 540x960, 30 fps (every 2nd frame), fast; for review only
#   final:   1080x1920, 60 fps, rendered in chunks of 700 frames (a single 1500-frame render was
#            OOM-killed on the 8 GB container), concatenated losslessly, then muxed with the mix.
set -euo pipefail
MODE=$1; ENTRY=$2; COMP=$3; PROPS=$4; OUT=$5; MIX=$6
B=${CHROME:-$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)}
COMMON=(--props="$PROPS" --browser-executable="$B" --gl=swangle)
TMP=$(mktemp -d)
if [ "$MODE" = preview ]; then
  npx remotion render "$ENTRY" "$COMP" "$TMP/v.mp4" "${COMMON[@]}" --scale=0.5 --every-nth-frame=2 --concurrency=2 --crf=22
else
  N=$(python3 -c "import json;print(json.load(open('$PROPS'))['frames'])"); CH=${CHUNK:-700}; i=0; : > "$TMP/list.txt"
  for ((s=0; s<N; s+=CH)); do e=$((s+CH-1)); [ $e -ge $N ] && e=$((N-1))
    npx remotion render "$ENTRY" "$COMP" "$TMP/p$i.mp4" "${COMMON[@]}" --frames=$s-$e --concurrency=2 --crf=16 --x264-preset=medium --offthreadvideo-cache-size-in-bytes=400000000
    pkill -f chrome-headless-shell || true; echo "file '$TMP/p$i.mp4'" >> "$TMP/list.txt"; i=$((i+1)); done
  ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/v.mp4"
fi
# picture length rules: pad the mix with silence if it is shorter (-shortest cut 9 frames off AD_06)
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/v.mp4")
ffmpeg -v error -y -i "$TMP/v.mp4" -i "$MIX" -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 256k -ar 48000 -t "$VD" -movflags +faststart "$OUT"
ffprobe -v error -show_entries stream=width,height,avg_frame_rate:format=duration -of compact "$OUT"
