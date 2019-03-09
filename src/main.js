// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue'
import App from './App'
import Web3 from 'web3'
import routes from './router/index'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import storeData from './store'
import axios from 'axios'
import {initialize} from './helpers/general.js'
import Web3HDWalletProvider from 'web3-hdwallet-provider'
import { rpc } from '../sec.js'

// import HDWalletProvider from 'truffle-hdwallet-provider'
Vue.use(VueRouter)
Vue.use(Vuex)
let store = new Vuex.Store(storeData)
const router = new VueRouter({
  routes,
  mode: 'history'
})

Vue.config.productionTip = false
window.axios = axios

window.addEventListener('load', function () {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 injected browser: OK.')
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    console.log('Web3 injected browser: Fail. You should consider trying MetaMask.')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    let web3Provider = new Web3.providers.HttpProvider(rpc);
    window.web3 = new Web3(web3Provider)
  
  }
  initialize(store, router)
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
  })
})
