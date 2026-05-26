import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

import api from "../utils/api";
import { useWallet } from "../context/WalletContext";
import { contractABI } from "../utils/contractABI";

import Container from "../components/ui/Container";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Stat from "../components/ui/Stat";

const formatDuration = (seconds) => {
  if (typeof seconds !== "number" || seconds <= 0) return "Ended";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};
const formatETH = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? "0 ETH" : `${n.toLocaleString()} ETH`;
};

export default function OfferorForm() {
  const { contractAddress } = useParams();
  const { walletAddress, userName } = useWallet();

  const [offerAmount, setOfferAmount] = useState("");
  const [nonce, setNonce] = useState("");
  const [message, setMessage] = useState("");
  const [contractDetails, setContractDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [unlockTimeLeft, setUnlockTimeLeft] = useState("");
  const [gracePeriodLeft, setGracePeriodLeft] = useState("");
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const storageKey = `uploadStatus_${contractAddress}_${walletAddress}`;

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const r = await api.get(`/api/contracts/${contractAddress}`);
        setContractDetails(r.data.contract);
      } catch {
        setMessage("Error fetching contract details");
      } finally {
        setLoading(false);
      }
    };
    if (contractAddress) fetchContract();
  }, [contractAddress]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (stored && stored.isUploaded) {
      setIsUploaded(true);
      setIpfsHash(stored.ipfsHash || "");
    }
  }, [storageKey]);

  useEffect(() => {
    if (!contractDetails.unlockTime || !contractDetails.gracePeriodEnd) return;
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      setUnlockTimeLeft(formatDuration(contractDetails.unlockTime - now));
      setGracePeriodLeft(formatDuration(contractDetails.gracePeriodEnd - now));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [contractDetails.unlockTime, contractDetails.gracePeriodEnd]);

  const isValidOfferAmount = (a) => {
    const n = Number(a);
    return (
      n >= Number(contractDetails.minimumBid || 0) &&
      n <= Number(contractDetails.totalBudget || Infinity)
    );
  };

  const checkBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(walletAddress);
      const required = ethers.parseEther(
        contractDetails.safetyDepositAmount.toString()
      );
      return balance >= required;
    } catch {
      return false;
    }
  };

  const handleCommitOffer = async (e) => {
    e.preventDefault();
    if (!contractDetails.safetyDepositAmount) {
      setCommitMessage("Error: Safety deposit amount not found.");
      return;
    }
    if (!isValidOfferAmount(offerAmount)) {
      setCommitMessage(
        `Offer must be between ${formatETH(contractDetails.minimumBid)} and ${formatETH(
          contractDetails.totalBudget
        )}`
      );
      return;
    }
    if (!(await checkBalance())) {
      setCommitMessage("Error: Insufficient balance for safety deposit.");
      return;
    }
    if (!ipfsHash) {
      setCommitMessage("Please upload a document before committing.");
      return;
    }

    setCommitMessage("Committing offer…");
    try {
      const safetyDeposit = ethers.parseEther(
        contractDetails.safetyDepositAmount.toString()
      );
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["uint256", "uint256"],
          [ethers.parseEther(offerAmount), nonce]
        )
      );

      const tx = await contract.commitOffer(commitment, { value: safetyDeposit });
      await tx.wait();

      await api.post("/api/commitments", {
        contractAddress,
        offeror: walletAddress,
        commitmentHash: commitment,
        username: userName,
        ipfsHash,
      });

      setCommitMessage("Offer committed successfully!");
    } catch (err) {
      setCommitMessage(`Error: ${err.reason || err.message}`);
    }
  };

  const handleRevealOffer = async (e) => {
    e.preventDefault();
    setMessage("Revealing offer…");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.revealOffer(ethers.parseEther(offerAmount), nonce);
      await tx.wait();
      setMessage("Offer revealed successfully!");

      await api.post("/api/revealed-offers", {
        contractAddress,
        offeror: walletAddress,
        offerAmount,
        username: userName,
      });
    } catch (err) {
      setMessage(`Error: ${err.reason || err.message}`);
    }
  };

  const handleFileChange = (e) => {
    if (!isUploaded) {
      setFile(e.target.files[0]);
      setUploadMessage("");
    }
  };

  const uploadToIPFSAndMongoDB = async () => {
    if (isUploaded) return;
    if (!file) {
      setUploadMessage("Please select a file.");
      return;
    }

    setUploading(true);
    setUploadMessage("Uploading file…");
    try {
      // 1. Upload via backend proxy (keeps Pinata JWT off the client).
      const pinForm = new FormData();
      pinForm.append("file", file, file.name);
      const ipfsResponse = await api.post("/api/pinata/upload", pinForm, {
        headers: { "Content-Type": "multipart/form-data" },
        maxBodyLength: Infinity,
      });
      const hash = ipfsResponse.data?.IpfsHash;
      if (!hash) throw new Error("Failed to upload to IPFS");
      setIpfsHash(hash);

      // 2. Persist metadata + file body to backend MongoDB.
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const u8 = new Uint8Array(reader.result);
          resolve(btoa(String.fromCharCode(...u8)));
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      const fileData = {
        filename: file.name,
        contractAddress,
        fileContent: base64,
        username: userName,
        walletAddress,
      };
      const mongoResponse = await api.post("/api/files", { file: fileData });
      if (mongoResponse.status >= 400) throw new Error("Failed to save file to MongoDB");

      setIsUploaded(true);
      setUploadMessage("File uploaded successfully!");
      toast.success("File uploaded successfully!");

      localStorage.setItem(
        storageKey,
        JSON.stringify({ isUploaded: true, ipfsHash: hash })
      );
    } catch (err) {
      setUploadMessage(`Error: ${err.message}`);
      toast.error(`Error: ${err.message}`);
    } finally {
      setUploading(false);
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

  const phase = unlockTimeLeft !== "Ended" ? "commit" : gracePeriodLeft !== "Ended" ? "reveal" : "closed";

  return (
    <Container className="py-8 sm:py-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bid on contract
          </h1>
          <p className="mt-1 text-sm text-surface-700 break-all">
            <span className="text-surface-700/70 mr-1">CA:</span>
            <span className="monospace">{contractAddress}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {walletAddress ? (
            <Badge tone="brand">
              <span className="monospace">
                {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
              </span>
            </Badge>
          ) : (
            <Badge tone="warn">Wallet not connected</Badge>
          )}
          <Badge tone={phase === "commit" ? "success" : phase === "reveal" ? "warn" : "neutral"}>
            {phase === "commit" ? "Commit phase" : phase === "reveal" ? "Reveal phase" : "Closed"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Total budget" value={formatETH(contractDetails.totalBudget)} />
        <Stat label="Minimum bid" value={formatETH(contractDetails.minimumBid)} />
        <Stat
          label="Bidding ends in"
          value={unlockTimeLeft}
          tone={unlockTimeLeft === "Ended" ? "danger" : "brand"}
        />
        <Stat
          label="Grace ends in"
          value={gracePeriodLeft}
          tone={gracePeriodLeft === "Ended" ? "danger" : "brand"}
        />
      </div>

      <Card className="mb-5">
        <CardHeader>
          <h2 className="font-semibold">
            {phase === "commit"
              ? "Commit Offer"
              : phase === "reveal"
              ? "Reveal Offer"
              : "Bidding closed"}
          </h2>
          <p className="text-xs text-surface-700/70 mt-1">
            Safety deposit required:{" "}
            <span className="font-medium text-surface-900">
              {formatETH(contractDetails.safetyDepositAmount)}
            </span>
          </p>
        </CardHeader>

        <CardBody>
          {phase === "commit" && (
            <form onSubmit={handleCommitOffer} className="space-y-5">
              <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4">
                <h3 className="font-medium">Upload document to IPFS</h3>
                <p className="text-xs text-surface-700/70 mt-1">
                  Required before committing your offer.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label
                    htmlFor="fileInput"
                    className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-white border border-surface-200 text-sm font-medium text-surface-900 cursor-pointer hover:bg-surface-100"
                  >
                    {isUploaded ? "File already uploaded" : "Choose file"}
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploaded}
                    className="sr-only"
                  />
                  {file && !isUploaded && (
                    <span className="text-xs text-surface-700 break-all">
                      Selected: {file.name}
                    </span>
                  )}
                  <div className="sm:ml-auto">
                    <Button
                      type="button"
                      onClick={uploadToIPFSAndMongoDB}
                      disabled={isUploaded || uploading}
                      variant="secondary"
                      size="sm"
                    >
                      {isUploaded ? "Uploaded" : uploading ? "Uploading…" : "Upload"}
                    </Button>
                  </div>
                </div>
                {uploadMessage && (
                  <p className="mt-3 text-xs text-surface-700">{uploadMessage}</p>
                )}
                {ipfsHash && (
                  <p className="mt-2 text-xs text-surface-700 break-all">
                    IPFS hash:{" "}
                    <a
                      className="text-brand-700 hover:text-brand-900 monospace"
                      href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ipfsHash}
                    </a>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Offer amount (ETH)"
                  type="number"
                  step="0.0001"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  required
                />
                <Input
                  label="Nonce"
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  required
                  hint="Random number you'll remember at reveal time."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button type="submit" size="lg">Commit offer</Button>
              </div>

              {commitMessage && (
                <div
                  className={[
                    "rounded-xl border text-sm px-3 py-2",
                    commitMessage.includes("Error")
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-surface-50 border-surface-200 text-surface-700",
                  ].join(" ")}
                >
                  {commitMessage}
                </div>
              )}
            </form>
          )}

          {phase === "reveal" && (
            <form onSubmit={handleRevealOffer} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Offer amount (ETH)"
                  type="number"
                  step="0.0001"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  required
                />
                <Input
                  label="Nonce"
                  type="number"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end">
                <Button type="submit" size="lg" variant="success">
                  Reveal offer
                </Button>
              </div>
            </form>
          )}

          {phase === "closed" && (
            <p className="text-surface-700">Bidding and revealing have ended.</p>
          )}
        </CardBody>
      </Card>

      {message && (
        <div
          className={[
            "rounded-xl border text-sm px-3 py-2",
            message.includes("Error")
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-surface-50 border-surface-200 text-surface-700",
          ].join(" ")}
        >
          {message}
        </div>
      )}

      <Toaster position="top-right" />
    </Container>
  );
}
