var MarsTokenV1 = artifacts.require("MarsTokenV1.sol");
var MarsTokenProxy = artifacts.require("MarsTokenProxy.sol");
var BalanceSheet = artifacts.require("../build/combinContract/BalanceSheet.sol");

// Any address will do, preferably one we generated
var throwawayAddress = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

module.exports = function(deployer, network, accounts) {
  var admin = masterMinter = pauser = blacklister = owner = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

  console.log("deploying impl")

  var fiatTokenImpl;
  var tokenProxy;
  var balanceSheetAddr, allowanceSheetAddr;
  console.log("depoly test");
  deployer.deploy(BalanceSheet).then((res) => {
    console.log("BalanceSheet: ", res.address);
  })

}
