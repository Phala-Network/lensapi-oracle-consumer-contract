import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const TestLensOracle = await ethers.getContractFactory("TestLensOracle");

  const [deployer] = await ethers.getSigners();
  const { name: network } = await ethers.provider.getNetwork();

  const consumerSC = (network == 'polygon') ? process.env['POLYGON_MAINNET_CONSUMER_SC'] : process.env['POLYGON_MUMBAI_CONSUMER_SC'];
  const oracle = await TestLensOracle.attach(consumerSC ?? "");
  await Promise.all([
    oracle.deployed(),
  ])

  console.log('Pushing a malformed request...');
  await oracle.connect(deployer).malformedRequest("0x01");
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
