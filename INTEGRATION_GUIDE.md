# PensionFi - Integration Guide

Complete guide to integrate frontend with deployed smart contracts.

---

## Prerequisites

✅ Phase 1 complete (dependencies updated)  
✅ Phase 2 complete (contracts deployed)  
✅ Phase 3 complete (frontend built)

---

## Step-by-Step Integration

### Step 1: Compile Smart Contracts

```bash
cd smart_contract
npm install
npm run compile
```

This creates ABI files in `artifacts/contracts/`

---

### Step 2: Copy ABIs to Frontend

```bash
# From project root
cp smart_contract/artifacts/contracts/PensionFiV2.sol/PensionFiV2.json \
   client/src/abis/PensionFiV2.json

cp smart_contract/artifacts/contracts/TransactionsV2.sol/TransactionsV2.json \
   client/src/abis/TransactionsV2.json
```

---

### Step 3: Deploy Contracts to Shibuya

```bash
cd smart_contract

# Setup environment
cp .env.example .env
# Edit .env:
#   PRIVATE_KEY=your_key_without_0x
#   TREASURY_ADDRESS=your_treasury_address

# Get testnet tokens
# Visit: https://portal.astar.network
# Connect wallet and request SBY tokens

# Deploy
npm run deploy:shibuya
```

**Expected Output:**
```
✅ PensionFiV2 Proxy deployed to: 0xABCD...
✅ TransactionsV2 Proxy deployed to: 0xEFGH...
```

**Save these addresses!**

---

### Step 4: Update Frontend Configuration

```bash
cd client

# Create .env file
cp .env.example .env
```

Edit `client/.env`:
```bash
VITE_CHAIN_ID=81
VITE_SHIBUYA_PENSIONFI_ADDRESS=0xABCD... # From Step 3
VITE_SHIBUYA_TRANSACTIONS_ADDRESS=0xEFGH... # From Step 3
VITE_WALLETCONNECT_PROJECT_ID=your_project_id # Get from cloud.walletconnect.com
```

---

### Step 5: Install Frontend Dependencies

```bash
cd client
npm install
```

---

### Step 6: Run Frontend

```bash
npm run dev
```

Opens: http://localhost:5173

---

### Step 7: Test the Application

#### Connect Wallet
1. Click "Connect" button
2. Select MetaMask or WalletConnect
3. Approve connection
4. Verify address appears in header

#### Switch Network (if needed)
1. Click network indicator
2. Select "Shibuya Testnet"
3. Approve network switch in wallet

#### Stake Tokens
1. Select a tier (365, 730, or 1825 days)
2. Enter amount (e.g., "1" ASTR)
3. Review calculations
4. Click "Confirm Stake"
5. Approve transaction in wallet
6. Wait for confirmation

#### View Positions
1. Positions appear automatically below
2. Shows staked amount, interest, unlock date
3. Status indicator shows locked/unlocked

#### Withdraw
1. Click "Withdraw" on a position
2. Confirm transaction
3. If early: 10% penalty, no interest
4. If mature: Full amount + interest

---

## Build for Production

### For Astar Mainnet

#### 1. Deploy Contracts to Mainnet

```bash
cd smart_contract

# Update .env for mainnet
PRIVATE_KEY=your_mainnet_key
TREASURY_ADDRESS=your_treasury_or_multisig
INITIAL_FUNDING=1000 # 1000 ASTR

# Deploy
npm run deploy:astar
```

#### 2. Update Frontend for Mainnet

Edit `client/.env`:
```bash
VITE_CHAIN_ID=592
VITE_ASTAR_PENSIONFI_ADDRESS=0x... # From mainnet deployment
VITE_ASTAR_TRANSACTIONS_ADDRESS=0x...
VITE_ENABLE_ANALYTICS=true
```

#### 3. Build Frontend

```bash
cd client
npm run build
```

Creates optimized production build in `dist/`

#### 4. Deploy Frontend

Upload `client/dist/` to your hosting:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- AWS S3: `aws s3 sync dist/ s3://your-bucket/`
- IPFS: `ipfs add -r dist/`

---

## Troubleshooting

### Contract ABIs Not Found
```bash
# Make sure contracts are compiled
cd smart_contract && npm run compile

# Copy ABIs again
cp artifacts/contracts/PensionFiV2.sol/PensionFiV2.json ../client/src/abis/
```

### Wallet Won't Connect
- Check MetaMask is installed
- Check network is supported
- Try refreshing page
- Check WalletConnect Project ID is valid

### Wrong Network
- Click network indicator
- Select correct network
- Approve network switch

### Transaction Fails
- Check you have enough ASTR for gas
- Check you're on correct network
- Check contract addresses are correct
- Check contract is not paused

### Type Errors
```bash
cd client
npm run type-check
```

### ABIs Out of Date
- Recompile contracts
- Copy ABIs again
- Restart dev server

---

## Environment Variables Reference

### Smart Contract (.env)
```bash
PRIVATE_KEY=                      # Deployer private key (no 0x)
TREASURY_ADDRESS=                 # Treasury wallet address
SHIBUYA_RPC_URL=                  # Optional, has default
ASTAR_RPC_URL=                    # Optional, has default
INITIAL_FUNDING=100               # Initial ASTR to fund contract
```

### Frontend (.env)
```bash
VITE_CHAIN_ID=81                  # 81=Shibuya, 592=Astar
VITE_SHIBUYA_PENSIONFI_ADDRESS=   # Contract on Shibuya
VITE_SHIBUYA_TRANSACTIONS_ADDRESS=
VITE_ASTAR_PENSIONFI_ADDRESS=     # Contract on Astar  
VITE_ASTAR_TRANSACTIONS_ADDRESS=
VITE_WALLETCONNECT_PROJECT_ID=    # From cloud.walletconnect.com
VITE_ENABLE_ANALYTICS=false       # Enable analytics
```

---

## Verification Checklist

- [ ] Smart contracts compiled
- [ ] ABIs copied to frontend
- [ ] Contracts deployed to Shibuya
- [ ] Contract addresses updated in .env
- [ ] Frontend dependencies installed
- [ ] WalletConnect Project ID configured
- [ ] Development server runs
- [ ] Wallet connects successfully
- [ ] Can switch networks
- [ ] Can view staking tiers
- [ ] Can stake tokens
- [ ] Can view positions
- [ ] Can withdraw
- [ ] Build completes successfully

---

## Support

- **Astar Faucet**: https://portal.astar.network
- **WalletConnect**: https://cloud.walletconnect.com
- **Astar Docs**: https://docs.astar.network
- **Wagmi Docs**: https://wagmi.sh

---

## Next: Phase 4 - Deployment & Launch

After integration is complete and tested on Shibuya, proceed to Phase 4 for mainnet deployment.
