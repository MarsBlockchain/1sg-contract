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

contract('Test LogicContractChanged event', function() {
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
  });

  describe('setLogicContractAddress', function(){
    it('should be emit LogicContractChanged event', async function(){
      const { logs } = await this.balanceSheet.setLogicContractAddress(this.token.address);
      expectEvent.inLogs(logs, 'LogicContractChanged', {
          newAddress: this.token.address,
        });
    })

  })
})
