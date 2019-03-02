pragma solidity >=0.4.21 <0.6.0;


/**
 * The BaToken contract does this and that...
 */
contract BaToken {

  uint256 public totalSupply; // compulsory in erc20 standard
  // Set the name of the token
  string public name = 'BaToken'; // optional in erc20 standard
  // Set the symbol of the token
  string public symbol = 'BA'; // optional in erc20 standard
  // Set the standard
  string public standard = 'BaToken v1.0'; // Not in erc20 standard

  mapping (address => uint) public balanceOf; // Track the tokens belonging to each address that has received a transfer
  
  event Transfer(
      address indexed _from,
      address indexed _to,
      uint _value
  );

  constructor (uint256 _initialSupply) public{
    totalSupply = _initialSupply;
    balanceOf[msg.sender] = _initialSupply;
    // allocate the initial supply
  }

  // Transfer function -- compulsory in erc20
  function transfer (address _to, uint _value) public returns(bool res) {

    // Run check
    require (balanceOf[msg.sender] >= _value);
    
    // Make transfer
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    // Emit event
    emit Transfer(msg.sender, _to, _value);

    // Return a boolean
    return true;
    
  }
  

}
