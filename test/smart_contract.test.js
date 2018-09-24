var Auction = artifacts.require('smart_contract.vyper');
contract('smart_contract', accounts => {
	const owner = accounts[0];
	describe('constructor', () => {
		describe('success case', () => {
			it('should deploy this contract', async () => {
				try {
				const instance = await Auction.new(19,4,10, { from: owner });
				} catch (err) {
				assert.isUndefined(err.message,'revert with valid arguments');
				}
			});
		});
		describe('Fail case', () => {
			it('should revert on invalid arguments', async () => {
				try {
				const instance = await Auction.new(19,4,10, { from: accounts[1] });
				assert.isUndefined(instance, 'contract should be created from owner');
				} catch (err) {
				assert.isUndefined(err.message,'revert with valid arguments');
				}
			});
		});

		describe('Fail case', () => {
			it('should revert if q is not prime', async () => {
				try {
				const instance = await Auction.new(8,4,10, { from: accounts[1] });
				assert.isUndefined(instance, 'contract should be created from owner');
				} catch (err) {
				assert.isUndefined(err.message,'revert with prime number');
				}
			});
		});
		describe('Fail case', () => {
			it('should revert if zero items', async () => {
				try {
				const instance = await Auction.new(19,0,10, { from: accounts[1] });
				assert.isUndefined(instance, 'contract should be created from owner');
				} catch (err) {
				assert.isUndefined(err.message,'revert with proper item number');
				}
			});
		});

	});
	describe('Notary Register', () => {
		let instance;	
		beforeEach(async () => {
			instance = await Auction.new(19,10,100, { from: owner });
		});
		describe('success case', () => {
			it('should register successfully', async () => {
				try {
				await instance.notaryRegister({ from: accounts[1] });
				await instance.notaryRegister({ from: accounts[2] });
				await instance.notaryRegister({ from: accounts[3] });
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});
		describe('success case', () => {
			it('should return notary num', async () => {
				try {
				await instance.notaryRegister({ from: accounts[1] });
				await instance.notaryRegister({ from: accounts[2] });
				await instance.notaryRegister({ from: accounts[3] });
				assert.equal(await instance.notary_size.call(),3,'num of notaries should be 3');
				} catch (err) {
				assert.isUndefined(err.message,'wrong number of notaries');
				}
			});
		});
		describe('Fail case', () => {
			it('no duplicate address', async () => {
				try {
				await instance.notaryRegister({ from: accounts[1] });
				await instance.notaryRegister({ from: accounts[1] });
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});
		describe('Fail case', () => {
			it('Auctioneer should not be notary', async () => {
				try {
				await instance.notaryRegister({ from: accounts[0] });
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});
	});

	describe('Bidder Register', () => {
		let instance;	
		beforeEach(async () => {
			instance = await Auction.new(19,10,1000, { from: owner });
			await instance.notaryRegister({ from: accounts[1] });
			await instance.notaryRegister({ from: accounts[2] });
			await instance.notaryRegister({ from: accounts[3] });
			await instance.notaryRegister({ from: accounts[4] });
		});

		describe('success case', () => {
			it('bidder successfully registers with this address', async () => {
				try {
			 	await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[6],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[13,10],[12,8]],[3,4],2,{ from: accounts[7],value:web3.toWei(1,'ether')});
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});

		describe('Fail case', () => {
			it('notary should not register', async () => {
				try {
				await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[2] });
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});

		describe('Fail case', () => {
			it('Auctioneer can not bid', async () => {
				try {
				await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[0] });
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});
		describe('Fail case', () => {
			it('notaries should be greater than bidders', async () => {
				try {
				await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[6],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[13,10],[12,8]],[3,4],2,{ from: accounts[7],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[8],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[9],value:web3.toWei(1,'ether')});
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});

		describe('Fail case', () => {
			it('bidder should not bid multiple times', async () => {
				try {
			 	await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'ether')});
				await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[5],value:web3.toWei(1,'ether')});
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});

		describe('Fail case', () => {
			it('bidder should bid proper amount', async () => {
				try {
			 	await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'wei')});
				} catch (err) {
				assert.isUndefined(err.message,'revert from valid address');
				}
			});
		});
	});	
	

	describe('Winner', () => {
		let instance;	
		beforeEach(async () => {
			instance = await Auction.new(19,10,1000, { from: owner });
			await instance.notaryRegister({ from: accounts[1] });
			await instance.notaryRegister({ from: accounts[2] });
			await instance.notaryRegister({ from: accounts[3] });
			await instance.notaryRegister({ from: accounts[4] });
			await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'ether')});
			await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[6],value:web3.toWei(1,'ether')});
			await instance.bidderRegister([[13,10],[12,8]],[3,4],2,{ from: accounts[7],value:web3.toWei(1,'ether')});

		});
		
		 describe('success case', () => {
   		 it('winner check', async () => {
   			 try {
   		      await instance.find_winner({ from: owner});
   			 assert.equal(await instance.winner.call(),[0,2],'num of notaries should be 4');
   			 } catch (err) {
   			 assert.isUndefined(err.message,'revert from valid address');
   			 }
   		 });
   	});

	});
	













	// describe('Winner Determination', () => {
	// 	let instance;	
	// 	beforeEach(async () => {
	// 		instance = await Auction.new(19,10,1000, { from: owner });
	// 		await instance.notaryRegister({ from: accounts[1] });
	// 		await instance.notaryRegister({ from: accounts[2] });
	// 		await instance.notaryRegister({ from: accounts[3] });
	// 		await instance.notaryRegister({ from: accounts[4] });
	// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],2,{ from: accounts[5],value:web3.toWei(1,'ether')});
	// 		await instance.bidderRegister([[7,1],[12,9],[11,11]],[4,6],3,{ from: accounts[6],value:web3.toWei(1,'ether')});
	// 		await instance.bidderRegister([[13,10],[12,8]],[3,4],2,{ from: accounts[7],value:web3.toWei(1,'ether')});

	// 	});
	// 	describe('success case', () => {
	// 		it('check sorted list', async () => {
	// 			try {
	// 		 	await instance.winnerDetermine({ from: owner});
	// 			//var sorted = [[5,6],[4,6],[3,4]];
	// 			//var sorted2 = [] ;
	// 			//var val = await instance.notaries__bid_value.call(0,0);
	// 			//console.log(val.toNumber());
	// 			//assert.deepEqual(sorted2,sorted,'not sorted');
	// 			} catch (err) {
	// 			assert.isUndefined(err.message,'revert from valid address');
	// 			}
	// 		});
	// 	});


	// });

});

