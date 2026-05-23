const tones = {
  neutral: "bg-surface-100 text-surface-700",
  brand: "bg-brand-100 text-brand-700",
  success: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
        tones[tone] || tones.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
