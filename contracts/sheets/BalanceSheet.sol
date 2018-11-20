pragma solidity ^0.4.25;

import "./DelegateContract.sol";
import "./AllowanceSheet.sol";
import "../openzeppelin/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract BalanceSheet is DelegateContract, AllowanceSheet {
  using SafeMath for uint256;

  uint256 internal totalSupply_ = 0;

  mapping (address => uint256) public balanceOf;

  function addBalance(address _addr, uint256 _value) public onlyFromAccept {
    balanceOf[_addr] = balanceOf[_addr].add(_value);
  }

  function subBalance(address _addr, uint256 _value) public onlyFromAccept {
    balanceOf[_addr] = balanceOf[_addr].sub(_value);
  }

  function setBalance(address _addr, uint256 _value) public onlyFromAccept {
    balanceOf[_addr] = _value;
  }

  function increaseSupply(uint256 _amount) public onlyFromAccept {
    totalSupply_ = totalSupply_.add(_amount);
  }

  function decreaseSupply(uint256 _amount) public onlyFromAccept {
    totalSupply_ = totalSupply_.sub(_amount);
  }

  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }
}
