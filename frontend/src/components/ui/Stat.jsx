export default function Stat({ label, value, hint, tone = "neutral" }) {
  const toneText = {
    neutral: "text-surface-900",
    brand: "text-brand-700",
    success: "text-emerald-700",
    danger: "text-rose-700",
  }[tone];

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-surface-700/70">
        {label}
      </p>
      <p className={["mt-1 text-xl sm:text-2xl font-bold", toneText].join(" ")}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-surface-700/70">{hint}</p>}
    </div>
  );
}
