# Astar Network Migration Specification

## Executive Summary

This document outlines the complete migration plan for the PensionFi DApp from **Polygon Mumbai Testnet** to **Astar Network**. The migration involves updating smart contracts, frontend integration, deployment scripts, and testing infrastructure.

---

## Current State Analysis

### Current Blockchain Infrastructure
- **Network**: Polygon Mumbai Testnet
- **Primary Contract**: PensionFi.sol (ETH staking with Aave integration)
- **Additional Contracts**: Transactions.sol, NFTMarketplace.sol
- **Development Tools**: Hardhat + Foundry
- **Frontend**: React + Vite + ethers.js v5
- **Current Network Configuration**:
  - Chain ID: 80001 (Mumbai)
  - RPC: `https://polygon-mumbai.g.alchemy.com/v2/odpZQIbE3xtAii8qMNePX-0M6fyB8G0V`

### Smart Contract Dependencies
1. **PensionFi.sol** - Main staking contract
   - Integrates with Aave V2 (Mumbai addresses)
   - WETH Gateway: `0xee9eE614Ad26963bEc1Bec0D2c92879ae1F209fA`
   - Lending Pool: `0x9198F13B08E299d85E096929fA9781A1E3d5d827`
   - aWETH Token: `0x7aE20397Ca327721F013BB9e140C707F82871b56`

2. **Transactions.sol** - Simple transaction logger

3. **NFTMarketplace.sol** - NFT marketplace functionality

---

## Astar Network Overview

### Why Astar Network?
- **Polkadot Parachain**: Enhanced security and interoperability
- **EVM Compatibility**: Minimal smart contract changes required
- **dApp Staking**: Native reward mechanism for developers
- **Lower Gas Fees**: More cost-effective than Polygon
- **Multi-VM Support**: Supports both EVM and WASM

### Astar Network Options

#### 1. Astar Mainnet (Recommended for Production)
- **Chain ID**: 592
- **Currency**: ASTR
- **RPC Endpoint**: `https://evm.astar.network`
- **Block Explorer**: https://blockscout.com/astar/

#### 2. Shibuya Testnet (Recommended for Development)
- **Chain ID**: 81
- **Currency**: SBY (testnet tokens)
- **RPC Endpoint**: `https://evm.shibuya.astar.network`
- **Block Explorer**: https://shibuya.subscan.io/
- **Faucet**: https://portal.astar.network

#### 3. Shiden Network (Kusama Parachain - Alternative)
- **Chain ID**: 336
- **Currency**: SDN
- **RPC Endpoint**: `https://evm.shiden.astar.network`

---

## Migration Plan

### Phase 1: Development Environment Setup

#### 1.1 Update Network Configuration

**File**: `smart_contract/hardhat.config.js`

```javascript
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    
    // DEPRECATED - Remove after migration
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/odpZQIbE3xtAii8qMNePX-0M6fyB8G0V", 
      accounts: [process.env.PRIVATE_KEY],
    },

    // NEW - Astar Shibuya Testnet
    shibuya: {
      url: "https://evm.shibuya.astar.network",
      chainId: 81,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
    },

    // NEW - Astar Mainnet
    astar: {
      url: "https://evm.astar.network",
      chainId: 592,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },

    // NEW - Shiden Network (Optional)
    shiden: {
      url: "https://evm.shiden.astar.network",
      chainId: 336,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
```

#### 1.2 Update Environment Variables

**File**: `smart_contract/.env` (example)

```bash
# Private key for deployment (DO NOT COMMIT)
PRIVATE_KEY=your_private_key_here

# Astar Network RPC endpoints
SHIBUYA_RPC_URL=https://evm.shibuya.astar.network
ASTAR_RPC_URL=https://evm.astar.network
SHIDEN_RPC_URL=https://evm.shiden.astar.network

# Block explorers (for verification)
ASTAR_EXPLORER_API_KEY=your_api_key_if_needed
```

---

### Phase 2: Smart Contract Migration

#### 2.1 Critical Issue: Aave Protocol Availability

**IMPORTANT**: Aave V2/V3 is **NOT deployed on Astar Network**. The PensionFi contract heavily depends on Aave for yield generation.

**Options**:

##### Option A: Remove Aave Integration (Simplest)
- Remove WETH Gateway and Lending Pool integration
- Implement simple interest calculation based on contract balance
- Store staked ETH directly in contract
- Pay interest from contract reserves or owner deposits

##### Option B: Integrate with Astar Native DeFi Protocols
Research and integrate with Astar-native DeFi protocols:
- **Arthswap**: DEX on Astar
- **Algem**: Liquid staking on Astar
- **Starlay Finance**: Lending protocol (similar to Aave)
- **Sirius Finance**: Stableswap protocol

**Recommended**: Option B with **Starlay Finance** (most similar to Aave)

##### Option C: Cross-Chain Integration
- Use Astar's XCM (Cross-Consensus Messaging) to interact with Polkadot DeFi
- More complex implementation

#### 2.2 Updated PensionFi.sol (Option A - Simplified)

**File**: `smart_contract/contracts/PensionFi.sol`

Key changes:
```solidity
// Remove these imports:
// import "./interfaces/ILendingPool.sol";
// import "./interfaces/IWETHGateway.sol";

contract PensionFi {
    
    // Remove Aave-specific state variables
    // IWETHGateway public iWethGateway = ...
    // ILendingPool public iLendingPool = ...
    // address public constant lendingPoolAddress = ...
    // address public constant aWethAddress = ...
    
    address public owner;
    uint256 public totalStaked;
    uint256 public contractReserves; // For paying interest
    
    // ... rest of the contract structure remains same
    
    function stakeEther(uint numDays) external payable {
        require(tiers[numDays] > 0, "Mapping not found");

        positions[currentPositionId] = Position(
            currentPositionId,
            msg.sender,
            block.timestamp,
            block.timestamp + (numDays * 1 days),
            tiers[numDays],
            msg.value,
            calculateInterest(tiers[numDays], numDays, msg.value),
            true
        );

        positionIdsByAddress[msg.sender].push(currentPositionId);
        currentPositionId += 1;
        
        totalStaked += msg.value;
        
        // NO Aave integration - funds stay in contract
    }
    
    function closePosition(uint positionId) external {
        require(positions[positionId].walletAddress == msg.sender, "Only the creator can modify the position");
        require(positions[positionId].open == true, "Position is closed");

        positions[positionId].open = false;
        totalStaked -= positions[positionId].weiStaked;

        // Direct payment from contract balance
        if(block.timestamp > positions[positionId].unlockDate) {
            uint amount = positions[positionId].weiStaked + positions[positionId].weiInterest;
            require(address(this).balance >= amount, "Insufficient contract balance");
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "Transaction failed");
        } else {
            (bool success, ) = payable(msg.sender).call{value: positions[positionId].weiStaked}("");
            require(success, "Transaction failed");
        }
    }
    
    // Owner can fund the contract for interest payments
    function fundContract() external payable onlyOwner {
        contractReserves += msg.value;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
}
```

#### 2.3 Updated PensionFi.sol (Option B - Starlay Finance Integration)

**Note**: Starlay Finance addresses on Astar Mainnet would need to be researched and inserted.

```solidity
// Similar structure to current implementation
// Replace Aave addresses with Starlay Finance addresses
// Update interface imports to match Starlay's contracts
```

#### 2.4 Transactions.sol & NFTMarketplace.sol

These contracts are blockchain-agnostic and require **no changes** except:
- Remove import from `hardhat/console.sol` in production
- Test thoroughly on Astar testnet

---

### Phase 3: Deployment Scripts Update

#### 3.1 Update Deploy Scripts

**File**: `smart_contract/scripts/deploy.js`

```javascript
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying to network:", hre.network.name);
  
  const PensionFi = await hre.ethers.getContractFactory("PensionFi");
  
  // Deploy with initial funding for interest payments
  const pensionFi = await PensionFi.deploy({
    value: hre.ethers.utils.parseEther("10") // 10 ASTR initial funding
  });
  
  await pensionFi.deployed();
  console.log("PensionFi deployed to:", pensionFi.address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);

  // Save config for frontend
  const config = `
  export const PensionFiAddress = "${pensionFi.address}"
  export const networkName = "${hre.network.name}"
  export const chainId = ${hre.network.config.chainId}
  `;
  
  fs.writeFileSync('./config.js', config);
  
  console.log("Configuration saved to config.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 3.2 Deployment Commands

```bash
# Deploy to Shibuya Testnet
npx hardhat run scripts/deploy.js --network shibuya

# Deploy to Astar Mainnet
npx hardhat run scripts/deploy.js --network astar

# Deploy to Shiden Network
npx hardhat run scripts/deploy.js --network shiden
```

---

### Phase 4: Frontend Migration

#### 4.1 Update Package Dependencies

**File**: `client/package.json`

Current dependencies are compatible. Ensure ethers.js is up to date:

```json
{
  "dependencies": {
    "ethers": "^5.7.2",
    // ... other dependencies remain the same
  }
}
```

#### 4.2 Network Configuration in Frontend

**File**: `client/src/config/networks.js` (NEW FILE)

```javascript
export const NETWORKS = {
  shibuya: {
    chainId: '0x51', // 81 in hex
    chainName: 'Shibuya',
    nativeCurrency: {
      name: 'Shibuya',
      symbol: 'SBY',
      decimals: 18
    },
    rpcUrls: ['https://evm.shibuya.astar.network'],
    blockExplorerUrls: ['https://shibuya.subscan.io/']
  },
  astar: {
    chainId: '0x250', // 592 in hex
    chainName: 'Astar Network',
    nativeCurrency: {
      name: 'Astar',
      symbol: 'ASTR',
      decimals: 18
    },
    rpcUrls: ['https://evm.astar.network'],
    blockExplorerUrls: ['https://blockscout.com/astar/']
  },
  shiden: {
    chainId: '0x150', // 336 in hex
    chainName: 'Shiden Network',
    nativeCurrency: {
      name: 'Shiden',
      symbol: 'SDN',
      decimals: 18
    },
    rpcUrls: ['https://evm.shiden.astar.network'],
    blockExplorerUrls: ['https://blockscout.com/shiden/']
  }
};

export const DEFAULT_NETWORK = 'shibuya'; // Change to 'astar' for production
```

#### 4.3 Update Stake.jsx

**File**: `client/src/components/Stake.jsx`

```javascript
import React, {useState, useEffect} from "react";
import {ethers} from 'ethers';
import artifacts from '../artifacts/contracts/PensionFi.sol/PensionFi.json';
import {toEther, toWei} from '../helpers/helpers';
import { NETWORKS, DEFAULT_NETWORK } from '../config/networks';
import Header from "../components/Header";
import './stake.css';
import Modal from "../components/Modal";
import StakeTable from "../components/StakeTable";
import StakeContainer from "../components/StakeContainer";

// IMPORTANT: Update this after deployment to Astar
const CONTRACT_ADDRESS = "0xYourNewAstarContractAddress";
const EXPECTED_CHAIN_ID = NETWORKS[DEFAULT_NETWORK].chainId;

function Stake() {
  
  const [provider, setProvider] = useState(undefined)
  const [signer, setSigner] = useState(undefined)
  const [contract, setContract] = useState(undefined)
  const [signerAddress, setSignerAddress] = useState(undefined)
  const [wrongNetwork, setWrongNetwork] = useState(false)

  const [assetIds, setAssetIds] = useState([])
  const [assets, setAssets] = useState([])

  const [showStakeModal, setShowStakeModal] = useState(false)
  const [stakingLength, setStakingLength] = useState(undefined)
  const [stakingPercent, setStakingPercent] = useState(undefined)
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)
      
      // Check network
      const network = await provider.getNetwork()
      if (ethers.utils.hexValue(network.chainId) !== EXPECTED_CHAIN_ID) {
        setWrongNetwork(true)
        console.warn(`Wrong network. Expected ${EXPECTED_CHAIN_ID}, got ${network.chainId}`)
        return
      }
      
      setWrongNetwork(false)
      
      provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()
      const signerAddress = await signer.getAddress()
      console.log("Address connected is", signerAddress)

      const contract = await new ethers.Contract(
        CONTRACT_ADDRESS,
        artifacts.abi,
        signer
      )
      setContract(contract)
    }
    onLoad()
  }, [])

  // Function to switch to Astar network
  const switchToAstarNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORKS[DEFAULT_NETWORK]],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      } else {
        console.error('Failed to switch network:', switchError);
      }
    }
  };

  const isConnected = () => signer !== undefined

  const getSigner = async () => {
    provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    console.log("Signer Address = ", signer )
    return signer
  }

  const getAssetIds = async (address, signer) => {
    const assetIds = await contract.connect(signer).getAllPositionIdsByAddress(address)
    console.log("Asset id = ", assetIds)
    return assetIds
  }

  const getAssets = async (ids, signer) => {
    const queriedAssets = await Promise.all(
      ids.map(id => contract.connect(signer).getPositionById(id))
    )

    queriedAssets.map(async asset => {
      const parsedAsset = {
        positionId: asset.positionId,
        percentInterest: Number(asset.percentInterest) / 100,
        daysRemaining: calculateRemainingDays(Number(asset.unlockDate)),
        etherInterest: toEther(asset.weiInterest),
        etherStaked: toEther(asset.weiStaked),
        open: asset.open,
      }

      setAssets((prev) => [...prev, parsedAsset])
    })
  }

  const calculateRemainingDays = (unlockDate) => {
    const timeNow = Date.now() / 1000
    const remainingSeconds = unlockDate - timeNow
    return Math.max((remainingSeconds / 60 / 60 / 24).toFixed(0), 0)
  }

  const connectAndLoad = async () => {
    if (wrongNetwork) {
      await switchToAstarNetwork()
      return
    }
    
    const signer = await getSigner()
    setSigner(signer)

    const signerAddress = await signer.getAddress()
    setSignerAddress(signerAddress)

    const assetIds = await getAssetIds(signerAddress, signer)
    setAssetIds(assetIds)

    getAssets(assetIds, signer)
  }

  const openStakingModal = (stakingLength, stakingPercent) => {
    setShowStakeModal(true)
    setStakingLength(stakingLength)
    setStakingPercent(stakingPercent)
  }

  const stakeEther = async () => {
    try {
      const wei = toWei(amount)
      const data = {value: wei}
      const tx = await contract.connect(signer).stakeEther(stakingLength, data)
      await tx.wait() // Wait for transaction confirmation
      console.log("Staked successfully:", tx.hash)
      setShowStakeModal(false)
      // Refresh assets
      await connectAndLoad()
    } catch (error) {
      console.error("Staking error:", error)
    }
  }

  const withdraw = async (positionId) => {
    try {
      const tx = await contract.connect(signer).closePosition(positionId)
      await tx.wait()
      console.log("Withdrawn successfully:", tx.hash)
      // Refresh assets
      await connectAndLoad()
    } catch (error) {
      console.error("Withdrawal error:", error)
    }
  }

  if (wrongNetwork) {
    return (
      <div className="bg-black-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Wrong Network Detected</h2>
          <p className="mb-4">Please switch to {NETWORKS[DEFAULT_NETWORK].chainName}</p>
          <button 
            onClick={switchToAstarNetwork}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Switch to {NETWORKS[DEFAULT_NETWORK].chainName}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black-100">
      <div className="mt-5 mr-5 flex justify-center">
        <Header isConnected={isConnected} connect={connectAndLoad} />
      </div>

      <StakeContainer openStakingModal={openStakingModal} />
      <StakeTable assets={assets} withdraw={withdraw} />

      {showStakeModal && (
        <Modal 
          setShowStakeModal={setShowStakeModal}
          stakingLength={stakingLength}
          stakingPercent={stakingPercent}
          amount={amount}
          setAmount={setAmount}
          stakeEther={stakeEther}
        />
      )}
    </div>
  );
}

export default Stake;
```

#### 4.4 Update config.js

**File**: `client/config.js`

```javascript
// This file is auto-generated during deployment
// Update manually or redeploy contracts

export const PensionFiAddress = "0xYourDeployedContractAddress"
export const networkName = "shibuya" // or "astar"
export const chainId = 81 // 81 for Shibuya, 592 for Astar
```

---

### Phase 5: Testing Strategy

#### 5.1 Smart Contract Testing

**File**: `smart_contract/test/PensionFi.test.js` (NEW)

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PensionFi on Astar", function () {
  let pensionFi;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const PensionFi = await ethers.getContractFactory("PensionFi");
    pensionFi = await PensionFi.deploy();
    await pensionFi.deployed();
    
    // Fund contract for interest payments
    await owner.sendTransaction({
      to: pensionFi.address,
      value: ethers.utils.parseEther("100")
    });
  });

  it("Should stake ETH correctly", async function () {
    const stakeAmount = ethers.utils.parseEther("1");
    
    await pensionFi.connect(addr1).stakeEther(365, { value: stakeAmount });
    
    const position = await pensionFi.getPositionById(0);
    expect(position.weiStaked).to.equal(stakeAmount);
    expect(position.walletAddress).to.equal(addr1.address);
  });

  it("Should calculate interest correctly", async function () {
    const stakeAmount = ethers.utils.parseEther("1");
    const expectedInterest = await pensionFi.calculateInterest(1200, 365, stakeAmount);
    
    await pensionFi.connect(addr1).stakeEther(365, { value: stakeAmount });
    const position = await pensionFi.getPositionById(0);
    
    expect(position.weiInterest).to.equal(expectedInterest);
  });

  it("Should allow withdrawal after unlock period", async function () {
    // Test implementation
  });

  it("Should not give interest for early withdrawal", async function () {
    // Test implementation
  });
});
```

#### 5.2 Test Commands

```bash
# Run unit tests
cd smart_contract
npx hardhat test

# Test on Shibuya testnet
npx hardhat run scripts/deploy.js --network shibuya

# Run foundry tests
forge test
```

#### 5.3 Frontend Testing Checklist

- [ ] Connect wallet to Shibuya testnet
- [ ] Verify correct network detection
- [ ] Test network switching functionality
- [ ] Stake ETH/ASTR for different periods
- [ ] View staked positions
- [ ] Withdraw before unlock period (no interest)
- [ ] Withdraw after unlock period (with interest)
- [ ] Check transaction history
- [ ] Test on mobile wallets (MetaMask Mobile, Polkadot.js)

---

### Phase 6: Contract Verification

#### 6.1 Verify on Astar Explorer

```bash
# Install hardhat-etherscan
npm install --save-dev @nomiclabs/hardhat-etherscan

# Update hardhat.config.js
etherscan: {
  apiKey: {
    astar: "your-api-key", // May not be required
    shibuya: "your-api-key"
  },
  customChains: [
    {
      network: "astar",
      chainId: 592,
      urls: {
        apiURL: "https://blockscout.com/astar/api",
        browserURL: "https://blockscout.com/astar"
      }
    },
    {
      network: "shibuya",
      chainId: 81,
      urls: {
        apiURL: "https://blockscout.com/shibuya/api",
        browserURL: "https://blockscout.com/shibuya"
      }
    }
  ]
}

# Verify contract
npx hardhat verify --network shibuya DEPLOYED_CONTRACT_ADDRESS
```

---

### Phase 7: Migration Checklist

#### Pre-Migration
- [ ] Backup all current contract data from Mumbai
- [ ] Document all user positions and balances
- [ ] Test all contracts on Shibuya testnet
- [ ] Audit smart contract changes (if significant)
- [ ] Prepare migration announcement for users

#### Migration
- [ ] Deploy contracts to Astar mainnet
- [ ] Verify contracts on block explorer
- [ ] Test basic functionality on mainnet
- [ ] Update frontend configuration
- [ ] Deploy frontend to production
- [ ] Update DNS/routing if needed

#### Post-Migration
- [ ] Monitor contracts for 24-48 hours
- [ ] Verify gas costs are acceptable
- [ ] Test all user flows
- [ ] Provide support for users migrating wallets
- [ ] Update documentation
- [ ] Announce successful migration

---

### Phase 8: Security Considerations

#### 8.1 Smart Contract Security

**Critical Changes to Review**:
1. **Removal of Aave integration** - Contract now holds all funds
   - Implement multi-sig wallet for owner
   - Add withdrawal limits/timelock
   - Consider upgradeability pattern

2. **Interest Payment Mechanism**
   - Ensure contract always has sufficient funds
   - Add emergency pause functionality
   - Implement reserve ratio checks

**Recommended Additions**:

```solidity
// Add to PensionFi.sol

// Emergency pause
bool public paused = false;

modifier whenNotPaused() {
    require(!paused, "Contract is paused");
    _;
}

function pause() external onlyOwner {
    paused = true;
}

function unpause() external onlyOwner {
    paused = false;
}

// Modify stakeEther and closePosition functions
function stakeEther(uint numDays) external payable whenNotPaused {
    // ... existing code
}

function closePosition(uint positionId) external whenNotPaused {
    // ... existing code
}
```

#### 8.2 Frontend Security

1. **RPC Endpoint Security**
   - Use multiple RPC endpoints for redundancy
   - Implement rate limiting
   - Monitor for RPC failures

2. **User Wallet Security**
   - Validate all user inputs
   - Implement transaction confirmation modals
   - Display gas estimates before transactions

---

## Cost Analysis

### Gas Cost Comparison

| Operation | Polygon Mumbai | Astar Network | Savings |
|-----------|---------------|---------------|---------|
| Contract Deployment | ~$0.50 | ~$0.10 | 80% |
| Stake ETH | ~$0.10 | ~$0.02 | 80% |
| Withdraw | ~$0.15 | ~$0.03 | 80% |

*Note: Costs are approximate and depend on network congestion*

### Development Costs

- **Testnet Migration**: 40-60 hours
- **Mainnet Deployment**: 8-16 hours
- **Testing & QA**: 20-30 hours
- **Security Audit** (Recommended): 80-120 hours + external audit cost

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Dev Setup | 1-2 days | - |
| Phase 2: Smart Contracts | 5-7 days | Phase 1 |
| Phase 3: Deployment Scripts | 1-2 days | Phase 2 |
| Phase 4: Frontend | 3-5 days | Phase 2 |
| Phase 5: Testing | 5-7 days | Phases 2-4 |
| Phase 6: Verification | 1-2 days | Phase 5 |
| Phase 7: Migration | 2-3 days | All previous |
| Phase 8: Monitoring | Ongoing | Phase 7 |

**Total Estimated Time**: 3-4 weeks

---

## Risks & Mitigation

### High Priority Risks

1. **Aave Protocol Unavailability**
   - **Impact**: Core yield generation functionality lost
   - **Mitigation**: Integrate Starlay Finance or simplify to direct staking
   - **Status**: Requires decision

2. **Smart Contract Bugs**
   - **Impact**: Loss of user funds
   - **Mitigation**: Comprehensive testing, external audit
   - **Status**: Can be mitigated

3. **User Migration Friction**
   - **Impact**: Loss of users during transition
   - **Mitigation**: Clear communication, migration guides, support
   - **Status**: Can be managed

### Medium Priority Risks

4. **Network Stability**
   - **Impact**: Transaction failures, poor UX
   - **Mitigation**: Multiple RPC endpoints, monitoring
   - **Status**: Monitoring required

5. **Gas Price Volatility**
   - **Impact**: Unexpected costs for users
   - **Mitigation**: Gas price estimation, user warnings
   - **Status**: Can be managed

---

## Resources & Documentation

### Astar Network Documentation
- Official Docs: https://docs.astar.network/
- EVM Guide: https://docs.astar.network/docs/build/evm/
- Network Info: https://docs.astar.network/docs/build/environment/endpoints
- Faucet: https://portal.astar.network/

### Development Tools
- Hardhat: https://hardhat.org/
- Ethers.js: https://docs.ethers.io/v5/
- Foundry: https://book.getfoundry.sh/

### Astar DeFi Ecosystem
- Starlay Finance: https://starlay.finance/
- ArthSwap: https://arthswap.io/
- Algem: https://www.algem.io/

### Block Explorers
- Astar: https://blockscout.com/astar/
- Shibuya: https://blockscout.com/shibuya/

---

## Appendix

### A. Network Parameters Quick Reference

```javascript
// Shibuya Testnet
{
  chainId: 81,
  rpc: "https://evm.shibuya.astar.network",
  symbol: "SBY",
  faucet: "https://portal.astar.network"
}

// Astar Mainnet
{
  chainId: 592,
  rpc: "https://evm.astar.network",
  symbol: "ASTR",
  bridge: "https://portal.astar.network"
}
```

### B. Useful Commands

```bash
# Get testnet tokens
# Visit: https://portal.astar.network/

# Check network connection
npx hardhat run scripts/checkNetwork.js --network shibuya

# Deploy all contracts
npx hardhat run scripts/deployAll.js --network shibuya

# Verify contracts
npx hardhat verify --network shibuya CONTRACT_ADDRESS

# Run full test suite
npx hardhat test
forge test -vvv
```

### C. Migration Support Contacts

- **Astar Developer Support**: Discord - https://discord.gg/astarnetwork
- **Starlay Finance**: https://discord.gg/starlay
- **Community Forum**: https://forum.astar.network/

---

## Conclusion

This migration from Polygon Mumbai to Astar Network requires careful planning and execution. The primary challenge is the unavailability of Aave protocol on Astar, which necessitates either:

1. Simplifying the contract to direct staking (faster, simpler)
2. Integrating with Starlay Finance (maintains yield generation)

**Recommended Approach**: Start with **Option A (Simplified)** for faster migration, then add **Option B (Starlay)** in a subsequent version.

The migration offers significant benefits:
- Lower gas costs (80%+ reduction)
- Access to Polkadot ecosystem
- Native dApp staking rewards
- Growing DeFi ecosystem on Astar

With proper testing and gradual rollout (testnet → mainnet), this migration can be completed successfully within 3-4 weeks.
