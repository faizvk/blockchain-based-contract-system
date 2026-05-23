import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useWallet } from "../context/WalletContext";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";

const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || seconds <= 0) return "Ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s}s`;
};

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const { role } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/contracts")
      .then((r) => {
        if (mounted) setContracts(r.data?.contracts || []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const next = {};
      contracts.forEach((c) => {
        let status = "";
        let display = "";
        if (!c.startTime || c.startTime === 0) {
          status = "Contract";
          display = "Not started";
        } else if (c.startTime > now) {
          status = "Starts in";
          display = formatDuration(c.startTime - now);
        } else if (now < c.startTime + c.contractDuration) {
          status = "Ends in";
          display = formatDuration(c.startTime + c.contractDuration - now);
        } else {
          status = "Contract";
          display = "Ended";
        }
        next[c.contractAddress] = {
          unlock: formatDuration(c.unlockTime - now),
          grace: formatDuration(c.gracePeriodEnd - now),
          status,
          display,
        };
      });
      setTimeLeft(next);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [contracts]);

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-surface-900">
            Tenders
          </h1>
          <p className="mt-1 text-sm text-surface-700">
            Live contracts across the platform.
          </p>
        </div>
        {role === "owner" && (
          <Button onClick={() => navigate("/owner-form")}>＋ Create contract</Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-surface-200 bg-white p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2 mt-3" />
              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          title="No contracts yet"
          description="When tenders are created they'll show up here."
          action={
            role === "owner" ? (
              <Button onClick={() => navigate("/owner-form")}>Create your first contract</Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {contracts.map((c) => {
            const t = timeLeft[c.contractAddress] || {};
            const biddingOpen = t.unlock && t.unlock !== "Ended";
            return (
              <article
                key={c.contractAddress}
                className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-surface-900 line-clamp-1">
                    {c.name || "Contract"}
                  </h2>
                  <Badge tone={biddingOpen ? "success" : "neutral"}>
                    {biddingOpen ? "Open" : "Closed"}
                  </Badge>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-surface-700/80">Total budget</dt>
                    <dd className="font-medium">{c.totalBudget} ETH</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-surface-700/80">Minimum bid</dt>
                    <dd className="font-medium">{c.minimumBid} ETH</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-surface-700/80">Safety deposit</dt>
                    <dd className="font-medium">{c.safetyDepositAmount} ETH</dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-xl bg-surface-50 border border-surface-100 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-surface-700/70">Bidding ends</span>
                    <span className="font-medium monospace">{t.unlock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-700/70">Grace ends</span>
                    <span className="font-medium monospace">{t.grace}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-700/70">{t.status}</span>
                    <span className="font-medium monospace">{t.display}</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate(`/contract-details/${c.contractAddress}`)}
                  >
                    View details
                  </Button>
                  {role === "contractor" && (
                    <Button
                      fullWidth
                      onClick={() => navigate(`/offeror-form/${c.contractAddress}`)}
                    >
                      Bid
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="hidden">
          <Spinner />
        </div>
      )}
    </Container>
  );
}
