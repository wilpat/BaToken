App = {

  web3Provider: null,
  contracts: {},
  account: '0x0',
  tokenPrice: 1000000000000000,
  loading: false,
  tokensSold: 0,
  tokensAvalaible: 750000,

  init: function() {
    console.log("App initialized...");
    App.initWeb3()
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: () => {
    $.getJSON("BaTokenSale.json", function(BaTokenSale) {
      // console.log(BaTokenSale);
      App.contracts.BaTokenSale = TruffleContract(BaTokenSale);
      App.contracts.BaTokenSale.setProvider(App.web3Provider);
      App.contracts.BaTokenSale.deployed().then(function(BaTokenSale) {
        console.log("BA Token Sale Address:", BaTokenSale.address);
      });
    }).done(function() {
      $.getJSON("BaToken.json", function(BaToken) {
        App.contracts.BaToken = TruffleContract(BaToken);
        App.contracts.BaToken.setProvider(App.web3Provider);
        App.contracts.BaToken.deployed().then(function(BaToken) {
          console.log("BA Token Address:", BaToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  render : () =>{
    if(App.loading){
      return;
    }
    let loader = $('#loader');
    let content = $('#content')
    // Loading account data
    web3.eth.getCoinbase((err, acc) =>{
      if(!err){
        $('#accountAddress').html("Your account: "+ acc);
        App.account = acc;
      }
    })

    // Load token sale contract
    App.contracts.BaTokenSale.deployed().then(i =>{
      sale = i;
      return sale.tokenPrice();
    }).then(price =>{
      App.tokenPrice = price.toNumber();
      $('.token-price').html(web3.fromWei(App.tokenPrice, 'ether'));
      return sale.tokensSold();
    }).then(tokensSold => {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvalaible);
      let percentSold = App.tokensSold / App.tokensAvalaible * 100;
      $('#progress').css('width', percentSold +'%');
    });
    // Load token contract
    App.contracts.BaToken.deployed().then(i =>{
      token = i;
      return token.balanceOf(App.account);
    }).then(bal => {
      App.balance = bal.toNumber();
      $('.ba-balance').html(App.balance);
      App.loading = false;
      loader.hide();
      content.show();
    })
  },

  buyTokens: () =>{
    $('#content').hide();
    $('#loader').show();
    let numberOfTokens = $('#numberOfTokens').val();
    App.contracts.BaTokenSale.deployed().then(i => {
      sale = i;
      return sale.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      })
    }).then(receipt => {
      console.log('Token bought.')
      $('form').trigger('reset') // reset number of tokens in form
    })
  },

  listenForEvents: () =>{
    App.contracts.BaTokenSale.deployed().then(i =>{
      sale = i;
      sale.Sell({}, {}).watch((error,event) => {
        if(!error){
          console.log('Event: ', event);
          App.render();
        }else{
          console.error(error);
        }
      });
    })
  }
}



$(function() {
     $(window).load(function() {
          App.init();
     });
});
