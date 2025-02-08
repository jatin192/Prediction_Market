// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface PredictionMarket {
    struct MarketInfo {
        string question;
        string imageUrl;
        uint256 resolutionTime;
        bool resolved; //**********
        bool outcome;
        uint256 yesPrice;
        uint256 noPrice;
        uint256 yesShares;
        uint256 noShares;
        address creator;
        address yesToken;
        address noToken;
    }
    
    function getMarketInfo(uint256 _marketId) external view returns (MarketInfo memory);
    function resolveMarket(uint256 _marketId, bool _outcome) external;
} 
 // sepolia -> 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43   ->   https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1
contract BTCPredictionAutomation is AutomationCompatibleInterface {
    PredictionMarket public predictionMarket;
    AggregatorV3Interface public btcPriceFeed;
    uint256 public constant PRICE_TARGET = 100000 * 10**8;
    uint256 public marketId;
    
    constructor(
        address _predictionMarket,
        address _btcPriceFeed,
        uint256 _marketId
    ) {
        predictionMarket = PredictionMarket(_predictionMarket);
        btcPriceFeed = AggregatorV3Interface(_btcPriceFeed);
        marketId = _marketId;
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        PredictionMarket.MarketInfo memory info = predictionMarket.getMarketInfo(marketId);
        
        if (!info.resolved && block.timestamp >= info.resolutionTime) {
            (, int256 price,,,) = btcPriceFeed.latestRoundData();
            bool outcome = uint256(price) >= PRICE_TARGET;
            performData = abi.encode(outcome);
            return (true, performData);
        }
        
        return (false, "");
    }

    function performUpkeep(bytes calldata performData)
        external
        override
    {
        bool outcome = abi.decode(performData, (bool));
        predictionMarket.resolveMarket(marketId, outcome);
    }

    function getBTCPrice() public view returns (uint256) {
        (, int256 price,,,) = btcPriceFeed.latestRoundData();
        return uint256(price);
    }
}

// Chainlink nodes call checkUpkeep hourly
// Contract checks if market resolution time reached
// If ready, gets BTC price from Chainlink oracle
// Resolves market based on BTC price vs $100k target
// No manual intervention needed after deployment