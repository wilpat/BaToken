pragma solidity >=0.4.21 <0.6.0;
import "./BaToken.sol"; // This would be the datatype for the address of the token address

contract BaTokenSale {
	address payable admin;
	BaToken public tokenContractAddress;
	uint256 public tokenPrice;
	uint256 public tokensSold; // TO keep track of the token sales
	event Sell(address _buyer, uint256 _amount);
	

	constructor (BaToken _tokenContractAddress, uint256 _tokenPrice) public {
		admin = msg.sender;
		tokenContractAddress = _tokenContractAddress;
		tokenPrice = _tokenPrice;
		tokenContractAddress.transfer(address(this), 750000);
	}

	function multiply (uint x, uint y) internal pure returns(uint z) {
		require(y == 0 || (z = x * y) / y == x);
	}
	

	function buyTokens (uint256 _numberOfTokens, address _buyer) public payable {

		require(msg.value == multiply(_numberOfTokens, tokenPrice), "The amount sent should be equal to the value of the tokens in eth"); 
		require(tokenContractAddress.balanceOf(address(this)) >= _numberOfTokens, "the amount of tokens stored in this smart contract >= the requested tokens"); // the amount of tokens stored in this smart contract >= the requested tokens
		require(tokenContractAddress.transfer(_buyer, _numberOfTokens), "that the transfer must return true"); 
		tokensSold += _numberOfTokens; // Increment the amount sold
		admin.transfer(msg.value);//transfer funds
		emit Sell(_buyer, _numberOfTokens);
	}

	// Ending token sale
	function endSale () public {
		// The caller of this fxn must be the admin
		require(msg.sender == admin);
		// The remaining tokens must be sent back to the admin
		require(tokenContractAddress.transfer(admin, tokenContractAddress.balanceOf(address(this))));

		admin.transfer(address(this).balance);
	}
	
	
}
