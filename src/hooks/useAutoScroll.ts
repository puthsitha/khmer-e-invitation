"use client";

import { useEffect, useRef } from "react";

const RESUME_AFTER_MS = 12000;
const SCROLL_SPEED_PX_PER_TICK = 0.5;

/**
 * Slowly auto-scrolls the page while idle on desktop/pointer devices.
 * Any manual scroll, touch, or wheel input pauses it immediately and it resumes
 * only after a period of complete inactivity. Touch gestures explicitly lock out
 * auto-scroll so mobile scrolling never freezes or stutters.
 */
export function useAutoScroll(enabled: boolean) {
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const autoScrolling = useRef(false);
  const isInteracting = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // On touch screens / mobile devices, native user touch momentum must not be interrupted
    if (window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window) return;

    function stopAutoScroll() {
      autoScrolling.current = false;
    }

    function tick() {
      if (autoScrolling.current && !isInteracting.current) {
        window.scrollBy({ top: SCROLL_SPEED_PX_PER_TICK, behavior: "auto" });
      }
      rafId.current = requestAnimationFrame(tick);
    }

    function pauseThenResume() {
      stopAutoScroll();
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (!isInteracting.current) {
          autoScrolling.current = true;
        }
      }, RESUME_AFTER_MS);
    }

    function onTouchStart() {
      isInteracting.current = true;
      pauseThenResume();
    }

    function onTouchEnd() {
      isInteracting.current = false;
      pauseThenResume();
    }

    const interactionEvents: (keyof WindowEventMap)[] = [
      "wheel",
      "keydown",
      "pointerdown",
      "scroll",
    ];

    interactionEvents.forEach((event) =>
      window.addEventListener(event, pauseThenResume, { passive: true }),
    );

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", pauseThenResume, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    idleTimer.current = setTimeout(() => {
      if (!isInteracting.current) {
        autoScrolling.current = true;
      }
    }, RESUME_AFTER_MS);

    rafId.current = requestAnimationFrame(tick);

    return () => {
      interactionEvents.forEach((event) =>
        window.removeEventListener(event, pauseThenResume),
      );
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", pauseThenResume);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled]);
}
