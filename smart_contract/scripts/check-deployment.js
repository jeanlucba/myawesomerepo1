const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const network = await ethers.provider.getNetwork();
  
  console.log("=".repeat(60));
  console.log("Deployment Status Check");
  console.log("=".repeat(60));
  
  // Try to load latest deployment
  const deploymentsDir = path.join(__dirname, '../deployments');
  const latestFile = path.join(deploymentsDir, `${network.name}-latest.json`);
  
  if (!fs.existsSync(latestFile)) {
    console.log("\n❌ No deployment found for network:", network.name);
    console.log("   Run deployment first: npm run deploy:shibuya");
    return;
  }
  
  const deployment = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  
  console.log("\n📋 Deployment Info:");
  console.log("   Network:", deployment.network);
  console.log("   Chain ID:", deployment.chainId);
  console.log("   Deployed:", deployment.timestamp);
  console.log("   Deployer:", deployment.deployer);
  
  console.log("\n📄 Contracts:");
  console.log("   PensionFiV2 Proxy:", deployment.contracts.PensionFiV2.proxy);
  console.log("   PensionFiV2 Impl:", deployment.contracts.PensionFiV2.implementation);
  console.log("   TransactionsV2 Proxy:", deployment.contracts.TransactionsV2.proxy);
  console.log("   TransactionsV2 Impl:", deployment.contracts.TransactionsV2.implementation);
  
  // Check contracts
  console.log("\n" + "=".repeat(60));
  console.log("Checking Contract Status");
  console.log("=".repeat(60));
  
  try {
    const pensionFi = await ethers.getContractAt(
      "PensionFiV2",
      deployment.contracts.PensionFiV2.proxy
    );
    
    const health = await pensionFi.getContractHealth();
    console.log("\n✅ PensionFiV2 Status:");
    console.log("   Balance:", ethers.formatEther(health[0]), "ASTR");
    console.log("   Total Staked:", ethers.formatEther(health[1]), "ASTR");
    console.log("   Interest Paid:", ethers.formatEther(health[2]), "ASTR");
    console.log("   Position Count:", health[3].toString());
    console.log("   Is Paused:", health[4]);
    
    const tiers = await pensionFi.getActiveTiers();
    console.log("   Active Tiers:", tiers.map(t => t.toString()).join(", "), "days");
    
    const treasury = await pensionFi.treasury();
    console.log("   Treasury:", treasury);
    
  } catch (error) {
    console.error("❌ Error checking PensionFiV2:", error.message);
  }
  
  try {
    const transactions = await ethers.getContractAt(
      "TransactionsV2",
      deployment.contracts.TransactionsV2.proxy
    );
    
    const txCount = await transactions.transactionCount();
    console.log("\n✅ TransactionsV2 Status:");
    console.log("   Transaction Count:", txCount.toString());
    
  } catch (error) {
    console.error("❌ Error checking TransactionsV2:", error.message);
  }
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
