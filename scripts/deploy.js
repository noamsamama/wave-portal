const { ethers } = require("hardhat");

async function main() {
  const portal = await ethers.deployContract("WavePortal");
  await portal.waitForDeployment();
  console.log("WavePortal deployed to:", await portal.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
