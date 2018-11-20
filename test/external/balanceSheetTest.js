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

contract('Test balanceSheet', function() {
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
  });

  describe('test balanceSheet set up', function(){
    let balance0, balance1;
    beforeEach(async function(){
      balance0 = await this.token.balanceOf(mock._masterMinter);
      balance1 = await this.balanceSheet.balanceOf.call(mock._masterMinter);
    });

    it('check balaceSheet address', async function(){
      let balanceSheet0 = await this.token.balances.call();
      await balanceSheet0.should.equal(this.balanceSheet.address);
    });

    it('check balaceSheet balanceOf with main contract balanceOf', async function(){
      balance0.toString().should.equal(balance1.toString());
    });

    it('test move fund after change LogicContractAddress', async function(){
      await this.balanceSheet.setLogicContractAddress('0x0');
      // should faild. because balanceSheet contract only accept msg.sender from '0x0';
      await shouldFail.reverting(this.token.transfer(mock.other_account, $oneToken, {from: mock._masterMinter}));
    });

    it('change balanceSheet with owner account, then check balances', async function(){
      let NewbalanceSheet = await BalanceSheet.new({from: mock._other_account});
      await this.token.setBalanceSheet(NewbalanceSheet.address, {from: mock._owner});
      await NewbalanceSheet.setLogicContractAddress(this.token.address, {from: mock._other_account});
      balance2 = await this.token.balanceOf(mock._masterMinter);
      balance3 = await NewbalanceSheet.balanceOf.call(mock._masterMinter);
      balance2.toString().should.equal(balance3.toString());
      balance2.toString().should.not.equal(balance0.toString());
      balance2.toString().should.not.equal(balance1.toString());

      //test mint fund after changed balanceSheet
      await mock.initFound(this, $twoToken);
      balance4 = await this.token.balanceOf(mock._masterMinter);
      balance4.toString().should.equal($twoToken);
    });
  })


})
