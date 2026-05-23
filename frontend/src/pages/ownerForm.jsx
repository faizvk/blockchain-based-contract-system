import { useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../context/WalletContext";
import api, { API_URL } from "../utils/api";
import { contractABI } from "../utils/contractABI";
import { contractBytecode } from "../utils/contractBytecode";

import Container from "../components/ui/Container";
import { Card, CardBody, CardHeader, CardFooter } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const daysToSeconds = (days) => Math.floor(Number(days) * 24 * 60 * 60);

export default function OwnerControlForm() {
  const { walletAddress } = useWallet();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalBudget: "",
    unlockDurationDays: "",
    minimumBid: "",
    gracePeriodDays: "",
    safetyDepositAmount: "",
    contractDurationDays: "",
  });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const setStatus = (msg, t = "neutral") => {
    setMessage(msg);
    setTone(t);
  };

  const handleStoreData = async (dataToStore) => {
    try {
      const deploymentTimestamp = Math.floor(Date.now() / 1000);
      const unlockTime = deploymentTimestamp + dataToStore.unlockDuration;
      const gracePeriodEnd = unlockTime + dataToStore.gracePeriod;

      const body = {
        ...dataToStore,
        unlockTime,
        gracePeriodEnd,
        unlockDurationDays: formData.unlockDurationDays,
        gracePeriodDays: formData.gracePeriodDays,
        contractDurationDays: formData.contractDurationDays,
      };

      const res = await fetch(`${API_URL}/api/storeContractData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error || "Failed to store contract data"}`, "error");
      }
    } catch {
      setStatus("Network Error: Unable to connect to server.", "error");
    }
  };

  const handleDeployContract = async (e) => {
    e.preventDefault();
    setStatus("Deploying contract…", "neutral");

    if (!walletAddress) {
      setStatus("Connect wallet first.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const balance = await provider.getBalance(signerAddress);
      if (balance < ethers.parseEther("0.1")) {
        throw new Error("Insufficient balance for deployment.");
      }

      const unlockDurationSeconds = daysToSeconds(formData.unlockDurationDays);
      const gracePeriodSeconds = daysToSeconds(formData.gracePeriodDays);
      const contractDurationSeconds = daysToSeconds(formData.contractDurationDays);

      const factory = new ethers.ContractFactory(contractABI, contractBytecode, signer);
      const contract = await factory.deploy(
        ethers.parseEther(formData.totalBudget.toString()),
        unlockDurationSeconds,
        ethers.parseEther(formData.minimumBid.toString()),
        gracePeriodSeconds,
        contractDurationSeconds,
        ethers.parseEther(formData.safetyDepositAmount.toString())
      );

      setStatus(`Success: Contract deployed at ${contract.target}`, "success");

      const deploymentTimestamp = Math.floor(Date.now() / 1000);
      const unlockTime = deploymentTimestamp + unlockDurationSeconds;
      const gracePeriodEnd = unlockTime + gracePeriodSeconds;

      await handleStoreData({
        name: formData.name,
        description: formData.description,
        totalBudget: formData.totalBudget,
        minimumBid: formData.minimumBid,
        safetyDepositAmount: formData.safetyDepositAmount,
        contractAddress: contract.target,
        unlockDuration: unlockDurationSeconds,
        gracePeriod: gracePeriodSeconds,
        contractDuration: contractDurationSeconds,
        unlockTime,
        gracePeriodEnd,
      });
    } catch (err) {
      const rejected =
        err.code === 4001 ||
        err?.error?.code === 4001 ||
        err?.info?.error?.code === 4001;
      setStatus(
        rejected ? "Transaction rejected by user." : `Error: ${err.message}`,
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!walletAddress) {
    return (
      <Container className="py-10">
        <Card>
          <CardBody>
            <p className="text-surface-700">Please connect your wallet first.</p>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Create a contract
        </h1>
        <p className="mt-1 text-sm text-surface-700">
          Set tender parameters. All durations are in days (decimals allowed).
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Tender parameters</h2>
        </CardHeader>

        <form onSubmit={handleDeployContract}>
          <CardBody className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contract name"
                name="name"
                placeholder="Phase II construction"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Total budget (ETH)"
                type="number"
                step="0.0001"
                name="totalBudget"
                value={formData.totalBudget}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Unlock duration (days)"
                type="number"
                step="0.0001"
                name="unlockDurationDays"
                value={formData.unlockDurationDays}
                onChange={handleInputChange}
                hint="0.00139 ≈ 2 minutes"
                required
              />
              <Input
                label="Minimum bid (ETH)"
                type="number"
                step="0.0001"
                name="minimumBid"
                value={formData.minimumBid}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Grace period (days)"
                type="number"
                step="0.0001"
                name="gracePeriodDays"
                value={formData.gracePeriodDays}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Safety deposit (ETH)"
                type="number"
                step="0.0001"
                name="safetyDepositAmount"
                value={formData.safetyDepositAmount}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Contract duration (days)"
                type="number"
                step="0.0001"
                name="contractDurationDays"
                value={formData.contractDurationDays}
                onChange={handleInputChange}
                required
                className="sm:col-span-2 lg:col-span-1"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-surface-700 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Detailed tender requirements…"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                required
                className="block w-full rounded-xl bg-white border border-surface-200 px-3.5 py-3 text-surface-900 shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
              />
            </div>

            {message && (
              <div
                className={[
                  "rounded-xl border text-sm px-3 py-2",
                  tone === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : tone === "error"
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-surface-50 border-surface-200 text-surface-700",
                ].join(" ")}
              >
                {message}
              </div>
            )}
          </CardBody>

          <CardFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? "Deploying…" : "Deploy contract"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Container>
  );
}
