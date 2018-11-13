var FiatTokenV1 = artifacts.require("FiatTokenV1.sol");
var FiatTokenProxy = artifacts.require("FiatTokenProxy.sol");
var BalanceSheet = artifacts.require("sheets/BalanceSheet.sol");

// Any address will do, preferably one we generated
var throwawayAddress = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

module.exports = function(deployer, network, accounts) {
var admin = masterMinter = pauser = blacklister = owner = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

console.log("deploying impl")

var fiatTokenImpl;
var tokenProxy;
var balanceSheetAddr, allowanceSheetAddr;
// deploy implementation contract
deployer.deploy(FiatTokenV1)
  .then(function(impl) {
    fiatTokenImpl = impl;
    console.log("initializing main contract")
    return impl.initialize(
      "SGDT",
      "SGDT",
      "SGDT",
      18,
      masterMinter,
      pauser,
      blacklister,
      owner
    );
  })
  .then(async function(){
    balanceSheetAddr = await deployer.deploy(BalanceSheet);
    return balanceSheetAddr
  })
  .then(async function(){
    await balanceSheetAddr.setLogicContractAddress(fiatTokenImpl.address);
  })
  .then(async function(){
    console.log("** [information] allowanceSheetAddr.address:", balanceSheetAddr.address, " **");
    await fiatTokenImpl.setBalanceSheet(balanceSheetAddr.address);
    return fiatTokenImpl;
  })
  .then(async function(initDone){
    console.log("deploying proxy");
    proxy = await deployer.deploy(FiatTokenProxy, fiatTokenImpl.address);
    return proxy;
  })
  .then(function(proxy){
    tokenProxy = proxy;
    console.log("reassigning proxy admin to ->", admin);
    return proxy.changeAdmin(admin);
  })
};
