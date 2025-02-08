import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Link, useLocation } from 'react-router-dom';
import WalletConnect from './components/WalletConnect';
import PredictionMarket from './components/PredictionMarket';
import MarketList from './components/MarketList';
import Faucet from './components/Faucet';
import LandingPage from './components/LandingPage';
import './App.css';
import Footer from './components/Footer';

function MarketWrapper({ account, provider, contract }) {
  const { marketId } = useParams();
  return (
    <PredictionMarket 
      account={account} 
      provider={provider} 
      contract={contract} 
      marketId={marketId}
    />
  );
}

function Header({ account, onConnect }) {
  const location = useLocation();
  const showFaucetLink = location.pathname !== '/faucet';

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0f1629]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
              Prediction Market
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {showFaucetLink && (
              <Link 
                to="/faucet" 
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#8B5CF6]/20 to-[#6366F1]/20 text-white hover:from-[#8B5CF6]/30 hover:to-[#6366F1]/30 transition-all duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Faucet
              </Link>
            )}
            <WalletConnect onConnect={onConnect} />
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [metaTokenContract, setMetaTokenContract] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletConnect = (account, provider, contract, metaTokenContract) => {
    setAccount(account);
    setProvider(provider);
    setContract(contract);
    setMetaTokenContract(metaTokenContract);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#0f1629] to-[#1a1f35] flex flex-col">
        <Header account={account} onConnect={handleWalletConnect} />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/markets" element={<MarketList account={account} provider={provider} contract={contract} />} />
            <Route path="/market/:marketId" element={<MarketWrapper account={account} provider={provider} contract={contract} />} />
            <Route path="/faucet" element={<Faucet account={account} metaTokenContract={metaTokenContract} />} />
          </Routes>
        </div>
        <Footer></Footer>
      </div>
    </Router>
  );
}

export default App;
