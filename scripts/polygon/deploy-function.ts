import "dotenv/config"
import fs from 'fs'
import type { Result, u16, Bool, Struct } from '@polkadot/types'
import { type AccountId } from '@polkadot/types/interfaces'
import { type BN } from '@polkadot/util'
import { Abi } from '@polkadot/api-contract'
import { OnChainRegistry, options, PinkContractPromise, PinkBlueprintPromise, signCertificate, PinkBlueprintSubmittableResult, signAndSend } from "@phala/sdk"
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import dedent from "dedent"

interface AccountData extends Struct {
  free: BN
}
interface Account extends Struct {
  data: AccountData
}


async function main() {
  const endpoint = process.env.PHALA_MAINNET_ENDPOINT || 'wss://api.phala.network/ws'
  if (!endpoint) {
    throw new Error('Please set PHALA_MAINNET_ENDPOINT via .env file first.')
  }
  const polygonRpcUrl = process.env.POLYGON_RPC_URL
  if (!polygonRpcUrl) {
    throw new Error('Please set POLYGON_RPC_URL via .env file first.')
  }
  const polygonConsumerContractAddress = process.env.POLYGON_CONSUMER_CONTRACT_ADDRESS
  if (!polygonConsumerContractAddress) {
    throw new Error('Please set POLYGON_CONSUMER_CONTRACT_ADDRESS via .env file first.')
  }

  console.log(dedent`
    We are going to deploy your Phat Function to Phala Network Mainnet: ${endpoint}
  `)

  const nodes = [
      {
        pruntimeURL: 'https://phat-cluster-de.phala.network/pruntime-01',
        workerId:
          '0xe028af412138fe0a31ab0b3671243bdbe19d1a164837b04e7d8d355091fcd844',
      },
      {
        pruntimeURL: 'https://phat-cluster-de.phala.network/pruntime-03',
        workerId:
          'b063d754602f22a3ac2af01ebdb2140357e3ca3d102e55a4d44a751fcb03b040',
      },
      {
        pruntimeURL: 'https://phat-cluster-de.phala.network/pruntime-04',
        workerId:
          '6628b623e2a9b795b57f8dc91c5718b7b63722e1ee617030845a967ff0c8c72e',
      },
      {
        pruntimeURL: 'https://phat-cluster-de.phala.network/pruntime-05',
        workerId:
          '9099308d294e320e001d567b21cee3177d149da08a2f3e7534e7f369d93f4e5e',
      },
  ]
  // pick random one
  const picked = nodes[Math.floor(Math.random() * nodes.length)]
  console.log('picked', picked)

  const apiPromise = await ApiPromise.create(options({ provider: new WsProvider(endpoint), noInitWarn: true }))
  const registry = await OnChainRegistry.create(
    apiPromise,
    {
      clusterId: '0x0000000000000000000000000000000000000000000000000000000000000001',
      systemContractId: '0x9dc2f09872e69f622cedbb3743aea482c740d9973f30f45c26cb8ed9782e6ab2',
      ...picked,
      skipCheck: true,
    }
  )

  const keyring = new Keyring({ type: 'sr25519' })
  let pair
  if (process.env.POLKADOT_WALLET_SURI) {
    pair = keyring.addFromUri(process.env.POLKADOT_WALLET_SURI)
  } else if (process.env.POLKADOT_WALLET_PASSPHRASE && fs.existsSync('./polkadot-account.json')) {
    const exported = fs.readFileSync('./polkadot-account.json', 'utf8')
    pair = keyring.createFromJson(JSON.parse(exported))
    pair.decodePkcs8(process.env.POLKADOT_WALLET_PASSPHRASE)
  } else {
    console.log(dedent`
      ❗ You need create Brick Profile before continue.

      You can checkout out guide here: https://github.com/Phala-Network/lensapi-oracle-consumer-contract#create-a-bricks-profile

      Create your Brick Profile here: https://bricks.phala.network
    `)
    return
  }
  const cert = await signCertificate({ pair })

  const brickProfileFactoryAbi = fs.readFileSync('./abis/brick_profile_factory.json', 'utf8')
  const brickProfileFactoryContractId = process.env.PHAT_BRICKS_MAINNET_FACTORY_CONTRACT_ID || '0xb59bcc4ea352f3d878874d8f496fb093bdf362fa59d6e577c075f41cd7c84924'
  if (!brickProfileFactoryContractId) {
    throw new Error('Please set PHAT_BRICKS_MAINNET_FACTORY_CONTRACT_ID via .env file first.')
  }
  const brickProfileFactoryContractKey = await registry.getContractKeyOrFail(brickProfileFactoryContractId)
  const brickProfileFactory = new PinkContractPromise(apiPromise, registry, brickProfileFactoryAbi, brickProfileFactoryContractId, brickProfileFactoryContractKey)
  const { output: brickProfileAddressQuery } = await brickProfileFactory.query.getUserProfileAddress<Result<AccountId, any>>(pair.address, { cert })
  if (!brickProfileAddressQuery.isOk || !brickProfileAddressQuery.asOk.isOk) {
    console.log(dedent`
      ❗ You need create Brick Profile before continue.

      You can checkout out guide here: https://github.com/Phala-Network/lensapi-oracle-consumer-contract#create-a-bricks-profile

      Create your Brick Profile here: https://bricks.phala.network
    `)
    return
  }
  const brickProfileContractId = brickProfileAddressQuery.asOk.asOk.toHex()
  const contractInfo = await registry.phactory.getContractInfo({ contracts: [brickProfileContractId] })
  const brickProfileCodeHash = contractInfo.contracts[0].codeHash

  console.log(`Your Brick Profile contract ID: ${brickProfileContractId}`)

  let brickProfileAbi
  // compatible for previously version.
  if (brickProfileCodeHash === '0x3b3d35f92494fe60d9f9f6139ea83964dc4bca84d7ac66e985024358c9c62969') {
    brickProfileAbi = fs.readFileSync('./abis/brick_profile-0.2.0.json', 'utf8')
  } else {
    brickProfileAbi = fs.readFileSync('./abis/brick_profile-1.0.1.json', 'utf8')
  }

  const brickProfileContractKey = await registry.getContractKeyOrFail(brickProfileContractId)
  const brickProfile = new PinkContractPromise(apiPromise, registry, brickProfileAbi, brickProfileContractId, brickProfileContractKey)

  const rollupAbi = new Abi(fs.readFileSync('./abis/action_offchain_rollup-mainnet.json', 'utf8'))
  const codeHash = rollupAbi.info.source.wasmHash.toHex()

  const { output } = await registry.systemContract!.query['system::codeExists']<Bool>(pair.address, { cert }, codeHash, 'Ink')
  if (!output.isOk || !output.asOk.isTrue) {
    throw new Error(`code not exists: ${codeHash}`)
  }
  console.log(`ActionOffchainRollup code hash: ${codeHash}`)

  const source = fs.readFileSync('./dist/index.js', 'utf8')
  const blueprint = new PinkBlueprintPromise(apiPromise, registry, rollupAbi, codeHash)

  console.log('Estimating gas ...')

  let gasLimit

  // estimate gas fee & storage deposit fee, check cluster balance enough or not.
  {
    const estimate = await blueprint.query.withConfiguration(
      cert.address,
      { cert },
      polygonRpcUrl, // client_rpc
      polygonConsumerContractAddress, // client_addr
      source, // core_js
      'https://api.lens.dev/', // core_settings
      brickProfileContractId, // brick_profile
    )

    const gasFee = estimate.gasRequired.refTime.toNumber() / 1e12
    const storageDepositeFee = !estimate.storageDeposit.isCharge ? 0 : (
      (registry.clusterInfo?.depositPerByte?.toNumber() ?? 0) * (
        source.length / 2 * 2.2
      ) / 1e12
    )
    const minRequired = gasFee + storageDepositeFee

    const onchainBalance = (await apiPromise.query.system.account<Account>(pair.address)).data.free.toNumber() / 1e12
    const clusterBalance = (await registry.getClusterBalance(pair.address)).free.toNumber() / 1e12
    console.log('Estimate minRequired:', minRequired)
    console.log('Your Balance onchain/cluster:', onchainBalance, clusterBalance)

    if (clusterBalance < minRequired) {
      if (onchainBalance < minRequired) {
        console.log(`Your account balance is too low: minimal required: ${minRequired.toFixed(2)} PHA, you have ${onchainBalance.toFixed(2)}`)
        return
      }
      const to = (minRequired - clusterBalance).toFixed(4)
      console.log(`Depositing ${to} PHA to cluster...`)
      await signAndSend(registry.transferToCluster(pair.address, Number(to) * 1e12), pair)
    }

    gasLimit = estimate.gasRequired.refTime.toNumber()
  }

  console.log('Instantiating the ActionOffchainRollup contract...')

  const result = await signAndSend<PinkBlueprintSubmittableResult>(
    blueprint.tx.withConfiguration(
      { gasLimit },
      polygonRpcUrl, // client_rpc
      polygonConsumerContractAddress, // client_addr
      source, // core_js
      'https://api.lens.dev/', // core_settings
      brickProfileContractId, // brick_profile
    ),
    pair
  )
  await result.waitFinalized()
  const contractPromise = result.contract
  console.log('The ActionOffchainRollup contract has been instantiated: ', contractPromise.address.toHex())

  const { output: attestorQuery } = await contractPromise.query.getAttestAddress(cert.address, { cert })
  const attestor = attestorQuery.asOk.toHex()

  const selectorUint8Array = rollupAbi.messages.find(i => i.identifier === 'answer_request')?.selector.toU8a()
  const selector = Buffer.from(selectorUint8Array!).readUIntBE(0, selectorUint8Array!.length)
  const actions = JSON.stringify([
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
  ])
  const { output: numberQuery } = await brickProfile.query.workflowCount<u16>(pair.address, { cert })
  const num = numberQuery.asOk.toNumber()
  const name = `My Phat Function ${num}`

  // estimate gas fee & storage deposit fee, check cluster balance enough or not.
  {
    const estimate = await brickProfile.query.addWorkflow(
      cert.address,
      { cert },
      name,
      actions
    )

    const gasFee = estimate.gasRequired.refTime.toNumber() / 1e12
    const storageDepositeFee = !estimate.storageDeposit.isCharge ? 0 : estimate.storageDeposit.asCharge.toNumber() / 1e12
    const minRequired = gasFee + storageDepositeFee

    const onchainBalance = (await apiPromise.query.system.account<Account>(pair.address)).data.free.toNumber() / 1e12
    const clusterBalance = (await registry.getClusterBalance(pair.address)).free.toNumber() / 1e12
    console.log('Estimate minRequired:', minRequired)
    console.log('Your Balance onchain/cluster:', onchainBalance, clusterBalance)

    if (clusterBalance < minRequired) {
      if (onchainBalance < minRequired) {
        console.log(`Your account balance is too low: minimal required: ${minRequired.toFixed(2)} PHA, you have ${onchainBalance.toFixed(2)}`)
        return
      }
      const to = (minRequired - clusterBalance).toFixed(4)
      console.log(`Depositing ${to} PHA to cluster...`)
      await signAndSend(registry.transferToCluster(pair.address, Number(to) * 1e12), pair)
    }

    gasLimit = estimate.gasRequired.refTime.toNumber()
  }

  const { blocknum: initBlockNum } = await registry.phactory.getInfo({})

  console.log('Creating the workflow ...')

  await signAndSend(
    brickProfile.tx.addWorkflow({ gasLimit }, name, actions),
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

  console.log('Authorizing the workflow ...')

  const externalAccountId = 0
  await signAndSend(
    brickProfile.tx.authorizeWorkflow({ gasLimit: 1000000000000 }, num, externalAccountId),
    pair
  )
  const finalMessage = dedent`
    🎉 Your workflow has been added, you can check it out here: https://bricks.phala.network/workflows/${brickProfileContractId}/${num}

       You also need to set up the attestor in your .env file:

       POLYGON_LENSAPI_ORACLE_ENDPOINT=${attestor}

       Then run:

       yarn main-set-attestor

       Then send the test request with follow up command:

       yarn main-push-request

       You can continue update the Phat Function codes and update it with follow up commands:

       yarn build-function
       WORKFLOW_ID=${numberQuery.asOk.toNumber()} yarn main-update-function
  `
  console.log(`\n${finalMessage}\n`)

  process.exit(0)
}

main().then(() => {
  process.exit(0)
}).catch(err => {
  console.log('\n----')
  console.error(err)
  process.exit(1)
})
