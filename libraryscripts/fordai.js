const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require("chalk");
require("dotenv").config();

async function fordai() {
    console.log(chalk.blueBright.bold("FORKING XDAI:\n"));
    const {stdout, stderr} = await exec(`yarn hardhat node --fork ${process.env.XDAI_ARCHIVE}`);
    console.log(chalk.yellowBright.bold(`\nstdout: ${stdout}\n`));
    console.log(chalk.redBright.bold(`\nstderr: ${stderr}`));
}
fordai();
