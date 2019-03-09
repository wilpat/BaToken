/* eslint-disable */
import contract from 'truffle-contract'
import ProductList from '@contracts/BaToken.json'
import BaToken from '@contracts/BaToken.json'
import BaTokenSale from '@contracts/BaTokenSale.json'
import store from '../store'
import Web3 from 'web3'
const web3Provider = new Web3.providers.HttpProvider("http://206.189.21.225:8545");

const App = {
     web3Provider: null,
     contracts: {},
     token : null,
     sale: null,
     loading: false,
     mounted: false,
     availableTokens: 750000,
     userAccount: '',
     tokenPrice: 1000000000000000,
     account: '',
     coinbase:'',

    init: async function () {
      store.state.message = 'Setting up the environment...'
      let self = this
      try {
        self.contracts.BaToken = contract(BaToken)
        self.contracts.BaToken.setProvider(window.web3.currentProvider)
        self.contracts.BaTokenSale = contract(BaTokenSale)
        self.contracts.BaTokenSale.setProvider(window.web3.currentProvider)
        const [coinbase, instance, sale] = await Promise.all([self.setCoinbase(), self.contracts.BaToken.deployed(), self.contracts.BaTokenSale.deployed()])
        self.token = instance
        self.sale = sale
        self.listenForEvents()
        return self.coinbase
      } catch (error) {
        console.log(error)
      }
    },

    setCoinbase: async function () { // Check if app is connected to the blockchain server
        let self = this
        try {
          window.web3.eth.getCoinbase((err, account) => {
            if (err === null) {
              self.coinbase = account
            }
          })
        } catch (err) {
          console.log(err)
        }
    },

    render: async function () {
      let self = this
      let response = {};
      //Get the token price
      console.log('here')
      console.log(self.sale)
      let tokenPrice = await self.sale.tokenPrice();
      console.log('again')
      response.tokenPrice = parseInt(tokenPrice);
      self.tokenPrice = response.tokenPrice;
      // Get the amount sold
      let tokensSold = await self.sale.tokensSold();
      response.tokensSold = parseInt(tokensSold);
      self.tokensSold = response.tokensSold;
      // Get the available tokens for sale
      response.availableTokens = self.availableTokens;
      return response;
      
    },

    listenForEvents: function () {
      let self = this
      self.sale.Sell({}, {}).watch((error, event) =>{
        if(!error){
          store.state.events.push(event.args)
        }else{
          console.error(error)
        }
        
      });

  },
  buyToken: async function (tokens) {
    store.state.message = "Acquiring token, please wait..."
    let self = this
    await self.sale.buyTokens(tokens, self.account, {
        from: self.account,
        value: tokens * self.tokenPrice,
        gas: 500000
      })
    // console.log(self.coinbase, self.account)
    store.state.message = "Implementing changes..."
    let response = await self.render();
    const bal = await self.getBalance(self.account)
    response.bal = bal;
    return response;
  },

  getBalance: async function (address) {
    self = this;
    try{
      const tokens = await self.token.balanceOf(address)
      let ethBal = await window.web3.eth.getBalance(address)
      // console.log(ethBal);
      ethBal = window.web3.fromWei(ethBal, 'ether')
      self.account = address;
      return { tokens, ethBal };
    }catch(err) {
      return err
    }
    
    
  },

  createAccount : async function(){
    self = this;
    store.state.message = "Creating an account for you..."
    let account = await window.web3.personal.newAccount('secret');
    await window.web3.personal.unlockAccount(account, 'secret', 86400) // Unlock for a day
    let bal = await self.transferCoins(account);
    self.account = account;
    return { account, bal };
    
        
  },

  transferCoins: async function (address) {
    store.state.message = "Giving you test ethers..."
    self = this;
    try {
      var amt;
      var result;
      amt = window.web3.toWei('5', 'ether')
      // console.log(amt) 
      result = await window.web3.eth.sendTransaction({
        from: self.coinbase,
        to: address,
        value: amt,
        gas: 500000
      })

      if (result) {
        const addressBal = await window.web3.eth.getBalance(address)
        amt = window.web3.fromWei(addressBal, 'ether')
        return amt
      }
    } catch (err) {
      console.log(err)
    }
  }

};

export default App
