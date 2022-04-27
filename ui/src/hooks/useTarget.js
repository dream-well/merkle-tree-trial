import { useCallback, useEffect, useState } from "react";

import { useAccount } from "./useAccount";
import config from "../configuration/config";

export const useTarget = () => {
  const { MerkleData, ContractAbi, ContractAddress } = config;
  const { account, web3 } = useAccount();
  const [withdrawn, setWithdrawn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [account.address, web3]);

  const fetchStats = useCallback(async () => {
    if (!account || !account.address || !web3 || isLoading) {
      return;
    }
    setLoading(true);
    const poolContract = new web3.eth.Contract(ContractAbi, ContractAddress);
    const isWithdrawn = await poolContract.methods
      .withdrawn(account.address)
      .call();
    const owner = await poolContract.methods.owner().call();
    setWithdrawn(isWithdrawn);
    setIsAdmin(owner === account.address);
    setLoading(false);
  }, [account, web3, ContractAbi, ContractAddress]);

  const withdraw = useCallback(async () => {
    const merkleData = MerkleData[account.address];

    try {
      const poolContract = new web3.eth.Contract(ContractAbi, ContractAddress);
      const gasPrice = await web3.eth.getGasPrice();
      const gas = await poolContract.methods
        .withdraw(
          merkleData?.leaf ||
            "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
          merkleData?.proof || []
        )
        .estimateGas({
          from: account.address,
          gasPrice,
        });
      const receipt = await poolContract.methods
        .withdraw(
          merkleData?.leaf ||
            "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
          merkleData?.proof || []
        )
        .send({
          from: account.address,
          gas,
          gasPrice,
        });
      console.info("withdraw receipt", receipt);
      fetchStats();
    } catch (error) {
      console.error(error);
      if (!error.toString().includes("-32601")) {
        throw error;
      }
    }
  }, [account, fetchStats, web3, ContractAbi, ContractAddress, MerkleData]);

  const addWhitelist = useCallback(
    async (whitelistingAddress) => {
      const merkleData = MerkleData[whitelistingAddress];
      try {
        const poolContract = new web3.eth.Contract(
          ContractAbi,
          ContractAddress
        );
        const receipt = await poolContract.methods
          .addWhitelist(
            whitelistingAddress,
            merkleData?.leaf ||
              "0x353a03c25c011e6f6f149dbeeaff5480fff2a257d08e6540732c9c43786cf56f",
            merkleData?.proof || []
          )
          .send({
            from: account.address,
          });
        console.info("add whitelist receipt", receipt);
        fetchStats();
      } catch (error) {
        console.error(error);
        if (!error.toString().includes("-32601")) {
          throw error;
        }
      }
    },
    [account, fetchStats, web3, ContractAbi, ContractAddress, MerkleData]
  );

  return { withdrawn, isLoading, fetchStats, withdraw, isAdmin, addWhitelist };
};
