# PensionFi Astar Migration - Installation Guide

## Quick Start

### Prerequisites
- Node.js v18+ 
- npm or yarn
- Git
- (Optional) Foundry for smart contract testing

### 1. Install Smart Contract Dependencies

```bash
cd smart_contract
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

#### Smart Contract
```bash
cd smart_contract
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

#### Frontend
```bash
cd client
cp .env.example .env
# Edit .env with your configuration
```

### 4. Verify Installation

#### Test Smart Contract Setup
```bash
cd smart_contract
npx hardhat --version
# Should output: 2.19.5
```

#### Test Frontend Setup
```bash
cd client
npm run type-check
# Should complete with no errors

npm run dev
# Should open http://localhost:5173
```

## What's Installed

✅ Smart contract dependencies upgraded (OpenZeppelin v5, ethers v6)  
✅ Hardhat configured for Astar networks  
✅ Frontend upgraded to React 18 + TypeScript  
✅ ethers.js v6 + wagmi v2 for Web3  
✅ Vite 5.x build pipeline  
✅ All linting and formatting tools  

## Next Steps

Ready for **Phase 2: Smart Contract Modernization**

See `PHASE1_COMPLETE.md` for detailed information.
