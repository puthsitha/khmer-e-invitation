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

    const gain = context.createGain();
    gain.gain.value = muted ? 0 : 1;
    gain.connect(context.destination);
    gainRef.current = gain;

    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
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
