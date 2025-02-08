import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PredictionMarketABI from '../contracts/PredictionMarket_ABI.json';
import MetaTokenABI from '../contracts/MetaToken_ABI.json';

const WalletConnect = ({ onConnect }) => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [metaTokenContract, setMetaTokenContract] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    const contractAddress = "0xfDb6669cF60C1dBfB0f72Ea50A6eC5e0FD6089E1";
    const metaTokenAddress = "0x594f79e85F6f041eb56cF6822FF4125ee316409E";

    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(provider);

                    const contract = new ethers.Contract(
                        contractAddress,
                        PredictionMarketABI,
                        provider
                    );
                    setContract(contract);

                    const metaToken = new ethers.Contract(
                        metaTokenAddress,
                        MetaTokenABI,
                        provider
                    );
                    setMetaTokenContract(metaToken);

                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        handleAccountChange(accounts);
                    }

                    window.ethereum.on('accountsChanged', handleAccountChange);
                    window.ethereum.on('chainChanged', () => window.location.reload());
                } catch (error) {
                    console.error('Error initializing:', error);
                }
            }
        };
        init();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountChange);
                window.ethereum.removeListener('chainChanged', () => {});
            }
        };
    }, [onConnect]);

    const handleAccountChange = async (accounts) => {
        if (accounts.length > 0) {
            const newAccount = accounts[0];
            setAccount(newAccount);
            if (provider && contract && metaTokenContract) {
                const signer = await provider.getSigner();
                const contractWithSigner = contract.connect(signer);
                const metaTokenWithSigner = metaTokenContract.connect(signer);
                onConnect(newAccount, provider, contractWithSigner, metaTokenWithSigner);
            }
        } else {
            setAccount('');
            onConnect('', null, null, null);
        }
    };

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                await handleAccountChange(accounts);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    return (
        <button 
            onClick={connectWallet}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative group px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                ${account 
                    ? 'bg-[#1a1f35] hover:bg-[#1a1f35]/80 text-white border border-white/10' 
                    : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white'}`}
        >
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-0 
                blur-xl transition-opacity duration-300 -z-10 
                ${isHovered ? 'opacity-30' : ''}`} 
            />

            {/* Icon and Text Layout */}
            <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${account ? 'bg-green-400' : 'bg-white'}`} />
                <span className="relative">
                    {account ? formatAddress(account) : 'Connect Wallet'}
                    
                    {/* Hover Animation Line */}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300
                        ${isHovered ? 'w-full' : ''}`} 
                    />
                </span>
            </div>
        </button>
    );
};

export default WalletConnect;
