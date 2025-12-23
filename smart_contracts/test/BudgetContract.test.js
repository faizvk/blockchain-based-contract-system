const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("BudgetContract", function () {
  let BudgetContract;
  let budgetContract;
  let owner;
  let user1;
  let user2;

  // Define test parameters
  const unlockDuration = 60; // 60 seconds for testing
  const totalBudget = ethers.utils.parseEther("1000");
  const minimumBid = ethers.utils.parseEther("200");
  const gracePeriod = 30; // 30 seconds grace period
  const contractDuration = 120; // Contract duration (120 seconds)
  const safetyDepositAmount = ethers.utils.parseEther("1");

  const validGracePeriod = 60 * 60; // 1 hour in seconds
  const zeroGracePeriod = 0;
  const excessiveGracePeriod = 7 * 24 * 60 * 60 + 1; // 7 days + 1 second

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    BudgetContract = await ethers.getContractFactory("BudgetContract");

    budgetContract = await BudgetContract.deploy(
      totalBudget,
      unlockDuration,
      minimumBid,
      gracePeriod,
      contractDuration,
      safetyDepositAmount
    );
    await budgetContract.deployed();
  });

  it("Should set the correct owner and parameters", async function () {
    expect(await budgetContract.owner()).to.equal(owner.address);
    expect(await budgetContract.totalBudget()).to.equal(totalBudget);
    expect(await budgetContract.unlockTime()).to.be.gte(
      Math.floor(Date.now() / 1000)
    );
  });

  it("Should allow users to commit offers", async function () {
    const nonce1 = 12345;
    const nonce2 = 67890;
    const offer1 = ethers.utils.parseEther("500");
    const offer2 = ethers.utils.parseEther("400");

    const commitment1 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer1, nonce1]
      )
    );
    const commitment2 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer2, nonce2]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment1, { value: safetyDepositAmount });
    await budgetContract
      .connect(user2)
      .commitOffer(commitment2, { value: safetyDepositAmount });

    expect(await budgetContract.commitments(user1.address)).to.equal(
      commitment1
    );
    expect(await budgetContract.commitments(user2.address)).to.equal(
      commitment2
    );
  });

  it("Should not allow duplicate commitments", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("500");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });

    await expect(
      budgetContract
        .connect(user1)
        .commitOffer(commitment, { value: safetyDepositAmount })
    ).to.be.revertedWith("Commitment already made");
  });

  it("Should not allow commitments after unlock time", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("500");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");

    await expect(
      budgetContract
        .connect(user1)
        .commitOffer(commitment, { value: safetyDepositAmount })
    ).to.be.revertedWith("Bidding phase is over");
  });

  it("Should allow users to reveal offers after unlock time", async function () {
    const nonce1 = 12345;
    const nonce2 = 67890;
    const offer1 = ethers.utils.parseEther("500");
    const offer2 = ethers.utils.parseEther("400");

    const commitment1 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer1, nonce1]
      )
    );
    const commitment2 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer2, nonce2]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment1, { value: safetyDepositAmount });
    await budgetContract
      .connect(user2)
      .commitOffer(commitment2, { value: safetyDepositAmount });

    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(user1).revealOffer(offer1, nonce1);
    await budgetContract.connect(user2).revealOffer(offer2, nonce2);

    expect(await budgetContract.revealedOffers(user1.address)).to.equal(offer1);
    expect(await budgetContract.revealedOffers(user2.address)).to.equal(offer2);
    // Removed bestOfferor and lowestOffer checks since they're no longer tracked
  });

  it("Should reject invalid reveals", async function () {
    const nonce = 12345;
    const validOffer = ethers.utils.parseEther("500");
    const invalidOffer = ethers.utils.parseEther("600");

    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [validOffer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });

    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");

    await expect(
      budgetContract.connect(user1).revealOffer(invalidOffer, nonce)
    ).to.be.revertedWith("Invalid offer or nonce");
  });

  it("Should allow the owner to accept a selected offeror", async function () {
    const nonce1 = 12345;
    const nonce2 = 67890;
    const offer1 = ethers.utils.parseEther("500");
    const offer2 = ethers.utils.parseEther("400");

    const commitment1 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer1, nonce1]
      )
    );
    const commitment2 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer2, nonce2]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment1, { value: safetyDepositAmount });
    await budgetContract
      .connect(user2)
      .commitOffer(commitment2, { value: safetyDepositAmount });

    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(user1).revealOffer(offer1, nonce1);
    await budgetContract.connect(user2).revealOffer(offer2, nonce2);

    await network.provider.send("evm_increaseTime", [gracePeriod + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(owner).acceptOffer(user2.address);

    const events = await budgetContract.queryFilter("ContractAccepted");
    expect(events.length).to.equal(1);
    expect(events[0].args.contractor).to.equal(user2.address);
    expect(events[0].args.offerAmount).to.equal(offer2);
  });

  it("Should not allow offer acceptance before grace period ends", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("400");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });

    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(user1).revealOffer(offer, nonce);

    await expect(
      budgetContract.connect(owner).acceptOffer(user1.address)
    ).to.be.revertedWith("Grace period has not yet ended");
  });

  it("Should reject acceptOffer with invalid offeror", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("400");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });

    await network.provider.send("evm_increaseTime", [
      unlockDuration + gracePeriod + 1,
    ]);
    await network.provider.send("evm_mine");

    await expect(
      budgetContract.connect(owner).acceptOffer(user2.address) // user2 never committed
    ).to.be.revertedWith("Selected offeror has not revealed an offer");
  });

  it("Should update the grace period when given a valid value", async function () {
    const tx = await budgetContract.updateGracePeriod(validGracePeriod);
    await expect(tx)
      .to.emit(budgetContract, "GracePeriodUpdated")
      .withArgs(validGracePeriod);

    expect(await budgetContract.gracePeriod()).to.equal(validGracePeriod);
  });

  it("Should revert when grace period is set to zero", async function () {
    await expect(
      budgetContract.updateGracePeriod(zeroGracePeriod)
    ).to.be.revertedWith("Grace period must be greater than zero.");
  });

  it("Should revert when grace period exceeds 7 days", async function () {
    await expect(
      budgetContract.updateGracePeriod(excessiveGracePeriod)
    ).to.be.revertedWith("Grace period is too long.");
  });

  it("Should measure gas consumption for commitOffer", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("500");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    const tx = await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });
    const receipt = await tx.wait();
    console.log("Gas used for commitOffer:", receipt.gasUsed.toString());
  });

  it("should allow the owner to unlock the contract in an emergency", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("250");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });
    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");
    await budgetContract.connect(user1).revealOffer(offer, nonce);
    await network.provider.send("evm_increaseTime", [gracePeriod + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(owner).acceptOffer(user1.address);
    expect(await budgetContract.contractLocked()).to.be.true;

    await budgetContract.connect(owner).emergencyUnlock();
    expect(await budgetContract.contractLocked()).to.be.false;
  });

  it("should not allow non-owners to unlock the contract", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("250");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });
    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");
    await budgetContract.connect(user1).revealOffer(offer, nonce);
    await network.provider.send("evm_increaseTime", [gracePeriod + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(owner).acceptOffer(user1.address);
    expect(await budgetContract.contractLocked()).to.be.true;

    await expect(
      budgetContract.connect(user1).emergencyUnlock()
    ).to.be.revertedWith("Only owner can call this function");
  });

  it("should revert if the contract is not locked when trying to unlock", async function () {
    expect(await budgetContract.contractLocked()).to.be.false;
    await expect(
      budgetContract.connect(owner).emergencyUnlock()
    ).to.be.revertedWith("Contract is not locked");
  });

  it("should emit an event when the contract is unlocked", async function () {
    const nonce = 12345;
    const offer = ethers.utils.parseEther("250");
    const commitment = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [offer, nonce]
      )
    );

    await budgetContract
      .connect(user1)
      .commitOffer(commitment, { value: safetyDepositAmount });
    await network.provider.send("evm_increaseTime", [unlockDuration + 1]);
    await network.provider.send("evm_mine");
    await budgetContract.connect(user1).revealOffer(offer, nonce);
    await network.provider.send("evm_increaseTime", [gracePeriod + 1]);
    await network.provider.send("evm_mine");

    await budgetContract.connect(owner).acceptOffer(user1.address);
    expect(await budgetContract.contractLocked()).to.be.true;

    const tx = await budgetContract.connect(owner).emergencyUnlock();
    expect(await budgetContract.contractLocked()).to.be.false;

    const receipt = await tx.wait();
    const event = receipt.events?.find((e) => e.event === "ContractUnlocked");
    expect(event).to.not.be.undefined;
    expect(event.args.owner).to.equal(owner.address);
  });
});
