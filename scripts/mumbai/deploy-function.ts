import "dotenv/config"
import fs from 'fs'
import type { Result, u16 } from '@polkadot/types'
import { type AccountId } from '@polkadot/types/interfaces'
import { Abi } from '@polkadot/api-contract'
import { OnChainRegistry, options, PinkContractPromise, PinkBlueprintPromise, signCertificate, PinkBlueprintSubmittableResult, signAndSend } from "@phala/sdk"
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'

async function main() {
  const endpoint = process.env.PHALA_TESTNET_ENDPOINT
  if (!endpoint) {
    throw new Error('Please set PHALA_TESTNET_ENDPOINT via .env file first.')
  }
  const apiPromise = await ApiPromise.create(options({ provider: new WsProvider(endpoint), noInitWarn: true }))
  const registry = await OnChainRegistry.create(apiPromise)

  const keyring = new Keyring({ type: 'sr25519' })
  let pair
  if (process.env.POLKADOT_WALLET_SURI) {
    pair = keyring.addFromUri(process.env.POLKADOT_WALLET_SURI)
  } else if (process.env.POLKADOT_WALLET_PASSPHRASE && fs.existsSync('./polkadot-account.json')) {
    const exported = fs.readFileSync('./polkadot-account.json', 'utf8')
    pair = keyring.createFromJson(JSON.parse(exported))
    pair.decodePkcs8(process.env.POLKADOT_WALLET_PASSPHRASE)
  } else {
    throw new Error('You need set a polkadot account to continue, please check README.md for details.')
  }
  const cert = await signCertificate({ pair })

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

  const brickProfileAbi = fs.readFileSync('./abis/brick_profile.json', 'utf8')
  const brickProfileContractId = brickProfileAddressQuery.asOk.asOk.toHex()
  const brickProfileContractKey = await registry.getContractKeyOrFail(brickProfileContractId)
  const brickProfile = new PinkContractPromise(apiPromise, registry, brickProfileAbi, brickProfileContractId, brickProfileContractKey)

  const rollupAbi = new Abi(fs.readFileSync('./abis/action_offchain_rollup.json', 'utf8'))
  const blueprint = new PinkBlueprintPromise(apiPromise, registry, rollupAbi, rollupAbi.info.source.wasmHash.toHex())
  const result = await signAndSend<PinkBlueprintSubmittableResult>(
    blueprint.tx.withConfiguration(
      { gasLimit: 1000000000000 },
      process.env.MUMBAI_RPC_URL, // client_rpc
      process.env.MUMBAI_LENSAPI_ORACLE_ENDPOINT, // client_addr
      fs.readFileSync('./dist/index.js', 'utf8'), // core_js
      'https://api-mumbai.lens.dev/', // core_settings
      brickProfileContractId, // brick_profile
    ),
    pair
  )
  await result.waitFinalized()
  const contractPromise = result.contract
  console.log('The ActionOffchainRollup contract has been instantiated: ', contractPromise.address.toHex())

  const selector = rollupAbi.messages.find(i => i.identifier === 'answer_request')?.selector.toHex()
  const actions = [
    {
      cmd: 'call',
      config: {
        codeHash: rollupAbi.info.source.wasmHash.toHex(),
        callee: contractPromise.address.toHex(),
        selector,
        input: [],
      },
    },
    {
      cmd: "log",
    },
  ]
  const { output: numberQuery } = await brickProfile.query.workflowCount<u16>(pair.address, { cert })
  const num = numberQuery.asOk.toNumber()
  const { blocknum: initBlockNum } = await registry.phactory.getInfo({})

  await signAndSend(
    brickProfile.tx.addWorkflow({ gasLimit: 1000000000000 }, `My Phat Function ${numberQuery.asOk.toNumber()}`, JSON.stringify(actions)),
    pair
  )

  // How many blocks wait for confirmations
  const confirmations = 8
  while (true) {
    const { blocknum } = await registry.phactory.getInfo({})
    if (blocknum > initBlockNum + confirmations) {
      throw new Error(
        `Wait for transaction finalized in PRuntime but timeout after ${confirmations} blocks.`
      )
    }
    const { output: numberQuery } = await brickProfile.query.workflowCount<u16>(pair.address, { cert })
    if (numberQuery.asOk.toNumber() > num) {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 5_000))
  }
  const externalAccountId = 0
  await signAndSend(
    brickProfile.tx.authorizeWorkflow({ gasLimit: 1000000000000 }, num, externalAccountId),
    pair
  )
  console.log(`Your workflow has been added: https://bricks-poc5.phala.network//workflows/${brickProfileContractId}/${num}`)

  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
