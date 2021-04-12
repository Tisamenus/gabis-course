const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require("chalk");

async function xbalance() {
    const {stdout, stderr} = await exec(`yarn hardhat bal --adr ${process.argv[2]} --blk ${process.argv[3]} --network xdai`);
    console.log(chalk.yellowBright.bold(`\nstdout: ${stdout}\n`));
    console.log(chalk.redBright.bold(`\nstderr: ${stderr}`))
}
xbalance();