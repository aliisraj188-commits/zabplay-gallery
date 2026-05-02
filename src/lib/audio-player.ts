// Global audio player store - one shared <audio> element for music playback.
// Supports: play/pause, next/prev, repeat-one, autoplay-next, shuffle,
// playback rate, and a simple equalizer (bass / mid / treble + preamp) via
// Web Audio API BiquadFilters. This is the "sound mixing" the user asked for.

import type { MediaItem } from "./media-store";

export type RepeatMode = "off" | "one" | "all";

export interface EqSettings {
  enabled: boolean;
  preamp: number; // dB, -12..+12
  bass: number;   // dB
  mid: number;    // dB
  treble: number; // dB
}

export const EQ_PRESETS: Record<string, Omit<EqSettings, "enabled">> = {
  Flat:    { preamp: 0, bass: 0,  mid: 0,  treble: 0 },
  Bass:    { preamp: 2, bass: 8,  mid: 0,  treble: 2 },
  Vocal:   { preamp: 1, bass: -2, mid: 5,  treble: 2 },
  Treble:  { preamp: 1, bass: 0,  mid: 1,  treble: 7 },
  Party:   { preamp: 3, bass: 6,  mid: 2,  treble: 5 },
  Classical:{ preamp: 0, bass: 3, mid: -1, treble: 4 },
};

type Listener = () => void;

class AudioPlayer {
  audio: HTMLAudioElement | null = null;
  queue: MediaItem[] = [];
  index = -1;
  playing = false;
  currentTime = 0;
  duration = 0;
  rate = 1;
  repeat: RepeatMode = "off";
  shuffle = false;
  eq: EqSettings = { enabled: false, preamp: 0, bass: 0, mid: 0, treble: 0 };

  private ctx: AudioContext | null = null;
  private srcNode: MediaElementAudioSourceNode | null = null;
  private preampNode: GainNode | null = null;
  private bassNode: BiquadFilterNode | null = null;
  private midNode: BiquadFilterNode | null = null;
  private trebleNode: BiquadFilterNode | null = null;
  private listeners = new Set<Listener>();

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  private emit() { this.listeners.forEach((l) => l()); }

  private ensureAudio() {
    if (this.audio) return this.audio;
    if (typeof window === "undefined") return null;
    const a = new Audio();
    a.preload = "metadata";
    a.addEventListener("timeupdate", () => {
      this.currentTime = a.currentTime;
      this.emit();
    });
    a.addEventListener("loadedmetadata", () => {
      this.duration = a.duration || 0;
      this.emit();
    });
    a.addEventListener("play", () => { this.playing = true; this.emit(); });
    a.addEventListener("pause", () => { this.playing = false; this.emit(); });
    a.addEventListener("ended", () => this.handleEnded());
    this.audio = a;
    return a;
  }

  private setupGraph() {
    if (!this.audio || this.ctx) return;
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.srcNode = this.ctx.createMediaElementSource(this.audio);
      this.preampNode = this.ctx.createGain();
      this.bassNode = this.ctx.createBiquadFilter();
      this.bassNode.type = "lowshelf";
      this.bassNode.frequency.value = 200;
      this.midNode = this.ctx.createBiquadFilter();
      this.midNode.type = "peaking";
      this.midNode.frequency.value = 1000;
      this.midNode.Q.value = 1;
      this.trebleNode = this.ctx.createBiquadFilter();
      this.trebleNode.type = "highshelf";
      this.trebleNode.frequency.value = 3200;
      this.srcNode
        .connect(this.preampNode)
        .connect(this.bassNode)
        .connect(this.midNode)
        .connect(this.trebleNode)
        .connect(this.ctx.destination);
      this.applyEq();
    } catch {
      // ignore — graph is optional
    }
  }

  private applyEq() {
    if (!this.preampNode || !this.bassNode || !this.midNode || !this.trebleNode) return;
    const on = this.eq.enabled;
    const dbToGain = (db: number) => Math.pow(10, db / 20);
    this.preampNode.gain.value = on ? dbToGain(this.eq.preamp) : 1;
    this.bassNode.gain.value = on ? this.eq.bass : 0;
    this.midNode.gain.value = on ? this.eq.mid : 0;
    this.trebleNode.gain.value = on ? this.eq.treble : 0;
  }

  setEq(patch: Partial<EqSettings>) {
    this.eq = { ...this.eq, ...patch };
    this.applyEq();
    this.emit();
  }
  applyPreset(name: string) {
    const p = EQ_PRESETS[name];
    if (!p) return;
    this.eq = { enabled: true, ...p };
    this.applyEq();
    this.emit();
  }

  setQueue(items: MediaItem[], startIndex = 0) {
    this.queue = items;
    this.index = startIndex;
    this.loadCurrent(true);
  }

  playItem(items: MediaItem[], item: MediaItem) {
    const i = items.findIndex((x) => x.id === item.id);
    this.setQueue(items, Math.max(0, i));
  }

  private loadCurrent(autoplay: boolean) {
    const a = this.ensureAudio();
    const cur = this.queue[this.index];
    if (!a || !cur) { this.emit(); return; }
    a.src = cur.url;
    a.playbackRate = this.rate;
    if (autoplay) {
      const promise = a.play();
      if (promise) {
        promise.then(() => {
          this.setupGraph();
          if (this.ctx?.state === "suspended") this.ctx.resume();
        }).catch(() => {});
      }
    }
    this.emit();
  }

  toggle() {
    const a = this.ensureAudio();
    if (!a) return;
    if (a.paused) {
      a.play().then(() => {
        this.setupGraph();
        if (this.ctx?.state === "suspended") this.ctx.resume();
      }).catch(() => {});
    } else {
      a.pause();
    }
  }

  seek(t: number) {
    const a = this.audio; if (!a) return;
    a.currentTime = Math.max(0, Math.min(this.duration || 0, t));
  }

  setRate(r: number) {
    this.rate = r;
    if (this.audio) this.audio.playbackRate = r;
    this.emit();
  }

  setRepeat(m: RepeatMode) { this.repeat = m; this.emit(); }
  setShuffle(s: boolean) { this.shuffle = s; this.emit(); }

  next() {
    if (!this.queue.length) return;
    if (this.shuffle) {
      this.index = Math.floor(Math.random() * this.queue.length);
    } else {
      this.index = (this.index + 1) % this.queue.length;
    }
    this.loadCurrent(true);
  }

  prev() {
    if (!this.queue.length) return;
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    this.index = (this.index - 1 + this.queue.length) % this.queue.length;
    this.loadCurrent(true);
  }

  private handleEnded() {
    if (this.repeat === "one") {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
      return;
    }
    const isLast = this.index >= this.queue.length - 1;
    if (isLast && this.repeat !== "all") {
      this.playing = false;
      this.emit();
      return;
    }
    this.next();
  }

  current(): MediaItem | undefined { return this.queue[this.index]; }
}

export const audioPlayer = new AudioPlayer();
