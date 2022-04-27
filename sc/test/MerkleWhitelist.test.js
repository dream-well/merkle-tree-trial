const chai = require("chai");
const { expect } = require("chai");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { deployContract, MockProvider, solidity } = require("ethereum-waffle");
const { Contract, Wallet, providers, BigNumber } = require("ethers");

const MerkleWhitelist = require("../build/contracts/MerkleWhitelist.json");

const assert = require("assert");

chai.use(solidity);

const overrides = {
  gasLimit: 9999999,
};

// list of wallets
let whitelists = [
  "0x50b922946c86a90be49229e866Ca2fbEd450A071",
  "0x9164b379394c97f1fcb918671c1be2321855fb30",
  "0x065d46a882F14a8BC02Ca366Fe23f211f20909b6",
];

let merkleRoot, merkleData;

async function generate() {
  let flags = {};

  for (let i = 0; i < whitelists.length; i++) {
    if (!flags[whitelists[i]]) {
      flags[whitelists[i]] = true;
    }
  }

  let leafNodes, merkleTree;
  leafNodes = whitelists.map((addr) => keccak256(addr));
  merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  merkleRoot = merkleTree.getHexRoot();

  merkleData = {};
  for (let i = 0; i < whitelists.length; i++) {
    const minterLeaf = leafNodes[i].toString("hex");
    const minterProof = merkleTree.getHexProof(minterLeaf);
    merkleData[whitelists[i]] = {
      leaf: "0x" + minterLeaf,
      proof: minterProof,
    };
  }
}

describe("MerkleWhitelist", () => {
  let merkleWhitelistContract;

  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: "istanbul",
      mnemonic:
        "lift unable shock chronic moment polar dizzy again symbol great motion switch",
      gasLimit: 9999999,
    },
  });

  const [ownerAddress, dev1Wallet, dev2Wallet, dev3Wallet, dev4Wallet] =
    provider.getWallets();

  beforeEach(async () => {
    merkleWhitelistContract = await deployContract(
      ownerAddress,
      MerkleWhitelist,
      [],
      overrides
    );
    console.log("Merklet Whitelist Contract Deployed");
    whitelists = [...whitelists, dev1Wallet.address, dev2Wallet.address];
    await generate();
    console.log("Generated Merkle Root & data");

    await merkleWhitelistContract
      .connect(ownerAddress)
      .setMerkleRoot(merkleRoot);

    console.log("Set Merkle Root done");

    const dev3Merkle = merkleData[dev3Wallet.address];

    await merkleWhitelistContract
      .connect(ownerAddress)
      .addWhitelist(
        dev3Wallet.address,
        dev3Merkle?.leaf ||
          "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
        dev3Merkle?.proof || []
      );
    console.log("Set dev3 Whitelists done");
  });

  it("initialState", async () => {
    const _merkleRoot = await merkleWhitelistContract.merkleRoot();
    assert.ok(
      _merkleRoot === merkleRoot,
      "MERKLE ROOT: MERKLET ROOT is wrong!"
    );
  });

  it("addWhitelist", async () => {
    const isWhitelisted = await merkleWhitelistContract.whitelists(
      dev3Wallet.address
    );
    assert(isWhitelisted == true, "Add Whitelist is working");

    const dev1Merkle = merkleData[dev1Wallet.address];

    await expect(
      merkleWhitelistContract
        .connect(ownerAddress)
        .addWhitelist(
          dev1Wallet.address,
          dev1Merkle?.leaf ||
            "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
          dev1Merkle?.proof || []
        )
    ).to.be.revertedWith("Already valid in Merkle tree");
    console.log("AddWhitelist(dev1): passed");

    const dev3Merkle = merkleData[dev3Wallet.address];
    await expect(
      merkleWhitelistContract
        .connect(ownerAddress)
        .addWhitelist(
          dev3Wallet.address,
          dev3Merkle?.leaf ||
            "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
          dev3Merkle?.proof || []
        )
    ).to.be.revertedWith("Already whitelisted");
    console.log("AddWhitelist(dev3): passed");
  });

  it("withdraw", async () => {
    const dev4Merkle = merkleData[dev4Wallet.address];

    await expect(
      merkleWhitelistContract
        .connect(dev4Wallet)
        .withdraw(
          dev4Merkle?.leaf ||
            "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
          dev4Merkle?.proof || []
        )
    ).to.be.revertedWith("Not whitelisted");

    const dev1Merkle = merkleData[dev1Wallet.address];

    await merkleWhitelistContract
      .connect(dev1Wallet)
      .withdraw(
        dev1Merkle?.leaf ||
          "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
        dev1Merkle?.proof || []
      );

    const isDev1Withdrawn = await merkleWhitelistContract.withdrawn(
      dev1Wallet.address
    );
    assert(isDev1Withdrawn === true, "Dev1 Withdrawn did not work correctly.");
    console.log("Dev1 Withdrawn success");

    const dev2Merkle = merkleData[dev2Wallet.address];
    await merkleWhitelistContract
      .connect(dev2Wallet)
      .withdraw(
        dev2Merkle?.leaf ||
          "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
        dev2Merkle?.proof || []
      );
    const isDev2Withdrawn = await merkleWhitelistContract.withdrawn(
      dev2Wallet.address
    );
    assert(isDev2Withdrawn === true, "Dev2 Withdrawn did not work correctly.");
    console.log("Dev2 Withdrawn success");

    const dev3Merkle = merkleData[dev3Wallet.address];
    await merkleWhitelistContract
      .connect(dev3Wallet)
      .withdraw(
        dev3Merkle?.leaf ||
          "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
        dev3Merkle?.proof || []
      );
    const isDev3Withdrawn = await merkleWhitelistContract.withdrawn(
      dev3Wallet.address
    );
    assert(isDev3Withdrawn === true, "Dev3 Withdrawn did not work correctly.");
    console.log("Dev3 Withdrawn success");
  });
});
