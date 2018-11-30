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
const $hugeToken = mock.$hugeToken;

const initFound = mock.initFound;
const transferToInit0 = async (self) => {
  // give other_account one token
  await self.token.transfer(mock._other_account, $twoToken, {from: mock._masterMinter});
  // give other_accounts two token
  await self.token.transfer(mock._other_account_3, $twoToken, {from: mock._masterMinter});
  await self.token.transfer(mock._other_account_4, $twoToken, {from: mock._masterMinter});
  await self.token.transfer(mock._other_account_5, $twoToken, {from: mock._masterMinter});
}
contract('Test functions during blocked', function() {
  beforeEach(async function (){
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
    await initFound(this);
    await transferToInit0(this);
    await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});


    // set two account into blacklist.
    await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});
    await this.token.blacklist(mock._other_account_2, {from: mock._blacklister});
    // give $tenToken mint allwance to other accounts.
    await this.token.configureMinter(mock._other_account, $tenToken, {from: mock._masterMinter});
    // await this.token.configureMinter(mock._other_account_1, $tenToken, {from: mock._masterMinter});
    // await this.token.configureMinter(mock._other_account_2, $tenToken, {from: mock._masterMinter});
  });

  describe('test token basic functions with blacked accounts', function(){
    it('test mint when receiver listed on blacklist', async function(){
      await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});
      let testResult = await this.token.isBlacklisted(mock._other_account_1);
      testResult.should.eq(true);
      await shouldFail.reverting(this.token.mint(mock._other_account_1, $oneToken, {from: mock._other_account}));
    });

    it('test mint when sender listed on blacklist', async function(){
      await this.token.unBlacklist(mock._other_account_2, {from: mock._blacklister});
      await this.token.configureMinter(mock._other_account_2, $tenToken, {from: mock._masterMinter});
      await this.token.blacklist(mock._other_account_2, {from: mock._blacklister});
      (await this.token.isBlacklisted(mock._other_account_2)).should.eq(true);
      await shouldFail.reverting(this.token.mint(mock._other_account_3, $oneToken, {from: mock._other_account_2}));
    });

    it('test mint when sender & receiver both listed on blacklist', async function(){
      await this.token.unBlacklist(mock._other_account_1, {from: mock._blacklister});
      await this.token.unBlacklist(mock._other_account_2, {from: mock._blacklister});
      await this.token.configureMinter(mock._other_account_1, $tenToken, {from: mock._masterMinter});
      await this.token.configureMinter(mock._other_account_2, $tenToken, {from: mock._masterMinter});
      await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});
      await this.token.blacklist(mock._other_account_2, {from: mock._blacklister});
      (await this.token.isBlacklisted(mock._other_account_1)).should.eq(true);
      (await this.token.isBlacklisted(mock._other_account_2)).should.eq(true);
      await shouldFail.reverting(this.token.mint(mock._other_account_2, $oneToken, {from: mock._other_account_1}));
    });

    it('test transfer token when receiver on blacklist', async function(){
      (await this.token.isBlacklisted(mock._other_account_2)).should.eq(true);
      await shouldFail.reverting(this.token.transfer(mock._other_account_2, $oneToken, {from: mock._other_account}));
    });

    it('test transfer token when msg.sender on blacklist', async function(){
      (await this.token.isBlacklisted(mock._other_account_1)).should.eq(true);
      await shouldFail.reverting(this.token.transfer(mock._other_account_3, $oneToken, {from: mock._other_account_1}));
    });

    it('test transfer token when msg.sender & recevier both on blacklist', async function(){
      (await this.token.isBlacklisted(mock._other_account_1)).should.eq(true);
      (await this.token.isBlacklisted(mock._other_account_2)).should.eq(true);
      await shouldFail.reverting(this.token.transfer(mock._other_account_2, $oneToken, {from: mock._other_account_1}));
    });

    it('test configureMinter when target listed on blacklist', async function(){
      await this.token.blacklist(mock._other_account_1, {from: mock._blacklister});
      (await this.token.isBlacklisted(mock._other_account_1)).should.eq(true);
      await shouldFail.reverting(this.token.configureMinter(mock._other_account_1, $tenToken, {from: mock._masterMinter}));
    });
  })

  describe('test approve', function(){
    it('test approve fund when receiver on blacklist', async function(){
      await shouldFail.reverting(this.token.approve(mock._other_account_2, $oneToken, {from: mock._other_account}));
    });
    it('test approve fund when msg.sender on blacklist', async function(){
      await shouldFail.reverting(this.token.approve(mock._other_account, $oneToken, {from: mock._other_account_1}));
    });
    it('test approve fund when msg.sender & receiver both on blacklist', async function(){
      await shouldFail.reverting(this.token.approve(mock._other_account_2, $oneToken, {from: mock._other_account_1}));
    });
  })

  // test transferFrom
  describe('test transferFrom', function(){
    beforeEach(async function (){
      await this.token.approve(mock._other_account_3, $twoToken, {from: mock._other_account});
      await this.token.approve(mock._other_account_4, $twoToken, {from: mock._other_account_3});
      await this.token.approve(mock._other_account_3, $twoToken, {from: mock._other_account_5});

      // set two account into blacklist.
      await this.token.blacklist(mock._other_account_4, {from: mock._blacklister});
      await this.token.blacklist(mock._other_account_5, {from: mock._blacklister});
    })

    it('test transferFrom, when msg.sender on blacklist', async function(){
      (await this.token.allowance(mock._other_account_3, mock._other_account_4)).toString().should.equal($twoToken);
      // sender: _other_account_4 , transferFrom(_other_account_3, _other_account)
      // o, o, x
      await shouldFail.reverting(this.token.transferFrom(mock._other_account_3, mock._other_account, $oneToken, {from: mock._other_account_4}));
    })

    it('test transferFrom, when msg.sender on blacklist', async function(){
      (await this.token.allowance(mock._other_account_5, mock._other_account_3)).toString().should.equal($twoToken);
      // sender: _other_account_3 , transferFrom(_other_account_5, _other_account)
      // x, o, o
      await shouldFail.reverting(this.token.transferFrom(mock._other_account_5, mock._other_account, $oneToken, {from: mock._other_account_3}));
    })

    it('test transferFrom, when msg.sender on blacklist', async function(){
      (await this.token.allowance(mock._other_account, mock._other_account_3)).toString().should.equal($twoToken);
      // sender: _other_account_3 , transferFrom(_other_account, _other_account_4)
      // o, x, o
      await shouldFail.reverting(this.token.transferFrom(mock._other_account, mock._other_account_4, $oneToken, {from: mock._other_account_3}));
    })
  })
  // test burn
  describe('test burn', function(){
    beforeEach(async function (){
      // make other_account_1 as minter
      await this.token.unBlacklist(mock._other_account_1, {from: mock._blacklister});
      await this.token.configureMinter(mock._other_account_1, $twoToken, {from: mock._masterMinter});
    })
    it('test burn fund, when msg.sender not a minter', async function(){
      await shouldFail.reverting(this.token.burn($oneToken, {from: mock._other_account_3}));
    })
    it('test burn fund, when msg.sender on blacklist', async function(){
      await shouldFail.reverting(this.token.burn($oneToken, {from: mock._other_account_1}));
    })
  })
})
