require("dotenv").config();

var HDWalletProvider = require("truffle-hdwallet-provider");
var privateKey = process.env["PRIVATE_KEY"];
var bscscanKey = process.env["BSCSCAN_KEY"];

module.exports = {
  api_keys: {
    bscscan: bscscanKey,
  },
  networks: {
    mainnet: {
      provider: function () {
        return new HDWalletProvider(
          privateKey,
          "https://bsc-dataseed1.binance.org",
          0,
          1
        );
      },
      network_id: 56,
      gas: 6000000,
      confirmations: 3,
      timeoutBlocks: 4000,
    },
    testnet: {
      provider: () =>
        new HDWalletProvider(
          privateKey,
          `https://data-seed-prebsc-1-s1.binance.org:8545`,
          0,
          1
        ),
      network_id: 97,
      timeoutBlocks: 4000,
      confirmations: 3,
      production: true, // Treats this network as if it was a public net. (default: false)
    },
  },
  mocha: {
    timeout: 100000,
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.0", // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  plugins: ["truffle-contract-size", "truffle-plugin-verify"],
};
