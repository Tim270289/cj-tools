"use client";

import { useEffect, useRef, useState } from "react";
import { AREA_COLORS, DEFAULT_MEMBERS } from "./areas";
import StepTitle from "@/components/step-title";
import { downloadScreenshot } from "@/lib/download-screenshot";

type Assignment = { person: string; area: string };

const SPIN_MS = 2500;
const PAUSE_MS = 900;
const WHEEL_SIZE = 340;
const LIGHT_COUNT = 18;
const UNDO_MS = 5000;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 人數 >= 區域數：每個區域至少一人，多的人平均分配
// 人數 < 區域數：每個人至少一區，多的區域平均分配
function drawAssignments(people: string[], areas: string[]): Assignment[] {
  const shuffledPeople = shuffle(people);
  const shuffledAreas = shuffle(areas);
  if (shuffledPeople.length >= shuffledAreas.length) {
    return shuffledPeople.map((person, i) => ({
      person,
      area: shuffledAreas[i % shuffledAreas.length],
    }));
  }
  return shuffledAreas.map((area, i) => ({
    person: shuffledPeople[i % shuffledPeople.length],
    area,
  }));
}

// 依名字固定配色，人員左右移動時頭像顏色不變
function colorOf(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 997;
  return AREA_COLORS[hash % AREA_COLORS.length];
}

// 轉到指定區域：指針在正上方，額外多轉 5 圈，落點在扇形內隨機偏移
function nextRotation(prev: number, index: number, count: number): number {
  const segment = 360 / count;
  const jitter = (Math.random() - 0.5) * segment * 0.7;
  const target = (((360 - (index + 0.5) * segment + jitter) % 360) + 360) % 360;
  const delta = (((target - prev) % 360) + 360) % 360;
  return prev + 360 * 5 + delta;
}

function polar(angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  const center = WHEEL_SIZE / 2;
  // 四捨五入到小數兩位，避免伺服器與瀏覽器的浮點數誤差造成 hydration 不一致
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    x: round(center + radius * Math.cos(rad)),
    y: round(center + radius * Math.sin(rad)),
  };
}

function Wheel({ areas, rotation }: { areas: string[]; rotation: number }) {
  const center = WHEEL_SIZE / 2;
  const ringRadius = center - 2;
  const radius = center - 18;
  const segment = 360 / areas.length;

  return (
    <div className="relative mx-auto w-full max-w-[360px] pt-5">
      <svg
        viewBox="0 0 40 48"
        className="absolute left-1/2 top-0 z-10 w-10 -translate-x-1/2 drop-shadow-md"
        aria-hidden
      >
        <path
          d="M20 46 L6 20 A15 15 0 1 1 34 20 Z"
          fill="#e11d48"
          stroke="white"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <circle cx={20} cy={16} r={5} fill="white" />
      </svg>
      <svg
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        className="w-full drop-shadow-xl"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
        }}
      >
        <circle cx={center} cy={center} r={ringRadius} fill="#0f172a" />
        {Array.from({ length: LIGHT_COUNT }, (_, i) => {
          const light = polar((360 / LIGHT_COUNT) * i, ringRadius - 8);
          return (
            <circle
              key={i}
              cx={light.x}
              cy={light.y}
              r={3.5}
              fill={i % 2 === 0 ? "#fde68a" : "#ffffff"}
            />
          );
        })}
        {areas.map((area, i) => {
          const start = i * segment;
          const end = start + segment;
          const mid = start + segment / 2;
          const from = polar(start, radius);
          const to = polar(end, radius);
          const label = polar(mid, radius * 0.62);
          const color = AREA_COLORS[i % AREA_COLORS.length];
          return (
            <g key={area}>
              {areas.length === 1 ? (
                <circle cx={center} cy={center} r={radius} fill={color} />
              ) : (
                <path
                  d={`M ${center} ${center} L ${from.x} ${from.y} A ${radius} ${radius} 0 ${segment > 180 ? 1 : 0} 1 ${to.x} ${to.y} Z`}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
              <text
                x={label.x}
                y={label.y}
                transform={`rotate(${mid} ${label.x} ${label.y})`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                className="text-[14px] font-bold"
              >
                {area}
              </text>
            </g>
          );
        })}
        <circle cx={center} cy={center} r={30} fill="#ffffff" stroke="#0f172a" strokeWidth={4} />
        <circle cx={center} cy={center} r={10} fill="#059669" />
      </svg>
    </div>
  );
}

function MemberChip({
  name,
  muted,
  disabled,
  hint,
  onClick,
  onRemove,
}: {
  name: string;
  muted: boolean;
  disabled: boolean;
  hint: string;
  onClick: () => void;
  onRemove: () => void;
}) {
  return (
    <span className="group animate-pop-in relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={hint}
        className={`inline-flex h-9 items-center gap-2 rounded-full py-1 pr-4 pl-1 text-sm font-medium shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm ${
          muted ? "bg-slate-100 text-slate-400 ring-slate-200" : "bg-white text-slate-700 ring-slate-200"
        }`}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: muted ? "#cbd5e1" : colorOf(name) }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
        {name}
      </button>
      {!disabled && (
        // 滑鼠移上去才顯示；觸控裝置沒有 hover，直接常駐
        <button
          type="button"
          onClick={onRemove}
          aria-label={`刪除 ${name}`}
          title={`刪除 ${name}`}
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-xs leading-none text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-rose-500 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        >
          ×
        </button>
      )}
    </span>
  );
}

function AddMemberChip({ disabled, onAdd }: { disabled: boolean; onAdd: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  function commit() {
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
    setName("");
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          // 中文輸入法選字時按 Enter 不送出
          if (e.key === "Enter" && !e.nativeEvent.isComposing) commit();
          if (e.key === "Escape") {
            setName("");
            setEditing(false);
          }
        }}
        onBlur={() => {
          commit();
          setEditing(false);
        }}
        placeholder="輸入名字，Enter 新增"
        className="h-9 w-44 rounded-full bg-white px-4 text-sm text-slate-700 shadow-sm ring-2 ring-emerald-400 outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2 rounded-full border-2 border-dashed border-slate-300 py-1 pr-4 pl-1 text-sm font-medium text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-base leading-none">
        +
      </span>
      新增夥伴
    </button>
  );
}

function MemberColumn({
  title,
  description,
  names,
  muted,
  disabled,
  chipHint,
  onToggle,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  names: string[];
  muted: boolean;
  disabled: boolean;
  chipHint: string;
  onToggle: (name: string) => void;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ring-1 ${
        muted ? "bg-slate-50 ring-slate-200" : "bg-emerald-50/60 ring-emerald-100"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${muted ? "bg-slate-300" : "bg-emerald-500"}`} />
        <h3 className={`font-bold ${muted ? "text-slate-500" : "text-emerald-800"}`}>{title}</h3>
        <span className="ml-auto text-sm text-slate-400">{names.length} 位</span>
      </div>
      <p className="mb-4 text-sm text-slate-400">{description}</p>
      <div className="flex min-h-9 flex-wrap gap-2">
        {names.map((name) => (
          <MemberChip
            key={name}
            name={name}
            muted={muted}
            disabled={disabled}
            hint={chipHint}
            onClick={() => onToggle(name)}
            onRemove={() => onRemove(name)}
          />
        ))}
        <AddMemberChip disabled={disabled} onAdd={onAdd} />
      </div>
    </div>
  );
}

export default function CleaningDraw({ areas }: { areas: string[] }) {
  const [present, setPresent] = useState(DEFAULT_MEMBERS);
  const [absent, setAbsent] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [results, setResults] = useState<Assignment[]>([]);
  const [current, setCurrent] = useState<Assignment | null>(null);
  const [landed, setLanded] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [total, setTotal] = useState(0);
  const [removed, setRemoved] = useState<{ name: string; present: boolean; index: number } | null>(
    null,
  );
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plan = useRef<Assignment[]>([]);
  const drawSection = useRef<HTMLElement>(null);

  const done = !spinning && results.length > 0;

  useEffect(
    () => () => {
      clearTimeout(timer.current ?? undefined);
      clearTimeout(undoTimer.current ?? undefined);
    },
    [],
  );

  function runStep(step: number) {
    const assignment = plan.current[step];
    if (!assignment) {
      setCurrent(null);
      setSpinning(false);
      return;
    }
    setCurrent(assignment);
    setLanded(false);
    setRotation((prev) => nextRotation(prev, areas.indexOf(assignment.area), areas.length));
    timer.current = setTimeout(() => {
      setLanded(true);
      setResults((prev) => [...prev, assignment]);
      timer.current = setTimeout(() => runStep(step + 1), PAUSE_MS);
    }, SPIN_MS);
  }

  function addMember(name: string, toPresent: boolean) {
    if (present.includes(name) || absent.includes(name)) return;
    if (toPresent) setPresent((prev) => [...prev, name]);
    else setAbsent((prev) => [...prev, name]);
  }

  function markAbsent(name: string) {
    setPresent((prev) => prev.filter((n) => n !== name));
    setAbsent((prev) => [...prev, name]);
  }

  function markPresent(name: string) {
    setAbsent((prev) => prev.filter((n) => n !== name));
    setPresent((prev) => [...prev, name]);
  }

  function removeMember(name: string, fromPresent: boolean) {
    const list = fromPresent ? present : absent;
    const setList = fromPresent ? setPresent : setAbsent;
    setList(list.filter((n) => n !== name));
    setRemoved({ name, present: fromPresent, index: list.indexOf(name) });
    clearTimeout(undoTimer.current ?? undefined);
    undoTimer.current = setTimeout(() => setRemoved(null), UNDO_MS);
  }

  function undoRemove() {
    if (!removed) return;
    const { name, index } = removed;
    clearTimeout(undoTimer.current ?? undefined);
    setRemoved(null);
    if (present.includes(name) || absent.includes(name)) return;
    const setList = removed.present ? setPresent : setAbsent;
    setList((prev) => [...prev.slice(0, index), name, ...prev.slice(index)]);
  }

  function start() {
    if (present.length === 0 || spinning) return;
    plan.current = drawAssignments(present, areas);
    setTotal(plan.current.length);
    setResults([]);
    setSpinning(true);
    runStep(0);
  }

  function skip() {
    clearTimeout(timer.current ?? undefined);
    setResults(plan.current);
    setCurrent(null);
    setSpinning(false);
  }

  return (
    <>
      <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8">
        <StepTitle step={2} title="今日夥伴" hint={`參與抽籤 ${present.length} 位`} />
        <div className="grid gap-4 md:grid-cols-2">
          <MemberColumn
            title="今日在倉庫"
            description="點一下名牌，移到右側「今日不在倉庫」"
            names={present}
            muted={false}
            disabled={spinning}
            chipHint="點一下移到今日不在倉庫"
            onToggle={markAbsent}
            onAdd={(name) => addMember(name, true)}
            onRemove={(name) => removeMember(name, true)}
          />
          <MemberColumn
            title="今日不在倉庫"
            description="這裡的人不會被抽到，點一下移回左側"
            names={absent}
            muted
            disabled={spinning}
            chipHint="點一下移回今日在倉庫"
            onToggle={markPresent}
            onAdd={(name) => addMember(name, false)}
            onRemove={(name) => removeMember(name, false)}
          />
        </div>
      </section>

      <section
        ref={drawSection}
        className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8"
      >
        <StepTitle
          step={3}
          title="轉盤抽籤"
          hint={spinning || done ? `已抽出 ${results.length} / ${total}` : undefined}
        />
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-5">
            <Wheel areas={areas} rotation={rotation} />

            <div className="flex h-14 items-center justify-center text-center">
              {current ? (
                landed ? (
                  <p key={`${current.person}-landed`} className="animate-pop-in text-2xl font-black text-slate-900">
                    {current.person}
                    <span className="mx-2 text-slate-300">→</span>
                    <span style={{ color: AREA_COLORS[areas.indexOf(current.area) % AREA_COLORS.length] }}>
                      {current.area}
                    </span>
                  </p>
                ) : (
                  <p className="text-lg text-slate-500">
                    正在幫 <span className="font-bold text-slate-900">{current.person}</span> 抽區域⋯
                  </p>
                )
              ) : (
                <p className="text-slate-400">
                  {done ? "抽籤完成，可以再抽一次或存成圖片" : "準備好了就按下去吧！"}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={start}
                disabled={present.length === 0 || spinning}
                className="rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-10 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {done ? "重新抽籤" : spinning ? "抽籤中⋯" : "開始抽籤"}
              </button>
              {spinning && (
                <button
                  onClick={skip}
                  className="rounded-2xl bg-white px-6 py-3.5 font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  直接看結果
                </button>
              )}
            </div>
          </div>

          <div>
            <ul className="flex flex-col gap-3">
              {areas.map((area, i) => {
                const color = AREA_COLORS[i % AREA_COLORS.length];
                const people = results.filter((r) => r.area === area).map((r) => r.person);
                const highlighted = landed && current?.area === area;
                return (
                  <li
                    key={area}
                    className={`flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 transition ${
                      highlighted ? "shadow-lg ring-2" : "ring-1 ring-slate-200"
                    }`}
                    style={highlighted ? { ["--tw-ring-color" as string]: color } : undefined}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold text-white"
                      style={{ background: color }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="w-28 shrink-0 font-bold text-slate-800">{area}</span>
                    <div className="flex flex-1 flex-wrap justify-end gap-1.5">
                      {people.length === 0 ? (
                        <span className="text-sm text-slate-300">待抽籤</span>
                      ) : (
                        people.map((person) => (
                          <span
                            key={person}
                            className="animate-pop-in rounded-full px-3 py-1 text-sm font-bold"
                            style={{ background: `${color}1a`, color }}
                          >
                            {person}
                          </span>
                        ))
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {done && (
              <div className="animate-pop-in mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl bg-emerald-600 p-5 text-white sm:flex-row">
                <div>
                  <p className="text-lg font-bold">任務分配完成！</p>
                  <p className="text-sm text-emerald-100">今天的辦公室就交給大家了，辛苦啦 ✨</p>
                </div>
                <button
                  onClick={() => drawSection.current && downloadScreenshot(drawSection.current, "打掃抽籤")}
                  className="shrink-0 rounded-xl bg-white px-5 py-2.5 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  存成圖片
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {removed && (
        <div
          key={removed.name}
          className="animate-pop-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-slate-900 py-3 pr-3 pl-5 text-sm text-white shadow-2xl"
        >
          <span>
            已刪除 <span className="font-bold">{removed.name}</span>
          </span>
          <button
            type="button"
            onClick={undoRemove}
            className="rounded-xl bg-white/10 px-3 py-1.5 font-bold text-emerald-300 transition hover:bg-white/20"
          >
            復原
          </button>
        </div>
      )}
    </>
  );
}
