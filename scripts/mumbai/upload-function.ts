import "dotenv/config"
import fs from 'fs'
import type { Result, Struct, u16, Text, Bool } from '@polkadot/types'
import { type AccountId } from '@polkadot/types/interfaces'
import { Abi } from '@polkadot/api-contract'
import { OnChainRegistry, options, PinkContractPromise, signCertificate, signAndSend } from "@phala/sdk"
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'


interface WorkflowCodec extends Struct {
  id: u16
  name: Text
  enabled: Bool
  commandline: Text
}


async function main() {
  if (!process.env.WORKFLOW_ID) {
    throw new Error('Please set environment variable WORKFLOW_ID via .env file first.')
  }
  const workflowId = Number(process.env.WORKFLOW_ID)

  //
  // Step 1: Prepare everything for Phat Contract.
  //
  const endpoint = process.env.PHALA_TESTNET_ENDPOINT
  if (!endpoint) {
    throw new Error('Please set PHALA_TESTNET_ENDPOINT via .env file first.')
  }
  const apiPromise = await ApiPromise.create(options({ provider: new WsProvider(endpoint), noInitWarn: true }))
  const registry = await OnChainRegistry.create(apiPromise)

  const exported = fs.readFileSync('./polkadot-account.json', 'utf8')
  const keyring = new Keyring({ type: 'sr25519' })
  const pair = keyring.createFromJson(JSON.parse(exported))
  pair.decodePkcs8(process.env.POLKADOT_WALLET_PASSPHRASE)

  const cert = await signCertificate({ pair })

  //
  // Step 2: Init the brickProfileFactory instance, which is the account registry for the Phat Bricks dApp.
  //
  const brickProfileFactoryAbi = fs.readFileSync('./abis/brick_profile_factory.json', 'utf8')
  const brickProfileFactoryContractId = process.env.PHAT_BRICKS_TESTNET_FACTORY_CONTRACT_ID
  if (!brickProfileFactoryContractId) {
    throw new Error('Please set PHAT_BRICKS_MAINNET_FACTORY_CONTRACT_ID via .env file first.')
  }
  const brickProfileFactoryContractKey = await registry.getContractKeyOrFail(brickProfileFactoryContractId)
  const brickProfileFactory = new PinkContractPromise(apiPromise, registry, brickProfileFactoryAbi, brickProfileFactoryContractId, brickProfileFactoryContractKey)
  const { output: brickProfileAddressQuery } = await brickProfileFactory.query.getUserProfileAddress<Result<AccountId, any>>(pair.address, { cert })
  if (!brickProfileAddressQuery.isOk || !brickProfileAddressQuery.asOk.isOk) {
    throw new Error('Brick Profile Factory not found.')
  }

  //
  // Step 3: Check current user has been registered in the Phat Bricks dApp or not.
  //
  const brickProfileAbi = fs.readFileSync('./abis/brick_profile.json', 'utf8')
  const brickProfileContractId = brickProfileAddressQuery.asOk.asOk.toHex()
  const brickProfileContractKey = await registry.getContractKeyOrFail(brickProfileContractId)
  const brickProfile = new PinkContractPromise(apiPromise, registry, brickProfileAbi, brickProfileContractId, brickProfileContractKey)

  //
  // Step 4: Retrieve the workflow.
  //
  const { output: workflowQuery } = await brickProfile.query.getWorkflow<Result<WorkflowCodec, any>>(pair.address, { cert }, workflowId)
  if (!workflowQuery.isOk || !workflowQuery.asOk.isOk) {
    throw new Error('Workflow not found.')
  }
  const actions = JSON.parse(workflowQuery.asOk.asOk.commandline.toString())
  const actionOffchainRollupContractId = actions[0].config.callee

  //
  // Step 5: Init the actionOffchainRollup instance.
  //
  const rollupAbi = new Abi(fs.readFileSync('./abis/action_offchain_rollup.json', 'utf8'))
  // assume the codeHash is matched
  if (actions[0].config.codeHash !== rollupAbi.info.source.wasmHash.toHex()) {
    console.log(actions)
    throw new Error(
      `The codeHash of the workflow is not matched with the ActionOffchainRollup contract.\nExpected: ${actions[0].config.codeHash}\nActual: ${rollupAbi.info.source.wasmHash.toHex()}\n`
    )
  }
  const rollupContractKey = await registry.getContractKeyOrFail(actionOffchainRollupContractId)
  const rollupContract = new PinkContractPromise(apiPromise, registry, rollupAbi, actionOffchainRollupContractId, rollupContractKey)
  await signAndSend(
    rollupContract.tx.configCoreScript(
      { gasLimit: 1000000000000 },
      fs.readFileSync('./dist/index.js', 'utf8'), // core_js
    ),
    pair
  )
  console.log(`The Phat Function for workflow ${workflowId} has been updated.`)

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})