// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title DonationTracker
 * @author Smackathon2k26 / Runtime-Crew
 * @notice An immutable, non-custodial on-chain ledger for tracking donations.
 *
 * @dev DESIGN PHILOSOPHY (why there is no withdraw/self-destruct function):
 *      This contract is intentionally NON-CUSTODIAL. It never holds funds after
 *      a transaction completes. `recordDonation` forwards the donated native
 *      currency directly to the campaign's registered beneficiary in the same
 *      transaction that creates the ledger entry. Because the contract balance
 *      is always swept to zero at the end of every successful donation, there
 *      is no pool of funds to protect, drain, or "rescue" — which removes the
 *      need for (and the risk of) any owner/admin withdraw function, pause
 *      switch, or `selfdestruct`. Every campaign's beneficiary is set exactly
 *      once (`registerCampaign`) and can never be reassigned, so the routing
 *      of funds is immutable and fully auditable from the moment a campaign
 *      is created. This is "maximum immutability" applied to a donation
 *      ledger: no admin keys, no upgrade path, no privileged functions.
 *
 *      Compiler target: Solidity ^0.8.28 (Cancun-compatible EVM). Built for
 *      Hardhat 3 (ESM) toolchains and Web3.py off-chain listeners.
 */
contract DonationTracker {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    /// @notice A single immutable donation record.
    /// @dev Stored append-only in the `donations` array; never mutated or deleted.
    struct Donation {
        address donor;      // Address that sent the donation.
        uint256 amount;     // Amount donated, in wei.
        string campaignId;  // Human-readable campaign identifier.
        uint256 timestamp;  // Block timestamp at which the donation was recorded.
    }

    // ---------------------------------------------------------------------
    // Immutable / constant state
    // ---------------------------------------------------------------------

    /// @notice Address that deployed this contract. Informational only —
    ///         carries no special privileges (no backdoor access).
    address public immutable i_deployer;

    /// @notice Unix timestamp at which this contract was deployed.
    uint256 public immutable i_deploymentTimestamp;

    /// @notice Minimum acceptable donation amount, in wei. Prevents dust /
    ///         zero-value spam entries from bloating on-chain storage.
    uint256 public constant MINIMUM_DONATION_AMOUNT = 1000 wei;

    /// @notice Maximum allowed length (in bytes) of a `campaignId` string,
    ///         bounding gas cost and storage growth per campaign.
    uint256 public constant MAX_CAMPAIGN_ID_LENGTH = 128;

    /// @notice Maximum number of records returned by a single paginated
    ///         read call, protecting callers/nodes from unbounded gas use.
    uint256 public constant MAX_PAGE_SIZE = 200;

    // ---------------------------------------------------------------------
    // Mutable storage
    // ---------------------------------------------------------------------

    /// @notice Append-only ledger of every donation ever recorded.
    /// @dev Index in this array doubles as the donation's permanent `donationId`.
    Donation[] private donations;

    /// @notice campaignHash => beneficiary address that receives donated funds.
    /// @dev campaignHash = keccak256(bytes(campaignId)). Set once, immutable thereafter.
    mapping(bytes32 => address payable) public campaignBeneficiary;

    /// @notice campaignHash => whether a campaign has been registered.
    mapping(bytes32 => bool) public isCampaignRegistered;

    /// @notice campaignHash => original human-readable campaignId string,
    ///         retained so it can be recovered on-chain from its hash.
    mapping(bytes32 => string) public campaignIdByHash;

    /// @notice campaignHash => cumulative amount (wei) raised for that campaign.
    mapping(bytes32 => uint256) public totalRaisedByCampaign;

    /// @notice donor address => list of donationIds (indices into `donations`) they made.
    mapping(address => uint256[]) private donationIdsByDonor;

    /// @notice campaignHash => list of donationIds made to that campaign.
    mapping(bytes32 => uint256[]) private donationIdsByCampaign;

    /// @notice Ordered list of every registered campaign's hash, for enumeration.
    bytes32[] private registeredCampaignHashes;

    /// @notice Cumulative amount (wei) donated across all campaigns, all time.
    uint256 public totalAmountRaised;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    /// @notice Emitted once when a campaign is registered.
    /// @param campaignHash keccak256 hash of the campaignId (indexed for filtering).
    /// @param campaignId Full human-readable campaign identifier (non-indexed, for logs/UIs).
    /// @param beneficiary Address that will receive all future donations to this campaign.
    /// @param registeredBy Address that called `registerCampaign`.
    event CampaignRegistered(
        bytes32 indexed campaignHash,
        string campaignId,
        address indexed beneficiary,
        address indexed registeredBy
    );

    /// @notice Emitted every time a donation is recorded and forwarded.
    /// @dev `campaignId` is declared `indexed`: Solidity stores the keccak256
    ///      hash of the string in the log topic (not the raw string). This lets
    ///      off-chain listeners (e.g. Web3.py `event.filter` with a known
    ///      campaignId) filter efficiently by campaign without downloading the
    ///      full log body. The raw string is still recoverable on-chain via
    ///      `campaignIdByHash[keccak256(bytes(campaignId))]` or by reading
    ///      `getDonation(donationId)`.
    /// @param donor Address that sent the donation.
    /// @param campaignId Campaign identifier the donation was made to (indexed as a hash).
    /// @param amount Amount donated, in wei.
    /// @param timestamp Block timestamp of the donation.
    /// @param donationId Permanent index of this donation in the `donations` ledger.
    event DonationRecorded(
        address indexed donor,
        string indexed campaignId,
        uint256 amount,
        uint256 timestamp,
        uint256 donationId
    );

    // ---------------------------------------------------------------------
    // Custom errors (gas-efficient reverts)
    // ---------------------------------------------------------------------

    /// @notice Thrown when `msg.value` is below `MINIMUM_DONATION_AMOUNT`.
    error InsufficientAmount(uint256 sent, uint256 minimumRequired);

    /// @notice Thrown when a supplied `campaignId` is an empty string.
    error EmptyCampaignId();

    /// @notice Thrown when a supplied `campaignId` exceeds `MAX_CAMPAIGN_ID_LENGTH`.
    error CampaignIdTooLong(uint256 length, uint256 maxLength);

    /// @notice Thrown when attempting to register a campaignId that already exists.
    error CampaignAlreadyRegistered(string campaignId);

    /// @notice Thrown when donating to, or querying, a campaignId that was never registered.
    error CampaignNotRegistered(string campaignId);

    /// @notice Thrown when registering a campaign with the zero address as beneficiary.
    error ZeroAddressBeneficiary();

    /// @notice Thrown when an index-based read is out of the ledger's bounds.
    error IndexOutOfBounds(uint256 requestedIndex, uint256 length);

    /// @notice Thrown when the low-level forwarding of funds to a beneficiary fails.
    error TransferFailed(address beneficiary, uint256 amount);

    /// @notice Thrown when a paginated read is called with an invalid range.
    error InvalidPaginationRange();

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @notice Deploys the tracker. Sets deployment metadata only — grants
    ///         no ongoing privileges to the deployer.
    constructor() {
        i_deployer = msg.sender;
        i_deploymentTimestamp = block.timestamp;
    }

    // ---------------------------------------------------------------------
    // Campaign registration
    // ---------------------------------------------------------------------

    /// @notice Registers a new campaign and permanently binds it to a beneficiary.
    /// @dev Reverts if the campaignId is empty, too long, or already registered.
    ///      Once set, `campaignBeneficiary[campaignHash]` can never be changed —
    ///      this is the contract's core immutability guarantee for fund routing.
    /// @param _campaignId Human-readable campaign identifier (e.g. "flood-relief-2026").
    /// @param _beneficiary Address that will receive every future donation to this campaign.
    function registerCampaign(string calldata _campaignId, address payable _beneficiary) external {
        uint256 idLength = bytes(_campaignId).length;
        if (idLength == 0) revert EmptyCampaignId();
        if (idLength > MAX_CAMPAIGN_ID_LENGTH) {
            revert CampaignIdTooLong(idLength, MAX_CAMPAIGN_ID_LENGTH);
        }
        if (_beneficiary == address(0)) revert ZeroAddressBeneficiary();

        bytes32 campaignHash = keccak256(bytes(_campaignId));
        if (isCampaignRegistered[campaignHash]) {
            revert CampaignAlreadyRegistered(_campaignId);
        }

        isCampaignRegistered[campaignHash] = true;
        campaignBeneficiary[campaignHash] = _beneficiary;
        campaignIdByHash[campaignHash] = _campaignId;
        registeredCampaignHashes.push(campaignHash);

        emit CampaignRegistered(campaignHash, _campaignId, _beneficiary, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Core donation function
    // ---------------------------------------------------------------------

    /// @notice Records a donation to a registered campaign and forwards the
    ///         funds directly to that campaign's beneficiary in the same transaction.
    /// @dev Follows checks-effects-interactions: all ledger/state updates happen
    ///      before the external value transfer. Because the contract never
    ///      retains a balance between transactions, reentrancy through the
    ///      beneficiary's receive/fallback cannot be used to drain accumulated
    ///      funds — each reentrant call must supply its own `msg.value`.
    /// @param _campaignId Identifier of the campaign being donated to. Must be pre-registered.
    function recordDonation(string calldata _campaignId) external payable {
        if (msg.value < MINIMUM_DONATION_AMOUNT) {
            revert InsufficientAmount(msg.value, MINIMUM_DONATION_AMOUNT);
        }

        bytes32 campaignHash = keccak256(bytes(_campaignId));
        if (!isCampaignRegistered[campaignHash]) {
            revert CampaignNotRegistered(_campaignId);
        }

        // --- Effects (state updates happen before the external call) ---
        uint256 donationId = donations.length;
        donations.push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                campaignId: _campaignId,
                timestamp: block.timestamp
            })
        );

        donationIdsByDonor[msg.sender].push(donationId);
        donationIdsByCampaign[campaignHash].push(donationId);
        totalRaisedByCampaign[campaignHash] += msg.value;
        totalAmountRaised += msg.value;

        emit DonationRecorded(msg.sender, _campaignId, msg.value, block.timestamp, donationId);

        // --- Interaction (forward funds to the immutable beneficiary) ---
        address payable beneficiary = campaignBeneficiary[campaignHash];
        (bool success, ) = beneficiary.call{value: msg.value}("");
        if (!success) revert TransferFailed(beneficiary, msg.value);
    }

    // ---------------------------------------------------------------------
    // View / read functions
    // ---------------------------------------------------------------------

    /// @notice Returns the total number of donations ever recorded.
    /// @return count Total donation count across all campaigns.
    function getDonationsCount() external view returns (uint256 count) {
        return donations.length;
    }

    /// @notice Returns a single donation record by its permanent ledger index.
    /// @param _index Index of the donation (also its `donationId`).
    /// @return donation The full `Donation` struct at `_index`.
    function getDonation(uint256 _index) external view returns (Donation memory donation) {
        if (_index >= donations.length) revert IndexOutOfBounds(_index, donations.length);
        return donations[_index];
    }

    /// @notice Returns a paginated slice of the full donation ledger.
    /// @dev Gas-bounded via `MAX_PAGE_SIZE` so callers cannot request unbounded arrays.
    /// @param _start Starting index (inclusive).
    /// @param _count Number of records to return (capped at `MAX_PAGE_SIZE`).
    /// @return page Array of `Donation` structs, length <= `_count`.
    function getDonationsPage(uint256 _start, uint256 _count)
        external
        view
        returns (Donation[] memory page)
    {
        uint256 total = donations.length;
        if (_start > total || _count == 0 || _count > MAX_PAGE_SIZE) {
            revert InvalidPaginationRange();
        }

        uint256 end = _start + _count;
        if (end > total) end = total;

        page = new Donation[](end - _start);
        for (uint256 i = _start; i < end; ++i) {
            page[i - _start] = donations[i];
        }
    }

    /// @notice Returns how many donations a given donor has made.
    /// @param _donor Donor address to query.
    /// @return count Number of donations made by `_donor`.
    function getDonorDonationCount(address _donor) external view returns (uint256 count) {
        return donationIdsByDonor[_donor].length;
    }

    /// @notice Returns the donationIds (ledger indices) belonging to a donor.
    /// @param _donor Donor address to query.
    /// @return donationIds Array of donationIds made by `_donor`.
    function getDonorDonationIds(address _donor) external view returns (uint256[] memory donationIds) {
        return donationIdsByDonor[_donor];
    }

    /// @notice Returns how many donations a campaign has received.
    /// @param _campaignId Campaign identifier to query.
    /// @return count Number of donations made to `_campaignId`.
    function getCampaignDonationCount(string calldata _campaignId) external view returns (uint256 count) {
        return donationIdsByCampaign[keccak256(bytes(_campaignId))].length;
    }

    /// @notice Returns the donationIds (ledger indices) belonging to a campaign.
    /// @param _campaignId Campaign identifier to query.
    /// @return donationIds Array of donationIds made to `_campaignId`.
    function getCampaignDonationIds(string calldata _campaignId)
        external
        view
        returns (uint256[] memory donationIds)
    {
        return donationIdsByCampaign[keccak256(bytes(_campaignId))];
    }

    /// @notice Returns the total amount (wei) raised for a given campaign.
    /// @param _campaignId Campaign identifier to query.
    /// @return total Cumulative wei raised for `_campaignId`.
    function getTotalRaisedForCampaign(string calldata _campaignId) external view returns (uint256 total) {
        return totalRaisedByCampaign[keccak256(bytes(_campaignId))];
    }

    /// @notice Returns the beneficiary address registered for a campaign.
    /// @param _campaignId Campaign identifier to query.
    /// @return beneficiary Address that receives donations to `_campaignId`.
    function getCampaignBeneficiary(string calldata _campaignId) external view returns (address beneficiary) {
        return campaignBeneficiary[keccak256(bytes(_campaignId))];
    }

    /// @notice Returns whether a campaignId has been registered.
    /// @param _campaignId Campaign identifier to query.
    /// @return registered True if the campaign exists.
    function getIsCampaignRegistered(string calldata _campaignId) external view returns (bool registered) {
        return isCampaignRegistered[keccak256(bytes(_campaignId))];
    }

    /// @notice Returns the total number of distinct registered campaigns.
    /// @return count Number of registered campaigns.
    function getRegisteredCampaignsCount() external view returns (uint256 count) {
        return registeredCampaignHashes.length;
    }

    /// @notice Returns the campaignId string registered at a given enumeration index.
    /// @dev Useful for off-chain indexers (e.g. `blockchain_bridge.py`) to enumerate
    ///      every campaign without needing prior knowledge of campaignId strings.
    /// @param _index Index into the registered-campaigns list.
    /// @return campaignId The campaignId string at `_index`.
    function getRegisteredCampaignIdAt(uint256 _index) external view returns (string memory campaignId) {
        if (_index >= registeredCampaignHashes.length) {
            revert IndexOutOfBounds(_index, registeredCampaignHashes.length);
        }
        return campaignIdByHash[registeredCampaignHashes[_index]];
    }

    /// @notice Computes the keccak256 hash used internally to key a campaignId.
    /// @dev Exposed so off-chain code (e.g. Web3.py) can independently derive
    ///      the same storage/topic key used on-chain for verification or filtering.
    /// @param _campaignId Campaign identifier to hash.
    /// @return campaignHash keccak256(bytes(_campaignId)).
    function computeCampaignHash(string calldata _campaignId) external pure returns (bytes32 campaignHash) {
        return keccak256(bytes(_campaignId));
    }
}
