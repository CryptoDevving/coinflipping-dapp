pragma solidity ^0.5.8;

contract CoinToFlip {
    uint constant MAX_CASE = 2;
    uint constant MINIMUM_BET = 0.01 ether;
    uint constant MAXIMUM_BET = 10 ether;
    uint constant HOUSE_FEE_PERCENT = 5;
    uint constant HOUSE_MINIMUM_FEE = 0.005 ether;

    address payable public owner;
    // betting but not yet decided, thus locked!
    uint public lockedInBets;

    struct Bet {
        uint amount;
        // 0000 0011 both sides -> not available case
        uint8 numOfBetBit;
        // player's betting block number
        uint placeBlockNumber;
        // 0000 0010 front side; 50% chance
        // 0000 0001 back side; 50% chance
        uint8 mask;
        address payable gambler;
    }

    mapping(address => Bet) bets;

    // 1 or 2
    event Reveal(address indexed gambler, uint reveal, uint amount);
    event Payment(address indexed beneficiary, uint amount);
    event FailedPayment(address indexed beneficiary, uint amount);

    constructor() public payable {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(owner == msg.sender, 'Only owner can call this function.');
        _;
    }

    function withdrawFunds(address payable beneficiary, uint withdrawAmount) external onlyOwner {
        // withdrawn possible amount should be smaller than current contract balance
        require(withdrawAmount + lockedInBets <= address(this).balance, "It is larger than the balance");
        sendFunds(beneficiary, withdrawAmount);
    }

    function kill() external onlyOwner {
        // currently executing game should not exist before self-destructing
        require(lockedInBets == 0, "All bets should be processed before self-destruct");
        selfdestruct(owner);
    }

    function () external payable {}

    function sendFunds(address payable beneficiary, uint amount) private returns (bool) {
        // address send returns boolean value
        if (beneficiary.send(amount)) {
            emit Payment(beneficiary, amount);
            return true;
        }
        emit FailedPayment(beneficiary, amount);
        return false;
    }

    function countBits(uint8 _num) internal pure returns (uint8) {
        uint8 count;
        while (_num > 0) {
            count += _num & 1;
            _num >>= 1;
        }
        return count;
    }

    function placeBet(uint8 betMask) external payable {
        uint amount = msg.value;
        require(amount >= MINIMUM_BET && amount <= MAXIMUM_BET, "Amount is out of range");
        require(betMask > 0 && betMask < 256, "Mask should be a 8 bit");

        Bet storage bet = bets[msg.sender];
        // address(0) == null
        require(bet.gambler == address(0), "Bet should be empty state.");
        
        uint8 numOfBetBit = countBits(betMask);
        uint possibleWinningAmount = getWinningAmount(amount, numOfBetBit);
        lockedInBets += possibleWinningAmount;
        require(lockedInBets < address(this).balance, "Cannot afford to pay the bet.");

        bet.amount = amount;
        bet.numOfBetBit = numOfBetBit;
        bet.placeBlockNumber = block.number;
        bet.mask = betMask;
        bet.gambler = msg.sender;
    }

    function getWinningAmount(uint amount, uint8 numOfBetBit) private pure returns (uint winningAmount) {
        require(0 < numOfBetBit && numOfBetBit < MAX_CASE, "Probability is out of range");
        uint houseFee = (amount * HOUSE_FEE_PERCENT) / 100;
        
        if (houseFee < HOUSE_MINIMUM_FEE) {
            houseFee = HOUSE_MINIMUM_FEE;
        }

        uint reward = amount / (MAX_CASE + (numOfBetBit - 1));
        winningAmount = (amount - houseFee) + reward;
        
        return winningAmount;
    }

    function revealResult() external {
        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;
        uint8 numOfBetBit = bet.numOfBetBit;
        uint placeBlockNumber = bet.placeBlockNumber;
        address payable gambler = bet.gambler;

        require(amount > 0, "Bet should be in an active state");
        require(block.number > placeBlockNumber, "revealResult in the same block as placebet!");

        bytes32 random = keccak256(abi.encodePacked(blockhash(block.number), blockhash(placeBlockNumber)));
        uint reveal = uint(random) % MAX_CASE; // 0 or 1

        uint winningAmount = 0;
        uint possibleWinningAmount = 0;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        if ((2 ** reveal) & bet.mask != 0) {
            winningAmount = possibleWinningAmount;
        }

        emit Reveal(gambler, 2 ** reveal, winningAmount);

        if (winningAmount > 0) {
            sendFunds(gambler, winningAmount);
        }

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);
    }

    function clearBet(address player) private {
        Bet storage bet = bets[player];
        
        bet.amount = 0;
        bet.numOfBetBit = 0;
        bet.placeBlockNumber = 0;
        bet.mask = 0;
        // make address null
        bet.gambler = address(0);
    }

    function refundBetBeforeReveal() external {
        Bet storage bet = bets[msg.sender];
        uint8 numOfBetBit = bet.numOfBetBit;
        uint amount = bet.amount;
        address payable gambler = bet.gambler;

        require(block.number > bet.placeBlockNumber, "the bet is already mined. not able to refund.");
        require(amount > 0, "Bet should be in an active state");

        uint possibleWinningAmount;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);
        lockedInBets -= possibleWinningAmount;
        
        clearBet(msg.sender);
        sendFunds(gambler, amount);
    }

    function checkHouseFunds() public view onlyOwner returns (uint) {
        return address(this).balance;
    }
}
