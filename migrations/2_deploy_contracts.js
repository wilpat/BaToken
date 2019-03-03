const BaToken = artifacts.require("BaToken");
const BaTokenSale = artifacts.require("BaTokenSale");

module.exports = function(deployer) {
  deployer.deploy(BaToken, 1000000)// passed as argument into the constructor of the BaToken smart contract
  .then(() => {
  	let tokenPrice = 1000000000000000 // 0.001 ETH
  	return deployer.deploy(BaTokenSale, BaToken.address, tokenPrice);
  }); 
};
