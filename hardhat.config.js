require("@nomicfoundation/hardhat-toolbox");

// Offline-friendly compiler resolution: if the official binary list is not
// reachable, fall back to the soljson bundled with the local solc package.
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
} = require("hardhat/builtin-tasks/task-names");
const path = require("path");

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  try {
    return await runSuper(args);
  } catch (e) {
    const compilerPath = path.join(
      path.dirname(require.resolve("solc/package.json")),
      "soljson.js"
    );
    return {
      compilerPath,
      isSolcJs: true,
      version: args.solcVersion,
      longVersion: args.solcVersion,
    };
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
};
