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
const $tenToken = mock.$tenToken;

contract('Test mint Token', function() {
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
  });


  describe('mint test', function(){
    it('set allowance to a minter with other account, will failed', async function(){
      shouldFail.reverting(this.token.configureMinter(mock._other_account, $oneToken, {from: mock._other_account}));
      let mallownace = await this.token.minterAllowance.call(mock._other_account);
      mallownace.should.be.bignumber.equal($zeroToken);
    })
    it('set allowance to a minter with masterMinter permission', async function(){
      await this.token.configureMinter(mock._masterMinter, $oneToken, {from: mock._masterMinter});
      let mallownace = await this.token.minterAllowance.call(mock._masterMinter);
      mallownace.should.be.bignumber.equal($oneToken);
    })
    it('mint token when this account not a minter, will failed', async function(){
      await shouldFail.reverting(this.token.mint(mock._other_account, $oneToken, {from: mock._other_account}));
    })
    it('mint token when this account is a minter but mint allowance not enough, will failed', async function(){
      await this.token.configureMinter(mock._masterMinter, $oneToken, {from: mock._masterMinter});
      await shouldFail.reverting(this.token.mint(mock._masterMinter, $tenToken, {from: mock._masterMinter}));
    })
    it('mint token when this account is a minter and succeeded', async function(){
      await this.token.configureMinter(mock._masterMinter, $oneToken, {from: mock._masterMinter});
      await this.token.mint(mock._masterMinter, $oneToken, {from: mock._masterMinter});
      (await this.token.balanceOf(mock._masterMinter)).should.be.bignumber.equal($oneToken);
    })
  });

  describe('remove minter test', function(){
    beforeEach(async function () {
      await this.token.configureMinter(mock._other_account_1, $oneToken, {from: mock._masterMinter});
    })
    it('removeMinter test with none masterMinter account', async function(){
      (await this.token.isMinter(mock._other_account_1)).should.be.equal(true);
      await shouldFail.reverting(this.token.removeMinter(mock._other_account_1, {from: mock._other_account}));
      (await this.token.isMinter(mock._other_account_1)).should.be.equal(true);
    })
    it('removeMinter test with masterMinter account', async function(){
      (await this.token.isMinter(mock._other_account_1)).should.be.equal(true);
      await this.token.removeMinter(mock._other_account_1, {from: mock._masterMinter});
      (await this.token.isMinter(mock._other_account_1)).should.be.equal(false);
    })
  })
})
