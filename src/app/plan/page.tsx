import type { Metadata } from "next";
import DayPlan from "./day-plan";
import Pomodoro from "./pomodoro";

export const metadata: Metadata = {
  title: "今日計劃與番茄鐘",
  description: "番茄鐘專注計時，搭配 8:30–17:30 的今日計劃表",
};

export default function PlanPage() {
  return (
    <div className="relative flex-1 overflow-hidden bg-linear-to-br from-emerald-50 via-white to-sky-50 text-slate-800">
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-20 -right-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-8 sm:py-16">
        <header className="mb-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            今日計劃與番茄鐘
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            今天，<span className="text-emerald-600">一次專心做一件事</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            先把今天要做的事排進時間表，
            <br className="hidden sm:block" />
            再用番茄鐘一段一段完成它。
          </p>
        </header>

        <Pomodoro />
        <DayPlan />
      </main>
    </div>
  );
}
