// BF Video 01 — on-screen copy per language. SL = final client script (locked, 9 Nov 12:46).
// IT / HR = localisations of that script (same offer: up to −60 %, gifts over 100/150/200 € = 1/2/3, customer chooses,
// −25 % voucher with EVERY purchase for the NEXT purchase, no minimum, until 30.11.). Sizes are fitted to measured
// font widths so every line stays inside the inner text box (X 140–905).
import React from "react";

export type Lang = "sl" | "it" | "hr" | "sk" | "cz" | "hu";
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
  // SK / CZ / HU (client-approved scripts, Google Sheet VIDEO 01 rows 61-95): optional overrides, SL/IT/HR untouched
  noEmoji?: boolean;
  hookTop?: string; hookTopSize?: number; jeSize?: number; popSize?: number;
  popBig?: string; popBigSize?: number; popTail?: string; popTailSize?: number;
  amounts?: [string, string, string]; hl?: [number, number][];
  c1Size?: number; c2Size?: number; a1Size?: number; a2Size?: number;
  vhSize?: number; vSize?: number; vBig?: string; vBigSize?: number; v3Lines?: string[];
  leSize?: number; date?: string; dateSize?: number; remSize?: number;
  dur?: [number, number, number, number, number]; // scene durations (VO-led), default SL timing
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
  sk: {
    tape: "BLACK FRIDAY JE TU! • ZĽAVY AŽ DO 60 %! • ",
    je: "JE TU!", pop: "ZĽAVY AŽ DO", free: "PRODUKTY ZADARMO!", freeSize: 72,
    t1: "ČÍM VIAC NAKÚPITE,", t2: "TÝM VIAC DARČEKOV DOSTANETE!", tSize: 53,
    tierPrefix: "", tierWords: ["DARČEK", "DARČEKY", "DARČEKY"], tierK: 0.705,
    c1: "DARČEKY SI", c2: "VYBERIETE SAMI!", a1: "Vy si vyberiete,", a2: "my vás obdarujeme.",
    vh: "A TO EŠTE NIE JE VŠETKO!", v1: "K NÁKUPU NAVYŠE", v2: "ZÍSKATE KUPÓN NA", v3: "ZĽAVU PRI ĎALŠOM NÁKUPE!", v3Size: 57,
    le: "LEN DO", rem: "ZĽAVY AŽ DO 60 %!",
    cta: [{"t": "VYBERTE SI OBĽÚBENÉ PRODUKTY"}, {"t": "A ZÍSKAJTE SVOJE DARČEKY!", "gold": true}], ctaSize: 53,
    noEmoji: true, hookTop: "BLACK FRIDAY", hookTopSize: 100, jeSize: 92, popSize: 54,
    popBig: "60 %!", popBigSize: 291, popTail: "", popTailSize: 0,
    amounts: ["PRI NÁKUPE NAD 100 €", "PRI NÁKUPE NAD 150 €", "PRI NÁKUPE NAD 200 €"], hl: [[3.35, 5.75], [5.75, 8.71], [8.71, 11.1]],
    c1Size: 90, c2Size: 104, a1Size: 88, a2Size: 86,
    vhSize: 71, vSize: 60, vBig: "25 %", vBigSize: 220, v3Lines: ["ZĽAVU PRI ĎALŠOM NÁKUPE!"],
    leSize: 76, date: "30. 11.!", dateSize: 212, remSize: 54,
    dur: [5.5, 11.5, 6.0, 7.0, 7.0],
  },
  cz: {
    tape: "BLACK FRIDAY JE TADY! • SLEVY AŽ 60 %! • ",
    je: "JE TADY!", pop: "SLEVY AŽ", free: "PRODUKTY ZDARMA!", freeSize: 72,
    t1: "ČÍM VÍCE NAKOUPÍTE,", t2: "TÍM VÍCE DÁRKŮ DOSTANETE!", tSize: 62,
    tierPrefix: "", tierWords: ["DÁREK", "DÁRKY", "DÁRKY"], tierK: 0.681,
    c1: "DÁRKY SI", c2: "VYBERETE SAMI!", a1: "Vy si vyberete,", a2: "my vás obdarujeme.",
    vh: "A TO JEŠTĚ NENÍ VŠECHNO!", v1: "K NÁKUPU NAVÍC", v2: "ZÍSKÁTE KUPÓN NA", v3: "SLEVU PŘI PŘÍŠTÍM NÁKUPU!", v3Size: 56,
    le: "POUZE DO", rem: "SLEVY AŽ 60 %!",
    cta: [{"t": "VYBERTE SI OBLÍBENÉ PRODUKTY"}, {"t": "A ZÍSKEJTE SVÉ DÁRKY!", "gold": true}], ctaSize: 54,
    noEmoji: true, hookTop: "BLACK FRIDAY", hookTopSize: 100, jeSize: 92, popSize: 54,
    popBig: "60 %!", popBigSize: 291, popTail: "", popTailSize: 0,
    amounts: ["PŘI NÁKUPU NAD 2 500 Kč", "PŘI NÁKUPU NAD 3 700 Kč", "PŘI NÁKUPU NAD 4 900 Kč"], hl: [[3.36, 6.6], [6.6, 9.92], [9.92, 13.6]],
    c1Size: 90, c2Size: 104, a1Size: 88, a2Size: 86,
    vhSize: 68, vSize: 60, vBig: "25%", vBigSize: 220, v3Lines: ["SLEVU PŘI PŘÍŠTÍM NÁKUPU!"],
    leSize: 76, date: "30. 11.!", dateSize: 212, remSize: 54,
    dur: [5.5, 14.0, 6.0, 7.5, 7.0],
  },
  hu: {
    tape: "ITT A BLACK FRIDAY! • AKÁR 60%-OS KEDVEZMÉNYEK! • ",
    je: "BLACK FRIDAY!", pop: "AKÁR", free: "INGYENES TERMÉKEK!", freeSize: 72,
    t1: "MINÉL TÖBBET VÁSÁROLSZ,", t2: "ANNÁL TÖBB AJÁNDÉK VÁR!", tSize: 65,
    tierPrefix: "", tierWords: ["AJÁNDÉK", "AJÁNDÉK", "AJÁNDÉK"], tierK: 1.0,
    c1: "AZ AJÁNDÉKAIDAT", c2: "TE VÁLASZTOD KI!", a1: "Te választasz,", a2: "mi megajándékozunk.",
    vh: "ÉS EZ MÉG NEM MINDEN!", v1: "VÁSÁRLÁSOD MELLÉ", v2: "", v3: "KEDVEZMÉNYKUPONT IS KAPSZ A KÖVETKEZŐ VÁSÁRLÁSODHOZ!", v3Size: 51,
    le: "CSAK", rem: "AKÁR 60%-OS KEDVEZMÉNYEK!",
    cta: [{"t": "VÁLASZD KI KEDVENC TERMÉKEIDET,"}, {"t": "ÉS SZEREZD MEG AZ AJÁNDÉKAIDAT!", "gold": true}], ctaSize: 50,
    noEmoji: true, hookTop: "ITT A", hookTopSize: 100, jeSize: 92, popSize: 54,
    popBig: "60%-OS", popBigSize: 215, popTail: "KEDVEZMÉNYEK!", popTailSize: 66,
    amounts: ["36 500 Ft", "54 500 Ft", "72 500 Ft"], hl: [[3.12, 5.84], [5.84, 8.8], [8.8, 11.6]],
    c1Size: 90, c2Size: 102, a1Size: 88, a2Size: 78,
    vhSize: 75, vSize: 60, vBig: "25%-OS", vBigSize: 202, v3Lines: ["KEDVEZMÉNYKUPONT IS KAPSZ", "A KÖVETKEZŐ VÁSÁRLÁSODHOZ!"],
    leSize: 76, date: "NOVEMBER 30-IG!", dateSize: 105, remSize: 50,
    dur: [5.5, 12.0, 6.0, 7.0, 7.0],
  },
};

export const CopyCtx = React.createContext<Copy>(COPY.sl);
export const useCopy = () => React.useContext(CopyCtx);
