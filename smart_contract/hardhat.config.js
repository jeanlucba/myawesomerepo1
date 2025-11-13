require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: false
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },

    // Astar Shibuya Testnet
    shibuya: {
      url: process.env.SHIBUYA_RPC_URL || "https://evm.shibuya.astar.network",
      chainId: 81,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
      timeout: 60000
    },

    // Astar Mainnet
    astar: {
      url: process.env.ASTAR_RPC_URL || "https://evm.astar.network",
      chainId: 592,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000,
      timeout: 60000
    },

    // Shiden Network (Kusama parachain)
    shiden: {
      url: process.env.SHIDEN_RPC_URL || "https://evm.shiden.astar.network",
      chainId: 336,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000
    },

    // Legacy Mumbai (deprecated, for reference only)
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/odpZQIbE3xtAii8qMNePX-0M6fyB8G0V", 
      chainId: 80001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },

  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true, // Enable IR-based code generation for better optimization
    }
  },

  etherscan: {
    apiKey: {
      astar: process.env.ASTAR_API_KEY || "your-api-key",
      shibuya: process.env.SHIBUYA_API_KEY || "your-api-key"
    },
    customChains: [
      {
        network: "astar",
        chainId: 592,
        urls: {
          apiURL: "https://blockscout.com/astar/api",
          browserURL: "https://blockscout.com/astar"
        }
      },
      {
        network: "shibuya",
        chainId: 81,
        urls: {
          apiURL: "https://blockscout.com/shibuya/api",
          browserURL: "https://blockscout.com/shibuya"
        }
      }
    ]
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true
  },

  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  mocha: {
    timeout: 40000
  }
};

