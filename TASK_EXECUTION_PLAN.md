# PensionFi Astar Migration - Task Execution Plan

## Task Dependencies and Execution Strategy

This document outlines which tasks can be executed in parallel and which must be done consecutively.

---

## Phase 1: Infrastructure & Setup (Week 1)

### 🔵 Parallel Track A: Smart Contract Setup (Days 1-4)
**Can be done simultaneously:**
- ✅ Task 1: Update smart contract dependencies (OpenZeppelin v5, ethers v6)
- ✅ Task 2: Configure Hardhat for Astar networks
- ✅ Task 3: Setup Foundry testing environment

**Dependencies:** None - can start immediately  
**Team:** Backend/Smart Contract Developer  
**Duration:** 3-4 days

---

### 🟢 Parallel Track B: Frontend Setup (Days 1-4)
**Can be done simultaneously with Track A:**
- ✅ Task 5: Upgrade to React 18 and add TypeScript support
- ✅ Task 6: Migrate from ethers.js v5 to v6
- ✅ Task 7: Setup Web3Modal v3 for wallet connections
- ✅ Task 8: Configure Vite 5.x build pipeline

**Dependencies:** None - can start immediately  
**Team:** Frontend Developer  
**Duration:** 3-4 days

---

### 🟡 Sequential Track C: CI/CD (Days 5-7)
**Must wait for Tracks A & B to complete:**
- ⏩ Task 4: Configure CI/CD pipeline with GitHub Actions

**Dependencies:** Requires Task 1-3 (smart contract setup) and Task 5-8 (frontend setup)  
**Team:** DevOps/Full Stack Developer  
**Duration:** 2-3 days

---

## Phase 2: Smart Contract Modernization (Week 2-3)

### 🔵 Parallel Track D: Core Contract Development (Days 1-5)
**Can be done simultaneously:**
- ✅ Task 9: Implement PensionFiV2 with UUPS upgradeable pattern
- ✅ Task 10: Add AccessControl for role-based permissions
- ✅ Task 11: Implement emergency pause/unpause mechanism
- ✅ Task 12: Add ReentrancyGuard to all external functions
- ✅ Task 13: Implement simplified direct staking

**Dependencies:** Phase 1 Track A complete  
**Team:** Smart Contract Developer  
**Duration:** 4-5 days

---

### 🔵 Parallel Track E: Contract Enhancements (Days 1-5)
**Can be done simultaneously with Track D:**
- ✅ Task 14: Add early withdrawal penalty mechanism
- ✅ Task 15: Optimize gas usage with struct packing
- ✅ Task 17: Remove hardhat/console.sol imports

**Dependencies:** Phase 1 Track A complete  
**Team:** Smart Contract Developer (same as Track D, but can interleave)  
**Duration:** 3-4 days

---

### 🔵 Sequential Track F: Auxiliary Contracts (Days 6-7)
**Must wait for Track D to complete:**
- ⏩ Task 16: Update TransactionsV2 with UUPS upgradeability

**Dependencies:** Task 9 complete (UUPS pattern established)  
**Team:** Smart Contract Developer  
**Duration:** 1-2 days

---

### 🔵 Sequential Track G: Deployment Scripts (Days 8-10)
**Must wait for Tracks D, E, F to complete:**
- ⏩ Task 18: Write deployment script for UUPS proxy pattern
- ⏩ Task 19: Write upgrade script for future contract updates
- ⏩ Task 20: Create rollback script for emergency situations

**Dependencies:** All contract code complete (Tasks 9-17)  
**Team:** Smart Contract Developer  
**Duration:** 2-3 days  
**Note:** Tasks 18, 19, 20 can be done in parallel by same developer

---

### 🔵 Sequential Track H: Testnet Deployment (Days 11-14)
**Must wait for Track G to complete:**
- ⏩ Task 21: Deploy and test on Shibuya testnet
- ⏩ Task 22: Verify contracts on Subscan block explorer

**Dependencies:** Deployment scripts complete (Tasks 18-20)  
**Team:** Smart Contract Developer  
**Duration:** 2-3 days  
**Note:** Task 22 must happen after Task 21

---

## Phase 3: Frontend Modernization (Week 3-5)

### 🟢 Parallel Track I: Core Infrastructure (Days 1-3)
**Can be done simultaneously (requires Phase 1 Track B complete):**
- ✅ Task 23: Create TypeScript types for contracts and ABIs
- ✅ Task 24: Implement network configuration (Astar & Shibuya)
- ✅ Task 27: Implement Zustand store for wallet and contract state

**Dependencies:** Phase 1 Track B complete  
**Team:** Frontend Developer  
**Duration:** 2-3 days

---

### 🟢 Sequential Track J: Core Hooks (Days 4-6)
**Must wait for Track I:**
- ⏩ Task 25: Create useContract hook for contract interactions
- ⏩ Task 26: Create useStaking hook with TanStack Query

**Dependencies:** Task 23, 24 complete  
**Team:** Frontend Developer  
**Duration:** 2-3 days  
**Note:** Task 26 depends on Task 25

---

### 🟢 Parallel Track K: UI Components - Wallet (Days 7-9)
**Can be done simultaneously:**
- ✅ Task 28: Build ConnectButton component with wallet connection
- ✅ Task 29: Build NetworkSwitch component for network detection

**Dependencies:** Tasks 25, 27 complete  
**Team:** Frontend Developer  
**Duration:** 2-3 days

---

### 🟢 Parallel Track L: UI Components - Staking (Days 7-12)
**Can be done simultaneously with Track K:**
- ✅ Task 30: Build TierSelector component for staking options
- ✅ Task 31: Build StakeModal component for staking flow
- ✅ Task 32: Build PositionTable component to display user positions

**Dependencies:** Task 26 complete (useStaking hook)  
**Team:** Frontend Developer (can work on different components in parallel)  
**Duration:** 4-5 days

---

### 🟢 Sequential Track M: Main Page Integration (Days 13-15)
**Must wait for Tracks K & L:**
- ⏩ Task 33: Implement main Stake page with complete flow
- ⏩ Task 37: Update config.js with deployed contract addresses

**Dependencies:** Tasks 28-32 complete, Task 21 complete (testnet deployment for addresses)  
**Team:** Frontend Developer  
**Duration:** 2-3 days

---

### 🟢 Parallel Track N: Polish & Refinement (Days 13-17)
**Can be done simultaneously with Track M:**
- ✅ Task 34: Add error boundaries and loading states
- ✅ Task 35: Implement responsive design with Tailwind CSS
- ✅ Task 36: Add transaction confirmation modals

**Dependencies:** Task 33 in progress  
**Team:** Frontend Developer  
**Duration:** 3-4 days

---

## Phase 4: Deployment & Launch (Week 5-6)

### 🔴 Sequential Track O: Mainnet Preparation (Days 1-2)
**Must be done in order:**
1. ⏩ Task 38: Setup multi-sig wallet (Gnosis Safe)
2. ⏩ Task 39: Fund contracts with initial ASTR
3. ⏩ Task 40: Configure production staking tiers
4. ⏩ Task 41: Grant roles to appropriate addresses

**Dependencies:** Phase 2 complete, Phase 3 complete  
**Team:** Project Lead + Smart Contract Developer  
**Duration:** 1-2 days  
**Note:** These must be sequential

---

### 🔴 Sequential Track P: Mainnet Deployment (Days 3-4)
**Must be done in order:**
1. ⏩ Task 42: Deploy contracts to Astar mainnet
2. ⏩ Task 43: Transfer ownership to multi-sig wallet

**Dependencies:** Track O complete  
**Team:** Smart Contract Developer  
**Duration:** 1-2 days  
**Note:** Task 43 must happen after Task 42

---

### 🔴 Parallel Track Q: Monitoring Setup (Days 3-5)
**Can be done simultaneously with Track P:**
- ✅ Task 44: Setup contract monitoring (Tenderly/Defender)
- ✅ Task 47: Enable analytics and user tracking

**Dependencies:** Task 42 in progress  
**Team:** DevOps/Full Stack Developer  
**Duration:** 2-3 days

---

### 🟢 Sequential Track R: Frontend Deployment (Days 5-6)
**Must be done in order:**
1. ⏩ Task 37: Update config.js with mainnet contract addresses (if not done)
2. ⏩ Task 45: Deploy frontend to production hosting
3. ⏩ Task 46: Configure DNS and SSL certificates

**Dependencies:** Task 42 complete (need mainnet addresses)  
**Team:** Frontend Developer + DevOps  
**Duration:** 1-2 days

---

### 🟡 Sequential Track S: Launch Activities (Day 7)
**Must be done in order:**
1. ⏩ Task 48: Run smoke tests on production
2. ⏩ Task 49: Prepare migration guide and documentation
3. ⏩ Task 50: Announce launch to community

**Dependencies:** All previous tracks complete  
**Team:** Full Team  
**Duration:** 1 day

---

## Summary: Maximum Parallelization Strategy

### Week 1: Phase 1
- **2 parallel tracks** (Smart Contract Setup + Frontend Setup)
- Then 1 sequential track (CI/CD)
- **Team size:** 2 developers + 1 DevOps

### Week 2: Phase 2 Part 1
- **2 parallel tracks** (Core Contract + Enhancements)
- Then 1 sequential track (Auxiliary Contracts)
- Then 1 track (Deployment Scripts - 3 tasks in parallel)
- **Team size:** 1-2 smart contract developers

### Week 3: Phase 2 Part 2 + Phase 3 Start
- **1 sequential track** (Testnet Deployment)
- **Parallel:** Frontend Core Infrastructure starts
- **Team size:** 1 smart contract + 1 frontend developer

### Week 4: Phase 3
- **4 parallel tracks** (Core Hooks → Wallet Components + Staking Components)
- **Team size:** 1-2 frontend developers

### Week 5: Phase 3 Completion
- **2 parallel tracks** (Main Page Integration + Polish)
- **Team size:** 1-2 frontend developers

### Week 6: Phase 4
- **Sequential tracks** for mainnet prep and deployment
- **Parallel track** for monitoring setup
- **Sequential tracks** for frontend deployment and launch
- **Team size:** Full team (2-3 people)

---

## Critical Path (Longest Sequential Chain)

The critical path determines minimum project duration:

1. **Phase 1:** Smart Contract Setup (3-4 days)
2. **Phase 2:** Core Contract Development (4-5 days)
3. **Phase 2:** Deployment Scripts (2-3 days)
4. **Phase 2:** Testnet Deployment (2-3 days)
5. **Phase 3:** Core Infrastructure (2-3 days)
6. **Phase 3:** Core Hooks (2-3 days)
7. **Phase 3:** UI Components (4-5 days)
8. **Phase 3:** Main Page Integration (2-3 days)
9. **Phase 4:** Mainnet Preparation (1-2 days)
10. **Phase 4:** Mainnet Deployment (1-2 days)
11. **Phase 4:** Frontend Deployment (1-2 days)
12. **Phase 4:** Launch (1 day)

**Total Critical Path Duration:** ~27-35 days (4-5 weeks)

---

## Optimal Team Composition

### Minimum Team (4-5 weeks):
- **1 Smart Contract Developer** (full-time)
- **1 Frontend Developer** (full-time)
- **1 DevOps/Full Stack** (part-time, ~40%)

### Accelerated Team (3-4 weeks):
- **2 Smart Contract Developers** (full-time)
- **2 Frontend Developers** (full-time)
- **1 DevOps** (full-time)

### Optimal Team (3 weeks):
- **2 Smart Contract Developers** (full-time)
- **2 Frontend Developers** (full-time)
- **1 DevOps** (full-time)
- **1 QA Engineer** (full-time)
- **1 Project Manager** (part-time, ~50%)

---

## Risk Mitigation

### Blockers to Watch:
1. **Task 21 (Testnet Deployment)** - Blocks frontend development if contracts aren't ready
   - **Mitigation:** Use mock contracts for frontend development
   
2. **Task 42 (Mainnet Deployment)** - Blocks everything in Phase 4
   - **Mitigation:** Thorough testing on testnet, have rollback plan ready
   
3. **Task 38 (Multi-sig Setup)** - Can delay mainnet deployment
   - **Mitigation:** Start early, get approvals from all signers beforehand

### Parallel Work Conflicts:
- Tasks 9-15 (Smart Contract Dev) - Same developer, prioritize core (9-13) over enhancements (14-15)
- Tasks 30-32 (UI Components) - Can be split between developers or done iteratively
- Phase 1 and Phase 2 start - Frontend can use mock contracts to unblock development

---

## Recommended Execution Order

```
Week 1:
├─ Day 1-4:  Tasks 1,2,3 (SC Setup) || Tasks 5,6,7,8 (Frontend Setup)
└─ Day 5-7:  Task 4 (CI/CD)

Week 2:
├─ Day 1-5:  Tasks 9,10,11,12,13 (Core Contracts) || Tasks 14,15,17 (Enhancements)
├─ Day 6-7:  Task 16 (TransactionsV2)
└─ Day 8-10: Tasks 18,19,20 (Deployment Scripts)

Week 3:
├─ Day 1-3:  Task 21,22 (Testnet Deploy)
├─ Day 4-7:  Tasks 23,24,27 (Frontend Core) || Task 25,26 (Hooks)

Week 4:
├─ Day 1-5:  Tasks 28,29 (Wallet UI) || Tasks 30,31,32 (Staking UI)
└─ Day 6-7:  Task 33 (Main Page)

Week 5:
├─ Day 1-3:  Task 33,37 (Page + Config) || Tasks 34,35,36 (Polish)
├─ Day 4-5:  Tasks 38,39,40,41 (Mainnet Prep)
└─ Day 6-7:  Task 42,43 (Mainnet Deploy) || Task 44,47 (Monitoring)

Week 6:
├─ Day 1-2:  Tasks 45,46 (Frontend Deploy)
└─ Day 3:    Tasks 48,49,50 (Launch)
```

---

## Dependencies Matrix

| Task | Depends On | Can Run Parallel With |
|------|------------|----------------------|
| 1-3 | None | 5-8 |
| 4 | 1-3, 5-8 | None |
| 5-8 | None | 1-3 |
| 9-13 | 1-3 | 14-15, 17 |
| 14-15, 17 | 1-3 | 9-13 |
| 16 | 9 | None |
| 18-20 | 9-17 | Each other |
| 21 | 18 | None |
| 22 | 21 | None |
| 23-24, 27 | 5-8 | Each other |
| 25 | 23-24 | None |
| 26 | 25 | None |
| 28-29 | 25, 27 | 30-32 |
| 30-32 | 26 | 28-29, each other |
| 33 | 28-32 | 34-36 |
| 34-36 | 33 (in progress) | Each other |
| 37 | 21 or 42 | None |
| 38-41 | Phase 2, 3 complete | None (sequential) |
| 42 | 38-41 | None |
| 43 | 42 | 44, 47 |
| 44, 47 | 42 | Each other, 45-46 |
| 45-46 | 37, 42 | 44, 47 |
| 48-50 | All previous | None (sequential) |

---

**Document Created:** November 13, 2025  
**Last Updated:** November 13, 2025
