var FiatTokenV2 = artifacts.require("./FiatTokenV2.sol");

module.exports = function(deployer) {
  deployer.deploy(FiatTokenV2);
};
