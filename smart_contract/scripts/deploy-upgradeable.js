const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("=".repeat(60));
  console.log("PensionFi V2 - UUPS Proxy Deployment");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("\n📋 Deployment Details:");
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.chainId);
  console.log("   Deployer:", deployer.address);
  console.log("   Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ASTR/SBY");

  // Get treasury address from env or use deployer
  const treasury = process.env.TREASURY_ADDRESS || deployer.address;
  console.log("   Treasury:", treasury);

  // Validate treasury address
  if (!ethers.isAddress(treasury)) {
    throw new Error("Invalid treasury address");
  }

  console.log("\n" + "=".repeat(60));
  console.log("Step 1: Deploying PensionFiV2");
  console.log("=".repeat(60));

  const PensionFiV2 = await ethers.getContractFactory("PensionFiV2");
  console.log("✓ Contract factory created");

  console.log("⏳ Deploying proxy...");
  const pensionFi = await upgrades.deployProxy(
    PensionFiV2,
    [treasury],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );

  await pensionFi.waitForDeployment();
  const pensionFiAddress = await pensionFi.getAddress();
  
  console.log("✅ PensionFiV2 Proxy deployed to:", pensionFiAddress);

  const implAddress = await upgrades.erc1967.getImplementationAddress(
    pensionFiAddress
  );
  console.log("✅ PensionFiV2 Implementation deployed to:", implAddress);

  // Fund contract with initial capital
  const initialFunding = process.env.INITIAL_FUNDING || "100";
  console.log(`\n⏳ Funding contract with ${initialFunding} ASTR...`);
  
  const fundTx = await deployer.sendTransaction({
    to: pensionFiAddress,
    value: ethers.parseEther(initialFunding)
  });
  await fundTx.wait();
  console.log("✅ Contract funded");

  console.log("\n" + "=".repeat(60));
  console.log("Step 2: Deploying TransactionsV2");
  console.log("=".repeat(60));

  const TransactionsV2 = await ethers.getContractFactory("TransactionsV2");
  console.log("✓ Contract factory created");

  console.log("⏳ Deploying proxy...");
  const transactions = await upgrades.deployProxy(
    TransactionsV2,
    [],
    { 
      initializer: "initialize",
      kind: "uups"
    }
  );

  await transactions.waitForDeployment();
  const transactionsAddress = await transactions.getAddress();
  
  console.log("✅ TransactionsV2 Proxy deployed to:", transactionsAddress);

  const transactionsImplAddress = await upgrades.erc1967.getImplementationAddress(
    transactionsAddress
  );
  console.log("✅ TransactionsV2 Implementation deployed to:", transactionsImplAddress);

  console.log("\n" + "=".repeat(60));
  console.log("Step 3: Verifying Deployment");
  console.log("=".repeat(60));

  // Verify PensionFiV2
  console.log("\n🔍 Verifying PensionFiV2...");
  const contractHealth = await pensionFi.getContractHealth();
  console.log("   Balance:", ethers.formatEther(contractHealth[0]), "ASTR");
  console.log("   Total Staked:", ethers.formatEther(contractHealth[1]), "ASTR");
  console.log("   Position Count:", contractHealth[3].toString());
  console.log("   Is Paused:", contractHealth[4]);

  const tiers = await pensionFi.getActiveTiers();
  console.log("   Active Tiers:", tiers.map(t => t.toString()).join(", "), "days");

  // Verify TransactionsV2
  console.log("\n🔍 Verifying TransactionsV2...");
  const txCount = await transactions.transactionCount();
  console.log("   Transaction Count:", txCount.toString());

  console.log("\n" + "=".repeat(60));
  console.log("Step 4: Saving Deployment Info");
  console.log("=".repeat(60));

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    treasury: treasury,
    initialFunding: initialFunding,
    contracts: {
      PensionFiV2: {
        proxy: pensionFiAddress,
        implementation: implAddress
      },
      TransactionsV2: {
        proxy: transactionsAddress,
        implementation: transactionsImplAddress
      }
    },
    verificationCommands: {
      pensionFi: `npx hardhat verify --network ${network.name} ${implAddress}`,
      transactions: `npx hardhat verify --network ${network.name} ${transactionsImplAddress}`
    }
  };

  const filename = `${network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", filepath);

  // Also save as latest
  const latestFilepath = path.join(deploymentsDir, `${network.name}-latest.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Latest deployment saved to:", latestFilepath);

  // Create frontend config
  console.log("\n" + "=".repeat(60));
  console.log("Step 5: Creating Frontend Config");
  console.log("=".repeat(60));

  const frontendConfig = `// Auto-generated on ${new Date().toISOString()}
// Network: ${network.name} (Chain ID: ${network.chainId})

export const NETWORK = '${network.name}'
export const CHAIN_ID = ${network.chainId}

export const CONTRACTS = {
  PensionFiV2: {
    address: '${pensionFiAddress}',
    implementation: '${implAddress}'
  },
  TransactionsV2: {
    address: '${transactionsAddress}',
    implementation: '${transactionsImplAddress}'
  }
}

export const TREASURY = '${treasury}'
export const DEPLOYER = '${deployer.address}'
`;

  const configPath = path.join(__dirname, '../config.js');
  fs.writeFileSync(configPath, frontendConfig);
  console.log("✅ Frontend config saved to:", configPath);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));

  console.log("\n📝 Next Steps:");
  console.log("   1. Verify contracts on block explorer:");
  console.log(`      ${deploymentInfo.verificationCommands.pensionFi}`);
  console.log(`      ${deploymentInfo.verificationCommands.transactions}`);
  console.log("\n   2. Update frontend with contract addresses");
  console.log("\n   3. Test staking functionality");
  console.log("\n   4. Transfer ownership to multi-sig (if mainnet)");

  console.log("\n📊 Deployment Summary:");
  console.log("   Network:", network.name);
  console.log("   PensionFiV2:", pensionFiAddress);
  console.log("   TransactionsV2:", transactionsAddress);
  console.log("   Gas Used: Check transaction receipts above");

  return {
    pensionFi: pensionFiAddress,
    transactions: transactionsAddress
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
