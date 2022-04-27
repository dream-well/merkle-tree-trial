import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";

import { connectorsByName, injected } from "../configuration/connectors";

export const useAccount = () => {
  const web3Context = useWeb3React();
  const [web3, setWeb3] = useState(undefined);
  const { connector, library, account, activate, active, chainId, deactivate } =
    web3Context;

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        console.info("injecting...");
        activate(injected);
        injected.on("Web3ReactDeactivate", () => {});
      }
    });
  }, [activate]);

  useEffect(() => {
    if (active && chainId !== 97) {
      console.log("Invalid Chain", chainId);
      deactivate();
    }
  }, [active, account, library, chainId, web3Context, deactivate]);

  useEffect(() => {
    if (web3Context?.library?.provider) {
      console.info("setting web3 provider...");
      setWeb3(new Web3(web3Context.library.provider));
    } else {
      setWeb3(undefined);
    }
  }, [account, web3Context, library]);

  const connectWallet = async (name) => {
    console.log("Connect Wallet -> ", name);
    await activate(connectorsByName[name]);
  };

  const disconnectWallet = () => {
    console.log("Disconnect Wallet");
    if (deactivate) {
      deactivate();
    }
    if (connector && connector.close) {
      connector.close();
    }
  };

  return {
    account: { address: account },
    web3,
    connectWallet,
    disconnectWallet,
  };
};
