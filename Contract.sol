// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";


contract MetaToken is ERC20, Ownable, ReentrancyGuard 
{
    uint256 public constant FAUCET_AMOUNT = 1000 * 1e18; // 1000 META tokens
    uint256 public constant COOLDOWN_PERIOD = 1 days; // 24 hours

    mapping(address => uint256) private lastMintTime;

    event FaucetMinted(address indexed user, uint256 amount, uint256 nextMintTime);

    constructor() ERC20("Meta Token", "META") Ownable(msg.sender) {} // Specify deployer as the initial owner

    // Faucet function for users to mint tokens once every 24 hours
    function faucet() external nonReentrant {
        require(block.timestamp >= lastMintTime[msg.sender] + COOLDOWN_PERIOD, "You must wait 24 hours before minting again");

        // Update last mint time
        lastMintTime[msg.sender] = block.timestamp;

        // Mint tokens to the user
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetMinted(msg.sender, FAUCET_AMOUNT, block.timestamp + COOLDOWN_PERIOD);
    }

    // Function for the owner to mint tokens directly
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount * 1e18);
    }

    // Function for the owner to burn tokens directly
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // Check when a user can mint again
    function timeUntilNextMint(address user) external view returns (uint256) {
        if (block.timestamp >= lastMintTime[user] + COOLDOWN_PERIOD) {
            return 0; // Can mint now
        }
        return (lastMintTime[user] + COOLDOWN_PERIOD) - block.timestamp;
    }

    // View function to check balance
    function checkBalance(address account) external view returns (uint256) {
        return balanceOf(account);
    }

    // ERC20 approve function (already provided by OpenZeppelin but exposed here for clarity)
    function approve(address spender, uint256 amount) public override returns (bool) {
        return super.approve(spender, amount);
    }

    // ERC20 allowance function (already provided by OpenZeppelin but exposed here for clarity)
    function allowance(address owner, address spender) public view override returns (uint256) {
        return super.allowance(owner, spender);
    }

    // ERC20 transferFrom function (already provided by OpenZeppelin but exposed here for clarity)
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }
}

//_________________________________________________________________________________________________________________________________________________________________

// Outcome Share Token Contract
contract OutcomeToken is ERC20 {
    address public market;
    
    constructor(string memory name, string memory symbol, address _market) ERC20(name, symbol) {
        market = _market;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == market, "Only market can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == market, "Only market can burn");
        _burn(from, amount);
    }
}

//_________________________________________________________________________________________________________________________________________________________________

contract PredictionMarket is  ReentrancyGuard 
{
    using Math for uint256;
    struct Market 
    {
        uint256 id;
        string question;
        string imageUrl;
        uint256 resolutionTime;
        bool resolved;
        bool outcome;  // true for YES, false for NO
        address yesToken;
        address noToken;
        uint256 totalLiquidity;
        uint256 yesSharesInPool;
        uint256 noSharesInPool;
        address creator;
    }

    struct Order 
    {
        uint256 id;
        address trader;
        bool isYes;  // true for YES shares, false for NO shares
        uint256 amount;
        uint256 price;
        bool isBuy;
        uint256 timestamp;
    }

    struct UserOrderDetails 
    {
        uint256 marketId;
        uint256 orderId;
        bool isYes;
        uint256 amount;
        uint256 price;
        bool isBuy;
        uint256 timestamp;
    }

    MetaToken public metaToken;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public userShares;
    mapping(uint256 => Order[]) public orderBook;
    mapping(address => mapping(uint256 => UserOrderDetails[])) private userMarketOrders;
    
    
    uint256 public marketCount;
    uint256 public constant SCALE = 1e18;
    uint256 public constant MIN_LIQUIDITY = 1e18;//1000000000000000000
    uint256 public fee = 3e15;  // 0.3%

    event MarketCreated(uint256 indexed id,string question,address creator,uint256 resolutionTime);
    event Trade(uint256 indexed marketId,address indexed trader,bool isYes,uint256 amount,uint256 price,bool isBuy);
    event OrderPlaced(uint256 indexed marketId,uint256 orderId,address trader,bool isYes,uint256 amount,uint256 price,bool isBuy);
    event MarketResolved(uint256 indexed marketId,bool outcome);

    constructor(address _metaToken) 
    {
        metaToken = MetaToken(_metaToken);
    }
    // Market Creation
    function createMarket(string memory _question,string memory _imageUrl,uint256 _resolutionTime,uint256 _initialLiquidity) external returns (uint256) 
    {
        require(_resolutionTime > block.timestamp, "Invalid resolution time");
        require(_initialLiquidity >= MIN_LIQUIDITY, "Insufficient initial liquidity");

        uint256 marketId = marketCount++;
        
        // Create YES and NO tokens
        OutcomeToken yesToken = new OutcomeToken(
            string(abi.encodePacked("YES ", _question)),
            string(abi.encodePacked("YES", marketId)),
            address(this)
        );
        
        OutcomeToken noToken = new OutcomeToken(
            string(abi.encodePacked("NO ", _question)),
            string(abi.encodePacked("NO", marketId)),
            address(this)
        );

        markets[marketId] = Market({
            id: marketId,
            question: _question,
            imageUrl: _imageUrl,
            resolutionTime: _resolutionTime,
            resolved: false,
            outcome: false,
            yesToken: address(yesToken),
            noToken: address(noToken),
            totalLiquidity: _initialLiquidity,
            yesSharesInPool: _initialLiquidity,
            noSharesInPool: _initialLiquidity,
            creator: msg.sender
        });

        // Transfer initial liquidity from creator
        metaToken.transferFrom(msg.sender, address(this), _initialLiquidity);
        
        emit MarketCreated(marketId, _question, msg.sender, _resolutionTime);
        return marketId;
    }

    // Trading Functions
    function getExpectedShares(uint256 _marketId,bool _isYes,uint256 _amount, bool _isBuy) public view returns (uint256) 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market resolved");

        uint256 inputReserve = _isYes ? market.yesSharesInPool : market.noSharesInPool;
        uint256 outputReserve = _isYes ? market.noSharesInPool : market.yesSharesInPool;

        if (_isBuy) {
            uint256 amountWithFee = _amount * (SCALE - fee) / SCALE;
            return outputReserve * amountWithFee / (inputReserve + amountWithFee);
        } else {
            return inputReserve * _amount / (outputReserve + _amount);
        }
    }

    function trade(uint256 _marketId,bool _isYes,uint256 _amount,uint256 _minReturn,bool _isBuy) external nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market resolved");

        uint256 shares = getExpectedShares(_marketId, _isYes, _amount, _isBuy);
        require(shares >= _minReturn, "Slippage too high");

        // Calculate the effective price
        uint256 effectivePrice = _isBuy ? (_amount * SCALE) / shares :(shares * SCALE) / _amount;

        // Create and record the market order in the order book
        Order memory order = Order(
        {
            id: orderBook[_marketId].length,
            trader: msg.sender,
            isYes: _isYes,
            amount: _amount,
            price: effectivePrice,
            isBuy: _isBuy,
            timestamp: block.timestamp
        });

        // Add to order book and user orders
        orderBook[_marketId].push(order);


        // Store order details in user's history
        UserOrderDetails memory userOrder = UserOrderDetails({
            marketId: _marketId,
            orderId: order.id,
            isYes: _isYes,
            amount: _amount,
            price: effectivePrice,
            isBuy: _isBuy,
            timestamp: block.timestamp
        });
        
        userMarketOrders[msg.sender][_marketId].push(userOrder);

        if (_isBuy) 
        {
            metaToken.transferFrom(msg.sender, address(this), _amount);
            OutcomeToken(_isYes ? market.yesToken : market.noToken).mint(msg.sender, shares);
            
            market.yesSharesInPool = _isYes ? 
                market.yesSharesInPool + _amount :
                market.yesSharesInPool - shares;
                
            market.noSharesInPool = _isYes ?
                market.noSharesInPool - shares :
                market.noSharesInPool + _amount;
        } 
        else 
        {
            OutcomeToken(_isYes ? market.yesToken : market.noToken).burn(msg.sender, _amount);
            metaToken.transfer(msg.sender, shares);
            
            market.yesSharesInPool = _isYes ?
                market.yesSharesInPool - _amount :
                market.yesSharesInPool + shares;
                
            market.noSharesInPool = _isYes ?
                market.noSharesInPool + shares :
                market.noSharesInPool - _amount;
        }

        emit Trade(_marketId, msg.sender, _isYes, _amount, shares, _isBuy);
        emit OrderPlaced(_marketId,order.id,msg.sender,_isYes,_amount,effectivePrice,_isBuy);
}

    // Market Resolution
    function resolveMarket(uint256 _marketId, bool _outcome) external 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.resolutionTime, "Too early to resolve");
        
        market.resolved = true;
        market.outcome = _outcome;
        
        emit MarketResolved(_marketId, _outcome);
    }

    // Claim rewards
    function claimRewards(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        OutcomeToken winningToken = OutcomeToken(
            market.outcome ? market.yesToken : market.noToken
        );
        
        uint256 winningShares = winningToken.balanceOf(msg.sender);
        require(winningShares > 0, "No winning shares");
        
        uint256 reward = winningShares * market.totalLiquidity / 
            (market.outcome ? market.yesSharesInPool : market.noSharesInPool);
            
        winningToken.burn(msg.sender, winningShares);
        metaToken.transfer(msg.sender, reward);
    }

    // View Functions
    function getMarketInfo(uint256 _marketId) external view returns (string memory question,string memory imageUrl,uint256 resolutionTime,bool resolved, bool outcome,uint256 yesPrice,uint256 noPrice,uint256 yesShares,uint256 noShares,address creator,address yesToken,address noToken) 
    {
        Market storage market = markets[_marketId];
        
        uint256 totalShares = market.yesSharesInPool + market.noSharesInPool;
        yesPrice = market.yesSharesInPool * SCALE / totalShares;
        noPrice = market.noSharesInPool * SCALE / totalShares;
        
        return (
            market.question,
            market.imageUrl,
            market.resolutionTime,
            market.resolved,
            market.outcome,
            yesPrice,
            noPrice,
            market.yesSharesInPool,
            market.noSharesInPool,
            market.creator,
            market.yesToken,
            market.noToken
        );
    }

    function getUserPositions(address _user, uint256 _marketId) external view returns (uint256 yesShares,uint256 noShares,uint256 metaBalance) 
    {
        Market storage market = markets[_marketId];
        return (
            OutcomeToken(market.yesToken).balanceOf(_user),
            OutcomeToken(market.noToken).balanceOf(_user),
            metaToken.balanceOf(_user)
        );
    }

    function getUserOrders(address _user) external view returns (UserOrderDetails[] memory) {
            // First, calculate total number of orders
            uint256 totalOrders = 0;
            for (uint256 i = 0; i < marketCount; i++) {
                totalOrders += userMarketOrders[_user][i].length;
            }
            
            // Create array to hold all orders
            UserOrderDetails[] memory allOrders = new UserOrderDetails[](totalOrders);
            
            // Fill array with orders from all markets
            uint256 currentIndex = 0;
            for (uint256 marketId = 0; marketId < marketCount; marketId++) {
                UserOrderDetails[] memory marketOrders = userMarketOrders[_user][marketId];
                for (uint256 j = 0; j < marketOrders.length; j++) {
                    allOrders[currentIndex] = marketOrders[j];
                    currentIndex++;
                }
            }
            
            return allOrders;
        }

    function getOrderBook(uint256 _marketId) external view returns (Order[] memory) {
        return orderBook[_marketId];
    }

    // LP Functions
    function addLiquidity(uint256 _marketId,uint256 _amount) external nonReentrant  {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market resolved");

        // Transfer Meta tokens from user
        metaToken.transferFrom(msg.sender, address(this), _amount);

        // Calculate proportional shares
        uint256 yesShares = _amount * market.yesSharesInPool / market.totalLiquidity;
        uint256 noShares = _amount * market.noSharesInPool / market.totalLiquidity;

        // Mint LP tokens
        OutcomeToken(market.yesToken).mint(msg.sender, yesShares);
        OutcomeToken(market.noToken).mint(msg.sender, noShares);

        // Update pool state
        market.yesSharesInPool += yesShares;
        market.noSharesInPool += noShares;
        market.totalLiquidity += _amount;

        emit LiquidityAdded(_marketId, msg.sender, _amount, yesShares, noShares);
    }

    function removeLiquidity(uint256 _marketId,uint256 _yesShares,uint256 _noShares) external nonReentrant {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market resolved");

        // Calculate proportional Meta tokens
        uint256 metaAmount = Math.min(
            _yesShares * market.totalLiquidity / market.yesSharesInPool,
            _noShares * market.totalLiquidity / market.noSharesInPool
        );

        // Burn LP tokens
        OutcomeToken(market.yesToken).burn(msg.sender, _yesShares);
        OutcomeToken(market.noToken).burn(msg.sender, _noShares);

        // Update pool state
        market.yesSharesInPool -= _yesShares;
        market.noSharesInPool -= _noShares;
        market.totalLiquidity -= metaAmount;

        // Transfer Meta tokens to user
        metaToken.transfer(msg.sender, metaAmount);

        emit LiquidityRemoved(_marketId, msg.sender, metaAmount, _yesShares, _noShares);
    }

    // Admin Functions
    function setFee(uint256 _newFee) external  {
        require(_newFee <= 5e16, "Fee too high"); // Max 5%
        fee = _newFee;
        emit FeeUpdated(_newFee);
    }



    function getYesProbability(uint256 _marketId) external view returns (uint256 probability, uint256 confidence) 
    {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        
        // Calculate total liquidity in the pool
        uint256 totalShares = market.yesSharesInPool + market.noSharesInPool;
        require(totalShares > 0, "No liquidity in market");
        
        // Calculate the implied probability (YES shares / Total shares)
        probability = (market.yesSharesInPool * SCALE) / totalShares;
        
        // Calculate confidence metric based on total liquidity
        // More liquidity = higher confidence in the price
        // We use log scale to make it more meaningful
        uint256 minLiquidity = MIN_LIQUIDITY;  // 1e18
        uint256 maxLiquidity = 1000000 * SCALE; // 1M tokens as reference
        
        if (market.totalLiquidity <= minLiquidity) {
            confidence = 0;
        } else if (market.totalLiquidity >= maxLiquidity) {
            confidence = SCALE;
        } else {
            // Linear interpolation between min and max liquidity
            confidence = ((market.totalLiquidity - minLiquidity) * SCALE) / (maxLiquidity - minLiquidity);
        }
        // 1e18 represents 100%
        // 5e17 represents 50%
        // 25e16 represents 25%
    }


    // Events that were missing
    event LiquidityAdded(uint256 indexed marketId,address indexed provider,uint256 metaAmount,uint256 yesShares,uint256 noShares);
    event LiquidityRemoved(uint256 indexed marketId,address indexed provider,uint256 metaAmount,uint256 yesShares,uint256 noShares);
    event FeeUpdated(uint256 newFee);
    event EmergencyWithdraw(uint256 indexed marketId,address indexed user,uint256 yesShares,uint256 noShares);
}


// If you pay 100 META tokens (_amount) and receive 80 YES shares (shares)
// SCALE = 1e18
// effectivePrice = (100 * 1e18) / 80 = 1.25e18
// This means each share effectively cost 1.25 META tokens


// Example:
// If you sell 80 YES shares (_amount) and receive 100 META tokens (shares)
// SCALE = 1e18
// effectivePrice = (100 * 1e18) / 80 = 1.25e18
// This means each share was sold for 1.25 META tokens



// // Scenario 1: High Probability, High Confidence
// Market A:
// yesShares = 800,000 tokens
// noShares = 200,000 tokens
// totalLiquidity = 500,000 tokens (very liquid)

// Result:
// probability = 80% (YES likely to happen)
// confidence = 90% (very confident in this estimate)

// // Scenario 2: High Probability, Low Confidence
// Market B:
// yesShares = 800 tokens
// noShares = 200 tokens
// totalLiquidity = 1,000 tokens (very little liquidity)

// Result:
// probability = 80% (YES likely to happen)
// confidence = 10% (not very confident in this estimate)


// Why Confidence Matters:

// Small Markets:

// solidityCopyif (market.totalLiquidity <= minLiquidity) {
//     confidence = 0;  // Very low confidence due to minimal liquidity
// }

// Large Markets:

// solidityCopyif (market.totalLiquidity >= maxLiquidity) {
//     confidence = SCALE;  // High confidence due to substantial liquidity
// }

// Medium Markets:

// solidityCopy// Linear interpolation between min and max liquidity
// confidence = ((market.totalLiquidity - minLiquidity) * SCALE) / (maxLiquidity - minLiquidity);
// Real-world analogy:

// Weather forecast says 80% chance of rain (probability)
// Based on:

// Limited data (low confidence): Few weather stations, old equipment
// Extensive data (high confidence): Many stations, modern equipment, satellite data


// const displayRisk = (probability, confidence) => {
//     if (confidence < 0.3 * SCALE) {
//         return "Warning: Market has low liquidity, price may not be reliable";
//     } else if (probability > 0.8 * SCALE && confidence > 0.7 * SCALE) {
//         return "Strong market consensus with high confidence";
//     }
//     // etc.
// }