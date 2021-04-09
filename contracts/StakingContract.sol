pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract StakingContract is Ownable {
    using SafeMath for uint256;

    event NotYet(string);
    event Blocktime1(uint256);
    event Blocktime2(uint256);

    // user balances
    mapping(uint256 => uint256) private balances;
    mapping(address => uint256) private uTOi;

    uint256 private threshold;
    bool private countdownstarted;
    uint256 private endTime;
    uint256 private startTime;
    uint256 private userCount;

    constructor(address owner) public {
        // will deposit to owner after staking
        transferOwnership(owner);

        // threshold to reach
        countdownstarted = false;
        endTime = 0;
        userCount = 1;
    }

    modifier didCountdownStart(bool t) {
        require(!t, "can't start the countdown again");
        _;
    }

    function testFunction() public {
        emit Blocktime1(block.timestamp);
        emit Blocktime2(block.timestamp);
    }

    function getUTOIVALUE(address input) public view returns (uint256) {
        uint256 returnee = uTOi[input];
        return returnee;
    }

    function getTimes()
        public
        view
        didCountdownStart(!countdownstarted)
        returns (uint256, uint256)
    {
        return (startTime, endTime);
    }

    function startCountdown(uint256 mins)
        public
        didCountdownStart(countdownstarted)
    {
        // does block.timestamp change from time to time? checked in upper function
        uint256 curr_time = block.timestamp;
        endTime = curr_time + (1 minutes) * (mins);
        // needed for piggybank
        startTime = curr_time;
        countdownstarted = true;
    }

    function getBalanceOfAddress(address _addrs) public view returns (uint256) {
        uint256 lance = balances[uTOi[_addrs]];
        return lance;
    }

    function readjustThreshold() private {
        threshold = (address(this).balance).mul(15).div(10);
    }

    function getThreshold() public view returns (uint256) {
        uint256 returnee = threshold;
        return returnee;
    }

    function sayTotalEth() public view returns (uint256) {
        uint256 returnee = address(this).balance;
        return returnee;
    }

    function getUserCount() public view returns (uint256) {
        uint256 returnee = userCount;
        return returnee;
    }

    function _stakeAddr(address receiver) public payable {
        require(receiver != msg.sender, "dont fuck the system");
        require(msg.value >= 0, "cant register without cash");

        if (uTOi[receiver] > 0) {
            balances[uTOi[receiver]] += msg.value;
        } else {
            // corner cases that wont happen in test, no readjust
            uTOi[receiver] = userCount;
            userCount++;
            balances[uTOi[receiver]] = msg.value;
        }
    }

    function _stakeNoAddr() public payable {
        require(msg.value >= 0, "cant register without cash");
        // this is most likely naive
        if (uTOi[msg.sender] > 0) {
            balances[uTOi[msg.sender]] += msg.value;
        } else {
            uTOi[msg.sender] = userCount;
            userCount++;
            balances[uTOi[msg.sender]] = msg.value;
        } // this is a security flaw but i am doing it for fun
        readjustThreshold();
    }

    function compoundEach(uint256 perWallet) public payable {
        for (uint256 i = 1; i < userCount; i++) {
            balances[i] += perWallet;
        }
    }

    // both of these to test if msg.sender will pass value down, but I suppose if the only function of the contract is to stake it should be fine?
    // ADD: NO IT WASNT FINE

    fallback() external payable {}

    receive() external payable {}

    function pullrug() public onlyOwner {
        if (threshold <= address(this).balance) {
            payable(owner()).transfer(address(this).balance);
        } else {
            emit NotYet("totalETH must be lrger or eql threshold");
        }
    }
}
