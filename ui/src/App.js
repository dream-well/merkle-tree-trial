import "./App.css";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import MainPage from "./pages/home.jsx";

function App() {
  const getLibrary = (provider) => {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="App">
        <MainPage />
      </div>
    </Web3ReactProvider>
  );
}

export default App;
