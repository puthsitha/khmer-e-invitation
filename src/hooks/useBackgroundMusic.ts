"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// In-memory cache for audio download promises so multiple mounts/requests share the buffer
const audioPromiseCache = new Map<string, Promise<ArrayBuffer | null>>();

function preloadAudio(url: string): Promise<ArrayBuffer | null> {
  if (audioPromiseCache.has(url)) {
    return audioPromiseCache.get(url)!;
  }
  const promise = fetch(`/api/audio-proxy?url=${encodeURIComponent(url)}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .catch((err) => {
      console.warn("Background audio pre-fetch failed:", err);
      audioPromiseCache.delete(url);
      return null;
    });
  audioPromiseCache.set(url, promise);
  return promise;
}

/**
 * Plays a looping background track through the Web Audio API instead of an
 * <audio> element. Browsers auto-expose an OS-level "Now Playing" media
 * session (lock screen / notification controls) for any playing
 * HTMLMediaElement, but never for a raw Web Audio graph — so this avoids
 * that widget appearing for ambient background music entirely.
 *
 * Pre-loads the audio array buffer immediately when the hook mounts so that
 * when the user interacts to open the invitation, playback starts with zero lag.
 */
export function useBackgroundMusic(url: string | undefined) {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  // Pre-load audio track immediately when URL becomes available
  useEffect(() => {
    if (!url) return;
    preloadAudio(url);
  }, [url]);

  const start = useCallback(() => {
    if (!url || startedRef.current) return;
    startedRef.current = true;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    contextRef.current = context;

    // A freshly-created context can still report "suspended" even when
    // constructed inside a click handler — some browsers (Brave/Safari)
    // don't reliably flip it to "running" from a single resume() call.
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

    // Use pre-loaded buffer (or wait for in-flight download)
    preloadAudio(url)
      .then((data) => {
        if (!data) return;
        // slice(0) avoids neutering the cached ArrayBuffer in browsers that detach on decode
        return context.decodeAudioData(data.slice(0));
      })
      .then((buffer) => {
        if (!buffer) return;
        tryResume();
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start(0);
      })
      .catch((err) => {
        console.warn("Audio playback decode/start failed:", err);
      });
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
