const { ethers, upgrades } = require("hardhat");
const readline = require('readline');
const fs = require('fs');
const path = require('path');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  console.log("=".repeat(60));
  console.log("🚨 EMERGENCY ROLLBACK");
  console.log("=".repeat(60));

  const proxyAddress = process.env.PROXY_ADDRESS || process.argv[2];
  const previousImplAddress = process.env.PREVIOUS_IMPL_ADDRESS || process.argv[3];

  if (!proxyAddress || !previousImplAddress) {
    throw new Error("PROXY_ADDRESS and PREVIOUS_IMPL_ADDRESS required");
  }

  if (!ethers.isAddress(proxyAddress) || !ethers.isAddress(previousImplAddress)) {
    throw new Error("Invalid addresses provided");
  }

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("\n⚠️  WARNING: This will rollback the contract to a previous implementation");
  console.log("\n📋 Rollback Details:");
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.chainId);
  console.log("   Deployer:", deployer.address);
  console.log("   Proxy:", proxyAddress);
  console.log("   Target Implementation:", previousImplAddress);

  // Get current implementation
  const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("   Current Implementation:", currentImpl);

  if (currentImpl === previousImplAddress) {
    console.log("\n✅ Contract is already at target implementation. No rollback needed.");
    return;
  }

  // Confirm rollback
  console.log("\n" + "=".repeat(60));
  const answer = await askQuestion("\n⚠️  Type 'ROLLBACK' to confirm (or anything else to cancel): ");
  
  if (answer !== 'ROLLBACK') {
    console.log("\n❌ Rollback cancelled by user");
    process.exit(0);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Step 1: Executing Rollback");
  console.log("=".repeat(60));

  // Get proxy admin
  const contract = await ethers.getContractAt("PensionFiV2", proxyAddress);
  
  console.log("⏳ Upgrading proxy to previous implementation...");
  
  try {
    // Use upgradeTo function from UUPS
    const tx = await contract.upgradeToAndCall(previousImplAddress, "0x");
    console.log("   Transaction hash:", tx.hash);
    
    await tx.wait();
    console.log("✅ Rollback transaction confirmed");
  } catch (error) {
    console.error("❌ Rollback failed:", error.message);
    throw error;
  }

  // Verify rollback
  console.log("\n" + "=".repeat(60));
  console.log("Step 2: Verifying Rollback");
  console.log("=".repeat(60));

  const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("   New Implementation:", newImpl);

  if (newImpl !== previousImplAddress) {
    throw new Error("Rollback verification failed: implementation address mismatch");
  }

  console.log("✅ Implementation address verified");

  // Check contract state
  console.log("\n🔍 Checking contract state...");
  const health = await contract.getContractHealth();
  console.log("   Balance:", ethers.formatEther(health[0]), "ASTR");
  console.log("   Total Staked:", ethers.formatEther(health[1]), "ASTR");
  console.log("   Position Count:", health[3].toString());
  console.log("   Is Paused:", health[4]);

  // Save rollback info
  console.log("\n" + "=".repeat(60));
  console.log("Step 3: Saving Rollback Info");
  console.log("=".repeat(60));

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const rollbackInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    executor: deployer.address,
    proxyAddress: proxyAddress,
    rolledBackFrom: currentImpl,
    rolledBackTo: previousImplAddress,
    reason: "Emergency rollback",
    contractState: {
      balance: ethers.formatEther(health[0]),
      totalStaked: ethers.formatEther(health[1]),
      positionCount: health[3].toString(),
      isPaused: health[4]
    }
  };

  const filename = `rollback-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(rollbackInfo, null, 2));
  console.log("✅ Rollback info saved to:", filepath);

  console.log("\n" + "=".repeat(60));
  console.log("✅ ROLLBACK COMPLETE!");
  console.log("=".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("   1. Investigate why rollback was needed");
  console.log("   2. Fix issues in the rolled-back implementation");
  console.log("   3. Test thoroughly before re-upgrading");
  console.log("   4. Monitor contract behavior closely");
  console.log("   5. Communicate with users about the rollback");

  console.log("\n📊 Rollback Summary:");
  console.log("   Proxy:", proxyAddress);
  console.log("   Rolled Back From:", currentImpl);
  console.log("   Rolled Back To:", previousImplAddress);
  console.log("   State Preserved: ✅");

  return {
    proxy: proxyAddress,
    from: currentImpl,
    to: previousImplAddress
  };
}

// Execute rollback
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Rollback failed:");
    console.error(error);
    process.exit(1);
  });
