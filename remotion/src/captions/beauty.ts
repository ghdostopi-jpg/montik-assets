import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * MicroInfusion beauty palette, sampled from the actual footage and packaging:
 * the black box, its champagne serif type and rose-gold gradient, the dusty
 * pink robe, warm skin and the amber serum. Coral and peach are energy accents.
 */
export const B = {
  ink: "#121014", // box black
  cream: "#F6EFE4", // warm white for type
  champagne: "#E4D4B2", // box type
  blush: "#EBB8B4", // robe light
  rose: "#C9898A", // robe shadow, dusty rose
  peach: "#F7C4A5",
  coral: "#EC6E58",
  amber: "#C98B3B", // serum
  roseGold: "linear-gradient(100deg, #F6D2B8 0%, #D9987A 38%, #B9735C 62%, #F0C6A8 100%)",
} as const;

/** Per-moment colour moods for one cohesive campaign. */
export const BEAUTY_MOODS = {
  hook: { text: B.cream, accent: B.coral, plate: B.ink },
  problem: { text: B.cream, accent: B.blush, plate: B.ink },
  solution: { text: B.cream, accent: B.peach, plate: B.cream },
  product: { text: B.champagne, accent: B.roseGold, plate: B.ink },
  benefits: { text: B.cream, accent: B.peach, plate: B.ink },
  cta: { text: B.ink, accent: B.coral, plate: B.cream },
} as const;

export const SERIF = "Plex Serif";

const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

export const serifReady = Promise.all(
  ["300", "400", "500"].flatMap((w) =>
    (["normal", "italic"] as const).flatMap((st) => [
      loadFont({ family: SERIF, url: staticFile(`fonts/ibm-plex-serif-latin-${w}-${st}.woff2`), weight: w, style: st, unicodeRange: LATIN }),
      loadFont({ family: SERIF, url: staticFile(`fonts/ibm-plex-serif-latin-ext-${w}-${st}.woff2`), weight: w, style: st, unicodeRange: LATIN_EXT }),
    ]),
  ),
);
