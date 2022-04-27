import React, { useState } from "react";
import { useTarget } from "../hooks/useTarget";
import { useAccount } from "../hooks/useAccount";

const Home = () => {
  const { account, connectWallet, disconnectWallet } = useAccount();
  const {
    withdrawn: isWithdrawn,
    withdraw,
    isAdmin,
    addWhitelist,
  } = useTarget(account);
  const [whitelistAddress, setWhitelistAddress] = useState("");

  const onConnectDisconnect = () => {
    console.log("onConnectDisconnect", account);
    if (account && account.address) {
      disconnectWallet();
    } else {
      connectWallet("MetaMask");
    }
  };

  const onWithdraw = () => {
    console.log("onWithdraw", account);
    if (!account || !account.address) {
      return;
    }
    withdraw();
  };

  const onWhitelist = () => {
    console.log("on Whitelist", account);
    if (!account || !account.address || !isAdmin) {
      return;
    }
    addWhitelist(whitelistAddress);
  };

  return (
    <div className="main-container">
      {account && account.address && (
        <div className="target-container">
          <div className="withdrawn-status">
            <h3 className="withdrawn-address">{account && account.address}</h3>
            <h5 className="withdrawn-text">
              {isWithdrawn ? "Already Withdrawn." : "Not withdrawn yet."}
            </h5>
          </div>
          <button
            className="withdraw-button"
            onClick={() => {
              onWithdraw();
            }}
          >
            Withdraw
          </button>
        </div>
      )}

      <div className="button-container">
        <h3>{(!account || !account.address) && "Connect to BSC testnet"}</h3>
        <button
          className="connect-button"
          onClick={() => {
            onConnectDisconnect();
          }}
        >
          {account && account.address ? "Disconnect" : "Connect"}
        </button>
      </div>
      {account && account.address && isAdmin && (
        <div className="admin-container">
          <h3 className="admin-heading"> Admin Feature</h3>
          <div className="action-container">
            <input
              className="whitelist-input"
              type="text"
              value={whitelistAddress}
              onChange={(ev) => {
                setWhitelistAddress(ev.target.value);
              }}
            />
            <button
              className="whitelist-button"
              onClick={() => {
                onWhitelist();
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
