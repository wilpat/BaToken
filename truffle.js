var HDWalletProvider = require("truffle-hdwallet-provider");
const fs = require('fs');
const Web3 = require('web3');

const ropsten_mnemonic = process.env.ROPSTEN_MNEMONIC || fs.readFileSync('.ropsten_mnemonic').toString().trim();
const rinkeby_mnemonic = process.env.RINKEBY_MNEMONIC || fs.readFileSync('.rinkeby_mnemonic').toString().trim();
const infura_rinkeby_endpoint = process.env.INFURA_RINKEBY_ENDPOINT || fs.readFileSync('.infura_rinkeby_endpoint').toString().trim();
const infura_ropsten_endpoint = process.env.INFURA_ROPSTEN_ENDPOINT || fs.readFileSync('.infura_ropsten_endpoint').toString().trim();

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 4700000,
      network_id: "*" // Match any network id
    },

    ganache: {
      host: "206.189.21.225",
      port: 8545,
      gas: 4700000,
      network_id: "*" // Match any network id
    },

    private: {
      host: "127.0.0.1",
      port: 8545,
      gas: 500000,
      network_id: "4224"
    },

    ropsten:{
    	provider: () => new HDWalletProvider(ropsten_mnemonic, infura_ropsten_endpoint),
    	network_id: 3, //Ropsten's id
    	gas: 5000000, //Ropsten has a lower block limit than the main net
    	confirmation: 2, //Number of confs to wait before deployment (Default: 0)
    	timeoutBlocks: 200, // Number of blocks before a deployment times out (minimum / default : 50)
    	skipDryRun: true //Skip dry run before migration? Default is public for public nets
    },

    kaleido: {
      provider: function() {
        return new Web3.providers.HttpProvider(kaleido_key)
      },
      gasPrice: 0,
      gas:5000000,
      network_id: "*"
    },

    rinkeby: {
      provider: () => new HDWalletProvider(rinkeby_mnemonic, infura_rinkeby_endpoint),
      network_id: 4,       // Rinkeby's id
      gas: 5500000,        
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  }
};
