import type { Metadata } from "next";
import QaSearch from "./qa-search";

export const metadata: Metadata = {
  title: "工務 Q&A",
  description: "歷年塗料施工常見問題整理，輸入關鍵字快速查詢",
};

export default function QaPage() {
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

      <main className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12 sm:px-8 sm:py-16">
        <header className="mb-2 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            工務 Q&amp;A
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            塗料施工，<span className="text-emerald-600">先查再問</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            歷年來工地最常遇到的問題都整理在這裡，
            <br className="hidden sm:block" />
            輸入關鍵字，經驗馬上找得到。
          </p>
        </header>

        <QaSearch />
      </main>
    </div>
  );
}
