// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BettingGame {
    address public owner;
    mapping(uint256 => address) public itemToWinner;
    mapping(uint256 => address) public itemToBetter;
    mapping(uint256 => uint256) public itemToBetAmount;

    event BetPlaced(address indexed user, uint256 itemId, uint256 amount);
    event BetWon(address indexed winner, uint256 itemId, uint256 prizeAmount);

    constructor() {
        owner = msg.sender;
    }

    function registerBet(uint256 itemId) external payable {
        require(msg.value > 0, "Bet must have value!");
        require(itemToBetter[itemId] == address(0), "Bet already placed!");

        itemToBetter[itemId] = msg.sender;
        itemToBetAmount[itemId] = msg.value;

        emit BetPlaced(msg.sender, itemId, msg.value);
    }

    function recordWinner(uint256 itemId, address winner) external {
        require(msg.sender == owner, "Only owner can set winner");
        itemToWinner[itemId] = winner;
    }

    function payoutWinner(uint256 itemId) external {
        require(itemToWinner[itemId] == msg.sender, "Not the winner");
        uint256 prize = itemToBetAmount[itemId];
        require(prize > 0, "No prize available");

        itemToBetAmount[itemId] = 0;
        payable(msg.sender).transfer(prize);

        emit BetWon(msg.sender, itemId, prize);
    }
}

