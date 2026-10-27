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
  if (name === "receipt") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
        <path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5-2 1.5-2.5-1.5L5 21z" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" strokeLinejoin="round" />
        <path d="M4 21V5M19 19v2H6" strokeLinejoin="round" />
        <path d="M10 8.5a2 2 0 1 1 2.5 1.9c-.4.2-.5.5-.5.9v.4M12 14h.01" strokeLinecap="round" />
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
