pragma solidity ^0.4.25;

import "./upgradeability/AdminUpgradeabilityProxy.sol";

/**
 * @title MarsokenProxy
 * @dev This contract proxies MarsToken calls and enables MarsToken upgrades
*/
contract MarsTokenProxy is AdminUpgradeabilityProxy {
  constructor(address _implementation) public AdminUpgradeabilityProxy(_implementation) {
  }
}
