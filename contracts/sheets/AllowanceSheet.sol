pragma solidity ^0.4.25;

import "../openzeppelin-solidity/math/SafeMath.sol";

// A wrapper around the allowanceOf mapping.
contract AllowanceSheet {
  using SafeMath for uint256;

  mapping (address => mapping (address => uint256)) public allowanceOf;

  function addAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyFromAccpet {
    allowanceOf[_tokenHolder][_spender] = allowanceOf[_tokenHolder][_spender].add(_value);
  }

  function subAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyFromAccpet {
    allowanceOf[_tokenHolder][_spender] = allowanceOf[_tokenHolder][_spender].sub(_value);
  }

  function setAllowance(address _tokenHolder, address _spender, uint256 _value) public onlyFromAccpet {
    allowanceOf[_tokenHolder][_spender] = _value;
  }
}
