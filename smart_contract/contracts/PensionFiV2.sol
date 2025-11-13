// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/// @title PensionFiV2 - Modernized DeFi Staking Platform on Astar
/// @author PensionFi Team
/// @notice Stake ASTR tokens with fixed APY for predetermined lock periods
/// @dev Implements UUPS upgradeable pattern with role-based access control
/// @custom:security-contact security@pensionfi.example.com
contract PensionFiV2 is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    /// @notice Role identifier for admin privileges
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role identifier for pauser privileges
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    /// @notice Role identifier for treasury management
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    /// @notice Represents a staking position
    /// @dev Packed struct for gas optimization
    struct Position {
        uint96 positionId;           // Max 79 billion positions
        address walletAddress;       // Owner of position
        uint40 createdDate;          // Timestamp (until year 36812)
        uint40 unlockDate;           // Timestamp when funds unlock
        uint16 percentInterest;      // APY in basis points (max 655.35%)
        uint128 weiStaked;           // Amount staked (340 trillion ASTR max)
        uint128 weiInterest;         // Interest earned
        bool open;                   // Position status
        bool claimed;                // Interest claimed flag
    }

    /// @notice Configuration for staking tiers
    struct StakingTier {
        uint16 daysLocked;
        uint16 apyBasisPoints;
        bool active;
        uint128 minStake;
        uint128 maxStake;
    }

    /// @notice Counter for position IDs
    uint96 public currentPositionId;
    
    /// @notice Total amount currently staked
    uint256 public totalStaked;
    
    /// @notice Total interest paid out
    uint256 public totalInterestPaid;
    
    /// @notice Treasury address for excess funds
    address public treasury;
    
    /// @notice Emergency withdrawal fee (basis points)
    uint16 public earlyWithdrawalFeeBps;
    
    /// @notice Minimum stake amount
    uint128 public minStakeAmount;
    
    /// @notice Maximum stake amount per position
    uint128 public maxStakeAmount;

    /// @notice Mapping from position ID to Position
    mapping(uint96 => Position) public positions;
    
    /// @notice Mapping from user address to their position IDs
    mapping(address => uint96[]) public positionIdsByAddress;
    
    /// @notice Mapping from tier ID to staking configuration
    mapping(uint16 => StakingTier) public stakingTiers;
    
    /// @notice Array of active tier IDs
    uint16[] public activeTierIds;

    /// @notice Emitted when a new position is created
    event PositionCreated(
        uint96 indexed positionId,
        address indexed user,
        uint128 amount,
        uint16 daysLocked,
        uint16 apyBasisPoints,
        uint40 unlockDate
    );

    /// @notice Emitted when a position is closed
    event PositionClosed(
        uint96 indexed positionId,
        address indexed user,
        uint128 principal,
        uint128 interest,
        bool earlyWithdrawal
    );

    /// @notice Emitted when staking tiers are updated
    event TierUpdated(
        uint16 indexed tierId,
        uint16 daysLocked,
        uint16 apyBasisPoints,
        bool active
    );

    /// @notice Emitted when treasury is funded
    event TreasuryFunded(address indexed funder, uint256 amount);

    /// @notice Emitted when early withdrawal fee is updated
    event EarlyWithdrawalFeeUpdated(uint16 oldFee, uint16 newFee);

    /// @notice Emitted when stake limits are updated
    event StakeLimitsUpdated(uint128 minStake, uint128 maxStake);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the contract (replaces constructor)
    /// @param _treasury Treasury address for protocol fees
    function initialize(address _treasury) public initializer {
        require(_treasury != address(0), "PensionFi: Zero address");
        
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, _treasury);

        treasury = _treasury;
        currentPositionId = 0;
        earlyWithdrawalFeeBps = 1000; // 10% early withdrawal penalty
        minStakeAmount = 0.1 ether;
        maxStakeAmount = 1000 ether;

        // Initialize default tiers
        _setStakingTier(365, 1200, true, 0.1 ether, 1000 ether);  // 1 year: 12% APY
        _setStakingTier(730, 2500, true, 0.1 ether, 1000 ether);  // 2 years: 25% APY
        _setStakingTier(1825, 7500, true, 1 ether, 1000 ether);   // 5 years: 75% APY
    }

    /// @notice Stake ASTR tokens for a fixed period
    /// @param daysLocked Number of days to lock tokens
    function stakeTokens(uint16 daysLocked) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {
        StakingTier memory tier = stakingTiers[daysLocked];
        
        require(tier.active, "PensionFi: Invalid staking tier");
        require(msg.value >= tier.minStake, "PensionFi: Below minimum stake");
        require(msg.value <= tier.maxStake, "PensionFi: Above maximum stake");
        require(msg.value >= minStakeAmount, "PensionFi: Below global minimum");

        uint128 weiStaked = uint128(msg.value);
        uint128 weiInterest = uint128(_calculateInterest(
            tier.apyBasisPoints, 
            daysLocked, 
            weiStaked
        ));
        
        uint40 createdDate = uint40(block.timestamp);
        uint40 unlockDate = uint40(block.timestamp + (uint256(daysLocked) * 1 days));

        positions[currentPositionId] = Position({
            positionId: currentPositionId,
            walletAddress: msg.sender,
            createdDate: createdDate,
            unlockDate: unlockDate,
            percentInterest: tier.apyBasisPoints,
            weiStaked: weiStaked,
            weiInterest: weiInterest,
            open: true,
            claimed: false
        });

        positionIdsByAddress[msg.sender].push(currentPositionId);
        totalStaked += weiStaked;

        emit PositionCreated(
            currentPositionId,
            msg.sender,
            weiStaked,
            daysLocked,
            tier.apyBasisPoints,
            unlockDate
        );

        currentPositionId++;
    }

    /// @notice Close a staking position and withdraw funds
    /// @param positionId ID of the position to close
    function closePosition(uint96 positionId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Position storage pos = positions[positionId];
        
        require(pos.walletAddress == msg.sender, "PensionFi: Not position owner");
        require(pos.open, "PensionFi: Position already closed");

        pos.open = false;
        totalStaked -= pos.weiStaked;

        bool earlyWithdrawal = block.timestamp < pos.unlockDate;
        uint256 amountToTransfer;

        if (earlyWithdrawal) {
            // Early withdrawal: return principal minus fee, no interest
            uint256 fee = (uint256(pos.weiStaked) * earlyWithdrawalFeeBps) / 10000;
            amountToTransfer = pos.weiStaked - fee;
            
            // Send fee to treasury
            if (fee > 0) {
                (bool feeSuccess, ) = payable(treasury).call{value: fee}("");
                require(feeSuccess, "PensionFi: Fee transfer failed");
            }
        } else {
            // Normal withdrawal: return principal + interest
            amountToTransfer = pos.weiStaked + pos.weiInterest;
            totalInterestPaid += pos.weiInterest;
            pos.claimed = true;
        }

        require(
            address(this).balance >= amountToTransfer,
            "PensionFi: Insufficient contract balance"
        );

        (bool success, ) = payable(msg.sender).call{value: amountToTransfer}("");
        require(success, "PensionFi: Transfer failed");

        emit PositionClosed(
            positionId,
            msg.sender,
            pos.weiStaked,
            earlyWithdrawal ? 0 : pos.weiInterest,
            earlyWithdrawal
        );
    }

    /// @notice Calculate interest for a given stake
    /// @param basisPoints APY in basis points (e.g., 1200 = 12%)
    /// @param numDays Number of days locked
    /// @param weiAmount Amount staked in wei
    /// @return Interest amount in wei
    function calculateInterest(
        uint16 basisPoints,
        uint16 numDays,
        uint128 weiAmount
    ) public pure returns (uint256) {
        return _calculateInterest(basisPoints, numDays, weiAmount);
    }

    function _calculateInterest(
        uint16 basisPoints,
        uint16 numDays,
        uint128 weiAmount
    ) internal pure returns (uint256) {
        // Simple interest: (principal * rate) / 10000
        // Rate is already annual, so this gives the total interest
        return (uint256(weiAmount) * basisPoints) / 10000;
    }

    /// @notice Update or create a staking tier
    /// @param daysLocked Days locked for this tier
    /// @param apyBasisPoints APY in basis points
    /// @param active Whether tier is active
    /// @param minStake Minimum stake for this tier
    /// @param maxStake Maximum stake for this tier
    function setStakingTier(
        uint16 daysLocked,
        uint16 apyBasisPoints,
        bool active,
        uint128 minStake,
        uint128 maxStake
    ) external onlyRole(ADMIN_ROLE) {
        _setStakingTier(daysLocked, apyBasisPoints, active, minStake, maxStake);
    }

    function _setStakingTier(
        uint16 daysLocked,
        uint16 apyBasisPoints,
        bool active,
        uint128 minStake,
        uint128 maxStake
    ) internal {
        require(maxStake >= minStake, "PensionFi: Invalid stake limits");
        require(daysLocked > 0, "PensionFi: Invalid lock period");
        
        bool tierExists = stakingTiers[daysLocked].active || 
                         stakingTiers[daysLocked].apyBasisPoints > 0;

        stakingTiers[daysLocked] = StakingTier({
            daysLocked: daysLocked,
            apyBasisPoints: apyBasisPoints,
            active: active,
            minStake: minStake,
            maxStake: maxStake
        });

        if (active && !tierExists) {
            activeTierIds.push(daysLocked);
        }

        emit TierUpdated(daysLocked, daysLocked, apyBasisPoints, active);
    }

    /// @notice Fund the contract for interest payments
    function fundTreasury() external payable {
        require(msg.value > 0, "PensionFi: No value sent");
        emit TreasuryFunded(msg.sender, msg.value);
    }

    /// @notice Emergency pause
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause contract
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Update early withdrawal fee
    /// @param feeBps New fee in basis points
    function setEarlyWithdrawalFee(uint16 feeBps) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(feeBps <= 5000, "PensionFi: Fee too high"); // Max 50%
        uint16 oldFee = earlyWithdrawalFeeBps;
        earlyWithdrawalFeeBps = feeBps;
        emit EarlyWithdrawalFeeUpdated(oldFee, feeBps);
    }

    /// @notice Update minimum stake amount
    /// @param amount New minimum stake amount
    function setMinStakeAmount(uint128 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(amount > 0, "PensionFi: Invalid amount");
        minStakeAmount = amount;
        emit StakeLimitsUpdated(amount, maxStakeAmount);
    }

    /// @notice Update maximum stake amount
    /// @param amount New maximum stake amount
    function setMaxStakeAmount(uint128 amount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(amount > minStakeAmount, "PensionFi: Invalid amount");
        maxStakeAmount = amount;
        emit StakeLimitsUpdated(minStakeAmount, amount);
    }

    /// @notice Update treasury address
    /// @param newTreasury New treasury address
    function setTreasury(address newTreasury) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(newTreasury != address(0), "PensionFi: Zero address");
        _revokeRole(TREASURY_ROLE, treasury);
        treasury = newTreasury;
        _grantRole(TREASURY_ROLE, newTreasury);
    }

    /// @notice Withdraw excess funds to treasury
    function withdrawExcess() external onlyRole(TREASURY_ROLE) {
        uint256 requiredBalance = totalStaked + _calculateTotalInterestLiability();
        uint256 currentBalance = address(this).balance;
        
        require(currentBalance > requiredBalance, "PensionFi: No excess funds");
        
        uint256 excess = currentBalance - requiredBalance;
        (bool success, ) = payable(treasury).call{value: excess}("");
        require(success, "PensionFi: Withdrawal failed");
    }

    /// @notice Calculate total interest liability for all open positions
    /// @return Total interest owed to all stakers
    function _calculateTotalInterestLiability() internal view returns (uint256) {
        uint256 totalLiability = 0;
        
        // Iterate through all positions (simplified version)
        // In production, you might want to track this more efficiently
        for (uint96 i = 0; i < currentPositionId; i++) {
            if (positions[i].open && !positions[i].claimed) {
                totalLiability += positions[i].weiInterest;
            }
        }
        
        return totalLiability;
    }

    /// @notice Get all positions for a user
    /// @param user Address of the user
    /// @return Array of position IDs
    function getPositionsByAddress(address user) 
        external 
        view 
        returns (uint96[] memory) 
    {
        return positionIdsByAddress[user];
    }

    /// @notice Get active staking tiers
    /// @return Array of active tier day counts
    function getActiveTiers() external view returns (uint16[] memory) {
        return activeTierIds;
    }

    /// @notice Get position details
    /// @param positionId ID of the position
    /// @return Position struct
    function getPosition(uint96 positionId) 
        external 
        view 
        returns (Position memory) 
    {
        return positions[positionId];
    }

    /// @notice Check contract health
    /// @return balance Current contract balance
    /// @return staked Total amount staked
    /// @return interestPaid Total interest paid out
    /// @return positionCount Total positions created
    /// @return isPaused Whether contract is paused
    function getContractHealth() external view returns (
        uint256 balance,
        uint256 staked,
        uint256 interestPaid,
        uint256 positionCount,
        bool isPaused
    ) {
        return (
            address(this).balance,
            totalStaked,
            totalInterestPaid,
            currentPositionId,
            paused()
        );
    }

    /// @notice Get staking tier details
    /// @param daysLocked Days locked for the tier
    /// @return Staking tier configuration
    function getTier(uint16 daysLocked) 
        external 
        view 
        returns (StakingTier memory) 
    {
        return stakingTiers[daysLocked];
    }

    /// @notice Check if user can withdraw position
    /// @param positionId ID of the position
    /// @return canWithdraw Whether position can be withdrawn
    /// @return isEarly Whether withdrawal would be early
    /// @return timeRemaining Seconds until unlock (0 if unlocked)
    function checkWithdrawal(uint96 positionId) 
        external 
        view 
        returns (bool canWithdraw, bool isEarly, uint256 timeRemaining) 
    {
        Position memory pos = positions[positionId];
        
        if (!pos.open) {
            return (false, false, 0);
        }
        
        isEarly = block.timestamp < pos.unlockDate;
        timeRemaining = isEarly ? pos.unlockDate - block.timestamp : 0;
        canWithdraw = true;
        
        return (canWithdraw, isEarly, timeRemaining);
    }

    /// @notice Required by UUPS - authorization for upgrades
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}

    /// @notice Receive function for funding
    receive() external payable {
        emit TreasuryFunded(msg.sender, msg.value);
    }
}
