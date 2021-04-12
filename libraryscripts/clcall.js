const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require("chalk");

module.exports.callFromCli = async function clcall(strarg) {
    const {stdout, stderr} = await exec(strarg);
    console.log(chalk.redBright(`\nstderr: ${stderr}`));
    console.log(`\nstdout: ${stdout}\n`);
}