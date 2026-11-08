#!/usr/bin/env python3
"""mix.py timeline.json OUT.wav  - voice-led mix from the same timeline the picture uses.

timeline.json "audio": {
  "duration": 42.0,
  "voice": [{"file": "V1_line.mp3", "at": 0.0}, {"file": "VO.mp3", "at": 3.1}, ...],
  "music": {"file": "music.wav", "gain_db": -14, "fade_out": 1.8},
  "sfx":   [{"file": "glass.wav", "at": 9.4, "gain_db": -24}],      # keep sparse and quiet; no whooshes
  "target_lufs": -14, "true_peak": -1.0 }
Voice is compressed + normalised, music is side-chain ducked under it, then the whole mix is
normalised to target LUFS with a true-peak ceiling.
"""
import json, subprocess, sys
tl = json.load(open(sys.argv[1])); A = tl["audio"]; out = sys.argv[2]; D = A["duration"]
ins, f = [], []
for i, v in enumerate(A["voice"]):
    ins += ["-i", v["file"]]; f.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(v['at']*1000)}:all=1[v{i}]")
nv = len(A["voice"])
f.append("".join(f"[v{i}]" for i in range(nv)) + f"amix=inputs={nv}:normalize=0:duration=longest,highpass=f=80,acompressor=threshold=0.1:ratio=2.5:attack=8:release=120,loudnorm=I=-15:TP=-1.5:LRA=6,apad=whole_dur={D},asplit=2[voice][key]")
k = nv; m = A.get("music")
mixin = ["[voice]"]
if m:
    ins += ["-i", m["file"]]; fo = m.get("fade_out", 1.8)
    f.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{D},volume={m.get('gain_db',-14)}dB,afade=t=out:st={D-fo}:d={fo}[mus]")
    f.append("[mus][key]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=400[md]"); mixin.append("[md]"); k += 1
for j, s in enumerate(A.get("sfx", [])):
    ins += ["-i", s["file"]]; f.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={s.get('gain_db',-24)}dB,adelay={int(s['at']*1000)}:all=1[s{j}]"); mixin.append(f"[s{j}]"); k += 1
if not m: f[-0] = f[-0]  # voice-only is fine
f.append("".join(mixin) + f"amix=inputs={len(mixin)}:normalize=0:duration=first,alimiter=limit=0.89,loudnorm=I={A.get('target_lufs',-14)}:TP={A.get('true_peak',-1.0)}:LRA=8,aresample=48000,atrim=0:{D}[o]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(f), "-map", "[o]", "-c:a", "pcm_s16le", out], check=True)
print("ok", out)
