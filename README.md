# centre-tokens
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
