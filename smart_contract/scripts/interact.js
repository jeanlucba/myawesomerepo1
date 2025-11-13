const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("=".repeat(60));
  console.log("Contract Interaction Script");
  console.log("=".repeat(60));
  console.log("Network:", network.name);
  console.log("Signer:", signer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ASTR");
  
  // Load deployment
  const deploymentsDir = path.join(__dirname, '../deployments');
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);
  
  if (!fs.existsSync(latestFile)) {
    throw new Error("No deployment found. Run deployment first.");
  }
  
  const deployment = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const pensionFiAddress = deployment.contracts.PensionFiV2.proxy;
  
  console.log("\nContract:", pensionFiAddress);
  
  const pensionFi = await ethers.getContractAt("PensionFiV2", pensionFiAddress);
  
  // Example interactions
  console.log("\n" + "=".repeat(60));
  console.log("Example: Stake 1 ASTR for 365 days");
  console.log("=".repeat(60));
  
  const stakeAmount = ethers.parseEther("1");
  const daysLocked = 365;
  
  console.log("Amount:", ethers.formatEther(stakeAmount), "ASTR");
  console.log("Period:", daysLocked, "days");
  
  // Check tier
  const tier = await pensionFi.getTier(daysLocked);
  console.log("\nTier Details:");
  console.log("  APY:", (tier.apyBasisPoints / 100).toFixed(2), "%");
  console.log("  Min Stake:", ethers.formatEther(tier.minStake), "ASTR");
  console.log("  Max Stake:", ethers.formatEther(tier.maxStake), "ASTR");
  console.log("  Active:", tier.active);
  
  // Calculate expected interest
  const expectedInterest = await pensionFi.calculateInterest(
    tier.apyBasisPoints,
    daysLocked,
    stakeAmount
  );
  console.log("  Expected Interest:", ethers.formatEther(expectedInterest), "ASTR");
  
  // Uncomment to actually stake
  // console.log("\n⏳ Staking...");
  // const tx = await pensionFi.stakeTokens(daysLocked, { value: stakeAmount });
  // console.log("Transaction hash:", tx.hash);
  // await tx.wait();
  // console.log("✅ Staked successfully!");
  
  // Check positions
  console.log("\n" + "=".repeat(60));
  console.log("Your Positions");
  console.log("=".repeat(60));
  
  const positionIds = await pensionFi.getPositionsByAddress(signer.address);
  console.log("Total positions:", positionIds.length);
  
  for (const posId of positionIds) {
    const pos = await pensionFi.getPosition(posId);
    const withdrawalInfo = await pensionFi.checkWithdrawal(posId);
    
    console.log(`\nPosition #${posId}:`);
    console.log("  Staked:", ethers.formatEther(pos.weiStaked), "ASTR");
    console.log("  Interest:", ethers.formatEther(pos.weiInterest), "ASTR");
    console.log("  APY:", (pos.percentInterest / 100).toFixed(2), "%");
    console.log("  Unlock Date:", new Date(Number(pos.unlockDate) * 1000).toLocaleString());
    console.log("  Status:", pos.open ? "Open" : "Closed");
    console.log("  Can Withdraw:", withdrawalInfo.canWithdraw);
    console.log("  Early:", withdrawalInfo.isEarly);
    if (withdrawalInfo.timeRemaining > 0) {
      const days = Math.floor(Number(withdrawalInfo.timeRemaining) / 86400);
      console.log("  Time Remaining:", days, "days");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
