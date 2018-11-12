var PrivateKeyProvider = require("truffle-privatekey-provider");
var privateKey = "";
var infuraAPIKey = "";
var improvider = new PrivateKeyProvider(privateKey, `https://ropsten.infura.io/${infuraAPIKey}`);

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545, // ganache-cli
      network_id: '*', // Match any network id
      from: "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d",
      gas: 6700000,
      gasPrice: 0x01
    },
    ropsten: {
      provider: improvider,
      network_id: 3,
      gas: 6000000,
      gasPrice: 40000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.4.25",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
