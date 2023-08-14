import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// If not set, you can get your own Alchemy API key at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "";
// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses ours Polygonscan default API key.
// Get a free API key at https://polygonscan.com
const polygonscanApiKey = process.env.POLYGONSCAN_API_KEY || "VQWT52WF4W4KVSUX5U17QTDEDHIQTJA7NK";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
  },
  etherscan: {
    apiKey: `${polygonscanApiKey}`,
  },
};

export default config;
