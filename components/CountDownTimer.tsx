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
    <div className="border-accent-100 bg-accent-50 min-w-20 rounded-xl border px-4 py-3 text-center shadow-sm backdrop-blur-sm">
      <p className="text-primary text-2xl leading-none font-semibold">
        {formatUnit(value)}
      </p>
      <p className="text-accent-200 mt-1 text-xs tracking-wider uppercase">
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
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="h-19.5 w-20 animate-pulse rounded-xl bg-white/70" />
        <div className="h-19.5 w-20 animate-pulse rounded-xl bg-white/70" />
        <div className="h-19.5 w-20 animate-pulse rounded-xl bg-white/70" />
        <div className="h-19.5 w-20 animate-pulse rounded-xl bg-white/70" />
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
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <TimeBlock value={timeLeft.minutes} label="Minutes" />
      <TimeBlock value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
