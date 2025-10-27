'use client';

import { useCallback, useRef } from "react";

type ScheduledNode = {
  osc: OscillatorNode;
  gain: GainNode;
};

type BabySongControls = {
  startSong: () => void;
  stopSong: () => void;
};

interface MelodyNote {
  time: number;
  duration: number;
  frequency: number;
}

const melody: MelodyNote[] = [
  { time: 0, duration: 0.38, frequency: 392 },
  { time: 0.42, duration: 0.38, frequency: 440 },
  { time: 0.84, duration: 0.55, frequency: 392 },
  { time: 1.48, duration: 0.48, frequency: 523 },
  { time: 1.96, duration: 0.55, frequency: 494 },
  { time: 2.62, duration: 0.45, frequency: 392 },
  { time: 3.12, duration: 0.38, frequency: 392 },
  { time: 3.52, duration: 0.38, frequency: 440 },
  { time: 3.94, duration: 0.55, frequency: 392 },
  { time: 4.56, duration: 0.52, frequency: 587 },
  { time: 5.12, duration: 0.68, frequency: 523 },
  { time: 5.96, duration: 0.62, frequency: 392 },
  { time: 6.7, duration: 0.62, frequency: 330 },
  { time: 7.4, duration: 0.55, frequency: 349 },
  { time: 8.02, duration: 0.9, frequency: 294 }
];

const totalDuration = melody[melody.length - 1].time + melody[melody.length - 1].duration + 0.8;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    return null;
  }

  return new AudioCtx();
}

export default function useBabySong(): BabySongControls {
  const contextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<ScheduledNode[]>([]);
  const cleanupTimersRef = useRef<number[]>([]);

  const stopSong = useCallback(() => {
    cleanupTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    cleanupTimersRef.current = [];

    activeNodesRef.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
      } catch (error) {
        // noop: node might already be stopped
      }
      osc.disconnect();
      gain.disconnect();
    });

    activeNodesRef.current = [];

    if (contextRef.current && contextRef.current.state !== "closed") {
      contextRef.current
        .suspend()
        .catch(() => {
          /* ignored */
        });
    }
  }, []);

  const startSong = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    let context = contextRef.current;

    if (!context) {
      context = getAudioContext();
      if (!context) {
        return;
      }
      contextRef.current = context;
    }

    stopSong();

    void context.resume();

    const masterGain = context.createGain();
    masterGain.gain.setValueAtTime(0.14, context.currentTime);
    masterGain.connect(context.destination);

    const baseTime = context.currentTime + 0.05;

    melody.forEach((note) => {
      const osc = context!.createOscillator();
      const gain = context!.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.frequency, baseTime + note.time);

      gain.gain.setValueAtTime(0, baseTime + note.time);
      gain.gain.linearRampToValueAtTime(0.24, baseTime + note.time + 0.02);
      gain.gain.linearRampToValueAtTime(0.08, baseTime + note.time + note.duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, baseTime + note.time + note.duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(baseTime + note.time);
      osc.stop(baseTime + note.time + note.duration + 0.05);

      activeNodesRef.current.push({ osc, gain });
    });

    const cleanupTimer = window.setTimeout(() => {
      masterGain.disconnect();
    }, totalDuration * 1000);

    cleanupTimersRef.current.push(cleanupTimer);
  }, [stopSong]);

  return { startSong, stopSong };
}
