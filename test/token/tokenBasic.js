const shouldFail = require('../helpers/shouldFail');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const FiatTokenV1 = artifacts.require('FiatTokenV1');
const mock = require('../mock/variable');

contract('TestBL', function() {
  beforeEach(async function () {
    this.token = await FiatTokenV1.new(
    // this.token.initialize(
      mock._name,
      mock._symbol,
      mock._currency,
      mock._decimals,
      mock._masterMinter,
      mock._pauser,
      mock._blacklister
    );
  });
  describe('initialization test', function() {
    it('check initialization variables', async function() {
       let name = await this.token.name.call();
       let symbol = await this.token.symbol.call();
       let decimals = await this.token.decimals.call();
       let masterMinter = await this.token.masterMinter.call();
       let pauser = await this.token.pauser.call();
       let blacklister = await this.token.blacklister.call();
       let owner = await this.token.owner.call();

       name.should.equal(mock._name);
       symbol.should.equal(mock._name);
       decimals.toNumber().should.equal(mock._decimals);
       masterMinter.should.equal(mock._masterMinter);
       pauser.should.equal(mock._pauser);
       blacklister.should.equal(mock._blacklister);
       owner.should.equal(mock._owner);
    });
    it('check totall supply should be 0', async function () {
      let _supply = await this.token.totalSupply.call();
      _supply.toNumber().should.equal(0);
    });
  })
})
