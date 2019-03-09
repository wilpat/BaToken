<template>
	<div>
		<div id="cover-spin" v-if="loading">
	      <p id ="content">{{ message }}</p>
	    </div>
		<div class="container" style="width: 650px">
	        <div class="row text-center" >
				<div class="col-lg-12">
					<h1>
						Ba Token ICO Sale
					</h1>
					<hr>
				</div>
				<div id="content1">
					<p>
						Introducing the "Ba Token" (BA)
						Token price is <span>{{ tokenPrice }}</span> ETH. 
						<span v-if="address">You currently have {{ baBalance }} BA</span>
					</p>
					<br>
					<form role = "form">
						<div class="form-group">
							<div class="input-group">
								<input type="number" class="form-control input-lg" value="1" min="1" name="number" pattern="[0-9]" v-model="tokens">
								<span class="input-group-btn">
									<button class="btn btn-primary" @click.prevent=" buyToken ">
										Buy Tokens
									</button>
								</span>
							</div>
						</div>
					</form>
					<div class="progress">
						<div class="progress-bar progress-bar-striped active" aria-valuemin="0" aria-valuemax="100" :style="{width: percent +'%'}">
							
						</div>
					</div>
					<p>
						{{ tokensSold }} / {{ availableTokens }} tokens sold.
					</p>
					<p style="color: red"> {{ buyError }}</p>
					<hr>
					<p v-if="address">Your address is {{ address }}.</p>
					<p v-if="address">Your ETH Balance is {{ ethBalance }} ETH.</p>
				</div>
			</div>
	    </div>

	        <!-- Modal form to sell an item -->
        <div class="modal" role="dialog" v-if="buy">
          <div class="modal-dialog" v-if="buy">

            <!-- Modal content-->
            <div class="modal-content text-center" v-if="buy">
              <div class="modal-header d-block" v-if="buy">
                <button type="button" class="close" @click ="buy = false">&times;</button>
                <h6 class="modal-title">Free Wallet Address</h6>
              </div>
              <div class="modal-body">

                <div class="row">
                  <div class="col-lg-12">
                    <form>
                      <div class="form-group">
                        <label for="Address">I'm giving you a free account with 5 ETH.</label>
                        <input type="text" class="form-control" v-model ="address" readonly>
                      </div>                      
                      <p style="color: red"> {{ report }}</p>
                    </form>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-success" @click="addAddress" >Submit</button>
                <button type="button" class="btn btn-danger" @click ="buy = false">Close</button>
              </div>
            </div>

          </div>
        </div>
		
	</div>
</template>

<script>
/* eslint-disable */
	import App from '@/js/app'
	import { mapState } from 'vuex'
	export default {
		name: 'productlist',
		created () {
			App.init()
				.then(data =>{
					// console.log(data)
					App.render().then(data =>{
						this.tokenPrice = window.web3.fromWei(data.tokenPrice.toString(), 'ether');
						this.tokensSold = data.tokensSold;
						this.availableTokens = data.availableTokens;
						this.percent = data.tokensSold / data.availableTokens * 100;
						let address = localStorage.getItem('address');
						if(address){
    						window.web3.personal.unlockAccount(address, 'secret', 86400)
							this.address = address;
							App.getBalance(this.address)
								.then(response =>{
									// console.log(response)
									this.addressError = false;
									this.baBalance = response.tokens;
									this.ethBalance = parseFloat(response.ethBal).toFixed(3);
									this.loading = false
								}).catch(err =>{
									this.report= 'Invalid address.';
									this.addressError = true;
									this.loading = false
									console.log(err)
								})
						} else {
							this.loading = false
						}
						

					})
				})
		},
		data () {
			return {
				loading: true,
				buy: false,
				report: '',
				address: null,
				baBalance: 0,
				ethBalance: 0,
				tokenPrice: 0,
				tokensSold: 0,
				availableTokens: 0,
				percent:0,
				addressError: false,
				tokens:1,
				buyError: ''
			}
		},
		methods: {
			buyToken : async function () {
				if(this.address && !this.addressError) // If an address has been allocated to this user
				{	
					let tokens = this.tokens;
					let cost = this.tokens * this.tokenPrice;
					// console.log(cost)
					if(this.ethBalance >= cost){ // If account balance is sufficient
						this.loading = true
						App.buyToken(tokens)
							.then(data =>{
								// console.log(data)
								this.tokenPrice = window.web3.fromWei(data.tokenPrice.toString(), 'ether');
								this.tokensSold = data.tokensSold;
								this.availableTokens = data.availableTokens;
								this.percent = data.tokensSold / data.availableTokens * 100;
								this.baBalance = data.bal.tokens;
								this.ethBalance = parseFloat(data.bal.ethBal).toFixed(3);
								this.loading = false
								
							})
							.catch(err =>{
								alert('Something went wrong with your purchase.')
								this.loading = false
								console.log(err)
							})
						} else{
							this.buyError = 'Insufficient funds for purchase.';
						}
				}else {
					this.loading = true;
					await this.createAccount();
					this.buy = true;
				}
			},

			createAccount () {
				// console.log(this.loading)
				App.createAccount()
					.then(data =>{
						this.address = data.account;
						this.ethBalance = parseFloat(data.bal).toFixed(3);
						localStorage.setItem('address', data.account)
						this.loading = false;
					})
			},

			addAddress: async function () {
				if(this.address && !this.addressError){
					this.report = '';
					App.getBalance(this.address)
						.then(response =>{
							// console.log(response)
							this.addressError = false;
							this.baBalance = response.tokens;
							this.ethBalance = response.ethBal.toNumber();
							this.buy = false;
							this.buyToken();
						}).catch(err =>{
							this.report= 'Invalid address.';
							this.addressError = true;
							console.log(err)
						})
				} else {
					this.addressError = true;
					this.report = 'Invalid address.'
				}
			}

		},

		computed: {
			...mapState(['message'])
		}

	}
</script>

<style scoped>
	p{
		color: #000;
	}
	#content1{
	margin: 0 auto;
	}
	.modal{
		display: block;
		background: rgba(0,0,0,0.6);
	}
	.modal-footer {
		display: block;
	}
	.col-lg-4{
		max-width: 32%;
	}
</style>