const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require("chalk");

async function xbalance() {
    try {
    const {stdout, stderr} = await exec(`yarn hardhat bal --adr ${process.argv[2]} --blk ${process.argv[3]} --network xdai`);
    } catch(e) {
        console.log(e);
        return;
    }
    console.log(chalk.yellowBright.bold(`\nstdout: ${stdout}\n`));
    console.log(chalk.redBright.bold(`\nstderr: ${stderr}`))
}
xbalance();