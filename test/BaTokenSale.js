let BaTokenSale = artifacts.require('./BaTokenSale.sol');
let BaToken = artifacts.require('./BaToken.sol');

contract('BaTokenSale', (accounts) => {
  	// Getting here from the previous test, admin had given out 250100 tokens so it had 749900 tokens left
	var app;
	var tokenInstance;
	var tokenPrice = 1000000000000000; // 15 zeros in wei
	var buyer = accounts[5] // This account hasn't been used in the previous tests
	var numberOfTokens;
	var admin = accounts[0]; // As this is the account that receives all the tokens upon deployment
  	var availableTokens = 750000;

	it('initializes the contract with the correct values', () =>{
		return BaTokenSale.deployed().then(i =>{
			app = i;
			return app.address;
		}).then(address => {
			assert.notEqual(address, 0x0, 'has contract address')
			return	app.tokenContractAddress(); // Check if the token contract address was inserted 
		}).then(address =>{
			assert.notEqual(address, 0x0, 'has token contract address')
			return app.tokenPrice();
		}).then(price => {
			assert.equal(price, tokenPrice, 'Token price is correct')
		});
	});

	it('facilitates token buying', () =>{
		numberOfTokens = 10;
		return BaToken.deployed().then(i =>{
			//Grab token instance
			tokenInstance = i;
			return BaTokenSale.deployed()
		}).then(i =>{
			// Then grab token sale instance
			app = i;
			let value = numberOfTokens * tokenPrice
			// Try buying a token within the required conditions
			return app.buyTokens(numberOfTokens, buyer, {value})
		}).then(receipt => {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'Should be the "sell" event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'Logs the account that purchased the tokens');
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'Logs the number of tokens bought');
			return app.tokensSold();
		}).then(amount => {
			assert.equal(amount.toNumber(), numberOfTokens, 'It increments the total sold tokens')
			//Check if the available token went up for the buyer
			return tokenInstance.balanceOf(buyer);
		}).then(bal =>{
			assert.equal(bal.toNumber(), numberOfTokens, 'It adds the bought tokens to the buyer')
			//Check if the available token went down for the contract
			return tokenInstance.balanceOf(app.address);
		}).then(bal =>{
			assert.equal(bal.toNumber(), availableTokens - numberOfTokens, 'It subtracts the sold tokens from contract')
			// Try buying tokens for a price different from the ether value
			return app.buyTokens(numberOfTokens, buyer, {value: 1});
		}).then(assert.fail).catch(err =>{
			// console.log(err)
			assert(err.message.indexOf('revert') >= 0, 'msg.value must be equal to the equiv number of tokens in wei')
			// Try buying a token more than what the smart contract has to offer
			return app.buyTokens(800000, buyer, {value: numberOfTokens * tokenPrice});
		}).then(assert.fail).catch(err =>{
			assert(err.message.indexOf('revert') >= 0, 'Cannot buy more tokens than available Tokens for sale')
		})
	});

	it('ends token sale', () => {
		return BaToken.deployed().then(i =>{
			//Grab token instance
			tokenInstance = i;
			return BaTokenSale.deployed()
		}).then(i =>{
			// Then grab token sale instance
			app = i;
			//Try ending the sale with another address
			return app.endSale({from: buyer});
		}).then(assert.fail).catch(err=>{
			assert(err.message.indexOf('revert') >= 0, 'Only admin can end sale');
			// End the sale successfully
			return app.endSale({from: admin});
		}).then(receipt =>{
			// check if the tokens got resent to the admin
			return tokenInstance.balanceOf(admin);
		}).then(bal => {
			assert.equal(bal.toNumber(), 998890) // Since this test only sold 10 tokens out of the admin balance it met
			return web3.eth.getBalance(app.address);
		}).then(balance =>{
      		assert.equal(balance, 0);
		})
	})

});