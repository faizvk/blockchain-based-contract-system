export default function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-lg bg-surface-200/70",
        className,
      ].join(" ")}
    />
  );
}
