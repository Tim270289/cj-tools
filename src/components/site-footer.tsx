import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white text-slate-500">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 font-black text-white">
              采
            </span>
            <span className="font-black text-slate-900">采匠的好用小工具</span>
          </Link>
          <p className="mt-3 text-sm">讓每天的小事，做起來更順手。</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/" className="transition hover:text-emerald-600">
            首頁
          </Link>
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="transition hover:text-emerald-600">
              {tool.title}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
