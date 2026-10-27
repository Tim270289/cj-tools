"use client";

import { useEffect, useRef, useState } from "react";
import StepTitle from "@/components/step-title";
import { downloadScreenshot, todayString } from "@/lib/download-screenshot";
import { DEFAULT_MEMBERS } from "@/lib/members";

const CATEGORIES = ["交通費", "餐費", "材料費", "工具設備", "文具用品", "郵寄運費", "其他"];
const MAX_FILE_MB = 10;

type Line = { id: string; item: string; amount: string };
type Voucher = { id: string; name: string; type: string; size: number; dataUrl: string };
type Claim = {
  no: string;
  payer: string;
  date: string;
  category: string;
  invoiceNo: string;
  lines: Line[];
  vouchers: Voucher[];
  total: number;
  createdAt: string;
};

function newLine(): Line {
  return { id: crypto.randomUUID(), item: "", amount: "" };
}

function formatMoney(n: number): string {
  return `NT$ ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm font-medium text-rose-600">{message}</p>;
}

const cardClass = "rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-8";
const inputClass =
  "h-12 w-full rounded-xl bg-slate-50 px-4 text-slate-800 ring-1 ring-slate-200 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400";

export default function ExpenseForm() {
  const [payer, setPayer] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: "line-0", item: "", amount: "" }]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  // 日期預設今天；只在瀏覽器端取得，避免伺服器與瀏覽器時間不同
  useEffect(() => {
    const id = setTimeout(() => setDate((prev) => prev || todayString()), 0);
    return () => clearTimeout(id);
  }, []);

  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const filledLines = lines.filter((line) => line.item.trim() || line.amount);

  const errors: Record<string, string> = {};
  if (!payer.trim()) errors.payer = "請填寫支出人";
  if (!date) errors.date = "請選擇支出日期";
  if (!category) errors.category = "請選擇支出類型";
  if (filledLines.length === 0) errors.lines = "請至少填寫一筆明細";
  else if (filledLines.some((line) => !line.item.trim() || !(Number(line.amount) > 0)))
    errors.lines = "每筆明細都要填寫項目，且金額需大於 0";
  if (vouchers.length === 0) errors.vouchers = "請上傳至少一張發票或收據";
  const visibleErrors = showErrors ? errors : {};

  function updateLine(id: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const rejected: string[] = [];
    const added: Voucher[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        rejected.push(`${file.name}（只接受圖片或 PDF）`);
        continue;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        rejected.push(`${file.name}（超過 ${MAX_FILE_MB} MB）`);
        continue;
      }
      added.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await readAsDataUrl(file),
      });
    }
    setVouchers((prev) => [...prev, ...added]);
    setFileError(rejected.length > 0 ? `以下檔案無法上傳：${rejected.join("、")}` : "");
  }

  function submit() {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }
    const now = new Date();
    setClaim({
      no: `EX${date.replaceAll("-", "")}-${String(now.getTime()).slice(-4)}`,
      payer: payer.trim(),
      date,
      category,
      invoiceNo: invoiceNo.trim(),
      lines: filledLines,
      vouchers,
      total,
      createdAt: todayString(now),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setPayer("");
    setDate(todayString());
    setCategory("");
    setLines([newLine()]);
    setInvoiceNo("");
    setVouchers([]);
    setFileError("");
    setShowErrors(false);
    setClaim(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (claim) {
    return (
      <>
        <div className="animate-pop-in flex flex-col items-center justify-between gap-4 rounded-2xl bg-emerald-600 p-5 text-white sm:flex-row">
          <div>
            <p className="text-lg font-bold">請款單已產生！</p>
            <p className="text-sm text-emerald-100">下載圖片後交給會計，紙本發票記得一併繳交。</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setClaim(null)}
              className="rounded-xl bg-white/15 px-4 py-2.5 font-bold text-white transition hover:bg-white/25"
            >
              返回修改
            </button>
            <button
              type="button"
              onClick={() => sheet.current && downloadScreenshot(sheet.current, `請款單-${claim.payer}`)}
              className="rounded-xl bg-white px-5 py-2.5 font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              下載請款單圖片
            </button>
          </div>
        </div>

        <div ref={sheet} className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-5">
            <div>
              <p className="text-sm font-bold text-emerald-700">采匠</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">費用請款單</h2>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>
                單號 <span className="font-mono font-bold text-slate-800">{claim.no}</span>
              </p>
              <p>申請日期 {claim.createdAt}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["支出人", claim.payer],
              ["支出日期", claim.date],
              ["支出類型", claim.category],
              ["發票號碼", claim.invoiceNo || "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold text-slate-400">{label}</dt>
                <dd className="mt-1 font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <table className="mt-6 w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-400">
                <th className="w-12 py-2 font-bold">#</th>
                <th className="py-2 font-bold">明細</th>
                <th className="py-2 text-right font-bold">金額</th>
              </tr>
            </thead>
            <tbody>
              {claim.lines.map((line, i) => (
                <tr key={line.id} className="border-b border-slate-100">
                  <td className="py-3 font-mono text-sm text-slate-400">{i + 1}</td>
                  <td className="py-3 text-slate-800">{line.item}</td>
                  <td className="py-3 text-right font-mono text-slate-800 tabular-nums">
                    {formatMoney(Number(line.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="pt-4 text-right font-bold text-slate-500">
                  請款總額
                </td>
                <td className="pt-4 text-right font-mono text-2xl font-black text-emerald-700 tabular-nums">
                  {formatMoney(claim.total)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-8">
            <p className="mb-3 text-sm font-bold text-slate-400">憑證（{claim.vouchers.length} 份）</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {claim.vouchers.map((v) =>
                v.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 使用者上傳的本機圖片
                  <img
                    key={v.id}
                    src={v.dataUrl}
                    alt={v.name}
                    className="aspect-[3/4] w-full rounded-xl bg-slate-50 object-contain ring-1 ring-slate-200"
                  />
                ) : (
                  <div
                    key={v.id}
                    className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-200"
                  >
                    <span className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-black text-white">PDF</span>
                    <span className="text-sm break-all text-slate-600">{v.name}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {["申請人", "主管", "會計"].map((role) => (
              <div key={role} className="rounded-xl ring-1 ring-slate-200">
                <p className="border-b border-slate-200 py-2 text-center text-sm font-bold text-slate-500">{role}</p>
                <div className="h-16" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mx-auto rounded-2xl bg-white px-8 py-3 font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          填寫下一筆請款
        </button>
      </>
    );
  }

  return (
    <>
      <section className={cardClass}>
        <StepTitle step={1} title="支出人與日期" />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600">支出人</span>
            <input
              list="expense-members"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              placeholder="選擇或輸入姓名"
              className={inputClass}
            />
            <datalist id="expense-members">
              {DEFAULT_MEMBERS.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <FieldError message={visibleErrors.payer} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600">支出日期</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            <FieldError message={visibleErrors.date} />
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <StepTitle step={2} title="支出類型" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-xl px-5 py-2.5 font-bold ring-1 transition ${
                category === c
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-emerald-600"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <FieldError message={visibleErrors.category} />
      </section>

      <section className={cardClass}>
        <StepTitle step={3} title="支出明細" hint={`${lines.length} 筆`} />
        <ul className="flex flex-col gap-3">
          {lines.map((line, i) => (
            <li key={line.id} className="flex items-center gap-2 sm:gap-3">
              <span className="w-6 shrink-0 text-center font-mono text-sm text-slate-400">{i + 1}</span>
              <input
                value={line.item}
                onChange={(e) => updateLine(line.id, { item: e.target.value })}
                placeholder="項目說明，例如：高鐵 台北→台中"
                className={`${inputClass} min-w-0 flex-1`}
              />
              <div className="relative w-32 shrink-0 sm:w-40">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                  NT$
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={line.amount}
                  onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                  placeholder="0"
                  className={`${inputClass} [appearance:textfield] pl-12 text-right font-mono [&::-webkit-inner-spin-button]:appearance-none`}
                />
              </div>
              <button
                type="button"
                onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                disabled={lines.length === 1}
                aria-label={`刪除第 ${i + 1} 筆明細`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:invisible"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, newLine()])}
          className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 py-3 font-bold text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600"
        >
          ＋ 新增一筆明細
        </button>
        <FieldError message={visibleErrors.lines} />
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <span className="font-bold text-slate-500">合計</span>
          <span className="font-mono text-2xl font-black text-emerald-700 tabular-nums">{formatMoney(total)}</span>
        </div>
      </section>

      <section className={cardClass}>
        <StepTitle step={4} title="憑證上傳" hint={`${vouchers.length} 份`} />
        <label className="mb-5 block max-w-sm">
          <span className="mb-2 block text-sm font-bold text-slate-600">
            發票號碼 <span className="font-normal text-slate-400">（選填）</span>
          </span>
          <input
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
            placeholder="例如：AB-12345678"
            className={`${inputClass} font-mono`}
          />
        </label>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 transition ${
            dragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-300 bg-slate-50/60 hover:border-emerald-400 hover:bg-emerald-50/50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-md shadow-emerald-500/30">
            ↑
          </span>
          <span className="font-bold text-slate-700">點擊選擇檔案，或把檔案拖曳到這裡</span>
          <span className="text-sm text-slate-400">支援 JPG、PNG 等圖片或 PDF，單檔 {MAX_FILE_MB} MB 以內</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {fileError && <p className="mt-3 text-sm font-medium text-amber-600">{fileError}</p>}
        <FieldError message={visibleErrors.vouchers} />

        {vouchers.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {vouchers.map((v) => (
              <li key={v.id} className="group animate-pop-in relative rounded-xl bg-white p-2 ring-1 ring-slate-200">
                {v.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 使用者上傳的本機圖片
                  <img src={v.dataUrl} alt={v.name} className="aspect-square w-full rounded-lg bg-slate-50 object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-rose-50">
                    <span className="rounded-lg bg-rose-500 px-2 py-1 text-xs font-black text-white">PDF</span>
                  </div>
                )}
                <p className="mt-2 truncate text-xs font-medium text-slate-600" title={v.name}>
                  {v.name}
                </p>
                <p className="text-xs text-slate-400">{formatSize(v.size)}</p>
                <button
                  type="button"
                  onClick={() => setVouchers((prev) => prev.filter((x) => x.id !== v.id))}
                  aria-label={`移除 ${v.name}`}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-sm text-white shadow transition hover:bg-rose-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-2xl bg-slate-900/95 p-4 pl-6 text-white shadow-2xl backdrop-blur">
        <div>
          <p className="text-xs text-slate-400">請款總額</p>
          <p className="font-mono text-xl font-black tabular-nums">{formatMoney(total)}</p>
        </div>
        <button
          type="button"
          onClick={submit}
          className="rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-3 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
        >
          送出並產生請款單
        </button>
      </div>
      {showErrors && Object.keys(errors).length > 0 && (
        <p className="-mt-2 text-center text-sm font-medium text-rose-600">還有欄位沒填完整，請檢查上方紅字</p>
      )}
    </>
  );
}
