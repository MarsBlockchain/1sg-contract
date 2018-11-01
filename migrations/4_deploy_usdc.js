var FiatTokenV1 = artifacts.require("./FiatTokenV1.sol");
var FiatTokenProxy = artifacts.require("./FiatTokenProxy.sol");

// Any address will do, preferably one we generated
// var throwawayAddress = "0x855FA758c77D68a04990E992aA4dcdeF899F654A";
// var throwawayAddress = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
var throwawayAddress = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

module.exports = function(deployer, network, accounts) {
    var admin = masterMinter = pauser = blacklister = owner = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d";

    console.log("deploying impl")

    var fiatTokenImpl;
    var tokenProxy;
    // deploy implementation contract
    deployer.deploy(FiatTokenV1)
        .then(function(impl) {
            fiatTokenImpl = impl;
            console.log("initializing impl with dummy values")
            return impl.initialize(
                "SGD0",
                "S0",
                "S0",
                18,
                throwawayAddress,
                throwawayAddress,
                throwawayAddress,
                throwawayAddress
            );
        })
        .then(function(initDone){
            console.log("deploying proxy");
            return deployer.deploy(FiatTokenProxy, fiatTokenImpl.address);
        })
        .then(function(proxy){
            tokenProxy = proxy;
            console.log("reassigning proxy admin");
            // need to change admin first, or the call to initialize won't work
            // since admin can only call methods in the proxy, and not forwarded methods
            return proxy.changeAdmin(admin);
        })
};
