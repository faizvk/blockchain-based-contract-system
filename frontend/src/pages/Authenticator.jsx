import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import api from "../utils/api";
import { contractABI } from "../utils/contractABI";

import Container from "../components/ui/Container";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function Authenticator() {
  const [contracts, setContracts] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/contracts")
      .then(async (r) => {
        const list = r.data?.contracts || [];
        if (!mounted) return;
        setContracts(list);

        if (!window.ethereum) {
          setLoading(false);
          return;
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const next = {};
        await Promise.all(
          list.map(async (c) => {
            try {
              const contract = new ethers.Contract(c.contractAddress, contractABI, provider);
              const [approved, accepted] = await Promise.all([
                contract.stateApproval(),
                contract.contractAccepted ? contract.contractAccepted() : Promise.resolve(false),
              ]);
              next[c.contractAddress] = { approved, accepted };
            } catch {
              next[c.contractAddress] = { approved: false, accepted: false };
            }
          })
        );
        if (mounted) setStatuses(next);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const approve = async (contractAddress) => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }
    setActing(contractAddress);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.stateApproved();
      await tx.wait();
      setStatuses((s) => ({
        ...s,
        [contractAddress]: { ...(s[contractAddress] || {}), approved: true },
      }));
      toast.success("State approved");
    } catch (err) {
      toast.error(err?.reason || "Approval failed");
    } finally {
      setActing(null);
    }
  };

  const pending = contracts.filter((c) => {
    const s = statuses[c.contractAddress];
    return s?.accepted && !s?.approved;
  });
  const approved = contracts.filter((c) => statuses[c.contractAddress]?.approved);

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Authenticator
        </h1>
        <p className="mt-1 text-sm text-surface-700">
          Approve contracts that have an accepted offer and await state approval.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-surface-700">
          <Spinner size={20} /> Loading contracts…
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Pending approval</h2>
            </CardHeader>
            <CardBody>
              {pending.length === 0 ? (
                <EmptyState
                  title="Nothing pending"
                  description="All accepted contracts are already approved."
                />
              ) : (
                <ul className="divide-y divide-surface-100 -my-2">
                  {pending.map((c) => (
                    <li
                      key={c.contractAddress}
                      className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name || "Contract"}</p>
                        <p className="text-xs monospace text-surface-700/70 truncate">
                          {c.contractAddress}
                        </p>
                      </div>
                      <Button
                        onClick={() => approve(c.contractAddress)}
                        disabled={acting === c.contractAddress}
                      >
                        {acting === c.contractAddress ? "Approving…" : "Approve state"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Already approved</h2>
            </CardHeader>
            <CardBody>
              {approved.length === 0 ? (
                <p className="text-sm text-surface-700">None yet.</p>
              ) : (
                <ul className="divide-y divide-surface-100 -my-2">
                  {approved.map((c) => (
                    <li
                      key={c.contractAddress}
                      className="py-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name || "Contract"}</p>
                        <p className="text-xs monospace text-surface-700/70 truncate">
                          {c.contractAddress}
                        </p>
                      </div>
                      <Badge tone="success">Approved</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </Container>
  );
}
