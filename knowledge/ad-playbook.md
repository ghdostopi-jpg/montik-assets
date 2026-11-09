# Ad playbook

The living knowledge base for every ad edit. The `ugc-ad-studio` skill reads this file before each edit and adds what it learned after. A weekly research task adds new findings from the web.

Rules for this file:
- Every outside finding has a source link and the month it was found.
- Vendor blogs (tools that sell ad analytics) are useful but biased: mark them "(vendor)".
- Production lessons come from our own edits and user review notes. They outrank general advice.
- This repo is public: no client figures, prices, ad-account numbers or private footage here.

---

## 1. What makes ads perform (outside research)

### Metrics to judge a cut (Meta and TikTok, 2026)
- **Hook rate** = 3-second plays ÷ impressions (TikTok: 2-second views). Meta: under 20 % needs work, 25–35 % competitive, 35 %+ elite. TikTok runs about 5 points higher. [Skaler, 2026 (vendor)](https://skaler.app/blog/hook-rate-benchmarks-2026)
- **Hold rate** = ThruPlays ÷ 3-second plays. Under 40 % means a weak middle; aim for 45 %+ before scaling spend. (same source)
- Low hook + good hold → keep the body, test 5–10 new opening frames. Good hook + low hold → tighten the middle, bring the value earlier. (same source)

### The first seconds
- Open on a person, a contradiction or a number. The first second is "creative, not commercial": no product, logo, price or CTA in frame 1. [Skaler (vendor)](https://skaler.app/blog/hook-rate-benchmarks-2026)
- Treat the first 3 seconds as a separate creative problem: brief and test hooks separately from the body.
- Our own rule (user review, Nov 2026): the creator's face is visible from frame 0. No text-on-black cinematic opener.
- Frame 1 stays creative, but don't hold the brand back: ads that set up brand and core message within 5 s were 1.7× more likely to drive strong purchase intent; branding repeated through the ad beat a single end logo (1.8×); for conversion ads keep branding under about 25 % of the runtime. About 100 ads in DE/UK/IT/TR, ~100 viewers each, so correlational. [Meta/Toluna, Aug 2026](https://tolunacorporate.com/what-makes-short-form-video-ads-work-meta-toluna-study/)
- Same study: direct-to-camera, lower-fidelity delivery beat heavily produced ads, audio plus visual cues beat visuals alone, and emoji use went with a 2.5× purchase-intent uplift. (same source)

### Meta's Andromeda system: creative is the targeting
- Meta now reads each ad's content to decide who sees it, so the set of creatives does the targeting. Near-duplicate ads get grouped and compete with each other instead of reaching new people. [Segwise, 2026 (vendor)](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026)
- Aim for 8–12 truly different concepts per campaign, 2–3 variations each. "Different" means a different hook, format, emotional trigger or visual treatment; a new headline on the same video does not count. (same source)
- Refresh creatives every 2–3 weeks; signs of fatigue: CTR down 10 %+ week on week, CPA up 15 %+, frequency over 3. (same source)
- What this means for our edits: every variant needs a visibly different opening, caption look or structure, not just new text.
- Meta's Oct 2026 engineering post: Andromeda now scores every eligible ad rather than a narrowed subset. Meta claims +2.4 % Facebook conversions since 2025 and gives no account-level results. [PPC Land, Nov 2026](https://ppc.land/meta-says-andromeda-lifted-facebook-conversions-2-4-since-2025/)
- Meta's Help Centre advises fewer ads per ad set with diverse assets inside each ad (up to 10 assets). Adding ads counts as a significant edit, so launch new concepts in batches; an ad set needs about 50 results a week to leave learning. [Segwise summary, Nov 2026 (vendor)](https://segwise.ai/blog/meta-andromeda-2-0.md)

### Beauty and skincare patterns (2026)
- UGC video is the most common format among top beauty ads (about 37 %); UGC-style pacing beat polished versions. [Evolut agency, 2026 top beauty ads](https://evolutagency.com/2026-top-beauty-ads-intelligence-report/)
- Demonstration wins: about 39 % of top ads are demo-led, and nearly half of ads that ran 6+ months were demo-first. Show the product being used. (same source)
- Overproduced visuals tired out faster; animation-heavy ads ran shorter. Keep motion graphics in service of the footage, not instead of it. (same source)
- Testimonial talking heads work best with overlay captions; proof (reviews, expert quotes, ingredient callouts, timed results) is strongest next to a demo. (same source)
- Hook frameworks seen in top ads: "I didn't expect this to work…", "I used this for X days…", "What no one tells you about…", "This is my third bottle of…". Use only when the creator actually says it. (same source)
- Heavy urgency and discount lines correlated with shorter-running ads; demo-first, light-CTA ads ran longest. (same source)

### Rules and policy (EU, Meta, TikTok)
Not legal advice; check anything risky with the brand's counsel.
- EU AI Act Art. 50 has applied since 2 Aug 2026: AI image, audio or video that looks authentic must be labelled, even a realistic generic "consumer". Simulated consumers promoting a product don't get the artistic exception. [Gleiss Lutz on the Commission's guidelines, Nov 2026](https://www.gleisslutz.com/en/know-how/update-ai-transparency-advertising-european-commissions-guidelines-ai-act)
- Label needed: altering body shape or skin colour, face replacement, adding or removing objects in a way that changes meaning, and an AI image that makes a product look better than it is. No label: minor crop or colour tweaks; a real product on an AI background if it doesn't mislead. Synthetic voice-overs may need marking; audio fixes are a grey area. (same source; guidelines are non-binding)
- Platform AI labels: Meta "AI Info", TikTok AIGC toggle (AI voice-overs and synthetic visuals in sponsored posts; AI-written scripts and captions exempt), YouTube altered-content toggle. [Cinerads, Jul 2026 (vendor)](https://www.cinerads.com/blog/ai-ad-disclosure-requirements)
- Botanical supplements: until the EU finishes its botanical review, no psychological or behavioural claims, and general wellbeing wording needs an authorised specific claim next to it (with the Art. 28(6) exception). [CJEU C-386/23 Novel Nutriology, 2025](https://www.ippt.eu/items/ippt20250430-cjeu-novel-nutriology)
- TikTok tightened its Weight Loss and Muscle Gain policy in Jul 2026 (and Weight Management and Body Image in May): read these before any slimming or body-shape supplement ad. [TikTok policy change log](https://ads.tiktok.com/help/article/tiktok-ad-policy-change-log-2026)
- Watch: the EU Digital Fairness Act proposal (influencer marketing, dark patterns) was expected mid-Nov 2026, no text seen yet. The brand commissioning creator content already carries the duty to make it identifiable as advertising. [Lawgent, Nov 2026](https://lawgent.se/the-digital-fairness-act-arrives-in-november-most-of-what-it-targets-is-already-unlawful/)

### Remotion and open resources
- Remotion v4.0.523 (Sep 2026): `blurSlide()` in `@remotion/transitions`, `tear()` in `@remotion/effects`, a basic captions Element, asset transcription in Studio. [Release notes](https://github.com/remotion-dev/remotion/releases/v4.0.523)
- Remotion Elements: drop-in catalog inside Studio with caption styles (Rounded, Moving Pill, Popping Word, Word Highlight), text effects, overlays. Licence not stated on the page, check before use. [Elements, Nov 2026](https://convert.remotion.dev/elements)
- Remocn: MIT copy-paste Remotion components (transitions, backgrounds, scenes, kinetic titles), installed with `npx shadcn add`. [Remocn, Nov 2026](https://awesome.ecosyste.ms/projects/github.com%2FRemocn%2Fremocn)

---

## 2. Production lessons (our own edits)

Montik and Remotion
- Graphics go on two tracks: transparent WebM VP9 = PREVIEW (editor only; exports as black), ProRes 4444 parts under 100 MB = EXPORT (exports correctly; browsers can't play it). Before export: PREVIEW hidden, EXPORT on.
- Montik drops the last frame of a video file. ProRes parts overlap by 6 frames, and each clip starts 0.1 s before its join with `in` 0.1, so no clip reaches its file's last frame.
- Montik HTML overlays can't fetch files and have a size limit; a full Remotion bundle can't run inside one.
- Montik's "dissolve" is a grainy pixel effect; use "fade".
- All text and graphics inside the centred 1:1 square (y 420–1500 on 1080×1920).

Cutting and audio
- Never cut inside a word; check 0.1 s before each kept segment for stray words (a reused take carried a "Ja" into two places).
- Don't remove short pauses inside one continuous take: the jump reads as a glitch.
- Crossfades on speech: 0.1 s max, or none.
- Audible breaths between sentences: the user wants them cut out (review, Nov 2026). Cut the breath, keep ~0.1 s before and after the words, and cover the jump with B-roll.
- End of the last spoken shot: end it ~0.35 s after the last word, fade its audio, crossfade 0.5-0.6 s into the end card; an abrupt room-tone stop sounds like a glitch.
- Check talking-head segments for slow motion and cover them with real-speed B-roll.
- Creator audio can have music baked in: cuts then jump the music. Offer voice/music separation.
- Some "talking heads" arrive already edited (voice-over over lifestyle and demo shots). Then add B-roll only where a shot is weak (far wide, repeated angle); the demo footage already does the illustrating.

Design
- Load latin-ext font files so č š ž render.
- Squash/stomp effects must keep proportions; flattening to a line looks like a glitch.
- CameraMotionBlur needs a solid background inside the blur layer.
- Pop-ups and info cards: entrance 0.5-0.6 s, exit 0.4 s, and at least 2 s fully readable; a claim card with ~17 words needs about 4 s (review, Nov 2026).
- "Too empty" feedback: every 2-3 s something should change (B-roll, sticker, callout), each tied to a spoken word.
- Luminous hero words: plum shadow layer, wide coral blur, tight glow, then sharp gradient letters on top. The letters themselves never blur at rest.
- Any wrapper with a CSS transform becomes the positioning box for absolute children: give scene wrappers `position: absolute` or graphics land off-screen in previews.
- Locked rings/arrows on product details only on tripod shots (check frames at start and end of the beat that the object does not move).
- Graphics amplify claims: show only authorised wording (e.g. EU 432/2012 vitamin C claim) in callouts; leave unauthorised benefits the creator says in the spoken captions only.

- Users may delete the EXPORT track or unhide PREVIEW when the editor shows graphics frozen: always re-check the tracks before exporting and tell the user the rule again.

Depth ("text behind the person")
- Needs the original footage file: Montik exports and media cannot be downloaded from the sandbox (401). Ask the user early to drop the source file into the connected folder.
- BiRefNet runs out of memory in the 6 GB sandbox; u2net_human_seg (person) + isnet-general-use (held objects) + guided-filter edges works on CPU. Script: `remotion/scripts/depth_matte.py`.
- Compose so the person covers only the end of one wide letter (a T or O), never the middle of the hero word.

Sourcing
- Pixabay/Pexels pages and CDNs are blocked from the sandbox shell and WebFetch; Montik `import_media` can still pull a public file URL server-side.

---

## 3. Ideas to test next
- Hook variants per ad: 3 different opening frames on the same body (person + contradiction, person + number, demo-first).
- Demo-first variant: open on the product in use, voice from the talking head.
- A light-CTA end card vs. the current button end card.
- Branding timing: same body, (a) brand named by second 5 and shown lightly through the ad vs. (b) end-card logo only. Keep frame 0 on the creator's face in both.
- One emoji-accented caption look vs. the clean caption identity, as a separate concept. The emoji uplift is correlational and our default is no emoji, so judge by hold rate and purchases.
- `blurSlide()` as the B-roll transition and `tear()` as a one-off reveal on a before/after or claim beat; compare with current cuts.
- AI check before export: list any AI voice, AI B-roll or retouching in the project, and label it where the rules above apply. Never use AI to change skin or results in a skincare demo.

---

## Superseded
- "Meta reads each ad's content" and "near-duplicates get grouped" (section 1, Segwise): treat as practitioner inference. Meta's Oct 2026 post describes LLM features only on the user side and doesn't discuss creative diversity. Distinct concepts remain the working advice.
- "8–12 concepts per campaign": a vendor rule of thumb. The same vendor now suggests 3–6 distinct concepts per ad set; fit the number to budget (Nov 2026).

---

## Research log
- 2026-11-09: weekly research. Added Meta/Toluna short-form study, Andromeda Oct 2026 post, EU AI Act Art. 50 ad guidance, CJEU botanical ruling, TikTok health policy updates, Remotion v4.0.523, Elements, Remocn. Digital Fairness Act text not yet available.
- 2026-11-04: Renata KOLAGEN review notes: breath cuts, reading time for cards, "too empty" fix, end-card audio.
- 2026-11-04: Renata KOLAGEN edit: depth/matte, glow-type, product-callout and sourcing lessons added.
- 2026-11-04: first version. Sources: Skaler hook-rate benchmarks, Segwise on Meta Andromeda, Evolut 2026 top beauty ads report. Lessons from the MicroInfusion (Gabor Nastja) edit.
