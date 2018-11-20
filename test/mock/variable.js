const web3u = require("web3-utils");
const _name = _symbol = _currency = "1SGD";
const _decimals = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const _admin = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d"; //account[4]
const _pauser = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d"; //account[4]
const _owner = "0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d"; //account[4]
const _masterMinter = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"; //account[1]
const _blacklister = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0"; //account[2]

const _other_account = "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b"; //account[3]
const _other_account_1 = "0xd03ea8624C8C5987235048901fB614fDcA89b117"; //account[5]
const _other_account_2 = "0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC"; //account[6]
const _other_account_3 = "0x3E5e9111Ae8eB78Fe1CC3bb8915d5D461F3Ef9A9"; //account[7]
const _other_account_4 = "0x28a8746e75304c0780E011BEd21C72cD78cd535E"; //account[8]
const _other_account_5 = "0xACa94ef8bD5ffEE41947b4585a84BdA5a3d3DA6E"; //account[9]
// *** decimals conver ***//
// wei	1 wei	1
// Kwei (babbage)	1e3 wei	1,000
// Mwei (lovelace)	1e6 wei	1,000,000
// Gwei (shannon)	1e9 wei	1,000,000,000
// microether (szabo)	1e12 wei	1,000,000,000,000
// milliether (finney)	1e15 wei	1,000,000,000,000,000
// ether	1e18 wei	1,000,000,000,000,000,000
// *** decimals conver ***//
const _decimals_conver = 'ether';

const $zeroToken = web3u.toWei('0', _decimals_conver);
const $oneToken = web3u.toWei('1', _decimals_conver);
const $tenToken = web3u.toWei('10', _decimals_conver);
const $hugeToken = web3u.toWei('1000', _decimals_conver);
const mock = {
  _name,
  _symbol,
  _currency,
  _decimals,
  _admin,
  ZERO_ADDRESS,
  _decimals_conver,
  _masterMinter,
  _pauser,
  _blacklister,
  _owner,
  _other_account,
  _other_account_1,
  _other_account_2,
  _other_account_3,
  $zeroToken,
  $oneToken,
  $tenToken,
  $hugeToken
}

const getTokenMount = (_amount) => {
  return web3u.toWei(`${_amount}`, _decimals_conver);
}
const initFound = async (self, amount) => {
  let _amount = amount || mock.$tenToken
  await self.token.configureMinter(mock._masterMinter, _amount, {from: mock._masterMinter});
  await self.token.mint(mock._masterMinter, _amount, {from: mock._masterMinter});
}
const transferToInit = async (self) => {
  // give other_account one token
  await self.token.transfer(mock._other_account, mock.$oneToken, {from: mock._masterMinter});
  // give other_account_1 two token
  await self.token.transfer(mock._other_account_1, getTokenMount('2'), {from: mock._masterMinter});
}

module.exports = {
  //function
  initFound,
  getTokenMount,
  transferToInit,
  //mock data
  ...mock
}
