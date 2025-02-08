import React, { useState, useEffect } from 'react';
import { FiClock, FiActivity, FiDollarSign, FiUsers, FiUser, FiKey } from 'react-icons/fi';

const MarketInfo = ({ contract }) => {
    const [marketInfo, setMarketInfo] = useState({
        question: '',
        imageUrl: '',
        resolutionTime: '',
        resolved: false,
        outcome: false,
        yesPrice: '0',
        noPrice: '0',
        yesShares: '0',
        noShares: '0',
        creator: '',
        yesToken: '',
        noToken: ''
    });

    useEffect(() => {
        const fetchMarketInfo = async () => {
            if (!contract) return;
            try {
                let _marketId = 0;//default 
                const info = await contract.getMarketInfo(_marketId);
                setMarketInfo({
                    question: info[0],
                    imageUrl: info[1],
                    resolutionTime: info[2].toString(),
                    resolved: info[3],
                    outcome: info[4],
                    yesPrice: info[5].toString(),
                    noPrice: info[6].toString(),
                    yesShares: info[7].toString(),
                    noShares: info[8].toString(),
                    creator: info[9],
                    yesToken: info[10],
                    noToken: info[11]
                });
            } catch (error) {
                console.error('Error fetching market info:', error);
            }
        };

        fetchMarketInfo();
    }, [contract]);

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="bg-gradient-to-br from-[#1a1f35]/80 to-[#1a1f35]/60 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl shadow-black/20">
            {/* Header Section */}
            <div className="border-b border-white/10 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Market Information
                </h2>
            </div>
            
            {/* Market Question and Image */}
            <div className="mb-8">
                <div className="bg-[#1a1f35]/40 rounded-xl p-4 mb-4">
                    <h3 className="text-xl font-semibold text-white leading-relaxed">{marketInfo.question}</h3>
                </div>
                {marketInfo.imageUrl && (
                    <div className="relative group">
                        <img 
                            src={marketInfo.imageUrl} 
                            alt="Market" 
                            className="w-full h-48 object-cover rounded-xl shadow-lg transition-all duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    </div>
                )}
            </div>

            {/* Market Status Section */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#1a1f35]/40 rounded-xl p-4 flex items-start space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <FiClock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-sm mb-1">Resolution Time</h4>
                        <p className="text-white font-medium">{new Date(Number(marketInfo.resolutionTime) * 1000).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-[#1a1f35]/40 rounded-xl p-4 flex items-start space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FiActivity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-gray-400 text-sm mb-1">Status</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            marketInfo.resolved 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                        }`}>
                            {marketInfo.resolved ? 'Resolved' : 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Prices Section */}
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <FiDollarSign className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Market Prices</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-4 hover:from-purple-500/20 hover:to-indigo-500/20 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">Yes Price</h4>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-white text-lg font-semibold">{marketInfo.yesPrice}</span>
                            <span className="text-gray-400 text-xs">META</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-4 hover:from-pink-500/20 hover:to-purple-500/20 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">No Price</h4>
                        <div className="flex items-baseline space-x-1">
                            <span className="text-white text-lg font-semibold">{marketInfo.noPrice}</span>
                            <span className="text-gray-400 text-xs">META</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shares Section */}
            <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                    <FiUsers className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Market Shares</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1f35]/40 rounded-xl p-4 hover:bg-[#1a1f35]/50 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">Yes Shares</h4>
                        <p className="text-white text-lg font-semibold">{marketInfo.yesShares}</p>
                    </div>
                    <div className="bg-[#1a1f35]/40 rounded-xl p-4 hover:bg-[#1a1f35]/50 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">No Shares</h4>
                        <p className="text-white text-lg font-semibold">{marketInfo.noShares}</p>
                    </div>
                </div>
            </div>

            {/* Market Details Section */}
            <div>
                <div className="flex items-center space-x-2 mb-4">
                    <FiKey className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Market Details</h3>
                </div>
                <div className="space-y-4">
                    <div className="bg-[#1a1f35]/40 rounded-xl p-4 hover:bg-[#1a1f35]/50 transition-colors duration-300">
                        <div className="flex items-center space-x-2 mb-2">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <h4 className="text-gray-400 text-sm">Creator Address</h4>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{formatAddress(marketInfo.creator)}</p>
                            <button 
                                onClick={() => navigator.clipboard.writeText(marketInfo.creator)}
                                className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-300"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#1a1f35]/40 rounded-xl p-4 hover:bg-[#1a1f35]/50 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">Yes Token</h4>
                        <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{formatAddress(marketInfo.yesToken)}</p>
                            <button 
                                onClick={() => navigator.clipboard.writeText(marketInfo.yesToken)}
                                className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-300"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#1a1f35]/40 rounded-xl p-4 hover:bg-[#1a1f35]/50 transition-colors duration-300">
                        <h4 className="text-gray-400 text-sm mb-2">No Token</h4>
                        <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{formatAddress(marketInfo.noToken)}</p>
                            <button 
                                onClick={() => navigator.clipboard.writeText(marketInfo.noToken)}
                                className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-300"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketInfo;
