# BIOSTILE motion library (Remotion)

Original motion graphics for 1080x1920 vertical ads. Brand: #FFFFFF, #000000, #A5CC3C. Type: IBM Plex Sans / Plex Sans Condensed (SIL OFL), or PP Right Gothic (set `USE_PP_RIGHT_GOTHIC` in `src/lib/brand.ts`, never commit the licensed font files).

| Component | File | What it does |
|---|---|---|
| Stomp | `src/components/Stomp.tsx` | Huge words slam in one at a time: squash and stretch, camera shake, shockwaves, impact flash, motion blur |
| MaskReveal | `src/components/MaskReveal.tsx` | Block wipes in, retracts, type rises out of its mask; accent line inverted with underline |
| CharCascade | `src/components/CharCascade.tsx` | Per-character 3D flip cascade, split-halves lock with seam flash, tracking collapse |
| Extrude3D | `src/components/Extrude3D.tsx` | Layered CSS-3D extrusion, glyphs fly from depth, swing to hero angle, light sweep, stars |
| WarpMorph | `src/components/WarpMorph.tsx` | Real glyph outlines (opentype.js) warped by a sine field, gooey alpha-threshold morph between words |
| UGCCaptions | `src/components/UGCCaptions.tsx` | Word-by-word captions from transcript timings, springing green plate, keywords, hook banner |
| Callouts | `src/components/Callouts.tsx` | Hand-drawn loop, curved arrow, masked label, spinning starburst sticker, tracks camera push |
| EditorialHook | `src/components/EditorialHook.tsx` | Magazine layout: rules, duotone photo window, odometer clock, masked headline, marker stroke |
| CTA | `src/components/CTA.tsx` | Gift drop and lid pop with confetti, discount ring counter, strike-through, button sweep and tap |
| Transitions | `src/components/Transitions.tsx` | whipPan (directional blur), zoomPunch, glitch (RGB split + tearing), shapeWipe circle / bars |

Run: `npm i`, then `npx remotion studio`. Render: `npx remotion render Showcase out/showcase.mp4 --browser-executable=<chrome>`.
Live preview page: `npx esbuild web/entry.tsx --bundle --minify --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=web/app.js`, serve `web/` with `public/`.

Licences: React, @remotion/fonts, @remotion/motion-blur, @remotion/paths, @remotion/noise and opentype.js are MIT; IBM Plex is SIL OFL 1.1; remotion, @remotion/transitions and the renderer use the Remotion License (free for individuals and companies up to 3 people). Techniques were studied from Remotion's examples, which have no licence; no code was copied from them.
