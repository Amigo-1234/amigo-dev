"use client";

import { useSyncExternalStore } from "react";

import type { Sfx } from "./sound-engine";

/*
 * Sound on or off, remembered across pages and visits. Off unless the visitor
 * turns it on: the entry screen's "Enter with sound", the header toggle, the
 * M key, or the terminal's `sound on`.
 *
 * This module is tiny and always loaded; the synthesiser (sound-engine.ts)
 * loads only when sound is on. Browsers allow audio only after a click or a
 * key press, so a visitor who chose sound on an earlier visit hears it from
 * their first interaction on this one.
 */

const KEY = "amigodev-sound";
export const SOUND_EVENT = "amigodev:sound";

type Pref = "on" | "off";

function read(): Pref {
  try {
    return localStorage.getItem(KEY) === "on" ? "on" : "off";
  } catch {
    return "off";
  }
}

let engine: Promise<typeof import("./sound-engine")> | null = null;
const load = () => (engine ??= import("./sound-engine"));

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  const onEvent = () => fn();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SOUND_EVENT, onEvent);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SOUND_EVENT, onEvent);
  };
}

/** Whether sound is on, for components. Always "off" on the server. */
export function useSound(): boolean {
  return useSyncExternalStore(subscribe, () => read() === "on", () => false);
}

export function isSoundOn() {
  return read() === "on";
}

/** Turn sound on or off. Call it from a click or key handler so the browser lets audio start. */
export function setSound(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage can be refused; sound still follows the choice for this page.
  }
  notify();
  if (on) void load().then((e) => e.start());
  else if (engine) void engine.then((e) => e.stop());
}

export function toggleSound() {
  setSound(!isSoundOn());
}

/** Play an effect if sound is on. Never loads the synthesiser just for this. */
export function sfx(name: Sfx) {
  if (!engine || !isSoundOn()) return;
  void engine.then((e) => e.sfx(name));
}

let installed = false;

/**
 * Site-wide wiring, installed once from the sound toggle: resume on the first
 * interaction when sound was chosen before, pause in hidden tabs, and the M
 * key as an instant mute (ignored while typing in a field).
 */
export function installSound() {
  if (installed) return;
  installed = true;

  const unlock = () => {
    if (isSoundOn()) void load().then((e) => e.start());
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  // The entry screen unlocks audio itself; elsewhere, wait for the first interaction.
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener(SOUND_EVENT, () => {
    if (isSoundOn()) void load().then((e) => e.start());
  });
  // The entry cover may have unlocked audio inside its click before React loaded.
  if (isSoundOn() && window.__amigoAudio?.state === "running") void load().then((e) => e.start());

  // The cover's engine: spool up, then a whoosh as the cover opens.
  window.addEventListener("amigodev:ignition", (ev) => {
    if (!isSoundOn()) return;
    const stage = (ev as CustomEvent<string>).detail;
    void load().then(async (e) => {
      await e.start();
      e.sfx(stage === "spool" ? "spool" : "whoosh");
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (engine) void engine.then((e) => e.pause(document.hidden));
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "m" && e.key !== "M") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.documentElement.getAttribute("data-ignition") === "idle") return;
    toggleSound();
  });
}
