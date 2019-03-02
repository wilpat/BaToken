var BaToken = artifacts.require('./BaToken.sol');

contract('BaToken', (accounts) => {
	it('sets the total supply upon deployment to 1,000,000', () =>{
		return BaToken.deployed().then(i => {
		 app = i 
		 return app.totalSupply()
		}).then(totalSupply => {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
		})
	})
})