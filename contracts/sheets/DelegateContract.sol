pragma solidity ^0.4.25;

import "../Ownable.sol";

contract DelegateContract is Ownable {
  address delegate_;

  /**
  * @dev Throws if called by any account other than the owner.
  */
  modifier onlyFromAccpet() {
    require(msg.sender == delegate_);
    _;
  }

  function setLogicContractAddress(address _addr) public onlyOwner {
    delegate_ = _addr;
  }
}
