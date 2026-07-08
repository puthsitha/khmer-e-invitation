"use client";

import { useEffect, useRef } from "react";

const RESUME_AFTER_MS = 9000;
const SCROLL_SPEED_PX_PER_TICK = 0.6;

/**
 * Slowly auto-scrolls the page while idle. Any manual scroll/touch/wheel
 * input pauses it immediately and it resumes after a period of inactivity.
 */
export function useAutoScroll(enabled: boolean) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const autoScrolling = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function tick() {
      if (autoScrolling.current) {
        window.scrollBy(0, SCROLL_SPEED_PX_PER_TICK);
      }
      rafId.current = requestAnimationFrame(tick);
    }

    function pauseThenResume() {
      autoScrolling.current = false;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        autoScrolling.current = true;
      }, RESUME_AFTER_MS);
    }

    const events: (keyof WindowEventMap)[] = [
      "wheel",
      "touchstart",
      "keydown",
      "pointerdown",
    ];
    events.forEach((event) => window.addEventListener(event, pauseThenResume, { passive: true }));

    idleTimer.current = setTimeout(() => {
      autoScrolling.current = true;
    }, RESUME_AFTER_MS);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      events.forEach((event) => window.removeEventListener(event, pauseThenResume));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);
}
