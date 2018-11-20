pragma solidity ^0.4.25;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
 * @title MarsokenProxy
 * @dev This contract proxies FiatToken calls and enables FiatToken upgrades
*/
contract MarsTokenProxy is AdminUpgradeabilityProxy {
  constructor(address _implementation) public AdminUpgradeabilityProxy(_implementation) {
  }
}
