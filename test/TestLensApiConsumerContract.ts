import { expect } from "chai";
import { EventLog, type Contract, type ContractTransactionReceipt } from "ethers";
import { ethers } from "hardhat";
import { execSync } from "child_process";

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function waitForResponse(consumer: any, receipt: ContractTransactionReceipt) {
  const reqEvents = receipt.logs;
  const eventQueued = reqEvents[0] as EventLog;
  expect(eventQueued.eventName).to.be.eq("MessageQueued");
  const [, data] = eventQueued.args;
  // Run Phat Function
  const result = execSync(`phat-fn run --json dist/index.js -a ${data} https://api-mumbai.lens.dev/`).toString();
  const json = JSON.parse(result);
  const action = ethers.hexlify(ethers.concat([
    new Uint8Array([0]),
    json.output,
  ]));
  // Make a response
  const tx = await consumer.rollupU256CondEq(
    // cond
    [],
    [],
    // updates
    [],
    [],
    // actions
    [action],
  );
  const respReceipt = await tx.wait();
  return respReceipt;
}

describe("TestLensApiConsumerContract", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();
    const TestLensApiConsumerContract = await ethers.getContractFactory("TestLensApiConsumerContract");
    const consumer = await TestLensApiConsumerContract.deploy(owner.address);
    return { consumer, owner, attestor: owner }
  }

  it("Push and receive message", async function () {
    const { consumer } = await loadFixture(deployFixture);

    // Make a request
    const profileId = "0x01";
    const tx = await consumer.request(profileId);
    const receipt = await tx.wait();

    // Wait for Phat Function response
    const respReceipt = await waitForResponse(consumer, receipt!)

    // Check response data
    const eventResponseReceived = respReceipt.logs[0] as EventLog;
    expect(eventResponseReceived.eventName).to.be.eq("ResponseReceived");

    const [reqId, input, value] = eventResponseReceived.args;
    expect(reqId).to.be.a('BigInt');
    expect(input).to.equal(profileId);
    expect(value).to.be.a('BigInt');
  });
});
