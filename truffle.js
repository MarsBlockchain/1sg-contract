/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
var PrivateKeyProvider = require("truffle-privatekey-provider");
var privateKey = "B0057716D5917BADAF911B193B12B910811C1497B5BADA8D7711F758981C3773";
var improvider = new PrivateKeyProvider(privateKey, "https://ropsten.infura.io/SlIQLtR9eBm263Id9uFs");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545, // ganache-cli
      network_id: '*', // Match any network id
      gas: 6700000,
      gasPrice: 0x01
    },
    ropsten: {
      provider: improvider,
      network_id: 3,
      gas: 4000000,
      gasPrice: 40000000000,
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8321,
      gas: 10000000000000,
      gasPrice: 0x01
    },
    mainnet: {
      network_id: 1,
      provider: function() {
        return new HDWalletProvider(mnemonic, networkAddress, walletChildNum)
      },
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
