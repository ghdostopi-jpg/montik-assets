// BF Video 01 — on-screen copy per language. SL = final client script (locked, 9 Nov 12:46).
// IT / HR = localisations of that script (same offer: up to −60 %, gifts over 100/150/200 € = 1/2/3, customer chooses,
// −25 % voucher with EVERY purchase for the NEXT purchase, no minimum, until 30.11.). Sizes are fitted to measured
// font widths so every line stays inside the inner text box (X 140–905).
import React from "react";

export type Lang = "sl" | "it" | "hr";
export type CtaLine = { t: string; gold?: boolean };
export type Copy = {
  tape: string;
  je: string; pop: string; free: string; freeSize: number;
  t1: string; t2: string; tSize: number;
  tierPrefix: string; tierWords: [string, string, string]; tierK: number;
  c1: string; c2: string; a1: string; a2: string;
  vh: string; v1: string; v2: string; v3: string; v3Size: number;
  le: string; rem: string;
  cta: CtaLine[]; ctaSize: number;
};

export const COPY: Record<Lang, Copy> = {
  sl: {
    tape: "BLACK FRIDAY JE TUKAJ! • POPUSTI DO KAR -60% • ",
    je: "JE TUKAJ!", pop: "POPUSTI DO KAR", free: "+ BREZPLAČNI IZDELKI!", freeSize: 72,
    t1: "VEČ KUPITE,", t2: "VEČ DARIL DOBITE!", tSize: 88,
    tierPrefix: "NAD", tierWords: ["DARILO", "DARILI", "DARILA"], tierK: 1,
    c1: "DARILA SI", c2: "IZBERETE SAMI!", a1: "Vi izberete,", a2: "mi podarimo.",
    vh: "IN TO ŠE NI VSE!", v1: "Ob nakupu", v2: "prejmete še kupon", v3: "ZA NASLEDNJI NAKUP!", v3Size: 64,
    le: "LE DO", rem: "POPUSTI DO KAR -60%",
    cta: [{ t: "IZBERITE SVOJE IZDELKE" }, { t: "IN PREVZEMITE DARILA!", gold: true }], ctaSize: 71,
  },
  it: {
    tape: "BLACK FRIDAY È QUI! • SCONTI FINO AL -60% • ",
    je: "È QUI!", pop: "SCONTI FINO AL", free: "+ PRODOTTI GRATIS!", freeSize: 72,
    t1: "PIÙ ACQUISTI,", t2: "PIÙ REGALI RICEVI!", tSize: 84,
    tierPrefix: "OLTRE", tierWords: ["REGALO", "REGALI", "REGALI"], tierK: 0.93,
    c1: "I REGALI", c2: "LI SCEGLI TU!", a1: "Tu scegli,", a2: "noi regaliamo.",
    vh: "E NON È TUTTO!", v1: "Con ogni acquisto", v2: "ricevi anche un buono", v3: "SUL PROSSIMO ACQUISTO!", v3Size: 58,
    le: "SOLO FINO AL", rem: "SCONTI FINO AL -60%",
    cta: [{ t: "SCEGLI I TUOI PRODOTTI" }, { t: "E RICEVI I TUOI REGALI!", gold: true }], ctaSize: 68,
  },
  hr: {
    tape: "BLACK FRIDAY JE STIGAO! • POPUSTI DO ČAK -60% • ",
    je: "JE STIGAO!", pop: "POPUSTI DO ČAK", free: "+ BESPLATNI PROIZVODI!", freeSize: 66,
    t1: "ŠTO VIŠE KUPITE,", t2: "TO VIŠE POKLONA!", tSize: 84,
    tierPrefix: "IZNAD", tierWords: ["POKLON", "POKLONA", "POKLONA"], tierK: 0.88,
    c1: "POKLONE", c2: "BIRATE SAMI!", a1: "Vi birate,", a2: "mi poklanjamo.",
    vh: "I TO NIJE SVE!", v1: "Uz kupnju", v2: "dobivate i kupon", v3: "ZA SLJEDEĆU KUPNJU!", v3Size: 64,
    le: "SAMO DO", rem: "POPUSTI DO ČAK -60%",
    cta: [{ t: "ODABERITE SVOJE" }, { t: "PROIZVODE" }, { t: "I PREUZMITE POKLONE!", gold: true }], ctaSize: 68,
  },
};

export const CopyCtx = React.createContext<Copy>(COPY.sl);
export const useCopy = () => React.useContext(CopyCtx);
