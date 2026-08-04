import { defineConfig } from "hardhat/config";
import toolbox from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [toolbox],

  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },

    // sepolia: {
    //   type: "http",
    //   chainType: "l1",
    //   url: process.env.SEPOLIA_RPC_URL!,
    //   accounts: process.env.PRIVATE_KEY
    //     ? [process.env.PRIVATE_KEY]
    //     : [],
    // },
  },
});