# Ad playbook

The living knowledge base for every ad edit. The `ugc-ad-studio` skill reads this file before each edit and adds what it learned after. A weekly research task adds new findings from the web.

Rules for this file:
- Every outside finding has a source link and the month it was found.
- Vendor blogs (tools that sell ad analytics) are useful but biased: mark them "(vendor)".
- Production lessons come from our own edits and user review notes. They outrank general advice.
- This repo is public: no client figures, prices, ad-account numbers or private footage here.

---

## 1. What makes ads perform (outside research)

### Winning ad blueprints (pick one per concept)
Survival data means the ad ran long, not proven sales.
- **Real demo (skincare, longest-running, ~293 days avg):** creator states a specific problem → real-time demo on own skin → immediate result → light CTA or testimonial overlay. Youthforia, Naturium, Hey Bud. [Evolut, 2026](https://evolutagency.com/2026-top-beauty-ads-intelligence-report/)
- **Clinical meets cool (~225 days avg):** claim on screen → expert snippet → product and ingredient callouts → review or before/after → strong CTA last. TULA, Typology, Dr. Dennis Gross. (same source)
- **Supplement 30 s arc:** hook 0–3 s → problem 3–6 s → product as an easy routine step 6–12 s → proof and result 12–20 s → offer and CTA, final 2–3 s. Supergut, AG1. [Evolut, 500 supplement ads](https://evolutagency.com/we-analyzed-500-top-supplement-ads/)
- **Science explainer:** a hook line plus micro-animations of the mechanism, with research built into the story. Seed. (same source)
- **Founder mechanism:** founder names problem → explains why it persists → demo → customers confirm → CTA. Icy Bear Dental. [MHI, 2026](https://mhigrowthengine.com/blog/dtc-winning-ad-anatomy/)
- **Collagen/shake library:** formats include demo, testimonial, listicle, podcast chat, split screen, sticky-note reviews, price-comparison whiteboard, animated ingredient stats mid-ad, flavour montage before CTA. [The Collagen Co., Runneth library (vendor)](https://runneth.com/library/the-collagen-co)
- **Length:** in 523 long-running Meta ads, beauty and supplement problem/solution ads ran 30–60 s, and 20–30 s survived worst in every niche. [Brandsearch, updated Nov 2026 (vendor)](https://brandsearch.co/blog/winning-meta-ad-patterns-2026)
- **Hook type by category:** supplements 52 % authority hooks, founder-led in 67 % of video winners; beauty 38 % pain-point; questions weakest overall (8 %). (same source)
- **Beauty "Learn More" CTAs ran longer than "Shop Now".** Static winners use three panels: concern, application, result. (same source)

### Animation and text structures
- **Cuts and clutter:** eye tracking on 2,520 views of 42 ads: shorter scenes raised attention, and visual complexity hurt attention with a delay. So cut often, but keep each frame to one idea. Public-service ads, not product ads. [Wals et al., J. Academy of Marketing Science, 2026](https://researchportal.bath.ac.uk/en/publications/the-dynamic-effects-of-visual-complexity-and-scene-cuts-on-viewer/)
- **Single-claim hold:** one whole claim per frame in open space (Apple). Use for the hero benefit. [Moonb, 2026](https://www.moonb.io/blog/kinetic-typography)
- **Accumulating cards:** each card builds on the last; size or weight changes only on words that earn it (Spotify Wrapped). Use for ingredient lists and "3 reasons". (same source)
- **Evidence build:** lines stack in sequence on a typing sound (NYT). Use for reviews and study proof. (same source)
- **Edit-locked callouts:** text changes on cuts or action beats, one spec per hold (GoPro). Use for B-roll and product details. (same source)
- **Voice-locked reveal:** text appears on the vocal cue, one treatment throughout. This is our caption default. (same source)
- **Openers from top ads:** prop covers product then peels away, reverse-motion drop into the hand, critical comment overlaid then answered, creator talking to themselves across three screens. 63 % of top auction ads have text in frame 1 (Keevx via Segwise). [Segwise (vendor)](https://segwise.ai/blog/anatomy-top-performing-video-ad-frame-by-frame)

### AI animation and editing with Claude
- **Claude Motion (Oct 2026, beta):** text, chart, shape and image animation with MP4 export, on Team and Enterprise plans only. No realistic footage or people, so it suits end cards and explainers, not UGC. [Techotick, Nov 2026](https://www.techotick.com/articles/2026/11/how-to-create-a-video-with-claude-motion-and-remotion/)
- **Motion vs. Remotion:** Motion is one quick export; Remotion gives editable scenes, data-driven copy and repeatable renders, so it stays our route for variants. Official skills: `npx remotion skills add`. (same source)
- **Prompt pattern:** one detailed first brief (length, style, scenes, mood, brand assets), then 3–4 one-change notes. Drafts often have overlaps or elements leaving the frame. [How-To Geek, Nov 2026](https://www.howtogeek.com/claude-can-create-motion-graphics-now-heres-how-easy-it-is/)
- **Self-check loop:** render a contact sheet of frames, score it, fix the worst problem, re-render (Rob Sobers, self-reported). Add to our render-and-verify step. [Motion Design News, Nov 2026](https://blog.mean.ceo/motion-design-news-november-2026/)
- **Morph explainer:** one shape morphing through 8–12 states; useful for a mechanism such as ingredient → skin layer. Anecdotal. (same source)
- **AI product shots:** no single best model. Veo 3.1 locks first and last frame and takes 3 reference images, good for ending on a packshot; Kling 3.0 up to 15 s; Seedance 2.5 up to 30 s, commercial terms unclear. Sora is shut down. Specs from makers, Oct 2026. [Izoard](https://izoard.be/en/blog/ai-video/ai-video-tools-compared/)
- **Toolkit:** MIT list of Claude video skills, including a project template with FFmpeg presets and brand profiles. [Claude-Code-Video-Toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit)

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
- 45 s "real demo" cut vs. a 25 s cut of the same footage, to test whether 20–30 s really underperforms for us.
- Comment-answer opener: creator's face at frame 0, a sceptical comment pops up, she answers it, then the demo.
- Ingredient mechanism as one morphing shape instead of separate cards, using only authorised claim wording.
- Accumulating cards for proof beats vs. our single pop-up cards.
- `blurSlide()` as the B-roll transition and `tear()` as a one-off reveal on a before/after or claim beat; compare with current cuts.

---

## Superseded
- "Meta reads each ad's content" and "near-duplicates get grouped" (section 1, Segwise): treat as practitioner inference. Meta's Oct 2026 post describes LLM features only on the user side and doesn't discuss creative diversity. Distinct concepts remain the working advice.
- "8–12 concepts per campaign": a vendor rule of thumb. The same vendor now suggests 3–6 distinct concepts per ad set; fit the number to budget (Nov 2026).

---

## Research log
- 2026-11-10: removed the EU/platform rules section on user request.
- 2026-11-09: refocused on user request: winning-ad blueprints, animation and text structures, AI animation and Claude editing.
- 2026-11-09: weekly research. Added Meta/Toluna short-form study, Andromeda Oct 2026 post, EU AI Act Art. 50 ad guidance, CJEU botanical ruling, TikTok health policy updates, Remotion v4.0.523, Elements, Remocn. Digital Fairness Act text not yet available.
- 2026-11-04: Renata KOLAGEN review notes: breath cuts, reading time for cards, "too empty" fix, end-card audio.
- 2026-11-04: Renata KOLAGEN edit: depth/matte, glow-type, product-callout and sourcing lessons added.
- 2026-11-04: first version. Sources: Skaler hook-rate benchmarks, Segwise on Meta Andromeda, Evolut 2026 top beauty ads report. Lessons from the MicroInfusion (Gabor Nastja) edit.
