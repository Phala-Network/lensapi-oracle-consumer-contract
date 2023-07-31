import { ethers } from "hardhat";
import "dotenv/config";
async function main() {
  const TestLensOracle = await ethers.getContractFactory("TestLensOracle");

  const [deployer] = await ethers.getSigners();

  const clientSC = process.env['POLYGON_MAINNET_CLIENT_SC'] ?? ""; // use POLYGON_MAINNET_CLIENT_SC for mainnet and POLYGON_MUMBAI_CLIENT_SC for mumbai testnet
  const oracle = await TestLensOracle.attach(clientSC); // change this to your client smart contract address
  await Promise.all([
    oracle.deployed(),
  ])

  console.log('Setting attestor ...');
  const attestor = process.env['LENSAPI_ORACLE_ENDPOINT'] ?? deployer.address;
  await oracle.connect(deployer).setAttestor(attestor); // change this to the identity of your ActionOffchainRollup found in your LensAPI Oracle deployment labeled 'Oracle Endpoint'
  console.log('Done');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
