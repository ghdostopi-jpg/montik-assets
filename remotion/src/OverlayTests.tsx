import React from "react";
import { AbsoluteFill } from "remotion";
import { CompareTable, Checklist, Countdown, DayTimeline, ProductCard } from "./components/overlays/Proof";
import { CommentReply, HookBanner, NotificationPop, ReviewCard } from "./components/overlays/Social";
import { PhotoBg } from "./lib/Layers";

const On: React.FC<{ children: React.ReactNode; src?: string }> = ({ children, src = "bg/talk.jpg" }) => (
  <AbsoluteFill>
    <PhotoBg src={src} from={1.04} to={1} dim={0.15} />
    {children}
  </AbsoluteFill>
);

export const OVERLAYS: Record<string, { d: number; C: React.FC }> = {
  HookBanner: { d: 90, C: () => <On><HookBanner lines={[{ text: "Spet budna ob enih?" }, { text: "To je pomagalo meni", tone: "green" }]} /></On> },
  CommentReply: { d: 90, C: () => <On><CommentReply user="@maja.k" text="Kateri magnezij pa ti piješ zvečer?" /></On> },
  NotificationPop: { d: 90, C: () => <On><NotificationPop app="Biostile" title="Naročilo je na poti" body="Pure Magnesium 5, 3 škatle" /></On> },
  ReviewCard: { d: 100, C: () => <On src="bg/window.jpg"><ReviewCard quote={["Okus je res dober", "in ni grenek."]} name="Primer ocene" /></On> },
  Checklist: { d: 100, C: () => <On src="bg/pour.jpg"><Checklist title="Zakaj ravno ta" items={["Pet oblik magnezija", "Okus jabolko ali meta", "Ena vrečka zvečer"]} /></On> },
  CompareTable: { d: 100, C: () => <On src="bg/pour.jpg"><CompareTable us="Biostile" them="Klasičen" rows={["Pet oblik", "Ni grenek", "Ena vrečka"]} /></On> },
  DayTimeline: { d: 100, C: () => <On src="bg/terrace.jpg"><DayTimeline steps={[{ day: "Dan 1", label: "Prva vrečka" }, { day: "Dan 14", label: "Rutina" }, { day: "Dan 90", label: "3 škatle" }]} /></On> },
  Countdown: { d: 90, C: () => <On src="bg/box-mirror.jpg"><Countdown label="Akcija se konča čez" seconds={2 * 3600 + 59 * 60 + 59} /></On> },
  ProductCard: { d: 90, C: () => <On><ProductCard src="bg/box-open.jpg" caption="Pure Magnesium 5" badge="2+1 gratis" /></On> },
};
