import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import type { CaptionTheme } from "../theme";

/**
 * TIA MAMA RENATA KOLAGEN: "Coral Luminance".
 * Sampled from the footage: coral/pink/orange print dress, amber collagen drink,
 * warm evening sun, dark hedge. Packaging green stays in the footage only.
 * Core colours: Premium Coral (luminous hero words), Soft Rose (secondary),
 * Warm Ivory (supporting type), Deep Plum (shadows, panels), Champagne Gold
 * (hairlines and rings only).
 * Type: Inter Tight Black (heavy grotesk hero words, OFL), DM Sans SemiBold
 * (spoken captions, OFL). Satoshi / Clash Grotesk were not reachable here.
 * Motion: calm-medium energy, masked rises, glow blooms, no bounce.
 */
export const HERO = "Inter Tight";
export const BODY = "DM Sans";

export const K = {
  coral: "#FF866D",
  rose: "#F6A9B8",
  ivory: "#FFF0E6",
  plum: "#382730",
  gold: "#D7A875",
  peachLight: "#FFE1D3",
} as const;

export const RENATA_THEME: CaptionTheme = {
  name: "Coral Luminance",
  fonts: {
    display: { family: HERO, weight: 900, uppercase: true, tracking: "-0.035em" },
    body: { family: BODY, weight: 600 },
    serif: { family: BODY, weight: 500, italic: false },
  },
  colors: {
    text: K.ivory,
    plate: "rgba(56,39,48,0.78)",
    onPlate: K.ivory,
    onAccent: K.plum,
    shadow: "0 2px 16px rgba(56,39,48,0.65), 0 1px 3px rgba(56,39,48,0.7)",
    accents: { coral: K.coral, rose: K.rose, gold: K.gold },
  },
  gradient: `linear-gradient(180deg, ${K.peachLight} 0%, #FFB49C 42%, ${K.coral} 100%)`,
  lead: { hook: "coral", problem: "rose", solution: "coral", product: "coral", benefits: "rose", ease: "coral", cta: "coral" },
  motion: { energy: 0.45, radius: 28 },
};

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
const face = (family: string, file: string, weight: string) => [
  loadFont({ family, url: staticFile(`fonts/${file}-latin-${weight}-normal.woff2`), weight, unicodeRange: LATIN, format: "woff2" }),
  loadFont({ family, url: staticFile(`fonts/${file}-latin-ext-${weight}-normal.woff2`), weight, unicodeRange: LATIN_EXT, format: "woff2" }),
];

export const renataFonts = Promise.all([
  ...["800", "900"].flatMap((w) => face(HERO, "inter-tight", w)),
  ...["500", "600"].flatMap((w) => face(BODY, "dm-sans", w)),
]);
