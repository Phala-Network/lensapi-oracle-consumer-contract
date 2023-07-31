# Polygon Consumer Contract for LensAPI Oracle

The contracts are copied and revised from <https://github.com/Phala-Network/phat-offchain-rollup/tree/main/evm> (commit: [7dc2f9bc8917f84c2a855a2df2a2373897dd1b1f](https://github.com/Phala-Network/phat-offchain-rollup/commit/7dc2f9bc8917f84c2a855a2df2a2373897dd1b1f)).

First you will need to run `cp .env.local .env` to copy over the local environment variables. The variables are defined as:
- `POLYGON_MAINNET_API` - API key for Polygon Mainnet RPC endpoint (e.g. Infura, Alchemy).
- `POLYGON_MAINNET_SK` - Secret Key for the Polygon Mainnet Account that will deploy the Polygon Smart Contract.
- `POLYGON_MAINNET_CLIENT_SC` - The Polygon Mainnet Client Smart Contract that consumes off-chain data from the LensAPI Oracle.
- `POLYGON_MUMBAI_API` - API key for Polygon Mumbai Testnet RPC endpoint (e.g. Infura, Alchemy).
- `POLYGON_MUMBAI_SK` - Secret Key for the Polygon Mumbai Testnet Account that will deploy the Polygon Smart Contract.
- `POLYGON_MUMBAI_CLIENT_SC` - The Polygon Mumbai Testnet Client Smart Contract that consumes off-chain data from the LensAPI Oracle.
- `POLYGONSCAN_API_KEY` - Polygonscan API Key that can be generated on [polygonscan](https://polygonscan.com)
- `LENSAPI_ORACLE_ENDPOINT` - LensAPI Oracle Endpoint Address that can be found in a deployed LensAPI Oracle Blueprint at [Phala Mainnet](https://bricks.phala.network) or [Phala PoC5 Testnet](https://bricks-poc5.phala.network)

Try running some of the following tasks:
### Install Dependencies & Compile Contracts
```shell
# install dependencies
yarn

# compile contracts
npx hardhat compile
```
### Deploy to Polygon Mumbai Testnet
```shell
# deploy contracts to testnet mumbai
npx hardhat run --network mumbai ./scripts/deploy-test.ts
# Deployed { receiver: '0x93891cb936B62806300aC687e12d112813b483C1' }

# Check our example deployment in <https://mumbai.polygonscan.com/address/0x93891cb936B62806300aC687e12d112813b483C1>

# Optional: verify contract
npx hardhat verify --network mumbai --constructor-args arguments.js 0x93891cb936B62806300aC687e12d112813b483C1
```
### Deploy to Polygon Mainnet
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

### Push New Request to Polygon Mainnet
```shell
npx hardhat run --network polygon ./scripts/push-request.ts
Pushing a request...
Done
```
