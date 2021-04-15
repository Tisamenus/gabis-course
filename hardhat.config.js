require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@tenderly/hardhat-tenderly");
require("@nomiclabs/hardhat-etherscan");
//////////////////// other stuff
require('dotenv').config();
const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

const DEBUG = false;


task("wallet", "Create a wallet (pk) link", async (_, { ethers }) => {
  const randomWallet = ethers.Wallet.createRandom()
  const privateKey = randomWallet._signingKey().privateKey
  console.log("🔐 WALLET Generated as " + randomWallet.address + "")
  console.log("🔗 http://localhost:3000/pk#" + privateKey)
});


task("fundedwallet", "Create a wallet (pk) link and fund it with deployer?")
  .addOptionalParam("amount", "Amount of ETH to send to wallet after generating")
  .addOptionalParam("url", "URL to add pk to")
  .setAction(async (taskArgs, { network, ethers }) => {

    const randomWallet = ethers.Wallet.createRandom()
    const privateKey = randomWallet._signingKey().privateKey
    console.log("🔐 WALLET Generated as " + randomWallet.address + "")
    let url = taskArgs.url ? taskArgs.url : "http://localhost:3000"

    let localDeployerMnemonic
    try {
      localDeployerMnemonic = fs.readFileSync("./mnemonic.txt")
      localDeployerMnemonic = localDeployerMnemonic.toString().trim()
    } catch (e) {
      /* do nothing - this file isn't always there */
    }

    let amount = taskArgs.amount ? taskArgs.amount : "0.01"
    const tx = {
      to: randomWallet.address,
      value: ethers.utils.parseEther(amount)
    };

    //SEND USING LOCAL DEPLOYER MNEMONIC IF THERE IS ONE
    // IF NOT SEND USING LOCAL HARDHAT NODE:
    if (localDeployerMnemonic) {
      let deployerWallet = new ethers.Wallet.fromMnemonic(localDeployerMnemonic)
      deployerWallet = deployerWallet.connect(ethers.provider)
      console.log("💵 Sending " + amount + " ETH to " + randomWallet.address + " using deployer account");
      let sendresult = await deployerWallet.sendTransaction(tx)
      console.log("\n" + url + "/pk#" + privateKey + "\n")
      return
    } else {
      console.log("💵 Sending " + amount + " ETH to " + randomWallet.address + " using local node");
      console.log("\n" + url + "/pk#" + privateKey + "\n")
      return send(ethers.provider.getSigner(), tx);
    }
  });

task("generate", "Create a mnemonic for builder deploys", async (_, { ethers }) => {
  const bip39 = require("bip39")
  const hdkey = require('ethereumjs-wallet/hdkey');
  const mnemonic = bip39.generateMnemonic()
  if (DEBUG) console.log("mnemonic", mnemonic)
  const seed = await bip39.mnemonicToSeed(mnemonic)
  if (DEBUG) console.log("seed", seed)
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const account_index = 0
  let fullPath = wallet_hdpath + account_index
  if (DEBUG) console.log("fullPath", fullPath)
  const wallet = hdwallet.derivePath(fullPath).getWallet();
  const privateKey = "0x" + wallet._privKey.toString('hex');
  if (DEBUG) console.log("privateKey", privateKey)
  var EthUtil = require('ethereumjs-util');
  const address = "0x" + EthUtil.privateToAddress(wallet._privKey).toString('hex')
  console.log("🔐 Account Generated as " + address + " and set as mnemonic in packages/hardhat")
  console.log("💬 Use 'yarn run account' to get more information about the deployment account.")

  fs.writeFileSync("./" + address + ".txt", mnemonic.toString())
  fs.writeFileSync("./mnemonic.txt", mnemonic.toString())
});

task("mineContractAddress", "Looks for a deployer account that will give leading zeros")
  .addParam("searchFor", "String to search for")
  .setAction(async (taskArgs, { network, ethers }) => {

    let contract_address = ""
    let address;

    const bip39 = require("bip39")
    const hdkey = require('ethereumjs-wallet/hdkey');

    let mnemonic = ""
    while (contract_address.indexOf(taskArgs.searchFor) != 0) {

      mnemonic = bip39.generateMnemonic()
      if (DEBUG) console.log("mnemonic", mnemonic)
      const seed = await bip39.mnemonicToSeed(mnemonic)
      if (DEBUG) console.log("seed", seed)
      const hdwallet = hdkey.fromMasterSeed(seed);
      const wallet_hdpath = "m/44'/60'/0'/0/";
      const account_index = 0
      let fullPath = wallet_hdpath + account_index
      if (DEBUG) console.log("fullPath", fullPath)
      const wallet = hdwallet.derivePath(fullPath).getWallet();
      const privateKey = "0x" + wallet._privKey.toString('hex');
      if (DEBUG) console.log("privateKey", privateKey)
      var EthUtil = require('ethereumjs-util');
      address = "0x" + EthUtil.privateToAddress(wallet._privKey).toString('hex')


      const rlp = require('rlp');
      const keccak = require('keccak');

      let nonce = 0x00; //The nonce must be a hex literal!
      let sender = address;

      let input_arr = [sender, nonce];
      let rlp_encoded = rlp.encode(input_arr);

      let contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

      contract_address = contract_address_long.substring(24); //Trim the first 24 characters.


    }

    console.log("⛏  Account Mined as " + address + " and set as mnemonic in packages/hardhat")
    console.log("📜 This will create the first contract: " + chalk.magenta("0x" + contract_address));
    console.log("💬 Use 'yarn run account' to get more information about the deployment account.")

    fs.writeFileSync("./" + address + "_produces" + contract_address + ".txt", mnemonic.toString())
    fs.writeFileSync("./mnemonic.txt", mnemonic.toString())
  });

task("account", "Get balance informations for the deployment account.", async (_, { ethers }) => {
  const hdkey = require('ethereumjs-wallet/hdkey');
  const bip39 = require("bip39")
  let mnemonic = fs.readFileSync("./mnemonic.txt").toString().trim()
  if (DEBUG) console.log("mnemonic", mnemonic)
  const seed = await bip39.mnemonicToSeed(mnemonic)
  if (DEBUG) console.log("seed", seed)
  const hdwallet = hdkey.fromMasterSeed(seed);
  const wallet_hdpath = "m/44'/60'/0'/0/";
  const account_index = 0
  let fullPath = wallet_hdpath + account_index
  if (DEBUG) console.log("fullPath", fullPath)
  const wallet = hdwallet.derivePath(fullPath).getWallet();
  const privateKey = "0x" + wallet._privKey.toString('hex');
  if (DEBUG) console.log("privateKey", privateKey)
  var EthUtil = require('ethereumjs-util');
  const address = "0x" + EthUtil.privateToAddress(wallet._privKey).toString('hex')

  var qrcode = require('qrcode-terminal');
  qrcode.generate(address);
  console.log("‍📬 Deployer Account is " + address)
  for (let n in config.networks) {
    //console.log(config.networks[n],n)
    try {

      let provider = new ethers.providers.JsonRpcProvider(config.networks[n].url)
      let balance = (await provider.getBalance(address))
      console.log(" -- " + n + " --  -- -- 📡 ")
      console.log("   balance: " + ethers.utils.formatEther(balance))
      console.log("   nonce: " + (await provider.getTransactionCount(address)))
    } catch (e) {
      if (DEBUG) {
        console.log(e)
      }
    }
  }

});


async function addr(ethers, addr) {
  if (isAddress(addr)) {
    return getAddress(addr);
  }
  const accounts = await ethers.provider.listAccounts();
  if (accounts[addr] !== undefined) {
    return accounts[addr];
  }
  throw `Could not normalize address: ${addr}`;
}

task("accounts", "Prints the list of accounts", async (_, { ethers }) => {
  const accounts = await ethers.provider.listAccounts();
  accounts.forEach((account) => console.log(account));
});

task("blockNumber", "Prints the block number", async (_, { ethers }) => {
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(blockNumber);
});

task("balance", "Prints an account's balance")
  .addPositionalParam("account", "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(
      await addr(ethers, taskArgs.account)
    );
    console.log(formatUnits(balance, "ether"), "ETH");
  });

function send(signer, txparams) {
  return signer.sendTransaction(txparams, (error, transactionHash) => {
    if (error) {
      debug(`Error: ${error}`);
    }
    debug(`transactionHash: ${transactionHash}`);
    // checkForReceipt(2, params, transactionHash, resolve)
  });
}

task("send", "Send ETH")
  .addParam("from", "From address or account index")
  .addOptionalParam("to", "To address or account index")
  .addOptionalParam("amount", "Amount to send in ether")
  .addOptionalParam("data", "Data included in transaction")
  .addOptionalParam("gasPrice", "Price you are willing to pay in gwei")
  .addOptionalParam("gasLimit", "Limit of how much gas to spend")

  .setAction(async (taskArgs, { network, ethers }) => {
    const from = await addr(ethers, taskArgs.from);
    debug(`Normalized from address: ${from}`);
    const fromSigner = await ethers.provider.getSigner(from);

    let to;
    if (taskArgs.to) {
      to = await addr(ethers, taskArgs.to);
      debug(`Normalized to address: ${to}`);
    }

    const txRequest = {
      from: await fromSigner.getAddress(),
      to,
      value: parseUnits(
        taskArgs.amount ? taskArgs.amount : "0",
        "ether"
      ).toHexString(),
      nonce: await fromSigner.getTransactionCount(),
      gasPrice: parseUnits(
        taskArgs.gasPrice ? taskArgs.gasPrice : "1.001",
        "gwei"
      ).toHexString(),
      gasLimit: taskArgs.gasLimit ? taskArgs.gasLimit : 24000,
      chainId: network.config.chainId,
    };

    if (taskArgs.data !== undefined) {
      txRequest.data = taskArgs.data;
      debug(`Adding data to payload: ${txRequest.data}`);
    }
    debug(txRequest.gasPrice / 1000000000 + " gwei");
    debug(JSON.stringify(txRequest, null, 2));

    return send(fromSigner, txRequest);
  });

/**
 * most of the above is from austin
 * below is mine
 */

async function gBal(address, block, provider) {

  const result = await provider.request({
    method: "eth_getBalance",
    params: [
      `${address}`,
      `${block}`
    ]
  });

  return result;
}

/**
 * get your balance on any network
 */

task("bal", "Get balance")
  .addParam("adr", "Addr to check")
  .addParam("blk", "What time?")
  .setAction(async (taskArgs, { network }) => {

    const balance = await gBal(taskArgs.adr, taskArgs.blk, network.provider);

    console.log(
      chalk.yellowBright.bold(`\nBalance of ${taskArgs.adr}:\n${balance}\n`)
    )

  });

/**
 * sample where you can pull blocks from-to
 */

task("iterateBlocks", "Iterate through blocks of a blockchain")
  .addPositionalParam("from", "index of first")
  .addPositionalParam("to", "index or just 'latest'")
  .setAction(async (taskArgs, { network }) => {

    let from = parseInt(taskArgs.from, 10),
      to = (taskArgs.to == "latest") ? parseInt((await network.provider.request({ method: "eth_blockNumber", params: [] })), 16) : parseInt(taskArgs.to, 10);

    for (let i = from; i <= to; i++) {
      console.log(await network.provider.request({
        method: "eth_getBlockByNumber",
        params: [
          ("0x" + i.toString(16)),
          false
        ]
      }));
    }

  });

task("getAnyTxFromLatestBlock", "simple way to fetch some recent tx", async (_, { network }) => {

  // latestBlock with  tx hashes
  let latestBlock = await network.provider.request({ method: "eth_getBlockByNumber", params: ["latest", false] });

  if (latestBlock.transactions.length === 0) {
    for (let i = parseInt(latestBlock.number.slice(2), 16) - 1; latestBlock.transactions.length === 0; i--) {
      latestBlock = await network.provider.request({ method: "eth_getBlockByNumber", params: [("0x" + i.toString(16)), false] });
    }
  }

  console.log(latestBlock.transactions);

  let index = await question('Choose tx!\n');

  console.log(await network.provider.request({
    method: "eth_getTransactionByBlockNumberAndIndex",
    params: [
      latestBlock.number,
      ("0x" + index.toString(16))
    ]
  }));
});


/**
 * This is actually easier than iterating the blockchain
 * in essence, you just have to construct the filter object properly
 * which is thereafter used to just call the function that fetches everything for u
 */

task("accountsThatHoldCoin", "gotta catch em all")
  .addPositionalParam("address", "coin address")
  .addPositionalParam("from", "index of first")
  .addPositionalParam("to", "index or just 'latest'")
  .setAction(async (taskArgs, { network }) => {


    let from = parseInt(taskArgs.from, 10),
      to = (taskArgs.to == "latest") ? parseInt((await network.provider.request({ method: "eth_blockNumber", params: [] })), 16) : parseInt(taskArgs.to, 10);

    let coin = taskArgs.address;

    let filter;

    //    try {
    //
    //    filter = await network.provider.request({
    //      method: "eth_newFilter",
    //      params: [{
    //        fromBlock: ("0x" + from.toString(16)), //from block
    //        toBlock: ("0x" + to.toString(16)), //to block
    //        address: coin, //addr
    //        topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"] 
    //      }]
    //    });
    //
    //  } catch (e) {
    //    console.log("here");
    //  }
    //   ^^^^^^ idk why the above doesn't work, don't care since the below works fine perfectly _______
    let logs = await network.provider.request({
      method: "eth_getLogs",
      params: [{
        fromBlock: ("0x" + from.toString(16)), //from block
        toBlock: ("0x" + to.toString(16)), //to block
        address: coin, //addr
        topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"] // we are putting in here the keccak256 hash of the transfer event ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef  + 0x, which is a classic
      }]
    });

    let coinHolderAddresses = [];

    for (let i = 0; i < logs.length; i++) {
      for (let j = 1; j < 3; j++) {
        if (!coinHolderAddresses.includes(logs[i].topics[j])) {
          let check = await network.provider.request({
            method: "eth_call",
            params: [{
              to: coin,
              data: ("0x70a08231" + "000000000000000000000000" + logs[i].topics[j].slice(26))
            }]
          });
          /**
           * just saw that with parseInt u need not slice(2) it checks for 0x auto
           */

          check = parseInt(check);
          if (check > 0) {
            coinHolderAddresses.push(logs[i].topics[j]);
          }
        }
      }
    }

    console.log(coinHolderAddresses);

  });

task("testMeth", "test the meth").addPositionalParam("to").addPositionalParam("data").setAction(async (taskArgs, { network }) => {

  /**
   * example : yarn hardhat testMeth 71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9 0x70a0823100000000000000000000000064B29D930BA46aB7f55505f178896d16244c5922 --network xdai
   * abi spec: https://docs.soliditylang.org/en/latest/abi-spec.html
   */

  console.log(await network.provider.request({
    method: "eth_call",
    params: [{
      to: taskArgs.to,
      data: taskArgs.data
    }]
  }));

});

/**
 * 
 */

//task("allAddressesThatOwn", "find all accounts AND contracts that hold some coin")
//  .addPositionalParam("address", "which coin??")
//  .setAction(async (address, { network }) => {
//
//
//  });



module.exports = {
  solidity: "0.8.1",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: process.env.INFURA_RINKEBY,
      accounts: [process.env.IDENTITETK]
    },
    xdai: {
      url: process.env.XDAI_RPC1,
      accounts: [process.env.IDENTITETK]
    },
    mainnet: {
      url: process.env.INFURA_MAINNET,
      accounts: [process.env.IDENTITETK]
    }
  }
};

