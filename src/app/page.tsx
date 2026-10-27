import Link from "next/link";
import ToolIcon from "@/components/tool-icon";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <div className="relative flex-1 overflow-hidden bg-linear-to-br from-emerald-50 via-white to-sky-50 text-slate-800">
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl"
        aria-hidden
      />

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-16 sm:px-8 sm:py-24">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            采匠 CJ Tools
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
            采匠的<span className="text-emerald-600">好用小工具</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-500">
            把每天重複的小事交給工具，
            <br className="hidden sm:block" />
            讓大家把力氣留給真正重要的工作。
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {TOOLS.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                className={
                  i === 0
                    ? "rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40"
                    : "rounded-2xl bg-white px-8 py-3.5 text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                }
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-center text-sm font-bold tracking-widest text-slate-400">所有小工具</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:ring-emerald-200"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <ToolIcon name={tool.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-6 text-2xl font-black text-slate-900">{tool.title}</h3>
                <p className="mt-2 leading-7 text-slate-500">{tool.description}</p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-slate-600">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-8 inline-flex items-center gap-1 font-bold text-emerald-600">
                  開始使用
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-400">更多小工具陸續加入中，有想要的工具歡迎提出 ✨</p>
        </section>
      </main>
    </div>
  );
}
