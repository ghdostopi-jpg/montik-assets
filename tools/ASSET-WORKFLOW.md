# Creative research and asset workflow

## Folders (per project)
projects/<PROJECT>/assets/
  source-footage/   the creator's main takes (never edited in place)
  broll/            extra shots
  product/          packshots, product demos
  licensed-stock/   stock from paid or free licensed libraries (with licence proof)
  motion-graphics/  rendered overlays and graphics
  audio/            music, SFX, voiceover
  references/       study material only (other people's ads): never in the final video
  processed/        working copies made by tools/ingest.py
  manifest.csv      one row per asset: source, licence, specs, working copy
  research-log.md   what we learned from each reference

## Adding an asset
python3 tools/ingest.py FILE --project "<PROJECT>" --category broll --source "..." --license "..."
It keeps the original, never overwrites, probes it, makes an editor-friendly MP4 when needed and logs it.

## Priority when sourcing
1. Existing project assets  2. Official brand material  3. Licensed stock from the user's accounts
4. Public-domain or openly licensed  5. Original motion graphics from the Remotion library

## Rules
- References (YouTube, Pinterest, other ads) are for studying, not reuse.
- Every new asset needs a clear purpose in the story; no filler stock.
- Test a new asset type on a short section in Montik before using it across the edit.
- Purchases, Envato downloads (licence registration per project), account changes and edits to an existing cut need the user's approval.
