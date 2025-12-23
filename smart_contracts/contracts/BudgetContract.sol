// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BudgetContract {
    address public owner;
    uint256 public totalBudget;
    uint256 public unlockTime;
    uint256 public gracePeriod;
    uint256 public contractDuration;
    uint256 public contractStartTime;
    bool public contractStarted = false;
    mapping(address => bytes32) public commitments;
    mapping(address => uint256) public revealedOffers;

    address[] public offerors;
    bool public contractLocked = false;
    uint256 public minimumBid;
    uint256 public maxOfferors = 100;
    mapping(bytes32 => bool) public usedCommitments;
    bool public contractAccepted = false;
    bool public stateApproval = false;
    uint256 public safetyDepositAmount; // Safety deposit amount
    mapping(address => uint256) public safetyDeposits; // Track safety deposits
    address public acceptedOfferor; // Track the accepted offeror
    
  
    mapping(address => uint256) public revealTimes;

   // Events
    event ContractDeployed(
        address indexed owner,
        uint256 totalBudget,
        uint256 unlockTime,
        uint256 minimumBid,
        uint256 gracePeriod,
        uint256 contractDuration,
        uint256 safetyDepositAmount
    );
    event OfferCommitted(address indexed user, uint256 commitedOffer);
    event OfferRevealed(address indexed user, uint256 offerAmount);
    event ContractAccepted(address indexed contractor, uint256 offerAmount);
    event ContractReset(uint256 newUnlockTime);
    event NoValidOffersFound();
    event ContractLocked(address indexed lockedBy);
    event UnlockTimeUpdated(uint256 newUnlockTime);
    event GracePeriodUpdated(uint256 newGracePeriod);
    event ContractUnlocked(address indexed owner);
    event TotalBudgetUpdated(uint256 newTotalBudget);
    event MinimumBidUpdated(uint256 newMinimumBid);
    event StateApproved(address indexed approvedBy);
    event ContractStarted(uint256 startTime);
    event SafetyDepositRefunded(address indexed user, uint256 amount);
    event SafetyDepositForfeited(address indexed user, uint256 amount);

     constructor(
        uint256 _totalBudget,
        uint256 _unlockDuration,
        uint256 _minimumBid,
        uint256 _gracePeriod,
        uint256 _contractDuration,
        uint256 _safetyDepositAmount
    ) {
        require(_totalBudget > 0, "Total budget must be greater than zero");
        require(_minimumBid > 0, "Minimum bid must be greater than zero");
        require(_minimumBid <= _totalBudget, "Minimum bid cannot exceed the total budget");
        require(_unlockDuration > 0, "Unlock duration must be greater than zero");
        require(_gracePeriod > 0, "Grace period must be greater than zero");
        require(_gracePeriod <= 7 days, "Grace period is too long");
        require(_contractDuration > 0, "Contract duration must be greater than zero");
        require(_contractDuration <= 365 days, "Contract duration is too long");
        require(_safetyDepositAmount > 0, "Safety deposit amount must be greater than zero");

        owner = msg.sender;
        totalBudget = _totalBudget;
        unlockTime = block.timestamp + _unlockDuration;
        gracePeriod = _gracePeriod;
        minimumBid = _minimumBid;
        contractDuration = _contractDuration;
        safetyDepositAmount = _safetyDepositAmount;

        emit ContractDeployed(
            owner,
            totalBudget,
            unlockTime,
            minimumBid,
            gracePeriod,
            contractDuration,
            safetyDepositAmount
        );
    }

      bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call detected");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAfterUnlock() {
        require(block.timestamp >= unlockTime, "Action not allowed before unlock time");
        _;
    }

    modifier onlyAfterAccept() {
        require(contractAccepted, "Contract must be accepted first");
        _;
    }

    modifier onlyAfterStateApproval() {
        require(stateApproval, "State approval is required");
        _;
    }
      function commitOffer(bytes32 _commitment) public payable nonReentrant {
        require(block.timestamp < unlockTime, "Bidding phase is over");
        require(commitments[msg.sender] == 0, "Commitment already made");
        require(offerors.length < maxOfferors, "Maximum number of offerors reached");
        require(!usedCommitments[_commitment], "Commitment hash already used");
        require(block.timestamp < unlockTime + gracePeriod, "Grace period has ended, no new offers can be made");
        require(msg.value == safetyDepositAmount, "Incorrect safety deposit amount");
       


        commitments[msg.sender] = _commitment;
        usedCommitments[_commitment] = true;
        offerors.push(msg.sender);
        safetyDeposits[msg.sender] = msg.value; // Store the safety deposit
       

        emit OfferCommitted(msg.sender, msg.value);
    }


function revealOffer(uint256 _offerAmount, uint256 _nonce) public nonReentrant onlyAfterUnlock {
    require(!contractLocked, "Offers have already been revealed or contract is locked.");
    require(commitments[msg.sender] != 0, "No commitment found");
    require(revealedOffers[msg.sender] == 0, "Offer already revealed");

    bytes32 expectedHash = keccak256(abi.encodePacked(_offerAmount, _nonce));
    require(commitments[msg.sender] == expectedHash, "Invalid offer or nonce");

    revealedOffers[msg.sender] = _offerAmount;
    revealTimes[msg.sender] = block.timestamp;

    // Removed the best offer selection logic since it's now handled externally
    emit OfferRevealed(msg.sender, _offerAmount);
}

function acceptOffer(address _selectedOfferor) public onlyOwner nonReentrant onlyAfterUnlock {

require(!contractLocked, "Offers must be revealed before acceptance.");
        require(block.timestamp >= unlockTime + gracePeriod, "Grace period has not yet ended.");
    contractLocked = true;
    contractAccepted = true;
    acceptedOfferor = _selectedOfferor;
    
    emit ContractLocked(msg.sender);
    emit ContractAccepted(_selectedOfferor, revealedOffers[_selectedOfferor]);

    // Refund safety deposits to all offerors except the accepted one
    for (uint i = 0; i < offerors.length; i++) {
        address offeror = offerors[i];
        if (offeror != acceptedOfferor && safetyDeposits[offeror] > 0) {
            payable(offeror).transfer(safetyDeposits[offeror]);
            emit SafetyDepositRefunded(offeror, safetyDeposits[offeror]);
            safetyDeposits[offeror] = 0;
        }
    }
}

    function stateApproved() public  onlyAfterAccept {
        require(!stateApproval, "State approval has already been granted");
        stateApproval = true; // Mark the state as approved
        emit StateApproved(msg.sender); // Emit the state approval event
    }

    function startContract() public onlyOwner onlyAfterStateApproval {
        require(!contractStarted, "Contract has already started");
        contractStarted = true; // Mark the contract as started
        contractStartTime = block.timestamp; // Set the contract start time
        emit ContractStarted(contractStartTime); // Emit the contract start event
    }

    function getContractEndTime() public view returns (uint256) {
        require(contractStarted, "Contract has not started yet");
        return contractStartTime + contractDuration; // Calculate and return the contract end time
    }

      function refundAcceptedOfferorDeposit() public nonReentrant onlyAfterAccept {
        require(block.timestamp >= contractStartTime + contractDuration, "Contract has not ended yet");
        require(msg.sender == acceptedOfferor, "Only the accepted offeror can claim the deposit");

        uint256 deposit = safetyDeposits[acceptedOfferor];
        require(deposit > 0, "No deposit to refund");

        safetyDeposits[acceptedOfferor] = 0; // Reset the safety deposit
        payable(acceptedOfferor).transfer(deposit);
        emit SafetyDepositRefunded(acceptedOfferor, deposit);
    }

    function handleNoValidOffers(uint256 _extensionDuration) public onlyOwner {
        require(_extensionDuration > 0, "Extension duration must be greater than zero");
      
        require(!contractLocked, "Contract is locked and cannot be extended.");

        unlockTime += _extensionDuration;
        emit UnlockTimeUpdated(unlockTime);  // Emit event
        emit ContractReset(unlockTime);
    }

    function emergencyUnlock() public onlyOwner {
        require(contractLocked, "Contract is not locked");

        // Reset the locked state
        contractLocked = false;

        emit ContractUnlocked(msg.sender); // Emit event indicating the unlock
    }

    function resetContract(
        uint256 _newUnlockDuration,
        uint256 _newGracePeriod,
        uint256 _newTotalBudget,
        uint256 _newMinimumBid
    ) public onlyOwner nonReentrant {
        require(!contractLocked, "Cannot reset a locked contract.");
        require(_newUnlockDuration > 0, "Unlock duration must be greater than zero.");
        require(_newUnlockDuration <= 30 days, "Unlock duration is too long.");
        require(_newGracePeriod > 0, "Grace period must be greater than zero.");
        require(_newGracePeriod <= 7 days, "Grace period is too long.");
        require(_newTotalBudget > 0, "Total budget must be greater than zero.");
        require(_newMinimumBid > 0, "Minimum bid must be greater than zero.");
        require(_newMinimumBid <= _newTotalBudget, "Minimum bid cannot exceed the total budget.");

        // Reset the contract state
        contractLocked = false;
        unlockTime = block.timestamp + _newUnlockDuration;
        gracePeriod = _newGracePeriod;
        totalBudget = _newTotalBudget;
        minimumBid = _newMinimumBid;



        // Clear commitments and usedCommitments mappings
        for (uint i = 0; i < offerors.length; i++) {
            address offeror = offerors[i];
            bytes32 commitment = commitments[offeror];
            delete commitments[offeror];
            delete revealedOffers[offeror];
            delete usedCommitments[commitment]; // Reset usedCommitments for each offeror
        }

        // Clear offerors array
        delete offerors;

        // Emit events for updated parameters
        emit UnlockTimeUpdated(unlockTime);
        emit GracePeriodUpdated(gracePeriod);
        emit TotalBudgetUpdated(totalBudget); // Emit updated total budget
        emit MinimumBidUpdated(minimumBid);   // Emit updated minimum bid
        emit ContractReset(unlockTime);
    }

    function updateGracePeriod(uint256 _newGracePeriod) public onlyOwner {
        require(_newGracePeriod > 0, "Grace period must be greater than zero.");
        require(_newGracePeriod <= 7 days, "Grace period is too long.");
        gracePeriod = _newGracePeriod;
        emit GracePeriodUpdated(_newGracePeriod);
    }
}