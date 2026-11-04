# WORKLOG — video-pipeline

Agent handoff log. **Read this first, then append your session at the top.**
This is the source of continuity between sessions/agents — record what you did,
where things stand, and what's next, so anyone can pick up from here.
Pipeline steps live in **EXECUTION.md**; this file is state + decisions, not how-to.

---

## Standing preferences / conventions

- **9:16 shorts → `video-edit` skill** (`hf_*`, your configured brand); 16:9 →
  `video-edit-longform`. `BRAND.md` doesn't ship — it appears once you've run
  the brand-setup flow in SETUP.md.
- **`render.sh` cd's into its remotion dir** → pass an **absolute** `OUT_DIR`,
  or the output lands under the skill dir instead of the project.
- Never auto-run the final render — only on explicit sign-off (EXECUTION.md §5).
- **Route C (`pr_*`) has two selectable visual styles**, Paper Brand (default)
  or Visual OS, pinned per project in `projects/<name>/.pr_style`. Ask at
  project intake; never let one project's palette request overwrite the
  shared `paperBrand.ts` for every other project. Recurring series use the
  shared `scripts/series_pipeline.sh <project> build|preview|final` — no
  per-project pipeline.sh copies.
- **`pr_*` preview and final renders are scored (music + SFX) by default** —
  a preview sign-off covers the full experience.

---

## 2026-07-20 — Initial setup

- Ran one-time install per SETUP.md: Python 3.11 venv + `requirements.txt`,
  `npm install` in all three Remotion engines (video-edit,
  video-edit-longform, motion-design-edit). Verified with `tsc --noEmit`
  and Remotion package present (4.0.453).
- `.env` created from `.env.example`; `OPENAI_API_KEY` set for
  transcription (AssemblyAI left blank). `ANTHROPIC_API_KEY` /
  `PEXELS_API_KEY` still unset — optional (polish pass / stock b-roll).
- Brand setup **deferred** — still on the shipped "Visual OS" example
  preset (no `BRAND.md` yet). Run the brand-setup flow (SETUP.md) before
  the first real render.
- Prerequisites (Node 22, Python 3.11.15, ffmpeg 8.1.2, git) were already
  present on this machine — nothing to `brew install`.

(Append new sessions above this line, most recent first.)
