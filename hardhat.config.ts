import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: process.env['POLYGON_MUMBAI_API'],
      accounts: [process.env['POLYGON_MUMBAI_SK']!],
      chainId: 80001,
    },
    polygon: {
      url: process.env['POLYGON_MAINNET_API'],
      accounts: [process.env['POLYGON_MAINNET_SK']!],
      chainId: 137,
    }
  },
  etherscan: {
    apiKey: process.env['POLYGONSCAN_API_KEY'],
  },
};

export default config;
