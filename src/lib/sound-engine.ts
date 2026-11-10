/*
 * AMIGODEV's sound, synthesised in the browser with the Web Audio API: an
 * original score and every effect are generated here, so there are no audio
 * files to download and nothing to license.
 *
 * Loaded only once a visitor turns sound on (see sound.ts). Nothing here runs
 * before then, and nothing plays without a click or key press first, as
 * browsers require.
 *
 * The score: "Issue #01", D minor, 100 bpm, 32 bars (about 77 seconds) that
 * loop. Two moods alternate every eight bars:
 *   A  suspense: a filtered pad, a pulsing bass and a clockwork tick
 *   B  action:   drums, brass stabs and a delayed arpeggio over the same bass
 * The chords run i–VI–iv–V (Dm, B♭, Gm, A): the A major chord is the lift
 * that makes it feel heroic. A noise riser leads into each action section.
 * Everything sits low in the mix; it is a score, not a song.
 */

type Sfx = "click" | "tick" | "gear" | "whoosh" | "panel" | "spool" | "clank" | "open" | "close" | "thwip";

const BPM = 100;
const STEP = 60 / BPM / 4; // a sixteenth note, in seconds
const BARS = 32;
const LOOKAHEAD = 0.12; // schedule this far ahead (s)
const TICK_MS = 25;

// MIDI note numbers. Chords are root, third, fifth (+ the root an octave up).
const CHORDS = [
  [50, 53, 57], // Dm
  [46, 50, 53], // B♭
  [43, 46, 50], // Gm
  [45, 49, 52], // A (major: the leading tone C♯ gives the lift)
];
const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let sfxBus: GainNode;
let delayIn: GainNode;
let noise: AudioBuffer;
let timer = 0;
let step = 0;
let nextTime = 0;
let playing = false;
const lastPlayed = new Map<Sfx, number>();

declare global {
  interface Window {
    /** An AudioContext the entry screen unlocked inside a click, before React loaded. */
    __amigoAudio?: AudioContext;
  }
}

function build() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = window.__amigoAudio ?? new AC();
  window.__amigoAudio = ctx;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 4;
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(comp).connect(ctx.destination);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0.55;
  musicBus.connect(master);
  sfxBus = ctx.createGain();
  sfxBus.gain.value = 0.7;
  sfxBus.connect(master);

  // A dotted-eighth echo for the arpeggio: the "futuristic" shimmer.
  delayIn = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.32;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  delayIn.connect(delay).connect(tone).connect(fb).connect(delay);
  tone.connect(musicBus);

  const len = ctx.sampleRate * 1;
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

/* ---------------------------------------------------------------- */
/* Instruments                                                       */
/* ---------------------------------------------------------------- */

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function noiseHit(t: number, dest: AudioNode, type: BiquadFilterType, freq: number, q: number, peak: number, decay: number, rate = 1) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = rate;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  env(g, t, peak, 0.002, decay);
  src.connect(f).connect(g).connect(dest);
  src.start(t, Math.random() * 0.5);
  src.stop(t + decay + 0.05);
}

function tone(t: number, dest: AudioNode, type: OscillatorType, freq: number, peak: number, attack: number, decay: number, detune = 0) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  const g = c.createGain();
  env(g, t, peak, attack, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

function kick(t: number) {
  const c = ctx!;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
  const g = c.createGain();
  env(g, t, 0.9, 0.003, 0.3);
  o.connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + 0.35);
}

function snare(t: number) {
  noiseHit(t, musicBus, "bandpass", 1900, 0.8, 0.45, 0.16);
  tone(t, musicBus, "triangle", 185, 0.25, 0.002, 0.09);
}

/** The clockwork: a tiny metallic tick, like an escapement. */
function tick(t: number, accent: boolean) {
  noiseHit(t, musicBus, "bandpass", accent ? 3600 : 5200, 9, accent ? 0.13 : 0.07, 0.03);
}

function hat(t: number, open: boolean) {
  noiseHit(t, musicBus, "highpass", 8000, 0.7, open ? 0.08 : 0.05, open ? 0.14 : 0.035);
}

function bass(t: number, midi: number, len: number) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = hz(midi - 12);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 6;
  f.frequency.setValueAtTime(1100, t);
  f.frequency.exponentialRampToValueAtTime(220, t + len);
  const g = c.createGain();
  env(g, t, 0.32, 0.004, len);
  o.connect(f).connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + len + 0.05);
}

/** The pad: three slightly detuned saws per note, dark, slow to open. */
function pad(t: number, chord: number[], len: number) {
  const c = ctx!;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 1;
  f.frequency.setValueAtTime(420, t);
  f.frequency.linearRampToValueAtTime(1100, t + len * 0.6);
  f.frequency.linearRampToValueAtTime(500, t + len);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.05, t + 0.8);
  g.gain.setValueAtTime(0.05, t + len - 0.4);
  g.gain.linearRampToValueAtTime(0.0001, t + len);
  f.connect(g).connect(musicBus);
  for (const n of chord)
    for (const det of [-9, 0, 8]) {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = hz(n);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + len + 0.05);
    }
}

/** A brass stab: bright, short, the whole chord. */
function brass(t: number, chord: number[], hold: number) {
  const c = ctx!;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.Q.value = 2;
  f.frequency.setValueAtTime(600, t);
  f.frequency.exponentialRampToValueAtTime(3200, t + 0.04);
  f.frequency.exponentialRampToValueAtTime(900, t + hold);
  const g = c.createGain();
  env(g, t, 0.09, 0.015, hold);
  f.connect(g).connect(musicBus);
  for (const n of [...chord, chord[0] + 12])
    for (const [type, det] of [["sawtooth", -6], ["sawtooth", 7], ["square", 0]] as const) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = hz(n);
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + hold + 0.1);
    }
}

function arp(t: number, midi: number) {
  const c = ctx!;
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.value = hz(midi + 12);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2200;
  const g = c.createGain();
  env(g, t, 0.035, 0.003, 0.14);
  o.connect(f).connect(g);
  g.connect(musicBus);
  g.connect(delayIn);
  o.start(t);
  o.stop(t + 0.2);
}

/** A rising noise sweep, two bars long, into an action section. */
function riser(t: number, len: number) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 4;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(6000, t + len);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + len * 0.95);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
  src.connect(f).connect(g).connect(musicBus);
  src.start(t);
  src.stop(t + len + 0.1);
}

/* ---------------------------------------------------------------- */
/* The sequencer                                                     */
/* ---------------------------------------------------------------- */

const BASS = [0, 0, 12, 0, 0, 7, 0, 12, 0, 0, 12, 0, 7, 0, 3, 0]; // offsets from the chord root, per sixteenth
const BASS_ON = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];

function playStep(s: number, t: number) {
  const bar = Math.floor(s / 16) % BARS;
  const i = s % 16;
  const section = Math.floor(bar / 8); // 0 A, 1 B, 2 A', 3 B'
  const action = section % 2 === 1;
  const chord = CHORDS[Math.floor(bar / 2) % 4];
  const root = chord[0];

  // Pad on every two-bar chord change, in the suspense sections (and quietly under the action).
  if (i === 0 && bar % 2 === 0 && (!action || section === 3)) pad(t, chord, STEP * 32);

  // The bass pulse runs throughout; the suspense sections only on the beats.
  if (BASS_ON[i] && (action || i % 4 === 0 || (section === 2 && i % 2 === 0))) bass(t, root + BASS[i], action ? STEP * 0.9 : STEP * 1.8);

  // Clockwork: ticks on every eighth, accented on the beat.
  if (i % 2 === 0 && !action) tick(t, i % 4 === 0);

  if (action) {
    if (i === 0 || i === 6 || i === 10) kick(t);
    if (i === 4 || i === 12) snare(t);
    if (i % 2 === 1) hat(t, i === 15);
    // Brass: a stab on the one and an answer on the "and" of three.
    if (i === 0) brass(t, chord, 0.32);
    if (i === 10 && bar % 2 === 1) brass(t, chord, 0.22);
  }
  // The arpeggio: futuristic shimmer in A' and B'.
  if (section >= 2 && i % 2 === 0) arp(t, [...chord, chord[0] + 12][(i / 2) % 4]);

  // A riser over the two bars before each action section.
  if ((bar === 6 || bar === 22) && i === 0) riser(t, STEP * 32);
}

function schedule() {
  const c = ctx!;
  while (nextTime < c.currentTime + LOOKAHEAD) {
    playStep(step, nextTime);
    nextTime += STEP;
    step = (step + 1) % (BARS * 16);
  }
}

/* ---------------------------------------------------------------- */
/* Effects                                                           */
/* ---------------------------------------------------------------- */

const vary = (base: number, amount = 0.06) => base * (1 + (Math.random() * 2 - 1) * amount);

const EFFECTS: Record<Sfx, (t: number) => void> = {
  // A soft interface click.
  click: (t) => noiseHit(t, sfxBus, "bandpass", vary(2800), 5, 0.18, 0.025),
  // A key tick, for typing in the terminal: very quiet.
  tick: (t) => noiseHit(t, sfxBus, "bandpass", vary(4200, 0.15), 7, 0.06, 0.018),
  // A ratchet: three quick pawl clicks, falling in pitch.
  gear: (t) => {
    for (let k = 0; k < 3; k++) noiseHit(t + k * 0.055, sfxBus, "bandpass", vary(2600 - k * 320), 8, 0.22, 0.03);
  },
  // A web strand whipping past: a band of noise sweeping up and across.
  whoosh: (t) => {
    const c = ctx!;
    const src = c.createBufferSource();
    src.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 3;
    f.frequency.setValueAtTime(vary(450), t);
    f.frequency.exponentialRampToValueAtTime(vary(3600), t + 0.3);
    const p = c.createStereoPanner();
    p.pan.setValueAtTime(-0.6, t);
    p.pan.linearRampToValueAtTime(0.6, t + 0.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.28, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    src.connect(f).connect(p).connect(g).connect(sfxBus);
    src.start(t, Math.random() * 0.4);
    src.stop(t + 0.45);
  },
  // A panel landing: a paper slap with a little weight under it.
  panel: (t) => {
    noiseHit(t, sfxBus, "lowpass", vary(1600), 0.7, 0.3, 0.08);
    tone(t, sfxBus, "sine", vary(90), 0.3, 0.003, 0.12);
  },
  // The engine spooling up: a rising saw and a speeding ratchet.
  spool: (t) => {
    const c = ctx!;
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(55, t);
    o.frequency.exponentialRampToValueAtTime(330, t + 1.1);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 1.1);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
    o.connect(f).connect(g).connect(sfxBus);
    o.start(t);
    o.stop(t + 1.4);
    let k = 0;
    for (let at = 0; at < 1.1; k++) {
      noiseHit(t + at, sfxBus, "bandpass", 2400 + k * 40, 8, 0.12, 0.02);
      at += Math.max(0.025, 0.14 * 0.86 ** k);
    }
  },
  // Metal on metal: inharmonic partials, like a plumb bob tapping a steel rule.
  clank: (t) => {
    const f0 = vary(520, 0.1);
    for (const [ratio, peak] of [[1, 0.12], [2.76, 0.07], [5.4, 0.04], [8.93, 0.02]] as const) tone(t, sfxBus, "sine", f0 * ratio, peak, 0.002, 0.5 / ratio ** 0.4);
  },
  // Menu open: three plates landing on twos (1/12 s apart).
  open: (t) => {
    for (let k = 0; k < 3; k++) {
      noiseHit(t + k / 12, sfxBus, "lowpass", vary(1400 + k * 500), 0.7, 0.2, 0.07);
      tone(t + k / 12, sfxBus, "sine", vary(80 + k * 18), 0.18, 0.003, 0.09);
    }
  },
  close: (t) => EFFECTS.whoosh(t),
  // A web shot: a quick hiss falling in pitch, then the strand snapping tight.
  thwip: (t) => {
    const c = ctx!;
    const src = c.createBufferSource();
    src.buffer = noise;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 6;
    f.frequency.setValueAtTime(vary(5200), t);
    f.frequency.exponentialRampToValueAtTime(vary(900), t + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    src.connect(f).connect(g).connect(sfxBus);
    src.start(t, Math.random() * 0.4);
    src.stop(t + 0.16);
    tone(t + 0.11, sfxBus, "triangle", vary(320), 0.08, 0.002, 0.07);
  },
};

/* ---------------------------------------------------------------- */
/* Public API                                                        */
/* ---------------------------------------------------------------- */

/** Unlock and fade the sound in. Call from inside a click or key handler. */
export async function start() {
  const c = build();
  if (c.state !== "running") await c.resume().catch(() => {});
  const t = c.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0.32, t + 1.2);
  if (!playing) {
    playing = true;
    step = 0;
    nextTime = c.currentTime + 0.1;
    timer = window.setInterval(schedule, TICK_MS);
  }
}

/** Fade everything out and stop the clock. */
export function stop() {
  if (!ctx) return;
  const c = ctx;
  const t = c.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(0, t + 0.25);
  window.clearInterval(timer);
  playing = false;
  window.setTimeout(() => {
    if (!playing) void c.suspend().catch(() => {});
  }, 400);
}

/** Pause while the tab is hidden (no music to a background tab), carry on when it returns. */
export function pause(hidden: boolean) {
  if (!ctx || !playing) return;
  if (hidden) {
    window.clearInterval(timer);
    void ctx.suspend().catch(() => {});
  } else {
    void ctx.resume().then(() => {
      nextTime = Math.max(nextTime, ctx!.currentTime + 0.05);
      window.clearInterval(timer);
      timer = window.setInterval(schedule, TICK_MS);
    });
  }
}

/**
 * Play an effect. The same effect never stacks on itself (a short cooldown),
 * and each play is varied slightly in pitch so repeats don't sound copied.
 */
export function sfx(name: Sfx) {
  if (!ctx || !playing || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const cooldown = name === "tick" ? 0.03 : 0.12;
  if (now - (lastPlayed.get(name) ?? -1) < cooldown) return;
  lastPlayed.set(name, now);
  EFFECTS[name](now + 0.005);
}

export type { Sfx };
