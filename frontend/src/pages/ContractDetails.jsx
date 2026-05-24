import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import api, { API_URL } from "../utils/api";
import { useWallet } from "../context/WalletContext";
import { contractABI } from "../utils/contractABI";

import Container from "../components/ui/Container";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

const formatCountdown = (s) =>
  s <= 0
    ? "Ended"
    : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;

export default function ContractDetails() {
  const { contractAddress } = useParams();
  const { walletAddress, role } = useWallet();

  const isOwner = role === "owner";
  const isAuthenticator = role === "authenticator";

  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isStateApproved, setIsStateApproved] = useState(false);
  const [isContractStarted, setIsContractStarted] = useState(false);
  const [contractStartTime, setContractStartTime] = useState(null);

  const [unlockTimeLeft, setUnlockTimeLeft] = useState("");
  const [gracePeriodEndLeft, setGracePeriodEndLeft] = useState("");
  const [contractDurationLeft, setContractDurationLeft] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);

  const [commitments, setCommitments] = useState([]);
  const [revealedOffers, setRevealedOffers] = useState([]);

  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [txStatus, setTxStatus] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await api.get(`/api/contracts/${contractAddress}`);
        setContractData(res.data.contract);

        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(contractAddress, contractABI, provider);
          setIsStateApproved(await contract.stateApproval());
          const started = await contract.contractStarted();
          setIsContractStarted(started);
          if (started) {
            setContractStartTime(Number(await contract.contractStartTime()));
          }
        }
      } catch {
        setError("Failed to load contract");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [contractAddress]);

  useEffect(() => {
    api
      .get(`/api/files/contract/${contractAddress}`)
      .then((r) => setUploadedFiles(r.data?.files || []))
      .catch(() => {})
      .finally(() => setFilesLoading(false));
  }, [contractAddress]);

  useEffect(() => {
    api
      .get(`/api/commitments/${contractAddress}`)
      .then((r) => setCommitments(r.data?.commitments || []))
      .catch(() => {});
  }, [contractAddress]);

  useEffect(() => {
    api
      .get(`/api/revealed-offers/${contractAddress}`)
      .then((r) => setRevealedOffers(r.data?.revealedOffers || []))
      .catch(() => {});
  }, [contractAddress]);

  useEffect(() => {
    if (!contractData) return;
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setUnlockTimeLeft(formatCountdown(contractData.unlockTime - now));
      setGracePeriodEndLeft(formatCountdown(contractData.gracePeriodEnd - now));
      if (isContractStarted && contractStartTime) {
        setContractDurationLeft(
          formatCountdown(contractStartTime + contractData.contractDuration - now)
        );
      }
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [contractData, isContractStarted, contractStartTime]);

  const handleDownloadFile = async (fileId, filename) => {
    try {
      const res = await fetch(`${API_URL}/api/files/${fileId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleAnalyzeBids = async () => {
    if (!uploadedFiles.length) {
      toast.error("No documents to analyze");
      return;
    }
    setAnalysisLoading(true);

    const formData = new FormData();
    formData.append("requirements", contractData.description);
    for (const f of uploadedFiles) {
      const blob = await fetch(`${API_URL}/api/files/${f._id}`).then((r) => r.blob());
      formData.append("bids", blob, f.filename);
    }

    try {
      const res = await fetch(`${API_URL}/api/analyze-bids`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setAnalysisResult(data.data);
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const winningFile =
    analysisResult &&
    uploadedFiles.find((f) => f.filename === analysisResult.bestBid?.filename);

  const withSigner = async () => {
    if (!window.ethereum) throw new Error("MetaMask not detected");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  const handleAcceptOffer = async (offerorAddress) => {
    try {
      setTxStatus("Processing transaction…");
      const contract = await withSigner();
      const tx = await contract.acceptOffer(offerorAddress);
      await tx.wait();
      toast.success("Offer accepted");
      setTxStatus("Offer accepted");
    } catch {
      toast.error("Failed to accept offer");
      setTxStatus("Transaction failed");
    }
  };

  const handleStartContract = async () => {
    try {
      setTxStatus("Starting contract…");
      const contract = await withSigner();
      const tx = await contract.startContract();
      await tx.wait();

      const startTime = Number(await contract.contractStartTime());
      setContractStartTime(startTime);
      setIsContractStarted(true);

      try {
        await api.post(`/api/contracts/${contractAddress}/start`, { startTime });
      } catch {
        /* non-fatal — UI still reflects on-chain truth */
      }

      toast.success("Contract started");
      setTxStatus("Contract started");
    } catch {
      toast.error("Failed to start contract");
      setTxStatus("Transaction failed");
    }
  };

  const handleClaimRefund = async () => {
    try {
      setTxStatus("Claiming refund…");
      const contract = await withSigner();
      const tx = await contract.refundAcceptedOfferorDeposit();
      await tx.wait();
      toast.success("Refund claimed");
      setTxStatus("Refund claimed");
    } catch (err) {
      toast.error(err?.reason || "Failed to claim refund");
      setTxStatus("Transaction failed");
    }
  };

  const handleEmergencyUnlock = async () => {
    try {
      setTxStatus("Emergency unlocking…");
      const contract = await withSigner();
      const tx = await contract.emergencyUnlock();
      await tx.wait();
      toast.success("Contract unlocked");
      setTxStatus("Contract unlocked");
    } catch {
      toast.error("Emergency unlock failed");
      setTxStatus("Transaction failed");
    }
  };

  const handleStateApproval = async () => {
    try {
      setTxStatus("Approving state…");
      const contract = await withSigner();
      const tx = await contract.stateApproved();
      await tx.wait();
      toast.success("State approved");
      setIsStateApproved(true);
      setTxStatus("State approved");
    } catch {
      toast.error("Failed to approve state");
      setTxStatus("Transaction failed");
    }
  };

  if (loading) {
    return (
      <Container className="py-16 flex items-center justify-center">
        <Spinner size={28} />
        <span className="ml-3 text-surface-700">Loading contract…</span>
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="py-10">
        <Card>
          <CardBody>
            <p className="text-rose-700">{error}</p>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Contract details
          </h1>
          {walletAddress && (
            <p className="mt-1 text-sm text-surface-700">
              Wallet:{" "}
              <span className="monospace">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={contractData.contractLocked ? "warn" : "success"}>
            {contractData.contractLocked ? "Locked" : "Open"}
          </Badge>
          <Badge tone={isStateApproved ? "success" : "neutral"}>
            {isStateApproved ? "State approved" : "Awaiting approval"}
          </Badge>
          <Badge tone={isContractStarted ? "brand" : "neutral"}>
            {isContractStarted ? "Started" : "Not started"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Information</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-surface-700/80">Contract address</span>
              <span className="monospace break-all">{contractData.contractAddress}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-surface-700/80">IPFS CID</span>
              <span className="monospace break-all">{contractData.cid}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-surface-700/80">Total budget</span>
              <span className="font-medium">{contractData.totalBudget} ETH</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Timings</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-700/80">Bidding ends</span>
              <span
                className={`monospace ${unlockTimeLeft === "Ended" ? "text-rose-600" : "text-surface-900"}`}
              >
                {unlockTimeLeft}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-700/80">Grace ends</span>
              <span
                className={`monospace ${gracePeriodEndLeft === "Ended" ? "text-rose-600" : "text-surface-900"}`}
              >
                {gracePeriodEndLeft}
              </span>
            </div>
            {isContractStarted && (
              <div className="flex justify-between">
                <span className="text-surface-700/80">Contract ends</span>
                <span className="monospace">{contractDurationLeft}</span>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-semibold">Commitments</h2>
            <p className="text-xs text-surface-700/70 mt-1">
              Sealed bids submitted on-chain.
            </p>
          </CardHeader>
          <CardBody>
            {commitments.length === 0 ? (
              <p className="text-sm text-surface-700">No commitments yet.</p>
            ) : (
              <ul className="divide-y divide-surface-100 -my-2">
                {commitments.map((c) => (
                  <li
                    key={c._id || c.commitmentHash}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {c.username || "Anonymous"}
                      </p>
                      <p className="text-xs text-surface-700/70 monospace truncate">
                        {c.offeror}
                      </p>
                    </div>
                    {c.ipfsHash && (
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${c.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-700 hover:text-brand-900 monospace break-all"
                      >
                        IPFS
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-semibold">Revealed offers</h2>
            <p className="text-xs text-surface-700/70 mt-1">
              {isOwner
                ? "Accept the winning offer once the grace period has ended."
                : "Visible after each bidder reveals their amount."}
            </p>
          </CardHeader>
          <CardBody>
            {revealedOffers.length === 0 ? (
              <p className="text-sm text-surface-700">No offers revealed yet.</p>
            ) : (
              <ul className="divide-y divide-surface-100 -my-2">
                {[...revealedOffers]
                  .sort((a, b) => Number(a.offerAmount) - Number(b.offerAmount))
                  .map((o) => {
                    const isWinnerSuggestion =
                      analysisResult?.bestBid &&
                      winningFile?.walletAddress?.toLowerCase() ===
                        o.offeror?.toLowerCase();
                    return (
                      <li
                        key={o._id || o.offeror}
                        className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">
                              {o.username || "Anonymous"}
                            </p>
                            {isWinnerSuggestion && (
                              <Badge tone="brand">Suggested winner</Badge>
                            )}
                          </div>
                          <p className="text-xs text-surface-700/70 monospace truncate">
                            {o.offeror}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold monospace">
                            {Number(o.offerAmount).toLocaleString()} ETH
                          </span>
                          {isOwner && !contractData.contractLocked && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleAcceptOffer(o.offeror)}
                            >
                              Accept
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="font-semibold">Uploaded documents</h2>
          </CardHeader>
          <CardBody>
            {filesLoading ? (
              <Spinner size={20} />
            ) : uploadedFiles.length === 0 ? (
              <p className="text-sm text-surface-700">No documents uploaded.</p>
            ) : (
              <ul className="divide-y divide-surface-100 -my-2">
                {uploadedFiles.map((file) => (
                  <li
                    key={file._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{file.filename}</p>
                      {file.username && (
                        <p className="text-xs text-surface-700/70">
                          by {file.username}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadFile(file._id, file.filename)}
                    >
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {isOwner && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <h2 className="font-semibold">Owner controls</h2>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAnalyzeBids} disabled={analysisLoading}>
                  {analysisLoading ? "Analyzing…" : "Analyze bids"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    winningFile &&
                    handleAcceptOffer({
                      offeror: winningFile.walletAddress,
                      offerAmount: analysisResult?.bestBid?.offerAmount || 0,
                    })
                  }
                  disabled={!analysisResult}
                >
                  Accept offer
                </Button>
                {isStateApproved && (
                  <Button variant="success" onClick={handleStartContract}>
                    Start contract
                  </Button>
                )}
                {contractData.contractLocked && (
                  <Button variant="danger" onClick={handleEmergencyUnlock}>
                    Emergency unlock
                  </Button>
                )}
              </div>

              {analysisResult && (
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm">
                  <h3 className="font-semibold text-brand-900">Analysis result</h3>
                  <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <dt className="text-brand-700/80 text-xs uppercase tracking-wider">
                        Winning file
                      </dt>
                      <dd className="font-medium">{analysisResult.bestBid.filename}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-700/80 text-xs uppercase tracking-wider">
                        Offeror
                      </dt>
                      <dd className="font-medium">{winningFile?.username || "Unknown"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-brand-700/80 text-xs uppercase tracking-wider">
                        Wallet
                      </dt>
                      <dd className="monospace break-all">
                        {winningFile?.walletAddress || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-700/80 text-xs uppercase tracking-wider">
                        Qualified bids
                      </dt>
                      <dd className="font-medium">{analysisResult.qualifiedBids}</dd>
                    </div>
                  </dl>
                  {winningFile && (
                    <Button
                      className="mt-4"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleDownloadFile(winningFile._id, winningFile.filename)
                      }
                    >
                      Download winning bid
                    </Button>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {isAuthenticator && !isStateApproved && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <h2 className="font-semibold">Authenticator action</h2>
              <p className="text-xs text-surface-700/70 mt-1">
                Approve state after the owner has accepted a winning offer.
              </p>
            </CardHeader>
            <CardBody>
              <Button onClick={handleStateApproval}>Approve state</Button>
            </CardBody>
          </Card>
        )}

        {role === "contractor" && isContractStarted && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <h2 className="font-semibold">Claim your safety deposit</h2>
              <p className="text-xs text-surface-700/70 mt-1">
                Only the accepted offeror can claim, and only after the contract
                duration has ended.
              </p>
            </CardHeader>
            <CardBody>
              <Button variant="secondary" onClick={handleClaimRefund}>
                Claim refund
              </Button>
            </CardBody>
          </Card>
        )}
      </div>

      {txStatus && (
        <div className="mt-6 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700">
          {txStatus}
        </div>
      )}
    </Container>
  );
}
