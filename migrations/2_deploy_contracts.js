const BaToken = artifacts.require("BaToken");

module.exports = function(deployer) {
  deployer.deploy(BaToken, 1000000);
};
