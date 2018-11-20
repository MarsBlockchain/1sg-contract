const shouldFail = require('../../utils/test/helpers/shouldFail');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const MarsTokenV1 = artifacts.require('MarsTokenV1');
const BalanceSheet = artifacts.require('sheets/BalanceSheet');
const mock = require('../mock/variable');
const $zeroToken = mock.$zeroToken;
const $oneToken = mock.$oneToken;
const $twoToken = mock.getTokenMount('2');
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
  });

  describe('main contract owner change test', function(){
    it('check owner user', async function(){
      let owner = await this.token.owner.call();
      owner.should.equal(mock._owner);
    })

    it('change owner with none owner account', async function(){
      await shouldFail.reverting(this.token.transferOwnership(mock._other_account_2, {from: mock._other_account_1}));
    })

    it('change owner with owner account', async function(){
      await this.token.transferOwnership(mock._other_account_1, {from: mock._owner});
      let owner = await this.token.owner.call();
      owner.should.equal(mock._other_account_1);
    })
  })

  describe('test set balanceSheet on main contract', function(){
    beforeEach(async function () {
      this.NewbalanceSheet = await BalanceSheet.new();
    })
    it('change new balanceSheet with none owner account', async function(){
      await shouldFail.reverting(this.token.setBalanceSheet(this.NewbalanceSheet.address, {from: mock._other_account_2}));
      let currentSheet = await this.token.balances.call();
      currentSheet.should.equal(this.balanceSheet.address);
    })
    it('change new balanceSheet with owner account', async function(){
      await this.token.setBalanceSheet(this.NewbalanceSheet.address, {from: mock._owner});
      let currentSheet = await this.token.balances.call();
      currentSheet.should.equal(this.NewbalanceSheet.address);
    })
  })

  describe('balance contract owner change test', function(){
    it('check owner user', async function(){
      let owner = await this.balanceSheet.owner.call();
      owner.should.equal(mock._owner);
    })

    it('change owner with none owner account', async function(){
      await shouldFail.reverting(this.balanceSheet.transferOwnership(mock._other_account_2, {from: mock._other_account_1}));
    })

    it('change owner with owner account', async function(){
      await this.balanceSheet.transferOwnership(mock._other_account_1, {from: mock._owner});
      let owner = await this.balanceSheet.owner.call();
      owner.should.equal(mock._other_account_1);
    })
  })
})
