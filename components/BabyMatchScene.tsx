'use client';

import { useMemo, useState, useEffect } from "react";
import styles from "./BabyMatchScene.module.css";
import useBabySong from "../hooks/useBabySong";

type Phase = "idle" | "kick" | "goal" | "dance";

const phaseText: Record<Extract<Phase, "kick" | "goal" | "dance">, string> = {
  kick: "Here comes the kick!",
  goal: "GOOOAAAL!",
  dance: "Groovy diaper dance!"
};

export default function BabyMatchScene() {
  const [phase, setPhase] = useState<Phase>("idle");
  const { startSong, stopSong } = useBabySong();

  useEffect(() => {
    if (phase !== "kick") {
      return;
    }

    const goalTimer = window.setTimeout(() => {
      setPhase("goal");
    }, 2800);

    const danceTimer = window.setTimeout(() => {
      setPhase("dance");
    }, 4500);

    return () => {
      window.clearTimeout(goalTimer);
      window.clearTimeout(danceTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "dance") {
      stopSong();
      return;
    }

    startSong();

    return () => {
      stopSong();
    };
  }, [phase, startSong, stopSong]);

  const showScoreboard = phase === "kick" || phase === "goal" || phase === "dance";

  const scoreboardText = useMemo(() => {
    if (phase === "idle") {
      return "Baby Striker Show";
    }
    return phaseText[phase as keyof typeof phaseText];
  }, [phase]);

  const handleStart = () => {
    setPhase("kick");
  };

  const handleReplay = () => {
    stopSong();
    setPhase("idle");
  };

  return (
    <section className={`${styles.scene} ${styles[`phase-${phase}`] || ""}`}>
      <div className={styles.stadiumShell}>
        <div className={styles.crowd} />
        <div className={styles.spotlights}>
          <div className={styles.spotlightOne} />
          <div className={styles.spotlightTwo} />
        </div>
        <div className={styles.field}>
          <div className={styles.centerLine} />
          <div className={styles.penaltyArc} />
          <div className={styles.goalArea}>
            <div className={styles.goalFrame}>
              <div className={styles.goalNet} />
            </div>
          </div>
          <div className={styles.ballShadow} />
          <div className={styles.ball} />
          <div className={styles.baby}>
            <div className={styles.babyShadow} />
            <div className={styles.babyBody}>
              <div className={styles.head}>
                <div className={styles.eyeLeft} />
                <div className={styles.eyeRight} />
                <div className={styles.cheekLeft} />
                <div className={styles.cheekRight} />
                <div className={styles.smile} />
                <div className={styles.hairCurl} />
              </div>
              <div className={styles.torso}>
                <div className={styles.armLeft} />
                <div className={styles.armRight} />
                <div className={styles.diaper}>
                  <div className={styles.diaperPin} />
                </div>
              </div>
              <div className={styles.legs}>
                <div className={`${styles.leg} ${styles.legFront}`} />
                <div className={`${styles.leg} ${styles.legBack}`} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.fireworks}>
          <div className={styles.fireworkOne} />
          <div className={styles.fireworkTwo} />
          <div className={styles.fireworkThree} />
        </div>
      </div>

      {showScoreboard && (
        <div className={styles.scoreboard}>
          <span className={styles.scoreLabel}>{scoreboardText}</span>
        </div>
      )}

      {phase === "idle" && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <h1 className={styles.overlayTitle}>Baby Stadium Spectacle</h1>
            <p className={styles.overlayText}>
              Tap the button to unleash the cutest striker, score a winning goal and
              celebrate with a silly diaper dance to a bubbly baby tune.
            </p>
            <button className={styles.primaryButton} onClick={handleStart}>
              Kick Off Show
            </button>
          </div>
        </div>
      )}

      {phase === "dance" && (
        <button className={styles.replayButton} onClick={handleReplay}>
          Replay Match
        </button>
      )}
    </section>
  );
}
