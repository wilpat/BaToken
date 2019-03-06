const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const mnemonic = process.env.MNEMONIC || fs.readFileSync('.secret').toString().trim();
const infura_rinkeby_endpoint = process.env.INFURA_RINKEBY_ENDPOINT || fs.readFileSync('.infura_rinkeby_endpoint').toString().trim();
const infura_ropsten_endpoint = process.env.INFURA_ROPSTEN_ENDPOINT || fs.readFileSync('.infura_ropsten_endpoint').toString().trim();

module.exports = {

  networks: {
    
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 7545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, infura_rinkeby_endpoint),
      network_id: 4,       // Rinkeby's id
      gas: 5500000,        
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, infura_ropsten_endpoint),
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },

    // Useful for private networks
    // private: {
      // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
      // network_id: 2111,   // This network is yours, in the cloud.
      // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

}
