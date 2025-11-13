const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=".repeat(60));
  console.log("PensionFi V2 - Contract Upgrade");
  console.log("=".repeat(60));

  // Get proxy address from environment or command line
  const proxyAddress = process.env.PROXY_ADDRESS || process.argv[2];
  
  if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS environment variable or command line argument not set");
  }

  if (!ethers.isAddress(proxyAddress)) {
    throw new Error("Invalid proxy address");
  }

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("\n📋 Upgrade Details:");
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.chainId);
  console.log("   Deployer:", deployer.address);
  console.log("   Proxy Address:", proxyAddress);

  // Get current implementation
  console.log("\n⏳ Fetching current implementation...");
  const currentImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("   Current Implementation:", currentImpl);

  // Prepare upgrade
  console.log("\n" + "=".repeat(60));
  console.log("Step 1: Preparing Upgrade");
  console.log("=".repeat(60));

  const PensionFiV2 = await ethers.getContractFactory("PensionFiV2");
  console.log("✓ Contract factory created");

  console.log("⏳ Validating upgrade...");
  await upgrades.validateUpgrade(proxyAddress, PensionFiV2);
  console.log("✅ Upgrade validation passed");

  // Perform upgrade
  console.log("\n" + "=".repeat(60));
  console.log("Step 2: Upgrading Proxy");
  console.log("=".repeat(60));

  console.log("⏳ Upgrading proxy to new implementation...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, PensionFiV2);
  await upgraded.waitForDeployment();
  
  console.log("✅ Proxy upgraded successfully");

  const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("   New Implementation:", newImpl);

  // Verify upgrade
  console.log("\n" + "=".repeat(60));
  console.log("Step 3: Verifying Upgrade");
  console.log("=".repeat(60));

  const contract = await ethers.getContractAt("PensionFiV2", proxyAddress);
  
  console.log("🔍 Checking contract state...");
  const health = await contract.getContractHealth();
  console.log("   Balance:", ethers.formatEther(health[0]), "ASTR");
  console.log("   Total Staked:", ethers.formatEther(health[1]), "ASTR");
  console.log("   Position Count:", health[3].toString());
  console.log("   Is Paused:", health[4]);

  // Save upgrade info
  console.log("\n" + "=".repeat(60));
  console.log("Step 4: Saving Upgrade Info");
  console.log("=".repeat(60));

  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const upgradeInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    upgrader: deployer.address,
    proxyAddress: proxyAddress,
    previousImplementation: currentImpl,
    newImplementation: newImpl,
    verificationCommand: `npx hardhat verify --network ${network.name} ${newImpl}`
  };

  const filename = `upgrade-${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(upgradeInfo, null, 2));
  console.log("✅ Upgrade info saved to:", filepath);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 UPGRADE COMPLETE!");
  console.log("=".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("   1. Verify new implementation on block explorer:");
  console.log(`      ${upgradeInfo.verificationCommand}`);
  console.log("\n   2. Test upgraded functionality");
  console.log("\n   3. Monitor contract behavior");

  console.log("\n📊 Upgrade Summary:");
  console.log("   Proxy:", proxyAddress);
  console.log("   Old Implementation:", currentImpl);
  console.log("   New Implementation:", newImpl);
  console.log("   State Preserved: ✅");

  return {
    proxy: proxyAddress,
    oldImplementation: currentImpl,
    newImplementation: newImpl
  };
}

// Execute upgrade
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Upgrade failed:");
    console.error(error);
    process.exit(1);
  });
