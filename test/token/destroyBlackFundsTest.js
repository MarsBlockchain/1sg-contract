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
const $tenToken = mock.$tenToken;
const initFound = mock.initFound;

contract('Test destory black funds', function() {
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
    await initFound(this);
    await mock.transferToInit(this);
    await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});
  });

  describe('destory black funds test', function(){
    it('can not destory by other accout', async function(){
      await shouldFail.reverting(this.token.destroyBlackFunds(mock._other_account_1, {from: mock._other_account}));
    })

    it('can not destory the account that is not in the blacklist', async function(){
      await shouldFail.reverting(this.token.destroyBlackFunds(mock._other_account, {from: mock._owner}));
    })

    it('destory the account funds', async function(){
      let account_balance0 = await this.token.balanceOf(mock._other_account_1);
      let totalSupply0 = await this.token.totalSupply();
      await this.token.destroyBlackFunds(mock._other_account_1, {from: mock._owner});
      (await this.token.balanceOf(mock._other_account_1)).should.be.bignumber.equal($zeroToken);
      let totalSupply1 = await this.token.totalSupply();
      let destoryfunds = totalSupply0 - totalSupply1;
      destoryfunds.should.be.bignumber.equal(account_balance0);
    })

  })
})
