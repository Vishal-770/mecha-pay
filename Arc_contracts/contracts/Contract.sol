// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IERC1271 {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4);
}

/**
 * @title SubscriptionGateway
 * @dev High-scalability subscription gateway optimized for the Arc network.
 * Supports multiple pricing tiers per plan.
 */
contract SubscriptionGateway {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC;
    address public owner;
    uint256 public feeBps = 250; // 2.5% default

    uint256 public planNonce;

    // Track last timestamp to ensure monotonicity on networks like Arc
    uint32 public lastSubTimestamp;

    // -------------------- EIP-712 & AUTOPAY STATE --------------------

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public constant AUTHORIZE_SESSION_KEY_TYPEHASH = keccak256(
        "AuthorizeSessionKey(address subscriber,address sessionPublicKey,bytes32 planId,uint256 tierId,uint256 maxCycles,uint256 deadline)"
    );

    // Tracks the number of executed cycles for a subscriber to a plan
    mapping(bytes32 => mapping(address => uint256)) public executedCycles;
    // Tracks the next allowed execution timestamp for a subscriber to a plan
    mapping(bytes32 => mapping(address => uint256)) public nextAllowedTimestamp;

    // -------------------- STRUCTS & STORAGE --------------------

    struct Tier {
        uint256 price;
        string label; // "Basic", "Plus", "Pro"
        bool active;
    }

    struct Plan {
        address seller;
        uint32 duration; // In seconds
        string ipfsHash; // Metadata for the entire plan suite
        bool active;
        uint256 tierCount;
        mapping(uint256 => Tier) tiers;
    }

    mapping(bytes32 => Plan) public plans;

    // -------------------- EVENTS --------------------

    event PlanCreated(
        bytes32 indexed planId,
        address indexed seller,
        uint32 duration,
        string ipfsHash
    );

    event TierAdded(
        bytes32 indexed planId,
        uint256 tierId,
        uint256 price,
        string label
    );

    event PlanStatusUpdated(bytes32 indexed planId, bool active);
    
    event PlanUpdated(
        bytes32 indexed planId,
        uint32 duration,
        string ipfsHash
    );

    event Subscribed(
        address indexed subscriber,
        address indexed seller,
        bytes32 indexed planId,
        uint256 tierId,
        uint256 totalAmount,
        uint256 feeAmount,
        string buyerData,
        uint32 startTime,
        uint32 endTime
    );

    event FeeUpdated(uint256 newFeeBps);
    event OwnerUpdated(address indexed newOwner);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // -------------------- CONSTRUCTOR --------------------

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC");
        USDC = IERC20(_usdc);
        owner = msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("MechaPay Subscription Gateway")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    // -------------------- PLAN MANAGEMENT --------------------

    /**
     * @notice Create a plan with initial tiers
     */
    function createPlan(
        uint32 duration,
        string calldata ipfsHash,
        uint256[] calldata prices,
        string[] calldata labels
    ) external returns (bytes32 planId) {
        require(duration > 0, "Duration must be > 0");
        require(prices.length == labels.length, "Mismatched tiers");
        require(prices.length > 0, "At least one tier required");

        planNonce++;
        planId = keccak256(abi.encode(msg.sender, planNonce));

        Plan storage newPlan = plans[planId];
        newPlan.seller = msg.sender;
        newPlan.duration = duration;
        newPlan.ipfsHash = ipfsHash;
        newPlan.active = true;

        emit PlanCreated(planId, msg.sender, duration, ipfsHash);

        for (uint256 i = 0; i < prices.length; i++) {
            _addTier(planId, prices[i], labels[i]);
        }
    }

    function addTierToPlan(bytes32 planId, uint256 price, string calldata label) external {
        require(plans[planId].seller == msg.sender, "Not the seller");
        _addTier(planId, price, label);
    }

    function _addTier(bytes32 planId, uint256 price, string memory label) internal {
        require(price > 0, "Price must be > 0");
        Plan storage plan = plans[planId];
        uint256 tierId = plan.tierCount++;
        plan.tiers[tierId] = Tier(price, label, true);
        emit TierAdded(planId, tierId, price, label);
    }

    function setPlanStatus(bytes32 planId, bool active) external {
        Plan storage plan = plans[planId];
        require(plan.seller == msg.sender, "Not the seller");
        plan.active = active;
        emit PlanStatusUpdated(planId, active);
    }

    function updatePlanMetadata(
        bytes32 planId,
        uint32 duration,
        string calldata ipfsHash
    ) external {
        Plan storage plan = plans[planId];
        require(plan.seller == msg.sender, "Not the seller");
        
        plan.duration = duration;
        plan.ipfsHash = ipfsHash;
        
        emit PlanUpdated(planId, duration, ipfsHash);
    }

    // -------------------- CORE LOGIC --------------------

    function subscribe(bytes32 planId, uint256 tierId, string calldata buyerData) external {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan is inactive");
        
        require(tierId < plan.tierCount, "Invalid tier");
        Tier storage tier = plan.tiers[tierId];
        require(tier.active, "Tier is inactive");

        uint256 totalAmount = tier.price;
        uint256 feeAmount = (totalAmount * feeBps) / 10000;
        uint256 sellerAmount = totalAmount - feeAmount;

        if (feeAmount > 0) {
            USDC.safeTransferFrom(msg.sender, address(this), feeAmount);
        }
        USDC.safeTransferFrom(msg.sender, plan.seller, sellerAmount);

        uint32 startTime = uint32(block.timestamp) > lastSubTimestamp 
            ? uint32(block.timestamp) 
            : lastSubTimestamp;
        
        lastSubTimestamp = startTime;
        uint32 endTime = startTime + plan.duration;

        // Initialize/increment cycle tracking
        executedCycles[planId][msg.sender] = executedCycles[planId][msg.sender] + 1;
        nextAllowedTimestamp[planId][msg.sender] = endTime;

        emit Subscribed(
            msg.sender,
            plan.seller,
            planId,
            tierId,
            totalAmount,
            feeAmount,
            buyerData,
            startTime,
            endTime
        );
    }

    /**
     * @notice Execute a subscription renewal using an off-chain EIP-712 pre-authorization signature.
     * @dev Validates the signature against the subscriber smart account using ERC-1271.
     */
    function subscribeWithSignature(
        address subscriber,
        address sessionPublicKey,
        bytes32 planId,
        uint256 tierId,
        uint256 maxCycles,
        uint256 deadline,
        bytes calldata signature,
        string calldata buyerData
    ) external {
        require(msg.sender == sessionPublicKey, "Invalid session key");
        require(block.timestamp <= deadline, "Signature expired");

        Plan storage plan = plans[planId];
        require(plan.active, "Plan is inactive");
        require(tierId < plan.tierCount, "Invalid tier");
        Tier storage tier = plan.tiers[tierId];
        require(tier.active, "Tier is inactive");

        uint256 currentCycle = executedCycles[planId][subscriber];
        require(currentCycle < maxCycles, "Max cycles reached");
        require(block.timestamp >= nextAllowedTimestamp[planId][subscriber], "Too early for next cycle");

        // Construct EIP-712 message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        AUTHORIZE_SESSION_KEY_TYPEHASH,
                        subscriber,
                        sessionPublicKey,
                        planId,
                        tierId,
                        maxCycles,
                        deadline
                    )
                )
            )
        );

        // Verify ERC-1271 signature on subscriber contract
        require(
            IERC1271(subscriber).isValidSignature(messageHash, signature) == 0x1626ba7e,
            "Invalid signature"
        );

        // Perform payment
        uint256 totalAmount = tier.price;
        uint256 feeAmount = (totalAmount * feeBps) / 10000;
        uint256 sellerAmount = totalAmount - feeAmount;

        if (feeAmount > 0) {
            USDC.safeTransferFrom(subscriber, address(this), feeAmount);
        }
        USDC.safeTransferFrom(subscriber, plan.seller, sellerAmount);

        // Update tracking state
        executedCycles[planId][subscriber] = currentCycle + 1;

        uint32 startTime = uint32(block.timestamp) > lastSubTimestamp 
            ? uint32(block.timestamp) 
            : lastSubTimestamp;
        
        lastSubTimestamp = startTime;
        uint32 endTime = startTime + plan.duration;

        nextAllowedTimestamp[planId][subscriber] = endTime;

        emit Subscribed(
            subscriber,
            plan.seller,
            planId,
            tierId,
            totalAmount,
            feeAmount,
            buyerData,
            startTime,
            endTime
        );
    }

    // -------------------- ADMIN --------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee too high (max 10%)");
        feeBps = _newFeeBps;
        emit FeeUpdated(_newFeeBps);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner");
        owner = _newOwner;
        emit OwnerUpdated(_newOwner);
    }

    function withdrawFees(address to, uint256 amount) external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        require(amount <= balance, "Insufficient balance");
        USDC.safeTransfer(to, amount);
        emit FeesWithdrawn(to, amount);
    }

    /**
     * @notice View function to get tier details (since mapping is not automatically public with getters in all cases)
     */
    function getTier(bytes32 planId, uint256 tierId) external view returns (uint256 price, string memory label, bool active) {
        Tier storage tier = plans[planId].tiers[tierId];
        return (tier.price, tier.label, tier.active);
    }
}
