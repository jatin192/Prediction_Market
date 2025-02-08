import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MarketList({ contract }) {
  const [markets, setMarkets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarkets = async () => {
      if (contract) {
        try {
          const allMarkets = await contract.getAllMarketsInfo();
          setMarkets(allMarkets);
        } catch (error) {
          console.error('Error fetching markets:', error);
        }
      }
    };

    fetchMarkets();
  }, [contract]);

  const filteredMarkets = markets.filter(market =>
    market.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarketClick = (marketId) => {
    navigate(`/market/${marketId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-xl bg-[#1a1f35]/50 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
        />
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market) => (
          <div
            key={market.id.toString()}
            onClick={() => handleMarketClick(market.id)}
            className="bg-[#1a1f35]/50 backdrop-blur-lg rounded-xl border border-white/10 p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            {market.imageUrl && (
              <img
                src={market.imageUrl}
                alt={market.question}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{market.question}</h3>
            <div className="flex justify-between items-center text-gray-400">
              <span>Total Liquidity: {market.totalLiquidity.toString()}</span>
              <span>{market.resolved ? 'Resolved' : 'Active'}</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default MarketList;
