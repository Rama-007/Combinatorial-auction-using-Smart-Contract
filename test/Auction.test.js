// const assert = require('assert');
// const ganache = require('ganache-cli');
// const Web3 = require('web3');
// const web3 = new Web3(ganache.provider());
// const json = require('./../build/contracts/Auction.json');

// let accounts;
// let auction;
// let manager;
// const interface = json['abi'];
// const bytecode = json['bytecode'];
var Auction=artifacts.require('Auction');

contract('Auction',accounts=>{
	const owner=accounts[0];
	describe('constructor',()=>{
		describe('success case',()=>{
		it('should deploy this contract', async () => {
			try{
				const instance=await Auction.new(19,5,2,{from: owner});
			} catch(err){
			assert.isUndefined(err.message,'revert with valid arguments');
			}
			});
		});
		describe('Fail case',()=>{
		it('should revert on invalid arguments', async () => {
			try{
				const instance=await Auction.new(19,5,2,{from: accounts[1]});
				assert.isUndefined(instance, 'contract should be created from owner');
			} catch(err){
			assert.isUndefined(err.message,'revert with valid arguments');
			}
			});
		});
	});

	describe('notaryRegister',()=>{
		let instance;
		beforeEach(async ()=>{
			instance=await Auction.new(19,5,2,{from: owner});
		});
		describe('success case',()=>{
		it('register successfully with this address', async () => {
			try{
				await instance.notaryRegister({from: accounts[1]});
				await instance.notaryRegister({from: accounts[2]});
				await instance.notaryRegister({from: accounts[3]});
			} catch(err){
			assert.isUndefined(err.message,'revert with valid address');
			}
			});
		});
		describe('Fail case',()=>{
		it('notary should register with a valid address', async () => {
			try{
				await instance.notaryRegister({from: accounts[0]});
			} catch(err){
			assert.isUndefined(err.message,'revert from valid address');
			}
			});
		});
		describe('Fail case',()=>{
		it('same notary should not register multiple times', async () => {
			try{
				await instance.notaryRegister({from: accounts[1]});
				await instance.notaryRegister({from: accounts[1]});
			} catch(err){
			assert.isUndefined(err.message,'revert from valid address');
			}
			});
		});
	});

	describe('bidRegister',()=>{
		let instance;
		beforeEach(async ()=>{
			instance=await Auction.new(19,5,12,{from: owner});
			await instance.notaryRegister({ from: accounts[1] });
			await instance.notaryRegister({ from: accounts[2] });
			await instance.notaryRegister({ from: accounts[3] });
		});

		describe('Fail case',()=>{
		it('Bidder should register with a valid address', async () => {
			try{
				await instance.bidderRegister([[12,8],[1]],[5,6],{from: accounts[4]});
			} catch(err){
			assert.isUndefined(err.message);//,'Notary cannot register as bidder ');
			}
			});			
		});

		// describe('Fail case',()=>{
		// it('bidder should not bid multiple times', async () => {
		// 	try{
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[4] });
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[4] });
		// 	} catch(err){
		// 	assert.isUndefined(err.message,'revert with valid address');
		// 	}
		// 	});			
		// });

		// describe('Fail case',()=>{
		// it('bidders should be less than notaries', async () => {
		// 	try{
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[4] });
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[5] });
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[6] });
		// 		await instance.bidderRegister([[12,8],[12,9]],[5,6],{ from: accounts[7] });
		// 	} catch(err){
		// 	assert.isUndefined(err.message,'revert with valid address');
		// 	}
		// 	});			
		// });

	});



});