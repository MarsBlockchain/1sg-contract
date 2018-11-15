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
const transferToInit = mock.transferToInit;
const getTokenMount = mock.getTokenMount;

contract('Test appove Token', function() {
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
    await transferToInit(this);
  });

  describe('test balanceOf initialize for test', function(){
    it('get balanceOf _masterMinter is 7', async function(){
      let checkAmount = await getTokenMount('7');
      (await this.token.balanceOf(mock._masterMinter)).toString().should.equal(checkAmount);
    });
    it('get balanceOf _other_account is 1', async function(){
      (await this.token.balanceOf(mock._other_account)).toString().should.equal($oneToken);
    });
    it('get balanceOf _other_account_1 is 2', async function(){
      let checkAmount = await getTokenMount('2');
      (await this.token.balanceOf(mock._other_account_1)).toString().should.equal(checkAmount);
    });
    it('get balanceOf _other_account_2 is zero', async function(){
      (await this.token.balanceOf(mock._other_account_2)).toString().should.equal($zeroToken);
    });
  })

  describe('approve', function() {
    it('spender can not be 0x0', async function() {
      await shouldFail.reverting(this.token.approve(mock.ZERO_ADDRESS, $oneToken, {from: mock._masterMinter}));
    });
    it('appove one token for _other_account_2', async function(){
      await this.token.approve(mock._other_account_2, $oneToken, {from: mock._masterMinter});
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.eq($oneToken);
    });
    it('set appove token form 1 to 10, 10 to 0 in _other_account_2', async function(){
      await this.token.approve(mock._other_account_2, $oneToken, {from: mock._masterMinter});
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.eq($oneToken);
      await this.token.approve(mock._other_account_2, $tenToken, {from: mock._masterMinter});
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.eq($tenToken);
      await this.token.approve(mock._other_account_2, $zeroToken, {from: mock._masterMinter});
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.eq($zeroToken);
    });
  })

  describe('transferFrom', function() {
    beforeEach(async function () {
      let twoToken = await getTokenMount('2');
      await this.token.approve(mock._other_account_1, twoToken, {from: mock._masterMinter});
      await this.token.approve(mock._other_account_2, $oneToken, {from: mock._masterMinter});
      await this.token.approve(mock._other_account, $hugeToken, {from: mock._masterMinter});
    });

    it('when transferFrom _from is zero account', async function() {
      await shouldFail.reverting(this.token.transferFrom(mock.ZERO_ADDRESS, mock._other_account, $oneToken));
    });

    it('when transferFrom _to is zero account', async function() {
      await shouldFail.reverting(this.token.transferFrom(mock.ZERO_ADDRESS, mock._other_account, $oneToken));
    });

    it('when transferFrom one token for _other_account_3 and sender did not hold any token', async function() {
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.equal($oneToken);
      await this.token.transferFrom(mock._masterMinter, mock._other_account_3, $oneToken, {from: mock._other_account_2});
      (await this.token.balanceOf(mock._other_account_3)).toString().should.equal($oneToken);
      (await this.token.allowance(mock._masterMinter, mock._other_account_2)).toString().should.equal($zeroToken);
      // test not enough allowance
      await shouldFail.reverting(this.token.transferFrom(mock._masterMinter, mock._other_account_3, $oneToken, {from: mock._other_account_2}));
    });
    it('when transferFrom one token for _other_account_3 and sender had hold some token', async function() {
      let checkAmount = await getTokenMount('2');
      (await this.token.allowance(mock._masterMinter, mock._other_account_1)).toString().should.equal(checkAmount);
      await this.token.transferFrom(mock._masterMinter, mock._other_account_3, $oneToken, {from: mock._other_account_1});
      (await this.token.balanceOf(mock._other_account_3)).toString().should.equal($oneToken);
      // check balance after transferFrom
      (await this.token.balanceOf(mock._other_account_1)).toString().should.equal(checkAmount);
      (await this.token.allowance(mock._masterMinter, mock._other_account_1)).toString().should.equal($oneToken);
      // test not enough allowance
      await shouldFail.reverting(this.token.transferFrom(mock._masterMinter, mock._other_account_3, $tenToken, {from: mock._other_account_1}));
    });
    it('when sendFrom owner did not have enough token and spender try to send fund', async function(){
      (await this.token.allowance(mock._masterMinter, mock._other_account)).toString().should.equal(mock.$hugeToken);
      await shouldFail.reverting(this.token.transferFrom(mock._masterMinter, mock._other_account_3, $hugeToken, {from: mock._other_account}));
    });
  })

})
