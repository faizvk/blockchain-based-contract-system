export default function Spinner({ size = 24, className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={[
        "inline-block animate-spin rounded-full border-2",
        "border-brand-200 border-t-brand-600",
        className,
      ].join(" ")}
    />
  );
}
