/** [word, startSec, endSec] in the clip's own time (Montik transcript shape). */
export type W = [string, number, number];

export const clean = (s: string) => s.toLowerCase().replace(/[.,!?:;"„“”]/g, "");

/** Group words into caption pages: break on punctuation or after `max` words. */
export const pages = (words: W[], max = 3) => {
  const out: W[][] = [];
  let cur: W[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= max || /[.,!?:;]$/.test(w[0])) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** The page showing at time t (seconds): the last page that has started. */
export const pageAt = (ps: W[][], t: number) => {
  let i = 0;
  for (let k = 0; k < ps.length; k++) if (t >= ps[k][0][1] - 0.06) i = k;
  return i;
};

/** True while the word is being spoken (held until the next word starts). */
export const isActive = (page: W[], i: number, t: number) => t >= page[i][1] && t < (page[i + 1]?.[1] ?? page[i][2] + 0.3);

/** Words between two times. */
export const between = (words: W[], from: number, to: number) => words.filter(([, s]) => s >= from && s < to);

/** Is this word a number or percentage (gets numeric emphasis)? */
export const isNumber = (s: string) => /\d/.test(s);
