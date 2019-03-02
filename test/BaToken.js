var BaToken = artifacts.require('./BaToken.sol');

contract('BaToken', (accounts) => {
	var app;

	it('initializes the contract with the correct values', () =>{
		return BaToken.deployed().then( i => {
			app = i;
			return app.name()
		}).then(name =>{
			assert.equal(name, 'BaToken', 'Has the correct name')
			return app.symbol()
		}).then(symbol => {
			assert.equal(symbol, 'BA', 'Has the correct symbol')
			return app.standard();
		}).then(standard => {
			assert.equal(standard, 'BaToken v1.0', 'Has the correct standard')
		})
	})

	it('sets the initial supply upon deployment to 1,000,000', () =>{
		return BaToken.deployed().then(i => {
		 app = i 
		 return app.totalSupply()
		}).then(totalSupply => {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
			return  app.balanceOf(accounts[0])
		}).then(adminBalance => { 
			assert.equal(adminBalance.toNumber(), 1000000, 'It allocated the initial supply to the admin');
		})
	})

	it('transfers token successfully', () =>{
		return BaToken.deployed().then(i => {
		 app = i;
		 return app.transfer.call(accounts[1], 9999999999) // .call doesnt actually create a transaction
		}).then(assert.fail).catch(error =>{
			assert(error.message.indexOf('revert') >= 0, 'Transfer of tokens higher than balance failed with a successful revert')
			return app.transfer.call(accounts[1], 250000, {from: accounts[0]})
		}).then( res => {
			assert.equal(res, true, 'It returns true')
			return app.transfer(accounts[1], 250000, {from: accounts[0]})
		}).then(receipt => {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'Logs the account that the tranfer was from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'Logs the account that the transfer was to');
			assert.equal(receipt.logs[0].args._value, 250000, 'Logs the transfer amount');
			return app.balanceOf(accounts[1])
		}).then(balance => {
			assert.equal(balance.toNumber(), 250000, 'Adds exact sent token to receiver\'s balance')
			return app.balanceOf(accounts[0]);
		}).then(balance => {
			assert.equal(balance.toNumber(), 750000, 'Deducts the sent amount from sender')
		});
	})
})