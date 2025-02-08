import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FaucetAnimation from './FaucetAnimation';

function Faucet({ account, metaTokenContract }) {
    const navigate = useNavigate();
    const [balance, setBalance] = useState('0');
    const [timeUntilNextMint, setTimeUntilNextMint] = useState(0);
    const [loading, setLoading] = useState(false);

    const updateBalance = async () => {
        if (metaTokenContract && account) {
            try {
                const balance = await metaTokenContract.checkBalance(account);
                setBalance(ethers.formatEther(balance));
            } catch (error) {
                console.error("Error fetching balance:", error);
            }
        }
    };

    const updateTimeUntilNextMint = async () => {
        if (metaTokenContract && account) {
            try {
                const time = await metaTokenContract.timeUntilNextMint(account);
                setTimeUntilNextMint(Number(time));
            } catch (error) {
                console.error("Error fetching next mint time:", error);
            }
        }
    };

    useEffect(() => {
        updateBalance();
        updateTimeUntilNextMint();
        const interval = setInterval(() => {
            updateTimeUntilNextMint();
            updateBalance();
        }, 1000);
        return () => clearInterval(interval);
    }, [account, metaTokenContract]);

    const handleMint = async () => {
        if (!metaTokenContract || !account) {
            console.error("MetaToken contract or account not available");
            return;
        }
        
        try {
            setLoading(true);
            console.log("Initiating faucet mint...");
            const tx = await metaTokenContract.faucet();
            console.log("Transaction sent:", tx.hash);
            console.log("Waiting for transaction confirmation...");
            await tx.wait();
            console.log("Transaction confirmed!");
            await updateBalance();
            await updateTimeUntilNextMint();
        } catch (error) {
            console.error("Error minting tokens:", error);
            if (error.message.includes("You must wait 24 hours")) {
                alert("You must wait 24 hours before minting again");
            } else {
                alert("Error minting tokens. Check console for details.");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return "Now";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0f1629] to-[#1a1f35]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <motion.button
                            whileHover={{ x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="text-violet-400 hover:text-violet-300 transition-colors duration-200 flex items-center group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Markets
                        </motion.button>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            Token Faucet
                        </h2>
                    </div>

                    {/* Animated Icon */}
                    <FaucetAnimation />
                    
                    <div className="space-y-6">
                        <motion.div 
                            className="bg-white/5 p-6 rounded-xl border border-white/10"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-violet-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-400">Your Balance</p>
                            </div>
                            <div className="flex items-baseline">
                                <p className="text-3xl font-bold text-white">{balance}</p>
                                <p className="ml-2 text-violet-400 font-semibold">META</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-white/5 p-6 rounded-xl border border-white/10"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex items-center mb-2">
                                <svg className="w-5 h-5 text-violet-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-400">Time until next mint</p>
                            </div>
                            <p className="text-2xl font-semibold text-white">{formatTime(timeUntilNextMint)}</p>
                        </motion.div>

                        <motion.button
                            onClick={handleMint}
                            disabled={loading || timeUntilNextMint > 0}
                            whileHover={!(loading || timeUntilNextMint > 0) ? { scale: 1.02 } : {}}
                            whileTap={!(loading || timeUntilNextMint > 0) ? { scale: 0.98 } : {}}
                            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 relative overflow-hidden group
                                ${loading || timeUntilNextMint > 0
                                    ? 'bg-gray-600/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90'
                                }`}
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Minting...' : timeUntilNextMint > 0 ? 'Wait for Cooldown' : 'Mint 1000 META'}
                            </span>
                            {!(loading || timeUntilNextMint > 0) && (
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
                                    <div className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-violet-500 rounded-full opacity-30 group-hover:rotate-90"></div>
                                </div>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Faucet;
