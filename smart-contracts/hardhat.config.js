/**
 * @title Hardhat Configuration
 * @dev Hardhat configuration for NFT Gaming Research 086 smart contracts
 * @notice Configured for Polygon mainnet and Mumbai testnet deployment
 * 
 * Features:
 * - Polygon and Mumbai network configuration
 * - Gas optimization settings
 * - Contract verification setup
 * - Security plugins
 * - Testing framework
 * 
 * TODO: Configure deployment settings:
 * - Private key management
 * - API key configuration
 * - Gas price optimization
 * - Network-specific settings
 */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    // TODO: Configure Polygon mainnet
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
    },
    
    // TODO: Configure Mumbai testnet
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
      timeout: 60000,
    },
    
    // TODO: Configure local development
    hardhat: {
      chainId: 1337,
      gas: "auto",
      gasPrice: "auto",
    },
    
    // TODO: Configure localhost
    localhost: {
      url: "http://127.0.0.1:8545",
      gas: "auto",
      gasPrice: "auto",
    },
  },
  
  // TODO: Configure contract verification
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  
  // TODO: Configure gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 30, // Gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  
  // TODO: Configure contract size optimization
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  
  // TODO: Configure paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // TODO: Configure mocha testing
  mocha: {
    timeout: 60000,
    reporter: "spec",
  },
};
