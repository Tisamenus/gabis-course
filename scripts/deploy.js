/* eslint no-use-before-define: "warn" */
// const { config, ethers, tenderly, run, network } = require("hardhat");
const utils = ethers.utils;
const R = require("ramda");
const fs = require("fs");
const chalk = require("chalk");

async function deploy(contractName, qLog, _args = [], overrides = {}, libraries = {}) {
  if (qLog != "nolog") {
    console.log(`Deploying: ${contractName}`);
  }
  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, { libraries: libraries });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);
  const encoded = abiEncodeArgs(deployed, contractArgs);
  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);
  if (qLog != "nolog") {
    let extraGasInfo = ""
    if (deployed && deployed.deployTransaction) {
      const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice)
      extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${deployed.deployTransaction.hash}`
    }

    console.log(
      chalk.cyan(contractName),
      "deployed to:",
      chalk.magenta(deployed.address)
    );
    console.log(
      chalk.grey(extraGasInfo)
    );
  }
  await tenderly.persistArtifacts({
    name: contractName,
    address: deployed.address
  });
  if (!encoded || encoded.length <= 2) return deployed;
  fs.writeFileSync(`artifacts/${contractName}.args`, encoded.slice(2));
  return deployed;
};

module.exports.deploy = deploy;
// ------ utils -------
// abi encodes contract arguments
// useful when you want to manually verify the contracts
// for example, on Etherscan

const abiEncodeArgs = (deployed, contractArgs) => {
  // not writing abi encoded args if this does not pass
  if (
    !contractArgs ||
    !deployed ||
    !R.hasPath(["interface", "deploy"], deployed)
  ) {
    return "";
  }
  const encoded = utils.defaultAbiCoder.encode(
    deployed.interface.deploy.inputs,
    contractArgs
  );
  return encoded;
};

// checks if it is a Solidity file
const isSolidity = (fileName) =>
  fileName.indexOf(".sol") >= 0 && fileName.indexOf(".swp") < 0 && fileName.indexOf(".swap") < 0;

const readArgsFile = (contractName) => {
  let args = [];
  try {
    const argsFile = `./contracts/${contractName}.args`;
    if (!fs.existsSync(argsFile)) return args;
    args = JSON.parse(fs.readFileSync(argsFile));
  } catch (e) {
    console.log(e);
  }
  return args;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// If you want to verify on https://tenderly.co/
const tenderlyVerify = async ({ contractName, contractAddress }) => {

  let tenderlyNetworks = ["kovan", "goerli", "mainnet", "rinkeby", "ropsten", "matic", "mumbai", "xDai", "POA"]
  let targetNetwork = process.env.HARDHAT_NETWORK || config.defaultNetwork

  if (tenderlyNetworks.includes(targetNetwork)) {
    console.log(chalk.blue(` 📁 Attempting tenderly verification of ${contractName} on ${targetNetwork}`))
    await tenderly.persistArtifacts({
      name: contractName,
      address: contractAddress
    });
    let verification = await tenderly.verify({
      name: contractName,
      address: contractAddress,
      network: targetNetwork
    })
    return verification
  } else {
    console.log(chalk.grey(` 🧐 Contract verification not supported on ${targetNetwork}`))
  }
}
/*
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
*/
  //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  //const secondContract = await deploy("SecondContract")

  // const exampleToken = await deploy("ExampleToken")
  // const examplePriceOracle = await deploy("ExamplePriceOracle")
  // const smartContractWallet = await deploy("SmartContractWallet",[exampleToken.address,examplePriceOracle.address])

/*
//If you want to send value to an address from the deployer
const deployerWallet = ethers.provider.getSigner()
await deployerWallet.sendTransaction({
  to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
  value: ethers.utils.parseEther("0.001")
})
*/


/*
//If you want to send some ETH to a contract on deploy (make your constructor payable!)
const yourContract = await deploy("YourContract", [], {
value: ethers.utils.parseEther("0.05")
});
*/


/*
//If you want to link a library into your contract:
// reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
const yourContract = await deploy("YourContract", [], {}, {
 LibraryName: **LibraryAddress**
});
*/


  //If you want to verify your contract on tenderly.co (see setup details in the scaffold-eth README!)
/*
await tenderlyVerify(
  {contractName: "YourContract",
   contractAddress: yourContract.address
})
*/

  // If you want to verify your contract on etherscan
/*
console.log(chalk.blue('verifying on etherscan'))
await run("verify:verify", {
  address: yourContract.address,
  // constructorArguments: args // If your contract has constructor arguments, you can pass them as an array
})
*/

/*
const main = async () => {

  console.log("\n\nDeploying...\n");

  // <-- add in constructor args like line 19 vvv
  /**
   * notes to self
   * ethers.provider is jsonrpcprovider and has NO .address property
   * ethers.getSigners() gets signers that console.log(await ethers.provider.listAccounts()) would show
   * TODO:
   * get that fucking test file working and learn how to import function into it

  // set contracts up
  const rugpull_c = await deploy("RugPullContract");
  let staking_c = await deploy("StakingContract", [rugpull_c.address]);
  rugpull_c.setPullee(staking_c.address);
  const piggybank_c = await deploy("PiggyBank", [staking_c.address]);
  // signers
  const [signer1, signer2, signer3] = await ethers.getSigners();

  /// timestamp
  const formerTimestamp = piggybank_c.CURRENTTIME();

  // t = 0 still
  // connect first signer
  staking_c = await staking_c.connect(signer1);
  // pass in some eth
  let overrides = {
    value: utils.parseEther("1.0")
  }
  await staking_c._stakeNoAddr(overrides);

  // second
  staking_c = await staking_c.connect(signer2);
  // pass in some eth
  await staking_c._stakeNoAddr(overrides);

  // so now there should be 2 eth inside

  console.log(chalk.yellow("\nTOTAL ETHER: "), (await staking_c.sayTotalEth()).div(ethers.BigNumber.from(10).pow(14)).toNumber(), "\n");

  /// the utils are nice but wayyy too much .parameters
  // so now we have to also fill up piggy bank

  tx = {
    to: piggybank_c.address,
    value: utils.parseEther("5.0")
  }

  await signer3.sendTransaction(tx);

  // check
  console.log(chalk.yellow("\nPIGGY BANK: "), (await piggybank_c.getBalance()).div(ethers.BigNumber.from(10).pow(18)).toNumber(), "\n");

  // now simulate staking
  // first start time
  await staking_c.startCountdown(2);
  // check
  const [startTime, endTime] = await staking_c.getTimes();

  console.log(chalk.bgYellow("\nSTART: "), startTime.toNumber(), " END: ", endTime.toNumber(), "\n");

  // now... we rapidly iterate and pay out interest.

  let nextTimeStamp = startTime.toNumber() + 20;
  // this means the whole thing should be done in (endTime-startTime)/dt - 1 steps

  await staking_c.testFunction();

  console.log(
    chalk.blueBright("\nCheck Staking: \nUSER COUNT: "),
    (await staking_c.getUserCount()).toNumber(),
    chalk.blueBright("\nSIGNER1 BALANCE: "),
    (await staking_c.getBalanceOfAddress(signer1.address)).div(ethers.BigNumber.from(10).pow(14)).toNumber(),
    chalk.blueBright("\nSIGNER2 BALANCE: "),
    (await staking_c.getBalanceOfAddress(signer2.address)).div(ethers.BigNumber.from(10).pow(14)).toNumber(),
    chalk.blueBright("\nUTOIVALUE FOR S2: "),
    (await staking_c.getUTOIVALUE(signer2.address)).toNumber(),
    chalk.blueBright("\nCURRENT THRESHOLD: "),
    (await staking_c.getThreshold()).div(ethers.BigNumber.from(10).pow(14)).toNumber(),
    chalk.blueBright("\nCURRENT TOTAL ETH: "),
    (await staking_c.sayTotalEth()).div(ethers.BigNumber.from(10).pow(14)).toNumber(),
    "\n"
  );

  await piggybank_c.setUpTimes();

  for (let i = 0; i < (endTime.sub(startTime)).toNumber() / 20 + 1; i++) {
    await network.provider.send("evm_setNextBlockTimestamp", [nextTimeStamp]);
    await piggybank_c.payInterestOnPing();
    nextTimeStamp = nextTimeStamp + 20;
  }

  console.log(chalk.redBright("\nTOTAL ETH NOW: "), (await staking_c.sayTotalEth()).div(ethers.BigNumber.from(10).pow(14)).toNumber(), "\n");

  // alright now to pull the rug

  await rugpull_c.connect(signer1.address);
  await rugpull_c.pullTheRug();

  console.log(chalk.magentaBright("\nRUGPULL CONTRACT HAS: "), ((await rugpull_c.getBalance()).div(ethers.BigNumber.from(10).pow(14)).toNumber()), "\n");

  console.log(chalk.redBright("\nTOTAL ETH NOW: "), (await staking_c.sayTotalEth()).div(ethers.BigNumber.from(10).pow(14)).toNumber(), "\n");

  console.log(
    "Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
};

*/