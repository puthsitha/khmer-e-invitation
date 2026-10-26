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

interface UseBackgroundMusicOptions {
  fadeInDuration?: number; // seconds to fade from 0 to full volume
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
 * Fades in the volume smoothly from down to up (0 to 1) when playback begins.
 */
export function useBackgroundMusic(
  url: string | undefined,
  options?: UseBackgroundMusicOptions
) {
  const fadeInDuration = options?.fadeInDuration ?? 2.5;
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (contextRef.current && contextRef.current.state !== "closed") {
        contextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Pre-load audio track immediately when URL becomes available
  useEffect(() => {
    if (!url) return;
    preloadAudio(url);
  }, [url]);

  const start = useCallback(() => {
    if (!url) return;

    // If already started, ensure context is running if it was suspended
    if (startedRef.current) {
      if (contextRef.current?.state === "suspended") {
        contextRef.current.resume().catch(() => {});
      }
      return;
    }
    startedRef.current = true;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
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
    // Start initial gain at 0 for fade in
    gain.gain.setValueAtTime(0, context.currentTime);
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

        // Fade in from 0 to 1 (or 0 if muted)
        const targetVolume = mutedRef.current ? 0 : 1;
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        if (targetVolume > 0 && fadeInDuration > 0) {
          gain.gain.linearRampToValueAtTime(targetVolume, now + fadeInDuration);
        } else {
          gain.gain.setValueAtTime(targetVolume, now);
        }
      })
      .catch((err) => {
        console.warn("Audio playback decode/start failed:", err);
      });
  }, [url, fadeInDuration]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      const gain = gainRef.current;
      const context = contextRef.current;
      if (gain && context) {
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        // Smooth quick transition to prevent clicks/pops
        gain.gain.linearRampToValueAtTime(next ? 0 : 1, now + 0.15);
      }
      return next;
    });
  }, []);

  return { start, muted, toggleMute };
}
