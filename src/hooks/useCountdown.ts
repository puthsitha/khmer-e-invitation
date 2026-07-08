"use client";

import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function computeCountdown(target: number): Countdown {
  const diff = Math.max(0, target - Date.now());
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: diff <= 0,
  };
}

const ZERO: Countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

export function useCountdown(target: number): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(ZERO);

  useEffect(() => {
    const update = () => setCountdown(computeCountdown(target));
    const timeout = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [target]);

  return countdown;
}
