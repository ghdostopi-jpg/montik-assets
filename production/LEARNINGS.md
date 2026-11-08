# RENE AI - production learnings

Updated 8 Nov 2026 after AD_02 and AD_04 (Giulia). Keep this file next to the production system and read it before costing a new ad.

## AD_04 (Giulia, 45 s, 6 before/after pairs)

### Budget
| | Original | Final authorised | Used |
|---|---|---|---|
| PromptWise | 40 | 55 (one-time exception) | 42.4 |
| ElevenLabs | 7,500 | 10,500 (one-time exception) | 10,201 |

### What the credits bought
| Item | PW | EL | Kept in final? |
|---|---|---|---|
| 4 character portraits (Realism Pro) | 0.4 | | yes (A chosen) |
| Master 4K | 4 | | yes (source of all frames) |
| BEFORE + AFTER full face (edits of master) | 4 | | yes (pair 1) |
| 5 BEFORE close-ups (forehead, eye, cheek, mouth, neck) | 10 | | yes (pairs 2-6) |
| 5 AFTER close-ups (AI edit, then pores/lines restored locally from BEFORE) | 10 | | yes |
| V2 / V3 start frames | 4 | | yes |
| V2 application, Kling 3.0 Pro 5 s 1080p | 10 | | yes |
| Voice: V1, V3 lines x2 + VO x1 (eleven_v4, Carla) | | 893 | yes |
| V1 talking head, BEFORE look (OmniHuman) | | 3,413 | **no** - rule changed after it was made |
| V1 talking head, AFTER look (OmniHuman) | | 3,413 | yes |
| V3 talking head with product (OmniHuman) | | 2,482 | yes |
| Music, SFX, edit, captions, graphics, QC, 60 fps | 0 | 0 | local |

### What caused the extra spending
1. "At least 6 distinct before/after pairs, crops do not count" arrived after the start frames were planned: +20 PW (5 BEFORE + 5 AFTER close-ups) instead of crops at 0 PW.
2. "All speaking shots must use the AFTER look" arrived after V1 had been generated in the BEFORE look: +3,413 EL (the first V1 is unused).
3. The account is shared with a parallel production: the account balance cannot be used to measure one ad. Only the ledger can.

### Failed or weak attempts
- Local-only serum sheen on close-ups (0 credits): measurable but too subtle on a phone screen. The AI edit + local texture transplant gave a visible glow with 91-95 % of the BEFORE skin detail. Paid, worth it.
- Browser-pane downloads land late or not at all when several are triggered quickly. Trigger one per new tab and wait; adding cdn.promptwise.com and elevenlabsusercontent.com to the allowed domains would let the device download directly.

### Paid generations that clearly improved quality
- OmniHuman 1.5 1080p for both talking heads (natural mouth shapes, identity held).
- Nano Banana Pro edits of one master for every before/after image (identity stays consistent across 12 images).
- Kling 3.0 Pro for the application shot (press, lift, move to neck).

### Could have been local
- Cheek/neck/eye crops would have been 0 PW if crops had been acceptable as pairs.
- Music and all sound design (done locally: saves ~1,818 EL per 30 s of ElevenLabs music).
- Full-face alignment of BEFORE/AFTER (done locally with face landmarks).

## AD_02 (Alessia, 26 s)
- PromptWise 34.6 / 40; ElevenLabs 6,117 / 6,600 (limit raised by 600 for V3).
- 8 PW went to start frames with garbled product labels and a rejected after-edit; the fix was a local composite of the real product photo.
- Final QC found a 2-frame dip to ivory at 23.3 s that the preview review missed: AdShots now crossfades every shot over the previous one.

## Planning rules for the next ad
1. Lock these before any paid call, in one short brief: length; number and areas of before/after pairs and whether crops count; which look the speaking shots use; whether the product is held in speaking shots.
2. Order: master -> before/after set -> start frames -> V2 -> talking heads last (most expensive and most affected by late rule changes).
3. Cost estimates (Nov 2026):
   - PW: NB Pro 2K 2, 4K 4; Kling 3.0 Pro 5 s 1080p 10.
   - EL: OmniHuman ~960 EL per second of speech; Creatify 720p 2,545 flat; TTS 1 EL per character.
   - A 45 s ad with 2 talking shots (3.5 s + 2.6 s) and 6 pairs: ~43 PW + ~6,800 EL when nothing is redone.
4. Keep spoken lines short: each extra second of on-camera speech costs ~960 EL.
5. Keep a 10-15 % reserve on both budgets for one redo.
6. Run beauty_qc.py on every preview; send the preview before the final render.

## AD_04 review (Rene, 8 Nov 2026) + measured findings - apply from AD_05 on

Verdict: solid foundation. Keep: natural influencer, attractive AFTER look in every speaking shot, clear product demo, authentic Biostile footage, 6 comparison areas, premium natural look, no CTA. Do not reuse AD_04 assets; reuse the principles.

| Area | What AD_04 did | Measured (beauty_qc v2) | Rule from AD_05 |
|---|---|---|---|
| Hook | "Pelle spenta e stanca al mattino? Guarda questa routine." over a smiling talking head | V1 mouth strip: big smile while naming a problem - emotion mismatch | Line names one concrete, felt moment in <= 2.5 s, no "guarda questa routine". Start frame expression must match the line (concerned/curious for a problem hook, smile only on the payoff). Write 5 hook options, pick by: specific, visual, spoken in under 2.5 s |
| Before/after | 6 pairs, 20.4 s total, but 5 pairs only 1.2-1.5 s | `comparisons` WARN: 5 pairs < 2.0 s | Each close-up pair >= 2.2 s, full face >= 4 s, at least 2 pairs >= 3 s with a pause on the AFTER. Fewer packaging shots buys the time |
| Pair matching | Close-up AFTERs were AI edits of the BEFORE + local texture transplant: lighting and angle matched, pores kept (91-95 %) | texture ratio in range | Keep this method. Full-face pair: generate AFTER as an edit of BEFORE (not of the master) so framing matches without rescaling |
| Subtitles | Fraunces Light 60 px, cream, no plate | ~37 px glyph height, 20th-pct contrast 2.0:1, OCR read only 49 % of words | Sans or semibold serif at 64-72 px, weight >= 500, dark translucent plate or 2-3 px dark stroke; contrast >= 4.5:1 target (QC gate >= 3.0); max 2 lines, 18-26 characters per line, break at phrase ends; one fixed band (y 1080-1240) that moves to y 300-420 only when a face or the product label sits in the band |
| Editing | 4 packaging shots (b09, b08, b12, b10) of the box/set; one application angle | `packaging` check now counts them | <= 2 packaging shots per ad. Add: macro skin texture, product close-up in hand, 3/4 face angle, two application angles (cheek + neck), a natural talking-head beat. Push-ins <= 6 % uniform scale, never warp |
| Pacing | 45 s; product section 11.5 s; reveal 11 s | | 40-50 s: hook 0-3 s, problem 3-9 s (2-3 BEFORE macros, 2 s each), product + how-to 9-24 s (<= 2 packaging, 2 application angles), reveal 24-40 s (full face 4 s + 5 pairs x 2.2-3 s), close 40-45 s talking head |
| Lip-sync | OmniHuman 1080p; QC proxy inconclusive | mouth_strip_*.jpg now exported at 15 fps | Check the strips and the clip at 1x before delivery; keep spoken lines <= 3.5 s; neutral-mouth start frame |
| QC process | Final QC ran after delivery prep | | Run beauty_qc on the 30 fps preview AND the final; legibility, comparisons, packaging, flashes, face, CTA must PASS or be explained |

### AD_05 quality targets (gates)
- Hook: problem stated by 2.5 s; first cut by 3 s.
- Subtitles: legibility PASS (>= 44 px glyph height, contrast >= 3.0:1 at 20th percentile, OCR reads >= 60 % of the script).
- Comparisons: 6 areas, every pair >= 2.2 s, total 16-20 s; `comparisons` PASS.
- Packaging shots <= 2; at least 5 distinct shot types (talking head, 3/4 angle, macro skin, product in hand, application x2).
- No flashes, no face distortion, no CTA, -14 LUFS / -1 dBTP, true 60 fps.
- Credits: lock the brief checklist before any paid call; target <= 45 PW and <= 7,000 EL for a 45 s ad with two talking shots; no redo caused by a late rule.

### Brief lock checklist (answer before generating)
1. Length and hook line (Italian, <= 2.5 s).
2. Speaking look (AFTER) and expression per speaking line.
3. Before/after: areas, number of pairs, crops allowed or not, seconds per pair.
4. Application angles (cheek, neck) and whether one Kling clip or two.
5. Caption style (pick from 3 stills) and sticker policy.
6. Budgets per account, and whether other productions share the account.

### New techniques that worked (keep)
- AI edit for AFTER close-ups + high-frequency transplant from BEFORE: visible glow, real pores kept.
- Face-landmark alignment of full-face pairs (uniform scale only).
- Local music synthesis per ad (0 credits, original).
- beauty_qc: legibility, comparison timing, packaging count and mouth strips added after AD_04.

### Do not assume
A more expensive model is not automatically better: Creatify 720p and OmniHuman 1080p cost about the same per short line; Kling 3.0 Pro 5 s (10 PW) was enough for application; Seedance 1080p would have cost several times more for the same shot.
## AD_06 (Livia, 50.9 s, 6 pairs) - 8 Nov 2026

### Budget
| | Cap | Used |
|---|---|---|
| PromptWise | 30 | 26.4 (4.0 of it unused: portrait B edit started before Rene picked D) |
| ElevenLabs | 12,000 | 10,438 |

### What the credits bought
| Item | PW | EL | In final? |
|---|---|---|---|
| 4 portraits (Realism Pro) | 0.4 | | D chosen |
| AFTER hero 4K of portrait B | 4 | | no - creator changed while it ran |
| AFTER hero 4K of portrait D (also V1 start frame) | 4 | | yes |
| BEFORE 4K = edit of the AFTER hero (same framing) | 4 | | yes - source of all 6 BEFORE crops |
| V2 / V3 start frames 2K | 4 | | yes |
| V2 application, Kling 3.0 Pro 5 s | 10 | | first 3.6 s only |
| TTS: V1 x2, V3 x2, VO body x2 (eleven_v4, Chiara) | | 1,440 | one take each |
| Scribe word timings x3 | | 0 | free |
| V1 talking head 3.8 s (OmniHuman 1080p) | | 3,646 | yes |
| V3 talking head 2.8 s (OmniHuman 1080p) | | 2,637 | yes |
| V2b neck press 4 s (Kling 3 Pro via ElevenLabs, no audio) | | 2,715 | 2.1 s used |
| Music, edit, captions, graphics, QC, 60 fps | 0 | 0 | local |

### Workflow optimizations that saved time or credits without losing quality
1. **6 pairs from ONE 4K pair** (AFTER hero + BEFORE edit of it): all close-ups are crops of the same aligned pair + high-frequency transplant. 8 PW for 12 images (AD_04: 28 PW). Texture ratio 0.87-0.96. Limit: 4K NB Pro output is upscaled from ~1K detail, so close-up crops are soft at 1:1 - present them as cards (1008x821) or panels, not full-bleed macros wider than ~1.3x.
2. **Downloads as one JSON bundle per tab** (fetch -> base64 -> one Blob download): one download instead of 3-6. Downloads land in ~/Downloads 1-6 min late; wait, do not re-trigger (re-triggering created duplicates).
3. **Scribe transcription is free** (0 EL) and gives word times for captions: no local Whisper needed (HuggingFace is blocked anyway).
4. **Use estimate_only on every ElevenLabs node** (free): it caught a 5,090 EL Kling call; 4 s, no audio cut it to 2,715.
5. **Parallel work**: TTS + start frames + B-roll trims + music + Remotion layout + 60 fps interpolation (background job) while generations ran.
6. **One builder script** (build06.py) writes props, timeline (shots, talk ranges, voice placement), captions text and runs the VO cuts: picture, mix and QC share one clock.
7. Draft preview + QC before the last clip arrived (placeholder clip) caught layout issues early.

### Mistakes / extra spend and the rule that prevents them
| What happened | Cost | Rule |
|---|---|---|
| Hero edit started on portrait B before the creator was confirmed | 4 PW | Show the 4 portraits and wait for the pick when the user is present, or pick and only then generate. Never start the 4K hero in the same turn as showing portraits. |
| Kling application clip: serum streak appears on the cheek after 3.7 s, neck press never happens | 2,715 EL for a neck insert | Plan application as two short clips (cheek 4 s, neck 4 s) from the start; prompt "no drips or streaks"; check the last 1.5 s of every AI clip before planning the edit. |
| V3 clip (2.76 s) shorter than its planned slot (3.3 s) | 0 | Plan talk slots from the audio length: slot = audio + 0.4 s hold (tpad clone). |
| minterpolate drops ~0.1 s at the end of each clip | 0 | Always add tpad=stop_mode=clone:stop_duration=0.5 after minterpolate. |
| Captions in the lower band covered hands/product on application shots | 0 | Captions move to the top band (y 300) on every B-roll and application shot automatically (Ad06 Captions: high = video shot that is not V1/V3). |
| QC flagged "cta" from the plan's own "cta": false key | 0 | Fixed in beauty_qc.py. |

### AD_06 creative choices (do not reuse; use as reference for originality)
- Hook: social moment + twist ("Tutti mi chiedevano: «Sei stanca?» E non lo ero.") with a callback ending ("Adesso nessuno me lo chiede più."). Hook line set as a serif title, not a caption.
- Identity "Lamplight": warm ink, lamp amber, ivory; Instrument Sans 600 captions on a dark plate (0.84) with amber active word; Instrument Serif italic labels ("prima" / "dopo").
- Comparisons: full face = BEFORE folds into a picture-in-picture card over the AFTER; close-ups = stacked cards with an iris reveal of the AFTER. Not used before: Daylight Lab (AD_02), slider / wipe / halves (AD_04).
- Music "Lamplight": 96 BPM FM electric piano, A minor -> C major lift at the reveal (local synthesis).

### Next-ad checklist additions
- Lock creator choice before any 4K call.
- Two application clips (cheek, neck), 4 s each, or one 5 s Kling with an end frame showing the neck press.
- Every talk slot = audio length + 0.4 s.
- Budget estimate for a 50 s ad with this method: ~22 PW + ~7,700 EL if nothing is redone.

### Caption placement rule (Rene, 8 Nov 2026 - applies to every ad)
- Default: just below the middle of the frame (caption centre y ~1090 of 1920).
- If that band covers a face: move the caption above the face; always inside the safe area (top >= 290 px, bottom <= 1248 px).
- Automated: render a captions-off preview, then `python3 production/pipeline/caption_place.py nocap.mp4 props.json` writes a `top` per caption (YuNet landmarks: forehead..chin; a face must be under >= 3 of 5 samples of the caption).
- Pauses: no silence between voice lines longer than ~1.5 s (Rene flagged 2.6-2.8 s gaps in AD_06 v1).
- VO cuts: never cut at Scribe word times (they run 0.1-0.4 s late; AD_06 v2 cut "settimana..." into the next "la"). Measure silences (< -50 dB for >= 60 ms) and cut in the middle of one; check every segment head/tail is below -50 dB.
