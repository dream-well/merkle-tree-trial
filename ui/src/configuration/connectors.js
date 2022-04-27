import { InjectedConnector } from "@web3-react/injected-connector";
// import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { TrezorConnector } from "@web3-react/trezor-connector";
import { FrameConnector } from "@web3-react/frame-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { SquarelinkConnector } from "@web3-react/squarelink-connector";
import { TorusConnector } from "@web3-react/torus-connector";
import { AuthereumConnector } from "@web3-react/authereum-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: "https://mainnet.infura.io/v3/1eb884084d77488cb2e87bd298bc7cb8",
  4: "https://rinkeby.infura.io/v3/1eb884084d77488cb2e87bd298bc7cb8",
  56: "https://bsc-dataseed.binance.org",
  97: "https://bsc-dataseed.binance.org",
  137: "https://rpc-mainnet.matic.network",
  250: "https://apis.ankr.com/bbd46eb85b7e4564b4c2424a26a2555e/6fcf448e08d85dc2a0726dea7d38bc8d/fantom/full/main",
  80001: "https://rpc-mumbai.maticvigil.com",
  43114: "https://api.avax.network/ext/bc/C/rpc",
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 250, 80001, 43114],
});

export const injectedtw = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 137, 250, 80001, 43114],
});

// export const network = new NetworkConnector({
//   urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
//   defaultChainId: 1,
//   pollingInterval: POLLING_INTERVAL
// });

export const walletconnect = (chainId) => {
  return new WalletConnectConnector({
    rpc: {
      [chainId]: RPC_URLS[chainId],
    },
    supportedChainIds: [1337, 1, 3, 4, 5, 56, 97, 137, 250, 80001, 43114],
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL,
  });
};

export const WalletLink = (chainId) => {
  return new WalletLinkConnector({
    url: RPC_URLS[chainId],
    appName: "Starter.xyz",
    appLogoUrl: "https://starter.xyz/logo_x200.png",
  });
};

export const ledger = new LedgerConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
});

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: "dummy@abc.xyz",
  manifestAppUrl: "https://8rg3h.csb.app/",
});

export const frame = new FrameConnector({ supportedChainIds: [1] });

export const fortmatic = new FortmaticConnector({
  apiKey: "pk_live_F95FEECB1BE324B5",
  chainId: 1,
});

export const portis = new PortisConnector({
  dAppId: "211b48db-e8cc-4b68-82ad-bf781727ea9e",
  networks: [1, 100],
});

export const squarelink = new SquarelinkConnector({
  clientId: "5f2a2233db82b06b24f9",
  networks: [1, 100],
});

export const torus = new TorusConnector({ chainId: 1 });

export const authereum = new AuthereumConnector({ chainId: 1 });

export const connectorsByName = {
  MetaMask: injected,
  TrustWallet: injectedtw,
  WalletConnect: walletconnect(137),
  Coinbase: WalletLink(137),
};
