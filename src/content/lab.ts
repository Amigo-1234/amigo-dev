/*
 * AMIGODEV Lab. Every entry is a working piece: either something built for
 * this site (DEBUG.EXE) or real logic lifted out of a project's own code and
 * run here on made-up data. Nothing is a mock-up. Add an entry only when the
 * experiment works end to end.
 */
export type Experiment = {
  slug: string;
  code: string;
  href: string;
  title: string;
  kind: "Game" | "Tool" | "Simulation";
  summary: string;
  /** Where the logic comes from; omitted for pieces built for this site. */
  origin?: { project: string; slug: string; file: string; source: string };
  tech: string[];
  notes: string[];
  /** Engineering instruments are built for this site from first principles, not lifted from a project. */
  family?: "instrument";
  /** Simplifications an educational model makes; shown with a "not for design" stamp. */
  assumptions?: string[];
  references?: string[];
};

export const experiments: Experiment[] = [
  {
    slug: "debug-exe",
    code: "EXP-00",
    href: "/play",
    title: "DEBUG.EXE",
    kind: "Game",
    summary: "A small arcade game: patch the bugs before they reach production. Keyboard, mouse or touch.",
    tech: ["TypeScript", "Canvas 2D", "requestAnimationFrame"],
    notes: [
      "Movement is scaled by the real time between frames (capped per frame), so the game runs at the same speed at 60 Hz and 120 Hz. The loop stops entirely while paused.",
      "Pixel sprites are drawn once from text art to small offscreen canvases, then scaled up without smoothing.",
      "Your best score stays in this browser. Nothing is sent anywhere.",
    ],
  },
  {
    slug: "prayer-times",
    code: "EXP-01",
    href: "/lab/prayer-times",
    title: "Prayer times, calculated",
    kind: "Tool",
    summary: "Daily prayer times for Nigerian cities, calculated astronomically in the browser, with a live countdown to the next prayer.",
    origin: {
      project: "HAQSLAM",
      slug: "haqslam",
      file: "web/src/lib/prayer.ts",
      source: "https://github.com/Amigo-1234/haqqs/blob/main/web/src/lib/prayer.ts",
    },
    tech: ["adhan", "Intl.DateTimeFormat", "React"],
    notes: [
      "Times are calculated for the city's coordinates and shown in Africa/Lagos time, whatever time zone your device is in.",
      "Today and tomorrow are both calculated, so after Isha the countdown rolls over to tomorrow's Fajr instead of going negative.",
      "The Hijri date comes from the browser's Umm al-Qura calendar and is labelled approximate.",
    ],
  },
  {
    slug: "result-sheet",
    code: "EXP-02",
    href: "/lab/result-sheet",
    title: "Bilingual result sheet",
    kind: "Tool",
    summary: "Type scores into a school result sheet and watch totals, grades, remarks and class positions update, in English or Arabic.",
    origin: {
      project: "Markaz il Ginna",
      slug: "markaz-il-ginna",
      file: "src/domain/results.ts",
      source: "https://github.com/Amigo-1234/AMIGO1/blob/main/src/domain/results.ts",
    },
    tech: ["TypeScript", "Intl", "RTL layout"],
    notes: [
      "A blank score means “not entered”, never zero, so an unfinished sheet can't produce a false average or position.",
      "Ties share a position and the next is skipped (1, 2, 2, 4), the way schools rank.",
      "Switching to Arabic mirrors the whole layout right to left while scores keep Western digits, as the school asked.",
      "The class is made up. The real platform holds minors' records, so none of its data appears here.",
    ],
  },
  {
    slug: "match-clock",
    code: "EXP-03",
    href: "/lab/match-clock",
    title: "Match clock that can't drift",
    kind: "Simulation",
    summary: "The live-match clock from a campus sports platform, with stoppage time, six-a-side rules and red-card suspensions served in active play.",
    origin: {
      project: "EKSU Sports Hub",
      slug: "eksu-sports-hub",
      file: "src/lib/operator/clock.ts",
      source: "https://github.com/Amigo-1234/eksu-sports-hub/blob/main/src/lib/operator/clock.ts",
    },
    tech: ["TypeScript", "Pure functions", "React"],
    notes: [
      "Nothing ticks. The minute is recomputed from the period's start time and its pauses, so every screen that knows the same timestamps shows the same minute.",
      "A 7:30 half ends in the 8th minute, so added time is counted from 8:00, not 7:30.",
      "Under six-a-side rules there is no added time, and a red card is a 60-second suspension of active play: pauses and half-time don't count towards it.",
      "The simulation speed only changes how fast the pretend wall clock runs. The match clock code is the same either way.",
    ],
  },
  {
    slug: "gear-train",
    code: "EXP-04",
    family: "instrument",
    href: "/lab/gear-train",
    title: "Gear train",
    kind: "Simulation",
    summary:
      "Spur gears drawn from true involute geometry. Change the tooth counts and watch speed, direction and torque work through the train, then drag any gear to turn it by hand.",
    tech: ["TypeScript", "SVG", "Involute geometry"],
    notes: [
      "The drawing and the numbers come from the same functions. Each gear sits at its true centre distance and is turned by the mesh relation, so the teeth you see meshing are the teeth that were calculated.",
      "Rotation is written straight to the drawing, so nothing re-renders while it turns. It only runs while it is on screen, and starts paused if you prefer reduced motion.",
      "The maths is checked against independent methods: hand-worked examples, the unwound-string definition of the involute, a simulation that turns each pair through a full pitch to prove the teeth touch without overlapping, and a direct construction of the contact ratio.",
      "The settings are kept in the address bar, so a train can be shared as a link.",
    ],
    assumptions: [
      "Standard 20° full-depth involute teeth (ISO 53 basic rack): addendum 1·m, dedendum 1.25·m, no profile shift and no backlash.",
      "Rigid teeth and shafts. Efficiency is a fixed fraction lost at each mesh, not a model of friction, load or speed.",
      "Below the base circle the tooth flank is drawn radial. Real teeth have a trochoidal root fillet, and are undercut when cut with fewer than about 17 teeth.",
      "A simple train only: one gear per shaft, external meshes. Compound and planetary trains are not modelled.",
    ],
    references: [
      "ISO 53:1998, Cylindrical gears for general and heavy engineering — Standard basic rack tooth profile",
      "ISO 54:1996, Cylindrical gears for general engineering and for heavy engineering — Modules",
      "R. G. Budynas and J. K. Nisbett, Shigley's Mechanical Engineering Design, chapter 13: Gears — General",
    ],
  },
];

export function getExperiment(slug: string) {
  return experiments.find((e) => e.slug === slug);
}
