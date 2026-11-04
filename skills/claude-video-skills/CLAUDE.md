# video-pipeline

Video-editing automation for Claude Code. **All video work starts at
`/make-video`** (`.claude/skills/make-video/SKILL.md`) — it asks what you're
making, scaffolds `projects/<name>/`, and routes to the right pipeline. Don't
pick a sub-skill directly unless the user names it.

| Making | Route | Engine |
|---|---|---|
| Talking-head short (9:16) | A | `.claude/skills/video-edit` — `hf_*` graphics |
| Long-form (16:9) | B | `.claude/skills/video-edit-longform` — viz graphics |
| Faceless motion reel (VO only) | C | `.claude/skills/motion-design-edit` — `pr_*` graphics, Paper Brand or Visual OS style (per project) |
| Reel script only | D | `.claude/skills/reel-script` |
| *Faceless motion long-form (16:9)* | *planned, not yet routed* | — |

Per-video runbook: **EXECUTION.md**. Install + brand setup: **SETUP.md**.
Session state and standing decisions: **WORKLOG.md** (read first, append
after every session). Route C's recurring-series pattern (`STYLE.md` +
shared `series_pipeline.sh`) and its selectable visual style are documented
in EXECUTION.md.

## Brand — not one-size-fits-all

Routes A/B (and route C when `visual-os` is chosen) render in whatever brand
**`BRAND.md`** records. **`BRAND.md` does not ship** — the "Brand setup" flow
in SETUP.md writes it. Run that flow once, before your first real render, to
replace the shipped example preset with your own colors and fonts — it's a
short conversation (primary color, a second accent, fonts, anything to
avoid), not a config file to hand-fill. Until then the example preset below
is what renders.

- Ships with an example **"Visual OS"** preset until you customize it: deep
  navy ink, electric-blue accent, warm punch color, light background;
  Georgia titles · Inter body · JetBrains Mono peripheral chrome only
  (eyebrows, tags, footers, annotations).
- **Discipline that survives any rebrand:** one clear accent color per
  frame, a punch/execution color distinct from it, peripheral-chrome fonts
  never bleed into headline/body roles.
- Token files (mirror `BRAND.md`'s values; edit them to re-skin, never
  hardcode a one-off color inline):
  `.claude/skills/video-edit/remotion/src/templates/hfBrand.ts` ·
  `.claude/skills/video-edit-longform/remotion/src/motion/tokens.ts` ·
  `.claude/skills/motion-design-edit/remotion/src/templates/paperBrand.ts`
- Route C (`pr_*`) is the one exception: it supports **two selectable
  styles** — Paper Brand (cream/ink/orange, the original reference-reel
  look, default) or the Visual-OS-style preset — chosen per project via
  `.pr_style`. Paper Brand intentionally does NOT follow your configured
  brand; it's its own independent look.

## Hard rules

- **Read `MOTION-STYLE.md` (repo root) before authoring any beat plan or
  animation code** — visual concepts not captions, motion density, asymmetry.
- Never auto-run a final render — preview first, explicit user sign-off.
- Pass an **absolute** `OUT_DIR` to any render.sh.
- Transcribe via `.claude/skills/make-video/scripts/transcribe_assemblyai_bridge.py`
  (needs ONE of `ASSEMBLYAI_API_KEY` / `OPENAI_API_KEY` in `.env`); verify
  the transcript and hand-patch `words.json`.
- Finals → `projects/<name>/outputs/`, previews → `outputs/previews/`,
  intermediates → `~/.cache/video-edit/<hash>/`. Never write into `raw/`.
- This machine's ffmpeg may be a minimal build with no libass — captions/
  graphics render inside Remotion, never via ffmpeg subtitle burn.
