pragma solidity ^0.4.25;

import "./openzeppelin/ERC20/ERC20.sol";
import "./openzeppelin/math/SafeMath.sol";

import "./Ownable.sol";
import "./Blacklistable.sol";
import "./Pausable.sol";

import "./sheets/BalanceSheet.sol";

/**
 * @title MarsToken
 * @dev ERC20 Token backed by fiat reserves
 */
contract MarsTokenV1 is Ownable, ERC20, Pausable, Blacklistable {
  using SafeMath for uint256;

  string public name;
  string public symbol;
  uint8 public decimals;
  string public currency;
  address public masterMinter;

  //mapping(address => uint256) internal balances;
  //mapping(address => mapping(address => uint256)) internal allowed;
  //uint256 internal totalSupply_ = 0;
  mapping(address => bool) internal minters;
  mapping(address => uint256) internal minterAllowed;

  event Mint(address indexed minter, address indexed to, uint256 amount);
  event Burn(address indexed burner, uint256 amount);
  event MinterConfigured(address indexed minter, uint256 minterAllowedAmount);
  event MinterRemoved(address indexed oldMinter);
  event MasterMinterChanged(address indexed newMasterMinter);
  event DestroyedBlackFunds(address indexed _account, uint256 _balance);

  BalanceSheet public balances;
  event BalanceSheetSet(address indexed sheet);

  /**
  * @dev ownership of the balancesheet contract
  * @param _sheet The address to of the balancesheet.
  */
  function setBalanceSheet(address _sheet) public onlyOwner returns (bool) {
    balances = BalanceSheet(_sheet);
    emit BalanceSheetSet(_sheet);
    return true;
  }

  constructor(
    string _name,
    string _symbol,
    string _currency,
    uint8 _decimals,
    address _masterMinter,
    address _pauser,
    address _blacklister
  ) public {
    require(_masterMinter != address(0));
    require(_pauser != address(0));
    require(_blacklister != address(0));

    name = _name;
    symbol = _symbol;
    currency = _currency;
    decimals = _decimals;
    masterMinter = _masterMinter;
    pauser = _pauser;
    blacklister = _blacklister;
    setOwner(msg.sender);
  }

  /**
  * @dev Throws if called by any account other than a minter
  */
  modifier onlyMinters() {
    require(minters[msg.sender] == true);
    _;
  }

  /**
  * @dev Function to mint tokens
  * @param _to The address that will receive the minted tokens.
  * @param _amount The amount of tokens to mint. Must be less than or equal to the minterAllowance of the caller.
  * @return A boolean that indicates if the operation was successful.
  */
  function mint(address _to, uint256 _amount) public whenNotPaused onlyMinters notBlacklisted(msg.sender) notBlacklisted(_to) returns (bool) {
    require(_to != address(0));
    require(_amount > 0);

    uint256 mintingAllowedAmount = minterAllowed[msg.sender];
    require(_amount <= mintingAllowedAmount);

    //totalSupply_ = totalSupply_.add(_amount);
    balances.increaseSupply(_amount);
    //balances[_to] = balances[_to].add(_amount);
    balances.addBalance(_to, _amount);
    minterAllowed[msg.sender] = mintingAllowedAmount.sub(_amount);
    emit Mint(msg.sender, _to, _amount);
    emit Transfer(0x0, _to, _amount);
    return true;
  }

  /**
  * @dev Throws if called by any account other than the masterMinter
  */
  modifier onlyMasterMinter() {
    require(msg.sender == masterMinter);
    _;
  }

  /**
  * @dev Get minter allowance for an account
  * @param minter The address of the minter
  */
  function minterAllowance(address minter) public view returns (uint256) {
    return minterAllowed[minter];
  }

  /**
  * @dev Checks if account is a minter
  * @param account The address to check
  */
  function isMinter(address account) public view returns (bool) {
    return minters[account];
  }

  /**
  * @dev Get allowed amount for an account
  * @param owner address The account owner
  * @param spender address The account spender
  */
  function allowance(address owner, address spender) public view returns (uint256) {
    //return allowed[owner][spender];
    return balances.allowanceOf(owner,spender);
  }

  /**
  * @dev Get totalSupply of token
  */
  function totalSupply() public view returns (uint256) {
    return balances.totalSupply();
  }

  /**
  * @dev Get token balance of an account
  * @param account address The account
  */
  function balanceOf(address account) public view returns (uint256) {
    //return balances[account];
    return balances.balanceOf(account);
  }

  /**
  * @dev Adds blacklisted check to approve
  * @return True if the operation was successful.
  */
  function approve(address _spender, uint256 _value) public whenNotPaused notBlacklisted(msg.sender) notBlacklisted(_spender) returns (bool) {
    require(_spender != address(0));
    //allowed[msg.sender][_spender] = _value;
    balances.setAllowance(msg.sender, _spender, _value);
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
  * @dev Transfer tokens from one address to another.
  * @param _from address The address which you want to send tokens from
  * @param _to address The address which you want to transfer to
  * @param _value uint256 the amount of tokens to be transferred
  * @return bool success
  */
  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused notBlacklisted(_to) notBlacklisted(msg.sender) notBlacklisted(_from) returns (bool) {
    require(_to != address(0));
    require(_value <= balances.balanceOf(_from));
    require(_value <= balances.allowanceOf(_from, msg.sender));

    //allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    balances.subAllowance(_from, msg.sender, _value);
    //balances[_from] = balances[_from].sub(_value);
    balances.subBalance(_from, _value);
    //balances[_to] = balances[_to].add(_value);
    balances.addBalance(_to, _value);
    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  * @return bool success
  */
  function transfer(address _to, uint256 _value) public whenNotPaused notBlacklisted(msg.sender) notBlacklisted(_to) returns (bool) {
    require(_to != address(0));
    require(_value <= balances.balanceOf(msg.sender));

    //balances[msg.sender] = balances[msg.sender].sub(_value);
    balances.subBalance(msg.sender, _value);
    //balances[_to] = balances[_to].add(_value);
    balances.addBalance(_to, _value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Function to add/update a new minter
  * @param minter The address of the minter
  * @param minterAllowedAmount The minting amount allowed for the minter
  * @return True if the operation was successful.
  */
  function configureMinter(address minter, uint256 minterAllowedAmount) public whenNotPaused onlyMasterMinter returns (bool) {
    minters[minter] = true;
    minterAllowed[minter] = minterAllowedAmount;
    emit MinterConfigured(minter, minterAllowedAmount);
    return true;
  }

  /**
  * @dev Function to remove a minter
  * @param minter The address of the minter to remove
  * @return True if the operation was successful.
  */
  function removeMinter(address minter) public onlyMasterMinter returns (bool) {
    minters[minter] = false;
    minterAllowed[minter] = 0;
    emit MinterRemoved(minter);
    return true;
  }

  /**
  * @dev allows a minter to burn some of its own tokens
  * Validates that caller is a minter and that sender is not blacklisted
  * amount is less than or equal to the minter's account balance
  * @param _amount uint256 the amount of tokens to be burned
  */
  function burn(uint256 _amount) public whenNotPaused onlyMinters notBlacklisted(msg.sender) {
    uint256 balance = balances.balanceOf(msg.sender);
    require(_amount > 0);
    require(balance >= _amount);

    //totalSupply_ = totalSupply_.sub(_amount);
    balances.decreaseSupply(_amount);
    //balances[msg.sender] = balance.sub(_amount);
    balances.subBalance(msg.sender, _amount);
    emit Burn(msg.sender, _amount);
    emit Transfer(msg.sender, address(0), _amount);
  }

  function updateMasterMinter(address _newMasterMinter) public onlyOwner {
    require(_newMasterMinter != address(0));
    masterMinter = _newMasterMinter;
    emit MasterMinterChanged(masterMinter);
  }

  /**
   * @dev Destroy funds of account from blacklist
   * @param _account The address to destory funds
  */
  function destroyBlackFunds(address _account) public onlyOwner {
    require(blacklisted[_account]);
    uint256 accountFunds = balances.balanceOf(_account);
    balances.subBalance(_account, accountFunds);
    balances.decreaseSupply(accountFunds);
    emit DestroyedBlackFunds(_account, accountFunds);
  }

}
