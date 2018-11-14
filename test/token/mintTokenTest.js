const shouldFail = require('../../utils/test/helpers/shouldFail');
const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();
const FiatTokenV1 = artifacts.require('FiatTokenV1');
const BalanceSheet = artifacts.require('sheets/BalanceSheet');
const mock = require('../mock/variable');

contract('Test mint Token', function() {
  beforeEach(async function () {
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
  });


  describe('mint test', function(){
    it('set allowance to a minter with other account, will failed', async function(){
      let _amount = web3.utils.toWei('1', "ether");
      shouldFail.reverting(this.token.configureMinter(mock._other_account, _amount, {from: mock._other_account}));
      let mallownace = await this.token.minterAllowance.call(mock._other_account);
      mallownace.toString().should.equal('0');
    })
    it('set allowance to a minter with masterMinter permission', async function(){
      let _amount = web3.utils.toWei('1', "ether");
      await this.token.configureMinter(mock._masterMinter, _amount, {from: mock._masterMinter});
      let mallownace = await this.token.minterAllowance.call(mock._masterMinter);
      mallownace.toString().should.equal(_amount);
    })
    it('mint token when this account not a minter, will failed', async function(){
      let _amount = web3.utils.toWei('1', "ether");
      shouldFail.reverting(this.token.mint(mock._other_account, _amount, {from: mock._other_account}));
    })
    it('mint token when this account is a minter but mint allowance not enough, will failed', async function(){
      let _amount = web3.utils.toWei('1', "ether");
      await this.token.configureMinter(mock._masterMinter, _amount, {from: mock._masterMinter});
      let _amount2 = web3.utils.toWei('1.01', "ether");
      shouldFail.reverting(this.token.mint(mock._masterMinter, _amount2, {from: mock._masterMinter}));
    })
    it('mint token when this account is a minter and succeeded', async function(){
      let _amount = web3.utils.toWei('1', "ether");
      await this.token.configureMinter(mock._masterMinter, _amount, {from: mock._masterMinter});
      await this.token.mint(mock._masterMinter, _amount, {from: mock._masterMinter});
      (await this.token.balanceOf(mock._masterMinter)).toString().should.equal(_amount);
    })
  })
})
