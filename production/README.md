# RENE AI production system (code only)

Repeatable pipeline for Italian AI UGC beauty ads (Biostile MicroInfusion and future products).
No footage, faces, voices or music live in this public repo: those stay in the local project folder
`RENE AI VIDEOS/MicroInfusion_Set/IT_Italy/AD_xx/`.

```
Creative brief → Script → Storyboard → Character assets → Video generation → Voice
→ Editing (Remotion) → Automated QC → 30 fps preview → approval → Final 1080x1920 60 fps
```

| Stage | Tool here | Notes |
|---|---|---|
| Timeline | `timeline.json` (see below) | one clock for picture, captions, mix and QC |
| 60 fps footage | `pipeline/interp60.sh` | motion-compensated interpolation (real in-between frames); `MODE=native` for 60 fps sources |
| Shot layer | `remotion/AdShots.tsx` | overlap crossfades, no dip-to-white, uniform-scale push on stills |
| Mix | `pipeline/mix.py` | voice-led, music side-chain ducked, −14 LUFS / −1 dBTP, SFX sparse and quiet |
| Preview / final | `pipeline/render.sh preview|final` | final renders in 700-frame chunks (one 1500-frame render was OOM-killed) |
| QC | `qc/beauty_qc.py` | subtitle legibility (size, contrast), comparison timing, packaging count, mouth strips, face distortion, identity drift, lip-sync lag, fake-60, interpolation spikes, flashes, loud whooshes, subtitles (OCR), safe zones, CTA words, garbled brand text |
| Transfers | `pipeline/browser_bundle.js` | many generated files -> one download from the Browser pane |
| QC (generic) | `qc/qa_video_vd.py` | from win4r/video-director (MIT): hook/phone/beat sheets, cuts, freezes, loudness |

## timeline.json (minimal)

```json
{
  "meta": {"id": "AD_03", "fps": 60, "width": 1080, "height": 1920, "duration": 42.0},
  "cta": false,
  "talk": [[0, 3.2], [36.5, 41.5]],
  "shots": [{"kind": "video", "src": "V1_60.mp4", "from": 0, "to": 3.2}],
  "audio": {"duration": 42.0, "voice": [{"file": "V1.mp3", "at": 0}], "music": {"file": "music.wav", "gain_db": -14}}
}
```

## Run QC

```bash
python3 production/qc/beauty_qc.py final.mp4 --out qc/ --plan timeline.json --script captions.txt
python3 production/qc/qa_video_vd.py final.mp4 --out qc_vd/
```
Then look at `qc/contact_1fps.jpg`, `faces_sheet.jpg`, `interp_sheet.jpg` and the video-director sheets.
Numbers catch broken, not bad.

Models: `models/face_detection_yunet_2023mar.onnx` (OpenCV Zoo YuNet, MIT).
Container needs: ffmpeg, Python with opencv ≥4.8 (FaceDetectorYN), numpy, librosa, pytesseract + tesseract `ita`, Node 22, Remotion 4.0.540.

Read `LEARNINGS.md` before costing or planning a new ad: it holds the AD_04 review, quality gates and the brief lock checklist.
