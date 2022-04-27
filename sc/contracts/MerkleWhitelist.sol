// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleWhitelist is Ownable {
    // Merlet root for whitelists
    bytes32 public merkleRoot;
    mapping(address => bool) public whitelists;
    mapping(address => bool) public withdrawn;

    constructor() {}

    function addWhitelist(
        address _newAddr,
        bytes32 leaf,
        bytes32[] memory proof
    ) external onlyOwner {
        require(!whitelists[_newAddr], "Already whitelisted");
        require(
            !verify(merkleRoot, leaf, proof),
            "Already valid in Merkle tree"
        );
        whitelists[_newAddr] = true;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function withdraw(bytes32 leaf, bytes32[] memory proof) external {
        require(
            verify(merkleRoot, leaf, proof) || whitelists[msg.sender],
            "Not whitelisted"
        );
        withdrawn[msg.sender] = true;
    }

    function verify(
        bytes32 root,
        bytes32 leaf,
        bytes32[] memory proof
    ) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }
}
