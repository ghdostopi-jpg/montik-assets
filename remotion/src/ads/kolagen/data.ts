/**
 * Timeline of the Montik edit "Tia mama Renata KOLAGEN — EDIT v1" (seconds).
 * Main clip VIDEO.mov starts at source 0.40 s, so timeline = source - 0.40.
 * Word times: Montik transcript (Slovenian), spelling checked against the audio script.
 */
export const FPS = 30;
export const TOTAL = 28.967;
export const TOTAL_FRAMES = Math.ceil(TOTAL * FPS);

/** First frame of the second shot (hands + box). The hook shot is frames [0, HOOK_CUT). */
export const HOOK_CUT = 64;

/** [word, start, end?, flag] flag: "k" = keyword (stays coral), "n" = number (big glow). */
export type CW = [string, number, number?, ("k" | "n")?];
export type Phrase = { a: number; b: number; words: CW[] };

export const PHRASES: Phrase[] = [
  { a: 2.24, b: 3.33, words: [["Če", 2.33], ["me", 2.57], ["kdo", 2.69], ["vpraša,", 2.93, 3.29]] },
  { a: 3.33, b: 4.5, words: [["kaj", 3.35], ["je", 3.53], ["postalo", 3.65], ["del", 4.01], ["moje", 4.25, 4.45]] },
  { a: 4.5, b: 6.08, words: [["vsakodnevne", 4.55, 5.09, "k"], ["rutine,", 5.21, 5.45, "k"], ["je", 5.51], ["odgovor:", 5.63, 5.93]] },
  // 6.08-6.85: product title "KOLAGEN" carries the spoken words "ta kolagen."
  { a: 6.86, b: 8.72, words: [["Pri", 6.95], ["56", 7.49, 7.73, "n"], ["mi", 8.09], ["je", 8.15], ["pomembno,", 8.33, 8.69]] },
  { a: 8.72, b: 9.64, words: [["da", 8.75], ["skrbim", 8.99], ["zase", 9.41, 9.59, "k"]] },
  // 9.64-10.85: hero "tudi OD ZNOTRAJ."
  { a: 10.85, b: 11.9, words: [["da", 10.91], ["podprem", 11.21], ["svoje", 11.63, 11.85]] },
  { a: 11.9, b: 13.24, words: [["kosti", 11.99, 12.23, "k"], ["in", 12.35], ["hrustanec,", 12.53, 13.07, "k"]] },
  { a: 13.24, b: 14.42, words: [["hkrati", 13.31], ["pa", 13.67], ["naredim", 13.85], ["nekaj", 14.21, 14.39]] },
  { a: 14.42, b: 15.72, words: [["dobrega", 14.45, 14.75, "k"], ["še", 14.87], ["za", 15.05], ["kožo,", 15.17, 15.47]] },
  { a: 15.72, b: 17.5, words: [["lase", 15.83], ["in", 16.19], ["nohte.", 16.79, 17.15]] },
  { a: 17.8, b: 19.04, words: [["Ker", 17.87], ["je", 18.05], ["priprava", 18.23], ["hitra", 18.71, 19.01, "k"]] },
  { a: 19.04, b: 20.2, words: [["in", 19.07], ["okus", 19.31], ["prijeten,", 19.61, 19.97, "k"]] },
  { a: 20.2, b: 21.68, words: [["ga", 20.27], ["brez", 20.45, 20.63, "k"], ["težav", 20.81, 21.05, "k"], ["vključim", 21.23, 21.65]] },
  { a: 21.68, b: 22.5, words: [["v", 21.71], ["svoj", 21.83], ["dan.", 22.13, 22.3]] },
  { a: 22.5, b: 23.82, words: [["To", 22.55], ["je", 22.67], ["ena", 22.85], ["tistih", 23.09], ["navad,", 23.51, 23.75, "k"]] },
  { a: 23.82, b: 24.42, words: [["pri", 23.87], ["katerih", 23.99, 24.3]] },
  // 24.42-25.95: hero "res VZTRAJAM."
];

/** Footage stills for the preview composition only (never committed: client footage). */
export const STILLS: Array<[number, string]> = [
  [0, "t01.6"], [2.13, "t04.0"], [6.0, "t07.6"], [9.2, "t10.2"], [11.5, "t12.6"], [14.15, "t15.2"], [16.25, "t12.6"],
  [18.35, "t19.2"], [24.9, "t25.4"],
];
