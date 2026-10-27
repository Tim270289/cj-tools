"use client";

import { Fragment, useState } from "react";
import { QA_CATEGORIES, QA_ITEMS, type QaCategory, type QaItem } from "./qa-data";

const SUGGESTIONS = ["工時", "起泡", "壁癌", "色差", "用量", "下雨"];

// 用空白分隔多個關鍵字，每個關鍵字都要符合
function parseKeywords(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

// 問題標題命中分數最高，其次是標籤、答案
function score(item: QaItem, keywords: string[]): number {
  let total = 0;
  for (const keyword of keywords) {
    const inQuestion = item.question.toLowerCase().includes(keyword);
    const inTags = item.tags.some((tag) => tag.toLowerCase().includes(keyword));
    const inAnswer = item.answer.toLowerCase().includes(keyword);
    const inCategory = item.category.includes(keyword);
    if (!inQuestion && !inTags && !inAnswer && !inCategory) return 0;
    total += (inQuestion ? 3 : 0) + (inTags ? 2 : 0) + (inAnswer ? 1 : 0) + (inCategory ? 1 : 0);
  }
  return total;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, keywords }: { text: string; keywords: string[] }) {
  if (keywords.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${keywords.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-100 px-0.5 text-amber-900">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export default function QaSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<QaCategory | null>(null);
  // 搜尋時預設全部展開、沒搜尋時預設收合；這裡記錄使用者手動切換過的項目
  const [toggled, setToggled] = useState<Set<string>>(new Set());

  const keywords = parseKeywords(query);
  const searching = keywords.length > 0;

  const matched = searching
    ? QA_ITEMS.map((item) => ({ item, score: score(item, keywords) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item)
    : QA_ITEMS;
  const results = category ? matched.filter((item) => item.category === category) : matched;

  function search(text: string) {
    setQuery(text);
    setToggled(new Set());
  }

  function toggle(id: string) {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <section className="sticky top-20 z-30 rounded-3xl bg-white/90 p-4 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <circle cx={11} cy={11} r={7} />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="搜尋問題，例如：工時、起泡、壁癌"
            aria-label="搜尋施工問題"
            className="h-14 w-full rounded-2xl bg-slate-50 pr-4 pl-12 text-lg text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-400">熱門搜尋</span>
          {SUGGESTIONS.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => search(word)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                query === word
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {[null, ...QA_CATEGORIES].map((c) => {
          const count = c ? matched.filter((item) => item.category === c).length : matched.length;
          const active = category === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setCategory(c)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold ring-1 transition ${
                active
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {c ?? "全部"}
              <span className="text-slate-400">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-500">
        {searching ? (
          <>
            找到 <span className="font-bold text-slate-900">{results.length}</span> 筆與「
            <span className="font-bold text-emerald-700">{query.trim()}</span>」相關的問答
          </>
        ) : (
          <>
            共 <span className="font-bold text-slate-900">{results.length}</span> 筆問答
          </>
        )}
      </p>

      {results.length === 0 ? (
        <div className="rounded-3xl bg-white/80 p-10 text-center ring-1 ring-slate-200/70">
          <p className="text-lg font-bold text-slate-700">找不到相關的問答</p>
          <p className="mt-2 text-slate-500">換個說法試試看，或從熱門搜尋開始</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {results.map((item) => {
            const open = toggled.has(item.id) !== searching;
            return (
              <li
                key={item.id}
                className={`rounded-2xl bg-white ring-1 transition ${
                  open ? "shadow-md ring-emerald-200" : "ring-slate-200 hover:ring-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 p-5 text-left"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                    Q
                  </span>
                  <span className="flex-1">
                    <span className="mb-1 block text-xs font-bold text-emerald-700">{item.category}</span>
                    <span className="block text-lg leading-7 font-bold text-slate-900">
                      <Highlight text={item.question} keywords={keywords} />
                    </span>
                  </span>
                  <span
                    className={`mt-1 text-slate-400 transition ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </button>
                {open && (
                  <div className="flex gap-4 px-5 pb-5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-white">
                      A
                    </span>
                    <div className="flex-1">
                      <p className="leading-8 text-slate-700">
                        <Highlight text={item.answer} keywords={keywords} />
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => search(tag)}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            #<Highlight text={tag} keywords={keywords} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
