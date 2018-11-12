pragma solidity ^0.4.23;

import "../Ownable.sol";
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

// A wrapper around the balanceOf mapping.
contract BalanceSheet is Ownable {
    using SafeMath for uint256;
    address logicContract;

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyFromAccpet() {
      require(msg.sender == logicContract);
      _;
    }

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

    function setLogicContractAddress(address _addr) public onlyOwner {
        logicContract = _addr;
    }

}
