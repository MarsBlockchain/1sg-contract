pragma solidity ^0.4.25;

import "./DelegateContract.sol";
import "./AllowanceSheet.sol";
import "../openzeppelin/math/SafeMath.sol";

// A wrapper around the balanceOf mapping.
contract BalanceSheet is DelegateContract, AllowanceSheet {
  using SafeMath for uint256;

  mapping (address => uint256) public balanceOf;

  function addBalance(address _addr, uint256 _value) public onlyFromAccpet {
    balanceOf[_addr] = balanceOf[_addr].add(_value);
  }

  function subBalance(address _addr, uint256 _value) public onlyFromAccpet {
    balanceOf[_addr] = balanceOf[_addr].sub(_value);
  }

  function setBalance(address _addr, uint256 _value) public onlyFromAccpet {
    balanceOf[_addr] = _value;
  }

}
