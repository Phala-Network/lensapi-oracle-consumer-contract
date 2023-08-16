import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const TestLensApiConsumerContract = await ethers.getContractFactory("TestLensApiConsumerContract");

  const [deployer] = await ethers.getSigners();

  console.log('Deploying...');
  const attestor = process.env['POLYGON_LENSAPI_ORACLE_ENDPOINT'] || deployer.address;  // When deploy for real e2e test, change it to the real attestor wallet.
  const consumer = await TestLensApiConsumerContract.deploy(attestor);
  await consumer.deployed();
  console.log('Deployed', {
    consumer: consumer.address,
  });

  console.log('Configuring...');
  await consumer.connect(deployer).request("0x01c567");
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
