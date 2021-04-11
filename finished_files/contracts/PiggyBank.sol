pragma solidity >=0.6.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./StakingContract.sol";

interface ISTK {
    function getTimes() external view returns (uint256, uint256);

    function getThreshold() external view returns (uint256);

    function sayTotalEth() external view returns (uint256);

    function getUserCount() external view returns (uint256);

    function compoundEach(uint256 perWallet) external payable;
}

contract PiggyBank {
    using SafeMath for uint256;

    ISTK private stakingContract;
    uint256 private lastTimeStamp;
    uint256 private startTime;
    uint256 private endTime;
    uint256 private period;
    uint256 private startTotalEth;

    constructor(address _stakingContract) public payable {
        stakingContract = ISTK(_stakingContract);
        lastTimeStamp = 0;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTimes() public view returns (uint256, uint256) {
        return (startTime, endTime);
    }

    modifier onlyOnce {
        require(lastTimeStamp >= 0, "only once");
        _;
    }

    function setUpTimes() public onlyOnce {
        (startTime, endTime) = stakingContract.getTimes();
        lastTimeStamp = startTime;
        period = endTime.sub(startTime);
        startTotalEth = stakingContract.sayTotalEth();
    }

    function CURRENTTIME() public view returns (uint256) {
        return block.timestamp;
    }

    function payInterestOnPing() public {

        require(stakingContract.getUserCount().sub(1) >= 0, "no users");
        uint256 curr_time = block.timestamp;

        uint256 totalPayout =
            (
                (((curr_time.sub(lastTimeStamp)).mul(100000000000)).div(period))
                    .mul(
                    (stakingContract.getThreshold()).sub(
                        startTotalEth
                    )
                )
            )
                .div(100000000000);
        // .div((stakingContract.getUserCount()).sub(1));

        require(totalPayout > 0, "payout fucked");

        uint256 payoutPerUser =
            totalPayout.div((stakingContract.getUserCount()).sub(1));

        lastTimeStamp = curr_time;
        require(payoutPerUser > 0, "payout fucked");

        stakingContract.compoundEach{value: totalPayout}(payoutPerUser);
    }

    fallback() external payable {}

    receive() external payable {}
}
