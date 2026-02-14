// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SubscriptionGateway
 * @dev High-scalability subscription gateway optimized for the Arc network.
 * 
 * 1. Hybrid Storage: Plans are on-chain, Subscriptions are Event-based.
 * 2. Monotonic Timestamps: Hardened against non-increasing block.timestamp.
 * 3. Arc Compatible: Use 0x3600000000000000000000000000000000000000 for USDC.
 * 4. Payouts: Direct to seller, minus the protocol fee.
 */
contract SubscriptionGateway {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC;
    address public owner;
    uint256 public feeBps = 250; // 2.5% default

    uint256 public planNonce;

    // Track last timestamp to ensure monotonicity on networks like Arc
    uint32 public lastSubTimestamp;

    // -------------------- STRUCTS & STORAGE --------------------

    struct Plan {
        address seller;
        uint256 price;
        uint32 duration; // In seconds
        string ipfsHash; // Metadata: plan name, logo, description, etc.
        bool active;
    }

    // Plans are stored on-chain for secure discovery and price validation
    mapping(bytes32 => Plan) public plans;

    // -------------------- EVENTS --------------------

    event PlanCreated(
        bytes32 indexed planId,
        address indexed seller,
        uint256 price,
        uint32 duration,
        string ipfsHash
    );

    event PlanStatusUpdated(bytes32 indexed planId, bool active);
    event PlanUpdated(
        bytes32 indexed planId,
        uint256 price,
        uint32 duration,
        string ipfsHash
    );

    event Subscribed(
        address indexed subscriber,
        address indexed seller,
        bytes32 indexed planId,
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

    /**
     * @param _usdc Arc Testnet USDC: 0x3600000000000000000000000000000000000000
     */
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC");

        // Enforce 6 decimals check for USDC
        try IERC20Metadata(_usdc).decimals() returns (uint8 dec) {
            require(dec == 6, "Must be 6-decimal token");
        } catch {}

        USDC = IERC20(_usdc);
        owner = msg.sender;
    }

    // -------------------- PLAN MANAGEMENT --------------------

    function createPlan(
        uint256 price,
        uint32 duration,
        string calldata ipfsHash
    ) external returns (bytes32 planId) {
        require(price > 0, "Price must be > 0");
        require(duration > 0, "Duration must be > 0");

        planNonce++;
        planId = keccak256(abi.encode(msg.sender, planNonce));

        plans[planId] = Plan({
            seller: msg.sender,
            price: price,
            duration: duration,
            ipfsHash: ipfsHash,
            active: true
        });

        emit PlanCreated(planId, msg.sender, price, duration, ipfsHash);
    }

    function setPlanStatus(bytes32 planId, bool active) external {
        Plan storage plan = plans[planId];
        require(plan.seller == msg.sender, "Not the seller");
        plan.active = active;
        emit PlanStatusUpdated(planId, active);
    }

    function updatePlan(
        bytes32 planId,
        uint256 price,
        uint32 duration,
        string calldata ipfsHash
    ) external {
        Plan storage plan = plans[planId];
        require(plan.seller == msg.sender, "Not the seller");
        
        plan.price = price;
        plan.duration = duration;
        plan.ipfsHash = ipfsHash;
        
        emit PlanUpdated(planId, price, duration, ipfsHash);
    }

    // -------------------- CORE LOGIC --------------------

    /**
     * @notice Subscribe to a plan. Monotonicity guard ensures non-decreasing startTime.
     * @param planId The unique identifier for the plan.
     * @param buyerData Off-chain buyer identifier.
     */
    function subscribe(bytes32 planId, string calldata buyerData) external {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan is inactive");

        uint256 totalAmount = plan.price;
        uint256 feeAmount = (totalAmount * feeBps) / 10000;
        uint256 sellerAmount = totalAmount - feeAmount;

        // Routing funds (Direct Payout to Seller)
        if (feeAmount > 0) {
            USDC.safeTransferFrom(msg.sender, address(this), feeAmount);
        }
        USDC.safeTransferFrom(msg.sender, plan.seller, sellerAmount);

        // --- Arc Timestamps Monotonicity Guard ---
        // Ensures that startTime is never smaller than the last subscription's startTime
        uint32 startTime = uint32(block.timestamp) > lastSubTimestamp 
            ? uint32(block.timestamp) 
            : lastSubTimestamp;
        
        lastSubTimestamp = startTime;
        uint32 endTime = startTime + plan.duration;

        emit Subscribed(
            msg.sender,
            plan.seller,
            planId,
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
}
