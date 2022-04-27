const { ethers, Wallet, ContractFactory } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const MerkleWhitelist = "./build/contracts/MerkleWhitelist.json";

const MerkleContractAddress = "0xA1fd19810D5520B6a464241f7dE00e67fC838854";
let provider, wallet, connectedWallet;

if (process.env.NETWORK == "mainnet") {
  provider = ethers.providers.getDefaultProvider(
    "https://bsc-dataseed1.binance.org"
  );
} else if (process.env.NETWORK == "testnet") {
  provider = ethers.getDefaultProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545"
  );
}

wallet = new Wallet(process.env.PRIVATE_KEY);
connectedWallet = wallet.connect(provider);

const unpackArtifact = (artifactPath) => {
  let contractData = JSON.parse(fs.readFileSync(artifactPath));

  const contractBytecode = contractData["bytecode"];
  const contractABI = contractData["abi"];
  const constructorArgs = contractABI.filter((itm) => {
    return itm.type == "constructor";
  });

  let constructorStr;
  if (constructorArgs.length < 1) {
    constructorStr = " -- No constructor arguments -- ";
  } else {
    constructorJSON = constructorArgs[0].inputs;
    constructorStr = JSON.stringify(
      constructorJSON.map((c) => {
        return {
          name: c.name,
          type: c.type,
        };
      })
    );
  }

  return {
    abi: contractABI,
    bytecode: contractBytecode,
    contractName: contractData.contractName,
    constructor: constructorStr,
  };
};

const deployContract = async (
  contractABI,
  contractBytecode,
  wallet,
  provider,
  args = []
) => {
  const factory = new ContractFactory(
    contractABI,
    contractBytecode,
    wallet.connect(provider)
  );
  return await factory.deploy(...args);
};

const deploy = async (artifactPath, args) => {
  try {
    let tokenUnpacked = unpackArtifact(artifactPath);
    console.log(
      `${tokenUnpacked.contractName} \n Constructor: ${tokenUnpacked.constructor}`
    );
    const token = await deployContract(
      tokenUnpacked.abi,
      tokenUnpacked.bytecode,
      wallet,
      provider,
      args
    );
    console.log(
      `⌛ Deploying ${tokenUnpacked.contractName}... ${token.deployTransaction.hash} ${token.address}`
    );

    await connectedWallet.provider.waitForTransaction(
      token.deployTransaction.hash
    );
    console.log(
      `✅ Deployed ${tokenUnpacked.contractName} to ${token.address} ${token.deployTransaction.hash}`
    );
  } catch (err) {
    console.log("deploy ======>", err);
  }
};

if (!MerkleContractAddress) {
  deploy(MerkleWhitelist, []);
}
