pragma solidity ^0.4.23;

import "../Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around the allowanceOf mapping.
contract AllowanceSheet is Ownable {
    using SafeMath for uint256;
    address logicContract;

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyFromAccpet() {
      require(msg.sender == logicContract);
      _;
    }


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

    function setLogicContractAddress(address _addr) public onlyOwner {
        logicContract = _addr;
    }
}
