# PensionFi Smart Contracts V2

Modern, upgradeable staking platform on Astar Network.

## Features

- ✅ UUPS Upgradeable Contracts
- ✅ Role-Based Access Control
- ✅ Emergency Pause Mechanism
- ✅ Reentrancy Protection
- ✅ Gas Optimized
- ✅ Comprehensive Test Suite

## Quick Start

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env
# Edit .env and set your PRIVATE_KEY and TREASURY_ADDRESS
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy

```bash
# Shibuya Testnet
npm run deploy:shibuya

# Astar Mainnet
npm run deploy:astar
```

## Contract Architecture

### PensionFiV2

Main staking contract with the following features:

- **Staking**: Lock ASTR tokens for fixed periods (365, 730, 1825 days)
- **Interest**: Earn fixed APY (12%, 25%, 75%)
- **Early Withdrawal**: Withdraw early with 10% penalty (no interest)
- **Role-Based Access**: Admin, Pauser, Treasury roles
- **Upgradeable**: UUPS pattern for future improvements

### TransactionsV2

Transaction logging contract for recording on-chain events.

## Available Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Shibuya testnet
npm run deploy:shibuya

# Deploy to Astar mainnet
npm run deploy:astar

# Upgrade existing deployment
PROXY_ADDRESS=0x... npm run upgrade -- --network shibuya

# Check deployment status
node scripts/check-deployment.js --network shibuya

# Interact with deployed contract
node scripts/interact.js --network shibuya

# Emergency rollback
PROXY_ADDRESS=0x... PREVIOUS_IMPL_ADDRESS=0x... node scripts/rollback.js

# Lint contracts
npm run lint

# Format contracts
npm run format

# Check contract sizes
npm run size

# Gas reporting
npm run test:gas
```

## Networks

### Shibuya Testnet
- Chain ID: 81
- RPC: https://evm.shibuya.astar.network
- Faucet: https://portal.astar.network
- Explorer: https://shibuya.subscan.io

### Astar Mainnet
- Chain ID: 592
- RPC: https://evm.astar.network
- Explorer: https://astar.subscan.io

## Contract Roles

### DEFAULT_ADMIN_ROLE
- Grant/revoke other roles
- Authorize contract upgrades
- Update treasury address

### ADMIN_ROLE
- Update staking tiers
- Set early withdrawal fees
- Adjust stake limits

### PAUSER_ROLE
- Pause contract operations
- Unpause contract

### TREASURY_ROLE
- Withdraw excess funds
- Manage contract reserves

## Usage Example

```javascript
const { ethers } = require("hardhat");

// Get contract instance
const pensionFi = await ethers.getContractAt(
  "PensionFiV2",
  "0x..." // deployed address
);

// Stake 1 ASTR for 365 days
await pensionFi.stakeTokens(365, { 
  value: ethers.parseEther("1") 
});

// Check positions
const positions = await pensionFi.getPositionsByAddress(address);

// Withdraw position
await pensionFi.closePosition(positionId);
```

## Testing

The test suite includes:

- Deployment tests
- Staking functionality
- Withdrawal flows (early and normal)
- Interest calculations
- Admin functions
- Emergency controls
- Upgradeability
- Access control

Run tests with coverage:

```bash
npm run test:coverage
```

## Security

- ✅ Audited by: [Pending]
- ✅ OpenZeppelin Contracts v5.0.1
- ✅ Reentrancy Guards
- ✅ Access Control
- ✅ Emergency Pause

## Gas Optimization

The contracts are optimized for gas efficiency:

- Struct packing (50% storage reduction)
- Efficient data structures
- Minimal storage operations
- Batched operations where possible

## Upgradeability

Contracts use UUPS (Universal Upgradeable Proxy Standard):

1. **Deploy**: Proxy + Implementation
2. **Upgrade**: Deploy new implementation, call `upgradeToAndCall()`
3. **Rollback**: Revert to previous implementation if needed

All upgrades are controlled by DEFAULT_ADMIN_ROLE.

## License

MIT

## Support

- Documentation: See `ASTAR_MODERNIZATION_SPEC.md`
- Issues: GitHub Issues
- Community: [Discord/Telegram]
