"use client";

import { useEffect, useRef, useState } from "react";
import StepTitle from "@/components/step-title";
import { downloadScreenshot, todayString } from "@/lib/download-screenshot";

const DAY_START = 8 * 60 + 30;
const DAY_END = 17 * 60 + 30;
const SLOT_MINUTES = 30;

function formatMinutes(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const SLOTS = Array.from({ length: (DAY_END - DAY_START) / SLOT_MINUTES }, (_, i) => {
  const start = DAY_START + i * SLOT_MINUTES;
  return { start, label: `${formatMinutes(start)} – ${formatMinutes(start + SLOT_MINUTES)}` };
});

// 每天的計劃分開存，隔天打開就是新的一張表
function storageKey(date: string) {
  return `cj-tools:plan:${date}`;
}

function loadPlan(date: string): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(storageKey(date)) ?? "{}");
  } catch {
    return {};
  }
}

function savePlan(date: string, plan: Record<number, string>) {
  try {
    localStorage.setItem(storageKey(date), JSON.stringify(plan));
  } catch {
    // 無痕模式等情況存不了就略過
  }
}

export default function DayPlan() {
  const [plan, setPlan] = useState<Record<number, string>>({});
  const [now, setNow] = useState<Date | null>(null);
  const section = useRef<HTMLElement>(null);

  // 時間只在瀏覽器端取得，避免伺服器與瀏覽器時間不同造成 hydration 不一致
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(() => {
      tick();
      setPlan(loadPlan(todayString()));
    }, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const date = now ? todayString(now) : "";
  const weekday = now ? "日一二三四五六"[now.getDay()] : "";
  const nowMinutes = now ? now.getHours() * 60 + now.getMinutes() : -1;
  const filled = SLOTS.filter((slot) => plan[slot.start]?.trim()).length;

  function update(start: number, text: string) {
    const next = { ...plan, [start]: text };
    setPlan(next);
    savePlan(todayString(), next);
  }

  function clearAll() {
    if (!confirm("確定要清空今天的計劃嗎？")) return;
    setPlan({});
    savePlan(todayString(), {});
  }

  return (
    <section
      ref={section}
      className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="[&>div]:mb-0">
          <StepTitle step={2} title="今日計劃" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {date && `${date}（${weekday}）・已安排 ${filled} / ${SLOTS.length}`}
          </span>
          <button
            type="button"
            onClick={clearAll}
            data-screenshot-ignore
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            清空
          </button>
          <button
            type="button"
            onClick={() => section.current && downloadScreenshot(section.current, "今日計劃")}
            data-screenshot-ignore
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            截圖今日計劃
          </button>
        </div>
      </div>

      {/* 雙欄時由上往下排：左欄上午、右欄下午 */}
      <ul className="grid gap-2 md:grid-flow-col md:grid-rows-9 md:gap-x-6">
        {SLOTS.map((slot) => {
          const isNow = nowMinutes >= slot.start && nowMinutes < slot.start + SLOT_MINUTES;
          const hasText = Boolean(plan[slot.start]?.trim());
          return (
            <li
              key={slot.start}
              className={`flex items-center gap-3 rounded-2xl p-2 pl-4 ring-1 transition ${
                isNow ? "bg-emerald-50 ring-2 ring-emerald-400" : "bg-white ring-slate-200"
              }`}
            >
              <span
                className={`w-28 shrink-0 font-mono text-sm font-bold tabular-nums ${
                  isNow ? "text-emerald-700" : hasText ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {slot.label}
              </span>
              <input
                value={plan[slot.start] ?? ""}
                onChange={(e) => update(slot.start, e.target.value)}
                placeholder={isNow ? "現在要做什麼？" : "要做什麼事？"}
                className="h-10 min-w-0 flex-1 rounded-xl bg-slate-50 px-3 text-slate-800 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-400"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
