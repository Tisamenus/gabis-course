pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./StakingContract.sol";

interface ISTK {
    function pullrug() external;
}

contract JokeRPContract is Ownable {
    ISTK private contractToPull;

    constructor() public {}

    function setPullee(address _addr) public onlyOwner() {
        contractToPull = ISTK(_addr);
    }

    function pullTheRug() public {
        contractToPull.pullrug();
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    fallback() external {
        pullTheRug();
    }

    receive() external payable {}
}
