import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MetaTokenABI from '../contracts/MetaToken_ABI.json';
import PredictionMarketABI from '../contracts/PredictionMarket_ABI.json';
import MarketInfo from './MarketInfo';
import OrderHistory from './OrderHistory';
import UserPositions from './UserPositions';
import { FiGift, FiAward } from 'react-icons/fi';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';

function PredictionMarket({ account, provider, contract, marketId }) {
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [tradeType, setTradeType] = useState('buy');
    const [amount, setAmount] = useState('0');
    const [shares, setShares] = useState('0');
    const [potentialReturn, setPotentialReturn] = useState('0');
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [error, setError] = useState(null);
    const [contracts, setContracts] = useState({
        predictionMarket: null,
        metaToken: null
    });
    const [claimLoading, setClaimLoading] = useState(false);

    const metaTokenAddress = "0x594f79e85F6f041eb56cF6822FF4125ee316409E";
    const predictionMarketAddress = "0xfDb6669cF60C1dBfB0f72Ea50A6eC5e0FD6089E1";

    // Initialize contracts when provider changes
    useEffect(() => {
        if (provider) {
            const predictionMarketContract = contract || new ethers.Contract(predictionMarketAddress, PredictionMarketABI, provider);
            const metaTokenContract = new ethers.Contract(metaTokenAddress, MetaTokenABI, provider);
            setContracts({
                predictionMarket: predictionMarketContract,
                metaToken: metaTokenContract
            });
        }
    }, [provider, contract]);

    useEffect(() => {
        if (contracts.predictionMarket && marketId) {
            // Any existing market-specific logic here
        }
    }, [contracts.predictionMarket, marketId]);

    const calculateReturns = useCallback(async () => {
        if (!amount || amount === '0' || !selectedOutcome || !contracts.predictionMarket || !provider) {
            console.log('Resetting values due to invalid input');
            setShares('0');
            setPotentialReturn('0');
            return;
        }

        try {
            const amountInWei = ethers.parseEther(amount);
            const isYes = selectedOutcome === 'yes';
            const isBuy = tradeType === 'buy';

            // Get expected shares
            const shares = await contracts.predictionMarket.getExpectedShares(marketId, isYes, amountInWei, isBuy);
            const formattedShares = ethers.formatEther(shares);
            console.log('Setting shares to:', formattedShares);
            setShares(formattedShares);

            // Get potential return
            const [potentialReturnAmount] = await contracts.predictionMarket.getPotentialReturn(marketId, amountInWei, isYes, isBuy);
            const formattedReturn = ethers.formatEther(potentialReturnAmount);
            console.log('Setting potential return to:', formattedReturn);
            setPotentialReturn(formattedReturn);
        } catch (error) {
            console.error('Error calculating returns:', error);
            setShares('0');
            setPotentialReturn('0');
        }
    }, [amount, selectedOutcome, tradeType, contracts.predictionMarket, provider, marketId]);

    const handleAmountChange = (newAmount) => {
        if (/^\d*\.?\d*$/.test(newAmount)) {
            setAmount(newAmount === '' ? '0' : newAmount);
            calculateReturns();
        }
    };

    const handleOutcomeSelect = (outcome) => {
        setSelectedOutcome(outcome);
        calculateReturns();
    };

    const handleTradeTypeSelect = (type) => {
        setTradeType(type);
        calculateReturns();
    };

    const handleTrade = async () => {
        if (!account || !amount || !selectedOutcome || !provider) return;
        
        try {
            setLoading(true);
            const signer = await provider.getSigner();
            const metaTokenWithSigner = contracts.metaToken.connect(signer);
            const predictionMarketWithSigner = contracts.predictionMarket.connect(signer);

            // For approve, we need Wei conversion
            const amountInWei = ethers.parseEther(amount.toString());

            const isYes = selectedOutcome === 'yes';
            const isBuy = tradeType === 'buy';

            if (isBuy) {
                setApproving(true);
                try {
                    const approveTx = await metaTokenWithSigner.approve(
                        predictionMarketAddress, 
                        amountInWei,
                        {
                            gasLimit: 100000
                        }
                    );
                    await approveTx.wait();
                } catch (error) {
                    console.error('Error approving tokens:', error);
                    setError('Failed to approve tokens');
                    setApproving(false);
                    setLoading(false);
                    return;
                }
                setApproving(false);
            }

            // Execute trade with regular number (not Wei)
            console.log("Trade Parameters:", {
                marketId: marketId,
                isYes: isYes,
                amount: amount, // Using regular number
                isBuy: isBuy
            });

            try {
                // Pass the amount directly without Wei conversion for trade
                const tx = await predictionMarketWithSigner.trade(
                    marketId, // marketId
                    isYes,
                    amount, // Regular number, not Wei
                    isBuy,
                    {
                        gasLimit: 500000
                    }
                );
                console.log("Transaction sent:", tx.hash);
                await tx.wait();
                console.log("Transaction confirmed");
            } catch (error) {
                console.error('Detailed trade error:', {
                    error: error,
                    errorMessage: error.message,
                    errorData: error.data,
                    errorCode: error.code
                });
                throw error; // Re-throw to be caught by outer try-catch
            }

            setAmount('');
            calculateReturns();
            // Optionally refresh market data here
        } catch (error) {
            console.error('Error executing trade:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimRewards = async () => {
        if (!account || !contracts.predictionMarket || !provider) return;
        
        try {
            setClaimLoading(true);
            const signer = await provider.getSigner();
            const predictionMarketWithSigner = contracts.predictionMarket.connect(signer);

            const tx = await predictionMarketWithSigner.claimRewards(marketId, {
                gasLimit: 500000
            });
            
            console.log("Claim transaction sent:", tx.hash);
            await tx.wait();
            console.log("Claim transaction confirmed");
            
            // You might want to refresh user positions or other data here
            
        } catch (error) {
            console.error('Error claiming rewards:', error);
        } finally {
            setClaimLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Market Info - Left Side */}
                <div className="w-full">
                    <MarketInfo contract={contracts.predictionMarket} />
                </div>
                
                {/* Trading Interface - Right Side */}
                <div className="w-full flex justify-center">
                    <div className="max-w-md w-full">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Trade Shares
                            </h2>
                            <p className="text-gray-400 text-sm mt-2">
                                Buy or sell shares based on your market prediction
                            </p>
                        </div>
                        <div className="bg-[#1a1f35]/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl shadow-black/20">
                            {/* Trade Type Selection */}
                            <div className="bg-[#1a1f35]/80 rounded-xl p-1.5">
                                <div className="grid grid-cols-2 gap-1.5">
                                    {['buy', 'sell'].map((type) => (
                                        <button 
                                            key={type}
                                            className={`py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                                ${tradeType === type 
                                                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-lg shadow-[#8B5CF6]/25' 
                                                    : 'text-gray-400 hover:bg-white/5'}`}
                                            onClick={() => handleTradeTypeSelect(type)}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Outcome Selection */}
                            <div className="bg-[#1a1f35]/80 rounded-xl p-1.5">
                                <div className="grid grid-cols-2 gap-1.5">
                                    {['yes', 'no'].map((outcome) => (
                                        <button
                                            key={outcome}
                                            className={`py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                                ${selectedOutcome === outcome 
                                                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-lg shadow-[#8B5CF6]/25' 
                                                    : 'text-gray-400 hover:bg-white/5'}`}
                                            onClick={() => handleOutcomeSelect(outcome)}
                                        >
                                            {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Amount (META)</label>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => handleAmountChange(e.target.value)}
                                    className="w-full bg-[#1a1f35]/80 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50"
                                    placeholder="0"
                                />
                            </div>

                            {/* Trade Information */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">You will receive</span>
                                    <span className="text-white font-medium">{shares} shares</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Potential Return</span>
                                    <span className="text-white font-medium">{potentialReturn} META</span>
                                </div>
                            </div>

                            {/* Trade Button */}
                            <button
                                onClick={handleTrade}
                                disabled={loading || !selectedOutcome || amount === '0'}
                                className={`w-full py-3.5 rounded-lg text-white font-semibold transition-all duration-200
                                    ${loading 
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#8B5CF6]/25'}`}
                            >
                                {loading ? 'Processing...' : `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Shares`}
                            </button>

                            {/* Terms of Use */}
                            <p className="text-center text-xs text-gray-500">
                                By trading, you agree to the Terms of Use
                            </p>
                        </div>

                        {/* User Positions */}
                        <div className="mt-8">
                            <UserPositions 
                                account={account}
                                contract={contracts.predictionMarket}
                                marketId={marketId}
                            />
                            
                            {/* Claim Rewards Section */}
                            <div className="mt-6 bg-gradient-to-br from-[#1a1f35]/60 to-[#1a1f35]/40 rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                                            <FiAward className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Claim Rewards</h3>
                                            <p className="text-sm text-gray-400">Get your prediction rewards! 🎉</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RiMoneyDollarCircleLine className="w-5 h-5 text-green-400" />
                                        <FiGift className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                                
                                <button
                                    onClick={handleClaimRewards}
                                    disabled={claimLoading}
                                    className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200
                                        ${claimLoading 
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/25'}`}
                                >
                                    {claimLoading ? (
                                        'Claiming...'
                                    ) : (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Claim Rewards</span>
                                            <span>🏆</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order History - Center Below */}
            <div className="w-full max-w-4xl mx-auto mt-12">
                <OrderHistory contract={contracts.predictionMarket} account={account} marketId={marketId} />
            </div>
        </div>
    );
}

export default PredictionMarket;
