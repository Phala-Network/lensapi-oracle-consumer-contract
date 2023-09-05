import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { execSync } from "child_process";

describe("TestLensApiConsumerContract", function () {
  it("Push and receive message", async function () {
    // Deploy the contract
    const [deployer] = await ethers.getSigners();
    const TestLensApiConsumerContract = await ethers.getContractFactory("TestLensApiConsumerContract");
    const consumer = await TestLensApiConsumerContract.deploy(deployer.address);

    // Make a request
    const profileId = "0x01";
    await expect(consumer.request(profileId)).to.emit(consumer, "MessageQueued");

    // Start a localhost Phat functions server to execute the task
    execSync(`yarn localhost-watch ${consumer.address} artifacts/contracts/TestLensApiConsumerContract.sol/TestLensApiConsumerContract.json dist/index.js -a https://api-mumbai.lens.dev/ --onece`, { stdio: 'inherit' });

    // Wait for response
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(assert.fail('Request timeout.'));
      }, 10000);
    });
    const eventPromise = new Promise((resolve, reject) => {
      consumer.once("ResponseReceived", async (reqId: number, pair: string, value: number) => {
        console.info("Received event [ResponseReceived]:", {
          reqId,
          pair,
          value,
        });
        assert.isNumber(Number(reqId));
        expect(pair).to.equal(profileId);
        assert.isNumber(Number(value));
        resolve(reqId);
      });
    })
    await Promise.race([eventPromise, timeoutPromise]);
  });
});
