import React, { createContext, useContext } from "react";

/** Story moments; each one leads with a different colour of the same palette. */
export type Purpose = "hook" | "problem" | "solution" | "product" | "benefits" | "ease" | "cta";

/**
 * A project's caption identity. The components are generic; everything that
 * makes an ad look like itself lives here. Make a new theme for every edit.
 */
export type CaptionTheme = {
  name: string;
  fonts: {
    display: { family: string; weight: number; uppercase: boolean; tracking: string };
    body: { family: string; weight: number };
    serif: { family: string; weight: number; italic: boolean };
  };
  colors: {
    text: string; // main caption type
    plate: string; // dark box / tile colour
    onPlate: string; // type on plates
    onAccent: string; // type on an accent fill
    shadow: string; // CSS text-shadow for type on footage
    /** The 2-4 core accents; scenes choose which one leads. */
    accents: Record<string, string>;
  };
  /** Gradient used for numbers, product names and luxury keywords. */
  gradient: string;
  /** Which accent leads each moment (a key of colors.accents). */
  lead: Record<Purpose, string>;
  motion: {
    /** 0 = calm, 1 = energetic: scales overshoot, slam distance and tilt. */
    energy: number;
    radius: number; // corner radius of plates, px
  };
};

const Ctx = createContext<CaptionTheme | null>(null);
export const CaptionThemeProvider: React.FC<{ theme: CaptionTheme; children: React.ReactNode }> = ({ theme, children }) => (
  <Ctx.Provider value={theme}>{children}</Ctx.Provider>
);
export const useCaptionTheme = () => {
  const t = useContext(Ctx);
  if (!t) throw new Error("Wrap captions in <CaptionThemeProvider theme={...}>");
  return t;
};
/** The accent colour leading a given moment. */
export const leadColor = (t: CaptionTheme, p: Purpose) => t.colors.accents[t.lead[p]] ?? Object.values(t.colors.accents)[0];
