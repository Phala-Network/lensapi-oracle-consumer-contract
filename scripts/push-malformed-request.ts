import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const TestLensOracle = await ethers.getContractFactory("TestLensOracle");

  const [deployer] = await ethers.getSigners();

  const clientSC = process.env['POLYGON_MAINNET_CLIENT_SC'] ?? '0xd92D942347134C10afb797D63B70534771f20034'; // use POLYGON_MAINNET_CLIENT_SC for mainnet and POLYGON_MUMBAI_CLIENT_SC for mumbai testnet
  const oracle = await TestLensOracle.attach(clientSC); // change this to your client smart contract address
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
