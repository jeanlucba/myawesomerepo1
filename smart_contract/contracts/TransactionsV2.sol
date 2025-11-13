// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

/// @title TransactionsV2 - Transaction logging with enhanced features
/// @author PensionFi Team
/// @notice Records on-chain transaction metadata
/// @dev Implements UUPS upgradeable pattern
contract TransactionsV2 is UUPSUpgradeable, OwnableUpgradeable, PausableUpgradeable {
    
    /// @notice Represents a recorded transaction
    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        string message;
        uint40 timestamp;
        bytes32 txHash;
        uint8 transactionType; // 0: transfer, 1: stake, 2: withdraw, etc.
    }

    /// @notice Total number of transactions recorded
    uint256 public transactionCount;
    
    /// @notice Mapping from transaction ID to Transaction
    mapping(uint256 => Transaction) public transactions;
    
    /// @notice Mapping from address to their transaction IDs
    mapping(address => uint256[]) public transactionsByAddress;

    /// @notice Emitted when a transaction is recorded
    event TransactionRecorded(
        uint256 indexed id,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string message,
        uint40 timestamp,
        uint8 transactionType
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the contract
    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
    }

    /// @notice Record a new transaction
    /// @param receiver Address of the receiver
    /// @param amount Amount transferred
    /// @param message Transaction message
    /// @param transactionType Type of transaction
    function recordTransaction(
        address receiver,
        uint256 amount,
        string memory message,
        uint8 transactionType
    ) external whenNotPaused {
        require(receiver != address(0), "Transactions: Zero address");
        
        uint40 timestamp = uint40(block.timestamp);
        
        transactions[transactionCount] = Transaction({
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            message: message,
            timestamp: timestamp,
            txHash: blockhash(block.number - 1),
            transactionType: transactionType
        });

        transactionsByAddress[msg.sender].push(transactionCount);
        if (receiver != msg.sender) {
            transactionsByAddress[receiver].push(transactionCount);
        }

        emit TransactionRecorded(
            transactionCount,
            msg.sender,
            receiver,
            amount,
            message,
            timestamp,
            transactionType
        );

        transactionCount++;
    }

    /// @notice Get all transaction IDs for an address
    /// @param user Address to query
    /// @return Array of transaction IDs
    function getTransactionsByAddress(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return transactionsByAddress[user];
    }

    /// @notice Get transaction details
    /// @param transactionId ID of the transaction
    /// @return Transaction struct
    function getTransaction(uint256 transactionId) 
        external 
        view 
        returns (Transaction memory) 
    {
        require(transactionId < transactionCount, "Transactions: Invalid ID");
        return transactions[transactionId];
    }

    /// @notice Get multiple transactions
    /// @param transactionIds Array of transaction IDs
    /// @return Array of Transaction structs
    function getTransactions(uint256[] calldata transactionIds) 
        external 
        view 
        returns (Transaction[] memory) 
    {
        Transaction[] memory txs = new Transaction[](transactionIds.length);
        for (uint256 i = 0; i < transactionIds.length; i++) {
            require(transactionIds[i] < transactionCount, "Transactions: Invalid ID");
            txs[i] = transactions[transactionIds[i]];
        }
        return txs;
    }

    /// @notice Get recent transactions
    /// @param limit Maximum number of transactions to return
    /// @return Array of recent Transaction structs
    function getRecentTransactions(uint256 limit) 
        external 
        view 
        returns (Transaction[] memory) 
    {
        uint256 count = limit > transactionCount ? transactionCount : limit;
        Transaction[] memory recent = new Transaction[](count);
        
        for (uint256 i = 0; i < count; i++) {
            recent[i] = transactions[transactionCount - 1 - i];
        }
        
        return recent;
    }

    /// @notice Pause transaction recording
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause transaction recording
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Required by UUPS - authorization for upgrades
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}
