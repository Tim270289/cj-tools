"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import StepTitle from "@/components/step-title";

type Mode = "focus" | "short" | "long";
type Settings = Record<Mode, number> & { rounds: number };

const MODES: Record<Mode, { label: string; color: string }> = {
  focus: { label: "專注", color: "#059669" },
  short: { label: "短休息", color: "#0891b2" },
  long: { label: "長休息", color: "#4f46e5" },
};

const DEFAULT_SETTINGS: Settings = { focus: 25, short: 5, long: 15, rounds: 4 };

const SETTING_FIELDS: { key: keyof Settings; label: string; unit: string; min: number; max: number }[] = [
  { key: "focus", label: "專注時間", unit: "分鐘", min: 1, max: 120 },
  { key: "short", label: "短休息", unit: "分鐘", min: 1, max: 60 },
  { key: "long", label: "長休息", unit: "分鐘", min: 1, max: 60 },
  { key: "rounds", label: "長休息間隔", unit: "個番茄", min: 1, max: 10 },
];

const RING_RADIUS = 110;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 時間到的提示音：連續三聲嗶
function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + offset;
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.3);
    });
  } catch {
    // 瀏覽器不支援音效就略過
  }
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(DEFAULT_SETTINGS.focus * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const endAt = useRef(0);

  const total = settings[mode] * 60;
  const progress = 1 - remaining / total;
  const color = MODES[mode].color;
  const cycleDone = completed % settings.rounds;

  function switchMode(next: Mode) {
    setRunning(false);
    setMode(next);
    setRemaining(settings[next] * 60);
  }

  // 專注結束 → 休息（每 N 個番茄一次長休息）；休息結束 → 專注
  const onFinish = useEffectEvent(() => {
    beep();
    if (mode === "focus") {
      const count = completed + 1;
      setCompleted(count);
      switchMode(count % settings.rounds === 0 ? "long" : "short");
    } else {
      switchMode("focus");
    }
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) onFinish();
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  // 計時中把倒數顯示在瀏覽器分頁標題
  useEffect(() => {
    if (!running) return;
    const original = document.title;
    document.title = `${formatTime(remaining)} ${MODES[mode].label}`;
    return () => {
      document.title = original;
    };
  }, [running, remaining, mode]);

  function toggle() {
    if (running) {
      setRunning(false);
      return;
    }
    endAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }

  function skip() {
    switchMode(mode === "focus" ? "short" : "focus");
  }

  function updateSetting(key: keyof Settings, value: number) {
    const field = SETTING_FIELDS.find((f) => f.key === key)!;
    const next = Math.min(field.max, Math.max(field.min, value));
    setSettings((prev) => ({ ...prev, [key]: next }));
    if (key === mode) setRemaining(next * 60);
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8">
      <StepTitle step={1} title="番茄鐘" hint={`今日完成 ${completed} 個番茄`} />
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  m === mode ? "bg-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
                style={m === mode ? { color: MODES[m].color } : undefined}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-[280px]">
            <svg viewBox="0 0 260 260" className="w-full -rotate-90">
              <circle cx={130} cy={130} r={RING_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={14} />
              <circle
                cx={130}
                cy={130}
                r={RING_RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={14}
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-300 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold" style={{ color }}>
                {MODES[mode].label}
              </span>
              <span className="font-mono text-6xl font-black tracking-tight text-slate-900 tabular-nums">
                {formatTime(remaining)}
              </span>
              <span className="mt-2 flex gap-1.5" aria-label={`本輪已完成 ${cycleDone} / ${settings.rounds}`}>
                {Array.from({ length: settings.rounds }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${i < cycleDone ? "bg-rose-500" : "bg-slate-200"}`}
                  />
                ))}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggle}
              className="rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-10 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/40 active:translate-y-0"
            >
              {running ? "暫停" : remaining < total ? "繼續" : "開始"}
            </button>
            <button
              type="button"
              onClick={() => switchMode(mode)}
              className="rounded-2xl bg-white px-5 py-3.5 font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              重設
            </button>
            <button
              type="button"
              onClick={skip}
              className="rounded-2xl bg-white px-5 py-3.5 font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              跳過
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <h3 className="mb-4 font-bold text-slate-700">設定</h3>
          <ul className="flex flex-col gap-3">
            {SETTING_FIELDS.map((field) => (
              <li key={field.key} className="flex items-center gap-3">
                <span className="flex-1 text-slate-600">{field.label}</span>
                <div className="flex items-center rounded-xl bg-white ring-1 ring-slate-200">
                  <button
                    type="button"
                    onClick={() => updateSetting(field.key, settings[field.key] - 1)}
                    disabled={running || settings[field.key] <= field.min}
                    aria-label={`${field.label}減少`}
                    className="h-9 w-9 rounded-l-xl text-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={settings[field.key]}
                    min={field.min}
                    max={field.max}
                    disabled={running}
                    onChange={(e) => updateSetting(field.key, Number(e.target.value) || field.min)}
                    className="h-9 w-12 [appearance:textfield] bg-transparent text-center font-bold text-slate-800 outline-none disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateSetting(field.key, settings[field.key] + 1)}
                    disabled={running || settings[field.key] >= field.max}
                    aria-label={`${field.label}增加`}
                    className="h-9 w-9 rounded-r-xl text-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <span className="w-14 text-sm text-slate-400">{field.unit}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-400">計時中無法修改設定；時間到會響三聲提示。</p>
        </div>
      </div>
    </section>
  );
}
