import { ethers } from "hardhat";
import "dotenv/config";
async function main() {
  const TestLensApiConsumerContract = await ethers.getContractFactory("TestLensApiConsumerContract");

  const [deployer] = await ethers.getSigners();

  const consumerSC = process.env['MUMBAI_CONSUMER_CONTRACT_ADDRESS'] || "";
  const consumer = TestLensApiConsumerContract.attach(consumerSC);
  await Promise.all([
    consumer.deployed(),
  ])

  console.log('Setting attestor...');
  const attestor = process.env['MUMBAI_LENSAPI_ORACLE_ENDPOINT'] || deployer.address;
  await consumer.connect(deployer).setAttestor(attestor); // change this to the identity of your ActionOffchainRollup found in your LensAPI Oracle deployment labeled 'Oracle Endpoint'
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
