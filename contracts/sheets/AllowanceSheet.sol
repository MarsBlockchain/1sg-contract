pragma solidity ^0.4.25;

import "./DelegateContract.sol";
import "../openzeppelin/math/SafeMath.sol";

// A wrapper around the allowanceOf mapping.
contract AllowanceSheet is DelegateContract {
  using SafeMath for uint256;

  mapping (address => mapping (address => uint256)) public allowanceOf;

  function subAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyFromAccept {
    allowanceOf[_tokenHolder][_spender] = allowanceOf[_tokenHolder][_spender].sub(_value);
  }

  function setAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyFromAccept {
    allowanceOf[_tokenHolder][_spender] = _value;
  }
}
