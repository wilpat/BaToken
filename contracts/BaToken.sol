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

  mapping (address => uint256) public balanceOf; // Track the tokens belonging to each address that has received a transfer
  
  // Emit that a transfer happened
  event Transfer(
      address indexed _from,
      address indexed _to,
      uint256 _value
  );

  // Emit that a delegated spending has been approved
  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  // Two levels deep mapping -- From left to right means: I, address a, permits address b to spend x amount of tokens on my behalf
  // This was, a single address can delegate token spendings to multiple addresses
  mapping(address => mapping(address => uint256)) public allowance;
  

  constructor (uint256 _initialSupply) public{
    totalSupply = _initialSupply;
    balanceOf[msg.sender] = _initialSupply;// we gave the account that deployed this contract all the initial tokens
    // allocate the initial supply
  }

  // Transfer function -- compulsory in erc20
  function transfer (address _to, uint256 _value) public returns(bool res) {

    // Balance of sender must be >= the value being sent
    require(balanceOf[msg.sender] >= _value, "The balance of the sender must be >= the value being sent");
    // Make transfer
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    // Emit event
    emit Transfer(msg.sender, _to, _value);
    // Return a boolean
    return true;
  }
  
  function approve (address _spender, uint256 _value) public returns(bool res) {
    
    // allowance
    allowance[msg.sender][_spender] = _value;
    //Emit the Approval event
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function transferFrom (address _owner, address _to, uint256 _value) public returns(bool res) {
    require(balanceOf[_owner] >= _value); // the owner's balance can take this
    require(allowance[_owner][msg.sender] >= _value); // the allowed delegated transfer isnt crossed
    emit Transfer(_owner, _to, _value);
    balanceOf[_owner] -= _value;
    balanceOf[_to] += _value;
    allowance[_owner][msg.sender] -= _value;
    return true;
  }
}
