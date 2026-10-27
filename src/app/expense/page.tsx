import type { Metadata } from "next";
import ExpenseForm from "./expense-form";

export const metadata: Metadata = {
  title: "發票請款",
  description: "填寫支出人、日期、類型、明細並上傳憑證，產生費用請款單",
};

export default function ExpensePage() {
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
            發票請款
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            花了錢，<span className="text-emerald-600">記得請回來</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            填好支出資料、附上發票或收據，
            <br className="hidden sm:block" />
            一鍵產生請款單交給會計。
          </p>
        </header>

        <ExpenseForm />
      </main>
    </div>
  );
}
