# Polygon Consumer Contract for LensAPI Oracle
![](./assets/Phat-Contract-Logo.png)
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Deploy to Polygon Mumbai Testnet](#deploy-to-polygon-mumbai-testnet)
    - [Verify Contract on Polygon Mumabai Testnet](#verify-contract-on-polygon-mumbai-testnet)
  - [Deploy Phat Contract to Phala PoC5 Testnet](#deploy-phat-contract-to-poc5-testnet)
    - [Interact with Consumer Contract on Polygon Mumbai](#interact-with-consumer-contract-on-polygon-mumbai)
    - [Update Phat Contract on Phala PoC5 Testnet](#update-phat-contract-on-phala-poc5-testnet)
  - [Deploy to Polygon Mainnet](#deploy-to-polygon-mainnet)
    - [Verify Contract on Polygon Mainnet](#verify-contract-on-polygon-mainnet)
  - [Deploy Phat Contract to Phala Mainnet](#deploy-phat-contract-to-phala-mainnet)
    - [Interact with Consumer Contract on Polygon Mainnet](#interact-with-consumer-contract-on-polygon-mainnet)
    - [Update Phat Contract on Phala Mainnet](#update-phat-contract-on-phala-mainnet)
      
- [Closing](#closing)

## Overview
This project represents a basic Polygon Consumer Contract that is compatible with a deployed LensAPI Oracle via [Phat Bricks UI](https://bricks.phala.network).

## Prerequisites
- Active deployed LensAPI Oracle Blueprint via [Phat Bricks](https://bricks.phala.network)
- Address of the "[Oracle Endpoint](https://docs.phala.network/developers/bricks-and-blueprints/featured-blueprints/lensapi-oracle#step-3-connect-your-smart-contract-to-the-oracle)" in deployed LensAPI Oracle
- [Hardhat](https://hardhat.org)
- For Polygon Mainnet deployments:
  - Polygonscan API Key that can be generated on [polygonscan](https://polygonscan.com)
- RPC Endpoint for Polygon Mainnet & Mumbai Testnet
  - [Alchemy](https://alchemy.com) - This repo example uses Alchemy's API Key.
  - [Infura](https://infura.io)
  - Personal RPC Node
- Polkadot Account for Phala PoC5 Testnet and Mainnet deployment

## Getting Started
First you will need to run `cp .env.local .env` to copy over the local environment variables.
> If you are looking for how to test your custom JS function locally before deploying to PoC5 Testnet or Mainnet, check out the [README.md](./src/README.md) in the `./src/` directory.
> 

### Environment Variables:
- `MUMBAI_RPC_URL` - JSON-RPC URL with an API key for RPC endpoints on Polygon Mumbai Testnet (e.g. [Alchemy](https://alchemy.com) `https://polygon-mumbai.g.alchemy.com/v2/<api-key>`, [Infura](https://infura.io) `https://polygon.infura.io/v3/<api-key>`).
- `POLYGON_RPC_URL` - JSON-RPC URL with an API key for RPC endpoints on Polygon Mainnet (e.g. [Alchemy](https://alchemy.com) `https://polygon.g.alchemy.com/v2/<api-key>`, [Infura](https://infura.io) `https://polygon.infura.io/v3/<api-key>`).
- `DEPLOYER_PRIVATE_KEY` - Secret key for the deployer account that will deploy the Consumer Contract on either Polygon Mainnet or Polygon Mumbai Testnet.
- `POLYGONSCAN_API_KEY` - Polygonscan API Key that can be generated at [polygonscan](https://polygonscan.com).
- `MUMBAI_LENSAPI_ORACLE_ENDPOINT` - LensAPI Oracle Endpoint Address that can be found in the dashboard of the deployed LensAPI Oracle Blueprint at [Phala PoC5 Testnet](https://bricks-poc5.phala.network) for Polygon Mumbai Testnet.
- `POLYGON_LENSAPI_ORACLE_ENDPOINT` - LensAPI Oracle Endpoint Address that can be found in the dashboard of the deployed LensAPI Oracle Blueprint at [Phala Mainnet](https://bricks.phala.network) for Polygon Mainnet.
- `POLKADOT_WALLET_PASSPHRASE` - TODO
- `POLKADOT_WALLET_SURI`(optional) - TODO
- `WORKFLOW_ID` - TODO

## Deployment
Now that you have the prerequisites to deploy a Polygon Consumer Contract on Polygon, lets begin with some initials tasks.
### Install Dependencies & Compile Contracts
```shell
# install dependencies
$ yarn

# compile contracts
$ yarn compile
```
### Deploy to Polygon Mumbai Testnet
With the contracts successfully compiled, now we can begin deploying first to Polygon Mumbai Testnet. If you have not gotten `MATIC` for Mumbai Testnet then get `MATIC` from a [faucet](https://mumbaifaucet.com/).
Ensure to save the address after deploying the Consumer Contract because this address will be use in the "[Configure Client](https://docs.phala.network/developers/bricks-and-blueprints/featured-blueprints/lensapi-oracle#step-4-configure-the-client-address)" section of Phat Bricks UI. The deployed address will also be set to the environment variable [`MUMBAI_CONSUMER_CONTRACT_ADDRESS`](./.env.local).
```bash
yarn test-deploy
```
```shell
# deploy contracts to testnet mumbai
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-deploy                                                                       ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat run --network mumbai ./scripts/mumbai/deploy.ts
Deploying...
Deployed { consumer: '0x090E8fDC571d65459569BC87992C1026121DB955' }
Configuring...
Done
✨  Done in 8.18s.

```
#### Verify Contract on Polygon Mumbai Testnet
Ensure to update the [`mumbai.arguments.ts`](./mumbai.arguments.ts) file with the constructor arguments used to instantiate the Consumer Contract. If you add additional parameters to the constructor function then make sure to update the `mumbai.arguments.ts` file.
> **Note**: Your contract address will be different than `0x090E8fDC571d65459569BC87992C1026121DB955` when verifying your contract. Make sure to get your actual contract address from the console log output after executing `yarn test-deploy`.
```shell
yarn test-verify <MUMBAI_CONSUMER_CONTRACT_ADDRESS>
```
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-verify 0x090E8fDC571d65459569BC87992C1026121DB955                            ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat verify --network mumbai --constructor-args mumbai.arguments.ts 0x090E8fDC571d65459569BC87992C1026121DB955
Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/TestLensApiConsumerContract.sol:TestLensApiConsumerContract at 0x090E8fDC571d65459569BC87992C1026121DB955
for verification on the block explorer. Waiting for verification result...

Successfully verified contract TestLensApiConsumerContract on Etherscan.
https://mumbai.polygonscan.com/address/0x090E8fDC571d65459569BC87992C1026121DB955#code
✨  Done in 5.91s.

```

### Deploy Phat Contract to PoC5 Testnet
For customizing your Phat Contract function, checkout default function [README.md](./src/README.md) and advanced configurations in [ADVANCED.md](./src/ADVANCED.md) to learn more before deploying to PoC5 testnet.

First you will need to build your function with this command:
```shell
yarn build-function
```
Here is the expected output:
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn build-function                                                                    ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ phat-fn build src/index.ts
Creating an optimized build... done
Compiled successfully.

  17.66 KB  dist/index.js
✨  Done in 3.71s.
```
Now that are Phat Contract function has built successfully, let's deploy to PhalaPoC5 Testnet with the following command:
```shell
yarn test-deploy-function
```
Here is the expected output:
> Note: your contract IDs will very and not be the same as the IDs below.
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-deploy-function                                                              ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat run --network mumbai ./scripts/mumbai/deploy-function.ts
We going to deploy your Phat Function to Phala Network Testnet: wss://poc5.phala.network/ws
(node:12200) ExperimentalWarning: buffer.Blob is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Your Brick Profile contract ID: 0xfd18dca07dc76811dd99b14ee6fe3b82e135ed06a2c311b741e6c9163892b32c
The ActionOffchainRollup contract has been instantiated:  0x1161a649467fac4532b3ef85b70bf750380dea49c3efbb4ce8db66d0de47389a

🎉 Your workflow has been added, you can check it out here: https://bricks-poc5.phala.network//workflows/0xfd18dca07dc76811dd99b14ee6fe3b82e135ed06a2c311b741e6c9163892b32c/0

   You also need set up the attestor to your .env file:

   MUMBAI_LENSAPI_ORACLE_ENDPOINT=0x1f6911eaa71405eb043961c0ba4bb6ed7ecc5c8e

   Then run:

   yarn test-set-attestor

   Then send the test request with follow up command:

   yarn test-push-request

   You can continue update the Phat Function codes and update it with follow up commands:

   yarn build-function
   WORKFLOW_ID=0 yarn test-update-function

✨  Done in 36.35s.
```

Go to the [PoC5 Testnet Bricks UI](https://bricks-poc5.phala.network) Dashboard and you can see your newly deployed function.
![](./assets/Function-added.png)

#### Interact with Consumer Contract on Polygon Mumbai
Test Consumer Contract on Mumbai with a few tests to check for malformed requests failures, successful requests, and set the attestor.
```shell
yarn test-set-attestor
```
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-set-attestor                                                                 ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat run --network mumbai ./scripts/mumbai/set-attestor.ts
Setting attestor...
🚨NOTE🚨
Make sure to set the Consumer Contract Address in your Phat Bricks 🧱 UI dashboard (https://bricks-poc5.phala.network)
- Go to 'Configure Client' section where a text box reads 'Add Consumer Smart Contract'
- Set value to 0x090E8fDC571d65459569BC87992C1026121DB955
Done
✨  Done in 2.69s.
```
```shell
yarn test-push-malformed-request
```
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-push-malformed-request                                                       ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat run --network mumbai ./scripts/mumbai/push-malformed-request.ts
Pushing a malformed request...
Done
✨  Done in 2.48s.

# execute push-request
$ yarn test-push-request
Pushing a request...
Done
```

### Update Phat Contract on Phala PoC5 Testnet
Now let's update the function that we have deployed. Once we have updated the function, we must build the function again.
```shell
yarn build-function
```
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn build-function                                                                    ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ phat-fn build src/index.ts
Creating an optimized build... done
Compiled successfully.

  17.66 KB  dist/index.js
✨  Done in 3.48s.

```
> Note: Before we update the function, make sure to take the `WORKFLOW_ID` from the deployment of the Phat Contract function step and set it in your `.env` file.

Now let's update the function with the following command:
```shell
yarn test-update-function
```
```shell
➜  lensapi-oracle-consumer-contract git:(main) ✗ yarn test-update-function                                                              ~/Projects/Phala/LensCampaign/DevDAO/lensapi-oracle-consumer-contract
yarn run v1.22.18
$ hardhat run --network mumbai ./scripts/mumbai/update-function.ts
(node:12991) ExperimentalWarning: buffer.Blob is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Your Brick Profile contract ID: 0xfd18dca07dc76811dd99b14ee6fe3b82e135ed06a2c311b741e6c9163892b32c
The Phat Function for workflow 0 has been updated.
✨  Done in 5.07s.
```

### Deploy to Polygon Mainnet
Ensure to save the address after deploying the Consumer Contract because this address will be used in the "[Configure Client](https://docs.phala.network/developers/bricks-and-blueprints/featured-blueprints/lensapi-oracle#step-4-configure-the-client-address)" section of Phat Bricks UI. The deployed address will also be set to the environment variable [`POLYGON_CONSUMER_CONTRACT_ADDRESS`](./.env.local).
> **Note**: Your contract address will be different than `0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4` when verifying your contract. Make sure to get your actual contract address from the console log output after executing `yarn main-deploy`.
```shell
# deploy contracts to polygon mainnet
$ yarn main-deploy
Deploying...
Deployed { consumer: '0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4' }
Configuring...
Done

# Check our example deployment in <https://polygonscan.com/address/0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4>
```
#### Verify Contract on Polygon Mainnet
Ensure to update the [`polygon.arguments.ts`](./polygon.arguments.ts) file with the constructor arguments used to instantiate the Consumer Contract. If you add additional parameters to the constructor function then make sure to update the `polygon.arguments.ts` file.
```shell
$ yarn main-verify 0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4
Nothing to compile
No need to generate any newer typings.
Successfully submitted source code for contract
contracts/TestLensApiConsumerContract.sol.sol:TestLensApiConsumerContract.sol.sol at 0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4
for verification on the block explorer. Waiting for verification result...

Successfully verified contract TestLensApiConsumerContract.sol on Etherscan.
https://polygonscan.com/address/0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4#code
Done in 8.88s.
```
### Deploy Phat Contract to Phala Mainnet
TODO

#### Interact with Consumer Contract on Polygon Mainnet
Execute Scripts to Consumer Contract on Polygon Mainnet. The Consumer Contract on Polygon Mainnet with a few actions to mimic a malformed request, successful requests, and set the attestor.
```shell
# set the attestor to the Oracle Endpoint in Phat Bricks UI
$ yarn main-set-attestor
Setting attestor...
🚨NOTE🚨
Make sure to set the Consumer Contract Address in your Phat Bricks 🧱 UI dashboard (https://bricks-poc5.phala.network)
- Go to 'Configure Client' section where a text box reads 'Add Consumer Smart Contract'
- Set value to 0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4
Done
✨  Done in 1.56s.
# execute push-malformed-request
$ yarn main-push-malformed-request
Pushing a malformed request...
Done
# execute push-request
$ yarn main-push-request
Pushing a request...
Done
```

### Update Phat Contract on Phala Mainnet
TODO

## Closing
Once you have stored, the deployed address of the Consumer Contract and set the value in the "Configure Client" section of the deployed LensAPI Oracle, you will now have a basic boilerplate example of how to connect your Polygon dApp to a LensAPI Oracle Blueprint. Execute a new requests and check if your configuration is correct like below:
![](./assets/polygonscan-ex.png)
