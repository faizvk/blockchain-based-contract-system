import { useEffect, useState } from "react";

export const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || seconds <= 0) return "Ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [
    d ? `${d}d` : null,
    h ? `${h}h` : null,
    m ? `${m}m` : null,
    `${s}s`,
  ]
    .filter(Boolean)
    .join(" ");
};

export default function useCountdown(targetEpochSec) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const i = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(i);
  }, []);

  if (!targetEpochSec) return "—";
  return formatDuration(targetEpochSec - now);
}
