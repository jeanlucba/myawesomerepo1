# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] Hardhat dependencies installed (`npm install` in smart_contract/)
- [ ] `.env` file created and configured
- [ ] PRIVATE_KEY set (without 0x prefix)
- [ ] TREASURY_ADDRESS set
- [ ] RPC URLs configured (optional)

### Wallet Preparation
- [ ] Deployer wallet has sufficient ASTR/SBY
  - Shibuya: Get from faucet (https://portal.astar.network)
  - Astar: Ensure 1+ ASTR for deployment + initial funding
- [ ] Treasury wallet address confirmed
- [ ] Multi-sig wallet prepared (for mainnet)

### Code Verification
- [ ] Contracts compile successfully (`npm run compile`)
- [ ] All tests passing (`npm test`)
- [ ] No console.sol imports in production code
- [ ] Contract sizes within limits (`npm run size`)
- [ ] Gas usage acceptable (`npm run test:gas`)

## Testnet Deployment (Shibuya)

### Deploy
- [ ] Run `npm run deploy:shibuya`
- [ ] Save proxy addresses
- [ ] Save implementation addresses
- [ ] Verify deployment info saved to `deployments/`

### Verify
- [ ] Run `node scripts/check-deployment.js --network shibuya`
- [ ] Contract health check passing
- [ ] Active tiers configured correctly
- [ ] Treasury address correct
- [ ] Initial funding confirmed

### Test Functionality
- [ ] Stake small amount (0.1 SBY)
- [ ] Check position created
- [ ] Calculate interest working
- [ ] Attempt early withdrawal (with penalty)
- [ ] Wait for unlock (or test on forked network)
- [ ] Normal withdrawal working
- [ ] Transaction logging working

### Admin Functions
- [ ] Test pause/unpause
- [ ] Test tier updates
- [ ] Test fee updates
- [ ] Test role management

## Mainnet Deployment (Astar)

### Pre-Flight
- [ ] All testnet tests successful
- [ ] Security audit completed (if required)
- [ ] Multi-sig wallet configured
- [ ] Deployment parameters finalized
  - [ ] Initial funding amount
  - [ ] Staking tiers
  - [ ] Fee structure
  - [ ] Stake limits

### Deploy
- [ ] Announce deployment to community
- [ ] Run `npm run deploy:astar`
- [ ] Verify transaction on explorer
- [ ] Save all addresses securely
- [ ] Backup deployment info

### Verify
- [ ] Verify contracts on block explorer
- [ ] Run health check
- [ ] Confirm initial configuration
- [ ] Test small stake (0.1 ASTR)

### Security
- [ ] Transfer DEFAULT_ADMIN_ROLE to multi-sig
- [ ] Grant ADMIN_ROLE to operations team
- [ ] Grant PAUSER_ROLE to monitoring system
- [ ] Remove deployer from sensitive roles
- [ ] Test multi-sig upgrade process

### Monitoring
- [ ] Setup Tenderly/Defender monitoring
- [ ] Configure alerts for:
  - [ ] Large stakes
  - [ ] Unusual withdrawals
  - [ ] Low contract balance
  - [ ] Pause events
  - [ ] Upgrade events
- [ ] Setup daily health checks

## Post-Deployment

### Documentation
- [ ] Update frontend config with addresses
- [ ] Update documentation with deployment info
- [ ] Create user guide
- [ ] Prepare migration guide (from old contracts)

### Communication
- [ ] Announce deployment
- [ ] Share contract addresses
- [ ] Publish verification links
- [ ] Update website/social media

### Monitoring
- [ ] Monitor first 24 hours closely
- [ ] Check for any anomalies
- [ ] Verify gas costs are acceptable
- [ ] Monitor contract balance
- [ ] Track user adoption

### Emergency Preparedness
- [ ] Test pause mechanism
- [ ] Verify rollback script works
- [ ] Prepare emergency response plan
- [ ] Setup communication channels

## Checklist Complete ✅

Deployment Date: ______________
Network: ______________
PensionFiV2 Proxy: ______________
PensionFiV2 Implementation: ______________
TransactionsV2 Proxy: ______________
TransactionsV2 Implementation: ______________
Deployer: ______________
Multi-sig: ______________

Signed: ______________
