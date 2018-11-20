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
const initFound = mock.initFound;

contract('Test burn Token', function() {
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
  });

  describe('burn test', function(){
    beforeEach(async function (){
      // make other_account_1 as minter
      await this.token.configureMinter(mock._other_account_1, $twoToken, {from: mock._masterMinter});
    })

    it('brun token, when account is not minter', async function(){
      await shouldFail.reverting(this.token.burn($oneToken, {from: mock._other_account}));
    })

    it('brun token, when account is a minter', async function(){
      await this.token.burn($oneToken, {from: mock._other_account_1});
      (await this.token.balanceOf(mock._other_account_1)).toString().should.equal($oneToken);
    })

    it('brun token, when account is a minter but fund not enough', async function(){
      await shouldFail.reverting(this.token.burn($tenToken, {from: mock._other_account_1}));
      (await this.token.balanceOf(mock._other_account_1)).toString().should.equal($twoToken);
    })
  })
})
