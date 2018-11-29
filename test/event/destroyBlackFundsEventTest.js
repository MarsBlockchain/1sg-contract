const expectEvent = require('../../utils/test/helpers/expectEvent');
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

  describe('destory black funds event test', function(){

    it('should be emit DestroyedBlackFunds event', async function(){
      let account_balance = await this.token.balanceOf(mock._other_account_1);
      const { logs } = await this.token.destroyBlackFunds(mock._other_account_1, {from: mock._owner});
      expectEvent.inLogs(logs, 'DestroyedBlackFunds', {
          _account: mock._other_account_1,
          _balance: new BigNumber(account_balance),
        });
    })

  })
})
