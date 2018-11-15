const shouldFail = require('../../utils/test/helpers/shouldFail');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const FiatTokenV1 = artifacts.require('FiatTokenV1');
const BalanceSheet = artifacts.require('sheets/BalanceSheet');
const mock = require('../mock/variable');
const $zeroToken = mock.$zeroToken;
const $oneToken = mock.$oneToken;
const $tenToken = mock.$tenToken;
const $hugeToken = mock.$hugeToken;

const initFound = mock.initFound;
contract('Test transfer Token', function() {
  beforeEach(async function (){
    this.token = await FiatTokenV1.new(
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
    await initFound(this);
  });

  describe('balanceOf', function(){
    it('get balanceOf', async function(){
      (await this.token.balanceOf(mock._masterMinter)).toString().should.equal($tenToken);
    })
    it('get balanceOf is zero', async function(){
      (await this.token.balanceOf(mock._other_account)).toString().should.equal($zeroToken);
    })
    it('get balanceOf, after got token.', async function(){
      await this.token.transfer(mock._other_account, $oneToken, {from: mock._masterMinter});
      (await this.token.balanceOf(mock._other_account)).toString().should.equal($oneToken);
    })
  })

  describe('transfer', function() {
    it('check receiver can not be 0x0', async function(){
      await shouldFail.reverting(this.token.transfer(mock.ZERO_ADDRESS, $oneToken, {from: mock._masterMinter}));
    })
    it('check receiver amount is much than the hold', async function(){
      await shouldFail.reverting(this.token.transfer(mock._other_account, $hugeToken, {from: mock._masterMinter}));
    })
    it('receive token succeeded', async function(){
      await this.token.transfer(mock._other_account, $oneToken, {from: mock._masterMinter});
    })
  })

})
