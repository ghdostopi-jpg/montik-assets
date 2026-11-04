# claude-video-skills

Video-editing automation for [Claude Code](https://claude.com/claude-code),
built on [Remotion](https://www.remotion.dev/). Drop a pre-cut clip (or a
voiceover + idea) into `projects/<name>/raw/`, tell Claude what you're
making, and it takes it from there - transcription, a beat-timed graphics
plan, captions, b-roll, zooms, and a full audio score, end to end.

## Start here: `/make-video`

The unified entry point is the **`make-video` router skill**
(`.claude/skills/make-video/SKILL.md`). Invoke it (or just ask Claude Code to
"make a video") and it asks what you're making, then runs the right pipeline
end-to-end:

| Making | Engine |
|---|---|
| Talking-head short (9:16) | `.claude/skills/video-edit` (`hf_*` graphics) |
| Long-form (16:9) | `.claude/skills/video-edit-longform` (viz graphics) |
| Faceless motion reel (voiceover only) | `.claude/skills/motion-design-edit` (`pr_*` paper graphics) |
| Reel script only | `.claude/skills/reel-script` (hook/credibility/reframe/tips/CTA) |

Per-video runbook: **EXECUTION.md** · install + brand setup: **SETUP.md** ·
session state: **WORKLOG.md** · agent conventions: **CLAUDE.md**.

## Not one brand - yours

This isn't skinned to a single creator's look. Routes A and B ship with an
example "Visual OS" preset so they render something reasonable out of the
box, but before your first real render, run the **Brand setup** flow in
SETUP.md: a short back-and-forth (primary color, a second accent, fonts,
anything to avoid) that Claude uses to derive a full, coherent token set and
write it into the templates - once, not per video.

---

## Install

```bash
# system tools
brew install node ffmpeg

# python env (shared across all engines)
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# secrets - copy the template and add your key(s)
cp .env.example .env
# then edit .env and set ONE of:
#   ASSEMBLYAI_API_KEY=your_key_here
#   OPENAI_API_KEY=your_key_here
```
All external-tool keys go in the repo-root `.env` file (never in code, never
committed - `.env` is gitignored, `.env.example` is the committed template).
Every script loads it automatically, so you don't export anything in your
shell. Full install (including each engine's own `npm install`) and the
one-time brand setup: **[SETUP.md](SETUP.md)**.

### Transcription options
- **Cloud (default): AssemblyAI or OpenAI Whisper** - fast, no heavy install,
  needs one API key. AssemblyAI tags filler words with timestamps. Audio is
  uploaded to the provider, so avoid this for sensitive clips.
- **Alternative: WhisperX** - fully local, no API/key, but installs PyTorch
  and runs on CPU (slower on Mac). Uncomment `whisperx` in `requirements.txt`.

## Faceless motion-graphics reels (`motion-design-edit`)

For reels with no camera at all - cream paper grid, punch-color cards, taped
proof-card shots, timed to a voiceover - use the `motion-design-edit` skill
(`.claude/skills/motion-design-edit/`). It's a separate, self-contained
skill (own Remotion project, own render pipeline) built for the "paper-reel"
style. Pair it with `reel-script` (`.claude/skills/reel-script/`) to draft
the voiceover script first, in the matching hook/credibility/reframe/
numbered-tips/CTA structure.

See `.claude/skills/motion-design-edit/knowledge/paper_style.md` for the
full design system (colors, the three graphic kinds - `pr_card` / `pr_punch`
/ `pr_proof` - and the 5-part story structure) and the skill's own
`SKILL.md` for the render pipeline. Full step-by-step workflow: see the
"Faceless motion-graphics workflow" section in [EXECUTION.md](EXECUTION.md);
install details in [SETUP.md](SETUP.md).

Supports two selectable visual styles per project (Paper Brand - the
original cream/ink/orange reference-reel look, default - or your configured
Visual-OS-style brand) and a recurring-series pattern (`STYLE.md` creative
contract + the shared `scripts/series_pipeline.sh`) for projects that ship
more than one episode - see EXECUTION.md's "Visual style" and "Recurring
series" subsections.

## Assets - none ship, and nothing breaks

This repo is **code only**. No music, no sound effects, no brand logos, no
mascot art - every media directory arrives empty with a `.gitkeep`. That keeps
the licensing story simple (everything here is MIT, full stop) and leaves you
in control of what goes into your videos.

Nothing is broken in the meantime - each engine degrades cleanly:

| You supply | Where | Without it |
|---|---|---|
| Music bed (`.mp3`) | `.claude/skills/video-edit/music/` | render completes unscored |
| SFX cues (`.wav`/`.mp3`) | `assets/sfx/` | each missing cue is skipped, not an error |
| Brand logos (`.png`) | `.claude/skills/video-edit{,-longform}/assets/logos/` | `scripts/fetch_logo.py` fetches them from Wikipedia on demand |
| Mascot still + clips | `remotion/public/claude-mascot.png`, `remotion/public/mascots/` | those beats render without a mascot |

Naming conventions and per-engine details: **[SETUP.md](SETUP.md)** ("Assets").

## Honest limitations
- No rough-cut / filler-removal automation is included - `video-edit` and
  `video-edit-longform` are finishers, not cutters. Trim raw multi-take
  footage down to a clean pre-cut clip yourself before routing it through
  `/make-video`.
- The Remotion projects under `.claude/skills/*/remotion/` each need their own
  `npm install` - they're independent, not symlinked, so expect a few hundred
  MB per engine you actually use.

## Author

Tamil Iniyan.

## License

MIT - see [LICENSE](LICENSE). It covers everything in this repository:
scripts, Remotion templates, skill definitions, and docs. No third-party
media is bundled (see [Assets](#assets--none-ship-and-nothing-breaks)), so
there are no extra terms to check - whatever music, SFX, logos, or stock
footage you add is yours to license.
