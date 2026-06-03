"use client";

import { useEffect, useMemo, useState } from "react";

type CountDownTimerProps = {
  endDate: string | Date;
};

type TimeLeft = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(endDate: string | Date, nowMs: number): TimeLeft {
  const targetMs = new Date(endDate).getTime();
  const totalMs = Math.max(targetMs - nowMs, 0);

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { totalMs, days, hours, minutes, seconds };
}

function formatUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="border-accent-100 bg-accent-50 w-full min-w-0 rounded-lg border px-3 py-3 text-center shadow-sm backdrop-blur-sm sm:w-20 sm:rounded-xl sm:px-4">
      <p className="text-primary text-xl leading-none font-semibold sm:text-2xl">
        {formatUnit(value)}
      </p>
      <p className="text-accent-300 mt-1 text-[10px] tracking-wider uppercase sm:text-xs">
        {label}
      </p>
    </div>
  );
}

export default function CountDownTimer({ endDate }: CountDownTimerProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const timeLeft = useMemo(
    () => (nowMs === null ? null : getTimeLeft(endDate, nowMs)),
    [endDate, nowMs],
  );

  useEffect(() => {
    const endMs = new Date(endDate).getTime();
    const syncTimeoutId = window.setTimeout(() => {
      setNowMs(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      const nextNow = Date.now();
      setNowMs(nextNow);

      if (nextNow >= endMs) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      window.clearTimeout(syncTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [endDate]);

  if (timeLeft === null) {
    return (
      <div className="mb-6 grid max-w-xs grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:gap-3">
        <div className="h-16 w-full animate-pulse rounded-lg bg-white/70 sm:h-20 sm:w-20 sm:rounded-xl" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-white/70 sm:h-20 sm:w-20 sm:rounded-xl" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-white/70 sm:h-20 sm:w-20 sm:rounded-xl" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-white/70 sm:h-20 sm:w-20 sm:rounded-xl" />
      </div>
    );
  }

  if (timeLeft.totalMs <= 0) {
    return (
      <div className="mb-6 flex max-w-md text-xl font-medium text-blue-950">
        Event ended.
      </div>
    );
  }

  return (
    <div className="mb-6 grid max-w-xs grid-cols-2 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <TimeBlock value={timeLeft.minutes} label="Minutes" />
      <TimeBlock value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
