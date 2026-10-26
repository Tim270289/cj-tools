import type { ToolIconName } from "@/lib/tools";

export default function ToolIcon({ name, className }: { name: ToolIconName; className?: string }) {
  if (name === "wheel") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
        <circle cx={12} cy={13} r={8} />
        <path d="M12 13 12 5M12 13l6.9 4M12 13l-6.9 4" />
        <path d="M10 2h4l-2 3z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <circle cx={12} cy={13} r={8} />
      <path d="M12 9v4l2.5 2.5M9 2h6M12 2v3" strokeLinecap="round" />
    </svg>
  );
}
