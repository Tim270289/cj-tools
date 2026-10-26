export default function StepTitle({
  step,
  title,
  hint,
}: {
  step: number;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
        {step}
      </span>
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      {hint && <span className="ml-auto text-sm text-slate-400">{hint}</span>}
    </div>
  );
}
