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
			assert.equal(adminBalance.toNumber(), 250000, 'Confirms that tokens left with the admin is 250,000 from 1,000,000');
		})
	})

	it('transfers token successfully', () =>{
		return BaToken.deployed().then(i => {
		 app = i;
		 return app.transfer.call(accounts[1], 9999999999) // .call doesnt actually create a transaction
		}).then(assert.fail).catch(error =>{
			assert(error.message.indexOf('revert') >= 0, 'Transfer of tokens higher than balance failed with a successful revert')
			return app.transfer.call(accounts[1], 1000, {from: accounts[0]})
		}).then( res => {
			assert.equal(res, true, 'It returns true')
			return app.transfer(accounts[1], 1000, {from: accounts[0]})
		}).then(receipt => {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'Logs the account that the tranfer was from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'Logs the account that the transfer was to');
			assert.equal(receipt.logs[0].args._value, 1000, 'Logs the transfer amount');
			return app.balanceOf(accounts[1])
		}).then(balance => {
			assert.equal(balance.toNumber(), 1000, 'Adds exact sent token to receiver\'s balance')
			return app.balanceOf(accounts[0]);
		}).then(balance => {
			assert.equal(balance.toNumber(), 249000, 'Deducts the sent amount from sender')
		});
	});

	

	it('approves tokens for delegated transfer', () => {
		return BaToken.deployed().then(i => {
		 app = i;
		 return app.approve.call(accounts[1], 100) // .call doesnt actually create a transaction
		}).then(res => {
			assert.equal(res, true, 'Delegated transfer returns true')
			return app.approve(accounts[1], 100)
		}).then(receipt => {
			assert.equal(receipt.logs.length, 1, 'Triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'Logs the account that the approval was from');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'Logs the account that was approved to spend the tokens');
			assert.equal(receipt.logs[0].args._value, 100, 'Logs the transfer amount');
			return app.allowance(accounts[0], accounts[1])
		}).then(allowance => {
			assert.equal(allowance.toNumber(), 100, 'Stores the allowance for delegated transfer');
		})
	});

	it('handles the actual token transfer delegation', () => {
		return BaToken.deployed().then(i => {
		 app = i;

		 owner = accounts[2]; // Because account 1 has received funds previously
		 spender = accounts[3];
		 to = accounts[4]
		 return app.transfer(owner, 100, {from : accounts[0]})
		}).then(receipt => {
		 return app.approve(spender, 10, { from: owner}) 
		}).then(receipt =>{
			//Try transferring larger than the owner's balance
			return app.transferFrom(owner, to, 9999, {from: spender})
		}).then(assert.fail).catch(error =>{
			assert(error.message.indexOf('revert') >= 0, 'Cannot transfer more than owner\'s balance');
			// Try transferring more than the allocated delegation
			return app.transferFrom(owner, to, 20, {from: spender})
		}).then(assert.fail).catch(error =>{
			assert(error.message.indexOf('revert') >= 0, 'Cannot transfer more than delegated allowance');
			// Check for boolean response on transfer of the accepted amount 
			return app.transferFrom.call(owner, to, 10, {from: spender})
		}).then(res => {
			assert.equal(res, true, 'Delegated transfer was successful');
			// Try actual transfer
			return app.transferFrom(owner, to, 10, {from: spender})
		}).then(receipt =>{
			assert.equal(receipt.logs.length, 1, 'One event was triggered');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, owner, 'Logs the account that the tranfer was from');
			assert.equal(receipt.logs[0].args._to, to, 'Logs the account that the transfer was to');
			assert.equal(receipt.logs[0].args._value, 10, 'Logs the transfer amount');
			// Check owner's balance
			return app.balanceOf(owner)
		}).then(bal => {
			assert.equal(bal.toNumber(), 90, 'Deducted the transfered token from the sender');
			// Check receiver's balance
			return app.balanceOf(to);
		}).then(bal =>{
			assert.equal(bal.toNumber(), 10, 'Adds the transfered to the receiver');
			return app.allowance(owner, spender);
		}).then(allowance => {
			assert.equal(allowance.toNumber(), 0, 'successfully deducts the allowance')
		})
	})
	// At the end of this test, 1,100 tokens had already been taken out of the admin account
	// 1,000 to accounts[1]
	// 100 to accounts[2]
});