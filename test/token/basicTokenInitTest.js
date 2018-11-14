const shouldFail = require('../../utils/test/helpers/shouldFail');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const MarsTokenV1 = artifacts.require('MarsTokenV1');
const BalanceSheet = artifacts.require('sheets/BalanceSheet');
const mock = require('../mock/variable');

contract('Test Token Basic Initialization', function() {
  beforeEach(async function () {
    this.token = await MarsTokenV1.new(
      mock._name,
      mock._symbol,
      mock._currency,
      mock._decimals,
      mock._masterMinter,
      mock._pauser,
      mock._blacklister
    );
    this.balanceSheet = await BalanceSheet.new();
    await this.token.setBalanceSheet(this.balanceSheet.address);
    await this.balanceSheet.setLogicContractAddress(this.token.address);
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

       let balanceSheetOwn = await this.balanceSheet.owner.call();
       balanceSheetOwn.should.equal(mock._owner);
       let balanceSheetAddr = await this.token.balances.call();
       balanceSheetAddr.should.equal(this.balanceSheet.address);
       (await this.balanceSheet.isDelegate.call('0x0')).should.equal(false);
       (await this.balanceSheet.isDelegate.call(this.token.address)).should.equal(true);
    });
    it('check totall supply should be 0', async function () {
      let _supply = await this.token.totalSupply.call();
      _supply.toNumber().should.equal(0);
    });
  });
})
