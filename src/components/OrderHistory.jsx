import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

const OrderHistory = ({ contract, account }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Memoize the fetch function to prevent unnecessary recreations
    const fetchOrders = useCallback(async () => {
        if (!contract || !account) {
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            let _marketId = 0;//default 
            const userOrders = await contract.getOrderBook(_marketId);
            // Ensure we have valid orders and transform them into a safe format
            const safeOrders = userOrders ? userOrders.map(order => ({
                id: order?.id ? order.id.toString() : '0',
                trader: order?.trader || '',
                isYes: order?.isYes || false,
                amount: order?.amount ? order.amount.toString() : '0',
                price: order?.price ? order.price.toString() : '0',
                isBuy: order?.isBuy || false,
                timestamp: order?.timestamp ? order.timestamp.toString() : '0'
            })) : [];
            setOrders(safeOrders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [contract, account]);

    // Initial load effect
    useEffect(() => {
        if (isInitialLoad && contract && account) {
            fetchOrders();
        }
    }, [isInitialLoad, contract, account, fetchOrders]);

    // Set up event listeners
    useEffect(() => {
        if (!contract || !account) {
            setOrders([]);
            return;
        }

        let timeoutId = null;
        const handleTradeEvent = () => {
            // Clear any existing timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            // Set a new timeout
            timeoutId = setTimeout(() => {
                console.log('Trade event detected, refreshing orders...');
                fetchOrders();
            }, 1000); // 1 second debounce
        };

        // Subscribe to Trade event
        contract.on('Trade', handleTradeEvent);

        // Cleanup function
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            contract.off('Trade', handleTradeEvent);
        };
    }, [contract?.address, account, fetchOrders]);

    // Memoize formatting functions
    const formatTimestamp = useCallback((timestamp) => {
        try {
            return new Date(Number(timestamp) * 1000).toLocaleString();
        } catch (error) {
            return 'Invalid Date';
        }
    }, []);

    const formatAmount = useCallback((amount) => {
        try {
            // Display the actual value without Wei to Ether conversion
            return amount.toString();
        } catch (error) {
            return '0';
        }
    }, []);

    // Memoize the table content to prevent unnecessary re-renders
    const tableContent = useMemo(() => {
        if (!contract || !account) {
            return (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400 bg-gray-800">
                        Please connect your wallet
                    </td>
                </tr>
            );
        }

        if (loading) {
            return (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400 bg-gray-800">
                        Loading orders...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-red-400 bg-gray-800">
                        {error}
                    </td>
                </tr>
            );
        }

        if (orders.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400 bg-gray-800">
                        No orders found
                    </td>
                </tr>
            );
        }

        return orders.map((order) => (
            <tr 
                key={order.id}
                className="hover:bg-gray-700 transition-colors duration-200"
            >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isBuy 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-red-900 text-red-200'
                    }`}>
                        {order.isBuy ? 'Buy' : 'Sell'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.isYes 
                            ? 'bg-blue-900 text-blue-200' 
                            : 'bg-yellow-900 text-yellow-200'
                    }`}>
                        {order.isYes ? 'Yes' : 'No'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatAmount(order.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatAmount(order.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatTimestamp(order.timestamp)}
                </td>
            </tr>
        ));
    }, [orders, loading, error, formatAmount, formatTimestamp, contract, account]);

    if (error) {
        return (
            <div className="order-history-wrapper mt-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    Order History
                </h2>
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="order-history-wrapper mt-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Order History
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Amount (META)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Price (META)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {tableContent}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default React.memo(OrderHistory);
