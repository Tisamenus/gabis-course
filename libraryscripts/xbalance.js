const exec = require('./clcall.js');

async function xbalance() {
    const result = await exec.callFromCli(`yarn hardhat bal --adr ${process.argv[2]} --blk ${process.argv[3]} --network xdai`);
}
xbalance();