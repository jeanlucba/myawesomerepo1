const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PensionFiV2", function () {
  let pensionFi;
  let owner, treasury, user1, user2, admin, pauser;
  
  const ONE_YEAR_DAYS = 365;
  const TWO_YEAR_DAYS = 730;
  const FIVE_YEAR_DAYS = 1825;
  
  const ONE_ASTR = ethers.parseEther("1");
  const TEN_ASTR = ethers.parseEther("10");
  const HUNDRED_ASTR = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, treasury, user1, user2, admin, pauser] = await ethers.getSigners();
    
    const PensionFiV2 = await ethers.getContractFactory("PensionFiV2");
    pensionFi = await upgrades.deployProxy(
      PensionFiV2,
      [treasury.address],
      { initializer: "initialize", kind: "uups" }
    );
    
    await pensionFi.waitForDeployment();
    
    // Fund contract for interest payments
    await owner.sendTransaction({
      to: await pensionFi.getAddress(),
      value: HUNDRED_ASTR
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await pensionFi.DEFAULT_ADMIN_ROLE();
      expect(
        await pensionFi.hasRole(DEFAULT_ADMIN_ROLE, owner.address)
      ).to.be.true;
    });

    it("Should initialize with correct default tiers", async function () {
      const tier365 = await pensionFi.getTier(365);
      expect(tier365.apyBasisPoints).to.equal(1200); // 12%
      expect(tier365.active).to.be.true;
    });

    it("Should set treasury address", async function () {
      expect(await pensionFi.treasury()).to.equal(treasury.address);
    });

    it("Should set early withdrawal fee to 10%", async function () {
      expect(await pensionFi.earlyWithdrawalFeeBps()).to.equal(1000);
    });
  });

  describe("Staking", function () {
    it("Should allow staking with valid tier", async function () {
      await expect(
        pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR })
      ).to.emit(pensionFi, "PositionCreated");
      
      const position = await pensionFi.getPosition(0);
      expect(position.weiStaked).to.equal(ONE_ASTR);
      expect(position.walletAddress).to.equal(user1.address);
      expect(position.open).to.be.true;
    });

    it("Should reject staking below minimum", async function () {
      const tooSmall = ethers.parseEther("0.05");
      await expect(
        pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: tooSmall })
      ).to.be.revertedWith("PensionFi: Below minimum stake");
    });

    it("Should reject staking with invalid tier", async function () {
      await expect(
        pensionFi.connect(user1).stakeTokens(100, { value: ONE_ASTR })
      ).to.be.revertedWith("PensionFi: Invalid staking tier");
    });

    it("Should update total staked", async function () {
      await pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR });
      expect(await pensionFi.totalStaked()).to.equal(ONE_ASTR);
      
      await pensionFi.connect(user2).stakeTokens(TWO_YEAR_DAYS, { value: TEN_ASTR });
      expect(await pensionFi.totalStaked()).to.equal(ONE_ASTR + TEN_ASTR);
    });

    it("Should track user positions", async function () {
      await pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR });
      await pensionFi.connect(user1).stakeTokens(TWO_YEAR_DAYS, { value: ONE_ASTR });
      
      const positions = await pensionFi.getPositionsByAddress(user1.address);
      expect(positions.length).to.equal(2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR });
    });

    it("Should allow withdrawal after lock period with interest", async function () {
      // Fast forward time
      await time.increase(ONE_YEAR_DAYS * 24 * 60 * 60);
      
      const position = await pensionFi.getPosition(0);
      const initialBalance = await ethers.provider.getBalance(user1.address);
      
      await expect(
        pensionFi.connect(user1).closePosition(0)
      ).to.emit(pensionFi, "PositionClosed");
      
      // Position should be closed
      const closedPosition = await pensionFi.getPosition(0);
      expect(closedPosition.open).to.be.false;
      expect(closedPosition.claimed).to.be.true;
    });

    it("Should allow early withdrawal with penalty and no interest", async function () {
      const position = await pensionFi.getPosition(0);
      const fee = (position.weiStaked * BigInt(1000)) / BigInt(10000); // 10% fee
      
      await expect(
        pensionFi.connect(user1).closePosition(0)
      ).to.emit(pensionFi, "PositionClosed");
      
      // No interest should be paid
      const closedPosition = await pensionFi.getPosition(0);
      expect(closedPosition.claimed).to.be.false;
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(
        pensionFi.connect(user2).closePosition(0)
      ).to.be.revertedWith("PensionFi: Not position owner");
    });

    it("Should reject double withdrawal", async function () {
      await time.increase(ONE_YEAR_DAYS * 24 * 60 * 60);
      
      await pensionFi.connect(user1).closePosition(0);
      
      await expect(
        pensionFi.connect(user1).closePosition(0)
      ).to.be.revertedWith("PensionFi: Position already closed");
    });
  });

  describe("Interest Calculation", function () {
    it("Should calculate interest correctly for 1 year at 12%", async function () {
      const interest = await pensionFi.calculateInterest(1200, ONE_YEAR_DAYS, ONE_ASTR);
      expect(interest).to.equal(ethers.parseEther("0.12")); // 12% of 1 ASTR
    });

    it("Should calculate interest correctly for 2 years at 25%", async function () {
      const interest = await pensionFi.calculateInterest(2500, TWO_YEAR_DAYS, ONE_ASTR);
      expect(interest).to.equal(ethers.parseEther("0.25")); // 25% of 1 ASTR
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update tiers", async function () {
      const ADMIN_ROLE = await pensionFi.ADMIN_ROLE();
      await pensionFi.grantRole(ADMIN_ROLE, admin.address);
      
      await expect(
        pensionFi.connect(admin).setStakingTier(
          90, // 90 days
          500, // 5% APY
          true,
          ethers.parseEther("0.1"),
          ethers.parseEther("100")
        )
      ).to.emit(pensionFi, "TierUpdated");
      
      const tier = await pensionFi.getTier(90);
      expect(tier.apyBasisPoints).to.equal(500);
    });

    it("Should reject non-admin tier updates", async function () {
      await expect(
        pensionFi.connect(user1).setStakingTier(90, 500, true, ONE_ASTR, TEN_ASTR)
      ).to.be.reverted;
    });

    it("Should allow admin to update early withdrawal fee", async function () {
      const ADMIN_ROLE = await pensionFi.ADMIN_ROLE();
      await pensionFi.grantRole(ADMIN_ROLE, admin.address);
      
      await pensionFi.connect(admin).setEarlyWithdrawalFee(2000); // 20%
      expect(await pensionFi.earlyWithdrawalFeeBps()).to.equal(2000);
    });

    it("Should reject excessive early withdrawal fee", async function () {
      const ADMIN_ROLE = await pensionFi.ADMIN_ROLE();
      await pensionFi.grantRole(ADMIN_ROLE, admin.address);
      
      await expect(
        pensionFi.connect(admin).setEarlyWithdrawalFee(6000) // 60%
      ).to.be.revertedWith("PensionFi: Fee too high");
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow pauser to pause contract", async function () {
      const PAUSER_ROLE = await pensionFi.PAUSER_ROLE();
      await pensionFi.grantRole(PAUSER_ROLE, pauser.address);
      
      await pensionFi.connect(pauser).pause();
      expect(await pensionFi.paused()).to.be.true;
    });

    it("Should prevent staking when paused", async function () {
      await pensionFi.pause();
      
      await expect(
        pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR })
      ).to.be.reverted;
    });

    it("Should allow unpausing", async function () {
      await pensionFi.pause();
      await pensionFi.unpause();
      expect(await pensionFi.paused()).to.be.false;
    });
  });

  describe("Upgradeability", function () {
    it("Should be upgradeable by admin", async function () {
      const PensionFiV2New = await ethers.getContractFactory("PensionFiV2");
      const upgraded = await upgrades.upgradeProxy(
        await pensionFi.getAddress(),
        PensionFiV2New
      );
      
      // State should persist
      expect(await upgraded.treasury()).to.equal(treasury.address);
    });
  });

  describe("Contract Health", function () {
    it("Should return correct health metrics", async function () {
      await pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR });
      
      const health = await pensionFi.getContractHealth();
      expect(health[1]).to.equal(ONE_ASTR); // totalStaked
      expect(health[3]).to.equal(1); // positionCount
      expect(health[4]).to.be.false; // isPaused
    });
  });

  describe("Withdrawal Check", function () {
    beforeEach(async function () {
      await pensionFi.connect(user1).stakeTokens(ONE_YEAR_DAYS, { value: ONE_ASTR });
    });

    it("Should correctly identify early withdrawal", async function () {
      const check = await pensionFi.checkWithdrawal(0);
      expect(check.canWithdraw).to.be.true;
      expect(check.isEarly).to.be.true;
      expect(check.timeRemaining).to.be.gt(0);
    });

    it("Should correctly identify mature withdrawal", async function () {
      await time.increase(ONE_YEAR_DAYS * 24 * 60 * 60);
      
      const check = await pensionFi.checkWithdrawal(0);
      expect(check.canWithdraw).to.be.true;
      expect(check.isEarly).to.be.false;
      expect(check.timeRemaining).to.equal(0);
    });
  });
});
