import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  white: "#FFFFFF",
  black: "#000000",
  green: "#A5CC3C",
  // Shades of the brand green, used only for depth (extrusion, shadows).
  greenDeep: "#6F8C1F",
  greenDark: "#26330A",
  ink: "#0A0D04",
  // Extended palette (approved 4 Nov 2026), taken from the packaging and the story's moods.
  forest: "#1F5A36", // sachet green, depth
  zest: "#D9E84A", // box lime, energy pops
  mint: "#E4F0D0", // soft light ground
  berry: "#E0457B", // box badge pink: offers and urgency only, sparingly
  midnight: "#10182B", // night and sleep scenes
  sunrise: "#F4D35E", // morning, the drink
  paper: "#EFECE6", // editorial ground
} as const;

/**
 * Mood sets: each scene picks one, and an ad moves between them
 * (e.g. night hook, product facts, morning result, offer CTA).
 * base = background, text = main type, accent = the one hero colour,
 * onAccent = type on the accent, pop = rare second accent.
 */
export type Mood = { base: string; text: string; accent: string; onAccent: string; pop: string };
export const MOODS = {
  classic: { base: C.black, text: C.white, accent: C.green, onAccent: C.black, pop: C.zest },
  night: { base: C.midnight, text: C.white, accent: C.green, onAccent: C.midnight, pop: C.zest },
  morning: { base: C.sunrise, text: C.forest, accent: C.forest, onAccent: C.sunrise, pop: C.white },
  product: { base: C.forest, text: C.white, accent: C.zest, onAccent: C.forest, pop: C.green },
  editorial: { base: C.paper, text: C.black, accent: C.green, onAccent: C.black, pop: C.forest },
  fresh: { base: C.mint, text: C.forest, accent: C.green, onAccent: C.forest, pop: C.zest },
  offer: { base: C.black, text: C.white, accent: C.berry, onAccent: C.white, pop: C.green },
} satisfies Record<string, Mood>;

/**
 * Display face. Set USE_PP_RIGHT_GOTHIC to true after placing your licensed
 * PP Right Gothic files in public/fonts (never commit them to the public repo).
 */
export const USE_PP_RIGHT_GOTHIC = false;

export const FONT_DISPLAY = USE_PP_RIGHT_GOTHIC ? "PP Right Gothic" : "Plex Condensed";
export const FONT_BODY = "Plex Sans";

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const face = (family: string, file: string, weight: string) =>
  [
    loadFont({ family, url: staticFile(`fonts/${file}-latin-${weight}-normal.woff2`), weight, unicodeRange: LATIN }),
    loadFont({ family, url: staticFile(`fonts/${file}-latin-ext-${weight}-normal.woff2`), weight, unicodeRange: LATIN_EXT }),
  ];

export const fontsReady = Promise.all([
  ...["500", "600", "700"].flatMap((w) => face("Plex Condensed", "ibm-plex-sans-condensed", w)),
  ...["400", "500", "600", "700"].flatMap((w) => face("Plex Sans", "ibm-plex-sans", w)),
  ...(USE_PP_RIGHT_GOTHIC
    ? [loadFont({ family: "PP Right Gothic", url: staticFile("fonts/PPRightGothic-Bold.woff2"), weight: "700" })]
    : []),
]);
