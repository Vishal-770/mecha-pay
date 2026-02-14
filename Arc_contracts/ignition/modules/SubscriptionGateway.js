const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * @title SubscriptionGatewayModule
 * @dev Deployment module for the Arc Network Subscription Gateway.
 * USCD Contract on Arc Testnet: 0x3600000000000000000000000000000000000000
 */
module.exports = buildModule("SubscriptionGatewayModule", (m) => {
  // Arc Testnet USDC Address
  const usdcAddress = "0x3600000000000000000000000000000000000000";

  // Deploy SubscriptionGateway with the USDC address
  const gateway = m.contract("SubscriptionGateway", [usdcAddress]);

  return { gateway };
});
