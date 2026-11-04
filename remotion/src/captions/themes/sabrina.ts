import { FONT_BODY, FONT_DISPLAY } from "../../lib/brand";
import { SERIF } from "../beauty";
import type { CaptionTheme } from "../theme";

/**
 * MICROINFUSION SABRINA VIDOVIC: "Rose Atelier".
 * Sampled from the footage: black box with champagne serif type and a
 * rose-gold gradient, the dusty pink robe, warm skin, amber serum, grey wall.
 * Core colours: coral (energy), blush (restraint), peach (softness) and the
 * rose-gold gradient (product); cream and box-black as neutrals.
 * Typography: condensed caps for impact, tracked sans for calm, light serif
 * italic for luxury moments.
 * Motion: medium energy, soft springs, focus pulls; no hard glitches.
 */
export const SABRINA_THEME: CaptionTheme = {
  name: "Rose Atelier",
  fonts: {
    display: { family: FONT_DISPLAY, weight: 700, uppercase: true, tracking: "-0.02em" },
    body: { family: FONT_BODY, weight: 600 },
    serif: { family: SERIF, weight: 300, italic: true },
  },
  colors: {
    text: "#F6EFE4",
    plate: "rgba(18,16,20,0.92)",
    onPlate: "#F6EFE4",
    onAccent: "#121014",
    shadow: "0 2px 18px rgba(18,16,20,0.55), 0 1px 3px rgba(18,16,20,0.5)",
    accents: { coral: "#EC6E58", blush: "#EBB8B4", peach: "#F7C4A5", rose: "#C9898A" },
  },
  gradient: "linear-gradient(100deg, #F6D2B8 0%, #D9987A 38%, #B9735C 62%, #F0C6A8 100%)",
  lead: { hook: "coral", problem: "blush", solution: "peach", product: "peach", benefits: "peach", ease: "coral", cta: "coral" },
  motion: { energy: 0.6, radius: 6 },
};
