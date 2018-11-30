const shouldFail = require('../../utils/test/helpers/shouldFail');
const BigNumber = require('bignumber.js');
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const MarsTokenV1 = artifacts.require('MarsTokenV1');
const BalanceSheet = artifacts.require('sheets/BalanceSheet');
const mock = require('../mock/variable');
const $zeroToken = mock.$zeroToken;
const $oneToken = mock.$oneToken;
const $twoToken = mock.getTokenMount('2');
const $seventToken = mock.getTokenMount('7');
const $tenToken = mock.$tenToken;


contract('Test ownable Token', function() {
  beforeEach(async function () {
    this.token = await MarsTokenV1.new(
      mock._name,
      mock._symbol,
      mock._currency,
      mock._decimals,
      mock._masterMinter,
      mock._pauser,
      mock._blacklister,
    );
    this.balanceSheet = await BalanceSheet.new();
    await this.token.setBalanceSheet(this.balanceSheet.address);
    await this.balanceSheet.setLogicContractAddress(this.token.address);
    await mock.initFound(this);
    await mock.transferToInit(this);
  });

  describe('test pause token', function(){
    it('set pause token with none pauser account', async function(){
      await shouldFail.reverting(this.token.pause({from: mock._other_account_1}));
      let pauseSatus = await this.token.paused.call();
      pauseSatus.should.equal(false);
    })

    it('set pause token with pauser account', async function(){
      await this.token.pause({from: mock._pauser});
      let pauseSatus = await this.token.paused.call();
      pauseSatus.should.equal(true);
    })
  })

  describe('transfer pauser to other account', function(){
    it('update pauser with none owner account', async function(){
      await shouldFail.reverting(this.token.updatePauser(mock._other_account_2 ,{from: mock._other_account_1}));
      let currentPauser = await this.token.pauser.call();
      currentPauser.should.equal(mock._pauser);
    })
    it('update pauser with owner account', async function(){
      await this.token.updatePauser(mock._other_account_2 ,{from: mock._owner});
      let currentPauser = await this.token.pauser.call();
      currentPauser.should.equal(mock._other_account_2);
    })
  })

  describe('test paused situation.', function(){
    beforeEach(async function () {
      let pauseSatus = await this.token.paused.call();
      pauseSatus.should.equal(false);
      await this.token.configureMinter(mock._other_account_1, $tenToken, {from: mock._masterMinter});
      await this.token.approve(mock._other_account_3, $oneToken, {from: mock._other_account_1});
      await this.token.pause({from: mock._pauser});
      pauseSatus = await this.token.paused.call();
      pauseSatus.should.equal(true);
    })

    it('configureMinter will failed when paused', async function(){
      await shouldFail.reverting(this.token.configureMinter(mock._masterMinter, $tenToken, {from: mock._masterMinter}));
    })

    it('mint will failed when paused', async function(){
      await shouldFail.reverting(this.token.mint(mock._other_account_1, $oneToken, {from: mock._other_account_1}));
      let minterAllowed = await this.token.minterAllowance(mock._other_account_1);
      minterAllowed.should.be.bignumber.equal($tenToken);
    })

    it('transfer will failed when paused', async function(){
      await shouldFail.reverting(this.token.approve(mock._other_account_5, $oneToken, {from: mock._other_account}));
      let currentBalance = await this.token.balanceOf(mock._other_account);
      currentBalance.should.be.bignumber.equal($oneToken);
    })

    it('appove will failed when paused', async function(){
      await shouldFail.reverting(this.token.approve(mock._other_account_2, $oneToken, {from: mock._other_account_1}));
      let currentAllowance = await this.token.allowance(mock._other_account_1, mock._other_account_2);
      currentAllowance.should.be.bignumber.equal($zeroToken);
    })

    it('transferFrom will failed when paused', async function(){
      await shouldFail.reverting(this.token.transferFrom(mock._masterMinter, mock._other_account, $oneToken, {from: mock._other_account_3}));
      let currentAllowance = await this.token.allowance(mock._other_account_1, mock._other_account_3);
      currentAllowance.should.be.bignumber.equal($oneToken);
    })

    it('burn token will failed when paused', async function(){
      await shouldFail.reverting(this.token.burn($oneToken, {from: mock._masterMinter}));
      let amount = await this.token.balanceOf(mock._masterMinter);
      amount.should.be.bignumber.equal($seventToken);
    })
  })
})
