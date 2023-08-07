# Polygon Consumer Contract for LensAPI Oracle
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [For Polygon Mainnet Deployment](#for-polygon-mainnet-deployment)
  - [For Polygon Mumbai Testnet Deployment](#for-polygon-mumbai-testnet-deployment)
- [Deployment](#deployment)
  - [Deploy to Polygon Mumbai Testnet](#deploy-to-polygon-mumbai-testnet)
  - [Deploy to Polygon Mainnet](#deploy-to-polygon-mainnet)
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
  - [Alchemy](https://alchemy.com)
  - [Infura](https://infura.io)
  - Personal RPC Node

## Getting Started
First you will need to run `cp .env.local .env` to copy over the local environment variables. 
### For Polygon Mainnet Deployment:
- `POLYGON_MAINNET_API` - API key for Polygon Mainnet RPC endpoint (e.g. Infura, Alchemy).
- `POLYGON_MAINNET_SK` - Secret Key for the Polygon Mainnet Account that will deploy the Polygon Smart Contract.
- `POLYGON_MAINNET_CONSUMER_SC` - The Polygon Mainnet Client Smart Contract that consumes off-chain data from the LensAPI Oracle.
- `POLYGONSCAN_API_KEY` - Polygonscan API Key that can be generated on [polygonscan](https://polygonscan.com)
- `LENSAPI_ORACLE_ENDPOINT` - LensAPI Oracle Endpoint Address that can be found in the dashboard of the deployed LensAPI Oracle Blueprint at [Phala Mainnet](https://bricks.phala.network)
### For Polygon Mumbai Testnet Deployment:
- `POLYGON_MUMBAI_API` - API key for Polygon Mumbai Testnet RPC endpoint (e.g. Infura, Alchemy).
- `POLYGON_MUMBAI_SK` - Secret Key for the Polygon Mumbai Testnet Account that will deploy the Polygon Smart Contract.
- `POLYGON_MUMBAI_CONSUMER_SC` - The Polygon Mumbai Testnet Client Smart Contract that consumes off-chain data from the LensAPI Oracle.
- `LENSAPI_ORACLE_ENDPOINT` - LensAPI Oracle Endpoint Address that can be found in the dashboard of the deployed LensAPI Oracle Blueprint at [Phala PoC5 Testnet](https://bricks-poc5.phala.network)

## Deployment
Now that you have the prerequisites to deploy a Polygon Consumer Contract on Polygon, lets begin with some initials tasks.
### Install Dependencies & Compile Contracts
```shell
# install dependencies
yarn

# compile contracts
npx hardhat compile
```
### Deploy to Polygon Mumbai Testnet
With the contracts successfully compiled, now we can begin deploying first to Polygon Mumbai Testnet. If you have not gotten `MATIC` for Mumbai Testnet then get `MATIC` from a [faucet](https://mumbaifaucet.com/).
Ensure to save the address after deploying the Consumer Contract because this address will be use in the "[Configure Client](https://docs.phala.network/developers/bricks-and-blueprints/featured-blueprints/lensapi-oracle#step-4-configure-the-client-address)" section of Phat Bricks UI. The deployed address will also be set to the environment variable `POLYGON_MUMBAI_CONSUMER_SC`.
```shell
# deploy contracts to testnet mumbai
npx hardhat run --network mumbai ./scripts/deploy-test.ts
# Deployed { receiver: '0x93891cb936B62806300aC687e12d112813b483C1' }

# Check our example deployment in <https://mumbai.polygonscan.com/address/0x93891cb936B62806300aC687e12d112813b483C1>

# Optional: verify contract
npx hardhat verify --network mumbai --constructor-args arguments.js 0x93891cb936B62806300aC687e12d112813b483C1
```

Test Consumer Contract on Mumbai with a few tests to check for malformed requests failures, successful requests, and set the attestor.
```shell
# set the attestor to the Oracle Endpoint in Phat Bricks UI
npx hardhat run --network mumbai ./scripts/set-attestor.ts
Setting attestor...
Done
# execute push-malformed-request
npx hardhat run --network mumbai ./scripts/push-malformed-request.ts
Pushing a malformed request...
Done
# execute push-request
npx hardhat run --network mumbai ./scripts/push-request.ts
Pushing a request...
Done
```

### Deploy to Polygon Mainnet
Ensure to save the address after deploying the Consumer Contract because this address will be use in the "[Configure Client](https://docs.phala.network/developers/bricks-and-blueprints/featured-blueprints/lensapi-oracle#step-4-configure-the-client-address)" section of Phat Bricks UI. The deployed address will also be set to the environment variable `POLYGON_MAINNET_CONSUMER_SC`.
```shell
# deploy contracts to polygon mainnet
npx hardhat run --network polygon ./scripts/deploy-test.ts
Deploying...
Deployed { oracle: '0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4' }
Configuring...
Done

# Check our example deployment in <https://polygonscan.com/address/0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4>

# Optional: verify contract
npx hardhat verify --network polygon --constructor-args arguments.js 0xbb0d733BDBe151dae3cEf8D7D63cBF74cCbf04C4
```

Execute Scripts to Consumer Contract on Polygon Mainnet. The Consumer Contract on Polygon Mainnet with a few actions to mimic a malformed request, successful requests, and set the attestor.
```shell
# set the attestor to the Oracle Endpoint in Phat Bricks UI
npx hardhat run --network polygon ./scripts/set-attestor.ts
Setting attestor...
Done
# execute push-malformed-request
npx hardhat run --network polygon ./scripts/push-malformed-request.ts
Pushing a malformed request...
Done
# execute push-request
npx hardhat run --network polygon ./scripts/push-request.ts
Pushing a request...
Done
```

## Closing
Once you have stored, the deployed address of the Consumer Contract and set the value in the "Configure Client" section of the deployed LensAPI Oracle, you will now have a basic boilerplate example of how to connect your Polygon dApp to a LensAPI Oracle Blueprint. Execute a new requests and check if your configuration is correct like below:
![](./assets/polygonscan-ex.png)
