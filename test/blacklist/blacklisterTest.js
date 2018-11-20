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

contract('Test blacklister', function() {
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

  describe('check blacklister', function(){
    it('check ownership', async function(){
      (await this.token.owner.call()).should.equal(mock._owner);
      (await this.token.blacklister.call()).should.equal(mock._blacklister);
    });

    it('change blacklister by none owner account', async function(){
      await shouldFail.reverting(this.token.updateBlacklister(mock._other_account, {from: mock._other_account}));
    });

    it('change blacklister with owner account', async function(){
      await this.token.updateBlacklister(mock._other_account, {from: mock._owner});
      (await this.token.blacklister.call()).should.equal(mock._other_account);
    });
  })

  describe('test blacklist function', function(){
    beforeEach(async function(){
      await this.token.unBlacklist(mock._other_account, {from: mock._blacklister});
    })
    it('black an account', async function(){
      (await this.token.isBlacklisted(mock._other_account)).should.eq(false);
      await this.token.blacklist(mock._other_account, {from: mock._blacklister});
      (await this.token.isBlacklisted(mock._other_account)).should.eq(true);
    })
    it('unblack an account by none blaklister', async function(){
      (await this.token.isBlacklisted(mock._other_account)).should.eq(false);
      await shouldFail.reverting(this.token.blacklist(mock._other_account, {from: mock._other_account}));
      (await this.token.isBlacklisted(mock._other_account)).should.not.eq(true);
    })
  })
  describe('test unblack function', function(){
    beforeEach(async function(){
      await this.token.blacklist(mock._other_account, {from: mock._blacklister});
    })
    it('unblack an account', async function(){
      (await this.token.isBlacklisted(mock._other_account)).should.eq(true);
      await this.token.unBlacklist(mock._other_account, {from: mock._blacklister});
      (await this.token.isBlacklisted(mock._other_account)).should.eq(false);
    })
    it('unblack an account by none blaklister', async function(){
      (await this.token.isBlacklisted(mock._other_account)).should.eq(true);
      await shouldFail.reverting(this.token.unBlacklist(mock._other_account, {from: mock._other_account}));
      (await this.token.isBlacklisted(mock._other_account)).should.not.eq(false);
    })
  })
})
