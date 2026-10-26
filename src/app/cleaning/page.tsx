import type { Metadata } from "next";
import { AREA_COLORS, CLEANING_AREAS } from "./areas";
import CleaningDraw from "./cleaning-draw";
import StepTitle from "@/components/step-title";

export const metadata: Metadata = {
  title: "打掃區域抽籤",
  description: "輸入今天在公司的夥伴，轉盤抽出每個人負責的打掃區域",
};

export default function CleaningPage() {
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
            今日打掃任務
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            今天，<span className="text-emerald-600">誰負責哪裡？</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            轉一下轉盤，公平分配打掃區域。
            <br className="hidden sm:block" />
            乾淨的辦公室，從每個人的十分鐘開始。
          </p>
        </header>

        <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8">
          <StepTitle step={1} title="打掃區域" hint={`共 ${CLEANING_AREAS.length} 區`} />
          <p className="flex flex-wrap gap-x-6 gap-y-3 text-base text-slate-700">
            {CLEANING_AREAS.map((area, i) => (
              <span key={area} className="inline-flex items-center gap-2">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: AREA_COLORS[i % AREA_COLORS.length] }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {area}
              </span>
            ))}
          </p>
        </section>

        <CleaningDraw areas={CLEANING_AREAS} />
      </main>
    </div>
  );
}
