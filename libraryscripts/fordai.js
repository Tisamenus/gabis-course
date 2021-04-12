require("dotenv").config();
const chalk = require("chalk");
const exec = require('./clcall.js');

async function fordai() {
    console.log(chalk.blueBright.bold("FORKING XDAI:\n"));
    const result = await exec.callFromCli(`yarn hardhat node --fork ${process.env.XDAI_ARCHIVE}`);
}
fordai();
