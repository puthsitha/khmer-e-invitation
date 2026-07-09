"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Plays a looping background track through the Web Audio API instead of an
 * <audio> element. Browsers auto-expose an OS-level "Now Playing" media
 * session (lock screen / notification controls) for any playing
 * HTMLMediaElement, but never for a raw Web Audio graph — so this avoids
 * that widget appearing for ambient background music entirely.
 */
export function useBackgroundMusic(url: string | undefined) {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  const start = useCallback(() => {
    if (!url || startedRef.current) return;
    startedRef.current = true;

    const context = new AudioContext();
    contextRef.current = context;

    // A freshly-created context can still report "suspended" even when
    // constructed inside a click handler — some browsers (Brave among
    // them) don't reliably flip it to "running" from a single resume()
    // call, and by the time the fetched track finishes decoding we're
    // well outside that gesture's call stack anyway. Resume explicitly
    // now, again right before playback starts, and retry on the next
    // couple of interactions as a last-resort safety net.
    function tryResume() {
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }
    }
    function resumeOnInteraction() {
      tryResume();
      if (context.state === "running") {
        document.removeEventListener("click", resumeOnInteraction);
        document.removeEventListener("touchend", resumeOnInteraction);
      }
    }
    tryResume();
    document.addEventListener("click", resumeOnInteraction);
    document.addEventListener("touchend", resumeOnInteraction);

    const gain = context.createGain();
    gain.gain.value = muted ? 0 : 1;
    gain.connect(context.destination);
    gainRef.current = gain;

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        tryResume();
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start(0);
      })
      .catch(() => {});
  }, [url, muted]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (gainRef.current) gainRef.current.gain.value = next ? 0 : 1;
      return next;
    });
  }, []);

  return { start, muted, toggleMute };
}
