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

### Meta's Andromeda system: creative is the targeting
- Meta now reads each ad's content to decide who sees it, so the set of creatives does the targeting. Near-duplicate ads get grouped and compete with each other instead of reaching new people. [Segwise, 2026 (vendor)](https://segwise.ai/blog/meta-andromeda-update-creative-strategy-2026)
- Aim for 8–12 truly different concepts per campaign, 2–3 variations each. "Different" means a different hook, format, emotional trigger or visual treatment; a new headline on the same video does not count. (same source)
- Refresh creatives every 2–3 weeks; signs of fatigue: CTR down 10 %+ week on week, CPA up 15 %+, frequency over 3. (same source)
- What this means for our edits: every variant needs a visibly different opening, caption look or structure, not just new text.

### Beauty and skincare patterns (2026)
- UGC video is the most common format among top beauty ads (about 37 %); UGC-style pacing beat polished versions. [Evolut agency, 2026 top beauty ads](https://evolutagency.com/2026-top-beauty-ads-intelligence-report/)
- Demonstration wins: about 39 % of top ads are demo-led, and nearly half of ads that ran 6+ months were demo-first. Show the product being used. (same source)
- Overproduced visuals tired out faster; animation-heavy ads ran shorter. Keep motion graphics in service of the footage, not instead of it. (same source)
- Testimonial talking heads work best with overlay captions; proof (reviews, expert quotes, ingredient callouts, timed results) is strongest next to a demo. (same source)
- Hook frameworks seen in top ads: "I didn't expect this to work…", "I used this for X days…", "What no one tells you about…", "This is my third bottle of…". Use only when the creator actually says it. (same source)
- Heavy urgency and discount lines correlated with shorter-running ads; demo-first, light-CTA ads ran longest. (same source)

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
- Check talking-head segments for slow motion and cover them with real-speed B-roll.
- Creator audio can have music baked in: cuts then jump the music. Offer voice/music separation.
- Some "talking heads" arrive already edited (voice-over over lifestyle and demo shots). Then add B-roll only where a shot is weak (far wide, repeated angle); the demo footage already does the illustrating.

Design
- Load latin-ext font files so č š ž render.
- Squash/stomp effects must keep proportions; flattening to a line looks like a glitch.
- CameraMotionBlur needs a solid background inside the blur layer.
- Luminous hero words: plum shadow layer, wide coral blur, tight glow, then sharp gradient letters on top. The letters themselves never blur at rest.
- Any wrapper with a CSS transform becomes the positioning box for absolute children: give scene wrappers `position: absolute` or graphics land off-screen in previews.
- Locked rings/arrows on product details only on tripod shots (check frames at start and end of the beat that the object does not move).
- Graphics amplify claims: show only authorised wording (e.g. EU 432/2012 vitamin C claim) in callouts; leave unauthorised benefits the creator says in the spoken captions only.

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

---

## Research log
- 2026-11-04: Renata KOLAGEN edit: depth/matte, glow-type, product-callout and sourcing lessons added.
- 2026-11-04: first version. Sources: Skaler hook-rate benchmarks, Segwise on Meta Andromeda, Evolut 2026 top beauty ads report. Lessons from the MicroInfusion (Gabor Nastja) edit.
