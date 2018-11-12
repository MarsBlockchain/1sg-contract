# UGDT tokens
Fiat tokens on the [CENTRE](https://centre.io) network.

# Setup
Tests need node v8.0.0 or higher, as they depend on async/await functionality. Interacting with eth is very async-y so await makes it much easier to write tests.
Depends on truffle and testrpc for testing.

install truffle:
```npm install -g truffle```

install ganache-cli:
```npm install -g ganache-cli```

install project npm dependencies:
```npm install```

# Testing
All tests are run with:
```npm run truffle-test```

or run a specific file of tests with:
```npm run truffle-test -- [file]```

to generate test coverage on all tests run:
```npm test```


# Contracts
The implementation uses 2 separate contracts - a proxy contract (`FiatTokenProxy.sol`)and an implementation contract(`FiatToken.sol`).
This allows upgrading the contract, as a new implementation contact can be deployed and the Proxy updated to point to it.
## FiatToken
The FiatToken offers a number of capabilities, which briefly are described below. There are more
[detailed design docs](./doc/tokendesign.md) in the `doc` folder.

### ERC20 compatible
The FiatToken implements the ERC20 interface.

### Pausable
The entire contract can be frozen, in case a serious bug is found or there is a serious key compromise. No transfers can take place while the contract is paused.
Access to the pause functionality is controlled by the `pauser` address.

### Upgradable
A new implementation contract can be deployed, and the proxy contract will forward calls to the new contract.
Access to the upgrade functionality is guarded by a `proxyOwner` address. Only the `proxyOwner` address can change the `proxyOwner` address.

### Blacklist
The contract can blacklist certain addresses which will prevent those addresses from transferring or receiving tokens.
Access to the blacklist functionality is controlled by the `blacklister` address.

### Minting/Burning
Tokens can be minted or burned on demand. The contract supports having multiple minters simultaneously. There is a
`masterMinter` address which controls the list of minters and how much each is allowed to mint. The mint allowance is
similar to the ERC20 allowance - as each minter mints new tokens their allowance decreases. When it gets too low they will
need the allowance increased again by the `masterMinter`.

### Ownable
The contract has an Owner, who can change the `owner`, `pauser`, `blacklister`, or `masterMinter` addresses. The `owner` can not change
the `proxyOwner` address.


### Ropsten testing

```
Using network 'ropsten'.

Running migration: 4_deploy_usdc.js
deploying impl
  Deploying FiatTokenV1...
  ... 0x0a308b9a160822a549ba5150cb010d91a83094e1067e868feff84eb9ab71081f
  FiatTokenV1: 0x6fe6ffcd4dde9db11f887bd3320424ccab50ee3f
initializing impl with dummy values
  ... 0x4b131db180543b29b1c311c5f8b28ea960826aacaf7f3caf17bfcd8d458d18e6
deploying proxy
  Deploying FiatTokenProxy...
  ... 0xba2f62bbad33df7b317fecd165ebe2227942ea89f2b6fafced4e78fb685ce311
  FiatTokenProxy: 0x791c3f20f865c582a204134e0a64030fc22d2e38
reassigning proxy admin
  ... 0x97ca99b4d5d360d40b40e55b21478c1e11c5889617cb9f4e36d8e8ecf591c92c
Saving artifacts...
```
```
Using network 'ropsten'.

Running migration: 6_deploy_sgdt_prod.js
deploying impl
  Deploying FiatTokenV2...
  ... 0xdb5d5d3e8b3c32c0ed55551aa2bbc81017f6e62177e5582ca9f547ce9ff62be5
  FiatTokenV2: 0x25f96b23947f3e57b29d15760fd8af926694fa81
initializing impl with dummy values
  ... 0x564273232be841d59feecd3fdb3c3cebbb1316f9b50b8b6b66fc0e22b417d4a6
  Deploying BalanceSheet...
  ... 0x604d4da4c19f1e3770fad47a60e3ae2c659c9af564c8b8750582d8fc284e6008
  BalanceSheet: 0xeeb3a6143b71b9ebc867479f2cf57db0be4604c2
  Deploying AllowanceSheet...
  ... 0x3b810c36ea70d4fb5ce836e6e74135de4958834f34d45a0d5900bfaf4458e5dd
  AllowanceSheet: 0x321dd22870b5df733a30498763a2a43feda8a5f4
deploying proxy
  Replacing FiatTokenProxy...
  ... 0xe03fcb4ee8363b41f0e9455b30f3f609e7c5a846c21d521a2dba0070301483d1
  ... 0xb050f068e425e5e3efb903dc63ff12647003dcdf85b0c4c098b8e7eb3e0bc1ce
  ... 0xa0f2b37f0c7732ccef3db1157434a3006defcce469f16dd7ff2faf7c425f2d8e
  ... 0x149e4e063f2531f86fbe59706f974ffa3ebd75ec7b875c33b0367af0f4dbb48a
  ... 0x2c8815d5814bc56f9ffea3e8d75423dc894490ad0d5d87a3be46ea7d6ecfd29d
  FiatTokenProxy: 0x9000d9c358dc56200000b0e3710e1a9e8985e058
reassigning proxy admin
  ... 0xdac607748b229ae8db258ff4f9ef46c2ec7ad54be7766dbd757ce1c04c242d5d
Saving artifacts...
```