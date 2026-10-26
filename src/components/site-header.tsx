"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/lib/tools";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 text-lg font-black text-white shadow-sm shadow-emerald-500/30">
            采
          </span>
          <span className="hidden font-black tracking-tight text-slate-900 sm:block">采匠的好用小工具</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {TOOLS.map((tool) => {
            const active = pathname === tool.href;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition sm:px-4 ${
                  active ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {tool.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
