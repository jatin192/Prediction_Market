import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UserPositions = ({ account, contract, marketId }) => {
    const [positions, setPositions] = useState({
        yesShares: '0',
        noShares: '0',
        metaBalance: '0'
    });
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initial load effect
    useEffect(() => {
        const fetchPositions = async () => {
            if (!contract || !account || marketId === undefined) return;

            try {
                const result = await contract.getUserPositions(account, marketId);
                console.log('Initial load - User positions:', result);
                
                // Convert BigInt to string before formatting
                const yesShares = result[0].toString();
                const noShares = result[1].toString();
                const metaBalance = result[2].toString();
                
                setPositions({
                    yesShares: yesShares,
                    noShares: noShares,
                    metaBalance: ethers.formatEther(metaBalance)
                });
            } catch (error) {
                console.error('Error fetching user positions:', error);
            } finally {
                setIsInitialLoad(false);
            }
        };

        if (isInitialLoad && contract && account) {
            fetchPositions();
        }
    }, [isInitialLoad, contract, account, marketId]);

    return (
        <div className="mt-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Your Positions
            </h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden p-6">
                <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                        <p className="text-xs font-medium text-white uppercase tracking-wider mb-2">Yes Shares</p>
                        <p className="text-2xl font-bold text-gray-300">{positions.yesShares}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium text-white uppercase tracking-wider mb-2">No Shares</p>
                        <p className="text-2xl font-bold text-gray-300">{positions.noShares}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium text-white uppercase tracking-wider mb-2">Meta Balance</p>
                        <p className="text-2xl font-bold text-gray-300">{Number(positions.metaBalance).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPositions;
