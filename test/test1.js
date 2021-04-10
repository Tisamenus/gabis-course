/**
 * I cleaned up the imports from last commit!
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const chalk = require("chalk");
const { deploy } = require("../scripts/deploy.js");
//const { supportChangeEtherBalance, } = require(`${waffleChaiPath}/matchers/changeEtherBalance`);
//supportChangeEtherBalance(chai.Assertion);
// use(solidity); We don't even need this

describe(chalk.bold.blueBright("Staking, Rugpull and PiggyBank contract tests:\n"), function () {
  let rugpullContract;
  let stakingContract;
  let piggyBank;
  let signer1, signer2, signer3;
  /**
   * before
   * In essence I believe there is no difference as to whether the following assignments are stated in 
   * a before block or not if they are within the widest describe block stated before any it calls, since 
   * the program evalutes first the widest scope of describes, and then the second widest, describe by describe,
   * like reading rows from a tree. 
   * 
   * Before blocks in nested describes cause checks for the value to throw.
   * 
   * Describe blocks are effective for splitting your problem into smaller chunks and individually testing them,
   * if I would want the upper variables to not be affected by lower-scoped describes, I would envelop the bottom
   * before block in a describe.
   * 
   */
  before(async function () {
    rugpullContract = await deploy("RugPullContract", "nolog");
    stakingContract = await deploy("StakingContract", "nolog", [rugpullContract.address]);
    await rugpullContract.setPullee(stakingContract.address);
    piggyBank = await deploy("PiggyBank", "nolog", [stakingContract.address]);
    [signer1, signer2, signer3] = await ethers.getSigners();
  });

  describe(chalk.yellowBright("Deployment phase."), function () {
    /**
     * The following will pass, and since the variables are declared above in the widest scope 
     * we can also use them from a next describe block.
     */
    it("Should have deployed all contracts and the signers should also be present!", async function () {
      await expect(rugpullContract.address).to.be.properAddress;
      await expect(stakingContract.address).to.be.properAddress;
      await expect(piggyBank.address).to.be.properAddress;
      await expect(signer1.address).to.be.properAddress;
      await expect(signer2.address).to.be.properAddress;
      await expect(signer3.address).to.be.properAddress;
    });
  });

  let overrides = {
    value: ethers.utils.parseEther("1.0")
  }

  describe(chalk.yellowBright("Checking balances and transactions."), function () {
    /**
     */
    it("Should call and assign signers to the contracts", async function () {
      stakingContract = await stakingContract.connect(signer1);

      // await expect(await stakingContract._stakeNoAddr(overrides)).to.changeEtherBalance(stakingContract.address, 1);
       await expect(await signer1.sendTransaction({ to: stakingContract.address, value: ethers.utils.parseEther("1.0") })).to.changeEtherBalance(stakingContract.address, 1);
    });
  });
});

/*
it("should try something", function () {
  expect(1).to.equal(1);
});


it("should deploy all of the contracts", async function () {
  console.log(chalk.blueBright("here!!!"))
  rugpullContract = await deploy("RugPullContract");
  console.log(chalk.blueBright("here!!!"));
  stakingContract = await deploy("StakingContract", [rugpullContract.address]);
  console.log(chalk.magentaBright("here!!!"));
  await rugpullContract.setPullee(stakingContract.address);
  piggyBank = await deploy("PiggyBank", [stakingContract.address]);
  expect(rugpullContract.address).to.exist;
  expect(stakingContract.address).to.exist;
  expect(piggyBank.address).to.exist;
  console.log(
    "Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );



});

/*
console.log(rugpullContract.address);
console.log("\n");
console.log(chalk.redBright(stakingContract.address));
console.log("\n");
console.log(chalk.redBright(piggyBank.address));
console.log("\n");
*/
/*
  it("should list a few addresses", async function () {
    deployerWallet = await ethers.provider.getSigner();
    [swallet1, swallet2, swallet3] = await ethers.getSigners();
    console.log(deployerWallet.address);
    console.log("\n");
    console.log(deployerWallet.balance);
    console.log("\n");
    console.log(swallet1.address);
    console.log("\n");
    console.log(swallet1.balance);
    console.log("\n");
    console.log(swallet2.address);
    console.log("\n");
    console.log(swallet2.balance);
    console.log("\n");
    console.log(swallet3.address);
    console.log("\n");
    console.log(swallet3.balance);
    console.log("\n");
  });

  */